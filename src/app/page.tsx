import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex-1">
      <SiteHeader />
      <Hero />
      <TrustedStrip />
      <HowItWorks />
      <Features />
      <ForWho />
      <Stats />
      <FAQ />
      <CTABanner />
      <SiteFooter />
    </main>
  );
}

/* ------------------------------ HEADER ------------------------------ */

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/70 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <LogoMark />
          <span className="text-base">
            Karir<span className="text-indigo-600 dark:text-indigo-400">.ai</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-zinc-600 dark:text-zinc-400 md:flex">
          <a href="#cara-kerja" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Cara kerja
          </a>
          <a href="#fitur" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Fitur
          </a>
          <a href="#faq" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden h-9 items-center justify-center rounded-full px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 sm:inline-flex"
          >
            Masuk
          </Link>
          <Link
            href="/login"
            className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Mulai gratis
          </Link>
        </div>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/30">
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
        <path
          d="M4 17V7l4 6 4-10 4 10 4-6v10"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/* ------------------------------- HERO ------------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* background glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-[-10%] h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-400/30 via-violet-400/20 to-transparent blur-3xl dark:from-indigo-500/20 dark:via-violet-500/10" />
        <div className="absolute right-[-10%] top-[40%] h-[320px] w-[320px] rounded-full bg-gradient-to-br from-sky-400/20 to-transparent blur-3xl dark:from-sky-500/10" />
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          }}
        />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-20 text-center sm:pt-28">
        <span className="kai-fade-up inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-1.5 text-xs font-medium text-indigo-700 shadow-sm backdrop-blur dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 [animation:kai-pulse-ring_1.8s_ease-out_infinite]" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
          </span>
          Beta — untuk pasar kerja Indonesia
        </span>

        <h1 className="kai-fade-up mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
          AI Career Copilot yang nemenin kamu sampai{" "}
          <span className="relative inline-block bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-fuchsia-400">
            dapat kerja
            <svg
              aria-hidden
              viewBox="0 0 300 12"
              className="absolute left-0 right-0 top-full mt-1 w-full"
            >
              <path
                d="M2 8 C 80 2, 180 12, 298 4"
                stroke="url(#u)"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <defs>
                <linearGradient id="u" x1="0" x2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          .
        </h1>

        <p className="kai-fade-up mt-6 max-w-2xl text-pretty text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
          Karir.ai bukan job board. Ini pelatih karir AI yang ngelihat pasar kerja
          Indonesia real-time, tahu skill apa yang kamu kurang, kasih roadmap +
          course yang pas (Dicoding, Prakerja, Coursera), dan bantu apply saat
          kamu ready.
        </p>

        <div className="kai-fade-up mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 px-8 text-base font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-xl hover:shadow-indigo-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950"
          >
            Mulai gratis
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4 transition group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              <path
                d="M5 12h14M13 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link
            href="#cara-kerja"
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 bg-white/60 px-8 text-base font-medium backdrop-blur transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/40 dark:hover:bg-zinc-900"
          >
            Lihat cara kerjanya
          </Link>
        </div>

        <p className="mt-5 text-xs text-zinc-500 dark:text-zinc-500">
          Gratis selamanya untuk fitur inti · Tanpa kartu kredit
        </p>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="kai-fade-up relative mx-auto mt-16 w-full max-w-4xl">
      <div className="absolute inset-x-8 -bottom-6 h-16 rounded-full bg-indigo-500/20 blur-2xl dark:bg-indigo-500/30" />
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/40">
        <div className="flex items-center gap-1.5 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 text-xs text-zinc-500">karir.ai / dashboard</span>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <div className="sm:col-span-2 rounded-xl border border-zinc-200 bg-gradient-to-br from-indigo-50 to-white p-5 text-left dark:border-zinc-800 dark:from-indigo-950/40 dark:to-zinc-950">
            <div className="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Target role
            </div>
            <div className="mt-1 text-lg font-semibold">Frontend Engineer</div>
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>Readiness score</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  72%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  style={{ width: "72%" }}
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              {[
                { k: "React", v: 88, tone: "emerald" },
                { k: "TypeScript", v: 64, tone: "amber" },
                { k: "Testing", v: 32, tone: "rose" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="rounded-lg border border-zinc-200 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="text-zinc-500">{s.k}</div>
                  <div
                    className={`mt-0.5 font-semibold ${
                      s.tone === "emerald"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : s.tone === "amber"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {s.v}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 text-left dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-xs font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Next up
            </div>
            <ul className="mt-3 space-y-3 text-sm">
              {[
                "Kursus: Jest & RTL — Dicoding",
                "Mini project: Todo dengan tests",
                "Mock interview: React hooks",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
                  <span className="text-zinc-700 dark:text-zinc-300">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- TRUSTED STRIP --------------------------- */

function TrustedStrip() {
  const partners = ["Dicoding", "Prakerja", "Coursera", "LinkedIn", "Kalibrr"];
  return (
    <section className="border-y border-zinc-200 bg-white py-10 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-500">
          Terintegrasi dengan ekosistem belajar & hiring Indonesia
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-80 grayscale">
          {partners.map((p) => (
            <span
              key={p}
              className="text-lg font-semibold text-zinc-400 dark:text-zinc-500"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- HOW IT WORKS --------------------------- */

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

function HowItWorks() {
  return (
    <section id="cara-kerja" className="bg-zinc-50 py-24 dark:bg-zinc-900/40">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            Cara kerja
          </span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Loop yang bikin kamu{" "}
            <span className="text-indigo-600 dark:text-indigo-400">grow</span>.
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Enam langkah yang jalan terus — bukan sekali setup. Makin kamu
            progress, makin tajam saran Karir.ai.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, idx) => (
            <div
              key={step.title}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-indigo-800"
            >
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-indigo-500/10 blur-2xl transition group-hover:bg-indigo-500/20" />
              <div className="relative flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white shadow-sm">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Step {idx + 1}
                </div>
              </div>
              <h3 className="relative mt-4 text-lg font-semibold">
                {step.title}
              </h3>
              <p className="relative mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- FEATURES ----------------------------- */

function Features() {
  return (
    <section id="fitur" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
            Fitur
          </span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Semua yang kamu butuh — dalam satu tempat.
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-6">
          <FeatureCard
            className="md:col-span-4"
            eyebrow="Market Scan"
            title="Lihat pasar kerja real-time."
            desc="Crawler kami baca ribuan lowongan dari platform populer Indonesia tiap hari. Kamu tahu skill apa yang naik, gaji median, dan perusahaan mana yang lagi hiring."
          >
            <div className="mt-6 grid grid-cols-4 items-end gap-2">
              {[40, 64, 52, 80, 48, 72, 90, 60].map((h, i) => (
                <div
                  key={i}
                  className="rounded-md bg-gradient-to-t from-indigo-500/70 to-violet-400/70"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
          </FeatureCard>

          <FeatureCard
            className="md:col-span-2"
            eyebrow="Gap Analysis"
            title="Tahu persis apa yang kurang."
            desc="Ranked skill gap berdasarkan bobot pasar, bukan tebakan."
          >
            <ul className="mt-5 space-y-2 text-sm">
              {[
                ["Testing", "rose"],
                ["TypeScript", "amber"],
                ["System design", "emerald"],
              ].map(([name, tone]) => (
                <li
                  key={name}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white/60 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/40"
                >
                  <span>{name}</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      tone === "rose"
                        ? "bg-rose-500"
                        : tone === "amber"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  />
                </li>
              ))}
            </ul>
          </FeatureCard>

          <FeatureCard
            className="md:col-span-2"
            eyebrow="Personalized Path"
            title="Roadmap yang cocok buat kamu."
            desc="Course dari Dicoding, Prakerja, Coursera — dipilih sesuai gap & budget."
          >
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              {["Dicoding", "Prakerja", "Coursera", "YouTube"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {t}
                </span>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard
            className="md:col-span-4"
            eyebrow="Apply Assistant"
            title="Resume & cover letter auto-tailored."
            desc="AI re-write resume kamu sesuai JD. Hasil apply masuk ke loop — kalau ditolak, Karir.ai bantu analisa kenapa."
          >
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="font-medium text-zinc-500">Generic CV</div>
                <div className="mt-1 h-1.5 w-1/2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="mt-1.5 h-1.5 w-2/3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="mt-1.5 h-1.5 w-1/3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              </div>
              <div className="rounded-lg border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-3 dark:border-indigo-900/60 dark:from-indigo-950/50 dark:to-violet-950/50">
                <div className="font-medium text-indigo-700 dark:text-indigo-300">
                  Tailored
                </div>
                <div className="mt-1 h-1.5 w-5/6 rounded-full bg-indigo-400/70" />
                <div className="mt-1.5 h-1.5 w-4/6 rounded-full bg-indigo-400/70" />
                <div className="mt-1.5 h-1.5 w-3/4 rounded-full bg-indigo-400/70" />
              </div>
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  className = "",
  eyebrow,
  title,
  desc,
  children,
}: {
  className?: string;
  eyebrow: string;
  title: string;
  desc: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 ${className}`}
    >
      <div className="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
        {eyebrow}
      </div>
      <h3 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {desc}
      </p>
      {children}
    </div>
  );
}

/* ------------------------------ FOR WHO ------------------------------ */

function ForWho() {
  const audiences = [
    {
      title: "Fresh graduate",
      desc: "Belum tahu mau kemana, butuh arah dari 0.",
      icon: "🎓",
    },
    {
      title: "Career switcher",
      desc: "Pindah field, mau tahu skill mana yang transferable.",
      icon: "🔀",
    },
    {
      title: "Upskiller",
      desc: "Udah kerja, mau naik level atau naik gaji.",
      icon: "🚀",
    },
    {
      title: "Freelancer",
      desc: "Cari project pertama atau klien yang lebih baik.",
      icon: "💼",
    },
  ];
  return (
    <section className="border-y border-zinc-200 bg-gradient-to-b from-white via-indigo-50/30 to-white py-24 dark:border-zinc-800 dark:from-zinc-950 dark:via-indigo-950/10 dark:to-zinc-950">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Cocok kalau kamu...
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((a) => (
            <div
              key={a.title}
              className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="text-2xl" aria-hidden>
                {a.icon}
              </div>
              <div className="mt-3 font-semibold">{a.title}</div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {a.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- STATS ------------------------------- */

function Stats() {
  const stats = [
    { k: "12K+", v: "Lowongan dianalisis tiap minggu" },
    { k: "500+", v: "Course terkurasi dari mitra lokal" },
    { k: "6 loop", v: "Iterasi berkelanjutan sampai kerja" },
  ];
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-6 rounded-3xl border border-zinc-200 bg-zinc-50 p-10 sm:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-900/40">
          {stats.map((s) => (
            <div key={s.k} className="text-center sm:text-left">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl dark:from-indigo-400 dark:to-violet-400">
                {s.k}
              </div>
              <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {s.v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- FAQ -------------------------------- */

const FAQS = [
  {
    q: "Apakah Karir.ai gratis?",
    a: "Iya, fitur inti (assess, market scan, gap analysis, roadmap) gratis selamanya. Fitur premium seperti mock interview AI tersedia opsional.",
  },
  {
    q: "Ini job board, ya?",
    a: "Bukan. Karir.ai adalah pelatih karir — kami bantu kamu jadi kandidat yang kuat dulu, baru apply ke platform pilihan kamu.",
  },
  {
    q: "Data saya aman?",
    a: "CV dan data kamu hanya dipakai untuk personalisasi. Kami tidak jual data ke pihak ketiga, dan kamu bisa hapus kapan saja.",
  },
  {
    q: "Apakah cocok untuk non-tech?",
    a: "Cocok. Roadmap dan course dikurasi lintas bidang: marketing, design, finance, ops, dan lainnya.",
  },
];

function FAQ() {
  return (
    <section id="faq" className="border-t border-zinc-200 py-24 dark:border-zinc-800">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Pertanyaan yang sering muncul
          </h2>
        </div>
        <div className="mt-10 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {FAQS.map((item, i) => (
            <details key={i} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-left font-medium">
                {item.q}
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition group-open:rotate-45 dark:border-zinc-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-3.5 w-3.5"
                    aria-hidden
                  >
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- CTA BANNER ----------------------------- */

function CTABanner() {
  return (
    <section className="px-6 pb-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-8 py-16 text-center text-white shadow-2xl shadow-indigo-500/30 sm:px-16">
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
            backgroundSize: "80px 80px, 60px 60px",
          }}
        />
        <div className="relative">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Siap mulai loop karirmu?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Onboarding cuma 2 menit. Kamu langsung dapat readiness score dan
            roadmap pertama.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-medium text-indigo-700 shadow-lg transition hover:bg-zinc-100"
            >
              Mulai gratis
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4"
                aria-hidden
              >
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href="#cara-kerja"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 text-base font-medium text-white backdrop-blur transition hover:bg-white/20"
            >
              Pelajari dulu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ FOOTER ------------------------------ */

function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-10 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <LogoMark />
          <span>
            © {new Date().getFullYear()} Karir.ai — dibuat untuk pasar kerja
            Indonesia.
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Privasi
          </a>
          <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Ketentuan
          </a>
          <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Kontak
          </a>
        </div>
      </div>
    </footer>
  );
}
