/**
 * ai/lib/llm-client.mjs — OpenAI-compatible chat client, multi-provider.
 *
 * Provider dipilih via env AI_PROVIDER:
 *   "ollama" (default) — Ollama lokal / endpoint OpenAI-compatible lain
 *   "github"           — GitHub Models (models.github.ai; PAT scope models:read)
 *   "auto"             — coba ollama dulu, fallback ke github jika gagal connect
 *
 * Env per provider:
 *   [ollama] OLLAMA_BASE_URL (default http://localhost:11434/v1), OLLAMA_API_KEY,
 *            AI_MODEL_LLM (default gemma3:27b), AI_MODEL_FAST (default qwen2.5:7b-instruct)
 *   [github] GITHUB_MODELS_TOKEN (atau GITHUB_TOKEN), GITHUB_MODELS_BASE_URL,
 *            GITHUB_MODEL_LLM (default openai/gpt-4o), GITHUB_MODEL_FAST (default openai/gpt-4o-mini)
 *   AI_TIMEOUT_MS (default: 300000)
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

// Muat .env.local sekali (tanpa dependensi dotenv agar bisa dipanggil standalone).
function loadEnvLocal() {
  const file = path.resolve(process.cwd(), '.env.local');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let [, key, value] = m;
    value = value.replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvLocal();

const PROVIDERS = {
  ollama: {
    name: 'ollama',
    baseUrl: (process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1').replace(/\/$/, ''),
    apiKey: process.env.OLLAMA_API_KEY || 'ollama',
    modelLlm: process.env.AI_MODEL_LLM || 'gemma3:27b',
    modelFast: process.env.AI_MODEL_FAST || 'qwen2.5:7b-instruct',
  },
  github: {
    name: 'github',
    baseUrl: (process.env.GITHUB_MODELS_BASE_URL || 'https://models.github.ai/inference').replace(/\/$/, ''),
    apiKey: process.env.GITHUB_MODELS_TOKEN || process.env.GITHUB_TOKEN || '',
    modelLlm: process.env.GITHUB_MODEL_LLM || 'openai/gpt-4o',
    modelFast: process.env.GITHUB_MODEL_FAST || 'openai/gpt-4o-mini',
  },
};

const requested = (process.env.AI_PROVIDER || 'ollama').toLowerCase();
if (!['ollama', 'github', 'auto'].includes(requested)) {
  throw new Error(`AI_PROVIDER tidak dikenal: ${requested} (pilihan: ollama | github | auto)`);
}

// Urutan percobaan. "auto": ollama dulu (gratis+privat), lalu github.
const chain = requested === 'auto' ? [PROVIDERS.ollama, PROVIDERS.github] : [PROVIDERS[requested]];
let active = chain[0];

export const config = {
  get provider() { return active.name; },
  get baseUrl() { return active.baseUrl; },
  get modelLlm() { return active.modelLlm; },
  get modelFast() { return active.modelFast; },
  timeoutMs: Number(process.env.AI_TIMEOUT_MS || 300000),
};

export const tokenUsage = { prompt: 0, completion: 0, calls: 0 };

// Peran model logis: caller minta 'llm' atau 'fast' (atau string model literal
// — dipetakan per provider agar fallback tetap memakai model yang benar).
function resolveModel(provider, model) {
  if (model === provider.modelLlm || model === provider.modelFast) return model;
  // model berasal dari provider lain dalam chain → map berdasarkan peran
  for (const p of chain) {
    if (model === p.modelLlm) return provider.modelLlm;
    if (model === p.modelFast) return provider.modelFast;
  }
  return model; // string literal dari caller
}

function isConnectError(err) {
  return /fetch failed|ECONNREFUSED|ENOTFOUND|timeout/i.test(err.message || '');
}

async function callProvider(provider, messages, { model, temperature, maxTokens }) {
  if (provider.name === 'github' && !provider.apiKey) {
    throw new Error('GITHUB_MODELS_TOKEN belum di-set (PAT scope models:read)');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const res = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: resolveModel(provider, model),
        temperature,
        max_tokens: maxTokens,
        messages,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`LLM HTTP ${res.status} (${provider.name}): ${body.slice(0, 300)}`);
    }
    const data = await res.json();
    const usage = data.usage || {};
    tokenUsage.prompt += usage.prompt_tokens || 0;
    tokenUsage.completion += usage.completion_tokens || 0;
    tokenUsage.calls += 1;
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error(`LLM mengembalikan respons kosong (${provider.name})`);
    return content;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error(`LLM timeout setelah ${config.timeoutMs}ms (${provider.name})`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Kirim chat completion. messages = [{role, content}, ...]
 * Pada AI_PROVIDER=auto, gagal-connect di provider aktif → pindah ke berikutnya.
 * @returns {Promise<string>} isi pesan assistant
 */
export async function chat(messages, { model = config.modelLlm, temperature = 0.4, maxTokens = 8192 } = {}) {
  const startIdx = chain.indexOf(active);
  let lastErr;
  for (let i = startIdx; i < chain.length; i++) {
    try {
      const out = await callProvider(chain[i], messages, { model, temperature, maxTokens });
      if (chain[i] !== active) {
        console.error(`  ℹ provider fallback aktif: ${chain[i].name}`);
        active = chain[i];
      }
      return out;
    } catch (err) {
      lastErr = err;
      const canFallback = i < chain.length - 1 && isConnectError(err);
      if (!canFallback) throw err;
      console.error(`  ⚠ ${chain[i].name} tidak tersedia (${err.message}) — coba ${chain[i + 1].name}…`);
    }
  }
  throw lastErr;
}

export function formatUsage() {
  return `tokens: ${tokenUsage.prompt} prompt + ${tokenUsage.completion} completion (${tokenUsage.calls} call, provider: ${active.name})`;
}
