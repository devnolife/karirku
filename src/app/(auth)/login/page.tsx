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
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-20">
      {/* decorative bg */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-400/25 via-violet-400/15 to-transparent blur-3xl dark:from-indigo-500/15 dark:via-violet-500/10" />
      </div>

      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Kembali
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Mode demo — UI/UX preview
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            Masuk ke Karir.ai
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Versi ini jalan tanpa database/OAuth. Klik tombol di bawah untuk
            masuk sebagai user demo dan explore dashboard.
          </p>

          <form action={signInAction} className="mt-6 space-y-3">
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 px-4 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Masuk sebagai demo user
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              type="button"
              disabled
              className="inline-flex h-11 w-full cursor-not-allowed items-center justify-center gap-3 rounded-full border border-zinc-200 bg-white/60 px-4 text-sm font-medium text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/40"
            >
              <GoogleIcon />
              Google (nonaktif di mode demo)
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-dashed border-zinc-200 bg-zinc-50/60 p-3 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
            <div className="font-medium text-zinc-700 dark:text-zinc-300">
              Akun demo
            </div>
            <div className="mt-1">
              <span className="font-mono">dimas@karir.ai</span> — sudah
              dilengkapi goal, skills, dan learning path dummy biar dashboard
              keliatan hidup.
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-zinc-500">
            Dengan masuk, kamu setuju{" "}
            <Link href="#" className="underline">
              Syarat
            </Link>{" "}
            &{" "}
            <Link href="#" className="underline">
              Privasi
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.28-1.93-6.15-4.53H2.17v2.84A10.99 10.99 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.85 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.17a11 11 0 0 0 0 9.88l3.68-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.07.56 4.22 1.64l3.15-3.15A10.55 10.55 0 0 0 12 1a10.99 10.99 0 0 0-9.83 6.06l3.68 2.84C6.72 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
