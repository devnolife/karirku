"use client";

import { useState, useTransition } from "react";
import type { UserRole } from "@devnolife/karirku-core/roles";
import { signInAction, signInWithIdentifierAction } from "./actions";

/**
 * Alur login 2 langkah:
 * 1. Kredensial — email ATAU username (password demo: tidak divalidasi).
 *    Kalau identifier cocok user nyata, langsung masuk ke workspace-nya.
 * 2. Pilih role — fallback demo saat identifier tidak dikenali.
 */
const ROLE_OPTIONS: {
  role: UserRole;
  title: string;
  desc: string;
  username: string;
}[] = [
    { role: "jobseeker", title: "Jobseeker", desc: "Roadmap belajar, skill-gap, & job match.", username: "dimas" },
    { role: "freelancer", title: "Freelancer", desc: "Portofolio, project match, & proposal.", username: "sari" },
    { role: "company", title: "Company", desc: "Posting lowongan & AI screening kandidat.", username: "nara" },
    // Admin sengaja tidak ada di sini: pemilih role adalah jalur demo tanpa
    // verifikasi, sedangkan admin bisa menjalankan Hunter dan membaca data
    // pribadi. Sesi admin hanya lahir dari OAuth.
  ];

export function LoginFlow() {
  const [step, setStep] = useState<"credentials" | "role">("credentials");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState<UserRole | null>(null);

  if (step === "credentials") {
    return (
      <div className="act-rise">
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--act-charcoal)]">
          Masuk lewat <strong>GitHub</strong> untuk akun sungguhan. Kolom di bawah
          adalah <strong>jalur demo</strong> (mis.{" "}
          <code className="rounded bg-[var(--act-mist)] px-1 py-0.5 text-[13px]">
            dimas
          </code>
          ) — tanpa verifikasi, jadi jangan pakai untuk data asli.
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            // Baca dari FormData, bukan state: nilai input tetap terbaca
            // walau submit terjadi sebelum React sempat sinkron.
            const value = String(
              new FormData(e.currentTarget).get("identifier") ?? "",
            ).trim();
            setEmail(value);
            setError(null);
            startTransition(async () => {
              const res = await signInWithIdentifierAction(value);
              // Sukses = server action redirect, jadi baris ini hanya
              // tercapai saat identifier tidak dikenali.
              setError(res.error);
              setStep("role");
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="act-field mt-2"
            />
          </label>

          {/*
            Tidak ada kolom password: aplikasi ini tidak menyimpan password dan
            tidak memverifikasinya. Menampilkan kolom password yang diabaikan
            server akan membuat pengguna mengira akunnya terlindungi padahal
            tidak — dan mendorong mereka mengetikkan password asli mereka ke
            form yang membuangnya.
          */}

          {error && (
            <p role="alert" className="text-sm text-[#b91c1c]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="act-pill w-full justify-center !text-sm disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Memeriksa…" : "Masuk"}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => {
              // Navigasi penuh (bukan <Link>) karena tujuannya adalah route
              // handler yang membalas redirect ke GitHub; router klien Next
              // tidak bisa mengikuti redirect lintas-origin itu.
              window.location.href = "/api/auth/github";
            }}
            className="inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-full border border-[rgba(15,23,42,0.12)] bg-[#0f172a] text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <svg viewBox="0 0 16 16" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
            Masuk dengan GitHub
          </button>

          <button
            type="button"
            disabled
            className="inline-flex h-[52px] w-full cursor-not-allowed items-center justify-center gap-3 rounded-full border border-[rgba(15,23,42,0.1)] bg-[var(--act-mist)] text-sm font-medium text-[var(--act-graphite)]"
          >
            <GoogleIcon />
            Google — nonaktif di demo
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="act-rise">
      <p className="mt-4 text-[15px] leading-relaxed text-[var(--act-charcoal)]">
        {error ? (
          <span role="alert">{error}</span>
        ) : (
          <>
            Masuk sebagai{" "}
            <span className="font-semibold text-[var(--act-ink)]">{email}</span>.
            Pilih role untuk menentukan workspace yang dibuka.
          </>
        )}
      </p>

      <form className="mt-8 space-y-2.5">
        {ROLE_OPTIONS.map((o) => (
          <button
            key={o.role}
            type="submit"
            data-role={o.role}
            formAction={signInAction.bind(null, o.role)}
            onClick={(e) => {
              // Jangan disable tombol yang diklik sebelum action ter-dispatch,
              // cukup blokir klik ganda & disable tombol lain.
              if (submitting) {
                e.preventDefault();
                return;
              }
              setSubmitting(o.role);
            }}
            disabled={submitting !== null && submitting !== o.role}
            className="group flex w-full items-center gap-3.5 rounded-2xl border border-[rgba(15,23,42,0.1)] bg-[var(--act-mist)] p-4 text-left transition-all hover:border-[var(--act-blue)] hover:bg-[var(--act-sky-50)] disabled:cursor-wait disabled:opacity-60"
          >
            <RoleGlyph role={o.role} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="text-[15px] font-semibold text-[var(--act-ink)]">
                  {o.title}
                </span>
                <span className="text-[11px] text-[var(--act-graphite)]">
                  @{o.username}
                </span>
              </span>
              <span className="mt-0.5 block text-xs text-[var(--act-graphite)]">
                {o.desc}
              </span>
            </span>
            {submitting === o.role ? (
              <Spinner />
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4 flex-none text-[var(--act-graphite)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--act-blue)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            )}
          </button>
        ))}
      </form>

      <button
        type="button"
        onClick={() => {
          setSubmitting(null);
          setError(null);
          setStep("credentials");
        }}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--act-graphite)] transition-colors hover:text-[var(--act-ink)]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Ganti akun
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 flex-none animate-spin text-[var(--act-blue)]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}

function RoleGlyph({ role }: { role: UserRole }) {
  const cfg: Record<UserRole, { bg: string; d: string }> = {
    jobseeker: { bg: "bg-[linear-gradient(140deg,#22C55E,var(--act-blue))]", d: "M12 14a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 0114 0" },
    freelancer: { bg: "bg-[linear-gradient(140deg,#14B8A6,var(--act-iris))]", d: "M4 7h16v12H4zM9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" },
    company: { bg: "bg-[linear-gradient(140deg,#F59E0B,var(--act-magenta))]", d: "M4 20V5a1 1 0 011-1h9a1 1 0 011 1v15M15 9h4a1 1 0 011 1v10M7 8h2M7 12h2M7 16h2" },
    admin: { bg: "bg-[linear-gradient(140deg,#34d399,#059669)]", d: "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" },
  };
  const c = cfg[role];
  return (
    <span className={`inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl text-white ${c.bg}`}>
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={c.d} />
      </svg>
    </span>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="opacity-60">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.28-1.93-6.15-4.53H2.17v2.84A10.99 10.99 0 0 0 12 23Z" />
    </svg>
  );
}
