"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { loginAction } from "../_actions";
import {
  AuthIcon,
  Divider,
  FormError,
  GitHubButton,
  PasswordField,
  Spinner,
} from "../_fields";

/**
 * Form login: email/username + password.
 *
 * Pemilih role demo yang lama dihapus — jalur itu membuat sesi tanpa
 * memverifikasi apa pun, sehingga siapa saja bisa masuk sebagai user mana pun.
 */
export function LoginFlow({ stale }: { stale?: boolean }) {
  const [error, setError] = useState<string | null>(
    stale ? "Sesi kamu sudah berakhir. Masuk lagi ya." : null,
  );
  const [pending, startTransition] = useTransition();

  return (
    <div className="act-rise">
      <p className="mt-4 text-[15px] leading-relaxed text-[var(--act-charcoal)]">
        Masuk ke workspace kamu. Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-[var(--act-blue)] hover:underline">
          Daftar dulu
        </Link>
        .
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          setError(null);
          startTransition(async () => {
            // Sukses = server action redirect, jadi baris berikutnya hanya
            // tercapai kalau login gagal.
            const res = await loginAction(data);
            setError(res.error);
          });
        }}
      >
        <label className="block">
          <span className="act-eyebrow !text-[11px]">Email atau username</span>
          <input
            type="text"
            name="identifier"
            required
            autoFocus
            autoComplete="username"
            placeholder="kamu@email.com"
            className="act-field mt-2"
          />
        </label>

        <PasswordField
          name="password"
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••••"
        />

        <FormError message={error} />

        <button
          type="submit"
          disabled={pending}
          className="act-pill w-full justify-center gap-2 !text-sm disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? <Spinner /> : null}
          {pending ? "Memeriksa…" : "Masuk"}
          {!pending && AuthIcon.Arrow}
        </button>

        <Divider text="atau" />

        <GitHubButton label="Masuk dengan GitHub" />
      </form>
    </div>
  );
}
