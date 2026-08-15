"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { registerAction } from "../_actions";
import {
  AuthIcon,
  Divider,
  FormError,
  GitHubButton,
  PasswordField,
  Spinner,
} from "../_fields";

const ROLES = [
  {
    value: "jobseeker",
    title: "Jobseeker",
    desc: "Cari kerja, roadmap belajar, analisis skill-gap.",
    icon: "M4 7h16v12H4zM9 7V5a2 2 0 012-2h2a2 2 0 012 2v2",
  },
  {
    value: "freelancer",
    title: "Freelancer",
    desc: "Cari project, kelola proposal & portofolio.",
    icon: "M12 2l9 5-9 5-9-5 9-5zM3 12l9 5 9-5",
  },
  {
    value: "company",
    title: "Perusahaan",
    desc: "Pasang lowongan & cari talent.",
    icon: "M3 21h18M5 21V7l7-4 7 4v14M9 10h.01M15 10h.01M9 14h.01M15 14h.01",
  },
] as const;

/** Turunkan username dari nama: huruf kecil, tanpa spasi/karakter aneh. */
function suggestUsername(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 50);
}

export function RegisterFlow() {
  const [role, setRole] = useState<string>("jobseeker");
  const [username, setUsername] = useState("");
  const [touchedUsername, setTouchedUsername] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="act-rise">
      <p className="mt-4 text-[15px] leading-relaxed text-[var(--act-charcoal)]">
        Buat akun baru. Sudah punya?{" "}
        <Link href="/login" className="font-semibold text-[var(--act-blue)] hover:underline">
          Masuk di sini
        </Link>
        .
      </p>

      <form
        className="mt-7 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          setError(null);
          startTransition(async () => {
            const res = await registerAction(data);
            setError(res.error);
          });
        }}
      >
        {/* Role */}
        <fieldset>
          <legend className="act-eyebrow !text-[11px]">Saya mendaftar sebagai</legend>
          <input type="hidden" name="role" value={role} />
          <div className="mt-2 space-y-2">
            {ROLES.map((r) => {
              const on = role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  aria-pressed={on}
                  className={
                    "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors " +
                    (on
                      ? "border-[var(--act-blue)] bg-[var(--act-blue-50)]"
                      : "border-[rgba(15,23,42,0.1)] bg-white hover:border-[rgba(15,23,42,0.22)]")
                  }
                >
                  <span
                    className={
                      "grid h-9 w-9 flex-none place-items-center rounded-xl " +
                      (on ? "bg-[var(--act-blue)] text-white" : "bg-[var(--act-mist)] text-[var(--act-graphite)]")
                    }
                  >
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d={r.icon} />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-[var(--act-ink)]">{r.title}</span>
                    <span className="block text-[12px] text-[var(--act-graphite)]">{r.desc}</span>
                  </span>
                  {on && (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 flex-none text-[var(--act-blue)]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="block">
          <span className="act-eyebrow !text-[11px]">Nama lengkap</span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            placeholder="Budi Santoso"
            onChange={(e) => {
              // Isi username otomatis sampai user mengubahnya sendiri.
              if (!touchedUsername) setUsername(suggestUsername(e.target.value));
            }}
            className="act-field mt-2"
          />
        </label>

        <label className="block">
          <span className="act-eyebrow !text-[11px]">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="kamu@email.com"
            className="act-field mt-2"
          />
        </label>

        <label className="block">
          <span className="act-eyebrow !text-[11px]">Username</span>
          <input
            type="text"
            name="username"
            required
            autoComplete="username"
            placeholder="budisantoso"
            value={username}
            onChange={(e) => {
              setTouchedUsername(true);
              setUsername(e.target.value);
            }}
            className="act-field mt-2"
          />
          <span className="mt-1.5 block text-[11.5px] text-[var(--act-graphite)]">
            Huruf kecil, angka, titik, garis bawah, atau strip. Minimal 3 karakter.
          </span>
        </label>

        <PasswordField
          name="password"
          label="Password"
          autoComplete="new-password"
          placeholder="minimal 10 karakter"
          hint="Minimal 10 karakter. Frasa panjang lebih aman daripada campuran simbol yang sulit diingat."
        />

        <FormError message={error} />

        <button
          type="submit"
          disabled={pending}
          className="act-pill w-full justify-center gap-2 !text-sm disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? <Spinner /> : null}
          {pending ? "Membuat akun…" : "Buat akun"}
          {!pending && AuthIcon.Arrow}
        </button>

        <Divider text="atau" />

        <GitHubButton label="Daftar dengan GitHub" />
      </form>
    </div>
  );
}
