import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

async function main() {
  const { prisma } = await import("@devnolife/karirku-core/db");
  const { getRecommendationShadowMetrics } = await import(
    "@/server/queries/recommendation-metrics"
  );
  const metrics = await getRecommendationShadowMetrics(30);

  console.log("Recommendation shadow evaluation (30 hari)");
  console.table({
    impressions: metrics.impressions,
    labeled: metrics.labeled,
    positives: metrics.positives,
    precisionAt10V1: metrics.precisionAt10V1,
    precisionAt10V2: metrics.precisionAt10V2,
    irrelevantRateV1: metrics.irrelevantRateV1,
    irrelevantRateV2: metrics.irrelevantRateV2,
    openRateAt10V1: metrics.openRateAt10V1,
    openRateAt10V2: metrics.openRateAt10V2,
    applyRate: metrics.applyRate,
    interviewRate: metrics.interviewRate,
    interviewRateAt10V1: metrics.interviewRateAt10V1,
    interviewRateAt10V2: metrics.interviewRateAt10V2,
    averageConfidenceV2: metrics.averageConfidenceV2,
    sampleSufficient: metrics.sampleSufficient,
    shadowGatePassed: metrics.shadowGatePassed,
    causalV2Exposures: metrics.causalV2Exposures,
    promotionReady: metrics.promotionReady,
  });

  if (!metrics.promotionReady) {
    console.log(
      "V2 belum boleh diaktifkan: gate sample, precision, irrelevant rate, dan interview@10 belum terpenuhi.",
    );
  }
  console.log("Calibration V1");
  console.table(metrics.calibrationV1);
  console.log("Calibration V2");
  console.table(metrics.calibrationV2);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(
    `Evaluasi gagal: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});
