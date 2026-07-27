import { test } from "node:test";
import assert from "node:assert/strict";
import { applyRules, GENERIC_RULES, matchOption } from "@/core/autofill/rules";
import { findAdapter } from "@/core/autofill/adapters";
import { DEMO_PROFILE } from "@/core/autofill/profile";
import type { FormFieldInfo } from "@/core/autofill/types";

function field(partial: Partial<FormFieldInfo> & { selector: string }): FormFieldInfo {
  return { type: "text", ...partial };
}

// ---------- registry ----------

test("findAdapter mengenali URL portal yang didukung", () => {
  assert.equal(findAdapter("https://boards.greenhouse.io/acme/jobs/123")?.id, "greenhouse");
  assert.equal(findAdapter("https://job-boards.greenhouse.io/acme/jobs/1")?.id, "greenhouse");
  assert.equal(findAdapter("https://jobs.lever.co/acme/abc/apply")?.id, "lever");
  assert.equal(findAdapter("https://jobs.ashbyhq.com/acme/xyz")?.id, "ashby");
  assert.equal(findAdapter("https://id.jobstreet.com/id/job/123/apply")?.id, "jobstreet");
  assert.equal(findAdapter("https://glints.com/id/opportunities/jobs/x")?.id, "glints");
  assert.equal(findAdapter("https://karir-perusahaan-random.com/apply"), null);
});

// ---------- adapter greenhouse (fixture struktur field asli) ----------

test("adapter greenhouse memetakan field standar", () => {
  const adapter = findAdapter("https://boards.greenhouse.io/acme/jobs/123");
  assert.ok(adapter);
  const fields = [
    field({ selector: "#f0", name: "first_name", label: "First Name" }),
    field({ selector: "#f1", name: "last_name", label: "Last Name" }),
    field({ selector: "#f2", name: "email", type: "email", label: "Email" }),
    field({ selector: "#f3", name: "phone", type: "tel", label: "Phone" }),
    field({ selector: "#f4", name: "question_linkedin", label: "LinkedIn Profile" }),
    field({ selector: "#f5", name: "resume", type: "file", label: "Resume/CV" }),
  ];
  const { mappings, remaining } = applyRules(fields, adapter.rules, DEMO_PROFILE);

  const bySel = new Map(mappings.map((m) => [m.selector, m.value]));
  assert.equal(bySel.get("#f0"), "Dimas");
  assert.equal(bySel.get("#f1"), "Prakoso");
  assert.equal(bySel.get("#f2"), "dimas@craft.works");
  assert.equal(bySel.get("#f3"), DEMO_PROFILE.phone);
  assert.equal(bySel.get("#f4"), DEMO_PROFILE.linkedinUrl);
  // file dilewati (bukan remaining, bukan mapping)
  assert.ok(!bySel.has("#f5"));
  assert.ok(!remaining.some((f) => f.selector === "#f5"));
  // semua mapping adapter ber-confidence 1.0
  assert.ok(mappings.every((m) => m.confidence === 1.0 && m.source === "adapter"));
});

// ---------- adapter lever ----------

test("adapter lever: field 'name' tunggal → nama lengkap, urls[LinkedIn] → linkedin", () => {
  const adapter = findAdapter("https://jobs.lever.co/acme/abc/apply");
  assert.ok(adapter);
  const fields = [
    field({ selector: "#n", name: "name", label: "Full name" }),
    field({ selector: "#l", name: "urls[LinkedIn]", label: "LinkedIn URL" }),
    field({ selector: "#o", name: "org", label: "Current company" }),
  ];
  const { mappings } = applyRules(fields, adapter.rules, DEMO_PROFILE);
  const bySel = new Map(mappings.map((m) => [m.selector, m.value]));
  assert.equal(bySel.get("#n"), "Dimas Prakoso");
  assert.equal(bySel.get("#l"), DEMO_PROFILE.linkedinUrl);
  assert.equal(bySel.get("#o"), DEMO_PROFILE.currentCompany);
});

// ---------- aturan generik (label Indonesia) ----------

test("GENERIC_RULES memetakan label Bahasa Indonesia", () => {
  const fields = [
    field({ selector: "#a", label: "Nama Lengkap" }),
    field({ selector: "#b", label: "No. HP / WhatsApp", type: "tel" }),
    field({ selector: "#c", label: "Kota Domisili" }),
    field({ selector: "#d", label: "Ekspektasi Gaji (IDR)", type: "number" }),
  ];
  const { mappings } = applyRules(fields, GENERIC_RULES, DEMO_PROFILE);
  const bySel = new Map(mappings.map((m) => [m.selector, m.value]));
  assert.equal(bySel.get("#a"), "Dimas Prakoso");
  assert.equal(bySel.get("#b"), DEMO_PROFILE.phone);
  assert.equal(bySel.get("#c"), "Jakarta");
  assert.equal(bySel.get("#d"), String(DEMO_PROFILE.expectedSalaryIdr));
});

test("select tanpa opsi yang cocok → tidak menebak (masuk remaining)", () => {
  const fields = [
    field({
      selector: "#s",
      label: "Kota",
      type: "select",
      options: ["Surabaya", "Bandung", "Medan"],
    }),
  ];
  const { mappings, remaining } = applyRules(fields, GENERIC_RULES, DEMO_PROFILE);
  assert.equal(mappings.length, 0);
  assert.equal(remaining.length, 1);
});

test("select dengan opsi cocok → nilai persis teks opsi", () => {
  const fields = [
    field({
      selector: "#s",
      label: "Kota",
      type: "select",
      options: ["Jakarta", "Surabaya", "Bandung"],
    }),
  ];
  const { mappings } = applyRules(fields, GENERIC_RULES, DEMO_PROFILE);
  assert.equal(mappings[0]?.value, "Jakarta");
});

test("matchOption: exact > partial, tidak cocok → undefined", () => {
  assert.equal(matchOption(["Jakarta", "Jakarta Selatan"], "jakarta"), "Jakarta");
  assert.equal(matchOption(["DKI Jakarta"], "Jakarta"), "DKI Jakarta");
  assert.equal(matchOption(["Surabaya"], "Jakarta"), undefined);
});
