/**
 * Skill-gap: bandingkan skill user dengan skill yang diminta lowongan untuk
 * target role-nya. Skill "required" diturunkan dari frekuensi kemunculan skill
 * di lowongan yang cocok (data real), bukan hardcoded.
 */

import { prisma } from "@/lib/db";
import { skillCoverageScore } from "@/lib/match/score";
import type { SkillTone, SkillView } from "@/lib/view-models";
import {
  loadUserContext,
  proficiencyToPct,
  roleKeywords,
  type UserContext,
} from "./context";

export type SkillGap = {
  skills: SkillView[];
  coveragePct: number;
  matchedNames: string[];
  missingNames: string[];
  requiredNames: string[];
};

const SOFT_CATEGORY = "soft";

function toneFor(current: number, required: number, soft: boolean): SkillTone {
  if (soft) return "violet";
  const gap = required - current;
  if (gap <= 0) return "emerald";
  if (gap <= 15) return "sky";
  if (gap <= 30) return "amber";
  return "rose";
}

/**
 * Kumpulkan skill yang diminta lowongan untuk role target + level "required"
 * berdasarkan frekuensi. Mengembalikan map nama→{count, soft}.
 */
async function demandedSkills(
  ctx: UserContext,
): Promise<Map<string, { count: number; soft: boolean }>> {
  const keywords = roleKeywords(ctx.goal?.targetRole);
  const where =
    keywords.length > 0
      ? {
          isActive: true,
          OR: keywords.map((k) => ({
            title: { contains: k, mode: "insensitive" as const },
          })),
        }
      : { isActive: true };

  const jobs = await prisma.job.findMany({
    where,
    select: { skills: true },
    take: 400,
  });

  // Set kategori soft dari taxonomy untuk menandai skill soft.
  const softNames = new Set(
    (
      await prisma.skillTaxonomy.findMany({
        where: { category: SOFT_CATEGORY },
        select: { name: true },
      })
    ).map((s) => s.name.toLowerCase()),
  );

  const freq = new Map<string, { count: number; soft: boolean }>();
  for (const job of jobs) {
    for (const raw of job.skills) {
      const label = raw.trim();
      if (!label) continue;
      const key = label.toLowerCase();
      const cur = freq.get(key);
      if (cur) cur.count += 1;
      else freq.set(key, { count: 1, soft: softNames.has(key) });
    }
  }
  return freq;
}

export async function getSkillGap(userId: string, limit = 8): Promise<SkillGap> {
  const ctx = await loadUserContext(userId);
  const freq = await demandedSkills(ctx);

  // Urutkan skill yang diminta berdasarkan frekuensi; ambil top-N.
  const ranked = [...freq.entries()]
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.count - a.count);

  const maxCount = ranked[0]?.count ?? 1;
  const top = ranked.slice(0, limit);

  // Map proficiency user per nama skill (lowercase).
  const userPct = new Map<string, number>();
  for (const s of ctx.skills) {
    userPct.set(s.name.toLowerCase(), proficiencyToPct(s.proficiency));
  }

  // Cari label asli (Title Case) dari skill taxonomy untuk display.
  const labels = new Map<string, string>();
  const taxo = await prisma.skillTaxonomy.findMany({
    where: { name: { in: top.map((t) => t.key), mode: "insensitive" } },
    select: { name: true },
  });
  for (const t of taxo) labels.set(t.name.toLowerCase(), t.name);

  const skills: SkillView[] = top.map((t) => {
    // Required 60-92 berdasarkan frekuensi relatif (skill lebih sering diminta = target lebih tinggi).
    const required = Math.round(60 + (t.count / maxCount) * 32);
    const current = userPct.get(t.key) ?? 0;
    const category: SkillView["category"] = t.soft
      ? "soft"
      : t.count >= maxCount * 0.5
        ? "core"
        : "nice-to-have";
    return {
      name: labels.get(t.key) ?? t.key,
      category,
      current,
      required,
      tone: toneFor(current, required, t.soft),
    };
  });

  // Coverage real lewat match engine: skill user vs skill yang diminta.
  const requiredNames = top.map((t) => labels.get(t.key) ?? t.key);
  const cov = skillCoverageScore(ctx.skillNames, requiredNames);

  return {
    skills,
    coveragePct: cov.matchPct,
    matchedNames: cov.matched,
    missingNames: cov.missing,
    requiredNames,
  };
}
