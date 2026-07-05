import { test } from "node:test";
import assert from "node:assert/strict";
import type OpenAI from "openai";
import { mapWithLlm } from "@/lib/autofill/mapper";
import { mapForm } from "@/lib/autofill/engine";
import { DEMO_PROFILE } from "@/lib/autofill/profile";
import type { FormFieldInfo, FormSnapshot } from "@/lib/autofill/types";

function fakeClient(content: string | Error): OpenAI {
  return {
    chat: {
      completions: {
        create: async () => {
          if (content instanceof Error) throw content;
          return { choices: [{ message: { content } }] };
        },
      },
    },
  } as unknown as OpenAI;
}

const essayField: FormFieldInfo = {
  selector: "#essay",
  label: "Why do you want to work here?",
  type: "textarea",
};

const snapshot: FormSnapshot = {
  url: "https://karir-acme.example.com/apply",
  fields: [essayField],
};

test("mapWithLlm: parse output valid + tandai esai aiGenerated", async () => {
  const out = await mapWithLlm([essayField], DEMO_PROFILE, snapshot, {
    client: fakeClient(
      JSON.stringify({
        mappings: [
          { selector: "#essay", value: "Saya tertarik karena...", confidence: 0.9, essay: true },
        ],
      }),
    ),
  });
  assert.equal(out.length, 1);
  assert.equal(out[0].source, "llm");
  assert.equal(out[0].aiGenerated, true);
  // esai di-cap ke 0.7 agar selalu masuk highlight review
  assert.ok(out[0].confidence <= 0.7);
});

test("mapWithLlm: selector karangan LLM dibuang", async () => {
  const out = await mapWithLlm([essayField], DEMO_PROFILE, snapshot, {
    client: fakeClient(
      JSON.stringify({
        mappings: [{ selector: "#tidak-ada", value: "x", confidence: 0.9 }],
      }),
    ),
  });
  assert.equal(out.length, 0);
});

test("mapWithLlm: nilai select di luar opsi ditolak", async () => {
  const sel: FormFieldInfo = {
    selector: "#sel",
    label: "Notice period",
    type: "select",
    options: ["1 month", "2 months"],
  };
  const out = await mapWithLlm([sel], DEMO_PROFILE, { ...snapshot, fields: [sel] }, {
    client: fakeClient(
      JSON.stringify({ mappings: [{ selector: "#sel", value: "3 months", confidence: 0.9 }] }),
    ),
  });
  assert.equal(out.length, 0);
});

test("mapWithLlm: LLM error/JSON rusak → [] (tidak melempar)", async () => {
  assert.deepEqual(
    await mapWithLlm([essayField], DEMO_PROFILE, snapshot, {
      client: fakeClient(new Error("connection refused")),
    }),
    [],
  );
  assert.deepEqual(
    await mapWithLlm([essayField], DEMO_PROFILE, snapshot, {
      client: fakeClient("bukan json"),
    }),
    [],
  );
});

// ---------- engine (tanpa LLM) ----------

test("mapForm: adapter + generik, sisa masuk unmapped", async () => {
  const result = await mapForm(
    {
      url: "https://boards.greenhouse.io/acme/jobs/123",
      fields: [
        { selector: "#f0", name: "first_name", type: "text", label: "First Name" },
        { selector: "#f1", name: "email", type: "email", label: "Email" },
        { selector: "#f2", label: "Nama universitas aneh", type: "text" },
      ],
    },
    DEMO_PROFILE,
    { useLlm: false },
  );
  assert.equal(result.portal, "greenhouse");
  assert.equal(result.method, "adapter");
  assert.equal(result.mappings.length, 2);
  assert.deepEqual(result.unmapped, ["#f2"]);
});

test("mapForm: portal tak dikenal → aturan generik tetap jalan", async () => {
  const result = await mapForm(
    {
      url: "https://karir.example.co.id/apply",
      fields: [
        { selector: "#a", label: "Nama Lengkap", type: "text" },
        { selector: "#b", label: "Email", type: "email" },
      ],
    },
    DEMO_PROFILE,
    { useLlm: false },
  );
  assert.equal(result.portal, null);
  assert.equal(result.mappings.length, 2);
  assert.equal(result.unmapped.length, 0);
});
