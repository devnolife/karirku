import Link from "next/link";
import { LoginFlow } from "./LoginFlow";

export default function LoginPage() {
  return (
    <main className="app-canvas act-sans relative flex min-h-screen flex-1 items-stretch text-[var(--act-ink)]">
      {/* Left — brand context */}
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden p-12 md:flex">
        <div className="act-band-sky absolute inset-0 -z-10" />
        <div
          className="absolute inset-0 -z-10 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(620px 360px at 12% -8%, rgba(25,143,56,0.18), transparent 70%), radial-gradient(560px 420px at 92% 108%, rgba(15,118,110,0.14), transparent 70%)",
          }}
        />
        <Link href="/" className="inline-flex items-center gap-2.5">
          <Wordmark />
          <span className="act-heading text-[19px]">
            Craft<span className="text-[var(--act-graphite)]">Works</span>
          </span>
        </Link>

        <div>
          <span className="act-tag">Welcome back</span>
          <p className="act-display mt-6 text-[40px] leading-[1.08] text-[var(--act-ink)]">
            Karir bukan{" "}
            <span className="act-sky-text">lomba</span>, tapi navigasi. Kamu cuma
            butuh peta yang jujur.
          </p>
          <p className="act-script mt-6 text-2xl text-[var(--act-iris)]">
            — manifesto CraftWorks
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-[rgba(25,143,56,0.16)] pt-5 text-sm text-[var(--act-graphite)]">
          <span>Demo mode · v1.0</span>
          <span>Apr 2026</span>
        </div>
      </aside>

      {/* Right — form */}
      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="act-rise act-card-2 act-rail act-rail-rainbow w-full max-w-md p-8 pt-9 md:p-10">
          <Link
            href="/"
            className="mb-9 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--act-graphite)] transition-colors hover:text-[var(--act-ink)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Kembali
          </Link>

          <span className="act-eyebrow block">Sign in</span>
          <h1 className="act-display mt-3 text-[44px] leading-[1.04]">
            Masuk ke <span className="act-sky-text">CraftWorks</span>
          </h1>
          <LoginFlow />

          <p className="mt-8 text-xs text-[var(--act-graphite)]">
            Dengan masuk, kamu setuju{" "}
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
