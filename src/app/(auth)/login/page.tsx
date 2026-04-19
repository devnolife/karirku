import { signIn } from "@/lib/auth";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <Link href="/" className="mb-6 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold">Masuk ke Karir.ai</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Lanjutkan career copilot-mu. Kami tidak kirim data kamu ke pihak ketiga.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
          className="mt-8"
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <GoogleIcon />
            Masuk dengan Google
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Dengan masuk, kamu setuju{" "}
          <Link href="/terms" className="underline">Syarat</Link> &{" "}
          <Link href="/privacy" className="underline">Privasi</Link>.
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1Z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.28-1.93-6.15-4.53H2.17v2.84A10.99 10.99 0 0 0 12 23Z"/>
      <path fill="#FBBC05" d="M5.85 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.17a11 11 0 0 0 0 9.88l3.68-2.84Z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.22 1.64l3.15-3.15A10.55 10.55 0 0 0 12 1a10.99 10.99 0 0 0-9.83 6.06l3.68 2.84C6.72 7.3 9.14 5.38 12 5.38Z"/>
    </svg>
  );
}
