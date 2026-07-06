/**
 * Query & mutasi CareerProfile (Profile + UserSkill). Menulis skill user,
 * meng-update headline/summary, dan regenerasi embedding profil.
 *
 * Embedding profil di-regenerate setiap profil berubah agar matching dua arah
 * (talent ↔ lowongan) tetap akurat.
 */

import { prisma } from "@/lib/db";

export type SkillOption = {
  id: string;
  name: string;
  category: string;
};

export type OwnedSkill = {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  verified: boolean;
};

export type ProfileData = {
  headline: string;
  summary: string;
  skills: OwnedSkill[];
};

/** Semua skill taxonomy, dikelompokkan per kategori (untuk picker). */
export async function getSkillCatalog(): Promise<Map<string, SkillOption[]>> {
  const rows = await prisma.skillTaxonomy.findMany({
    where: { category: { not: null } },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: { id: true, name: true, category: true },
  });

  const grouped = new Map<string, SkillOption[]>();
  for (const r of rows) {
    const cat = r.category ?? "lain";
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push({ id: r.id, name: r.name, category: cat });
  }
  return grouped;
}

/** Profil user + skill yang dimiliki (dengan proficiency & verified). */
export async function getProfile(userId: string): Promise<ProfileData> {
  const [profile, skills] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
      select: { headline: true, summary: true },
    }),
    prisma.userSkill.findMany({
      where: { userId },
      orderBy: { proficiency: "desc" },
      include: { skill: { select: { id: true, name: true, category: true } } },
    }),
  ]);

  return {
    headline: profile?.headline ?? "",
    summary: profile?.summary ?? "",
    skills: skills.map((s) => ({
      id: s.skill.id,
      name: s.skill.name,
      category: s.skill.category ?? "lain",
      proficiency: s.proficiency,
      verified: s.verified,
    })),
  };
}

/** Set skill user (replace seluruh set). proficiency default 2 untuk skill baru. */
export async function setUserSkills(
  userId: string,
  skillIds: string[],
): Promise<void> {
  const unique = [...new Set(skillIds.filter(Boolean))];
  await prisma.$transaction(async (tx) => {
    // Pertahankan proficiency & verified untuk skill yang masih dipilih.
    const existing = await tx.userSkill.findMany({ where: { userId } });
    const keep = new Map(existing.map((e) => [e.skillId, e]));

    await tx.userSkill.deleteMany({ where: { userId } });
    if (unique.length > 0) {
      await tx.userSkill.createMany({
        data: unique.map((id) => {
          const prev = keep.get(id);
          return {
            userId,
            skillId: id,
            proficiency: prev?.proficiency ?? 2,
            verified: prev?.verified ?? false,
            verifiedBy: prev?.verifiedBy ?? null,
          };
        }),
      });
    }
  });
}

/** Update proficiency satu skill (1-5). */
export async function setSkillProficiency(
  userId: string,
  skillId: string,
  proficiency: number,
): Promise<void> {
  const p = Math.max(1, Math.min(5, Math.round(proficiency)));
  await prisma.userSkill.update({
    where: { userId_skillId: { userId, skillId } },
    data: { proficiency: p },
  });
}

/** Tandai skill user sebagai verified (mis. setelah lulus quiz). */
export async function markSkillVerified(
  userId: string,
  skillId: string,
  verifiedBy = "quiz",
): Promise<void> {
  await prisma.userSkill.update({
    where: { userId_skillId: { userId, skillId } },
    data: { verified: true, verifiedBy, acquiredAt: new Date() },
  });
}

/** Ambil satu skill milik user (nama + status) untuk halaman verifikasi. */
export async function getUserSkill(
  userId: string,
  skillId: string,
): Promise<{ id: string; name: string; verified: boolean } | null> {
  const row = await prisma.userSkill.findUnique({
    where: { userId_skillId: { userId, skillId } },
    include: { skill: { select: { id: true, name: true } } },
  });
  if (!row) return null;
  return { id: row.skill.id, name: row.skill.name, verified: row.verified };
}

/** Update headline & summary profil. */
export async function saveProfileBasics(
  userId: string,
  data: { headline: string; summary: string },
): Promise<void> {
  await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      headline: data.headline.trim() || null,
      summary: data.summary.trim() || null,
    },
    update: {
      headline: data.headline.trim() || null,
      summary: data.summary.trim() || null,
    },
  });
}

/**
 * Regenerasi embedding profil dari headline + summary + skill. Best-effort:
 * kalau AI/embedding gagal, tidak melempar (profil tetap tersimpan).
 */
export async function regenerateProfileEmbedding(userId: string): Promise<void> {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return;

    const skills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: { select: { name: true } } },
    });

    const text = [
      profile.headline ?? "",
      profile.summary ?? "",
      skills.map((s) => s.skill.name).join(", "),
    ]
      .filter(Boolean)
      .join("\n");

    if (!text.trim()) return;

    const { generateEmbedding, setEmbedding } = await import("@/lib/ai/embeddings");
    const vec = await generateEmbedding(text);
    await setEmbedding("profiles", profile.id, vec);
  } catch (err) {
    console.warn(`[profile] regenerate embedding gagal untuk user ${userId}:`, err);
  }
}
