/**
 * Tests answer bank — normalisasi pertanyaan, exact & fuzzy match,
 * dan integrasi lapisan saved-answers di mapForm.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { normalizeQuestionKey, matchSavedAnswers } from "@/lib/autofill/answers";
import { mapForm } from "@/lib/autofill/engine";
import type { FormFieldInfo, ProfileData } from "@/lib/autofill/types";

const PROFILE: ProfileData = {
  fullName: "Budi Santoso",
  firstName: "Budi",
  lastName: "Santoso",
  email: "budi@example.com",
  skills: ["React", "TypeScript"],
};

function field(partial: Partial<FormFieldInfo> & { selector: string }): FormFieldInfo {
  return { type: "text", ...partial };
}

test("normalizeQuestionKey: lowercase, tanpa tanda baca, spasi tunggal", () => {
  assert.equal(
    normalizeQuestionKey("Why do you want to work here?"),
    "why do you want to work here",
  );
  assert.equal(normalizeQuestionKey("  Apa   motivasi Anda?! "), "apa motivasi anda");
});

test("matchSavedAnswers: exact key match → confidence 0.95, source saved", () => {
  const fields = [field({ selector: "#q1", label: "Why do you want to work here?", type: "textarea" })];
  const saved = [{ questionKey: "why do you want to work here", answer: "Saya tertarik dengan misi perusahaan." }];
  const { mappings, remaining } = matchSavedAnswers(fields, saved);
  assert.equal(mappings.length, 1);
  assert.equal(mappings[0].source, "saved");
  assert.equal(mappings[0].confidence, 0.95);
  assert.equal(remaining.length, 0);
});

test("matchSavedAnswers: fuzzy match pertanyaan mirip", () => {
  const fields = [
    field({ selector: "#q1", label: "Why would you like to work here at Acme?", type: "textarea" }),
  ];
  const saved = [{ questionKey: "why would you like to work here", answer: "Karena budaya engineering-nya." }];
  const { mappings } = matchSavedAnswers(fields, saved);
  assert.equal(mappings.length, 1);
  assert.equal(mappings[0].confidence, 0.85);
});

test("matchSavedAnswers: label pendek dilewati (bukan screening question)", () => {
  const fields = [field({ selector: "#name", label: "Nama" })];
  const saved = [{ questionKey: "nama", answer: "Budi" }];
  const { mappings, remaining } = matchSavedAnswers(fields, saved);
  assert.equal(mappings.length, 0);
  assert.equal(remaining.length, 1);
});

test("matchSavedAnswers: select hanya diisi bila jawaban persis salah satu opsi", () => {
  const fields = [
    field({
      selector: "#notice",
      label: "What is your notice period please?",
      type: "select",
      options: ["1 month", "2 months", "3 months"],
    }),
  ];
  const ok = matchSavedAnswers(fields, [
    { questionKey: "what is your notice period please", answer: "1 month" },
  ]);
  assert.equal(ok.mappings.length, 1);
  assert.equal(ok.mappings[0].value, "1 month");

  const bad = matchSavedAnswers(fields, [
    { questionKey: "what is your notice period please", answer: "sekitar 4 minggu" },
  ]);
  assert.equal(bad.mappings.length, 0);
  assert.equal(bad.remaining.length, 1);
});

test("mapForm: saved answers dipakai sebelum LLM, field profil tetap dari rules", async () => {
  const result = await mapForm(
    {
      url: "https://jobs.example.com/apply",
      fields: [
        field({ selector: "#email", type: "email", label: "Email" }),
        field({ selector: "#q1", label: "Why do you want to join our company?", type: "textarea" }),
      ],
    },
    PROFILE,
    {
      useLlm: false,
      savedAnswers: [
        { questionKey: "why do you want to join our company", answer: "Visi produknya sejalan dengan saya." },
      ],
    },
  );

  const email = result.mappings.find((m) => m.selector === "#email");
  assert.ok(email, "email harus terpetakan via rules");
  assert.equal(email!.source, "adapter");

  const essay = result.mappings.find((m) => m.selector === "#q1");
  assert.ok(essay, "pertanyaan screening harus dari answer bank");
  assert.equal(essay!.source, "saved");
  assert.equal(result.unmapped.length, 0);
});

test("mapForm: tanpa saved answers, pertanyaan screening masuk unmapped (LLM off)", async () => {
  const result = await mapForm(
    {
      url: "https://jobs.example.com/apply",
      fields: [field({ selector: "#q1", label: "Why do you want to join our company?", type: "textarea" })],
    },
    PROFILE,
    { useLlm: false },
  );
  assert.equal(result.mappings.length, 0);
  assert.deepEqual(result.unmapped, ["#q1"]);
});
