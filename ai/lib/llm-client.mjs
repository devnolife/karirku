/**
 * ai/lib/llm-client.mjs — chat client multi-provider.
 *
 * Provider dipilih via env AI_PROVIDER:
 *   "ollama" (default) — Ollama lokal / endpoint OpenAI-compatible lain
 *   "github"           — GitHub Models (models.github.ai; PAT scope models:read; RETIRING)
 *   "copilot"          — GitHub Copilot CLI resmi (`copilot -p`, pakai kuota langganan)
 *   "auto"             — coba ollama → github → copilot, fallback saat gagal connect/layanan mati
 *
 * Env per provider:
 *   [ollama]  OLLAMA_BASE_URL (default http://localhost:11434/v1), OLLAMA_API_KEY,
 *             AI_MODEL_LLM (default gemma3:27b), AI_MODEL_FAST (default qwen2.5:7b-instruct)
 *   [github]  GITHUB_MODELS_TOKEN (atau GITHUB_TOKEN), GITHUB_MODELS_BASE_URL,
 *             GITHUB_MODEL_LLM (default openai/gpt-4o), GITHUB_MODEL_FAST (default openai/gpt-4o-mini)
 *   [copilot] COPILOT_CLI_BIN (default "copilot"), COPILOT_MODEL (opsional, --model)
 *   AI_TIMEOUT_MS (default: 300000)
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';

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
  copilot: {
    name: 'copilot',
    cli: true,
    // Di Windows pakai copilot.exe (WinGet) agar bisa dieksekusi tanpa shell
    // (shell:true merusak escaping prompt multiline).
    bin: process.env.COPILOT_CLI_BIN || (process.platform === 'win32' ? 'copilot.exe' : 'copilot'),
    model: process.env.COPILOT_MODEL || '', // kosong = default CLI
    modelLlm: 'copilot',
    modelFast: 'copilot',
  },
};

const requested = (process.env.AI_PROVIDER || 'ollama').toLowerCase();
if (!['ollama', 'github', 'copilot', 'auto'].includes(requested)) {
  throw new Error(`AI_PROVIDER tidak dikenal: ${requested} (pilihan: ollama | github | copilot | auto)`);
}

// Urutan percobaan. "auto": ollama (gratis+privat) → github → copilot (kuota langganan).
const chain = requested === 'auto'
  ? [PROVIDERS.ollama, PROVIDERS.github, PROVIDERS.copilot]
  : [PROVIDERS[requested]];
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
  return /fetch failed|ECONNREFUSED|ENOTFOUND|timeout|HTTP 410|retirement|belum di-set/i.test(err.message || '');
}

// ── Provider CLI: GitHub Copilot (`copilot -p`) ────────────────────
// Jalur resmi memakai kuota langganan Copilot. Teks-only (tanpa vision).
// Pesan system+user digabung jadi satu prompt; output stats footer dibuang
// karena stdout non-interaktif hanya berisi jawaban (footer masuk stderr).
function messagesToPrompt(messages) {
  return messages
    .map((m) => {
      const text = Array.isArray(m.content)
        ? m.content.filter((c) => c.type === 'text').map((c) => c.text).join('\n')
        : String(m.content);
      if (Array.isArray(m.content) && m.content.some((c) => c.type === 'image_url')) {
        throw new Error('provider copilot tidak mendukung input gambar — pakai ollama/github');
      }
      return m.role === 'system' ? `<instructions>\n${text}\n</instructions>` : text;
    })
    .join('\n\n');
}

function callCopilotCli(provider, messages) {
  const prompt = messagesToPrompt(messages);
  const args = ['-p', prompt, '--no-color', '--no-custom-instructions'];
  if (provider.model) args.push('--model', provider.model);
  return new Promise((resolve, reject) => {
    execFile(provider.bin, args, {
      timeout: config.timeoutMs,
      maxBuffer: 16 * 1024 * 1024,
      windowsHide: true,
    }, (err, stdout) => {
      if (err) {
        const msg = err.killed ? `LLM timeout setelah ${config.timeoutMs}ms (copilot)` : `copilot CLI gagal: ${(err.message || '').slice(0, 300)}`;
        return reject(new Error(msg));
      }
      const out = String(stdout).trim();
      if (!out) return reject(new Error('LLM mengembalikan respons kosong (copilot)'));
      tokenUsage.calls += 1;
      resolve(out);
    });
  });
}

// ── Copilot SDK (@github/copilot-sdk) — dipakai bila ter-install ────
// SDK mengontrol Copilot CLI via JSON-RPC: satu proses server untuk banyak
// prompt (lebih cepat dari spawn per-call) dan bisa set model per-session.
let sdkClientPromise = null;

async function getSdkClient(provider) {
  if (!sdkClientPromise) {
    sdkClientPromise = (async () => {
      const { CopilotClient } = await import('@github/copilot-sdk');
      const client = new CopilotClient({ autoStart: true });
      await client.start();
      process.on('beforeExit', () => { shutdownLlm(); });
      return client;
    })();
  }
  return sdkClientPromise;
}

/** Hentikan server SDK agar proses node bisa exit. Aman dipanggil kapan pun. */
export async function shutdownLlm() {
  if (!sdkClientPromise) return;
  const p = sdkClientPromise;
  sdkClientPromise = null;
  // RPC pending yang tertolak saat koneksi ditutup memicu unhandled rejection
  // dari dalam SDK — redam selama proses shutdown.
  const swallow = () => { };
  process.on('unhandledRejection', swallow);
  try {
    const client = await p;
    await client.stop().catch(() => { });
  } catch { /* sudah mati */ }
  finally {
    setTimeout(() => process.removeListener('unhandledRejection', swallow), 500).unref?.();
  }
}

async function callCopilotSdk(provider, messages) {
  const client = await getSdkClient(provider);
  const session = await client.createSession({
    model: provider.model || undefined,
  });
  try {
    let text = '';
    session.on((ev) => {
      if (ev.type === 'assistant.message' && ev.data?.content) text = ev.data.content;
    });
    const result = await session.sendAndWait(
      { prompt: messagesToPrompt(messages) },
      config.timeoutMs,
    );
    const out = (result?.data?.content || result?.content || text || '').trim();
    if (!out) throw new Error('LLM mengembalikan respons kosong (copilot-sdk)');
    tokenUsage.calls += 1;
    return out;
  } finally {
    try { await Promise.resolve(session.disconnect?.()).catch(() => { }); } catch { /* koneksi sudah ditutup */ }
  }
}

async function callCopilot(provider, messages) {
  try {
    return await callCopilotSdk(provider, messages);
  } catch (err) {
    // SDK tidak ter-install / gagal start → fallback spawn CLI langsung
    if (/Cannot find (module|package)/i.test(err.message || '')) {
      return callCopilotCli(provider, messages);
    }
    throw err;
  }
}

async function callProvider(provider, messages, { model, temperature, maxTokens }) {
  if (provider.cli) return callCopilot(provider, messages);
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
