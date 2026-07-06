/**
 * Konteks user untuk perhitungan dashboard (skill-gap, readiness, job match).
 * Memuat goal aktif + skill user (nama, proficiency, verified) sekali, dipakai
 * lintas query agar tidak round-trip berkali-kali.
 */

import { prisma } from "@/lib/db";
import { getActiveGoal, type UserGoal } from "./goal";

export type UserSkillItem = {
  id: string;
  name: string;
  proficiency: number; // 1-5
  verified: boolean;
};

export type UserContext = {
  userId: string;
  goal: UserGoal | null;
  skills: UserSkillItem[];
  /** Nama skill lowercase untuk match engine. */
  skillNames: string[];
};

/** Proficiency disimpan 1-5; ubah ke skala 0-100 untuk display. */
export function proficiencyToPct(proficiency: number): number {
  return Math.round((Math.max(0, Math.min(5, proficiency)) / 5) * 100);
}

/** Kata kunci dari target role untuk mencocokkan judul lowongan. */
export function roleKeywords(targetRole: string | undefined | null): string[] {
  if (!targetRole) return [];
  const stop = new Set(["engineer", "developer", "specialist", "the", "of", "and", "&"]);
  const words = targetRole
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((w) => w.length > 1 && !stop.has(w));
  // Selalu sertakan frasa penuh juga.
  return [...new Set([targetRole.toLowerCase(), ...words])];
}

export async function loadUserContext(userId: string): Promise<UserContext> {
  const [goal, skillRows] = await Promise.all([
    getActiveGoal(userId),
    prisma.userSkill.findMany({
      where: { userId },
      include: { skill: { select: { id: true, name: true } } },
      orderBy: { proficiency: "desc" },
    }),
  ]);

  const skills: UserSkillItem[] = skillRows.map((r) => ({
    id: r.skill.id,
    name: r.skill.name,
    proficiency: r.proficiency,
    verified: r.verified,
  }));

  return {
    userId,
    goal,
    skills,
    skillNames: skills.map((s) => s.name),
  };
}
