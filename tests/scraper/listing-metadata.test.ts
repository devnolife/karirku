import { test } from "node:test";
import assert from "node:assert/strict";

import {
  canonicalJobUrl,
  computeListingContentHash,
  scoreListingQuality,
} from "@/core/scraper/listing-metadata";

test("canonical job URL removes tracking but preserves identity params", () => {
  assert.equal(
    canonicalJobUrl(
      "https://example.com/jobs/1/?utm_source=email&department=eng#apply",
    ),
    "https://example.com/jobs/1?department=eng",
  );
});

test("content hash is SHA-256 and stable across harmless text differences", () => {
  const first = computeListingContentHash({
    sourceUrl: "https://example.com/jobs/1",
    title: "Senior Backend Engineer",
    company: "Acme",
    location: "Jakarta",
    requirements: ["TypeScript", "PostgreSQL"],
  });
  const second = computeListingContentHash({
    sourceUrl: "https://different.example/jobs/1",
    title: "  SENIOR   backend engineer ",
    company: "acme",
    location: "JAKARTA",
    requirements: [" postgresql ", "typescript"],
  });

  assert.match(first, /^[a-f0-9]{64}$/);
  assert.equal(first, second);
});

test("quality score exposes an explainable 0-100 breakdown", () => {
  const complete = scoreListingQuality({
    sourceUrl: "https://example.com/jobs/1",
    title: "Backend Engineer",
    company: "Acme",
    location: "Jakarta",
    description: "x".repeat(300),
    requirements: ["TypeScript", "PostgreSQL", "Redis"],
    salaryMin: 10_000_000,
    salaryMax: 20_000_000,
    postedAt: "2026-07-11T00:00:00.000Z",
  });
  assert.equal(complete.score, 100);
  assert.deepEqual(complete.breakdown, {
    title: 20,
    sourceUrl: 15,
    company: 15,
    location: 10,
    description: 20,
    requirements: 10,
    salary: 5,
    postedAt: 5,
  });

  const sparse = scoreListingQuality({
    sourceUrl: "not-a-url",
    title: "Engineer",
    company: "",
    location: "",
  });
  assert.equal(sparse.score, 20);
});
