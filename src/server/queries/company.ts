/**
 * Query sisi company (employer): lowongan native, kandidat (dari applications),
 * dan statistik dashboard. Semua real dari DB.
 */

import { prisma } from "@/lib/db";
import { skillCoverageScore } from "@/lib/match/score";

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
