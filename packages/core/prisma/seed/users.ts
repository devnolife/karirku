/**
 * Seed user real — satu per role — untuk dev login ber-DB.
 *
 * Idempotent (upsert by email). Jobseeker memakai email lama `dev@karir.local`
 * yang sudah punya skill/goal/path supaya datanya tetap tertaut.
 */

import type { PrismaClient } from "../../generated/prisma/index.js";

type SeedUser = {
  email: string;
  username: string;
  name: string;
  role: "jobseeker" | "freelancer" | "company" | "admin";
  headline?: string;
  summary?: string;
};

const USERS: SeedUser[] = [
  {
    email: "dev@karir.local",
    username: "dimas",
    name: "Dimas Prakoso",
    role: "jobseeker",
    headline: "Frontend Engineer (aspiring)",
    summary:
      "Belajar jadi Frontend Engineer. Fokus React, TypeScript, dan testing.",
  },
  {
    email: "sari@craft.works",
    username: "sari",
    name: "Sari Wulandari",
    role: "freelancer",
    headline: "Freelance UI/UX & Frontend Developer",
    summary:
      "Freelancer dengan portofolio web app & design system. Tersedia untuk project remote.",
  },
  {
    email: "hr@nara.id",
    username: "nara",
    name: "PT Nara Teknologi",
    role: "company",
  },
  {
    email: "admin@craft.works",
    username: "admin",
    name: "Admin CraftWorks",
    role: "admin",
  },
];

export async function seedUsers(prisma: PrismaClient): Promise<void> {
  console.log(`🌱 Seeding ${USERS.length} users (1 per role)...`);

  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        username: u.username,
        name: u.name,
        role: u.role,
        emailVerified: new Date(),
        // Akun demo sudah punya data kurasi — jangan dipaksa lewat onboarding.
        onboardedAt: new Date(),
      },
      update: {
        username: u.username,
        name: u.name,
        role: u.role,
        onboardedAt: new Date(),
      },
    });

    // Profile untuk jobseeker & freelancer
    if (u.role === "jobseeker" || u.role === "freelancer") {
      await prisma.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          headline: u.headline ?? null,
          summary: u.summary ?? null,
        },
        update: { headline: u.headline ?? null, summary: u.summary ?? null },
      });
    }

    // CompanyProfile untuk company
    if (u.role === "company") {
      await prisma.companyProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          name: u.name,
          industry: "Teknologi",
          location: "Jakarta",
          about: "Perusahaan teknologi yang sedang membangun tim produk.",
          website: "https://nara.id",
          verified: true,
        },
        update: { name: u.name },
      });
    }
  }

  const total = await prisma.user.count();
  console.log(`✅ Users: ${total} rows`);
}
