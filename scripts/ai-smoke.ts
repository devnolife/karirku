/**
 * AI smoke test — verifikasi koneksi ke Ollama (atau vLLM) via OpenAI-compatible API.
 *
 * Run: pnpm ai:smoke
 *
 * Prereq: `ollama pull llama3.1:8b && ollama pull nomic-embed-text`
 */
import "dotenv/config";
import { ai } from "@/lib/ai/client";
import { MODELS } from "@/lib/ai/models";

async function main() {
  console.log(`🤖 Testing AI at ${process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1"}`);
  console.log(`   llm:   ${MODELS.llm}`);
  console.log(`   embed: ${MODELS.embed}\n`);

  console.log("🧪 [1/2] Chat completion...");
  const chat = await ai.chat.completions.create({
    model: MODELS.fast,
    messages: [
      { role: "system", content: "Balas dalam bahasa Indonesia singkat." },
      { role: "user", content: "Halo, siapa kamu?" },
    ],
    max_tokens: 80,
  });
  console.log(`   → ${chat.choices[0]?.message.content?.trim()}\n`);

  console.log("🧪 [2/2] Embedding...");
  const emb = await ai.embeddings.create({
    model: MODELS.embed,
    input: "Python Data Engineer Jakarta",
  });
  console.log(`   → dim = ${emb.data[0]?.embedding.length}`);

  console.log("\n✅ AI smoke test passed.");
}

main().catch((err) => {
  console.error("\n❌ AI smoke test failed:", err);
  process.exit(1);
});
