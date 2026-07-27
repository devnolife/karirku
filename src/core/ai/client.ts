import OpenAI from "openai";

/**
 * AI client yang OpenAI-compatible.
 * Dev: Ollama lokal (http://localhost:11434/v1).
 * Prod: ganti OLLAMA_BASE_URL ke vLLM endpoint (tidak perlu edit kode).
 */
export const ai = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
  apiKey: process.env.OLLAMA_API_KEY ?? "ollama",
});
