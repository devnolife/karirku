import { test } from "node:test";
import assert from "node:assert/strict";
import {
  autofillHost,
  describeAutofillMethod,
  describeAutofillStatus,
  summarizeAutofillActivity,
} from "../../src/autofill/activity.js";

test("autofillHost menghapus www dan mengambil hostname", () => {
  assert.equal(autofillHost("https://www.jobs.lever.co/acme/123"), "jobs.lever.co");
  assert.equal(autofillHost("https://boards.greenhouse.io/x/jobs/1"), "boards.greenhouse.io");
});

test("autofillHost fallback aman untuk URL tak valid", () => {
  assert.equal(autofillHost("bukan-url"), "bukan-url");
});

test("label method & status ramah user", () => {
  assert.equal(describeAutofillMethod("adapter"), "Profil (presisi)");
  assert.equal(describeAutofillMethod("llm"), "AI (perlu review)");
  assert.equal(describeAutofillMethod("mixed"), "Profil + AI");
  assert.equal(describeAutofillMethod("none"), "—");
  assert.equal(describeAutofillStatus("submitted"), "Dikirim oleh kamu");
  assert.equal(describeAutofillStatus("filled"), "Terisi — menunggu review");
});

test("summarizeAutofillActivity menghitung sesi, submit, field, dan portal unik", () => {
  const summary = summarizeAutofillActivity([
    { url: "https://jobs.lever.co/a/1", portal: "lever", method: "adapter", status: "submitted", fieldsTotal: 10, fieldsFilled: 8 },
    { url: "https://jobs.lever.co/a/1", portal: "lever", method: "adapter", status: "filled", fieldsTotal: 10, fieldsFilled: 8 },
    { url: "https://boards.greenhouse.io/x/2", portal: null, method: "mixed", status: "submitted", fieldsTotal: 12, fieldsFilled: 5 },
  ]);
  assert.equal(summary.sessions, 3);
  assert.equal(summary.submitted, 2);
  assert.equal(summary.fieldsFilled, 21);
  assert.equal(summary.portals, 2);
});

test("summarizeAutofillActivity mengabaikan fieldsFilled negatif", () => {
  const summary = summarizeAutofillActivity([
    { url: "https://x.co/1", portal: null, method: "none", status: "error", fieldsTotal: 0, fieldsFilled: -3 },
  ]);
  assert.equal(summary.fieldsFilled, 0);
  assert.equal(summary.sessions, 1);
});
