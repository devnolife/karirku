/**
 * Query sisi company (employer): lowongan native, kandidat (dari applications),
 * talent search (reverse matching), dan statistik dashboard. Semua real dari DB.
 */

import { prisma } from "@/lib/db";
import { skillCoverageScore } from "@/lib/match/score";
import { readinessScore, type ReadinessBand } from "@/lib/match/readiness";
import { PIPELINE_OPTIONS, type PipelineStatus } from "@/lib/pipeline";

const JOB_TYPE_LABEL: Record<string, string> = {
  fulltime: "Full-time",
  parttime: "Part-time",
  contract: "Contract",
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "Onsite",
};

function relDays(date: Date | null): string {
  if (!date) return "—";
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "hari ini";
  if (days === 1) return "kemarin";
  if (days < 7) return `${days} hari lalu`;
  return `${Math.floor(days / 7)} minggu lalu`;
}

async function companyProfileId(userId: string): Promise<string | null> {
  const cp = await prisma.companyProfile.findUnique({ where: { userId }, select: { id: true } });
  return cp?.id ?? null;
}

export type JobTypeValue = "fulltime" | "parttime" | "contract" | "remote" | "hybrid" | "onsite";
export type LevelValue = "intern" | "junior" | "mid" | "senior" | "lead" | "manager";

export const JOB_TYPE_OPTIONS: { value: JobTypeValue; label: string }[] = [
  { value: "fulltime", label: "Full-time" },
  { value: "parttime", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" },
];

export const LEVEL_OPTIONS: { value: LevelValue; label: string }[] = [
  { value: "intern", label: "Intern" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
  { value: "manager", label: "Manager" },
];

export type CreateJobInput = {
  title: string;
  location: string;
  type: JobTypeValue;
  level: LevelValue;
  description: string;
  skills: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
};

/**
 * Buat lowongan native untuk perusahaan. Generate embedding (best-effort).
 * Mengembalikan id job, atau null kalau user bukan company / tak punya profil.
 */
export async function createNativeJob(
  userId: string,
  input: CreateJobInput,
): Promise<string | null> {
  const cp = await prisma.companyProfile.findUnique({
    where: { userId },
    select: { id: true, name: true },
  });
  if (!cp) return null;

  const job = await prisma.job.create({
    data: {
      source: "native",
      // URL unik in-platform (apply native, bukan offsite).
      sourceUrl: `native://${cp.id}/${Date.now()}`,
      title: input.title,
      company: cp.name,
      companyProfileId: cp.id,
      location: input.location || null,
      type: input.type,
      level: input.level,
      description: input.description || null,
      requirements: [],
      skills: input.skills,
      salaryMin: input.salaryMin ?? null,
      salaryMax: input.salaryMax ?? null,
      isActive: true,
      postedAt: new Date(),
    },
  });

  // Embedding best-effort — tak menggagalkan posting kalau AI down.
  try {
    const { generateEmbedding, setEmbedding } = await import("@/lib/ai/embeddings");
    const text = [input.title, cp.name, input.location, input.skills.join(", "), input.description]
      .filter(Boolean)
      .join("\n");
    const vec = await generateEmbedding(text);
    await setEmbedding("jobs", job.id, vec);
  } catch (err) {
    console.warn(`[company] embedding gagal untuk job ${job.id}:`, err);
  }

  return job.id;
}

export type CompanyJobRow = {
  id: string;
  title: string;
  location: string;
  type: string;
  applicants: number;
  status: "active" | "draft";
  posted: string;
};

export async function getCompanyJobs(userId: string): Promise<CompanyJobRow[]> {
  const cpId = await companyProfileId(userId);
  if (!cpId) return [];

  const jobs = await prisma.job.findMany({
    where: { companyProfileId: cpId },
    orderBy: { postedAt: "desc" },
    select: {
      id: true, title: true, location: true, type: true, isActive: true, postedAt: true,
      _count: { select: { applications: true } },
    },
  });

  return jobs.map((j) => ({
    id: j.id,
    title: j.title,
    location: j.location ?? "Remote",
    type: j.type ? JOB_TYPE_LABEL[j.type] ?? j.type : "—",
    applicants: j._count.applications,
    status: j.isActive ? "active" : "draft",
    posted: j.isActive ? relDays(j.postedAt) : "—",
  }));
}

export type CandidateStage = "applied" | "screening" | "interview" | "offer";

export type CandidateRow = {
  id: string;
  name: string;
  appliedFor: string;
  matchPct: number;
  stage: CandidateStage;
  rawStatus: PipelineStatus;
  skills: string[];
  applied: string;
};

const STATUS_TO_STAGE: Record<string, CandidateStage> = {
  applied: "applied",
  screened: "screening",
  interview: "interview",
  offered: "offer",
  accepted: "offer",
};

/** Map ApplicationStatus DB → salah satu opsi pipeline (5 stage). */
function toPipelineStatus(status: string): PipelineStatus {
  if (status === "screened" || status === "interview" || status === "offered" || status === "rejected") {
    return status;
  }
  if (status === "accepted") return "offered";
  return "applied";
}

export async function getCompanyCandidates(userId: string): Promise<CandidateRow[]> {
  const cpId = await companyProfileId(userId);
  if (!cpId) return [];

  const apps = await prisma.application.findMany({
    where: { job: { companyProfileId: cpId } },
    orderBy: { appliedAt: "desc" },
    include: {
      job: { select: { title: true, skills: true } },
      user: {
        select: {
          name: true,
          email: true,
          profile: { select: { skills: true } },
          skills: { select: { skill: { select: { name: true } } } },
        },
      },
    },
  });

  const rows: CandidateRow[] = apps.map((a) => {
    // Skill kandidat: utamakan Profile.skills (freelancer/seed), fallback ke
    // user_skills relasional (jobseeker yang isi skill via onboarding/profil).
    const profileSkills = a.user.profile?.skills ?? [];
    const relationalSkills = a.user.skills.map((s) => s.skill.name);
    const candidateSkills = profileSkills.length > 0 ? profileSkills : relationalSkills;
    const { matchPct } = skillCoverageScore(candidateSkills, a.job.skills);
    return {
      id: a.id,
      name: a.user.name ?? a.user.email,
      appliedFor: a.job.title,
      matchPct,
      stage: STATUS_TO_STAGE[a.status] ?? "applied",
      rawStatus: toPipelineStatus(a.status),
      skills: candidateSkills.slice(0, 4),
      applied: relDays(a.appliedAt),
    };
  });

  return rows.sort((x, y) => y.matchPct - x.matchPct);
}

export type CompanyStats = {
  name: string;
  openJobs: number;
  totalCandidates: number;
  interviews: number;
  offers: number;
};

export async function getCompanyStats(userId: string): Promise<CompanyStats> {
  const cp = await prisma.companyProfile.findUnique({
    where: { userId },
    select: { id: true, name: true },
  });
  if (!cp) {
    return { name: "—", openJobs: 0, totalCandidates: 0, interviews: 0, offers: 0 };
  }

  const [openJobs, totalCandidates, interviews, offers] = await Promise.all([
    prisma.job.count({ where: { companyProfileId: cp.id, isActive: true } }),
    prisma.application.count({ where: { job: { companyProfileId: cp.id } } }),
    prisma.application.count({ where: { job: { companyProfileId: cp.id }, status: "interview" } }),
    prisma.application.count({ where: { job: { companyProfileId: cp.id }, status: { in: ["offered", "accepted"] } } }),
  ]);

  return { name: cp.name, openJobs, totalCandidates, interviews, offers };
}

export const CANDIDATE_STAGES: { key: CandidateStage; label: string }[] = [
  { key: "applied", label: "Applied" },
  { key: "screening", label: "Screening" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
];

// ============================================================
// TALENT SEARCH (reverse matching: listing → CareerProfile)
// ============================================================

export type TalentMatch = {
  userId: string;
  name: string;
  headline: string;
  matchPct: number;
  readinessScore: number;
  readinessBand: ReadinessBand;
  matchedSkills: string[];
  verifiedCount: number;
  totalSkills: number;
};

export type JobOption = { id: string; title: string };

/** Daftar lowongan perusahaan untuk selector talent search. */
export async function getCompanyJobOptions(userId: string): Promise<JobOption[]> {
  const cpId = await companyProfileId(userId);
  if (!cpId) return [];
  const jobs = await prisma.job.findMany({
    where: { companyProfileId: cpId },
    orderBy: { postedAt: "desc" },
    select: { id: true, title: true },
  });
  return jobs.map((j) => ({ id: j.id, title: j.title }));
}

/** Similarity semantik job ↔ semua profile (pgvector). Map userId → 0-100. */
async function semanticTalentScores(jobId: string): Promise<Map<string, number>> {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ user_id: string; sim: number }>>(
      `SELECT p.user_id::text AS user_id, (1 - (p.embedding <=> j.embedding))::float8 AS sim
       FROM profiles p
       CROSS JOIN jobs j
       WHERE j.id = $1::uuid
         AND p.embedding IS NOT NULL
         AND j.embedding IS NOT NULL`,
      jobId,
    );
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.user_id, Math.round(Math.max(0, Math.min(1, r.sim)) * 100));
    return map;
  } catch {
    return new Map();
  }
}

/**
 * Cari talent yang cocok dengan sebuah lowongan milik perusahaan (reverse match).
 * Skor = coverage skill (utama) + similarity semantik (sekunder). Tampilkan juga
 * readiness (coverage + verified ratio) + skill terverifikasi.
 *
 * Return null kalau job bukan milik perusahaan user (atau user bukan company).
 */
export async function searchTalentForJob(
  userId: string,
  jobId: string,
  limit = 20,
): Promise<TalentMatch[] | null> {
  const cpId = await companyProfileId(userId);
  if (!cpId) return null;

  const job = await prisma.job.findFirst({
    where: { id: jobId, companyProfileId: cpId },
    select: { id: true, skills: true },
  });
  if (!job) return null;

  const [candidates, semantic] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["jobseeker", "freelancer"] } },
      select: {
        id: true,
        name: true,
        email: true,
        profile: { select: { headline: true, skills: true } },
        skills: { select: { verified: true, skill: { select: { name: true } } } },
      },
    }),
    semanticTalentScores(jobId),
  ]);

  const hasSemantic = semantic.size > 0;

  const matches: TalentMatch[] = candidates.map((c) => {
    const relational = c.skills.map((s) => s.skill.name);
    const profileSkills = c.profile?.skills ?? [];
    const candidateSkills = relational.length > 0 ? relational : profileSkills;
    const verifiedCount = c.skills.filter((s) => s.verified).length;

    const cov = skillCoverageScore(candidateSkills, job.skills);
    const sim = semantic.get(c.id);
    const matchPct =
      hasSemantic && sim !== undefined
        ? Math.round(cov.matchPct * 0.7 + sim * 0.3)
        : cov.matchPct;

    const verifiedRatio = candidateSkills.length > 0 ? verifiedCount / candidateSkills.length : 0;
    const readiness = readinessScore({
      skillCoveragePct: cov.matchPct,
      verifiedRatio,
      portfolioCount: 0,
      completedMilestones: 0,
      totalMilestones: 0,
    });

    return {
      userId: c.id,
      name: c.name ?? c.email,
      headline: c.profile?.headline ?? "Talent",
      matchPct,
      readinessScore: readiness.score,
      readinessBand: readiness.band,
      matchedSkills: cov.matched.slice(0, 5),
      verifiedCount,
      totalSkills: candidateSkills.length,
    };
  });

  // Hanya talent dengan minimal sedikit relevansi, urut by match.
  return matches
    .filter((m) => m.totalSkills > 0)
    .sort((a, b) => b.matchPct - a.matchPct)
    .slice(0, limit);
}

// ============================================================
// PIPELINE LAMARAN (update status oleh perusahaan)
// ============================================================

// PIPELINE_OPTIONS & PipelineStatus diimpor dari src/lib/pipeline.ts (client-safe).
// Re-export agar konsumen lama tetap bisa import dari modul ini.
export { PIPELINE_OPTIONS, type PipelineStatus };

/**
 * Ubah status lamaran. Hanya boleh kalau lamaran tsb untuk lowongan milik
 * perusahaan user. Return false kalau tidak berwenang / tidak ada.
 */
export async function updateApplicationStatus(
  userId: string,
  applicationId: string,
  status: PipelineStatus,
): Promise<boolean> {
  const cpId = await companyProfileId(userId);
  if (!cpId) return false;

  const app = await prisma.application.findFirst({
    where: { id: applicationId, job: { companyProfileId: cpId } },
    select: { id: true },
  });
  if (!app) return false;

  await prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });
  return true;
}
