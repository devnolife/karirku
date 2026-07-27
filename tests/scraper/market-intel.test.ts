import { test } from "node:test";
import assert from "node:assert/strict";

import {
  aggregateMarketStats,
  marketGroupKey,
  normalizeLocation,
  normalizeMonthlySalary,
  normalizeRole,
  percentile,
  type MarketJobInput,
} from "../../src/workers/market-intel-helpers.js";
import { parseSnapshotDate } from "../../src/workers/handlers/market-intel.js";

test("market normalization canonicalizes role, city, and remote", () => {
  assert.equal(normalizeRole("Senior Backend Developer (Remote)"), "Backend Engineer");
  assert.equal(normalizeRole("Lead Product Manager"), "Product Manager");
  assert.equal(normalizeRole("Senior Legal Counsel"), "Legal Counsel");

  assert.deepEqual(normalizeLocation("Jakarta Selatan, Indonesia", "fulltime"), {
    city: "Jakarta",
    remote: false,
  });
  assert.deepEqual(normalizeLocation("Anywhere in APAC", "remote"), {
    city: "Remote",
    remote: true,
  });
});

test("salary normalization and percentiles are deterministic", () => {
  assert.equal(
    normalizeMonthlySalary({
      salaryMin: 10_000_000,
      salaryMax: 20_000_000,
      currency: "IDR",
    }),
    15_000_000,
  );
  assert.equal(
    normalizeMonthlySalary({ salaryMin: 1_000, salaryMax: 1_000, currency: "USD" }),
    16_300_000,
  );
  assert.equal(
    normalizeMonthlySalary({ salaryMin: 1_000, salaryMax: null, currency: "XYZ" }),
    null,
  );
  assert.equal(percentile([40, 10, 30, 20], 0.25), 18);
  assert.equal(percentile([40, 10, 30, 20], 0.5), 25);
  assert.equal(percentile([], 0.5), null);
});

test("daily aggregation calculates skills, salary samples, sources, trend, and companies", () => {
  const jobs: MarketJobInput[] = [
    {
      title: "Senior Backend Engineer",
      location: "Jakarta Selatan, Indonesia",
      type: "fulltime",
      skills: ["TypeScript", "PostgreSQL"],
      salaryMin: 10_000_000,
      salaryMax: 20_000_000,
      currency: "IDR",
      company: "Acme",
      source: "greenhouse",
      jobSourceId: "source-1",
    },
    {
      title: "Backend Developer",
      location: "Jakarta",
      type: "hybrid",
      skills: ["typescript", "Redis"],
      salaryMin: 20_000_000,
      salaryMax: 30_000_000,
      currency: "IDR",
      company: "Acme",
      source: "greenhouse",
      jobSourceId: "source-1",
    },
    {
      title: "Backend Software Engineer",
      location: "DKI Jakarta",
      type: "onsite",
      skills: ["SQL", "sql"],
      salaryMin: null,
      salaryMax: null,
      currency: "IDR",
      company: "Beta",
      source: "lever",
      jobSourceId: "source-2",
    },
  ];
  const previous = new Map([
    [marketGroupKey("Backend Engineer", "Jakarta"), 2],
  ]);
  const snapshot = new Date("2026-07-11T21:00:00.000Z");

  const [row] = aggregateMarketStats(jobs, snapshot, previous);
  assert.equal(row.roleName, "Backend Engineer");
  assert.equal(row.city, "Jakarta");
  assert.equal(row.snapshotDate.toISOString(), "2026-07-11T00:00:00.000Z");
  assert.equal(row.openPositions, 3);
  assert.equal(row.sourceCount, 2);
  assert.equal(row.salarySampleSize, 2);
  assert.deepEqual(row.salaryValues, [15_000_000, 25_000_000]);
  assert.equal(row.salaryP25, 17_500_000);
  assert.equal(row.salaryP50, 20_000_000);
  assert.equal(row.salaryP75, 22_500_000);
  assert.equal(row.trend3mo, 50);
  assert.deepEqual(row.topSkills.slice(0, 2), [
    { name: "TypeScript", count: 2 },
    { name: "PostgreSQL", count: 1 },
  ]);
  assert.deepEqual(row.topCompanies, ["Acme", "Beta"]);

  assert.deepEqual(
    aggregateMarketStats([...jobs].reverse(), snapshot, previous),
    aggregateMarketStats(jobs, snapshot, previous),
  );
});

test("market snapshot menolak backdate tanpa lifecycle as-of", () => {
  assert.throws(
    () => parseSnapshotDate("2020-01-01"),
    /historical snapshots are unsupported/,
  );
});
