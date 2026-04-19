import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex-1">
      <section className="mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        <span className="mb-6 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-xs font-medium uppercase tracking-wider text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
          Beta — untuk pasar kerja Indonesia
        </span>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          AI Career Copilot yang nemenin kamu sampai{" "}
          <span className="text-indigo-600 dark:text-indigo-400">dapat kerja</span>.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Karir.ai bukan job board. Ini pelatih karir AI yang ngelihat pasar kerja
          Indonesia real-time, tahu apa yang kamu kurang, kasih roadmap + course yang
          pas (Dicoding, Prakerja, Coursera), dan bantu apply saat kamu ready.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-full bg-indigo-600 px-8 text-base font-medium text-white transition hover:bg-indigo-700"
          >
            Mulai gratis
          </Link>
          <Link
            href="#cara-kerja"
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-8 text-base font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Cara kerjanya
          </Link>
        </div>
      </section>

      <section
        id="cara-kerja"
        className="border-t border-zinc-200 bg-zinc-50 py-24 dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold">Loop yang bikin kamu grow</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step, idx) => (
              <div
                key={step.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="mb-3 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  Step {idx + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const STEPS = [
  { title: "Assess", desc: "AI tanya skill & aspirasi, scan CV/LinkedIn kamu." },
  { title: "Market Scan", desc: "Analisis ribuan lowongan nyata untuk target role kamu." },
  { title: "Gap Analysis", desc: "Ranked skill gap — apa yang kurang, seberapa penting." },
  {
    title: "Personalized Path",
    desc: "Roadmap bertahap + course terpilih dari Dicoding/Prakerja/dll.",
  },
  { title: "Progress & Readiness", desc: "Tracker mingguan, skor kesiapan real-time." },
  { title: "Apply + Feedback", desc: "Resume/proposal tailored, hasil masuk ke loop." },
];
