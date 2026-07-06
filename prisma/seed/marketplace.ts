/**
 * Seed data marketplace (company & freelancer) agar halaman company/freelancer
 * memakai data real, bukan mock.
 *
 * - Native jobs untuk company terdaftar (companyProfileId terisi).
 * - Kandidat (user + profile + application) lintas stage.
 * - Freelance projects.
 * - Meta freelancer (stats/portfolio/proposals) disimpan di Profile.experience JSON.
 *
 * Idempotent: pakai sourceUrl/email unik + upsert/skipDuplicates.
 */

import type { PrismaClient } from "@prisma/client";

type NativeJob = {
  slug: string;
  title: string;
  location: string;
  type: "fulltime" | "contract" | "parttime" | "remote";
  level: "intern" | "junior" | "mid" | "senior";
  skills: string[];
  active: boolean;
};

const NATIVE_JOBS: NativeJob[] = [
  { slug: "frontend-engineer", title: "Frontend Engineer", location: "Jakarta · Hybrid", type: "fulltime", level: "mid", skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"], active: true },
  { slug: "product-designer", title: "Product Designer", location: "Remote", type: "remote", level: "mid", skills: ["Figma", "UX Design", "Design System", "Prototyping"], active: true },
  { slug: "backend-engineer-go", title: "Backend Engineer (Go)", location: "Jakarta · Onsite", type: "contract", level: "senior", skills: ["Go", "PostgreSQL", "Docker", "Redis"], active: true },
  { slug: "qa-intern", title: "QA Intern", location: "Bandung", type: "parttime", level: "intern", skills: ["Testing", "Manual QA"], active: false },
];

type Candidate = {
  email: string;
  name: string;
  jobSlug: string;
  status: "applied" | "screened" | "interview" | "offered";
  skills: string[];
  daysAgo: number;
};

const CANDIDATES: Candidate[] = [
  { email: "andika.putra@example.id", name: "Andika Putra", jobSlug: "frontend-engineer", status: "interview", skills: ["React", "TypeScript", "Next.js"], daysAgo: 2 },
  { email: "rina.melati@example.id", name: "Rina Melati", jobSlug: "product-designer", status: "offered", skills: ["Figma", "UX Design", "Design System"], daysAgo: 4 },
  { email: "fajar.nugroho@example.id", name: "Fajar Nugroho", jobSlug: "frontend-engineer", status: "screened", skills: ["React", "CSS", "Testing"], daysAgo: 1 },
  { email: "sinta.dewi@example.id", name: "Sinta Dewi", jobSlug: "backend-engineer-go", status: "screened", skills: ["Go", "PostgreSQL", "Docker"], daysAgo: 3 },
  { email: "bayu.saputra@example.id", name: "Bayu Saputra", jobSlug: "frontend-engineer", status: "applied", skills: ["React", "JavaScript"], daysAgo: 0 },
  { email: "citra.anggraini@example.id", name: "Citra Anggraini", jobSlug: "product-designer", status: "applied", skills: ["Figma", "Prototyping"], daysAgo: 0 },
];

type SeedProject = {
  slug: string;
  title: string;
  client: string;
  budgetMin: number;
  budgetMax: number;
  durationDays: number;
  skills: string[];
  daysAgo: number;
};

const PROJECTS: SeedProject[] = [
  { slug: "landing-react-anim", title: "Landing page React + animasi", client: "Kopi Kenangan", budgetMin: 8_000_000, budgetMax: 12_000_000, durationDays: 21, skills: ["React", "Tailwind CSS", "GSAP"], daysAgo: 1 },
  { slug: "dashboard-admin-next", title: "Dashboard admin Next.js", client: "Eduka", budgetMin: 15_000_000, budgetMax: 22_000_000, durationDays: 42, skills: ["Next.js", "TypeScript"], daysAgo: 2 },
  { slug: "maintenance-webapp", title: "Maintenance web app", client: "Nara Tech", budgetMin: 6_000_000, budgetMax: 9_000_000, durationDays: 30, skills: ["React", "Node.js"], daysAgo: 3 },
  { slug: "ui-library", title: "Komponen UI library", client: "Pinjam Modal", budgetMin: 10_000_000, budgetMax: 14_000_000, durationDays: 28, skills: ["React", "Storybook"], daysAgo: 5 },
];

const FREELANCER_META = {
  stats: {
    rating: 4.9,
    reviews: 38,
    completedProjects: 42,
    earningsIdr: 86_500_000,
    responseRate: 96,
    readiness: 81,
    hourlyRateIdr: 250_000,
  },
  portfolio: [
    { title: "E-commerce headless", category: "Web App", tag: "Next.js" },
    { title: "Dashboard analitik SaaS", category: "Dashboard", tag: "React" },
    { title: "Company profile sinematik", category: "Landing", tag: "GSAP" },
  ],
  proposals: [
    { project: "Redesign company profile", client: "Sinar Abadi", status: "won", amountIdr: 9_500_000, daysAgo: 7 },
    { project: "Web app POS UMKM", client: "Warung Pintar", status: "shortlisted", amountIdr: 18_000_000, daysAgo: 3 },
    { project: "Landing page event", client: "Devfest", status: "sent", amountIdr: 6_000_000, daysAgo: 2 },
    { project: "Migrasi ke Next.js", client: "Eduka", status: "draft", amountIdr: 0, daysAgo: 0 },
  ],
};

function daysAgoDate(d: number): Date {
  return new Date(Date.now() - d * 86_400_000);
}

export async function seedMarketplace(prisma: PrismaClient): Promise<void> {
  console.log("🌱 Seeding marketplace (company jobs, candidates, projects)...");

  // --- Company native jobs ---
  const company = await prisma.user.findUnique({
    where: { email: "hr@nara.id" },
    include: { company: true },
  });
  if (!company?.company) {
    console.warn("⚠ company hr@nara.id / CompanyProfile belum ada — lewati native jobs.");
  } else {
    const companyProfileId = company.company.id;
    const jobIdBySlug = new Map<string, string>();
    for (const j of NATIVE_JOBS) {
      const sourceUrl = `native://nara/${j.slug}`;
      const job = await prisma.job.upsert({
        where: { sourceUrl },
        create: {
          source: "native",
          sourceUrl,
          title: j.title,
          company: company.company.name,
          companyProfileId,
          location: j.location,
          type: j.type,
          level: j.level,
          skills: j.skills,
          requirements: [],
          isActive: j.active,
          postedAt: daysAgoDate(3),
        },
        update: { companyProfileId, isActive: j.active, skills: j.skills },
      });
      jobIdBySlug.set(j.slug, job.id);
    }

    // --- Candidates: user + profile + application ---
    for (const c of CANDIDATES) {
      const user = await prisma.user.upsert({
        where: { email: c.email },
        create: { email: c.email, name: c.name, role: "jobseeker", emailVerified: new Date() },
        update: { name: c.name },
      });
      await prisma.profile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, skills: c.skills, headline: `Kandidat ${c.jobSlug}` },
        update: { skills: c.skills },
      });

      const jobId = jobIdBySlug.get(c.jobSlug);
      if (!jobId) continue;
      const existing = await prisma.application.findFirst({
        where: { userId: user.id, jobId },
      });
      if (!existing) {
        await prisma.application.create({
          data: {
            userId: user.id,
            jobId,
            mode: "native",
            status: c.status,
            appliedAt: daysAgoDate(c.daysAgo),
          },
        });
      }
    }
  }

  // --- Freelance projects ---
  for (const p of PROJECTS) {
    const sourceUrl = `seed://project/${p.slug}`;
    await prisma.project.upsert({
      where: { sourceUrl },
      create: {
        source: "seed",
        sourceUrl,
        title: p.title,
        client: p.client,
        budgetMin: p.budgetMin,
        budgetMax: p.budgetMax,
        durationDays: p.durationDays,
        skills: p.skills,
        isActive: true,
        postedAt: daysAgoDate(p.daysAgo),
      },
      update: { skills: p.skills, isActive: true },
    });
  }

  // --- Freelancer meta (stats/portfolio/proposals) ke Profile.experience JSON ---
  const freelancer = await prisma.user.findUnique({ where: { email: "sari@craft.works" } });
  if (freelancer) {
    await prisma.profile.upsert({
      where: { userId: freelancer.id },
      create: {
        userId: freelancer.id,
        headline: "Freelance UI/UX & Frontend Developer",
        skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Figma", "GSAP"],
        experience: FREELANCER_META,
      },
      update: { experience: FREELANCER_META },
    });
  }

  const [jobs, candidates, projects] = await Promise.all([
    prisma.job.count({ where: { source: "native" } }),
    prisma.application.count(),
    prisma.project.count(),
  ]);
  console.log(`✅ Marketplace: ${jobs} native jobs · ${candidates} applications · ${projects} projects`);
}
