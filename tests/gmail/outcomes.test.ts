import { test } from "node:test";
import assert from "node:assert/strict";

import { decryptSecret, encryptSecret } from "@devnolife/karirku-core/security/secrets";
import {
  applicationEmailMatchScore,
  classifyRecruitmentEmail,
} from "@/server/services/gmail-outcomes";

process.env.OAUTH_TOKEN_ENCRYPTION_KEY = "test-only-encryption-key";

test("OAuth secret terenkripsi dan dapat didekripsi", () => {
  const encrypted = encryptSecret("refresh-token-secret");
  assert.notEqual(encrypted, "refresh-token-secret");
  assert.equal(decryptSecret(encrypted), "refresh-token-secret");
  assert.throws(() => decryptSecret(`${encrypted.slice(0, -2)}aa`));
});

test("classifier email mengenali interview, offer, dan rejection", () => {
  assert.equal(
    classifyRecruitmentEmail("Interview invitation", "")?.status,
    "interview",
  );
  assert.equal(
    classifyRecruitmentEmail(
      "Update on your interview",
      "Unfortunately, we are not moving forward",
    )?.status,
    "rejected",
  );
  assert.equal(
    classifyRecruitmentEmail(
      "Your application",
      "Unfortunately we cannot offer you the position",
    )?.status,
    "rejected",
  );
  assert.equal(
    classifyRecruitmentEmail("Job offer from Acme", "")?.status,
    "offered",
  );
  assert.equal(
    classifyRecruitmentEmail(
      "Application update",
      "Unfortunately we are not moving forward",
    )?.status,
    "rejected",
  );
  assert.equal(classifyRecruitmentEmail("Newsletter", "New jobs"), null);
});

test("matching email lebih tinggi ketika company dan title disebut", () => {
  const strong = applicationEmailMatchScore(
    "Acme mengundang interview Frontend Engineer",
    "Acme Indonesia",
    "Frontend Engineer",
  );
  const weak = applicationEmailMatchScore(
    "Informasi umum rekrutmen",
    "Acme Indonesia",
    "Frontend Engineer",
  );
  assert.ok(strong > weak);
  assert.ok(strong >= 0.3);
});
