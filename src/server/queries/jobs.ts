/**
 * Job match: hitung kecocokan skill user terhadap tiap lowongan aktif (real,
 * dari tabel jobs) memakai match engine. Mengembalikan top-N untuk ditampilkan.
 */

import { prisma } from "@/lib/db";
import { isProductionMode } from "@/lib/mode";
import { skillCoverageScore } from "@/lib/match/score";
import { compositeScore } from "@/lib/match/composite";
import {
  listingFreshnessScore,
  preferenceFitScore,
  recommendationDisplayVersion,
  scoreRecommendationV2,
} from "@/lib/match/v2";
import type { JobView } from "@/lib/view-models";
import { loadUserContext } from "./context";
import { getAppliedJobIds } from "./applications";
import {
  getReadiness,
  getUserReadinessSignals,
  readinessForJob,
  verifiedRatioForJob,
} from "./readiness";
import type { UserReadinessSignals } from "./readiness";
import type { UserContext } from "./context";
import type { SkillMatchResult } from "@/lib/match/score";
import { classifyJobRegion, regionRank, parseLocation, type JobRegion } from "@/lib/location";
import { describeJobSource } from "@/lib/source";
import { logShadowImpressions } from "@/server/services/recommendation-shadow";
import {
  normalizeRole,
  percentile,
} from "@/server/workers/market-intel-helpers";

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

async function semanticJobScore(
  userId: string,
  jobId: string,
): Promise<number | undefined> {
  try {
    const rows = await prisma.$queryRaw<Array<{ sim: number }>>`
      SELECT (1 - (j.embedding <=> p.embedding))::float8 AS sim
      FROM jobs j
      CROSS JOIN profiles p
      WHERE p.user_id = ${userId}::uuid
        AND j.id = ${jobId}::uuid
        AND p.embedding IS NOT NULL
        AND j.embedding IS NOT NULL
      LIMIT 1
    `;
    const similarity = rows[0]?.sim;
    return similarity === undefined
      ? undefined
      : Math.round(Math.max(0, Math.min(1, similarity)) * 100);
  } catch {
    return undefined;
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

type JobPreferences = {
  roles: string[];
  locations: string[];
  remoteOnly: boolean;
  minSalary: number | null;
  level: string | null;
};

function toJobPreferences(
  profile:
    | {
        desiredRoles: string[];
        preferredLocations: string[];
        remoteOnly: boolean;
        minSalaryIdr: number | null;
        desiredLevel: string | null;
      }
    | null,
): JobPreferences {
  return {
    roles: (profile?.desiredRoles ?? []).map((role) => role.toLowerCase()),
    locations: (profile?.preferredLocations ?? []).map((location) =>
      location.toLowerCase(),
    ),
    remoteOnly: profile?.remoteOnly ?? false,
    minSalary: profile?.minSalaryIdr ?? null,
    level: profile?.desiredLevel ?? null,
  };
}

type ScoreableJob = {
  title: string;
  location: string | null;
  type: string | null;
  level: string | null;
  skills: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  postedAt: Date | null;
  lastSeenAt: Date | null;
  dataQualityScore: number;
};

function preferenceSignals(job: ScoreableJob, prefs: JobPreferences) {
  const title = job.title.toLowerCase();
  const location = (job.location ?? "").toLowerCase();
  const isRemote = job.type === "remote" || location.includes("remote");
  return {
    isRemote,
    roleMatch: prefs.roles.length
      ? prefs.roles.some(
          (role) => title.includes(role) || role.includes(title),
        )
      : undefined,
    locationMatch:
      prefs.locations.length && (job.location || job.type)
        ? prefs.locations.some(
            (preferred) =>
              location.includes(preferred) ||
              (preferred === "remote" && isRemote),
          )
        : undefined,
    levelMatch:
      prefs.level && job.level ? job.level === prefs.level : undefined,
    salaryMatch:
      prefs.minSalary && (job.salaryMin || job.salaryMax)
        ? (job.salaryMax ?? job.salaryMin ?? 0) >= prefs.minSalary
        : undefined,
  };
}

function scoreJobV2(input: {
  job: ScoreableJob;
  coverage: SkillMatchResult;
  semanticPct?: number;
  readinessSignals: UserReadinessSignals;
  context: UserContext;
  preferences: JobPreferences;
  irrelevantSkills: Set<string>;
  saved: boolean;
}) {
  const preference = preferenceSignals(input.job, input.preferences);
  const jobReadiness =
    input.coverage.total > 0
      ? readinessForJob(
          input.coverage.matchPct,
          input.readinessSignals,
          verifiedRatioForJob(input.context.skills, input.job.skills),
        )
      : undefined;
  const irrelevantOverlap = input.job.skills.length
    ? input.job.skills.filter((skill) =>
        input.irrelevantSkills.has(skill.toLowerCase()),
      ).length / input.job.skills.length
    : 0;
  const v2 = scoreRecommendationV2({
    semanticSimilarity:
      input.semanticPct !== undefined ? input.semanticPct / 100 : undefined,
    skillCoveragePct:
      input.coverage.total > 0 ? input.coverage.matchPct : undefined,
    jobReadinessScore: jobReadiness?.score,
    preferenceScore: preferenceFitScore({
      roleMatch: preference.roleMatch,
      locationMatch: preference.locationMatch,
      levelMatch: preference.levelMatch,
      salaryMatch: preference.salaryMatch,
    }),
    freshnessScore: listingFreshnessScore(
      input.job.postedAt,
      input.job.lastSeenAt,
    ),
    dataQualityScore:
      input.job.dataQualityScore > 0
        ? input.job.dataQualityScore
        : undefined,
    feedbackAdjustment:
      irrelevantOverlap > 0
        ? -Math.round(15 * irrelevantOverlap)
        : input.saved
          ? 5
          : 0,
  });
  return { preference, jobReadiness, irrelevantOverlap, v2 };
}

function scoreJobV1(input: {
  coverage: SkillMatchResult;
  semanticPct?: number;
  readinessScore: number;
  scoring: ReturnType<typeof scoreJobV2>;
}) {
  const base = compositeScore({
    semanticSimilarity:
      input.semanticPct !== undefined ? input.semanticPct / 100 : undefined,
    skillCoveragePct: input.coverage.matchPct,
    readinessScore: input.readinessScore,
  }).score;
  const reasons: string[] = [];
  let adjustment = 0;
  if (input.scoring.preference.roleMatch) {
    adjustment += 8;
    reasons.push("Role sesuai preferensi");
  }
  if (input.scoring.preference.locationMatch) {
    adjustment += 5;
    reasons.push("Lokasi sesuai preferensi");
  }
  if (input.scoring.preference.levelMatch) {
    adjustment += 4;
    reasons.push("Level sesuai");
  }
  if (input.scoring.preference.salaryMatch) {
    adjustment += 3;
    reasons.push("Gaji ≥ minimum kamu");
  }
  if (input.scoring.irrelevantOverlap >= 0.5) adjustment -= 12;
  if (input.coverage.matched.length) {
    reasons.unshift(
      `Cocok: ${input.coverage.matched.slice(0, 3).join(", ")}`,
    );
  }
  return {
    score: Math.max(0, Math.min(100, base + adjustment)),
    reasons,
  };
}

export async function getJobsCount(): Promise<number> {
  if (!isProductionMode()) {
    const { DEMO_JOBS } = await import("@/lib/mock/demo");
    return DEMO_JOBS.length;
  }
  return prisma.job.count({ where: { isActive: true } });
}

export type JobMatchFilters = {
  surface?: "dashboard" | "jobs";
  region?: JobRegion;
  /** Keyword pencarian — dicocokkan ke title/company/description/skills (ILIKE). */
  q?: string;
  /** Gaji minimum (IDR). Lowongan tanpa data gaji tetap lolos. */
  minSalary?: number;
  /** Filter tipe kerja (fulltime | contract | remote | …). */
  type?: string;
  /** Filter level (junior | mid | senior | …). */
  level?: string;
};

/**
 * Top-N lowongan paling cocok. Skor = compositeScore (coverage skill +
 * semantic + readiness) lalu disesuaikan preferensi user & feedback —
 * rekomendasi berbasis data, bukan tebakan, dan explainable (reasons).
 * Keyword search menyaring kandidat SEBELUM scoring — hasil pencarian
 * tetap diurutkan berdasarkan kecocokan personal.
 */
export async function getJobMatches(
  userId: string,
  limit = 12,
  filters: JobMatchFilters | JobRegion = {},
): Promise<JobView[]> {
  // Kompat: pemanggil lama mengirim region string sebagai argumen ke-3.
  const f: JobMatchFilters = typeof filters === "string" ? { region: filters } : filters;
  if (!isProductionMode()) {
    const [{ DEMO_JOBS }, { readDemoAppliedIds }] = await Promise.all([
      import("@/lib/mock/demo"),
      import("@/lib/mock/demo-store"),
    ]);
    const applied = await readDemoAppliedIds();
    let list = DEMO_JOBS.map((j) => ({ ...j, applied: applied.has(j.id) }));
    if (f.region) {
      list = list.filter((j) =>
        f.region === "remote" ? j.location.includes("Remote") : !j.location.includes("Remote"),
      );
    }
    return list.slice(0, limit);
  }
  const ctx = await loadUserContext(userId);

  const q = f.q?.trim();
  const searchWhere = q
    ? {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { company: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
        { skills: { hasSome: [q] } },
        { location: { contains: q, mode: "insensitive" as const } },
      ],
    }
    : {};

  const [jobs, semantic, profile, feedback, readiness, readinessSignals] =
    await Promise.all([
    prisma.job.findMany({
      where: {
        isActive: true,
        ...searchWhere,
        ...(f.type ? { type: f.type as never } : {}),
        ...(f.level ? { level: f.level as never } : {}),
      },
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
        lastSeenAt: true,
        dataQualityScore: true,
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
      select: {
        jobId: true,
        action: true,
        job: { select: { skills: true } },
      },
    }),
    getReadiness(userId).catch(() => null),
    getUserReadinessSignals(userId, ctx),
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
  const irrelevantSkills = new Set(
    feedback
      .filter((row) => row.action === "irrelevant")
      .flatMap((row) => row.job.skills)
      .map((skill) => skill.toLowerCase()),
  );

  const prefs = toJobPreferences(profile);
  const readinessVal = readiness?.score ?? 0;

  let scored = jobs
    .filter((j) => !hiddenIds.has(j.id))
    .map((j) => {
      const cov = skillCoverageScore(ctx.skillNames, j.skills);
      const sim = semantic.get(j.id);
      const scoring = scoreJobV2({
        job: j,
        coverage: cov,
        semanticPct: sim,
        readinessSignals,
        context: ctx,
        preferences: prefs,
        irrelevantSkills,
        saved: savedIds.has(j.id),
      });
      const v1 = scoreJobV1({
        coverage: cov,
        semanticPct: sim,
        readinessScore: readinessVal,
        scoring,
      });
      const jobRegion = classifyJobRegion(j.location, j.source);
      return {
        job: j,
        matchPct: v1.score,
        region: jobRegion,
        cov,
        reasons: v1.reasons,
        isRemote: scoring.preference.isRemote,
        jobReadiness: scoring.jobReadiness,
        v2: scoring.v2,
      };
    });

  // Filter keras dari preferensi.
  if (prefs.remoteOnly) scored = scored.filter((s) => s.isRemote);
  if (prefs.minSalary) {
    scored = scored.filter(
      (s) => !s.job.salaryMax || s.job.salaryMax >= (prefs.minSalary as number),
    );
  }

  // Filter gaji minimum eksplisit dari UI (longgar: tanpa data gaji tetap lolos).
  if (f.minSalary) {
    scored = scored.filter(
      (s) =>
        (!s.job.salaryMin && !s.job.salaryMax) ||
        (s.job.salaryMax ?? s.job.salaryMin ?? 0) >= (f.minSalary as number),
    );
  }

  // Filter region kalau diminta.
  if (f.region) scored = scored.filter((s) => s.region === f.region);

  const rankWithRegion = (
    score: (item: (typeof scored)[number]) => number,
  ) =>
    new Map(
      [...scored]
        .sort((a, b) => {
          const regionOrder = regionRank(b.region) - regionRank(a.region);
          return regionOrder !== 0 ? regionOrder : score(b) - score(a);
        })
        .map((item, index) => [item.job.id, index + 1]),
    );
    const v1Rank = rankWithRegion((item) => item.matchPct);
    const v2Rank = rankWithRegion((item) => item.v2.score);

  const displayedVersion = recommendationDisplayVersion();
  // V1 remains default; V2 activates only via explicit environment flag.
  scored.sort((a, b) => {
    const r = regionRank(b.region) - regionRank(a.region);
    if (r !== 0) return r;
    return displayedVersion === "v2"
      ? b.v2.score - a.v2.score
      : b.matchPct - a.matchPct;
  });

  const visible = scored.slice(0, limit);
  const shadowItems =
    (f.surface ?? "jobs") === "jobs"
      ? scored.filter(
          (item) =>
            (v1Rank.get(item.job.id) ?? Number.MAX_SAFE_INTEGER) <= 30 ||
            (v2Rank.get(item.job.id) ?? Number.MAX_SAFE_INTEGER) <= 30,
        )
      : visible;
  const visibleIds = new Set(visible.map((item) => item.job.id));
  let impressionIds = new Map<string, string>();
  try {
    impressionIds = await logShadowImpressions(
      userId,
      shadowItems.map((item) => ({
        jobId: item.job.id,
        scoreV1: item.matchPct,
        scoreV2: item.v2.score,
        rankV1: v1Rank.get(item.job.id) ?? scored.length,
        rankV2: v2Rank.get(item.job.id) ?? scored.length,
        confidenceV2: item.v2.confidence,
        componentsV2: item.v2.components,
        displayed: visibleIds.has(item.job.id),
      })),
      {
        surface: f.surface ?? "jobs",
        queryKey: JSON.stringify({
          region: f.region ?? null,
          q: q?.toLowerCase() ?? null,
          type: f.type ?? null,
          level: f.level ?? null,
          minSalary: f.minSalary ?? null,
        }),
      },
      new Date(),
      displayedVersion,
    );
  } catch (error) {
    console.warn(
      `[recommendation-shadow] gagal mencatat impression: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  return visible.map(({ job, matchPct, cov, reasons, jobReadiness, v2 }) => {
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
      matchPct: displayedVersion === "v2" ? v2.score : matchPct,
      skills: job.skills.slice(0, 4),
      matchedSkills: cov.matched.slice(0, 6),
      missingSkills: cov.missing.slice(0, 6),
      matchReasons:
        displayedVersion === "v2"
          ? v2.reasons.slice(0, 3)
          : reasons.slice(0, 3),
      matchConfidence: v2.confidence,
      jobReadiness: jobReadiness?.score,
      scoreVersion: displayedVersion,
      impressionId: impressionIds.get(job.id),
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
export type RoleMarketView = {
  ready: boolean;
  roleName: string;
  openPositions: number;
  trend: { label: string; value: number }[];
  salaryP50: number | null;
  salarySampleSize: number;
  sourceCount: number;
  snapshotDate: string | null;
  topSkills: Array<{ name: string; count: number }>;
  message: string | null;
};

function shortMonth(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Market snapshot nyata; tidak lagi menyebut distribusi level sebagai trend. */
export async function getRoleMarket(
  targetRole: string | null,
): Promise<RoleMarketView> {
  const roleName = targetRole ? normalizeRole(targetRole) : "Semua role";
  if (!isProductionMode()) {
    const { DEMO_ROLE_MARKET } = await import("@/lib/mock/demo");
    return {
      ready: true,
      roleName,
      openPositions: DEMO_ROLE_MARKET.openPositions,
      trend: DEMO_ROLE_MARKET.trend,
      salaryP50: null,
      salarySampleSize: 0,
      sourceCount: 0,
      snapshotDate: null,
      topSkills: [],
      message: null,
    };
  }
  const rows = await prisma.roleMarketStat.findMany({
    where: targetRole ? { roleName } : undefined,
    orderBy: [{ snapshotDate: "desc" }, { openPositions: "desc" }],
    take: 1_000,
  });

  if (!rows.length) {
    return {
      ready: false,
      roleName,
      openPositions: 0,
      trend: [],
      salaryP50: null,
      salarySampleSize: 0,
      sourceCount: 0,
      snapshotDate: null,
      topSkills: [],
      message:
        "Data pasar belum cukup. Jalankan scan dan market-intel untuk membuat snapshot.",
    };
  }

  const latestDate = rows[0].snapshotDate;
  const latest = rows.filter(
    (row) => row.snapshotDate.getTime() === latestDate.getTime(),
  );
  const byDate = new Map<number, number>();
  for (const row of rows) {
    const key = row.snapshotDate.getTime();
    byDate.set(key, (byDate.get(key) ?? 0) + (row.openPositions ?? 0));
  }
  const trend = [...byDate.entries()]
    .sort(([a], [b]) => a - b)
    .slice(-12)
    .map(([timestamp, value]) => ({
      label: shortMonth(new Date(timestamp)),
      value,
    }));

  const salaryValues = latest.flatMap((row) => row.salaryValues);
  const salarySamples = salaryValues.length;
  const salaryP50 = percentile(salaryValues, 0.5);
  const skillCounts = new Map<string, { name: string; count: number }>();
  for (const row of latest) {
    const skills = Array.isArray(row.topSkills)
      ? (row.topSkills as Array<{ name?: unknown; count?: unknown }>)
      : [];
    for (const skill of skills) {
      if (typeof skill.name !== "string") continue;
      const count =
        typeof skill.count === "number" && Number.isFinite(skill.count)
          ? skill.count
          : 0;
      const key = skill.name.toLowerCase();
      const current = skillCounts.get(key);
      skillCounts.set(key, {
        name: current?.name ?? skill.name,
        count: (current?.count ?? 0) + count,
      });
    }
  }

  const openPositions = latest.reduce(
    (total, row) => total + (row.openPositions ?? 0),
    0,
  );
  // Per-city snapshots do not retain source IDs, so use the largest observed
  // count as an honest lower bound instead of summing duplicate sources.
  const sourceCount = Math.max(0, ...latest.map((row) => row.sourceCount));
  const sampleSufficient = openPositions >= 20 && sourceCount >= 2;

  return {
    ready: sampleSufficient,
    roleName,
    openPositions,
    trend,
    salaryP50,
    salarySampleSize: salarySamples,
    sourceCount,
    snapshotDate: latestDate.toISOString().slice(0, 10),
    topSkills: [...skillCounts.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    message: sampleSufficient
      ? null
      : `Data baru mencakup ${openPositions} posisi dari ${sourceCount} sumber; belum cukup untuk kesimpulan kuat.`,
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
  matchConfidence: number;
  jobReadiness: number | null;
  scoreVersion: "v1" | "v2";
  freshnessScore: number | null;
  dataQualityScore: number | null;
  proofSources: string[];
  posted: string;
  source: string;
  applyUrl: string | null;
  isNative: boolean;
  applied: boolean;
  region: JobRegion;
};

/** Detail lengkap satu lowongan + info match untuk user aktif. null kalau tak ada. */
export async function getJobDetail(userId: string, jobId: string): Promise<JobDetail | null> {
  if (!isProductionMode()) {
    const [{ DEMO_JOB_DETAILS }, { readDemoAppliedIds }] = await Promise.all([
      import("@/lib/mock/demo"),
      import("@/lib/mock/demo-store"),
    ]);
    const detail = DEMO_JOB_DETAILS[jobId];
    if (!detail) return null;
    const applied = await readDemoAppliedIds();
    return { ...detail, applied: applied.has(jobId) };
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return null;

  const ctx = await loadUserContext(userId);
  const cov = skillCoverageScore(ctx.skillNames, job.skills);

  const [
    applied,
    semanticPct,
    readinessSignals,
    profile,
    feedback,
    readiness,
  ] = await Promise.all([
    prisma.application.findFirst({
      where: { userId, jobId },
      select: { id: true },
    }),
    semanticJobScore(userId, jobId),
    getUserReadinessSignals(userId, ctx),
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
      where: { userId, action: { in: ["irrelevant", "saved"] } },
      select: {
        jobId: true,
        action: true,
        job: { select: { skills: true } },
      },
    }),
    getReadiness(userId).catch(() => null),
  ]);
  const irrelevantSkills = new Set(
    feedback
      .filter((row) => row.action === "irrelevant")
      .flatMap((row) => row.job.skills)
      .map((skill) => skill.toLowerCase()),
  );
  const scoring = scoreJobV2({
    job,
    coverage: cov,
    semanticPct,
    readinessSignals,
    context: ctx,
    preferences: toJobPreferences(profile),
    irrelevantSkills,
    saved: feedback.some(
      (row) => row.jobId === job.id && row.action === "saved",
    ),
  });
  const v1 = scoreJobV1({
    coverage: cov,
    semanticPct,
    readinessScore: readiness?.score ?? 0,
    scoring,
  });
  const freshness = listingFreshnessScore(job.postedAt, job.lastSeenAt);
  const displayedVersion = recommendationDisplayVersion();

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
    matchPct:
      displayedVersion === "v2" ? scoring.v2.score : v1.score,
    matchConfidence: scoring.v2.confidence,
    jobReadiness: scoring.jobReadiness?.score ?? null,
    scoreVersion: displayedVersion,
    freshnessScore: freshness ?? null,
    dataQualityScore:
      job.dataQualityScore > 0 ? job.dataQualityScore : null,
    proofSources: readinessSignals.proofSources,
    posted: relativeTime(job.postedAt),
    source: job.source,
    applyUrl: EXTERNAL_SOURCES.has(job.source) ? job.sourceUrl : null,
    isNative: !!job.companyProfileId,
    applied: !!applied,
    region: classifyJobRegion(job.location, job.source),
  };
}
