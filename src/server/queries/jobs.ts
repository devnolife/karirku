/**
 * Job match: hitung kecocokan skill user terhadap tiap lowongan aktif (real,
 * dari tabel jobs) memakai match engine. Mengembalikan top-N untuk ditampilkan.
 */

import { prisma } from "@/lib/db";
import { skillCoverageScore } from "@/lib/match/score";
import type { JobView } from "@/lib/view-models";
import { loadUserContext } from "./context";
import { getAppliedJobIds } from "./applications";
import { classifyJobRegion, regionRank, parseLocation, type JobRegion } from "@/lib/location";

/**
 * Kemiripan semantik (pgvector) antara embedding profil user dan tiap lowongan.
 * Map jobId → skor 0-100. Kosong kalau profil/lowongan belum punya embedding.
 * Dipakai sebagai sinyal SEKUNDER (coverage skill tetap utama).
 */
async function semanticJobScores(userId: string): Promise<Map<string, number>> {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ id: string; sim: number }>>(
      `SELECT j.id::text AS id, (1 - (j.embedding <=> p.embedding))::float8 AS sim
       FROM jobs j
       CROSS JOIN profiles p
       WHERE p.user_id = $1::uuid
         AND p.embedding IS NOT NULL
         AND j.embedding IS NOT NULL
         AND j.is_active = true`,
      userId,
    );
    const map = new Map<string, number>();
    for (const r of rows) {
      const pct = Math.round(Math.max(0, Math.min(1, r.sim)) * 100);
      map.set(r.id, pct);
    }
    return map;
  } catch {
    return new Map();
  }
}

function formatSalary(min: number | null, max: number | null, currency: string): string {
  const jt = (n: number) => {
    const v = n / 1_000_000;
    return Number.isInteger(v) ? `${v}` : v.toFixed(1);
  };
  if (min && max) return `Rp ${jt(min)}–${jt(max)} jt`;
  if (min) return `Rp ${jt(min)} jt+`;
  if (max) return `≤ Rp ${jt(max)} jt`;
  return currency === "IDR" ? "Nego" : currency;
}

function relativeTime(date: Date | null): string {
  if (!date) return "baru";
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "hari ini";
  if (days === 1) return "kemarin";
  if (days < 7) return `${days} hari lalu`;
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`;
  return `${Math.floor(days / 30)} bulan lalu`;
}

export async function getJobsCount(): Promise<number> {
  return prisma.job.count({ where: { isActive: true } });
}

/**
 * Top-N lowongan paling cocok dengan skill user. Coverage dihitung deterministik
 * via skillCoverageScore (bukan mock matchPct).
 *
 * Ranking sadar-lokasi: lowongan Indonesia tampil lebih dulu (sesuai target user
 * yang umumnya berbasis di Indonesia), lalu remote, lalu luar negeri — masing-
 * masing diurutkan by match. `region` opsional mempersempit ke satu region saja.
 */
export async function getJobMatches(
  userId: string,
  limit = 12,
  region?: JobRegion,
): Promise<JobView[]> {
  const ctx = await loadUserContext(userId);

  const [jobs, semantic] = await Promise.all([
    prisma.job.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        skills: true,
        salaryMin: true,
        salaryMax: true,
        currency: true,
        postedAt: true,
        source: true,
        sourceUrl: true,
      },
      take: 600,
    }),
    semanticJobScores(userId),
  ]);

  const applied = await getAppliedJobIds(userId);

  // Sumber dengan URL apply asli (bukan seed sintetis / native in-platform).
  const EXTERNAL_SOURCES = new Set(["greenhouse", "lever", "ashby", "http"]);

  const hasSemantic = semantic.size > 0;

  let scored = jobs.map((j) => {
    const coverage = skillCoverageScore(ctx.skillNames, j.skills).matchPct;
    // Coverage skill = sinyal utama (0.75); kemiripan semantik = sekunder (0.25).
    const sim = semantic.get(j.id);
    const matchPct =
      hasSemantic && sim !== undefined
        ? Math.round(coverage * 0.75 + sim * 0.25)
        : coverage;
    const jobRegion = classifyJobRegion(j.location, j.source);
    return { job: j, matchPct, region: jobRegion };
  });

  // Filter region kalau diminta.
  if (region) scored = scored.filter((s) => s.region === region);

  // Urutkan: region (Indonesia dulu) → match desc.
  scored.sort((a, b) => {
    const r = regionRank(b.region) - regionRank(a.region);
    return r !== 0 ? r : b.matchPct - a.matchPct;
  });

  return scored.slice(0, limit).map(({ job, matchPct }) => {
    const loc = parseLocation(job.location);
    return {
      id: job.id,
      title: job.title,
      company: job.company ?? "—",
      location: `${loc.flag} ${loc.primary}${loc.extraCount > 0 ? ` +${loc.extraCount}` : ""}`,
      salary: formatSalary(job.salaryMin, job.salaryMax, job.currency),
      posted: relativeTime(job.postedAt),
      matchPct,
      skills: job.skills.slice(0, 4),
      applyUrl: EXTERNAL_SOURCES.has(job.source) ? job.sourceUrl : undefined,
      applied: applied.has(job.id),
    };
  });
}

/**
 * Sinyal pasar untuk role target: jumlah posisi + sebaran berdasarkan level
 * (data real dari lowongan yang cocok). Dipakai untuk chart demand.
 */
export async function getRoleMarket(
  targetRole: string | null,
): Promise<{ openPositions: number; trend: { label: string; value: number }[] }> {
  const where = targetRole
    ? { isActive: true, title: { contains: targetRole.split(" ")[0], mode: "insensitive" as const } }
    : { isActive: true };

  const jobs = await prisma.job.findMany({
    where,
    select: { level: true },
    take: 1000,
  });

  const levels: { key: string; label: string }[] = [
    { key: "intern", label: "Intern" },
    { key: "junior", label: "Junior" },
    { key: "mid", label: "Mid" },
    { key: "senior", label: "Senior" },
    { key: "lead", label: "Lead" },
  ];
  const counts = new Map<string, number>(levels.map((l) => [l.key, 0]));
  for (const j of jobs) {
    if (j.level && counts.has(j.level)) counts.set(j.level, (counts.get(j.level) ?? 0) + 1);
  }

  return {
    openPositions: jobs.length,
    trend: levels.map((l) => ({ label: l.label, value: counts.get(l.key) ?? 0 })),
  };
}

// ============================================================
// JOB DETAIL
// ============================================================

const JOB_TYPE_LABEL: Record<string, string> = {
  fulltime: "Full-time",
  parttime: "Part-time",
  contract: "Contract",
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "Onsite",
};

const LEVEL_LABEL: Record<string, string> = {
  intern: "Intern",
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
  lead: "Lead",
  manager: "Manager",
};

export type JobDetail = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string | null;
  level: string | null;
  salary: string;
  description: string;
  requirements: string[];
  skills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  matchPct: number;
  posted: string;
  source: string;
  applyUrl: string | null;
  isNative: boolean;
  applied: boolean;
  region: JobRegion;
};

/** Detail lengkap satu lowongan + info match untuk user aktif. null kalau tak ada. */
export async function getJobDetail(userId: string, jobId: string): Promise<JobDetail | null> {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return null;

  const ctx = await loadUserContext(userId);
  const cov = skillCoverageScore(ctx.skillNames, job.skills);

  const applied = await prisma.application.findFirst({
    where: { userId, jobId },
    select: { id: true },
  });

  const EXTERNAL_SOURCES = new Set(["greenhouse", "lever", "ashby", "http"]);

  return {
    id: job.id,
    title: job.title,
    company: job.company ?? "—",
    location: job.location ?? "Remote",
    type: job.type ? JOB_TYPE_LABEL[job.type] ?? job.type : null,
    level: job.level ? LEVEL_LABEL[job.level] ?? job.level : null,
    salary: formatSalary(job.salaryMin, job.salaryMax, job.currency),
    description: job.description ?? "",
    requirements: job.requirements,
    skills: job.skills,
    matchedSkills: cov.matched,
    missingSkills: cov.missing,
    matchPct: cov.matchPct,
    posted: relativeTime(job.postedAt),
    source: job.source,
    applyUrl: EXTERNAL_SOURCES.has(job.source) ? job.sourceUrl : null,
    isNative: !!job.companyProfileId,
    applied: !!applied,
    region: classifyJobRegion(job.location, job.source),
  };
}
