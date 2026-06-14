/**
 * Readiness Score — deterministik & explainable (tanpa DB/AI).
 *
 * Menjawab "seberapa siap talent untuk target role-nya?" pada skala 0-100.
 * Dipakai untuk badge "ready X%" dan re-rank matching (lihat composite.ts).
 *
 * Sinyal (sesuai spec §3.1):
 *  - skill coverage terhadap skill yang diminta target role
 *  - rasio skill yang sudah terverifikasi (pembeda inti CraftWorks)
 *  - kedalaman portfolio (proof of work)
 *  - progres milestone learning path
 *
 * Bobot dipilih eksplisit agar bisa dijelaskan ke user & di-tuning belakangan.
 */

export interface ReadinessInput {
  /** 0-100, % skill target role yang dimiliki user (dari skillCoverageScore). */
  skillCoveragePct: number;
  /** 0-1, fraksi skill relevan user yang berstatus verified. */
  verifiedRatio: number;
  /** Jumlah item portfolio (karya) milik user. */
  portfolioCount: number;
  /** Milestone learning path yang selesai. */
  completedMilestones: number;
  /** Total milestone learning path (0 = belum ada path). */
  totalMilestones: number;
}

export type ReadinessBand = "not_ready" | "getting_there" | "ready";

export interface ReadinessResult {
  /** 0-100, dibulatkan. */
  score: number;
  band: ReadinessBand;
  /** Kontribusi tiap komponen (0-100 dalam skala akhir) untuk penjelasan UI. */
  breakdown: {
    coverage: number;
    verified: number;
    portfolio: number;
    milestones: number;
  };
}

/** Bobot komponen readiness (jumlah = 1). */
export const READINESS_WEIGHTS = {
  coverage: 0.5,
  verified: 0.2,
  portfolio: 0.15,
  milestones: 0.15,
} as const;

/** Portfolio dianggap "cukup" pada jumlah ini (kontribusi penuh). */
export const PORTFOLIO_TARGET = 3;

/** Ambang band readiness. ready ≥ 70 (spec §4.5). */
export const READINESS_READY_THRESHOLD = 70;
export const READINESS_GETTING_THERE_THRESHOLD = 50;

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function bandFor(score: number): ReadinessBand {
  if (score >= READINESS_READY_THRESHOLD) return "ready";
  if (score >= READINESS_GETTING_THERE_THRESHOLD) return "getting_there";
  return "not_ready";
}

export function readinessScore(input: ReadinessInput): ReadinessResult {
  const coverage01 = clamp01(input.skillCoveragePct / 100);
  const verified01 = clamp01(input.verifiedRatio);
  const portfolio01 = clamp01(input.portfolioCount / PORTFOLIO_TARGET);
  const milestones01 =
    input.totalMilestones > 0
      ? clamp01(input.completedMilestones / input.totalMilestones)
      : 0;

  const coverage = coverage01 * READINESS_WEIGHTS.coverage * 100;
  const verified = verified01 * READINESS_WEIGHTS.verified * 100;
  const portfolio = portfolio01 * READINESS_WEIGHTS.portfolio * 100;
  const milestones = milestones01 * READINESS_WEIGHTS.milestones * 100;

  const score = Math.round(coverage + verified + portfolio + milestones);

  return {
    score,
    band: bandFor(score),
    breakdown: {
      coverage: Math.round(coverage),
      verified: Math.round(verified),
      portfolio: Math.round(portfolio),
      milestones: Math.round(milestones),
    },
  };
}
