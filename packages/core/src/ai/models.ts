export const MODELS = {
  llm: process.env.AI_MODEL_LLM ?? "llama3.1:8b",
  fast: process.env.AI_MODEL_FAST ?? "llama3.1:8b",
  embed: process.env.AI_MODEL_EMBED ?? "nomic-embed-text",
} as const;

export const EMBED_DIM = 768;
