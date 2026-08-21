// Access control for the Hunter API surface. The engine itself (arg
// allowlisting, process locking) is tested in packages/core.
import { test } from "node:test";
import assert from "node:assert/strict";

import { hunterAccessStatus } from "@/lib/hunter-access";

test("tanpa sesi ditolak", () => {
  assert.equal(hunterAccessStatus(null), 401);
  assert.equal(hunterAccessStatus(null, { requireAutoApply: true }), 401);
});

test("semua role yang sudah login boleh membaca hunter miliknya sendiri", () => {
  for (const role of ["jobseeker", "freelancer", "company", "admin"] as const) {
    assert.equal(
      hunterAccessStatus({ role }),
      200,
      `${role} seharusnya boleh mengakses data hunter-nya sendiri`,
    );
  }
});

test("auto-apply tetap memerlukan entitlement", () => {
  // Membaca data sendiri tidak berdampak keluar; menjalankan otomasi dan
  // mengirim lamaran memakai sumber daya bersama dan menyentuh dunia luar.
  assert.equal(
    hunterAccessStatus({ role: "jobseeker" }, { requireAutoApply: true }, false),
    403,
  );
  assert.equal(
    hunterAccessStatus({ role: "jobseeker" }, { requireAutoApply: true }, true),
    200,
  );
  assert.equal(
    hunterAccessStatus({ role: "admin" }, { requireAutoApply: true }, false),
    403,
    "admin pun tidak dikecualikan dari entitlement",
  );
});
