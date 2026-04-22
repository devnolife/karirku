import { signInDemo } from "@/lib/mock/session";
import { redirect } from "next/navigation";
import Link from "next/link";

async function signInAction() {
  "use server";
  await signInDemo();
  redirect("/dashboard");
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-1 items-stretch bg-paper text-ink">
      {/* Left — editorial context */}
      <aside className="hidden md:flex md:w-[42%] flex-col justify-between border-r border-[var(--rule)] bg-paper-2 p-10">
        <Link href="/" className="inline-flex items-center gap-2">
          <Monogram />
          <span className="text-[17px] font-semibold tracking-tight">
            Karir<span className="text-pop">.ai</span>
          </span>
        </Link>
        <div>
          <span className="ed-label">00 / Welcome back</span>
          <p className="mt-6 ed-serif text-5xl leading-[0.95] tracking-tight text-ink">
            &ldquo;Karir bukan <span className="text-pop">lomba</span>, tapi{" "}
            navigasi. Kamu cuma butuh peta yang jujur.&rdquo;
          </p>
          <p className="mt-6 ed-label">— manifesto karir.ai</p>
        </div>
        <div className="ed-hairline-t pt-4 flex items-center justify-between">
          <span className="ed-label">demo mode · v1.0</span>
          <span className="ed-label">apr 2026</span>
        </div>
      </aside>

      {/* Right — form */}
      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="ed-label mb-10 inline-flex items-center gap-1.5 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Kembali
          </Link>

          <span className="ed-label">Sign in</span>
          <h1 className="mt-4 text-5xl font-medium leading-[0.95] tracking-[-0.02em]">
            Masuk ke <span className="ed-serif text-pop">Karir.ai</span>
          </h1>
          <p className="mt-4 text-ink-soft">
            Versi demo — jalan tanpa database & OAuth. Masuk sebagai demo user
            untuk explore dashboard.
          </p>

          <form action={signInAction} className="mt-10 space-y-3">
            <button
              type="submit"
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-base font-medium text-paper hover:bg-pop transition-colors"
            >
              Masuk sebagai demo user
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>

            <button
              type="button"
              disabled
              className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-full border border-[var(--rule)] bg-surface text-sm font-medium text-ink-muted"
            >
              <GoogleIcon />
              Google — nonaktif di demo
            </button>
          </form>

          <div className="mt-8 ed-hairline-t pt-5">
            <span className="ed-label">Akun demo</span>
            <p className="mt-2 text-sm">
              <span className="ed-mono font-medium">dimas@karir.ai</span> — sudah
              ada goal, skills, & learning path dummy biar dashboard-nya
              hidup dari detik pertama.
            </p>
          </div>

          <p className="mt-10 ed-label">
            Dengan masuk, kamu setuju{" "}
            <Link href="#" className="text-ink ed-underline">Syarat</Link>
            {" & "}
            <Link href="#" className="text-ink ed-underline">Privasi</Link>.
          </p>
        </div>
      </section>
    </main>
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

function Monogram() {
  return (
    <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-ink bg-surface text-ink">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 19 L12 5 L19 19" />
        <path d="M8 14 H16" />
      </svg>
    </span>
  );
}
