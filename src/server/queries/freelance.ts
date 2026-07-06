/**
 * Query sisi freelancer: projects (real, dari tabel projects) + meta freelancer
 * (stats/portfolio/proposals) yang disimpan di Profile.experience JSON.
 */

import { prisma } from "@/lib/db";
import { skillCoverageScore } from "@/lib/match/score";

function formatBudget(min: number | null, max: number | null, durationDays: number | null): string {
  const jt = (n: number) => {
    const v = n / 1_000_000;
    return Number.isInteger(v) ? `${v}` : v.toFixed(1);
  };
  if (durationDays && durationDays <= 1 && min) return `Rp ${(min / 1000).toFixed(0)}k/jam`;
  if (min && max) return `Rp ${jt(min)}–${jt(max)} jt`;
  if (min) return `Rp ${jt(min)} jt+`;
  return "Nego";
}

function relDays(date: Date | null): string {
  if (!date) return "baru";
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "hari ini";
  if (days === 1) return "kemarin";
  if (days < 7) return `${days} hari lalu`;
  return `${Math.floor(days / 7)} minggu lalu`;
}

function durationLabel(days: number | null): string {
  if (!days) return "Fleksibel";
  if (days <= 1) return "Ongoing";
  if (days < 14) return `${days} hari`;
  return `${Math.round(days / 7)} minggu`;
}

export type ProjectRow = {
  id: string;
  title: string;
  client: string;
  budget: string;
  duration: string;
  posted: string;
  matchPct: number;
  skills: string[];
  type: "Fixed" | "Hourly";
};

/** Skill freelancer dari Profile.skills (fallback kosong). */
async function freelancerSkills(userId: string): Promise<string[]> {
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { skills: true } });
  return profile?.skills ?? [];
}

export async function getFreelanceProjects(userId: string, limit = 12): Promise<ProjectRow[]> {
  const skills = await freelancerSkills(userId);
  const projects = await prisma.project.findMany({
    where: { isActive: true },
    orderBy: { postedAt: "desc" },
    take: limit,
  });

  const rows = projects.map((p) => {
    const { matchPct } = skillCoverageScore(skills, p.skills);
    const hourly = (p.durationDays ?? 0) <= 1;
    return {
      id: p.id,
      title: p.title,
      client: p.client ?? "—",
      budget: formatBudget(p.budgetMin, p.budgetMax, p.durationDays),
      duration: durationLabel(p.durationDays),
      posted: relDays(p.postedAt),
      matchPct,
      skills: p.skills.slice(0, 4),
      type: hourly ? ("Hourly" as const) : ("Fixed" as const),
    };
  });

  return rows.sort((a, b) => b.matchPct - a.matchPct);
}

export type FreelancerStats = {
  rating: number;
  reviews: number;
  completedProjects: number;
  earningsIdr: number;
  responseRate: number;
  readiness: number;
  hourlyRateIdr: number;
};

export type PortfolioItem = { title: string; category: string; tag: string };

export type ProposalItem = {
  project: string;
  client: string;
  status: "draft" | "sent" | "shortlisted" | "won";
  amountIdr: number;
  daysAgo: number;
};

export type FreelancerMeta = {
  stats: FreelancerStats;
  portfolio: PortfolioItem[];
  proposals: ProposalItem[];
};

const DEFAULT_META: FreelancerMeta = {
  stats: { rating: 0, reviews: 0, completedProjects: 0, earningsIdr: 0, responseRate: 0, readiness: 0, hourlyRateIdr: 0 },
  portfolio: [],
  proposals: [],
};

/** Meta freelancer dari Profile.experience JSON (di-seed). */
export async function getFreelancerMeta(userId: string): Promise<FreelancerMeta> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { experience: true },
  });
  const raw = profile?.experience as Partial<FreelancerMeta> | null | undefined;
  if (!raw || typeof raw !== "object") return DEFAULT_META;
  return {
    stats: { ...DEFAULT_META.stats, ...(raw.stats ?? {}) },
    portfolio: Array.isArray(raw.portfolio) ? raw.portfolio : [],
    proposals: Array.isArray(raw.proposals) ? raw.proposals : [],
  };
}
