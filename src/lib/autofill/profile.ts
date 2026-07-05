/**
 * Profile provider — sumber data pengisian form.
 *
 * DUAL MODE (mengikuti pola src/lib/db.ts):
 * - DATABASE_URL aktif  → baca User + Profile dari Prisma.
 * - Mock mode           → profil demo statis (selaras MOCK_USER di src/lib/mock).
 */

import { prisma } from "@/lib/db";
import type { ProfileData } from "./types";

/** Pecah nama lengkap jadi depan/belakang secara sederhana. */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return { firstName: fullName.trim(), lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/** Profil demo untuk mock mode — data kaya agar demo auto-fill meyakinkan. */
export const DEMO_PROFILE: ProfileData = {
  fullName: "Dimas Prakoso",
  firstName: "Dimas",
  lastName: "Prakoso",
  email: "dimas@craft.works",
  phone: "+62 812-3456-7890",
  city: "Jakarta",
  country: "Indonesia",
  linkedinUrl: "https://www.linkedin.com/in/dimasprakoso",
  githubUrl: "https://github.com/dimasprakoso",
  portfolioUrl: "https://dimas.dev",
  headline: "Frontend Engineer · React, TypeScript",
  summary:
    "Frontend engineer dengan 3 tahun pengalaman membangun aplikasi web " +
    "React/Next.js. Fokus pada performa, aksesibilitas, dan design system.",
  skills: ["React", "TypeScript", "Next.js", "TailwindCSS", "Node.js"],
  currentTitle: "Frontend Engineer",
  currentCompany: "PT Nara Teknologi",
  yearsExperience: 3,
  expectedSalaryIdr: 15_000_000,
};

function dbAvailable(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Ambil ProfileData user. Mock mode → DEMO_PROFILE.
 * DB mode → gabungan User + Profile; field yang tidak ada dibiarkan undefined
 * (prinsip: lebih baik kosong daripada menebak).
 */
export async function getProfileData(userId: string): Promise<ProfileData | null> {
  if (!dbAvailable()) return DEMO_PROFILE;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!user) return null;

  const fullName = user.name ?? "";
  const { firstName, lastName } = splitName(fullName);
  const profile = user.profile;

  return {
    fullName,
    firstName,
    lastName,
    email: user.email,
    headline: profile?.headline ?? undefined,
    summary: profile?.summary ?? undefined,
    skills: profile?.skills ?? [],
    experience: profile?.experience ?? undefined,
    education: profile?.education ?? undefined,
  };
}
