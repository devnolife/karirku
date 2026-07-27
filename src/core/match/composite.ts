/**
 * Composite match score — satu mesin untuk semua permukaan marketplace.
 *
 * Menggabungkan tiga sinyal jadi skor 0-100 (spec §3.3):
 *   match = w1·semantic + w2·coverage + w3·readiness
 *
 * - semantic  : cosine similarity profil↔listing via pgvector (0-1), OPSIONAL.
 *               Kalau embedding belum tersedia, bobotnya didistribusi ulang ke
 *               coverage & readiness supaya skor tetap valid.
 * - coverage  : skillCoverageScore (0-100), deterministik.
 * - readiness : readinessScore (0-100).
 *
 * Tiap permukaan (jobs/freelance/mentorship/kolaborasi) memakai fungsi yang sama,
 * hanya beda target query & filter di pemanggil.
 */

export interface CompositeInput {
  /** 0-1 cosine similarity. `undefined` jika embedding belum ada. */
  semanticSimilarity?: number;
  /** 0-100 dari skillCoverageScore. */
  skillCoveragePct: number;
  /** 0-100 dari readinessScore. */
  readinessScore: number;
}

export interface CompositeResult {
  /** 0-100, dibulatkan. */
  score: number;
  /** Bobot efektif yang dipakai (setelah redistribusi bila semantic absen). */
  weights: { semantic: number; coverage: number; readiness: number };
  /** Apakah komponen semantic ikut dihitung. */
  usedSemantic: boolean;
}

/** Bobot dasar saat semantic tersedia (jumlah = 1). */
export const COMPOSITE_WEIGHTS = {
  semantic: 0.4,
  coverage: 0.35,
  readiness: 0.25,
} as const;

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export function compositeScore(input: CompositeInput): CompositeResult {
  const coverage = clamp(input.skillCoveragePct, 0, 100);
  const readiness = clamp(input.readinessScore, 0, 100);

  const hasSemantic =
    typeof input.semanticSimilarity === "number" &&
    !Number.isNaN(input.semanticSimilarity);

  if (!hasSemantic) {
    // Redistribusi bobot semantic ke coverage & readiness secara proporsional.
    const base = COMPOSITE_WEIGHTS.coverage + COMPOSITE_WEIGHTS.readiness;
    const wCoverage = COMPOSITE_WEIGHTS.coverage / base;
    const wReadiness = COMPOSITE_WEIGHTS.readiness / base;
    const score = Math.round(coverage * wCoverage + readiness * wReadiness);
    return {
      score: clamp(score, 0, 100),
      weights: { semantic: 0, coverage: wCoverage, readiness: wReadiness },
      usedSemantic: false,
    };
  }

  const semantic = clamp(input.semanticSimilarity as number, 0, 1) * 100;
  const score = Math.round(
    semantic * COMPOSITE_WEIGHTS.semantic +
      coverage * COMPOSITE_WEIGHTS.coverage +
      readiness * COMPOSITE_WEIGHTS.readiness,
  );
  return {
    score: clamp(score, 0, 100),
    weights: { ...COMPOSITE_WEIGHTS },
    usedSemantic: true,
  };
}
