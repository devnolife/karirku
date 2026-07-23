export type RecommendationLabel = "positive" | "negative" | null;

export type RecommendationObservation = {
  scoreV1: number;
  scoreV2: number;
  rankV1: number;
  rankV2: number;
  confidenceV2: number;
  label: RecommendationLabel;
  reachedInterview: boolean;
  opened: boolean;
  applied: boolean;
  displayedVersion: "v1" | "v2";
};

export type RankingMetric = {
  labeled: number;
  positives: number;
  precisionAt10V1: number | null;
  precisionAt10V2: number | null;
  irrelevantRateV1: number | null;
  irrelevantRateV2: number | null;
  openRateAt10V1: number | null;
  openRateAt10V2: number | null;
  interviewRateAt10V1: number | null;
  interviewRateAt10V2: number | null;
  applyRate: number | null;
  interviewRate: number | null;
  averageConfidenceV2: number;
  sampleSufficient: boolean;
  calibrationV1: CalibrationBin[];
  calibrationV2: CalibrationBin[];
  shadowGatePassed: boolean;
  causalV2Exposures: number;
  promotionReady: boolean;
};

export type CalibrationBin = {
  label: string;
  count: number;
  positiveRate: number | null;
};

function rate(numerator: number, denominator: number): number | null {
  return denominator > 0
    ? Math.round((numerator / denominator) * 1_000) / 1_000
    : null;
}

function topMetric(
  observations: RecommendationObservation[],
  rank: "rankV1" | "rankV2",
  target: "positive" | "negative",
): number | null {
  const labeled = observations.filter(
    (row) => row[rank] <= 10 && row.label !== null,
  );
  return rate(
    labeled.filter((row) => row.label === target).length,
    labeled.length,
  );
}

function topBooleanMetric(
  observations: RecommendationObservation[],
  rank: "rankV1" | "rankV2",
  key: "opened" | "applied" | "reachedInterview",
): number | null {
  const top = observations.filter((row) => row[rank] <= 10);
  return rate(top.filter((row) => row[key]).length, top.length);
}

export function calibrationBins(
  observations: RecommendationObservation[],
  scoreKey: "scoreV1" | "scoreV2",
): CalibrationBin[] {
  const ranges = [
    [0, 20],
    [21, 40],
    [41, 60],
    [61, 80],
    [81, 100],
  ] as const;
  return ranges.map(([min, max]) => {
    const rows = observations.filter(
      (row) =>
        row.label !== null &&
        row[scoreKey] >= min &&
        row[scoreKey] <= max,
    );
    return {
      label: `${min}-${max}`,
      count: rows.length,
      positiveRate: rate(
        rows.filter((row) => row.label === "positive").length,
        rows.length,
      ),
    };
  });
}

export function evaluateRecommendationShadow(
  observations: RecommendationObservation[],
): RankingMetric {
  const labeled = observations.filter((row) => row.label !== null);
  const positive = labeled.filter((row) => row.label === "positive");
  const confidence =
    observations.length > 0
      ? observations.reduce(
          (total, row) => total + row.confidenceV2,
          0,
        ) / observations.length
      : 0;

  const causalV2Exposures = observations.filter(
    (row) => row.displayedVersion === "v2",
  ).length;
  const result = {
    labeled: labeled.length,
    positives: positive.length,
    precisionAt10V1: topMetric(observations, "rankV1", "positive"),
    precisionAt10V2: topMetric(observations, "rankV2", "positive"),
    irrelevantRateV1: topMetric(observations, "rankV1", "negative"),
    irrelevantRateV2: topMetric(observations, "rankV2", "negative"),
    openRateAt10V1: topBooleanMetric(observations, "rankV1", "opened"),
    openRateAt10V2: topBooleanMetric(observations, "rankV2", "opened"),
    interviewRateAt10V1: topBooleanMetric(
      observations,
      "rankV1",
      "reachedInterview",
    ),
    interviewRateAt10V2: topBooleanMetric(
      observations,
      "rankV2",
      "reachedInterview",
    ),
    applyRate: rate(
      observations.filter((row) => row.applied).length,
      observations.length,
    ),
    interviewRate: rate(
      positive.filter((row) => row.reachedInterview).length,
      positive.length,
    ),
    averageConfidenceV2: Math.round(confidence * 100) / 100,
    sampleSufficient: labeled.length >= 100 && positive.length >= 30,
    calibrationV1: calibrationBins(observations, "scoreV1"),
    calibrationV2: calibrationBins(observations, "scoreV2"),
    causalV2Exposures,
  };
  const shadowGatePassed = passesMetricGate(result);
  return {
    ...result,
    shadowGatePassed,
    // Shadow evidence is not causal. Promotion additionally requires a
    // separately approved limited V2 exposure cohort.
    promotionReady: shadowGatePassed && causalV2Exposures >= 50,
  };
}

function passesMetricGate(
  metrics: Omit<
    RankingMetric,
    "promotionReady" | "shadowGatePassed"
  >,
): boolean {
  return Boolean(
    metrics.sampleSufficient &&
      metrics.precisionAt10V1 !== null &&
      metrics.precisionAt10V2 !== null &&
      metrics.precisionAt10V2 > metrics.precisionAt10V1 &&
      metrics.irrelevantRateV1 !== null &&
      metrics.irrelevantRateV2 !== null &&
      metrics.irrelevantRateV2 < metrics.irrelevantRateV1 &&
      metrics.interviewRateAt10V1 !== null &&
      metrics.interviewRateAt10V2 !== null &&
      metrics.interviewRateAt10V2 >= metrics.interviewRateAt10V1,
  );
}
