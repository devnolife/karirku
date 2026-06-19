/**
 * Handler embed: generate embedding untuk row tertentu lalu update kolom
 * embedding via raw SQL (pgvector).
 *
 * Job data:
 *   { table: "jobs" | "courses" | "skill_taxonomy" | "profiles", id: string }
 */
import { prisma } from "@/lib/db";
import { generateEmbedding, setEmbedding } from "@/lib/ai/embeddings";

type EmbedTable = "jobs" | "courses" | "skill_taxonomy" | "profiles";

export interface EmbedData {
  table: EmbedTable;
  id: string;
}

async function buildText(table: EmbedTable, id: string): Promise<string | null> {
  switch (table) {
    case "jobs": {
      const j = await prisma.job.findUnique({ where: { id } });
      if (!j) return null;
      return [
        j.title,
        j.company ?? "",
        j.location ?? "",
        j.skills.join(", "),
        j.requirements.join(". "),
        j.description ?? "",
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "courses": {
      const c = await prisma.course.findUnique({ where: { id } });
      if (!c) return null;
      const skills = await prisma.skillTaxonomy.findMany({
        where: { id: { in: c.skillsTaught } },
        select: { name: true },
      });
      return [
        c.title,
        c.provider ?? "",
        skills.map((s) => s.name).join(", "),
        c.description ?? "",
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "skill_taxonomy": {
      const s = await prisma.skillTaxonomy.findUnique({ where: { id } });
      if (!s) return null;
      return `${s.name}. Kategori: ${s.category ?? "-"}. Aliases: ${s.aliases.join(", ")}`;
    }
    case "profiles": {
      const p = await prisma.profile.findUnique({ where: { id } });
      if (!p) return null;
      return [
        p.headline ?? "",
        p.summary ?? "",
        p.skills.join(", "),
      ]
        .filter(Boolean)
        .join("\n");
    }
  }
}

export async function handleEmbed(data: EmbedData): Promise<void> {
  const text = await buildText(data.table, data.id);
  if (!text || !text.trim()) {
    console.warn(`[embed] no text for ${data.table}:${data.id}`);
    return;
  }
  const vec = await generateEmbedding(text);
  await setEmbedding(data.table, data.id, vec);
}
