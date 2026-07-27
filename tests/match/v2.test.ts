import { test } from "node:test";
import assert from "node:assert/strict";

import {
  listingFreshnessScore,
  preferenceFitScore,
  scoreRecommendationV2,
} from "@devnolife/karirku-core/match/v2";
import {
  readinessForJob,
  verifiedRatioForJob,
} from "@/server/queries/readiness";
import { shouldSampleShadow } from "@/server/services/recommendation-shadow";
import { evaluateRecommendationShadow } from "@devnolife/karirku-core/match/evaluation";

test("scorer V2 menurunkan confidence saat semantic/data quality hilang", () => {
  const complete = scoreRecommendationV2({
    semanticSimilarity: 0.8,
    skillCoveragePct: 75,
    jobReadinessScore: 70,
    preferenceScore: 100,
    freshnessScore: 90,
    dataQualityScore: 85,
  });
  const degraded = scoreRecommendationV2({
    skillCoveragePct: 75,
    jobReadinessScore: 70,
    preferenceScore: 100,
    freshnessScore: 90,
  });
  assert.ok(complete.confidence > degraded.confidence);
  assert.equal(complete.scoreVersion, "v2-shadow-1");
  assert.ok(complete.score >= 0 && complete.score <= 100);
});

test("preference fit hanya menghitung preference yang tersedia", () => {
  assert.equal(
    preferenceFitScore({ roleMatch: true, locationMatch: false }),
    50,
  );
  assert.equal(preferenceFitScore({}), undefined);
});

test("freshness menggabungkan posted dan last-seen", () => {
  const now = new Date("2026-07-11T00:00:00.000Z");
  const fresh = listingFreshnessScore(
    new Date("2026-07-10T00:00:00.000Z"),
    new Date("2026-07-11T00:00:00.000Z"),
    now,
  );
  const old = listingFreshnessScore(
    new Date("2025-01-01T00:00:00.000Z"),
    new Date("2026-05-01T00:00:00.000Z"),
    now,
  );
  assert.ok((fresh ?? 0) > (old ?? 0));
  assert.equal(listingFreshnessScore(null, null, now), undefined);
});

test("job-specific readiness berubah mengikuti coverage job", () => {
  const signals = {
    verifiedRatio: 0.5,
    portfolioCount: 1,
    proofSources: ["GitHub"],
    completedMilestones: 2,
    totalMilestones: 4,
  };
  const weak = readinessForJob(20, signals);
  const strong = readinessForJob(90, signals);
  assert.ok(strong.score > weak.score);
});

test("verified ratio job mengabaikan skill terverifikasi yang tidak relevan", () => {
  const ratio = verifiedRatioForJob(
    [
      {
        id: "1",
        name: "React",
        proficiency: 4,
        verified: false,
      },
      {
        id: "2",
        name: "Python",
        proficiency: 5,
        verified: true,
      },
    ],
    ["React", "TypeScript"],
  );
  assert.equal(ratio, 0);
});

test("shadow sampling deterministik untuk user dan jam yang sama", () => {
  const now = new Date("2026-07-11T10:30:00.000Z");
  assert.equal(
    shouldSampleShadow("user-1", now, 0.5),
    shouldSampleShadow("user-1", now, 0.5),
  );
  assert.equal(shouldSampleShadow("user-1", now, 0), false);
  assert.equal(shouldSampleShadow("user-1", now, 1), true);
});

test("evaluation membandingkan precision V1 dan V2 pada label yang sama", () => {
  const metrics = evaluateRecommendationShadow([
    {
      scoreV1: 80,
      scoreV2: 90,
      rankV1: 2,
      rankV2: 1,
      confidenceV2: 0.8,
      label: "positive",
      reachedInterview: true,
      opened: true,
      applied: true,
      displayedVersion: "v1",
    },
    {
      scoreV1: 70,
      scoreV2: 30,
      rankV1: 1,
      rankV2: 12,
      confidenceV2: 0.7,
      label: "negative",
      reachedInterview: false,
      opened: false,
      applied: false,
      displayedVersion: "v1",
    },
  ]);
  assert.equal(metrics.precisionAt10V1, 0.5);
  assert.equal(metrics.precisionAt10V2, 1);
  assert.equal(metrics.irrelevantRateV2, 0);
  assert.equal(metrics.interviewRate, 1);
  assert.equal(metrics.applyRate, 0.5);
  assert.equal(
    metrics.calibrationV2.find((bin) => bin.label === "81-100")
      ?.positiveRate,
    1,
  );
  assert.equal(metrics.sampleSufficient, false);
  assert.equal(metrics.promotionReady, false);
});
