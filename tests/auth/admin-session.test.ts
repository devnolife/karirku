/**
 * Sesi admin tidak boleh lahir dari jalur tanpa verifikasi.
 *
 * Login identifier hanya mencocokkan email/username — mengetahui sebuah
 * username sudah cukup untuk masuk. Itu dapat diterima untuk akun demo, tetapi
 * tidak untuk admin: admin bisa menjalankan Hunter, mengirim lamaran atas nama
 * pemilik, dan membaca riwayat lamaran serta email pribadi.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { signInAs } from "@/lib/auth";

test("pemilih role menolak membuat sesi admin", async () => {
  await assert.rejects(
    () => signInAs("admin"),
    /OAuth/,
    "signInAs('admin') harus ditolak, bukan membuat sesi",
  );
});

test("role non-admin tidak ikut terblokir", async () => {
  // Hanya memastikan penjaga di atas tidak menolak role lain. Pembuatan sesi
  // sendiri butuh konteks request Next, jadi yang diuji adalah tidak adanya
  // penolakan dini bertema OAuth.
  for (const role of ["jobseeker", "freelancer", "company"] as const) {
    try {
      await signInAs(role);
    } catch (err) {
      assert.doesNotMatch(
        err instanceof Error ? err.message : String(err),
        /OAuth/,
        `role ${role} tidak boleh ditolak oleh penjaga admin`,
      );
    }
  }
});
