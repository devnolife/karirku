import { test } from "node:test";
import assert from "node:assert/strict";

import { extractListingsFromMarkdown } from "@/lib/scraper/providers/firecrawl";

const BASE = "https://contoh.co.id/karir";

test("extractListingsFromMarkdown: ambil link lowongan, buang nav noise", () => {
  const md = [
    "# Karir di PT Contoh",
    "[Home](https://contoh.co.id/)",
    "[Frontend Developer](https://contoh.co.id/karir/frontend-developer)",
    "[Digital Marketing Specialist](/karir/digital-marketing-specialist)",
    "[Lamar](https://contoh.co.id/karir/frontend-developer)",
    "[Selengkapnya](https://contoh.co.id/karir/apa-saja)",
  ].join("\n");

  const out = extractListingsFromMarkdown(md, BASE, "PT Contoh");
  assert.deepEqual(
    out.map((l) => l.title),
    ["Frontend Developer", "Digital Marketing Specialist"],
  );
  // Relative URL di-resolve terhadap base.
  assert.equal(out[1].url, "https://contoh.co.id/karir/digital-marketing-specialist");
  assert.ok(out.every((l) => l.company === "PT Contoh"));
});

test("extractListingsFromMarkdown: dedupe URL sama", () => {
  const md = [
    "[Backend Engineer](https://contoh.co.id/jobs/backend-engineer)",
    "[Backend Engineer (Remote)](https://contoh.co.id/jobs/backend-engineer)",
  ].join("\n");
  const out = extractListingsFromMarkdown(md, BASE, "PT Contoh");
  assert.equal(out.length, 1);
});

test("extractListingsFromMarkdown: path non-lowongan diabaikan", () => {
  const md = [
    "[Tim Kami](https://contoh.co.id/about/team)",
    "[Blog Post](https://contoh.co.id/blog/kisah-sukses)",
  ].join("\n");
  const out = extractListingsFromMarkdown(md, BASE, "PT Contoh");
  assert.equal(out.length, 0);
});

test("extractListingsFromMarkdown: dukung pola lowongan/vacancy Indonesia", () => {
  const md = "[Staff Akuntansi](https://contoh.co.id/lowongan/staff-akuntansi-2026)";
  const out = extractListingsFromMarkdown(md, BASE, "PT Contoh");
  assert.equal(out.length, 1);
  assert.equal(out[0].title, "Staff Akuntansi");
});
