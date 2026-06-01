import Link from "next/link";
import { LandingAnimator } from "@/components/LandingAnimator";

/* =========================================================
   Karir.ai — Landing V2
   "Almanak Karir 2026" — Risograph zine.
   Cream stock, tangerine ink, oxblood shadows, ultramarine
   accent. Wonky display serif. Newsprint marginalia.
   A loud, hand-printed counterpoint to V1's clean editorial.
   ========================================================= */

export default function LandingV2() {
  return (
    <main className="riso-page riso-grain relative min-h-screen overflow-x-clip">
      <SideRail />
      <Masthead />
      <Hero />
      <Ticker />
      <Almanac />
      <Forecast />
      <Method />
      <Voices />
      <Paths />
      <Numerology />
      <Inquiries />
      <FinalStamp />
      <Colophon />
      <LandingAnimator />
    </main>
  );
}

/* ================== SIDE RAIL ================== */
function SideRail() {
  return (
    <aside className="pointer-events-none fixed left-0 top-0 z-30 hidden h-screen w-10 lg:flex flex-col items-center justify-between border-r border-[var(--riso-rule)] py-6">
      <span className="riso-mono text-[10px] tracking-[0.25em] [writing-mode:vertical-rl] rotate-180">
        ALMANAK / KARIR / 2026
      </span>
      <div className="flex flex-col items-center gap-3">
        <span className="block h-12 w-[1px] bg-[var(--riso-ink)]" />
        <span className="riso-mono text-[10px] tracking-[0.2em] [writing-mode:vertical-rl] rotate-180">
          ED · IV
        </span>
      </div>
      <span className="riso-mono text-[10px] tracking-[0.25em] [writing-mode:vertical-rl] rotate-180">
        EDISI · TANGERINE
      </span>
    </aside>
  );
}

/* ================== MASTHEAD ================== */
function Masthead() {
  return (
    <header className="relative z-20 border-b-[3px] border-double border-[var(--riso-ink)] lg:ml-10">
      <div className="border-b border-[var(--riso-ink)]">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-6 py-2.5">
          <div className="flex items-center gap-3 riso-mono text-[10px] tracking-[0.2em] uppercase">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--riso-tangerine)]" />
            <span>Selasa · 28 April 2026</span>
            <span className="hidden text-[var(--riso-ink-mute)] md:inline">·</span>
            <span className="hidden md:inline">Cuaca karir: cerah berawan, peluang naik 18%</span>
          </div>
          <div className="flex items-center gap-3 riso-mono text-[10px] tracking-[0.2em] uppercase">
            <Link href="/" className="hover:text-[var(--riso-tangerine)]">↩ V.1</Link>
            <span className="text-[var(--riso-ink-mute)]">|</span>
            <Link href="/login" className="hover:text-[var(--riso-tangerine)]">Masuk</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1320px] flex-wrap items-end justify-between gap-6 px-6 pt-6 pb-4">
        <div className="flex items-end gap-4">
          <div className="riso-mono text-[10px] uppercase tracking-[0.2em] text-[var(--riso-ink-soft)]">
            <p>NO. 04 · IDR 0,—</p>
            <p>JKT · BDG · SBY · DPS</p>
            <p>SEMUA JURUSAN · SEMUA UMUR</p>
          </div>
        </div>

        <Link href="/v2" className="group flex flex-col items-center">
          <span className="riso-mono text-[10px] tracking-[0.4em] uppercase text-[var(--riso-ink-soft)]">
            Diterbitkan oleh
          </span>
          <span
            className="riso-serif text-[44px] leading-none md:text-[64px] riso-mis"
            data-text="karir.ai"
            style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}
          >
            karir<span style={{ color: "var(--riso-tangerine)" }}>.</span>ai
          </span>
          <span className="mt-1 block h-[2px] w-full bg-[var(--riso-ink)]" />
          <span className="mt-1 riso-mono text-[10px] tracking-[0.3em] uppercase">
            Almanak · Diagnosa · Lowongan
          </span>
        </Link>

        <nav className="flex items-end gap-1">
          {[
            { h: "#almanac", l: "Almanak" },
            { h: "#forecast", l: "Forecast" },
            { h: "#method", l: "Metode" },
            { h: "#voices", l: "Surat Pembaca" },
            { h: "#inquiries", l: "Tanya" },
          ].map((n) => (
            <a
              key={n.h}
              href={n.h}
              className="riso-mono text-[11px] uppercase tracking-[0.16em] px-2 py-1 hover:bg-[var(--riso-ink)] hover:text-[var(--riso-cream)] transition-colors"
            >
              {n.l}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

/* ================== HERO ================== */
function Hero() {
  return (
    <section className="relative lg:ml-10" data-gs="section">
      <div className="mx-auto grid max-w-[1320px] grid-cols-12 gap-x-6 gap-y-10 border-b border-[var(--riso-ink)] px-6 py-10 md:py-16">
        {/* LEFT — column 1 */}
        <div className="col-span-12 md:col-span-7 relative">
          <div className="mb-5 flex items-center gap-3">
            <span className="riso-stick">EDISI · 04 / 2026</span>
            <span className="riso-mono text-[10px] uppercase tracking-[0.2em] text-[var(--riso-ink-soft)]">
              Halaman 01 → 12
            </span>
          </div>

          <h1
            data-gs="hero-line"
            className="riso-serif text-[68px] leading-[0.88] tracking-[-0.03em] md:text-[128px]"
            style={{ fontVariationSettings: '"SOFT" 50, "WONK" 1, "opsz" 144' }}
          >
            Cara <em className="riso-serif-italic" style={{ color: "var(--riso-tangerine)" }}>terhormat</em>{" "}
            <span className="relative">
              naik
              <SquiggleUnderline />
            </span>
            <br />
            kelas <span style={{ color: "var(--riso-oxblood)" }}>karir</span>,
            <br />
            tanpa <em className="riso-serif-italic">jualan mimpi</em>.
          </h1>

          <div data-gs="hero-fade" className="mt-10 grid grid-cols-12 gap-6">
            <p className="col-span-12 md:col-span-7 riso-dropcap text-[15px] leading-[1.65] text-[var(--riso-ink-soft)]">
              Almanak ini memetakan keahlian, kekuatan, dan celah kamu — lalu menyusunnya jadi roadmap mingguan yang bisa kamu kerjakan Senin pagi. Tidak ada kosa kata korporat, tidak ada motivasi kosong. Hanya rencana, ditandatangani oleh AI dan diawasi mentor manusia.
            </p>
            <aside className="col-span-12 md:col-span-5 border-l-2 border-[var(--riso-ink)] pl-5">
              <p className="riso-mono text-[10px] uppercase tracking-[0.2em] text-[var(--riso-tangerine)]">
                Catatan editor
              </p>
              <p className="mt-2 riso-serif-italic text-[18px] leading-[1.35] text-[var(--riso-ink)]">
                &ldquo;Karir bukan lomba lari. Ia perjalanan lima sampai sepuluh tahun yang baiknya kamu petakan, bukan kamu tebak.&rdquo;
              </p>
              <p className="mt-3 riso-mono text-[10px] uppercase tracking-[0.18em] text-[var(--riso-ink-soft)]">
                — Redaksi · 04/26
              </p>
            </aside>
          </div>

          <div data-gs="hero-fade" className="mt-10 flex flex-wrap items-center gap-5">
            <Link href="/onboarding" className="riso-btn">
              Buka Almanak Saya
              <Arrow className="h-3.5 w-3.5" />
            </Link>
            <Link href="#method" className="riso-btn riso-btn-ghost">
              Baca metode
            </Link>
            <span className="riso-mono text-[10px] uppercase tracking-[0.18em] text-[var(--riso-ink-soft)]">
              gratis · tanpa kartu kredit · 60 detik
            </span>
          </div>
        </div>

        {/* RIGHT — Sun stamp & ticket */}
        <div className="col-span-12 md:col-span-5 relative" data-gs="hero-preview">
          <SunStamp />
          <Ticket />
        </div>
      </div>
    </section>
  );
}

function SquiggleUnderline() {
  return (
    <svg
      className="absolute -bottom-3 left-0 h-3 w-full"
      viewBox="0 0 400 16"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        data-gs="draw"
        d="M2 10 Q 30 -2 60 8 T 120 8 T 180 8 T 240 8 T 300 8 T 398 8"
        stroke="var(--riso-tangerine)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SunStamp() {
  return (
    <div className="pointer-events-none absolute -top-6 right-0 h-44 w-44 md:-top-2 md:-right-4 md:h-56 md:w-56">
      <svg
        className="riso-stamp h-full w-full"
        viewBox="0 0 200 200"
        aria-hidden
      >
        <defs>
          <path
            id="sun-circle"
            d="M 100,100 m -76,0 a 76,76 0 1,1 152,0 a 76,76 0 1,1 -152,0"
          />
        </defs>
        <text fill="var(--riso-oxblood)" style={{ fontSize: "13px", letterSpacing: "0.32em" }} className="riso-mono">
          <textPath href="#sun-circle" startOffset="0">
            CERTIFIED · ALMANAK · KARIR · 2026 · DICETAK · DENGAN · TINTA · PANAS ·{" "}
          </textPath>
        </text>
        {/* sun rays */}
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const x1 = 100 + Math.cos(a) * 50;
          const y1 = 100 + Math.sin(a) * 50;
          const x2 = 100 + Math.cos(a) * (i % 2 === 0 ? 62 : 56);
          const y2 = 100 + Math.sin(a) * (i % 2 === 0 ? 62 : 56);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--riso-tangerine)" strokeWidth="2.5" strokeLinecap="round" />
          );
        })}
        <circle cx="100" cy="100" r="42" fill="var(--riso-tangerine)" />
        <text
          x="100"
          y="96"
          textAnchor="middle"
          fill="var(--riso-stock)"
          style={{ fontSize: "9px", letterSpacing: "0.2em" }}
          className="riso-mono"
        >
          ED · IV
        </text>
        <text
          x="100"
          y="112"
          textAnchor="middle"
          fill="var(--riso-stock)"
          fontStyle="italic"
          style={{ fontSize: "20px" }}
          className="riso-serif"
        >
          karir
        </text>
      </svg>
    </div>
  );
}

function Ticket() {
  const lines = [
    { k: "GOAL", v: "Product Designer → Senior" },
    { k: "ETA", v: "12 minggu (3 sprint)" },
    { k: "GAP", v: "3 celah · 1 kritis" },
    { k: "MATCH", v: "87% · 240 lowongan" },
    { k: "BERIKUTNYA", v: "Figma variables (Rabu)" },
  ];
  return (
    <div className="relative mt-32 md:mt-44">
      <div
        className="relative bg-[var(--riso-stock)] border-[1.5px] border-[var(--riso-ink)] p-5 shadow-[6px_6px_0_var(--riso-ink)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0, transparent 26px, rgba(26,20,13,0.08) 26px, rgba(26,20,13,0.08) 27px)",
        }}
      >
        {/* perforation top */}
        <div className="pointer-events-none absolute -top-[1px] left-0 right-0 flex justify-around">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="block h-2 w-2 -translate-y-1 rounded-full bg-[var(--riso-cream)] border border-[var(--riso-ink)]" />
          ))}
        </div>

        <div className="flex items-baseline justify-between border-b border-dashed border-[var(--riso-ink)] pb-2">
          <span className="riso-mono text-[10px] uppercase tracking-[0.2em]">TIKET ALMANAK</span>
          <span className="riso-mono text-[10px] tracking-[0.2em] text-[var(--riso-tangerine)]">№ 24-0428</span>
        </div>

        <p className="riso-serif-italic mt-3 text-[20px] leading-tight">
          Untuk: <span className="not-italic riso-serif">Pembaca yang bingung</span>
        </p>

        <div className="mt-3 space-y-1.5">
          {lines.map((l) => (
            <div key={l.k} className="flex items-baseline gap-3 riso-mono text-[11px]">
              <span className="w-[88px] shrink-0 uppercase tracking-[0.15em] text-[var(--riso-ink-mute)]">{l.k}</span>
              <span className="flex-1 text-[var(--riso-ink)]">{l.v}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 border border-[var(--riso-tangerine)] bg-[var(--riso-tangerine)]/10 p-2.5">
          <p className="riso-mono text-[10px] uppercase tracking-[0.2em] text-[var(--riso-oxblood)]">
            Pesan dari AI · 04:21
          </p>
          <p data-gs="type" className="mt-1 riso-serif-italic text-[15px] leading-[1.35]">
            Kamu butuh 6 jam/minggu. Aku susun di Rabu malam &amp; Sabtu pagi — confirm?
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="riso-mono text-[10px] uppercase tracking-[0.18em]">Stempel · resmi</span>
          <span className="riso-mono text-[9px] uppercase tracking-[0.2em] text-[var(--riso-ink-mute)]">Tandatangani di /onboarding</span>
        </div>
      </div>
    </div>
  );
}

/* ================== TICKER ================== */
function Ticker() {
  const items = [
    "lapor mingguan langsung ke whatsapp",
    "diagnosis skill-gap dalam 60 detik",
    "240+ lowongan disaring tiap hari",
    "roadmap 12 minggu, bisa direvisi",
    "tanpa motivasi kosong",
    "tanpa email spam",
    "data anda tidak dijual",
    "dipakai 2.400+ pencari kerja",
  ];
  return (
    <section className="relative lg:ml-10 border-b border-[var(--riso-ink)] bg-[var(--riso-ink)] text-[var(--riso-cream)] overflow-hidden">
      <div className="flex items-center">
        <span className="riso-mono shrink-0 px-5 py-3 text-[11px] uppercase tracking-[0.25em] bg-[var(--riso-tangerine)] text-[var(--riso-ink)] border-r border-[var(--riso-ink)]">
          ★ Berita kilat
        </span>
        <div className="riso-ticker flex whitespace-nowrap">
          {[...items, ...items, ...items].map((it, i) => (
            <span key={i} className="riso-mono px-6 py-3 text-[12px] uppercase tracking-[0.18em] flex items-center gap-6">
              {it}
              <span className="text-[var(--riso-tangerine)]">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================== ALMANAC (BENTO REIMAGINED AS NEWSPAPER FRONT PAGE) ================== */
function Almanac() {
  return (
    <section id="almanac" className="relative lg:ml-10" data-gs="section">
      <div className="mx-auto max-w-[1320px] px-6 py-12 md:py-20">
        <SectionHeader
          kicker="Bagian I · Modul"
          title="Empat halaman almanak."
          italic="Satu copilot."
          note="Dipakai bareng jadi sistem. Dipakai sendiri-sendiri tetap tegas."
        />

        <div className="mt-10 grid grid-cols-12 gap-5" data-gs="stagger-parent">
          {/* main feature — roadmap */}
          <article
            data-gs="stagger-child"
            className="col-span-12 md:col-span-8 row-span-2 relative bg-[var(--riso-stock)] border-[1.5px] border-[var(--riso-ink)] p-7 shadow-[6px_6px_0_var(--riso-ink)]"
          >
            <div className="flex items-baseline justify-between border-b-2 border-[var(--riso-ink)] pb-2">
              <span className="riso-mono text-[10px] uppercase tracking-[0.22em]">Halaman 01</span>
              <span className="riso-mono text-[10px] uppercase tracking-[0.22em] text-[var(--riso-tangerine)]">/roadmap</span>
            </div>
            <h3 className="riso-serif mt-4 text-[40px] leading-[0.95] tracking-[-0.02em] md:text-[56px]">
              Roadmap mingguan,
              <br />
              <em className="riso-serif-italic" style={{ color: "var(--riso-tangerine)" }}>bukan wishlist.</em>
            </h3>
            <p className="mt-4 max-w-md text-[14px] leading-[1.6] text-[var(--riso-ink-soft)]">
              AI menyusun langkah-langkah kecil tiap minggu, lengkap dengan ETA dan task konkret yang bisa kamu eksekusi Senin pagi tanpa drama.
            </p>
            <RoadmapPaper />
          </article>

          <article
            data-gs="stagger-child"
            className="col-span-12 md:col-span-4 relative bg-[var(--riso-cream-2)] border-[1.5px] border-[var(--riso-ink)] p-6 shadow-[5px_5px_0_var(--riso-ultramarine)]"
          >
            <div className="flex items-baseline justify-between border-b border-[var(--riso-ink)] pb-2">
              <span className="riso-mono text-[10px] uppercase tracking-[0.22em]">Halaman 02</span>
              <span className="riso-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--riso-ultramarine)" }}>/skill-gap</span>
            </div>
            <h3 className="riso-serif mt-3 text-[26px] leading-tight tracking-[-0.02em]">
              Peta gap, <em className="riso-serif-italic">bukan PR numpuk</em>.
            </h3>
            <BarChart />
          </article>

          <article
            data-gs="stagger-child"
            className="col-span-7 md:col-span-2 relative bg-[var(--riso-tangerine)] text-[var(--riso-ink)] border-[1.5px] border-[var(--riso-ink)] p-5 shadow-[5px_5px_0_var(--riso-ink)]"
          >
            <span className="riso-mono text-[9px] uppercase tracking-[0.22em]">Hal. 03</span>
            <p className="riso-serif mt-2 text-[40px] leading-none">87<span className="riso-serif-italic text-[24px]">%</span></p>
            <p className="riso-mono mt-2 text-[10px] uppercase tracking-[0.18em]">Match rata-rata</p>
            <p className="riso-mono mt-1 text-[10px] tracking-[0.16em] opacity-80">240 lowongan aktif</p>
          </article>

          <article
            data-gs="stagger-child"
            className="col-span-5 md:col-span-2 relative bg-[var(--riso-ink)] text-[var(--riso-cream)] border-[1.5px] border-[var(--riso-ink)] p-5 shadow-[5px_5px_0_var(--riso-tangerine)]"
          >
            <span className="riso-mono text-[9px] uppercase tracking-[0.22em] text-[var(--riso-tangerine)]">Hal. 04</span>
            <p className="riso-serif-italic mt-2 text-[24px] leading-tight">
              Kursus
              <br />prio.
            </p>
            <p className="riso-mono mt-3 text-[10px] uppercase tracking-[0.18em] opacity-80">
              Yang menggerakkan needle.
            </p>
            <span className="absolute right-3 bottom-3 riso-mono text-[9px] tracking-[0.18em] opacity-60">→ /rec</span>
          </article>

          <article
            data-gs="stagger-child"
            className="col-span-12 relative border-[1.5px] border-[var(--riso-ink)] p-6 shadow-[5px_5px_0_var(--riso-oxblood)] bg-[var(--riso-stock)]"
          >
            <div className="grid grid-cols-12 items-center gap-6">
              <div className="col-span-12 md:col-span-5">
                <span className="riso-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--riso-oxblood)" }}>
                  Suplemen mingguan
                </span>
                <h3 className="riso-serif mt-2 text-[28px] leading-tight tracking-[-0.02em] md:text-[34px]">
                  Laporan mingguan kirim
                  <br />
                  ke <em className="riso-serif-italic">WhatsApp kamu</em>.
                </h3>
                <p className="mt-3 text-[13px] text-[var(--riso-ink-soft)]">
                  Progress, win kecil, satu hal yang perlu kamu benerin minggu depan. Tidak lebih.
                </p>
              </div>
              <div className="col-span-12 md:col-span-7">
                <WeekChart />
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  kicker,
  title,
  italic,
  note,
}: {
  kicker: string;
  title: string;
  italic?: string;
  note?: string;
}) {
  return (
    <div className="grid grid-cols-12 gap-6 border-b-2 border-[var(--riso-ink)] pb-6">
      <div className="col-span-12 md:col-span-2">
        <span className="riso-mono text-[10px] uppercase tracking-[0.22em] text-[var(--riso-tangerine)]">
          {kicker}
        </span>
      </div>
      <div className="col-span-12 md:col-span-7">
        <h2 className="riso-serif text-[36px] leading-[0.95] tracking-[-0.02em] md:text-[64px]">
          {title}{" "}
          {italic && <em className="riso-serif-italic" style={{ color: "var(--riso-tangerine)" }}>{italic}</em>}
        </h2>
      </div>
      {note && (
        <p className="col-span-12 md:col-span-3 self-end text-[13px] leading-[1.5] text-[var(--riso-ink-soft)] border-l-2 border-[var(--riso-ink)] pl-4">
          {note}
        </p>
      )}
    </div>
  );
}

function RoadmapPaper() {
  const weeks = [
    { w: "W1", l: "Fundamentals", done: true },
    { w: "W3", l: "Figma variables", done: true },
    { w: "W6", l: "Design system", current: true },
    { w: "W9", l: "Case study" },
    { w: "W12", l: "Interview" },
  ];
  return (
    <div className="mt-7 relative">
      <svg className="absolute left-0 right-0 top-5 h-2 w-full" viewBox="0 0 800 8" preserveAspectRatio="none">
        <path
          data-gs="draw"
          d="M 10 4 Q 100 0 200 4 T 400 4 T 600 4 T 790 4"
          stroke="var(--riso-ink)"
          strokeWidth="2"
          strokeDasharray="6 4"
          fill="none"
        />
      </svg>
      <div className="relative grid grid-cols-5 gap-2">
        {weeks.map((wk) => (
          <div key={wk.w} className="flex flex-col items-center text-center">
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[var(--riso-ink)] riso-mono text-[11px] tracking-[0.1em] ${
                wk.current
                  ? "bg-[var(--riso-tangerine)] text-[var(--riso-ink)] shadow-[3px_3px_0_var(--riso-ink)]"
                  : wk.done
                  ? "bg-[var(--riso-ink)] text-[var(--riso-cream)]"
                  : "bg-[var(--riso-stock)] text-[var(--riso-ink-soft)]"
              }`}
            >
              {wk.w}
            </span>
            <span className="mt-2 riso-serif-italic text-[13px] leading-tight">{wk.l}</span>
            {wk.current && (
              <span className="mt-1 riso-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: "var(--riso-tangerine)" }}>
                ← kamu di sini
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart() {
  const bars = [
    { l: "Figma", v: 85, c: "var(--riso-ink)" },
    { l: "Motion", v: 38, c: "var(--riso-tangerine)" },
    { l: "Research", v: 62, c: "var(--riso-ultramarine)" },
    { l: "Systems", v: 28, c: "var(--riso-tangerine)" },
  ];
  return (
    <div className="mt-5 space-y-3">
      {bars.map((b) => (
        <div key={b.l} className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="riso-mono text-[10px] uppercase tracking-[0.18em]">{b.l}</span>
            <span className="riso-serif text-[16px]" style={{ color: b.c }}>{b.v}<span className="riso-serif-italic text-[12px]">%</span></span>
          </div>
          <div className="h-2 border-[1px] border-[var(--riso-ink)] bg-[var(--riso-stock)]">
            <div className="h-full" style={{ width: `${b.v}%`, background: b.c }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function WeekChart() {
  const days = [
    { d: "Sen", v: 0.3 },
    { d: "Sel", v: 0.7 },
    { d: "Rab", v: 0.95 },
    { d: "Kam", v: 0.5 },
    { d: "Jum", v: 0.85 },
    { d: "Sab", v: 0.25 },
    { d: "Min", v: 0.4 },
  ];
  return (
    <div className="border-2 border-[var(--riso-ink)] bg-[var(--riso-cream-2)] p-4">
      <div className="flex items-baseline justify-between border-b border-dashed border-[var(--riso-ink)] pb-2 mb-3">
        <span className="riso-mono text-[10px] uppercase tracking-[0.2em]">Minggu ke-6 · sprint kedua</span>
        <span className="riso-serif-italic text-[14px]">+18% dari minggu lalu</span>
      </div>
      <div className="flex items-end justify-between gap-3 h-28">
        {days.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2 h-full">
            <div className="flex h-full w-full items-end">
              <div
                className="w-full border-[1.5px] border-[var(--riso-ink)]"
                style={{
                  height: `${d.v * 100}%`,
                  background: i === 2 || i === 4 ? "var(--riso-tangerine)" : "var(--riso-ink)",
                }}
              />
            </div>
            <span className="riso-mono text-[10px] uppercase">{d.d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================== FORECAST (CAREER WEATHER) ================== */
function Forecast() {
  const cards = [
    {
      icon: "☀",
      title: "Cerah",
      sub: "Product · Design",
      detail: "Hiring naik 22%, gaji median IDR 18jt, dominasi remote/hybrid.",
      color: "var(--riso-tangerine)",
    },
    {
      icon: "⛅",
      title: "Cerah berawan",
      sub: "Data · Analytics",
      detail: "Permintaan stabil, kompetisi sedang, jalur masuk bootcamp solid.",
      color: "var(--riso-ultramarine)",
    },
    {
      icon: "☁",
      title: "Mendung sebagian",
      sub: "Frontend · Junior",
      detail: "Kompetitif, tapi yang spesialis (motion, perf) tetap dicari.",
      color: "var(--riso-oxblood)",
    },
    {
      icon: "✦",
      title: "Cuaca panas",
      sub: "AI · ML Eng",
      detail: "Demand meroket, supply tipis. Bayaran top tier untuk yang serius.",
      color: "var(--riso-mustard)",
    },
  ];
  return (
    <section id="forecast" className="relative lg:ml-10 border-y border-[var(--riso-ink)] bg-[var(--riso-cream-2)]" data-gs="section">
      <div className="mx-auto max-w-[1320px] px-6 py-14 md:py-20">
        <SectionHeader
          kicker="Bagian II · Ramalan"
          title="Cuaca karir,"
          italic="kuartal kedua."
          note="Diperbarui mingguan dari 12.000+ lowongan publik Indonesia."
        />

        <div className="mt-10 grid grid-cols-12 gap-4" data-gs="stagger-parent">
          {cards.map((c) => (
            <div
              key={c.title}
              data-gs="stagger-child"
              className="col-span-12 md:col-span-3 border-[1.5px] border-[var(--riso-ink)] bg-[var(--riso-stock)] p-5 shadow-[4px_4px_0_var(--riso-ink)]"
            >
              <div className="flex items-baseline justify-between">
                <span className="riso-serif text-[44px] leading-none" style={{ color: c.color }}>{c.icon}</span>
                <span className="riso-mono text-[9px] uppercase tracking-[0.22em]">Q2 / 26</span>
              </div>
              <p className="riso-serif mt-3 text-[20px] leading-tight">{c.title}</p>
              <p className="riso-mono text-[10px] uppercase tracking-[0.2em] mt-1" style={{ color: c.color }}>{c.sub}</p>
              <p className="mt-3 text-[12px] leading-[1.55] text-[var(--riso-ink-soft)]">{c.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================== METHOD (FLOW) ================== */
function Method() {
  const steps = [
    { n: "I", t: "Tetapkan tujuan", d: "Ceritakan kamu mau jadi apa, dalam bahasa kamu sendiri. Tidak perlu corporate speak." },
    { n: "II", t: "AI mendiagnosa", d: "Skill-gap, level saat ini, titik sensitif — semua dibedah dengan jujur." },
    { n: "III", t: "Susun rencana", d: "Roadmap mingguan + kursus prioritas + lowongan yang cocok." },
    { n: "IV", t: "Eksekusi & lacak", d: "Task mingguan, progress kiri-kanan, win kecil dihitung." },
  ];
  return (
    <section id="method" className="relative lg:ml-10" data-gs="section">
      <div className="mx-auto max-w-[1320px] px-6 py-14 md:py-20">
        <SectionHeader
          kicker="Bagian III · Metode"
          title="Empat tahap."
          italic="Enam puluh detik."
          note="Cara kerja almanak dari awal sampai akhir."
        />

        <div className="mt-10 grid grid-cols-12 gap-x-5 gap-y-8" data-gs="stagger-parent">
          {steps.map((s, i) => (
            <article
              key={s.n}
              data-gs="stagger-child"
              className="col-span-12 md:col-span-3 relative"
            >
              <div className="flex items-baseline gap-3 border-b-2 border-[var(--riso-ink)] pb-2">
                <span className="riso-serif-italic text-[56px] leading-none" style={{ color: "var(--riso-tangerine)" }}>
                  {s.n}
                </span>
                <span className="riso-mono text-[10px] uppercase tracking-[0.22em] text-[var(--riso-ink-soft)]">
                  Tahap
                </span>
              </div>
              <h3 className="riso-serif mt-4 text-[26px] leading-tight tracking-[-0.02em]">{s.t}</h3>
              <p className="mt-3 text-[13px] leading-[1.6] text-[var(--riso-ink-soft)]">{s.d}</p>
              {i < steps.length - 1 && (
                <span className="hidden md:block absolute right-[-14px] top-2 riso-serif-italic text-[28px]" style={{ color: "var(--riso-tangerine)" }}>→</span>
              )}
            </article>
          ))}
        </div>

        <div className="mt-12 border-t border-[var(--riso-ink)] pt-5 flex flex-wrap items-center justify-between gap-4">
          <span className="riso-mono text-[10px] uppercase tracking-[0.2em] text-[var(--riso-ink-soft)]">
            avg-time: 58.4 dtk · n=2.4k pengguna · variance: ±9 dtk
          </span>
          <Link href="/onboarding" className="riso-mono text-[11px] uppercase tracking-[0.18em] underline decoration-[var(--riso-tangerine)] decoration-2 underline-offset-4 hover:text-[var(--riso-tangerine)]">
            Mulai tahap I →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ================== VOICES (LETTERS TO EDITOR) ================== */
function Voices() {
  const t = [
    {
      q: "Akhirnya ada yang menganggap pindah jalur karir itu hal yang normal, bukan drama keluarga.",
      n: "Dimas, 26",
      r: "designer → product manager · jakarta",
    },
    {
      q: "Saya tahu hari ini harus mengerjakan apa. Itu sendiri sudah worth it.",
      n: "Nabila, 23",
      r: "fresh graduate · bandung",
    },
    {
      q: "Roadmap-nya terasa seperti dibuat oleh mentor sungguhan, bukan generator otomatis.",
      n: "Arga, 27",
      r: "growth lead · surabaya",
    },
  ];
  return (
    <section id="voices" className="relative lg:ml-10 border-y border-[var(--riso-ink)] bg-[var(--riso-stock)]" data-gs="section">
      <div className="mx-auto max-w-[1320px] px-6 py-14 md:py-20">
        <SectionHeader
          kicker="Bagian IV · Surat Pembaca"
          title="Orang sungguhan."
          italic="Cerita sungguhan."
          note="Dipublikasikan dengan izin. Nama disamarkan jika diminta."
        />

        <div className="mt-10 grid grid-cols-12 gap-5" data-gs="stagger-parent">
          {t.map((x, i) => (
            <blockquote
              key={i}
              data-gs="stagger-child"
              className="col-span-12 md:col-span-4 relative bg-[var(--riso-cream)] border-[1.5px] border-[var(--riso-ink)] p-6 shadow-[5px_5px_0_var(--riso-ink)]"
              style={{
                transform: `rotate(${i === 0 ? -0.6 : i === 2 ? 0.7 : -0.2}deg)`,
              }}
            >
              <span className="absolute -top-3 -left-3 riso-stick">№ 0{i + 1}</span>
              <span className="riso-serif-italic text-[64px] leading-none block" style={{ color: "var(--riso-tangerine)" }}>&ldquo;</span>
              <p className="riso-serif text-[20px] leading-[1.3] tracking-[-0.01em] -mt-6">
                {x.q}
              </p>
              <footer className="mt-6 border-t border-[var(--riso-ink)] pt-3 flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--riso-ink)] bg-[var(--riso-tangerine)] riso-serif-italic text-[16px] text-[var(--riso-ink)]">
                  {x.n[0]}
                </span>
                <span className="riso-mono text-[10px] uppercase tracking-[0.18em]">
                  <span>{x.n}</span>
                  <span className="block text-[var(--riso-ink-mute)] tracking-[0.15em]">{x.r}</span>
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================== PATHS ================== */
function Paths() {
  const rowA = [
    "Product Designer", "Frontend Engineer", "Data Analyst", "Product Manager",
    "UX Researcher", "Growth Marketer", "Backend Engineer", "Content Writer",
  ];
  const rowB = [
    "Brand Designer", "DevOps Engineer", "Business Analyst", "Copywriter",
    "Operations Lead", "Motion Designer", "Finance Associate", "Customer Success",
  ];
  const Chip = ({ l, mark }: { l: string; mark: string }) => (
    <div className="shrink-0 inline-flex items-center gap-3 border-[1.5px] border-[var(--riso-ink)] bg-[var(--riso-stock)] px-4 py-2 shadow-[3px_3px_0_var(--riso-ink)]">
      <span className="riso-serif-italic text-[18px]" style={{ color: "var(--riso-tangerine)" }}>{mark}</span>
      <span className="riso-mono text-[11px] uppercase tracking-[0.16em]">{l}</span>
    </div>
  );
  const marks = ["§", "¶", "†", "‡", "✦", "❋", "◆", "◇"];
  return (
    <section className="relative lg:ml-10" data-gs="section">
      <div className="mx-auto max-w-[1320px] px-6 py-14 md:py-20">
        <SectionHeader
          kicker="Bagian V · Jalur"
          title="Banyak jalur."
          italic="Satu copilot."
          note="Roadmap, gap, dan match diadaptasi per jalur — dari design sampai data."
        />

        <div className="mt-10 relative overflow-hidden border-[1.5px] border-[var(--riso-ink)] bg-[var(--riso-cream-2)] py-8">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[var(--riso-cream-2)] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[var(--riso-cream-2)] to-transparent" />

          <div className="flex">
            <div className="riso-ticker flex gap-3 whitespace-nowrap pr-3">
              {[...rowA, ...rowA].map((r, i) => (
                <Chip key={`a${i}`} l={r} mark={marks[i % marks.length]} />
              ))}
            </div>
          </div>

          <div className="relative my-7 flex items-center justify-center">
            <div className="absolute left-1/2 top-1/2 h-[2px] w-full -translate-x-1/2 -translate-y-1/2 bg-[var(--riso-ink)]" />
            <div className="relative z-10 inline-flex items-center gap-4 border-[1.5px] border-[var(--riso-ink)] bg-[var(--riso-tangerine)] px-5 py-3.5 shadow-[5px_5px_0_var(--riso-ink)]">
              <span className="flex h-10 w-10 items-center justify-center bg-[var(--riso-ink)] text-[var(--riso-tangerine)] riso-serif-italic text-[22px]">
                ✦
              </span>
              <div>
                <p className="riso-mono text-[9px] uppercase tracking-[0.22em]">Match terkini</p>
                <p data-gs="type" className="riso-serif-italic text-[16px] leading-tight">
                  Senior Product Designer · Remote
                </p>
              </div>
              <div className="hidden md:flex items-baseline gap-1 border-l-[1.5px] border-[var(--riso-ink)] pl-4">
                <span className="riso-serif text-[26px] leading-none">87</span>
                <span className="riso-mono text-[10px] uppercase tracking-[0.2em]">% fit</span>
              </div>
              <span className="hidden md:inline-block bg-[var(--riso-ink)] text-[var(--riso-tangerine)] riso-mono text-[10px] uppercase tracking-[0.2em] px-2 py-1">
                +12 wk
              </span>
            </div>
          </div>

          <div className="flex">
            <div className="riso-ticker flex gap-3 whitespace-nowrap pr-3" style={{ animationDirection: "reverse", animationDuration: "75s" }}>
              {[...rowB, ...rowB].map((r, i) => (
                <Chip key={`b${i}`} l={r} mark={marks[(i + 3) % marks.length]} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { k: "Tech", v: "8 jalur" },
            { k: "Design", v: "5 jalur" },
            { k: "Bisnis", v: "7 jalur" },
            { k: "Kreatif", v: "4 jalur" },
          ].map((it) => (
            <div key={it.k} className="flex items-baseline justify-between border-[1.5px] border-[var(--riso-ink)] bg-[var(--riso-stock)] px-4 py-3">
              <span className="riso-mono text-[10px] uppercase tracking-[0.2em] text-[var(--riso-ink-soft)]">{it.k}</span>
              <span className="riso-serif-italic text-[20px]">{it.v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================== NUMEROLOGY (STATS) ================== */
function Numerology() {
  const items = [
    { v: "12", u: "+", l: "minggu rata-rata ke target" },
    { v: "87", u: "%", l: "rata-rata kecocokan lowongan" },
    { v: "4.8", u: "/5", l: "rating beta user" },
    { v: "60", u: "dtk", l: "waktu setup awal" },
  ];
  return (
    <section className="relative lg:ml-10 border-y-[3px] border-double border-[var(--riso-ink)] bg-[var(--riso-ink)] text-[var(--riso-cream)]" data-gs="section">
      <div className="mx-auto max-w-[1320px] px-6 py-14 md:py-20">
        <div className="grid grid-cols-12 gap-5 border-b border-[var(--riso-cream)]/30 pb-6 mb-8">
          <div className="col-span-12 md:col-span-3">
            <span className="riso-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--riso-tangerine)" }}>
              Bagian VI · Angka
            </span>
          </div>
          <h2 className="col-span-12 md:col-span-9 riso-serif text-[36px] leading-[0.95] tracking-[-0.02em] md:text-[64px]">
            Statistik almanak,{" "}
            <em className="riso-serif-italic" style={{ color: "var(--riso-tangerine)" }}>diaudit setiap minggu.</em>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {items.map((s, i) => (
            <div key={s.l} className={`relative ${i < 3 ? "md:border-r md:border-[var(--riso-cream)]/20 md:pr-6" : ""}`}>
              <span className="riso-mono text-[10px] uppercase tracking-[0.22em] text-[var(--riso-cream)]/60">
                № 0{i + 1}
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  data-gs="count"
                  data-to={s.v}
                  className="riso-serif text-[88px] leading-none tracking-[-0.04em] tabular-nums md:text-[120px]"
                >
                  {s.v}
                </span>
                <span className="riso-serif-italic text-[36px]" style={{ color: "var(--riso-tangerine)" }}>{s.u}</span>
              </div>
              <p className="mt-3 riso-mono text-[11px] uppercase tracking-[0.18em] text-[var(--riso-cream)]/70">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================== INQUIRIES (FAQ) ================== */
function Inquiries() {
  const qa = [
    { q: "Apa bedanya dengan job board biasa?", a: "Kami bukan job board. Kami menyusun roadmap personal + skill-gap + kursus, baru menunjukkan lowongan yang beneran cocok." },
    { q: "Apakah benar-benar gratis?", a: "Fitur inti (roadmap, gap, match, rekomendasi kursus) gratis. Plan pro opsional di kemudian hari." },
    { q: "Datanya dari mana?", a: "Lowongan & tren skill diagregasi dari sumber publik Indonesia plus input goal kamu. Data anda tidak dijual." },
    { q: "Cocok untuk non-tech?", a: "Cocok. Roadmap mendukung marketing, design, finance, operations — bukan hanya tech." },
  ];
  return (
    <section id="inquiries" className="relative lg:ml-10 bg-[var(--riso-cream-2)] border-y border-[var(--riso-ink)]" data-gs="section">
      <div className="mx-auto max-w-[1320px] px-6 py-14 md:py-20">
        <SectionHeader
          kicker="Bagian VII · Tanya Jawab"
          title="Yang sering"
          italic="ditanyakan."
          note="Kalau pertanyaan kamu belum ada, kirim ke halo@karir.ai."
        />

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {qa.map((it, i) => (
            <details
              key={i}
              className="group bg-[var(--riso-stock)] border-[1.5px] border-[var(--riso-ink)] p-5 shadow-[4px_4px_0_var(--riso-ink)] open:shadow-[4px_4px_0_var(--riso-tangerine)]"
            >
              <summary className="flex cursor-pointer list-none items-baseline gap-4">
                <span className="riso-serif-italic text-[36px] leading-none" style={{ color: "var(--riso-tangerine)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 riso-serif text-[20px] leading-tight tracking-[-0.01em]">
                  {it.q}
                </span>
                <span className="riso-serif text-[26px] leading-none transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 pl-12 text-[13px] leading-[1.65] text-[var(--riso-ink-soft)]">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================== FINAL STAMP (CTA) ================== */
function FinalStamp() {
  return (
    <section className="relative lg:ml-10 overflow-hidden" data-gs="section">
      {/* hatch corners */}
      <div className="riso-hatch-tang absolute left-0 top-0 h-32 w-32 opacity-60" />
      <div className="riso-hatch-tang absolute right-0 bottom-0 h-32 w-32 opacity-60" />

      <div className="mx-auto max-w-[1320px] px-6 py-20 md:py-28 relative">
        <div className="text-center max-w-4xl mx-auto">
          <span className="inline-block riso-stick mb-8">EDISI · TERBATAS</span>
          <h2
            data-gs="hero-line"
            className="riso-serif text-[56px] leading-[0.9] tracking-[-0.03em] md:text-[120px]"
          >
            Berhenti
            <br />
            <em className="riso-serif-italic" style={{ color: "var(--riso-tangerine)" }}>scroll</em>{" "}
            lowongan.
            <br />
            Mulai
            <br />
            <em className="riso-serif-italic" style={{ color: "var(--riso-oxblood)" }}>tulis</em>{" "}
            karir.
          </h2>

          <p className="mt-8 max-w-xl mx-auto text-[15px] leading-[1.7] text-[var(--riso-ink-soft)]">
            Almanak kamu menunggu. Cetakan personal, dengan tinta yang masih basah, dan stempel resmi dari editor.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
            <Link href="/onboarding" className="riso-btn">
              Bukak almanak saya
              <Arrow className="h-3.5 w-3.5" />
            </Link>
            <Link href="/" className="riso-btn riso-btn-ghost">
              Kembali ke V.1
            </Link>
          </div>
          <p className="mt-6 riso-mono text-[10px] uppercase tracking-[0.22em] text-[var(--riso-ink-soft)]">
            gratis · tanpa kartu kredit · bisa dengan data demo dulu
          </p>
        </div>
      </div>
    </section>
  );
}

/* ================== COLOPHON (FOOTER) ================== */
function Colophon() {
  return (
    <footer className="relative lg:ml-10 border-t-[3px] border-double border-[var(--riso-ink)] bg-[var(--riso-stock)]">
      <div className="mx-auto max-w-[1320px] px-6 py-10">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-5">
            <span
              className="riso-serif text-[44px] leading-none riso-mis"
              data-text="karir.ai"
            >
              karir<span style={{ color: "var(--riso-tangerine)" }}>.</span>ai
            </span>
            <p className="mt-3 riso-serif-italic text-[16px] max-w-sm leading-snug">
              Almanak Karir 2026 — dicetak dengan tinta panas di Jakarta, untuk siapa saja yang lelah dengan pemandangan job board.
            </p>
          </div>
          <div className="col-span-6 md:col-span-3">
            <p className="riso-mono text-[10px] uppercase tracking-[0.22em] text-[var(--riso-ink-soft)] border-b border-[var(--riso-ink)] pb-1">
              Halaman
            </p>
            <ul className="mt-3 space-y-1.5 riso-mono text-[11px] uppercase tracking-[0.16em]">
              <li><a href="#almanac" className="hover:text-[var(--riso-tangerine)]">Almanak</a></li>
              <li><a href="#forecast" className="hover:text-[var(--riso-tangerine)]">Forecast</a></li>
              <li><a href="#method" className="hover:text-[var(--riso-tangerine)]">Metode</a></li>
              <li><a href="#voices" className="hover:text-[var(--riso-tangerine)]">Surat pembaca</a></li>
            </ul>
          </div>
          <div className="col-span-6 md:col-span-2">
            <p className="riso-mono text-[10px] uppercase tracking-[0.22em] text-[var(--riso-ink-soft)] border-b border-[var(--riso-ink)] pb-1">
              Pintu
            </p>
            <ul className="mt-3 space-y-1.5 riso-mono text-[11px] uppercase tracking-[0.16em]">
              <li><Link href="/" className="hover:text-[var(--riso-tangerine)]">Versi 1</Link></li>
              <li><Link href="/login" className="hover:text-[var(--riso-tangerine)]">Masuk</Link></li>
              <li><Link href="/onboarding" className="hover:text-[var(--riso-tangerine)]">Mulai</Link></li>
            </ul>
          </div>
          <div className="col-span-12 md:col-span-2">
            <p className="riso-mono text-[10px] uppercase tracking-[0.22em] text-[var(--riso-ink-soft)] border-b border-[var(--riso-ink)] pb-1">
              Kolofon
            </p>
            <p className="mt-3 riso-mono text-[10px] leading-[1.7] tracking-[0.04em] text-[var(--riso-ink-soft)]">
              Disusun di Fraunces &amp; JetBrains Mono.
              <br />Dicetak dalam dua warna: tangerine &amp; oxblood, di atas kertas krim 90gsm imajiner.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--riso-ink)] pt-4 riso-mono text-[10px] uppercase tracking-[0.22em] text-[var(--riso-ink-soft)]">
          <span>© 2026 Karir.ai · Edisi IV · Dicetak terbatas</span>
          <span>Tinta: tangerine #FF5B1F · Stock: cream #F3ECD9</span>
        </div>
      </div>
    </footer>
  );
}

/* ================== ICONS ================== */
function Arrow(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
