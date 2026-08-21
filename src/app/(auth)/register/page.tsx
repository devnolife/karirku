import Link from "next/link";
import { RegisterFlow } from "./RegisterFlow";

export const metadata = {
  title: "Daftar · CraftWorks",
  description: "Buat akun CraftWorks untuk mulai menata karir kamu.",
};

export default function RegisterPage() {
  return (
    <main className="app-canvas act-sans relative flex min-h-screen flex-1 items-stretch text-[var(--act-ink)]">
      {/* Kiri — konteks brand */}
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden p-12 md:flex">
        <div className="act-band-sky absolute inset-0 -z-10" />
        <div
          className="absolute inset-0 -z-10 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(620px 360px at 12% -8%, rgba(13,71,161,0.16), transparent 70%), radial-gradient(560px 420px at 92% 108%, rgba(41,99,116,0.14), transparent 70%)",
          }}
        />
        <Link href="/" className="inline-flex items-center gap-2.5">
          <Wordmark />
          <span className="act-heading text-[19px]">
            Craft<span className="text-[var(--act-graphite)]">Works</span>
          </span>
        </Link>

        <div>
          <span className="act-tag">Mulai di sini</span>
          <p className="act-display mt-6 text-[40px] leading-[1.08] text-[var(--act-ink)]">
            Satu profil, <span className="act-sky-text">semua peluang</span> yang
            benar-benar cocok denganmu.
          </p>
          <p className="mt-6 text-[15px] leading-relaxed text-[var(--act-charcoal)]">
            Unggah CV sekali — kami baca kekuatannya, cek keterbacaan ATS, lalu
            cocokkan dengan lowongan yang relevan.
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-[rgba(15,43,61,0.14)] pt-5 text-sm text-[var(--act-graphite)]">
          <span>CraftWorks · v1.0</span>
          <span>2026</span>
        </div>
      </aside>

      {/* Kanan — form */}
      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="act-rise act-card-2 act-rail act-rail-rainbow w-full max-w-md p-8 pt-9 md:p-10">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--act-graphite)] transition-colors hover:text-[var(--act-ink)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Kembali
          </Link>

          <span className="act-eyebrow block">Sign up</span>
          <h1 className="act-display mt-3 text-[40px] leading-[1.04]">
            Buat akun <span className="act-sky-text">CraftWorks</span>
          </h1>
          <RegisterFlow />

          <p className="mt-8 text-xs text-[var(--act-graphite)]">
            Dengan mendaftar, kamu setuju{" "}
            <Link href="/terms" className="font-medium text-[var(--act-ink)] underline underline-offset-2">Syarat</Link>
            {" & "}
            <Link href="/privacy" className="font-medium text-[var(--act-ink)] underline underline-offset-2">Privasi</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}

function Wordmark() {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--act-onyx)] text-white shadow-[var(--act-soft-shadow)]">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 19 L12 5 L19 19" />
        <path d="M8 14 H16" />
      </svg>
    </span>
  );
}
