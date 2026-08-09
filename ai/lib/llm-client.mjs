/**
 * ai/lib/llm-client.mjs — OpenAI-compatible chat client (default: Ollama lokal).
 *
 * Env:
 *   OLLAMA_BASE_URL  (default: http://localhost:11434/v1)
 *   OLLAMA_API_KEY   (default: "ollama" — value tidak dipakai Ollama)
 *   AI_MODEL_LLM     (default: gemma3:27b)  — tugas berkualitas tinggi
 *   AI_MODEL_FAST    (default: qwen2.5:7b-instruct) — tugas ringan
 *   AI_TIMEOUT_MS    (default: 300000)
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

export const config = {
  baseUrl: (process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1').replace(/\/$/, ''),
  apiKey: process.env.OLLAMA_API_KEY || 'ollama',
  modelLlm: process.env.AI_MODEL_LLM || 'gemma3:27b',
  modelFast: process.env.AI_MODEL_FAST || 'qwen2.5:7b-instruct',
  timeoutMs: Number(process.env.AI_TIMEOUT_MS || 300000),
};

export const tokenUsage = { prompt: 0, completion: 0, calls: 0 };

/**
 * Kirim chat completion. messages = [{role, content}, ...]
 * @returns {Promise<string>} isi pesan assistant
 */
export async function chat(messages, { model = config.modelLlm, temperature = 0.4, maxTokens = 8192 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({ model, temperature, max_tokens: maxTokens, messages }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`LLM HTTP ${res.status}: ${body.slice(0, 300)}`);
    }
    const data = await res.json();
    const usage = data.usage || {};
    tokenUsage.prompt += usage.prompt_tokens || 0;
    tokenUsage.completion += usage.completion_tokens || 0;
    tokenUsage.calls += 1;
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('LLM mengembalikan respons kosong');
    return content;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error(`LLM timeout setelah ${config.timeoutMs}ms`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function formatUsage() {
  return `tokens: ${tokenUsage.prompt} prompt + ${tokenUsage.completion} completion (${tokenUsage.calls} call)`;
}
