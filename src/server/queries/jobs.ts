/**
 * Job match: hitung kecocokan skill user terhadap tiap lowongan aktif (real,
 * dari tabel jobs) memakai match engine. Mengembalikan top-N untuk ditampilkan.
 */

import { prisma } from "@/lib/db";
import { skillCoverageScore } from "@/lib/match/score";
import { compositeScore } from "@/lib/match/composite";
import type { JobView } from "@/lib/view-models";
import { loadUserContext } from "./context";
import { getAppliedJobIds } from "./applications";
import { getReadiness } from "./readiness";
import { classifyJobRegion, regionRank, parseLocation, type JobRegion } from "@/lib/location";
import { describeJobSource } from "@/lib/source";

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
 * Top-N lowongan paling cocok. Skor = compositeScore (coverage skill +
 * semantic + readiness) lalu disesuaikan preferensi user & feedback —
 * rekomendasi berbasis data, bukan tebakan, dan explainable (reasons).
 */
export async function getJobMatches(
  userId: string,
  limit = 12,
  region?: JobRegion,
): Promise<JobView[]> {
  const ctx = await loadUserContext(userId);

  const [jobs, semantic, profile, feedback, readiness] = await Promise.all([
    prisma.job.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        type: true,
        level: true,
        skills: true,
        salaryMin: true,
        salaryMax: true,
        currency: true,
        postedAt: true,
        source: true,
        sourceUrl: true,
        companyProfileId: true,
      },
      take: 600,
    }),
    semanticJobScores(userId),
    prisma.profile.findUnique({
      where: { userId },
      select: {
        desiredRoles: true,
        preferredLocations: true,
        remoteOnly: true,
        minSalaryIdr: true,
        desiredLevel: true,
      },
    }),
    prisma.jobFeedback.findMany({
      where: { userId },
      select: { jobId: true, action: true },
    }),
    getReadiness(userId).catch(() => null),
  ]);

  const applied = await getAppliedJobIds(userId);

  // Sumber dengan URL apply asli (bukan seed sintetis / native in-platform).
  const EXTERNAL_SOURCES = new Set(["greenhouse", "lever", "ashby", "kalibrr", "http"]);

  const hiddenIds = new Set(
    feedback.filter((f) => f.action === "hidden" || f.action === "irrelevant").map((f) => f.jobId),
  );
  const savedIds = new Set(feedback.filter((f) => f.action === "saved").map((f) => f.jobId));

  // Skill dari lowongan yang ditandai "tidak relevan" — dipakai untuk
  // memberi penalti lowongan serupa (belajar dari feedback).
  const irrelevantJobIds = new Set(
    feedback.filter((f) => f.action === "irrelevant").map((f) => f.jobId),
  );
  const irrelevantSkills = new Set<string>();
  for (const j of jobs) {
    if (!irrelevantJobIds.has(j.id)) continue;
    for (const s of j.skills) irrelevantSkills.add(s.toLowerCase());
  }

  const prefs = {
    roles: (profile?.desiredRoles ?? []).map((r) => r.toLowerCase()),
    locations: (profile?.preferredLocations ?? []).map((l) => l.toLowerCase()),
    remoteOnly: profile?.remoteOnly ?? false,
    minSalary: profile?.minSalaryIdr ?? null,
    level: profile?.desiredLevel ?? null,
  };
  const readinessVal = readiness?.score ?? 0;

  let scored = jobs
    .filter((j) => !hiddenIds.has(j.id))
    .map((j) => {
      const cov = skillCoverageScore(ctx.skillNames, j.skills);
      const sim = semantic.get(j.id);
      const base = compositeScore({
        semanticSimilarity: sim !== undefined ? sim / 100 : undefined,
        skillCoveragePct: cov.matchPct,
        readinessScore: readinessVal,
      }).score;

      // — penyesuaian preferensi (explainable, tiap alasan tercatat) —
      const reasons: string[] = [];
      let adj = 0;
      const titleLc = j.title.toLowerCase();
      const locLc = (j.location ?? "").toLowerCase();
      const isRemote = j.type === "remote" || locLc.includes("remote");

      if (prefs.roles.length && prefs.roles.some((r) => titleLc.includes(r) || r.includes(titleLc))) {
        adj += 8;
        reasons.push("Role sesuai preferensi");
      }
      if (prefs.locations.length && prefs.locations.some((l) => locLc.includes(l) || (l === "remote" && isRemote))) {
        adj += 5;
        reasons.push("Lokasi sesuai preferensi");
      }
      if (prefs.level && j.level === prefs.level) {
        adj += 4;
        reasons.push("Level sesuai");
      }
      if (prefs.minSalary && j.salaryMin && j.salaryMin >= prefs.minSalary) {
        adj += 3;
        reasons.push("Gaji ≥ minimum kamu");
      }
      // Serupa dengan lowongan yang kamu tandai tidak relevan → turunkan.
      if (irrelevantSkills.size && j.skills.length) {
        const overlap = j.skills.filter((s) => irrelevantSkills.has(s.toLowerCase())).length / j.skills.length;
        if (overlap >= 0.5) adj -= 12;
      }
      if (cov.matched.length) reasons.unshift(`Cocok: ${cov.matched.slice(0, 3).join(", ")}`);

      const matchPct = Math.max(0, Math.min(100, base + adj));
      const jobRegion = classifyJobRegion(j.location, j.source);
      return { job: j, matchPct, region: jobRegion, cov, reasons, isRemote };
    });

  // Filter keras dari preferensi.
  if (prefs.remoteOnly) scored = scored.filter((s) => s.isRemote);
  if (prefs.minSalary) {
    scored = scored.filter(
      (s) => !s.job.salaryMax || s.job.salaryMax >= (prefs.minSalary as number),
    );
  }

  // Filter region kalau diminta.
  if (region) scored = scored.filter((s) => s.region === region);

  // Urutkan: region (Indonesia dulu) → match desc.
  scored.sort((a, b) => {
    const r = regionRank(b.region) - regionRank(a.region);
    return r !== 0 ? r : b.matchPct - a.matchPct;
  });

  return scored.slice(0, limit).map(({ job, matchPct, cov, reasons }) => {
    const loc = parseLocation(job.location);
    const applyUrl = EXTERNAL_SOURCES.has(job.source) ? job.sourceUrl : undefined;
    const src = describeJobSource(job.source, applyUrl, !!job.companyProfileId);
    const sourceLabel =
      src.kind === "external" ? `via ${src.platform}` : src.kind === "native" ? "KarirKu" : "Contoh";
    return {
      id: job.id,
      title: job.title,
      company: job.company ?? "—",
      location: `${loc.flag} ${loc.primary}${loc.extraCount > 0 ? ` +${loc.extraCount}` : ""}`,
      salary: formatSalary(job.salaryMin, job.salaryMax, job.currency),
      posted: relativeTime(job.postedAt),
      matchPct,
      skills: job.skills.slice(0, 4),
      matchedSkills: cov.matched.slice(0, 6),
      missingSkills: cov.missing.slice(0, 6),
      matchReasons: reasons.slice(0, 3),
      saved: savedIds.has(job.id),
      applyUrl,
      applied: applied.has(job.id),
      sourceLabel,
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

  const EXTERNAL_SOURCES = new Set(["greenhouse", "lever", "ashby", "kalibrr", "http"]);

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
