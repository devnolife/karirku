/**
 * Self-check matching engine (tanpa DB/AI). Jalankan:
 *   npx tsx scripts/match-check.ts
 *
 * Bukan unit-test framework — sekadar assertion ringan agar logika scorer
 * terverifikasi tanpa menambah dependency test runner.
 */

import { skillCoverageScore } from "../src/lib/match/score";
import { readinessScore } from "../src/lib/match/readiness";
import { compositeScore } from "../src/lib/match/composite";

let passed = 0;
let failed = 0;

function assert(name: string, cond: boolean, detail?: unknown) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}`, detail ?? "");
  }
}

console.log("skillCoverageScore");
{
  const r = skillCoverageScore(["React", "TypeScript"], ["react", "typescript", "node.js"]);
  assert("coverage 2/3 ≈ 67", r.matchPct === 67, r);
  assert("missing node.js", r.missing.includes("node.js"), r.missing);
  const empty = skillCoverageScore([], []);
  assert("no job skills → 0 (bukan error)", empty.matchPct === 0, empty);
}

console.log("readinessScore");
{
  const strong = readinessScore({
    skillCoveragePct: 100,
    verifiedRatio: 1,
    portfolioCount: 3,
    completedMilestones: 4,
    totalMilestones: 4,
  });
  assert("semua maksimal → 100 / ready", strong.score === 100 && strong.band === "ready", strong);

  const none = readinessScore({
    skillCoveragePct: 0,
    verifiedRatio: 0,
    portfolioCount: 0,
    completedMilestones: 0,
    totalMilestones: 0,
  });
  assert("kosong → 0 / not_ready", none.score === 0 && none.band === "not_ready", none);

  const mid = readinessScore({
    skillCoveragePct: 80,
    verifiedRatio: 0.5,
    portfolioCount: 1,
    completedMilestones: 1,
    totalMilestones: 2,
  });
  // coverage 0.8*50=40, verified 0.5*20=10, portfolio (1/3)*15=5, milestones 0.5*15=7.5≈8 → 63
  assert("mid case ≈ 63 / getting_there", mid.score === 63 && mid.band === "getting_there", mid);

  assert("portfolio di-cap (5 item = sama dgn 3)",
    readinessScore({ skillCoveragePct: 0, verifiedRatio: 0, portfolioCount: 5, completedMilestones: 0, totalMilestones: 0 }).breakdown.portfolio ===
    readinessScore({ skillCoveragePct: 0, verifiedRatio: 0, portfolioCount: 3, completedMilestones: 0, totalMilestones: 0 }).breakdown.portfolio,
  );
}

console.log("compositeScore");
{
  const withSem = compositeScore({ semanticSimilarity: 0.9, skillCoveragePct: 80, readinessScore: 70 });
  // 90*.4 + 80*.35 + 70*.25 = 36 + 28 + 17.5 = 81.5 → 82
  assert("dengan semantic ≈ 82", withSem.score === 82 && withSem.usedSemantic, withSem);

  const noSem = compositeScore({ skillCoveragePct: 80, readinessScore: 70 });
  // bobot redistribusi: coverage .35/.6=.5833, readiness .25/.6=.4166 → 80*.5833+70*.4166=46.67+29.17=75.8→76
  assert("tanpa semantic ≈ 76 & usedSemantic=false", noSem.score === 76 && !noSem.usedSemantic, noSem);

  assert("skor selalu 0-100",
    compositeScore({ semanticSimilarity: 1, skillCoveragePct: 100, readinessScore: 100 }).score === 100,
  );
}

console.log("");
console.log(`Total: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
