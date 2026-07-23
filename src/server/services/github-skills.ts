/**
 * Sync skill user dari repo publik GitHub-nya.
 *
 * Sinyal: bahasa utama tiap repo publik non-fork (field `language` dari
 * /user/repos — 1 API call, tanpa scope repo privat). Bahasa dipetakan ke
 * SkillTaxonomy via slug/alias, lalu di-upsert ke UserSkill dengan
 * verifiedBy="github" (bukti nyata proof-of-work, menaikkan readiness).
 *
 * Proficiency heuristik dari jumlah repo per bahasa:
 *   1 repo → 2 · 2 repo → 3 · 3-4 repo → 4 · ≥5 repo → 5.
 * Tidak menurunkan proficiency yang sudah lebih tinggi dari sumber lain.
 */

import { prisma } from "@/lib/db";

type GithubRepo = {
  name: string;
  language: string | null;
  fork: boolean;
  pushed_at: string;
};

/** Bahasa GitHub → nama skill di taxonomy (yang tidak 1:1 secara nama). */
const LANGUAGE_TO_SKILL: Record<string, string> = {
  "C#": "C#",
  Shell: "Linux",
  Dockerfile: "Docker",
  HCL: "Terraform",
  "Jupyter Notebook": "Python",
  Vue: "Vue.js",
  SCSS: "Sass",
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function proficiencyFor(repoCount: number): number {
  if (repoCount >= 5) return 5;
  if (repoCount >= 3) return 4;
  if (repoCount >= 2) return 3;
  return 2;
}

export type GithubSkillSyncResult = {
  reposScanned: number;
  skillsMatched: number;
  skillsUpserted: number;
};

export async function syncGithubSkills(
  userId: string,
  accessToken: string,
): Promise<GithubSkillSyncResult> {
  const res = await fetch(
    "https://api.github.com/user/repos?per_page=100&sort=pushed&type=owner",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "craftworks-app",
      },
    },
  );
  if (!res.ok) throw new Error(`GitHub repos API ${res.status}`);
  const repos = (await res.json()) as GithubRepo[];

  // Hitung repo publik non-fork per bahasa.
  const countByLanguage = new Map<string, number>();
  let scanned = 0;
  for (const r of repos) {
    if (r.fork || !r.language) continue;
    scanned++;
    countByLanguage.set(r.language, (countByLanguage.get(r.language) ?? 0) + 1);
  }
  if (countByLanguage.size === 0) {
    return { reposScanned: scanned, skillsMatched: 0, skillsUpserted: 0 };
  }

  // Petakan bahasa → skill taxonomy (by slug atau alias, case-insensitive).
  const candidates = [...countByLanguage.keys()].map(
    (lang) => LANGUAGE_TO_SKILL[lang] ?? lang,
  );
  const slugs = [...new Set(candidates.map(slugify))];
  const skills = await prisma.skillTaxonomy.findMany({
    where: {
      OR: [{ slug: { in: slugs } }, { aliases: { hasSome: candidates } }],
    },
    select: { id: true, slug: true, aliases: true },
  });

  const skillBySlug = new Map(skills.map((s) => [s.slug, s]));
  const skillByAlias = new Map(
    skills.flatMap((s) => s.aliases.map((a) => [a.toLowerCase(), s] as const)),
  );

  let matched = 0;
  let upserted = 0;
  for (const [lang, count] of countByLanguage) {
    const name = LANGUAGE_TO_SKILL[lang] ?? lang;
    const skill = skillBySlug.get(slugify(name)) ?? skillByAlias.get(name.toLowerCase());
    if (!skill) continue;
    matched++;

    const proficiency = proficiencyFor(count);
    const existing = await prisma.userSkill.findUnique({
      where: { userId_skillId: { userId, skillId: skill.id } },
    });

    if (!existing) {
      await prisma.userSkill.create({
        data: {
          userId,
          skillId: skill.id,
          proficiency,
          verified: true,
          verifiedBy: "github",
          acquiredAt: new Date(),
        },
      });
      upserted++;
    } else {
      await prisma.userSkill.update({
        where: { userId_skillId: { userId, skillId: skill.id } },
        data: {
          proficiency: Math.max(existing.proficiency, proficiency),
          verified: true,
          verifiedBy: existing.verified ? existing.verifiedBy : "github",
        },
      });
      upserted++;
    }
  }

  return { reposScanned: scanned, skillsMatched: matched, skillsUpserted: upserted };
}
