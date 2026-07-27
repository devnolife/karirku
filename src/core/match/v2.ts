export const RECOMMENDATION_SCORE_VERSION = "v2-shadow-1" as const;

export function recommendationDisplayVersion(): "v1" | "v2" {
  return process.env.RECOMMENDATION_DISPLAY_VERSION === "v2" ? "v2" : "v1";
}

export const SCORE_V2_WEIGHTS = {
  semantic: 0.25,
  skillCoverage: 0.3,
  jobReadiness: 0.2,
  preference: 0.15,
  freshness: 0.05,
  dataQuality: 0.05,
} as const;

export type ScoreV2Input = {
  /** 0-1 cosine similarity; undefined when embedding is unavailable. */
  semanticSimilarity?: number;
  /** Undefined means required skills were not extracted, not “0% match”. */
  skillCoveragePct?: number;
  jobReadinessScore?: number;
  /** Undefined when user has not configured job preferences. */
  preferenceScore?: number;
  freshnessScore?: number;
  /** Undefined means quality has not been measured yet. */
  dataQualityScore?: number;
  /** Signed adjustment learned from explicit feedback, clamped to -20..10. */
  feedbackAdjustment?: number;
};

export type ScoreV2Components = {
  semantic: number | null;
  skillCoverage: number | null;
  jobReadiness: number | null;
  preference: number | null;
  freshness: number | null;
  dataQuality: number | null;
  feedbackAdjustment: number;
};

export type ScoreV2Result = {
  score: number;
  confidence: number;
  components: ScoreV2Components;
  reasons: string[];
  scoreVersion: typeof RECOMMENDATION_SCORE_VERSION;
};

export type PreferenceFitInput = {
  roleMatch?: boolean;
  locationMatch?: boolean;
  levelMatch?: boolean;
  salaryMatch?: boolean;
};

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function pct(value: number | undefined): number | null {
  return value === undefined ? null : clamp(value, 0, 100);
}

/** Average only preferences that the user configured and the job can answer. */
export function preferenceFitScore(
  input: PreferenceFitInput,
): number | undefined {
  const values = Object.values(input)
    .filter((value): value is boolean => value !== undefined)
    .map<number>((value) => (value ? 100 : 0));
  if (!values.length) return undefined;
  return Math.round(
    values.reduce<number>((total, value) => total + value, 0) / values.length,
  );
}

/**
 * Versioned shadow scorer. Missing signals redistribute their weight so the
 * score remains usable, while confidence falls to expose uncertainty.
 */
export function scoreRecommendationV2(input: ScoreV2Input): ScoreV2Result {
  const components: ScoreV2Components = {
    semantic:
      input.semanticSimilarity === undefined
        ? null
        : clamp(input.semanticSimilarity, 0, 1) * 100,
    skillCoverage: pct(input.skillCoveragePct),
    jobReadiness: pct(input.jobReadinessScore),
    preference: pct(input.preferenceScore),
    freshness: pct(input.freshnessScore),
    dataQuality: pct(input.dataQualityScore),
    feedbackAdjustment: clamp(input.feedbackAdjustment ?? 0, -20, 10),
  };

  const weighted: Array<[keyof typeof SCORE_V2_WEIGHTS, number | null]> = [
    ["semantic", components.semantic],
    ["skillCoverage", components.skillCoverage],
    ["jobReadiness", components.jobReadiness],
    ["preference", components.preference],
    ["freshness", components.freshness],
    ["dataQuality", components.dataQuality],
  ];

  let weightedScore = 0;
  let availableWeight = 0;
  for (const [key, value] of weighted) {
    if (value === null) continue;
    const weight = SCORE_V2_WEIGHTS[key];
    weightedScore += value * weight;
    availableWeight += weight;
  }

  const base = availableWeight > 0 ? weightedScore / availableWeight : 0;
  const score = Math.round(
    clamp(base + components.feedbackAdjustment, 0, 100),
  );

  // Confidence measures evidence coverage, not match strength.
  const confidence =
    (components.skillCoverage === null ? 0 : 0.3) +
    (components.semantic === null ? 0 : 0.2) +
    (components.jobReadiness === null ? 0 : 0.2) +
    (components.freshness === null ? 0 : 0.1) +
    (components.dataQuality === null
      ? 0
      : 0.2 * (components.dataQuality / 100));

  const reasons: string[] = [];
  if (components.skillCoverage !== null) {
    reasons.push(`Skill cocok ${Math.round(components.skillCoverage)}%`);
  }
  if (components.jobReadiness !== null) {
    reasons.push(`Kesiapan job ${Math.round(components.jobReadiness)}%`);
  }
  if (components.preference !== null && components.preference >= 70) {
    reasons.push("Preferensi kerja selaras");
  }
  if (components.freshness !== null && components.freshness >= 70) {
    reasons.push("Data lowongan masih baru");
  }
  if (confidence < 0.5) {
    reasons.push("Confidence rendah: data belum lengkap");
  }

  return {
    score,
    confidence: Math.round(clamp(confidence, 0, 1) * 100) / 100,
    components,
    reasons,
    scoreVersion: RECOMMENDATION_SCORE_VERSION,
  };
}

function linearFreshness(ageDays: number, maxDays: number): number {
  return clamp(100 * (1 - ageDays / maxDays), 0, 100);
}

/** Blend listing age and last-seen recency into an explainable 0-100 score. */
export function listingFreshnessScore(
  postedAt: Date | null,
  lastSeenAt: Date | null,
  now = new Date(),
): number | undefined {
  if (!postedAt && !lastSeenAt) return undefined;
  const dayMs = 86_400_000;
  const posted = postedAt
    ? linearFreshness(
      Math.max(0, (now.getTime() - postedAt.getTime()) / dayMs),
      120,
    )
    : undefined;
  const seen = lastSeenAt
    ? linearFreshness(
      Math.max(0, (now.getTime() - lastSeenAt.getTime()) / dayMs),
      30,
    )
    : undefined;
  if (posted !== undefined && seen !== undefined) {
    return Math.round(posted * 0.4 + seen * 0.6);
  }
  return Math.round(posted ?? seen ?? 0);
}
