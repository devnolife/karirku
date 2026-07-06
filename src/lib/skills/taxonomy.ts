/**
 * Lookup / create entry SkillTaxonomy dengan alias-aware matching.
 *
 * Strategi pencarian (case-insensitive):
 * 1. Slug exact match.
 * 2. Name exact match.
 * 3. Alias contains (array @> [name]).
 * 4. Tidak ketemu → buat baru dengan kategori "uncategorized".
 *
 * Hasil di-cache in-memory per-process (bisa direset via `_resetSkillCache`)
 * supaya enrichment batch tidak hit DB berulang.
 */
import type { SkillTaxonomy } from "@prisma/client";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

const cache = new Map<string, SkillTaxonomy>();

export function _resetSkillCache() {
  cache.clear();
}

export async function findOrCreateSkill(
  rawName: string,
  category = "uncategorized",
): Promise<SkillTaxonomy> {
  const name = rawName.trim();
  if (!name) throw new Error("findOrCreateSkill: empty name");
  const slug = slugify(name);

  const cached = cache.get(slug);
  if (cached) return cached;

  // 1+2: slug or name
  let row = await prisma.skillTaxonomy.findFirst({
    where: {
      OR: [
        { slug },
        { name: { equals: name, mode: "insensitive" } },
      ],
    },
  });

  // 3: alias match (case-insensitive scan among recent rows)
  if (!row) {
    const candidates = await prisma.skillTaxonomy.findMany({
      where: { aliases: { has: name } },
      take: 1,
    });
    row = candidates[0] ?? null;
    if (!row) {
      const lower = name.toLowerCase();
      // Fallback: scan a bounded set for case-insensitive alias match.
      const sample = await prisma.skillTaxonomy.findMany({
        select: { id: true, name: true, slug: true, category: true, aliases: true },
        take: 1000,
      });
      const found = sample.find((s) =>
        s.aliases.some((a) => a.toLowerCase() === lower),
      );
      if (found) {
        row = await prisma.skillTaxonomy.findUnique({ where: { id: found.id } });
      }
    }
  }

  // 4: create
  if (!row) {
    row = await prisma.skillTaxonomy.create({
      data: { name, slug, category, aliases: [] },
    });
  }

  cache.set(slug, row);
  return row;
}

export async function findOrCreateSkills(
  names: string[],
  category = "uncategorized",
): Promise<SkillTaxonomy[]> {
  const unique = Array.from(
    new Map(
      names
        .map((n) => n.trim())
        .filter(Boolean)
        .map((n) => [slugify(n), n]),
    ).values(),
  );
  const results: SkillTaxonomy[] = [];
  for (const n of unique) {
    results.push(await findOrCreateSkill(n, category));
  }
  return results;
}
