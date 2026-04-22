import Link from "next/link";
import { LandingAnimator } from "@/components/LandingAnimator";

/* =========================================================
   Karir.ai — Landing V2
   "AI Cockpit" — dark canvas, bento grid, mono accents,
   neon-lime + electric-cyan, terminal cursor typography.
   A deliberate contrast to V1 (editorial paper).
   ========================================================= */

export default function LandingV2() {
  return (
    <main
      className="relative min-h-screen overflow-x-clip font-sans text-zinc-100 antialiased"
      style={{
        background:
          "radial-gradient(1200px 600px at 80% -10%, rgba(88,255,176,0.08), transparent 60%)," +
          "radial-gradient(1000px 500px at 10% 10%, rgba(56,189,248,0.07), transparent 60%)," +
          "#05070a",
      }}
    >
      <Grid />
      <Nav />
      <Hero />
      <LogosStrip />
      <Bento />
      <Flow />
      <Stats />
      <Voices />
      <FaqBlock />
      <FinalCTA />
      <FootLine />
      <LandingAnimator />
    </main>
  );
}

/* ---------------- atmosphere ---------------- */
function Grid() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 opacity-[0.14]"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px)," +
          "linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        maskImage:
          "radial-gradient(ellipse at center, black 40%, transparent 80%)",
      }}
    />
  );
}

/* ---------------- nav ---------------- */
function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#05070a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
        <Link href="/v2" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-mono text-[13px] tracking-[0.08em] text-zinc-200">
            karir<span className="text-lime-300">.ai</span>
          </span>
          <span className="ml-1 rounded-full border border-lime-300/30 bg-lime-300/10 px-2 py-0.5 font-mono text-[10px] font-medium text-lime-300">
            v2
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { h: "#bento", l: "Fitur" },
            { h: "#flow", l: "Flow" },
            { h: "#voices", l: "Suara" },
            { h: "#faq", l: "FAQ" },
          ].map((n) => (
            <a
              key={n.h}
              href={n.h}
              className="rounded-full px-3.5 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
            >
              {n.l}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-3.5 py-1.5 text-sm text-zinc-300 hover:text-white md:inline-block"
          >
            Masuk
          </Link>
          <Link
            href="/onboarding"
            className="group inline-flex items-center gap-1.5 rounded-full bg-lime-300 px-4 py-1.5 text-sm font-medium text-zinc-950 transition-all hover:bg-lime-200 hover:shadow-[0_0_40px_-8px_rgba(190,242,100,0.7)]"
          >
            Start
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ---------------- hero ---------------- */
function Hero() {
  return (
    <section className="relative" data-gs="section">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6 pt-14 pb-10 md:pt-20 md:pb-14">
        <div className="col-span-12 md:col-span-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-xs text-zinc-400">
            <span className="flex h-1.5 w-1.5 rounded-full bg-lime-300 shadow-[0_0_10px_#bef264]" />
            system online · beta/id · 2026.04
          </div>

          <h1
            data-gs="hero-line"
            className="font-medium leading-[0.95] tracking-[-0.035em] text-[44px] sm:text-[68px] md:text-[96px]"
          >
            <span className="text-zinc-100">Career copilot</span>
            <br />
            <span className="bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              buat Gen Z
            </span>
            <span className="text-zinc-100">,</span>
            <br />
            <span className="text-zinc-400">yang beneran</span>{" "}
            <span className="relative inline-block text-zinc-100">
              ngerti
              <span className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-lime-300" />
            </span>
            <span className="ml-1 inline-block w-[0.6ch] translate-y-1 animate-[blink_1s_steps(2)_infinite] bg-lime-300 align-baseline">&nbsp;</span>
          </h1>

          <p
            data-gs="hero-fade"
            className="mt-8 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg"
          >
            <span className="font-mono text-lime-300">&gt;</span> Goal kamu →
            roadmap mingguan. AI potret skill-gap, cocokin lowongan, rec kursus.
            No fluff, no corporate speak.
          </p>

          <div data-gs="hero-fade" className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/onboarding"
              className="group inline-flex items-center gap-2 rounded-full bg-lime-300 px-5 py-3 text-[15px] font-medium text-zinc-950 transition-all hover:bg-lime-200 hover:shadow-[0_0_50px_-8px_rgba(190,242,100,0.8)]"
            >
              Bikin roadmap
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="#bento"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-3 text-[15px] font-medium text-zinc-200 backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/[0.06]"
            >
              <Play className="h-3 w-3" />
              Lihat demo
            </Link>
            <span className="font-mono text-xs text-zinc-500">
              // gratis · no credit card · 60s setup
            </span>
          </div>
        </div>

        {/* Hero side — live terminal card */}
        <div className="col-span-12 md:col-span-4" data-gs="hero-preview">
          <TerminalCard />
        </div>
      </div>
    </section>
  );
}

function TerminalCard() {
  const lines = [
    { k: "goal", v: "product designer → senior" },
    { k: "eta", v: "12 minggu" },
    { k: "skill_gap", v: "3 gaps · 1 kritis" },
    { k: "job_match", v: "87% avg" },
    { k: "next_task", v: "figma variables deep-dive" },
  ];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-sm">
      {/* top bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-lime-300/70" />
        </div>
        <span className="font-mono text-[11px] text-zinc-500">~/roadmap.live</span>
      </div>
      <div className="p-5 font-mono text-[13px] leading-relaxed">
        <p className="text-lime-300">$ karir --plan</p>
        <p className="mt-1 text-zinc-500">analyzing profile… done ✓</p>
        <div className="mt-4 space-y-1.5">
          {lines.map((l) => (
            <div key={l.k} className="flex items-baseline gap-3">
              <span className="w-[90px] shrink-0 text-zinc-500">{l.k}</span>
              <span className="text-zinc-200">{l.v}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-lg border border-lime-300/20 bg-lime-300/5 p-3 text-[12px] text-lime-200">
          <span className="text-lime-300">ai:</span> lu butuh 6 jam/minggu. gue
          susunin slot Rabu & Sabtu. confirm?
        </div>
        <p className="mt-3 text-lime-300">
          $ <span className="ml-1 inline-block h-3.5 w-2 translate-y-0.5 animate-[blink_1s_steps(2)_infinite] bg-lime-300 align-baseline" />
        </p>
      </div>
      {/* glow */}
      <div className="pointer-events-none absolute -bottom-16 left-1/2 h-32 w-[80%] -translate-x-1/2 rounded-full bg-lime-300/20 blur-3xl" />
    </div>
  );
}

/* ---------------- logos strip ---------------- */
function LogosStrip() {
  const items = ["Tokopedia", "GoTo", "Traveloka", "BRI", "Ruangguru", "Bibit", "Xendit", "Flip"];
  return (
    <section className="border-y border-white/[0.06] bg-white/[0.015]" data-gs="section">
      <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-6 py-5 overflow-hidden">
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-500">
          matched · companies
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-8 overflow-hidden">
          <div className="flex animate-[marquee_40s_linear_infinite] items-center gap-10 whitespace-nowrap">
            {[...items, ...items].map((n, i) => (
              <span key={i} className="font-mono text-sm text-zinc-500 hover:text-zinc-200">
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- bento ---------------- */
function Bento() {
  return (
    <section id="bento" className="relative" data-gs="section">
      <div className="mx-auto max-w-[1400px] px-6 py-14 md:py-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-lime-300">
              // modules
            </span>
            <h2 className="mt-3 text-3xl font-medium tracking-tight md:text-5xl">
              Empat modul. <span className="text-zinc-500">Satu copilot.</span>
            </h2>
          </div>
          <p className="hidden max-w-xs text-sm text-zinc-400 md:block">
            Dipakai bareng jadi sistem. Dipakai sendiri-sendiri tetap ngasih
            jawaban konkret.
          </p>
        </div>

        <div
          className="grid grid-cols-12 gap-4"
          data-gs="stagger-parent"
        >
          <BentoCard
            className="col-span-12 md:col-span-7 md:row-span-2 min-h-[340px]"
            tag="01 · roadmap"
            title="Roadmap mingguan, bukan wishlist."
            desc="AI bikinin step kecil tiap minggu — ETA jelas, task yang bisa dikerjain Senin pagi."
            accent="lime"
          >
            <RoadmapViz />
          </BentoCard>

          <BentoCard
            className="col-span-12 md:col-span-5 min-h-[180px]"
            tag="02 · skill gap"
            title="Peta gap, bukan PR numpuk."
            desc="Potret skill kamu vs role target — highlight yang kritis."
            accent="cyan"
          >
            <BarsViz />
          </BentoCard>

          <BentoCard
            className="col-span-6 md:col-span-3 min-h-[180px]"
            tag="03 · match"
            title="Job match 87%"
            desc="Lowongan yang beneran klop."
            accent="amber"
          >
            <MatchDial />
          </BentoCard>

          <BentoCard
            className="col-span-6 md:col-span-2 min-h-[180px]"
            tag="04 · rec"
            title="Kursus prio."
            desc="Yang paling menggerakkan needle."
            accent="rose"
          />

          <BentoCard
            className="col-span-12 md:col-span-12 min-h-[160px]"
            tag="bonus · weekly"
            title="Laporan mingguan kirim ke WhatsApp kamu."
            desc="Progress, win kecil, sama satu hal yang perlu kamu benerin minggu depan."
            accent="lime"
            horizontal
          >
            <WeeklyStrip />
          </BentoCard>
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  className = "",
  tag,
  title,
  desc,
  accent = "lime",
  children,
  horizontal = false,
}: {
  className?: string;
  tag: string;
  title: string;
  desc?: string;
  accent?: "lime" | "cyan" | "amber" | "rose";
  children?: React.ReactNode;
  horizontal?: boolean;
}) {
  const accentMap: Record<string, string> = {
    lime: "text-lime-300 group-hover:shadow-[0_0_60px_-15px_rgba(190,242,100,0.5)]",
    cyan: "text-cyan-300 group-hover:shadow-[0_0_60px_-15px_rgba(103,232,249,0.5)]",
    amber: "text-amber-300 group-hover:shadow-[0_0_60px_-15px_rgba(252,211,77,0.5)]",
    rose: "text-rose-300 group-hover:shadow-[0_0_60px_-15px_rgba(253,164,175,0.5)]",
  };
  return (
    <div
      data-gs="stagger-child"
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.035] to-white/[0.01] p-5 transition-all hover:border-white/20 ${accentMap[accent]} ${className}`}
    >
      <div className={`flex ${horizontal ? "md:flex-row md:items-center md:gap-8" : "flex-col"} h-full`}>
        <div className={horizontal ? "md:flex-1" : ""}>
          <span className={`font-mono text-[10px] uppercase tracking-[0.18em] ${accentMap[accent].split(" ")[0]}`}>
            {tag}
          </span>
          <h3 className="mt-2 text-lg font-medium tracking-tight text-zinc-100 md:text-xl">
            {title}
          </h3>
          {desc && <p className="mt-2 text-sm text-zinc-400">{desc}</p>}
        </div>
        {children && (
          <div className={`mt-4 ${horizontal ? "md:mt-0 md:flex-1" : "flex-1 flex items-end"}`}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

function RoadmapViz() {
  const nodes = [
    { w: "W1", l: "Fundamentals" },
    { w: "W3", l: "Figma variables" },
    { w: "W6", l: "Design system" },
    { w: "W9", l: "Case study" },
    { w: "W12", l: "Interview prep" },
  ];
  return (
    <div className="relative w-full">
      <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-lime-300/40 to-transparent" />
      <div className="relative flex items-center justify-between">
        {nodes.map((n, i) => (
          <div key={n.w} className="flex flex-col items-center gap-2">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full border font-mono text-[10px] ${
                i < 2
                  ? "border-lime-300/60 bg-lime-300/10 text-lime-200"
                  : i === 2
                  ? "border-lime-300 bg-lime-300 text-zinc-950 shadow-[0_0_20px_rgba(190,242,100,0.6)]"
                  : "border-white/15 bg-white/[0.03] text-zinc-500"
              }`}
            >
              {n.w}
            </span>
            <span className="font-mono text-[10px] text-zinc-500">{n.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarsViz() {
  const bars = [
    { l: "Figma", v: 85, g: "cyan" },
    { l: "Motion", v: 40, g: "rose" },
    { l: "Research", v: 60, g: "amber" },
    { l: "Systems", v: 30, g: "rose" },
  ];
  return (
    <div className="space-y-2.5">
      {bars.map((b) => (
        <div key={b.l} className="flex items-center gap-3 font-mono text-[11px]">
          <span className="w-16 shrink-0 text-zinc-500">{b.l}</span>
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={`absolute inset-y-0 left-0 rounded-full ${
                b.g === "cyan" ? "bg-cyan-300" : b.g === "amber" ? "bg-amber-300" : "bg-rose-300"
              }`}
              style={{ width: `${b.v}%` }}
            />
          </div>
          <span className="w-8 text-right tabular-nums text-zinc-300">{b.v}%</span>
        </div>
      ))}
    </div>
  );
}

function MatchDial() {
  return (
    <div className="flex items-end gap-3">
      <div className="relative h-20 w-20">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="rgb(252,211,77)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 42}
            strokeDashoffset={2 * Math.PI * 42 * (1 - 0.87)}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-medium text-amber-200">
          87%
        </span>
      </div>
      <div className="pb-1 text-[11px] text-zinc-500">
        <p>dari 240</p>
        <p>lowongan aktif</p>
      </div>
    </div>
  );
}

function WeeklyStrip() {
  const days = ["S", "S", "R", "K", "J", "S", "M"];
  const vals = [0.3, 0.7, 0.9, 0.5, 0.8, 0.2, 0.4];
  return (
    <div className="flex items-end justify-between gap-2">
      {days.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="relative flex h-16 w-full items-end">
            <div
              className="w-full rounded-md bg-gradient-to-t from-lime-300/80 to-lime-200"
              style={{ height: `${vals[i] * 100}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-zinc-500">{d}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- flow ---------------- */
function Flow() {
  const steps = [
    {
      n: "01",
      t: "Set goal",
      d: "Ceritain kamu mau jadi apa. Dalem bahasa lu sendiri.",
    },
    {
      n: "02",
      t: "AI diagnose",
      d: "Skill gap, level saat ini, titik sensitif dibedah.",
    },
    {
      n: "03",
      t: "Generate plan",
      d: "Roadmap mingguan + kursus prio + lowongan match.",
    },
    {
      n: "04",
      t: "Execute · track",
      d: "Task mingguan, progress kiri-kanan, win kecil dihitung.",
    },
  ];
  return (
    <section id="flow" className="border-y border-white/[0.06] bg-white/[0.015]" data-gs="section">
      <div className="mx-auto max-w-[1400px] px-6 py-14 md:py-20">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-cyan-300">
              // flow
            </span>
            <h2 className="mt-3 text-3xl font-medium tracking-tight md:text-5xl">
              Empat langkah. <span className="text-zinc-500">60 detik.</span>
            </h2>
          </div>
          <span className="font-mono text-xs text-zinc-500">
            avg-time: 58.4s · n=2.4k users
          </span>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4" data-gs="stagger-parent">
          {steps.map((s) => (
            <div
              key={s.n}
              data-gs="stagger-child"
              className="relative bg-[#07090d] p-6 transition-colors hover:bg-[#0b0e14]"
            >
              <span className="font-mono text-xs text-lime-300">{s.n}</span>
              <h3 className="mt-4 text-lg font-medium tracking-tight">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.d}</p>
              <ArrowUpRight className="absolute right-5 top-5 h-4 w-4 text-zinc-600 transition-colors group-hover:text-lime-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- stats ---------------- */
function Stats() {
  const items = [
    { v: "12", u: "+", l: "minggu ke target" },
    { v: "87", u: "%", l: "avg job match" },
    { v: "4.8", u: "/5", l: "rating beta user" },
    { v: "60", u: "dtk", l: "setup waktu" },
  ];
  return (
    <section className="relative" data-gs="section">
      <div className="mx-auto max-w-[1400px] px-6 py-14 md:py-16">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((s) => (
            <div
              key={s.l}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-6"
            >
              <div className="flex items-baseline gap-1">
                <span
                  data-gs="count"
                  data-to={s.v}
                  className="bg-gradient-to-b from-zinc-50 to-zinc-400 bg-clip-text text-5xl font-medium tracking-tight text-transparent tabular-nums md:text-6xl"
                >
                  {s.v}
                </span>
                <span className="font-mono text-lg text-lime-300">{s.u}</span>
              </div>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- voices ---------------- */
function Voices() {
  const t = [
    {
      q: "Akhirnya ada yang nganggep career ganti jalur itu normal, bukan drama.",
      n: "Dimas, 26",
      r: "designer → pm · jakarta",
    },
    {
      q: "Gue tau hari ini harus ngapain. Itu alone udah worth it.",
      n: "Nabila, 23",
      r: "fresh grad · bandung",
    },
    {
      q: "Roadmap-nya kerasa kaya dibikinin mentor, bukan generator.",
      n: "Arga, 27",
      r: "growth lead · surabaya",
    },
  ];
  return (
    <section
      id="voices"
      className="border-y border-white/[0.06] bg-white/[0.015]"
      data-gs="section"
    >
      <div className="mx-auto max-w-[1400px] px-6 py-14 md:py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-cyan-300">
              // voices
            </span>
            <h2 className="mt-3 text-3xl font-medium tracking-tight md:text-5xl">
              Real people. <span className="text-zinc-500">Real talk.</span>
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3" data-gs="stagger-parent">
          {t.map((x, i) => (
            <blockquote
              key={i}
              data-gs="stagger-child"
              className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-6"
            >
              <span className="absolute right-5 top-5 font-mono text-xs text-lime-300/70">
                0{i + 1}
              </span>
              <p className="text-[17px] font-medium leading-[1.4] tracking-tight text-zinc-100">
                &ldquo;{x.q}&rdquo;
              </p>
              <footer className="mt-5 flex items-center gap-3 border-t border-white/[0.06] pt-4">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] font-mono text-xs text-zinc-300"
                  aria-hidden
                >
                  {x.n[0]}
                </span>
                <span className="font-mono text-xs">
                  <span className="text-zinc-200">{x.n}</span>
                  <span className="text-zinc-500"> · {x.r}</span>
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- faq ---------------- */
function FaqBlock() {
  const qa = [
    {
      q: "Bedanya sama job board biasa?",
      a: "Kami bukan job board. Kami bikin roadmap personal + skill-gap + kursus, baru nunjukin lowongan yang beneran cocok.",
    },
    {
      q: "Beneran gratis?",
      a: "Fitur inti (roadmap, gap, match, rec kursus) gratis. Plan pro opsional nanti.",
    },
    {
      q: "Data dari mana?",
      a: "Lowongan + trend skill di-agregasi dari sumber publik Indonesia + input goal kamu. Data lu ga dijual.",
    },
    {
      q: "Cocok buat non-tech?",
      a: "Cocok. Roadmap support marketing, design, finance, ops, bukan cuma tech.",
    },
  ];
  return (
    <section id="faq" data-gs="section">
      <div className="mx-auto max-w-[1400px] px-6 py-14 md:py-20">
        <div className="mb-8">
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-lime-300">
            // faq
          </span>
          <h2 className="mt-3 text-3xl font-medium tracking-tight md:text-5xl">
            Yang sering <span className="text-zinc-500">ditanyain.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {qa.map((it, i) => (
            <details
              key={i}
              className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 open:border-lime-300/30 open:bg-lime-300/[0.04]"
            >
              <summary className="flex cursor-pointer list-none items-baseline gap-4">
                <span className="font-mono text-xs text-lime-300">0{i + 1}</span>
                <span className="flex-1 text-base font-medium tracking-tight text-zinc-100">
                  {it.q}
                </span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 text-zinc-400 transition-all group-open:rotate-45 group-open:border-lime-300 group-open:text-lime-300">
                  <Plus className="h-3 w-3" />
                </span>
              </summary>
              <p className="mt-3 pl-8 text-sm leading-relaxed text-zinc-400">
                {it.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
function FinalCTA() {
  return (
    <section className="relative overflow-hidden" data-gs="section">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(800px 400px at 50% 50%, rgba(190,242,100,0.18), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-[1400px] px-6 py-20 text-center md:py-28">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-lime-300">
          ready when you are
        </span>
        <h2
          data-gs="hero-line"
          className="mx-auto mt-4 max-w-4xl text-5xl font-medium leading-[0.95] tracking-[-0.035em] md:text-[88px]"
        >
          Stop <span className="text-zinc-500">scrolling</span> lowongan.
          <br />
          Start <span className="text-lime-300">shipping</span> karir.
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/onboarding"
            className="group inline-flex items-center gap-2 rounded-full bg-lime-300 px-6 py-3.5 text-base font-medium text-zinc-950 transition-all hover:bg-lime-200 hover:shadow-[0_0_60px_-10px_rgba(190,242,100,0.8)]"
          >
            Bikin roadmap sekarang
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3.5 text-base font-medium text-zinc-200 hover:border-white/30 hover:bg-white/[0.06]"
          >
            Lihat versi 1
          </Link>
        </div>
        <p className="mt-6 font-mono text-xs text-zinc-500">
          gratis · tanpa CC · bisa pakai data mock dulu
        </p>
      </div>
    </section>
  );
}

/* ---------------- foot ---------------- */
function FootLine() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-4 px-6 py-8 font-mono text-xs text-zinc-500 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Logo />
          <span>karir.ai — v2 cockpit build · © 2026</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/" className="hover:text-zinc-200">/ v1</Link>
          <a href="#bento" className="hover:text-zinc-200">modules</a>
          <a href="#faq" className="hover:text-zinc-200">faq</a>
          <Link href="/login" className="hover:text-zinc-200">login</Link>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- icons ---------------- */
function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="2" y="2" width="36" height="36" rx="10" stroke="rgb(190 242 100)" strokeWidth="2" />
      <path d="M12 28V12h7a5 5 0 010 10h-3l6 6" stroke="rgb(190 242 100)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
function ArrowUpRight(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}
function Play(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function Plus(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
