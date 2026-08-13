// Access control for the Hunter API surface. The engine itself (arg
// allowlisting, process locking) is tested in devnolife/karirku-core.
import { test } from "node:test";
import assert from "node:assert/strict";

import { hunterAccessStatus, isHunterOwner } from "@/lib/hunter-access";

const OWNER = "andi@example.com";
const admin = { role: "admin" as const, email: OWNER };

test("Hunter access hanya mengizinkan admin", () => {
  assert.equal(hunterAccessStatus(null, {}, false, null), 401);
  assert.equal(hunterAccessStatus({ role: "jobseeker" }, {}, false, null), 403);
  assert.equal(hunterAccessStatus({ role: "freelancer" }, {}, false, null), 403);
  assert.equal(hunterAccessStatus({ role: "company" }, {}, false, null), 403);
  assert.equal(hunterAccessStatus({ role: "admin" }, {}, false, null), 200);
});

test("auto-apply admin tetap memerlukan entitlement", () => {
  assert.equal(
    hunterAccessStatus(admin, { requireAutoApply: true }, false, OWNER),
    403,
  );
  assert.equal(
    hunterAccessStatus(admin, { requireAutoApply: true }, true, OWNER),
    200,
  );
});

test("admin lain tidak bisa membaca data pribadi pemilik Hunter", () => {
  // Inti kebijakan ini: Hunter menyimpan riwayat lamaran dan email pribadi
  // satu orang. Menambah admin kedua tidak boleh membuka akses ke sana.
  assert.equal(hunterAccessStatus(admin, {}, false, OWNER), 200);
  assert.equal(
    hunterAccessStatus({ role: "admin", email: "adminlain@example.com" }, {}, false, OWNER),
    403,
  );
  assert.equal(hunterAccessStatus({ role: "admin", email: null }, {}, false, OWNER), 403);
  assert.equal(hunterAccessStatus({ role: "admin" }, {}, false, OWNER), 403);
});

test("pencocokan pemilik tidak peka huruf besar-kecil", () => {
  assert.equal(isHunterOwner("ANDI@Example.COM", OWNER), true);
  assert.equal(isHunterOwner(" andi@example.com", OWNER), false);
});

test("tanpa konfigurasi pemilik, kebijakan tetap admin-only", () => {
  // Memaksa env baru akan mengunci pemilik keluar dari alatnya sendiri saat
  // deploy — kegagalan yang lebih buruk daripada perilaku lama.
  assert.equal(isHunterOwner("siapa@saja.com", null), true);
  assert.equal(hunterAccessStatus({ role: "admin", email: "x@y.com" }, {}, false, null), 200);
  assert.equal(hunterAccessStatus({ role: "jobseeker", email: "x@y.com" }, {}, false, null), 403);
});
