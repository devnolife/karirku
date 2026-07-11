import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hashToken,
  issueToken,
  tokenRecordIsActive,
  verifyToken,
} from "@/lib/autofill/token";

test("issueToken → verifyToken mengembalikan userId yang sama", () => {
  const { token } = issueToken("user-123");
  assert.equal(verifyToken(token), "user-123");
});

test("token kedaluwarsa ditolak", () => {
  const { token } = issueToken("user-123", -1000);
  assert.equal(verifyToken(token), null);
});

test("token dimodifikasi ditolak", () => {
  const { token } = issueToken("user-123");
  const [payload, sig] = token.split(".");
  const forged = Buffer.from(
    JSON.stringify({ uid: "attacker", scope: "autofill", exp: Date.now() + 1e9 }),
    "utf8",
  ).toString("base64url");
  assert.equal(verifyToken(`${forged}.${sig}`), null);
  assert.equal(verifyToken(`${payload}.AAAA${sig.slice(4)}`), null);
});

test("token kosong / format salah ditolak", () => {
  assert.equal(verifyToken(null), null);
  assert.equal(verifyToken(""), null);
  assert.equal(verifyToken("bukan-token"), null);
});

test("hashToken deterministik dan bukan token asli", () => {
  const { token } = issueToken("user-123");
  assert.equal(hashToken(token), hashToken(token));
  assert.notEqual(hashToken(token), token);
});

test("token DB record harus ada, cocok user/scope, dan belum kedaluwarsa", () => {
  const future = new Date(Date.now() + 60_000);
  const valid = { userId: "user-123", scope: "autofill", expiresAt: future };
  assert.equal(tokenRecordIsActive("user-123", valid), true);
  assert.equal(tokenRecordIsActive("user-123", null), false);
  assert.equal(
    tokenRecordIsActive("user-123", { ...valid, userId: "user-lain" }),
    false,
  );
  assert.equal(
    tokenRecordIsActive("user-123", { ...valid, scope: "hunter" }),
    false,
  );
  assert.equal(
    tokenRecordIsActive("user-123", {
      ...valid,
      expiresAt: new Date(Date.now() - 1),
    }),
    false,
  );
});
