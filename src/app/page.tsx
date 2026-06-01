import Link from "next/link";
import { LandingAnimator } from "@/components/LandingAnimator";
import { WaitlistForm } from "@/components/WaitlistForm";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-paper text-ink overflow-x-clip">
      <Ticker />
      <Header />
      <Hero />
      <Manifesto />
      <HowItWorks />
      <Features />
      <ForWho />
      <Stats />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
      <LandingAnimator />
    </main>
  );
}

/* =====================================================
   TICKER — top thin strip, mono, slow-moving
   ===================================================== */
function Ticker() {
  const items = [
    "AI CAREER COPILOT",
    "MADE IN JAKARTA",
    "v1.0 — DEMO MODE",
    "ROADMAP IN 60 SEC",
    "SKILL-GAP → ACTION",
    "JOB MATCH · COURSES · INSIGHT",
  ];
  return (
    <div className="ed-hairline-b bg-paper-2 text-ink">
      <div className="overflow-hidden py-2">
        <div className="ed-marquee ed-mono text-[11px] font-medium tracking-[0.18em] text-ink-soft">
          {Array.from({ length: 3 }).flatMap((_, k) =>
            items.map((t, i) => (
              <span key={`${k}-${i}`} className="mx-8 inline-flex items-center gap-3">
                <Asterisk className="h-2.5 w-2.5" />
                {t}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   HEADER — hairline, wordmark, kbd nav
   ===================================================== */
function Header() {
  return (
    <header className="sticky top-0 z-30 bg-paper/60 backdrop-blur-xl ed-hairline-b transition-colors duration-300">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
        {/* Brand */}
        <Link href="/" className="inline-flex items-center gap-2">
          <Monogram />
          <span className="text-[17px] font-semibold tracking-tight">
            Karir<span className="text-pop">.ai</span>
          </span>
          <span className="ed-label ml-2 hidden sm:inline">v1.0</span>
        </Link>

        {/* Translucent navigation list */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {[
            ["Fitur", "#features"],
            ["Cara kerja", "#how"],
            ["Untuk siapa", "#who"],
            ["FAQ", "#faq"],
          ].map(([l, h]) => (
            <a
              key={h}
              href={h}
              className="font-medium text-ink-soft transition-colors hover:text-ink relative group"
            >
              {l}
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-pop transition-all group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Social interactions and actions */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 mr-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Karir.ai"
              title="Instagram"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/[0.08] bg-surface/30 hover:bg-surface/80 hover:scale-105 backdrop-blur-md text-ink-soft hover:text-ink transition-all duration-300"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Karir.ai"
              title="LinkedIn"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/[0.08] bg-surface/30 hover:bg-surface/80 hover:scale-105 backdrop-blur-md text-ink-soft hover:text-ink transition-all duration-300"
            >
              <LinkedInIcon className="h-4 w-4" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter) Karir.ai"
              title="X"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/[0.08] bg-surface/30 hover:bg-surface/80 hover:scale-105 backdrop-blur-md text-ink-soft hover:text-ink transition-all duration-300"
            >
              <XIcon className="h-3 w-3" />
            </a>
          </div>

          <Link
            href="/login"
            className="hidden sm:inline-flex items-center text-sm font-medium text-ink-soft hover:text-ink"
          >
            Masuk
          </Link>
          <Link
            href="/onboarding"
            className="group inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-pop transition-colors shadow-xs"
          >
            Mulai gratis
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* =====================================================
   HERO — giant editorial headline, grid margins
   ===================================================== */
function Hero() {
  return (
    <section className="relative min-h-[95vh] flex flex-col justify-between overflow-hidden ed-hairline-b bg-paper">

      {/* Absolute background image layer with double overlay */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        {/* The beautiful anime meadow background image */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-[1.02]"
          style={{ backgroundImage: "url('/hero/bg-hero.png')" }}
        />

        {/* Soft atmospheric overlay */}
        {/* Soft morning sun sky color overlay to simulate the warm dawn sky glow of Mindloop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-tr from-[#ffecef]/35 via-transparent to-[#e1f0ff]/25 mix-blend-color-burn"
        />

        {/* Dreamy radial glow spotlight behind content */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-linear-to-r from-pop/5 via-acid/5 to-transparent blur-[120px] opacity-70"
        />

        {/* Glass readability layers to blend background toward theme canvas colors */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-r from-paper/92 via-paper/50 to-paper/15"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-paper/30 via-transparent to-paper"
        />
      </div>

      {/* Main hero contents container */}
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-center px-6 pt-16 pb-20 text-center relative z-10 flex-1">

        {/* Glass subscriber count banner with overlapping gradient avatars */}
        <div
          data-gs="hero-fade"
          className="mb-8 inline-flex items-center gap-3 rounded-full border border-ink/[0.08] bg-surface/30 px-4 py-1.5 backdrop-blur-md shadow-xs hover:border-ink/15 hover:bg-surface/50 transition-all duration-300 animate-fade-in"
        >
          {/* Avatar circles stack with premium pastel gradients mimicking faces */}
          <div className="flex -space-x-2">
            <span className="inline-block h-6 w-6 rounded-full border border-paper bg-gradient-to-br from-pop to-violet-300 shadow-xs" />
            <span className="inline-block h-6 w-6 rounded-full border border-paper bg-gradient-to-br from-blush to-orange-200 shadow-xs" />
            <span className="inline-block h-6 w-6 rounded-full border border-paper bg-gradient-to-br from-[#d9ff3c] to-emerald-400 shadow-xs" />
          </div>
          <span className="ed-mono text-[11px] font-medium tracking-wide text-ink-soft">
            <span className="text-ink font-semibold">12,000+</span> profesional karir telah bergabung
          </span>
        </div>

        {/* Breathtaking headline typeset with high styling detail */}
        <h1
          data-gs="hero-line"
          className="max-w-5xl text-center font-semibold tracking-tight text-[44px] leading-[1.02] sm:text-[68px] md:text-[84px] lg:text-[100px] text-ink filter drop-shadow-[0_2px_4px_rgba(255,255,255,0.05)]"
        >
          Karir <span className="ed-serif text-pop">yang ngerti</span> kamu,
          <br className="hidden sm:block" />
          bukan <span className="relative inline-block px-1">
            generic
            <Strike className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 text-blush/80" />
          </span> <span className="ed-serif">job board.</span>
        </h1>

        {/* Sophisticated supporting description */}
        <p
          data-gs="hero-fade"
          className="mt-8 max-w-3xl text-center text-lg md:text-[20px] leading-relaxed text-ink-soft/90 md:leading-[1.6]"
        >
          Tentukan goal, AI susun <em className="ed-serif not-italic text-ink font-medium">roadmap</em>,
          potret <em className="ed-serif text-ink font-medium">skill-gap</em>, kasih{" "}
          <em className="ed-serif text-ink font-medium">job match</em> + kursus prioritas.
          Rapi, terarah, dan ramah manusia — bukan corporate-speak.
        </p>

        {/* Interactive, premium glassmorphism email waitlist input */}
        <div data-gs="hero-fade" className="mt-10 w-full max-w-lg">
          <WaitlistForm />

          {/* Social Proof subtext */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-ink-muted">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Gratis mulai
            </span>
            <span className="opacity-30">·</span>
            <span>Setup 60 detik</span>
            <span className="opacity-30">·</span>
            <span>Khusus Indonesia 🇮🇩</span>
          </div>
        </div>

      </div>

      {/* Floating preview strip, simplified and visually styled just like the Mindloop preview */}
      <div
        className="relative z-10 w-full ed-hairline-t bg-surface/25 backdrop-blur-md"
        data-gs="hero-preview"
      >
        <div className="mx-auto grid max-w-[1400px] grid-cols-12 items-stretch px-6">
          <div className="col-span-12 md:col-span-3 py-5 md:border-r md:ed-rule flex flex-col justify-center">
            <span className="ed-label">Interactive Preview</span>
            <p className="mt-1 text-xs text-ink-soft">
              Real-time career progress tracker, click demo below.
            </p>
          </div>
          <div className="col-span-12 md:col-span-9 py-5 md:pl-8">
            <HeroPreview />
          </div>
        </div>
      </div>

    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-ink bg-surface">
      <div className="flex items-center justify-between ed-hairline-b px-4 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ink/60" />
          <span className="h-2 w-2 rounded-full bg-ink/40" />
          <span className="h-2 w-2 rounded-full bg-ink/20" />
        </div>
        <span className="ed-label">dashboard.karir.ai</span>
        <span className="ed-label">72% ready</span>
      </div>
      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-12 md:col-span-5 p-6 md:border-r md:ed-rule">
          <span className="ed-label">Career readiness</span>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-6xl font-medium tracking-tight ed-num">72</span>
            <span className="ed-serif text-2xl text-pop">%</span>
            <span className="ml-auto rounded-full bg-acid px-2.5 py-0.5 text-xs font-medium">+8 wk</span>
          </div>
          <div className="mt-4 h-[3px] w-full bg-ink/10">
            <div className="h-full bg-pop" style={{ width: "72%" }} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <MiniCell k="Skills" v="8" serifAccent="mapped" />
            <MiniCell k="Jobs" v="12" serifAccent="matched" />
          </div>
        </div>
        <div className="col-span-12 md:col-span-7 p-6">
          <span className="ed-label">Next actions</span>
          <ul className="mt-3 divide-y divide-[var(--rule-soft)]">
            {[
              { n: "01", t: "Finish SQL Joins mini-course", s: "Unlocks Data Analyst track" },
              { n: "02", t: "Apply: Frontend Eng · Tokopedia", s: "Match score 82% — high" },
              { n: "03", t: "Refactor portfolio hero", s: "Skill-signal for hiring" },
            ].map((it) => (
              <li key={it.n} className="flex items-start gap-4 py-3 first:pt-0">
                <span className="ed-label ed-num pt-1">{it.n}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{it.t}</p>
                  <p className="text-xs text-ink-muted">{it.s}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-ink-muted mt-1.5" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MiniCell({ k, v, serifAccent }: { k: string; v: string; serifAccent: string }) {
  return (
    <div>
      <span className="ed-label">{k}</span>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-3xl font-medium ed-num tracking-tight">{v}</span>
        <span className="ed-serif text-sm text-ink-muted">{serifAccent}</span>
      </div>
    </div>
  );
}

/* =====================================================
   MANIFESTO — editorial large-text row
   ===================================================== */
function Manifesto() {
  return (
    <section className="ed-hairline-b" data-gs="section">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6 py-10 md:py-16">
        <div className="col-span-12 md:col-span-2">
          <span className="ed-label">01 / Manifesto</span>
        </div>
        <div className="col-span-12 md:col-span-10">
          <p className="text-2xl font-medium leading-[1.2] tracking-tight sm:text-3xl md:text-4xl">
            Gen Z ga butuh <span className="ed-serif text-ink-muted">another</span> job
            board. Kita butuh <span className="ed-highlight">koordinat</span> —{" "}
            <span className="ed-serif text-pop">di mana gue sekarang</span>, kemana
            langkah berikutnya, dan apa yang bisa gue kerjain{" "}
            <span className="ed-serif">minggu ini</span>.
          </p>
          <div className="mt-10 grid grid-cols-12 gap-6">
            <blockquote className="col-span-12 md:col-span-8 ed-serif text-xl text-ink-soft leading-relaxed">
              &ldquo;Karir.ai bikin proses ganti jalur karir gue bener-bener
              keliatan jalurnya. Bukan sekadar lowongan random.&rdquo;
              <footer className="mt-3 font-sans not-italic text-sm text-ink-muted">
                — Dimas, 26 · product designer in transition
              </footer>
            </blockquote>
            <div className="col-span-12 md:col-span-4 flex items-start md:justify-end">
              <Link
                href="#how"
                className="ed-underline text-sm font-medium text-ink"
              >
                Lihat cara kerjanya ↓
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   HOW IT WORKS — numbered editorial columns
   ===================================================== */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Set goal",
      s: "Pilih role target, level, dan jam belajar. 60 detik, ga lebih.",
    },
    {
      n: "02",
      t: "AI susun plan",
      s: "Roadmap mingguan, skill-gap, dan kursus prioritas dirangkai personal.",
    },
    {
      n: "03",
      t: "Eksekusi & apply",
      s: "Kerjain task, track progress, apply ke lowongan dengan fit paling tinggi.",
    },
  ];
  return (
    <section id="how" className="ed-hairline-b" data-gs="section">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6 py-12 md:py-20">
        <SectionHeader num="02" kicker="Cara kerja" title={<>Tiga langkah — <span className="ed-serif">itu doang.</span></>} />
        <div className="col-span-12 md:col-span-10 md:col-start-3" data-gs="stagger-parent">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--rule)] border-y border-[var(--rule)]">
            {steps.map((s) => (
              <div key={s.n} className="p-8" data-gs="stagger-child">
                <div className="flex items-baseline justify-between">
                  <span className="ed-mono text-xs font-medium tracking-[0.14em] text-pop">{s.n}</span>
                  <span className="ed-label">STEP</span>
                </div>
                <h3 className="mt-6 text-3xl font-medium tracking-tight">
                  {s.t}
                </h3>
                <p className="mt-3 text-ink-soft">{s.s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   FEATURES — editorial bento, hairline dividers
   ===================================================== */
function Features() {
  return (
    <section id="features" className="ed-hairline-b bg-paper-2" data-gs="section">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6 py-12 md:py-20">
        <SectionHeader
          num="03"
          kicker="Fitur"
          title={<>Tools yang <span className="ed-serif">actually</span> kepake.</>}
          sub="Bukan dashboard kosong. Empat fitur yang jalan dari week satu."
        />

        <div className="col-span-12 md:col-span-10 md:col-start-3">
          <div className="grid grid-cols-12 gap-px bg-ink border border-ink overflow-hidden rounded-xl" data-gs="stagger-parent">
            <FeatureTile
              className="col-span-12 md:col-span-7 row-span-2"
              num="01"
              title="Roadmap hidup"
              desc="Bukan PDF statis. Milestone update otomatis setiap skill kamu naik."
              accent="pop"
            >
              <RoadmapPreview />
            </FeatureTile>

            <FeatureTile
              className="col-span-12 md:col-span-5"
              num="02"
              title="Skill-gap analyzer"
              desc="Bandingkan skill kamu vs requirement role target. Tau persis yang perlu di-upgrade."
            >
              <GapPreview />
            </FeatureTile>

            <FeatureTile
              className="col-span-12 md:col-span-5"
              num="03"
              title="Job match"
              desc="Lowongan di-rank by fit kamu — bukan by algoritma random."
              accent="acid"
            >
              <JobsMini />
            </FeatureTile>

            <FeatureTile
              className="col-span-12 md:col-span-6"
              num="04"
              title="Kursus prioritas"
              desc="Rekomendasi spesifik dari gap kamu. Bye, learning overload."
            />

            <FeatureTile
              className="col-span-12 md:col-span-6"
              num="05"
              title="Market insight"
              desc="Demand skill di Indonesia, update mingguan dari data real."
              accent="blush"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureTile({
  className = "",
  num,
  title,
  desc,
  accent,
  children,
}: {
  className?: string;
  num: string;
  title: string;
  desc: string;
  accent?: "pop" | "acid" | "blush";
  children?: React.ReactNode;
}) {
  const dot =
    accent === "pop" ? "bg-pop" : accent === "acid" ? "bg-acid" : accent === "blush" ? "bg-blush" : "bg-ink";
  return (
    <div className={`relative bg-surface p-7 md:p-8 ${className}`} data-gs="stagger-child">
      <div className="flex items-center justify-between">
        <span className="ed-mono text-xs font-medium tracking-[0.14em] text-ink-soft">{num}</span>
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden />
      </div>
      <h3 className="mt-6 text-2xl font-medium tracking-tight md:text-[28px]">{title}</h3>
      <p className="mt-2 max-w-md text-[15px] text-ink-soft">{desc}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

function RoadmapPreview() {
  const rows = [
    { w: "W1–W2", t: "Foundations", p: 100 },
    { w: "W3–W4", t: "Core Skills", p: 65 },
    { w: "W5–W6", t: "Specialization", p: 20 },
  ];
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.t} className="flex items-center gap-4">
          <span className="ed-label w-16 shrink-0">{r.w}</span>
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">{r.t}</span>
              <span className="ed-mono text-xs ed-num text-ink-muted">{r.p}%</span>
            </div>
            <div className="mt-1.5 h-[2px] w-full bg-ink/10">
              <div className="h-full bg-pop" style={{ width: `${r.p}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function GapPreview() {
  const skills = [
    ["SQL", 80, 95],
    ["Python", 65, 85],
    ["Stats", 40, 75],
  ] as const;
  return (
    <div className="space-y-2.5">
      {skills.map(([n, y, r]) => (
        <div key={n} className="flex items-center gap-3 ed-hairline-soft-b pb-2 last:border-0 last:pb-0">
          <span className="flex-1 text-sm font-medium">{n}</span>
          <span className="ed-mono text-xs ed-num text-ink-muted w-16 text-right">
            {y}<span className="opacity-50">/</span>{r}
          </span>
          <div className="w-24 h-[2px] bg-ink/10">
            <div className="h-full bg-ink" style={{ width: `${(y / r) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function JobsMini() {
  const jobs = [
    { c: "Tokopedia", t: "Frontend Engineer", m: 82 },
    { c: "Xendit", t: "React Developer", m: 74 },
  ];
  return (
    <div className="space-y-2">
      {jobs.map((j) => (
        <div key={j.c} className="flex items-center gap-3 ed-hairline-soft-b pb-2 last:border-0 last:pb-0">
          <span className="ed-mono ed-num text-lg font-medium">{j.m}%</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{j.t}</p>
            <p className="ed-label !text-ink-muted">{j.c}</p>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-ink-muted" />
        </div>
      ))}
    </div>
  );
}

/* =====================================================
   FOR WHO — 4-up editorial cards with serif accents
   ===================================================== */
function ForWho() {
  const list = [
    { t: "Mahasiswa tingkat akhir", s: "Bingung pilih karir. Mulai mapping sebelum lulus." },
    { t: "Career switcher", s: "Mau pindah ke tech/data/design. Tau skill yang perlu dibangun." },
    { t: "Junior pro (1–3 thn)", s: "Lompat ke mid/senior dengan plan eksekusi yang jelas." },
    { t: "Freelancer & indie", s: "Positioning skill stack buat dapetin klien premium." },
  ];
  return (
    <section id="who" className="ed-hairline-b" data-gs="section">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6 py-12 md:py-20">
        <SectionHeader
          num="04"
          kicker="Untuk siapa"
          title={<>Di mana kamu <span className="ed-serif">sekarang?</span></>}
        />
        <div className="col-span-12 md:col-span-10 md:col-start-3">
          <ol className="divide-y divide-[var(--rule)] border-y border-[var(--rule)]" data-gs="stagger-parent">
            {list.map((it, i) => (
              <li
                key={it.t}
                data-gs="stagger-child"
                className="grid grid-cols-12 items-baseline gap-6 py-5 transition-colors hover:bg-paper-2"
              >
                <span className="col-span-2 md:col-span-1 ed-mono text-sm font-medium text-pop ed-num">
                  0{i + 1}
                </span>
                <h3 className="col-span-10 md:col-span-5 text-2xl font-medium tracking-tight md:text-3xl">
                  {it.t}
                </h3>
                <p className="col-span-12 md:col-span-5 ed-serif text-lg text-ink-soft md:col-start-8">
                  {it.s}
                </p>
                <ArrowRight className="hidden md:block col-span-1 h-4 w-4 text-ink-muted justify-self-end" />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   STATS — big numeric editorial row
   ===================================================== */
function Stats() {
  const stats = [
    { v: "12k", u: "+", l: "roadmap dibuat" },
    { v: "87", u: "%", l: "clarity dalam <1 minggu" },
    { v: "4.8", u: "/5", l: "rating beta user" },
    { v: "60", u: "dtk", l: "setup time" },
  ];
  return (
    <section className="ed-hairline-b bg-ink text-paper" data-gs="section">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6 py-10 md:py-14">
        <div className="col-span-12 md:col-span-2">
          <span className="ed-label !text-paper/60">05 / Numbers</span>
        </div>
        <div className="col-span-12 md:col-span-10 grid grid-cols-2 gap-y-10 md:grid-cols-4 md:gap-0 md:divide-x md:divide-paper/15">
          {stats.map((s, i) => (
            <div key={s.l} className={`${i > 0 ? "md:pl-8" : ""} ${i < 3 ? "md:pr-4" : ""}`}>
              <div className="flex items-baseline">
                <span
                  data-gs="count"
                  data-to={s.v}
                  className="text-6xl font-medium tracking-tight ed-num md:text-7xl"
                >
                  {s.v}
                </span>
                <span className="ed-serif text-3xl text-acid md:text-4xl">{s.u}</span>
              </div>
              <p className="mt-3 ed-label !text-paper/70">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   TESTIMONIALS — editorial pull quotes
   ===================================================== */
function Testimonials() {
  const items = [
    {
      q: "Roadmap-nya ga maksa. Gue bisa milih pace sendiri tapi tetep tau next step-nya apa.",
      n: "Rania",
      r: "Fresh grad → Data Analyst",
    },
    {
      q: "Skill-gap analyzer itu game changer. Gue berhenti beli kursus random.",
      n: "Dimas",
      r: "FE Dev → Product Designer",
    },
    {
      q: "Job match-nya beneran nyambung sama skill gue. Ga spammy kayak job board lain.",
      n: "Nabila",
      r: "Marketing → Growth",
    },
  ];
  return (
    <section className="ed-hairline-b" data-gs="section">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6 py-12 md:py-20">
        <SectionHeader
          num="06"
          kicker="Testimoni"
          title={<>Real talk <span className="ed-serif">dari real people.</span></>}
        />
        <div className="col-span-12 md:col-span-10 md:col-start-3 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--rule)] border-y border-[var(--rule)]" data-gs="stagger-parent">
          {items.map((t) => (
            <blockquote key={t.n} className="p-8" data-gs="stagger-child">
              <Quote className="h-5 w-5 text-pop" />
              <p className="mt-5 ed-serif text-xl leading-snug text-ink">
                &ldquo;{t.q}&rdquo;
              </p>
              <footer className="mt-8 ed-hairline-t pt-4">
                <p className="text-sm font-semibold">{t.n}</p>
                <p className="ed-label">{t.r}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   FAQ — editorial accordion, hairline
   ===================================================== */
function FAQ() {
  const qa = [
    {
      q: "Apa bedanya Karir.ai sama job board biasa?",
      a: "Kami bukan job board. Kami bikin roadmap personal + skill-gap + rekomendasi kursus, baru nunjukin lowongan yang beneran cocok.",
    },
    {
      q: "Beneran gratis?",
      a: "Mulai dari Rp0. Fitur inti (roadmap, skill-gap, job match, kursus rec) gratis. Nanti ada plan pro opsional.",
    },
    {
      q: "Datanya dari mana?",
      a: "Lowongan + trend skill di-agregasi dari sumber publik di Indonesia + input goal kamu. Privasi kamu ga dijual.",
    },
    {
      q: "Cocok buat non-tech?",
      a: "Cocok. Roadmap support berbagai jalur — marketing, design, finance, ops — ga cuma tech.",
    },
  ];
  return (
    <section id="faq" className="ed-hairline-b" data-gs="section">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6 py-12 md:py-20">
        <SectionHeader num="07" kicker="FAQ" title={<>Pertanyaan <span className="ed-serif">yang sering muncul.</span></>} />
        <div className="col-span-12 md:col-span-10 md:col-start-3 grid grid-cols-1 md:grid-cols-2 gap-x-8 border-y border-[var(--rule)]">
          {qa.map((item, i) => (
            <details key={i} className={`group border-t border-[var(--rule)] first:border-t-0 md:[&:nth-child(2)]:border-t-0 ${i % 2 === 0 ? "md:border-r md:pr-4 md:border-[var(--rule)]" : "md:pl-4"}`}>
              <summary className="flex cursor-pointer list-none items-baseline gap-4 py-5">
                <span className="ed-mono text-sm font-medium text-ink-muted ed-num">
                  0{i + 1}
                </span>
                <span className="flex-1 text-lg font-medium md:text-xl tracking-tight">
                  {item.q}
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink transition-all group-open:bg-ink group-open:text-paper group-open:rotate-45">
                  <Plus className="h-3 w-3" />
                </span>
              </summary>
              <p className="pb-5 pl-9 pr-2 text-sm text-ink-soft leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   CTA — huge inverted editorial block
   ===================================================== */
function CTA() {
  return (
    <section className="relative ed-hairline-b bg-ink text-paper overflow-hidden" data-gs="section">
      <div aria-hidden className="absolute inset-0 ed-grain" />
      <div className="relative mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6 py-16 md:py-24">
        <div className="col-span-12 md:col-span-2">
          <span className="ed-label !text-paper/60">08 / Start</span>
        </div>
        <div className="col-span-12 md:col-span-10">
          <p className="ed-label !text-acid">Ready. Set. Go.</p>
          <h2 data-gs="hero-line" className="mt-6 text-5xl font-medium leading-[0.9] tracking-[-0.03em] sm:text-6xl md:text-[96px]">
            Stop <span className="ed-serif text-blush">nebak-nebak</span>
            <br />
            karir <span className="ed-serif">kamu.</span>
          </h2>
          <div className="mt-12 grid grid-cols-12 gap-6 items-end">
            <p className="col-span-12 md:col-span-5 text-lg text-paper/80 leading-relaxed">
              60 detik bikin roadmap. Langsung tau step berikutnya — bukan lima
              tahun dari sekarang, tapi minggu ini.
            </p>
            <div className="col-span-12 md:col-span-7 md:col-start-7 flex flex-wrap gap-3 md:justify-end">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-full bg-acid px-7 py-4 text-base font-medium text-ink hover:bg-paper transition-colors"
              >
                Mulai sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-full border border-paper/40 px-7 py-4 text-base font-medium text-paper hover:border-paper hover:bg-paper/10 transition-colors"
              >
                Masuk akun
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   FOOTER — structured editorial
   ===================================================== */
function Footer() {
  return (
    <footer className="bg-paper">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6 py-16">
        <div className="col-span-12 md:col-span-5">
          <Link href="/" className="inline-flex items-center gap-2">
            <Monogram />
            <span className="text-lg font-semibold tracking-tight">
              Karir<span className="text-pop">.ai</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm ed-serif text-xl leading-snug text-ink-soft">
            AI Career Copilot untuk Gen Z Indonesia. Roadmap, skill-gap,
            dan job match — <span className="text-ink">in one place.</span>
          </p>
          <p className="mt-6 ed-label">
            Newsletter mingguan — opini karir + lowongan kurasi
          </p>
          <form className="mt-3 flex max-w-sm items-stretch gap-0 ed-hairline-b pb-2">
            <input
              type="email"
              placeholder="kamu@email.com"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-muted"
            />
            <button
              type="button"
              className="ed-mono text-xs font-medium tracking-[0.14em] text-pop hover:text-ink uppercase"
            >
              Subscribe →
            </button>
          </form>
        </div>

        <FooterCol className="col-span-6 md:col-span-2 md:col-start-7" title="Produk" links={[
          ["Fitur", "#features"],
          ["Cara kerja", "#how"],
          ["FAQ", "#faq"],
        ]} />
        <FooterCol className="col-span-6 md:col-span-2" title="Akun" links={[
          ["Mulai", "/onboarding"],
          ["Masuk", "/login"],
          ["Dashboard", "/dashboard"],
        ]} />
        <FooterCol className="col-span-12 md:col-span-2" title="Legal" links={[
          ["Syarat", "#"],
          ["Privasi", "#"],
          ["Kontak", "#"],
        ]} />
      </div>
      <div className="ed-hairline-t">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start gap-2 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="ed-label">
            © {new Date().getFullYear()} Karir.ai · Made in Jakarta 🇮🇩
          </p>
          <p className="ed-label">v1.0 · demo mode</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  className = "",
  title,
  links,
}: {
  className?: string;
  title: string;
  links: [string, string][];
}) {
  return (
    <div className={className}>
      <p className="ed-label">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map(([l, h]) => (
          <li key={h}>
            <Link href={h} className="text-sm font-medium text-ink hover:text-pop">
              {l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* =====================================================
   Shared bits
   ===================================================== */
function SectionHeader({
  num,
  kicker,
  title,
  sub,
}: {
  num: string;
  kicker: string;
  title: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="col-span-12 md:col-span-2">
      <span className="ed-label">
        {num} / {kicker}
      </span>
      <h2 className="mt-4 text-4xl font-medium leading-[0.95] tracking-[-0.025em] sm:text-5xl md:text-[64px] md:leading-[0.92]">
        {title}
      </h2>
      {sub && <p className="mt-5 max-w-md text-ink-soft">{sub}</p>}
    </div>
  );
}

/* =====================================================
   Icons / marks (inline SVG)
   ===================================================== */
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
function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
function Play(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function Quote(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M7 7h4v4H8c0 2 1 3 3 3v2c-3 0-5-2-5-5V7zm8 0h4v4h-3c0 2 1 3 3 3v2c-3 0-5-2-5-5V7z" />
    </svg>
  );
}
function Asterisk(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2v20M3 7l18 10M3 17l18-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
function Strike({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 4"
      preserveAspectRatio="none"
      aria-hidden
      className={className}
    >
      <path d="M0 2 L200 2" stroke="currentColor" strokeWidth="4" fill="none" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 7.69 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.235L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
