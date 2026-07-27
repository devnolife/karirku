/**
 * Tests mesin skor rekomendasi — compositeScore (redistribusi bobot saat
 * semantic absen) dan skillCoverageScore (dasar penjelasan matched/missing).
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { compositeScore, COMPOSITE_WEIGHTS } from "../../src/match/composite.js";
import { skillCoverageScore } from "../../src/match/score.js";

test("compositeScore: dengan semantic memakai bobot penuh", () => {
  const r = compositeScore({ semanticSimilarity: 0.8, skillCoveragePct: 60, readinessScore: 50 });
  assert.equal(r.usedSemantic, true);
  assert.deepEqual(r.weights, { ...COMPOSITE_WEIGHTS });
  // 80*0.4 + 60*0.35 + 50*0.25 = 32+21+12.5 = 65.5 → 66
  assert.equal(r.score, 66);
});

test("compositeScore: tanpa semantic, bobot didistribusi ke coverage+readiness", () => {
  const r = compositeScore({ skillCoveragePct: 60, readinessScore: 50 });
  assert.equal(r.usedSemantic, false);
  assert.equal(r.weights.semantic, 0);
  // 60*(0.35/0.6) + 50*(0.25/0.6) = 35 + 20.83 = 55.83 → 56
  assert.equal(r.score, 56);
});

test("compositeScore: clamp input di luar rentang", () => {
  const r = compositeScore({ semanticSimilarity: 2, skillCoveragePct: 150, readinessScore: -10 });
  assert.ok(r.score >= 0 && r.score <= 100);
});

test("skillCoverageScore: matched & missing menjelaskan kenapa cocok", () => {
  const r = skillCoverageScore(["react", "TypeScript"], ["React", "TypeScript", "AWS", "Docker"]);
  assert.equal(r.matchPct, 50);
  assert.deepEqual(r.matched, ["React", "TypeScript"]);
  assert.deepEqual(r.missing, ["AWS", "Docker"]);
});

test("skillCoverageScore: alias js/ts/node dinormalisasi", () => {
  const r = skillCoverageScore(["JS", "node"], ["JavaScript", "Node.js"]);
  assert.equal(r.matchPct, 100);
});
