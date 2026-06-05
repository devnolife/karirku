import Link from "next/link";
import { LandingAnimator } from "@/components/LandingAnimator";
import { ChromeCursor } from "@/components/ChromeCursor";

/* =========================================================
   Karir.ai — Landing V3
   "Studio Edition" — Black chrome / Y2K luxe.
   Jet black, oil-slick iridescent, brushed silver. Cold,
   expensive, precise. A counterpoint to V1 (paper editorial)
   and V2 (warm risograph zine).
   ========================================================= */

export default function LandingV3() {
  return (
    <main className="chr-page chr-grain relative min-h-screen overflow-x-clip">
      <Topband />
      <Nav />
      <Hero />
      <Marquee />
      <Manifest />
      <Capsules />
      <OrbShowcase />
      <Reel />
      <Numerals />
      <Console />
      <Inventory />
      <Booking />
      <NowPlaying />
      <Footstamp />
      <LandingAnimator />
    </main>
  );
}

/* ================== TOPBAND ================== */
function Topband() {
  return (
    <div className="relative z-30 border-b border-[var(--chr-line)] bg-black/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-2 chr-mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--chr-bone-soft)]">
        <div className="flex items-center gap-5">
          <span className="chr-tag chr-tag-live">live · jakarta 04:21</span>
          <span className="hidden md:inline">studio status: open · responding ≤ 12h</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">v3 · studio edition · 04/26</span>
          <Link href="/" className="hover:text-white">↩ v1</Link>
          <Link href="/v2" className="hover:text-white">↩ v2</Link>
          <Link href="/v4" className="hover:text-white">↩ v4</Link>
        </div>
      </div>
    </div>
  );
}

/* ================== NAV ================== */
function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--chr-line)] bg-[var(--chr-void)]/85 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
        <Link href="/v3" className="flex items-baseline gap-3">
          <ChromeMark />
          <span className="chr-display text-[22px] tracking-[-0.05em]">
            karir<span className="chr-text-oil">/</span>ai
          </span>
          <span className="chr-mono ml-2 hidden text-[10px] uppercase tracking-[0.3em] text-[var(--chr-mute)] md:inline">
            studio · 03
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { h: "#manifest", l: "Manifest" },
            { h: "#capsules", l: "Capsules" },
            { h: "#reel", l: "Reel" },
            { h: "#inventory", l: "Inventory" },
            { h: "#booking", l: "Booking" },
          ].map((n) => (
            <a
              key={n.h}
              href={n.h}
              className="chr-mono rounded-full px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[var(--chr-bone-soft)] transition-all hover:bg-white/5 hover:text-white"
            >
              {n.l}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="chr-mono hidden text-[11px] uppercase tracking-[0.18em] text-[var(--chr-bone-soft)] hover:text-white md:inline-block">
            Sign in
          </Link>
          <Link href="/onboarding" className="chr-pill">
            Book a session <ArrowDR className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ================== HERO ================== */
function Hero() {
  return (
    <ChromeCursor>
      <div className="pointer-events-none absolute inset-0 chr-grid" />

      <section className="relative" data-gs="section">
        <div className="mx-auto max-w-[1400px] px-6 pt-14 pb-20 md:pt-24 md:pb-28">
          <div className="grid grid-cols-12 gap-x-6">
            <div className="col-span-12 md:col-span-9">
              <div className="mb-8 flex items-center gap-3">
                <span className="chr-tag chr-tag-live">on air · session 04</span>
                <span className="chr-mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--chr-mute)]">
                  ·  presented by karir/ai
                </span>
              </div>

              <h1
                data-gs="hero-line"
                className="chr-display text-[64px] sm:text-[100px] md:text-[148px] xl:text-[176px]"
              >
                <span className="chr-text-chrome">Career</span>{" "}
                <em className="chr-serif text-[0.92em]" style={{ color: "transparent", WebkitTextStroke: "1px rgba(244,243,238,0.6)" }}>
                  studio
                </em>
                <br />
                <span className="chr-text-chrome">for</span>{" "}
                <span className="chr-text-oil">people</span>
                <br />
                <span className="chr-display-tight chr-text-chrome">who refuse</span>{" "}
                <em className="chr-serif" style={{ color: "var(--chr-amber)" }}>generic</em>.
              </h1>
            </div>

            <div className="col-span-12 md:col-span-3 mt-10 md:mt-2 md:pl-8 md:border-l md:border-[var(--chr-line)]">
              <p data-gs="hero-fade" className="chr-mono text-[11px] uppercase tracking-[0.22em] text-[var(--chr-mute)]">
                ⌘ index ——
              </p>
              <ol className="mt-3 space-y-1 chr-mono text-[12px] uppercase tracking-[0.16em]">
                {[
                  "01 manifest",
                  "02 capsules",
                  "03 reel",
                  "04 numerals",
                  "05 console",
                  "06 inventory",
                  "07 booking",
                ].map((it) => (
                  <li key={it} className="flex items-center gap-2 text-[var(--chr-bone-soft)] hover:text-white">
                    <span className="block h-px w-3 bg-[var(--chr-bone-soft)]" />
                    {it}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 md:col-span-6">
              <p data-gs="hero-fade" className="text-[16px] leading-[1.55] text-[var(--chr-bone-soft)] md:text-[18px]">
                We&rsquo;re a career studio. We don&rsquo;t hand you another job board — we hand you a plan, a copilot, and a deadline. Roadmap mingguan, diagnosa skill-gap, lowongan yang beneran cocok. Dirancang seperti album, dirilis seperti studio.
              </p>

              <div data-gs="hero-fade" className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/onboarding" className="chr-pill">
                  Open the session
                  <ArrowDR className="h-3.5 w-3.5" />
                </Link>
                <Link href="#reel" className="chr-pill-ghost">
                  <PlayMark className="h-3 w-3" /> Watch reel · 60s
                </Link>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6">
              <SpecsBlock />
            </div>
          </div>
        </div>

        {/* giant STUDIO 03 wordmark glitch */}
        <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 select-none">
          <span
            className="chr-glitch chr-display-wide block text-[22vw] leading-none"
            style={{
              color: "transparent",
              WebkitTextStroke: "1px rgba(244,243,238,0.07)",
              letterSpacing: "-0.06em",
            }}
          >
            STUDIO·03
          </span>
        </div>
      </section>
    </ChromeCursor>
  );
}

function SpecsBlock() {
  const rows = [
    { k: "Founded", v: "2026 · Jakarta" },
    { k: "Sessions", v: "2,418 · counting" },
    { k: "Avg match", v: "87% — top decile" },
    { k: "Time to plan", v: "60 seconds flat" },
    { k: "Languages", v: "ID · EN · audio" },
  ];
  return (
    <div className="chr-card rounded-2xl p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between border-b border-[var(--chr-line)] pb-3">
        <span className="chr-mono text-[10.5px] uppercase tracking-[0.2em] text-[var(--chr-mute)]">
          /spec · sheet
        </span>
        <span className="chr-mono text-[10.5px] uppercase tracking-[0.2em]" style={{ color: "var(--chr-cyan)" }}>
          v.03 · 2026.04
        </span>
      </div>
      <dl className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.k} className="flex items-baseline justify-between gap-4 border-b border-dashed border-[var(--chr-line)] pb-2 last:border-0 last:pb-0">
            <dt className="chr-mono text-[11px] uppercase tracking-[0.18em] text-[var(--chr-mute)]">{r.k}</dt>
            <dd className="chr-display text-[18px] tracking-[-0.02em]">{r.v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ================== MARQUEE ================== */
function Marquee() {
  const items = [
    "career studio",
    "no job-board fluff",
    "weekly roadmap",
    "ai diagnosis",
    "human review",
    "60-sec setup",
    "data anda tidak dijual",
    "made in jakarta",
  ];
  return (
    <section className="relative border-y border-[var(--chr-line)] overflow-hidden">
      <div className="flex">
        <div className="chr-marq flex shrink-0 whitespace-nowrap">
          {[...items, ...items, ...items].map((it, i) => (
            <span key={i} className="chr-display-wide flex items-center gap-8 px-6 py-5 text-[28px] md:text-[40px]">
              <span className={i % 2 === 0 ? "chr-text-chrome" : "chr-text-oil"}>{it}</span>
              <span className="chr-serif text-[var(--chr-amber)] text-[0.7em]">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================== MANIFEST ================== */
function Manifest() {
  return (
    <section id="manifest" className="relative" data-gs="section">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-28">
        <SectionTag n="01" k="manifest" />

        <div className="mt-10 grid grid-cols-12 gap-x-6 gap-y-10">
          <h2 className="col-span-12 md:col-span-8 chr-display text-[44px] tracking-[-0.04em] md:text-[88px]">
            We treat your career like a record:{" "}
            <em className="chr-serif" style={{ color: "var(--chr-amber)" }}>plan it</em>,{" "}
            <em className="chr-serif" style={{ color: "var(--chr-magenta)" }}>master it</em>,{" "}
            <em className="chr-serif" style={{ color: "var(--chr-cyan)" }}>release it</em>.
          </h2>

          <div className="col-span-12 md:col-span-4 md:pt-10">
            <p className="text-[15px] leading-[1.65] text-[var(--chr-bone-soft)]">
              No motivasi kosong. No 200-langkah self-help. Cuma satu rencana mingguan, dengan deadline, dengan suara mentor manusia di belakangnya. Kami percaya naik kelas karir itu craft, bukan keberuntungan.
            </p>
            <Link href="#capsules" className="mt-5 inline-flex items-center gap-2 chr-mono text-[11px] uppercase tracking-[0.2em] text-white border-b border-[var(--chr-bone)] pb-1 hover:gap-3 transition-all">
              Lihat capsules <ArrowDR className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================== CAPSULES (FEATURE GRID) ================== */
function Capsules() {
  const caps = [
    {
      n: "A1",
      title: "Roadmap weekly",
      desc: "12-week plan, broken into Monday-morning tasks. Revisable, signed by AI, reviewed by a human mentor.",
      tone: "var(--chr-amber)",
    },
    {
      n: "A2",
      title: "Skill-gap radar",
      desc: "Where you are vs role target. The critical 1-2 gaps highlighted, the noise muted.",
      tone: "var(--chr-cyan)",
    },
    {
      n: "B1",
      title: "Match engine",
      desc: "240 lowongan disaring tiap hari. Yang muncul cuma yang fit ≥ 75%, dengan reasoning.",
      tone: "var(--chr-magenta)",
    },
    {
      n: "B2",
      title: "Course rec",
      desc: "Kursus prioritas — yang paling menggerakkan needle, bukan yang paling laku diiklankan.",
      tone: "var(--chr-blue)",
    },
  ];
  return (
    <section id="capsules" className="relative border-t border-[var(--chr-line)]" data-gs="section">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-28">
        <div className="flex items-end justify-between gap-6 border-b border-[var(--chr-line)] pb-6">
          <SectionTag n="02" k="capsules · four side-A side-B" inline />
          <span className="chr-mono hidden md:inline text-[10.5px] uppercase tracking-[0.2em] text-[var(--chr-mute)]">
            mix &amp; match · or run them all
          </span>
        </div>

        <div className="mt-12 grid grid-cols-12 gap-5" data-gs="stagger-parent">
          {caps.map((c, i) => (
            <article
              key={c.n}
              data-gs="stagger-child"
              className="chr-card col-span-12 md:col-span-6 lg:col-span-3 rounded-2xl p-6 min-h-[300px] flex flex-col"
            >
              <div className="flex items-baseline justify-between">
                <span
                  className="chr-display text-[44px] leading-none"
                  style={{ color: c.tone, fontVariationSettings: '"opsz" 96, "wdth" 75' }}
                >
                  {c.n}
                </span>
                <span className="chr-mono text-[10px] uppercase tracking-[0.22em] text-[var(--chr-mute)]">
                  /{String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="chr-display mt-6 text-[22px] tracking-[-0.03em]">{c.title}</h3>
              <p className="mt-3 text-[13.5px] leading-[1.6] text-[var(--chr-bone-soft)] flex-1">{c.desc}</p>
              <div className="mt-5 flex items-center justify-between border-t border-[var(--chr-line)] pt-4">
                <span className="chr-mono text-[10px] uppercase tracking-[0.2em] text-[var(--chr-mute)]">
                  side {i < 2 ? "a" : "b"} · track 0{i + 1}
                </span>
                <span className="chr-mono text-[16px]" style={{ color: c.tone }}>↗</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================== ORB SHOWCASE ================== */
function OrbShowcase() {
  return (
    <section className="relative border-t border-[var(--chr-line)] overflow-hidden" data-gs="section">
      <div className="mx-auto max-w-[1400px] px-6 py-24 md:py-36 relative">
        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 md:col-span-5 md:order-2 flex justify-center md:justify-end">
            <ConicOrb />
          </div>

          <div className="col-span-12 md:col-span-7 md:order-1">
            <SectionTag n="∞" k="the orb · live signal" />
            <h2 className="chr-display mt-6 text-[44px] tracking-[-0.03em] md:text-[80px]">
              <em className="chr-serif" style={{ color: "var(--chr-cyan)" }}>Listening</em> to the market,
              <br />
              <span className="chr-text-chrome">tuned</span> for you.
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-[1.65] text-[var(--chr-bone-soft)]">
              Setiap minggu, orb mengaudit 12.000+ lowongan publik Indonesia, men-trace pergerakan skill, dan menyelaraskan ulang roadmap kamu. Tanpa kamu mintain.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
              {[
                { l: "audited", v: "12k+", c: "var(--chr-cyan)" },
                { l: "weekly", v: "1×", c: "var(--chr-amber)" },
                { l: "drift", v: "0.4%", c: "var(--chr-magenta)" },
              ].map((s) => (
                <div key={s.l} className="chr-card rounded-xl p-3">
                  <p className="chr-display text-[28px] leading-none" style={{ color: s.c }}>{s.v}</p>
                  <p className="chr-mono mt-2 text-[10px] uppercase tracking-[0.2em] text-[var(--chr-mute)]">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConicOrb() {
  return (
    <div className="relative h-[320px] w-[320px] md:h-[420px] md:w-[420px]">
      {/* outer ring marks */}
      <svg className="absolute inset-0 chr-orb-spin" viewBox="0 0 200 200" aria-hidden style={{ animationDuration: "60s" }}>
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i / 60) * 2 * Math.PI;
          const r1 = 96;
          const r2 = i % 5 === 0 ? 88 : 92;
          const x1 = 100 + Math.cos(a) * r1;
          const y1 = 100 + Math.sin(a) * r1;
          const x2 = 100 + Math.cos(a) * r2;
          const y2 = 100 + Math.sin(a) * r2;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(244,243,238,0.35)" strokeWidth="0.6" />;
        })}
      </svg>

      {/* the orb */}
      <div
        className="absolute inset-8 rounded-full chr-orb-spin"
        style={{
          background:
            "conic-gradient(from 0deg, #6df4d4, #5ca0ff, #ff5cc8, #ffb24a, #6df4d4)",
          filter: "blur(12px) saturate(1.3)",
          opacity: 0.85,
        }}
      />
      <div
        className="absolute inset-10 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #ffffff 0%, rgba(255,255,255,0.6) 8%, rgba(0,0,0,0.4) 50%, #050507 90%)",
          boxShadow: "0 30px 80px -20px rgba(255, 92, 200, 0.4), inset -20px -30px 60px rgba(0,0,0,0.6)",
        }}
      />
      {/* inner shine */}
      <div
        className="absolute h-16 w-20 rounded-full opacity-70"
        style={{
          top: "22%",
          left: "30%",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.9), transparent 70%)",
          filter: "blur(2px)",
        }}
      />
      {/* label */}
      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 chr-mono text-[10px] uppercase tracking-[0.3em] text-[var(--chr-mute)]">
        ◉ orb v0.4 · listening
      </span>
    </div>
  );
}

/* ================== REEL ================== */
function Reel() {
  const tracks = [
    { n: "01", t: "Set goal", time: "0:08", note: "Tell us in your own words. No corporate-speak." },
    { n: "02", t: "AI diagnosa", time: "0:16", note: "Skill gap, level, sensitive points — dissected honestly." },
    { n: "03", t: "Generate plan", time: "0:24", note: "12 weeks, weekly tasks, courses, matches." },
    { n: "04", t: "Ship & track", time: "0:60", note: "Weekly nudge ke WhatsApp. Win kecil dihitung." },
  ];
  return (
    <section id="reel" className="relative border-t border-[var(--chr-line)]" data-gs="section">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-28">
        <div className="flex items-end justify-between gap-6 border-b border-[var(--chr-line)] pb-6">
          <SectionTag n="03" k="the reel · 60 seconds end-to-end" inline />
          <span className="chr-mono hidden md:inline text-[10.5px] uppercase tracking-[0.2em] text-[var(--chr-mute)]">
            avg · 58.4 dtk · n=2.4k
          </span>
        </div>

        <div className="mt-10 grid grid-cols-1 divide-y divide-[var(--chr-line)]" data-gs="stagger-parent">
          {tracks.map((t) => (
            <div
              key={t.n}
              data-gs="stagger-child"
              className="grid grid-cols-12 gap-4 items-center py-6 md:py-8 group hover:bg-white/[0.02] -mx-6 px-6 transition-colors"
            >
              <span className="col-span-2 md:col-span-1 chr-mono text-[11px] uppercase tracking-[0.22em] text-[var(--chr-mute)] group-hover:text-[var(--chr-amber)] transition-colors">
                ▶ {t.n}
              </span>
              <h3 className="col-span-7 md:col-span-4 chr-display text-[26px] tracking-[-0.03em] md:text-[36px]">
                {t.t}
              </h3>
              <p className="col-span-12 md:col-span-5 text-[13.5px] leading-[1.55] text-[var(--chr-bone-soft)]">
                {t.note}
              </p>
              <span className="col-span-3 md:col-span-2 chr-mono text-[12px] uppercase tracking-[0.2em] text-right text-[var(--chr-bone-soft)]">
                {t.time}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--chr-line)] pt-6">
          <span className="chr-mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--chr-mute)]">
            total runtime · 60.0 s
          </span>
          <Link href="/onboarding" className="chr-pill-ghost">
            Side A · play it <ArrowDR className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ================== NUMERALS ================== */
function Numerals() {
  const items = [
    { v: "12", u: "wk", l: "average to target", c: "var(--chr-amber)" },
    { v: "87", u: "%", l: "top-decile match", c: "var(--chr-cyan)" },
    { v: "4.8", u: "/5", l: "beta cohort rating", c: "var(--chr-magenta)" },
    { v: "60", u: "s", l: "first plan rendered", c: "var(--chr-blue)" },
  ];
  return (
    <section className="relative border-t border-[var(--chr-line)] bg-[var(--chr-pitch)]" data-gs="section">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-28">
        <SectionTag n="04" k="numerals · audited monthly" />

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {items.map((s, i) => (
            <div
              key={s.l}
              className={`relative ${i < 3 ? "md:border-r md:border-[var(--chr-line)] md:pr-6" : ""}`}
            >
              <span className="chr-mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--chr-mute)]">
                /n.0{i + 1}
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span
                  data-gs="count"
                  data-to={s.v}
                  className="chr-display text-[88px] leading-none tabular-nums md:text-[132px] chr-text-chrome"
                  style={{ fontVariationSettings: '"opsz" 96, "wdth" 75' }}
                >
                  {s.v}
                </span>
                <span className="chr-serif text-[36px]" style={{ color: s.c }}>{s.u}</span>
              </div>
              <p className="mt-3 chr-mono text-[11px] uppercase tracking-[0.2em] text-[var(--chr-bone-soft)]">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================== CONSOLE (TESTIMONIALS) ================== */
function Console() {
  const t = [
    { q: "Akhirnya ada yang treat my career like craft, bukan project tugas akhir.", n: "Dimas, 26", r: "designer → pm · jakarta", c: "var(--chr-amber)" },
    { q: "I knew exactly what to do on Monday. That alone is the product.", n: "Nabila, 23", r: "fresh grad · bandung", c: "var(--chr-cyan)" },
    { q: "Roadmap-nya kerasa kaya album planning, bukan to-do list.", n: "Arga, 27", r: "growth lead · surabaya", c: "var(--chr-magenta)" },
  ];
  return (
    <section className="relative border-t border-[var(--chr-line)]" data-gs="section">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-28">
        <div className="flex items-end justify-between gap-6 border-b border-[var(--chr-line)] pb-6">
          <SectionTag n="05" k="console · liner notes" inline />
          <span className="chr-mono hidden md:inline text-[10.5px] uppercase tracking-[0.2em] text-[var(--chr-mute)]">
            with consent · names real
          </span>
        </div>

        <div className="mt-10 grid grid-cols-12 gap-5" data-gs="stagger-parent">
          {t.map((x, i) => (
            <blockquote
              key={i}
              data-gs="stagger-child"
              className="chr-card col-span-12 md:col-span-4 rounded-2xl p-7 relative"
            >
              <span
                className="chr-display text-[80px] leading-none absolute -top-4 left-5"
                style={{ color: x.c, opacity: 0.85 }}
              >
                &ldquo;
              </span>
              <p className="chr-display mt-8 text-[20px] leading-[1.25] tracking-[-0.02em] md:text-[22px]">
                {x.q}
              </p>
              <footer className="mt-7 flex items-center gap-3 border-t border-[var(--chr-line)] pt-4">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full chr-mono text-[11px] text-black"
                  style={{ background: x.c }}
                  aria-hidden
                >
                  {x.n[0]}
                </span>
                <span className="chr-mono text-[10.5px] uppercase tracking-[0.18em]">
                  <span className="text-[var(--chr-bone)]">{x.n}</span>
                  <span className="block text-[var(--chr-mute)]">{x.r}</span>
                </span>
                <span className="ml-auto chr-mono text-[10px] uppercase tracking-[0.2em] text-[var(--chr-mute)]">
                  /tr.0{i + 1}
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================== INVENTORY (PATHS) ================== */
function Inventory() {
  const items = [
    "Product Designer", "Frontend Engineer", "Data Analyst", "Product Manager",
    "UX Researcher", "Growth Marketer", "Backend Engineer", "Content Writer",
    "Brand Designer", "DevOps Engineer", "Business Analyst", "Copywriter",
    "Operations Lead", "Motion Designer", "Finance Associate", "Customer Success",
  ];
  const colorFor = (i: number) => {
    const colors = ["var(--chr-cyan)", "var(--chr-amber)", "var(--chr-magenta)", "var(--chr-blue)"];
    return colors[i % colors.length];
  };
  return (
    <section id="inventory" className="relative border-t border-[var(--chr-line)] bg-[var(--chr-pitch)]" data-gs="section">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-28">
        <div className="grid grid-cols-12 gap-6 border-b border-[var(--chr-line)] pb-6">
          <div className="col-span-12 md:col-span-7">
            <SectionTag n="06" k="inventory · 24+ paths · stocked weekly" />
            <h2 className="chr-display mt-6 text-[40px] tracking-[-0.03em] md:text-[64px]">
              <em className="chr-serif" style={{ color: "var(--chr-amber)" }}>Many</em> paths.
              <br />
              <span className="chr-text-chrome">One copilot.</span>
            </h2>
          </div>
          <p className="col-span-12 md:col-span-5 self-end text-[14px] leading-[1.6] text-[var(--chr-bone-soft)]">
            Roadmap, gap, dan match diadaptasi per jalur — dari design sampai data, marketing sampai engineering. Tiap minggu kami tambahkan jalur baru berdasarkan permintaan.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-1 divide-y divide-[var(--chr-line)] md:grid-cols-2 md:gap-x-10 md:divide-y-0">
          {items.map((it, i) => (
            <li
              key={it}
              className="flex items-baseline justify-between gap-4 py-4 group cursor-default md:border-b md:border-[var(--chr-line)]"
            >
              <span className="flex items-baseline gap-4">
                <span className="chr-mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--chr-mute)] tabular-nums">
                  {String(i + 1).padStart(3, "0")}
                </span>
                <span className="chr-display text-[22px] tracking-[-0.02em] group-hover:translate-x-1 transition-transform" style={{ color: i % 4 === 0 ? colorFor(i) : "inherit" }}>
                  {it}
                </span>
              </span>
              <span className="chr-mono text-[10.5px] uppercase tracking-[0.2em] text-[var(--chr-mute)] group-hover:text-white transition-colors">
                /path · open
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <span className="chr-mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--chr-mute)]">
            tech 8 · design 5 · business 7 · creative 4 · adding weekly
          </span>
          <Link href="/onboarding" className="chr-pill-ghost">
            Pick yours <ArrowDR className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ================== BOOKING (FAQ + CTA) ================== */
function Booking() {
  const qa = [
    { q: "How is this different from a job board?", a: "We&rsquo;re not a job board. We build a personal roadmap, diagnose skill-gap, recommend courses — then surface the matches that actually fit." },
    { q: "Is it really free?", a: "Core features (roadmap, gap, match, course rec) are free. Pro tier opt-in nanti, fokus ke mentor manusia." },
    { q: "Where does the data come from?", a: "Aggregated from public Indonesian sources + your own input. Your data is never sold." },
    { q: "Non-tech welcome?", a: "Yes. Marketing, design, finance, ops — semua di-support, bukan cuma tech." },
  ];
  return (
    <section id="booking" className="relative border-t border-[var(--chr-line)]" data-gs="section">
      <div className="mx-auto max-w-[1400px] grid grid-cols-12 gap-6 px-6 py-20 md:py-28">
        <div className="col-span-12 md:col-span-5">
          <SectionTag n="07" k="booking" />
          <h2 className="chr-display mt-6 text-[44px] tracking-[-0.03em] md:text-[80px]">
            <span className="chr-text-chrome">Stop scrolling</span>
            <br />
            <em className="chr-serif" style={{ color: "var(--chr-amber)" }}>job boards.</em>
            <br />
            <span className="chr-text-oil">Start shipping</span>
            <br />
            <em className="chr-serif" style={{ color: "var(--chr-magenta)" }}>your career.</em>
          </h2>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/onboarding" className="chr-pill">
              Book the session
              <ArrowDR className="h-3.5 w-3.5" />
            </Link>
            <Link href="/" className="chr-pill-ghost">
              Browse v1
            </Link>
          </div>
          <p className="mt-5 chr-mono text-[10.5px] uppercase tracking-[0.2em] text-[var(--chr-mute)]">
            free · no card · demo data ok · cancel anytime
          </p>
        </div>

        <div className="col-span-12 md:col-span-7 md:pl-10 md:border-l md:border-[var(--chr-line)]">
          <p className="chr-mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--chr-mute)]">
            ⌘ frequently · queried
          </p>
          <div className="mt-5 grid grid-cols-1 gap-2">
            {qa.map((it, i) => (
              <details
                key={i}
                className="group chr-card rounded-2xl px-5 py-4 open:bg-white/[0.04]"
              >
                <summary className="flex cursor-pointer list-none items-baseline gap-4">
                  <span className="chr-display text-[28px] leading-none" style={{ color: "var(--chr-amber)", fontVariationSettings: '"opsz" 96, "wdth" 75' }}>
                    /{String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 chr-display text-[18px] tracking-[-0.02em]">
                    {it.q}
                  </span>
                  <span className="chr-mono text-[16px] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p
                  className="mt-3 pl-12 text-[13px] leading-[1.65] text-[var(--chr-bone-soft)]"
                  dangerouslySetInnerHTML={{ __html: it.a }}
                />
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================== NOW PLAYING BAR ================== */
function NowPlaying() {
  return (
    <section className="relative border-t border-[var(--chr-line)]" data-gs="section">
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="chr-card rounded-full px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 chr-mono text-[10.5px] uppercase tracking-[0.22em]">
          <span className="chr-tag chr-tag-live">now playing</span>
          <span className="chr-display text-[14px] tracking-[-0.01em] text-white">
            <span className="chr-text-oil">karir/ai</span> · studio edition · side a
          </span>
          <span className="text-[var(--chr-mute)]">— track 03 / 07 — orb tuned at 87 hz —</span>
          <span className="ml-auto text-[var(--chr-bone-soft)]">04:21 · jakarta · open</span>
        </div>
      </div>
    </section>
  );
}

/* ================== FOOTSTAMP ================== */
function Footstamp() {
  return (
    <footer className="relative border-t border-[var(--chr-line)] bg-[var(--chr-pitch)]">
      <div className="mx-auto max-w-[1400px] px-6 py-12">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-5">
            <Link href="/v3" className="flex items-baseline gap-3">
              <ChromeMark />
              <span className="chr-display text-[44px] tracking-[-0.05em]">
                karir<span className="chr-text-oil">/</span>ai
              </span>
            </Link>
            <p className="mt-4 chr-display text-[20px] tracking-[-0.02em] text-[var(--chr-bone-soft)] max-w-md">
              Career studio, jet-black edition. Pressed in Jakarta, mastered in 2026.
            </p>
          </div>

          <div className="col-span-6 md:col-span-2">
            <p className="chr-mono text-[10px] uppercase tracking-[0.22em] text-[var(--chr-mute)] border-b border-[var(--chr-line)] pb-2">
              Sides
            </p>
            <ul className="mt-3 space-y-1.5 chr-mono text-[11px] uppercase tracking-[0.16em]">
              <li><a href="#manifest" className="hover:text-white">A · Manifest</a></li>
              <li><a href="#capsules" className="hover:text-white">A · Capsules</a></li>
              <li><a href="#reel" className="hover:text-white">B · Reel</a></li>
              <li><a href="#inventory" className="hover:text-white">B · Inventory</a></li>
            </ul>
          </div>

          <div className="col-span-6 md:col-span-2">
            <p className="chr-mono text-[10px] uppercase tracking-[0.22em] text-[var(--chr-mute)] border-b border-[var(--chr-line)] pb-2">
              Doors
            </p>
            <ul className="mt-3 space-y-1.5 chr-mono text-[11px] uppercase tracking-[0.16em]">
              <li><Link href="/" className="hover:text-white">v1 · paper</Link></li>
              <li><Link href="/v2" className="hover:text-white">v2 · zine</Link></li>
              <li><Link href="/login" className="hover:text-white">sign in</Link></li>
              <li><Link href="/onboarding" className="hover:text-white">book</Link></li>
            </ul>
          </div>

          <div className="col-span-12 md:col-span-3">
            <p className="chr-mono text-[10px] uppercase tracking-[0.22em] text-[var(--chr-mute)] border-b border-[var(--chr-line)] pb-2">
              Liner
            </p>
            <p className="mt-3 chr-mono text-[10.5px] leading-[1.7] tracking-[0.04em] text-[var(--chr-bone-soft)]">
              Set in Bricolage Grotesque &amp; JetBrains Mono.
              <br />Mastered on jet-black 0.05% oil-slick chrome.
              <br />Dolby AI · 60-second runtime · side a/b.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--chr-line)] pt-5 chr-mono text-[10px] uppercase tracking-[0.22em] text-[var(--chr-mute)]">
          <span>© 2026 karir/ai · studio edition · pressed limited</span>
          <span>chrome: brushed silver · ink: oil-slick · stock: void #050507</span>
        </div>
      </div>
    </footer>
  );
}

/* ================== ICONS ================== */
function ChromeMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 40 40" aria-hidden>
      <defs>
        <linearGradient id="chr-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#9a9a9d" />
          <stop offset="0.55" stopColor="#2a2a2e" />
          <stop offset="1" stopColor="#dcdcde" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="34" height="34" rx="11" fill="url(#chr-g)" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
      <path d="M14 28V13h7a4.5 4.5 0 010 9h-3l5.5 6" stroke="#0a0a0c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
function ArrowDR(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}
function PlayMark(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M7 5v14l12-7z" />
    </svg>
  );
}

/* ================== SECTION TAG HELPER ================== */
function SectionTag({ n, k, inline = false }: { n: string; k: string; inline?: boolean }) {
  return (
    <div className={`flex items-baseline gap-4 ${inline ? "" : ""}`}>
      <span className="chr-display text-[44px] leading-none" style={{ color: "var(--chr-amber)", fontVariationSettings: '"opsz" 96, "wdth" 75' }}>
        §{n}
      </span>
      <span className="block h-px flex-1 max-w-[140px] bg-[var(--chr-line)]" />
      <span className="chr-mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--chr-bone-soft)]">
        {k}
      </span>
    </div>
  );
}
