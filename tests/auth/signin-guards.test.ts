/**
 * Penjaga jalur login tanpa verifikasi.
 *
 * `signInAs` membuat sesi tanpa memeriksa kredensial apa pun. Dulu fungsi ini
 * juga melayani mode produksi — artinya siapa pun yang bisa memanggilnya dapat
 * menjadi user mana pun. Sekarang ia dibatasi ke mode demo, dan admin tetap
 * ditolak bahkan di sana.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { signInAs, signInDemo } from "@/lib/auth";

const wasProduction = !!process.env.DATABASE_URL;

test("sesi admin tidak bisa lahir dari pemilih role", async () => {
  await assert.rejects(
    () => signInAs("admin"),
    /OAuth/,
    "signInAs('admin') harus ditolak, bukan membuat sesi",
  );
});

test("signInAs menolak berjalan di mode produksi", async (t) => {
  if (!wasProduction) {
    t.skip("butuh DATABASE_URL untuk menguji jalur produksi");
    return;
  }
  // Ini inti perbaikannya: di produksi, membuat sesi tanpa password harus
  // mustahil — bukan sekadar tidak dipakai UI.
  await assert.rejects(
    () => signInAs("jobseeker"),
    /demo/i,
    "signInAs harus menolak mode produksi",
  );
});

test("signInDemo tidak pernah membuat sesi di mode produksi", async (t) => {
  if (!wasProduction) {
    t.skip("butuh DATABASE_URL untuk menguji jalur produksi");
    return;
  }
  assert.equal(
    await signInDemo("dimas"),
    null,
    "login demo lewat username harus mati di produksi",
  );
});
