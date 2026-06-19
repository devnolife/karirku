/**
 * Embedding helper. Memakai model nomic-embed-text (768d).
 *
 * Karena Prisma tidak punya native vector type, update kolom embedding
 * dilakukan via $executeRawUnsafe dengan format pgvector literal.
 */
import { ai } from "./client";
import { EMBED_DIM, MODELS } from "./models";
import { prisma } from "@/lib/db";

export async function generateEmbedding(text: string): Promise<number[]> {
  // nomic-embed-text context = 2048 token. ~2000 char aman (<650 token) dan
  // tetap menangkap sinyal (judul + skill + awal deskripsi paling penting).
  const trimmed = text.replace(/\s+/g, " ").trim().slice(0, 2000);
  if (!trimmed) {
    throw new Error("generateEmbedding: empty input");
  }
  const res = await ai.embeddings.create({
    model: MODELS.embed,
    input: trimmed,
  });
  const vec = res.data[0]?.embedding;
  if (!vec) throw new Error("generateEmbedding: no embedding returned");
  if (vec.length !== EMBED_DIM) {
    throw new Error(
      `generateEmbedding: dimension mismatch — got ${vec.length}, expected ${EMBED_DIM}. ` +
        `Update EMBED_DIM + schema vector size jika ganti model.`,
    );
  }
  return vec;
}

/** Format array number jadi pgvector literal (`'[0.1,0.2,...]'`). */
export function toPgVector(vec: number[]): string {
  return `[${vec.join(",")}]`;
}

const TABLE_WHITELIST = new Set(["jobs", "courses", "profiles", "skill_taxonomy"]);

/**
 * Update kolom `embedding` untuk row tertentu. `table` divalidasi terhadap
 * whitelist supaya tidak kena SQL injection lewat parameter dinamis.
 */
export async function setEmbedding(
  table: string,
  id: string,
  vec: number[],
): Promise<void> {
  if (!TABLE_WHITELIST.has(table)) {
    throw new Error(`setEmbedding: table '${table}' not allowed`);
  }
  const literal = toPgVector(vec);
  await prisma.$executeRawUnsafe(
    `UPDATE ${table} SET embedding = $1::vector WHERE id = $2::uuid`,
    literal,
    id,
  );
}

/** Cosine similarity nearest-neighbor (returns ids + distance, makin kecil makin mirip). */
export async function searchSimilar(
  table: "jobs" | "courses" | "skill_taxonomy",
  vec: number[],
  limit = 10,
): Promise<Array<{ id: string; distance: number }>> {
  const literal = toPgVector(vec);
  return prisma.$queryRawUnsafe<Array<{ id: string; distance: number }>>(
    `SELECT id, embedding <=> $1::vector AS distance FROM ${table}
     WHERE embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT ${Math.max(1, Math.min(100, limit))}`,
    literal,
  );
}
