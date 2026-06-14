import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { LandingAnimator } from "@/components/LandingAnimator";

/* =========================================================
   CraftWorks — Landing V4
   "Clean Paper Desk" — the Acctual design system.
   Near-monochrome paper neutrals, hairline borders, soft
   20–32px radii, a single dark onyx pill CTA. Chromatic
   color (Invoice Blue, magenta, iris) appears only as small
   functional punctuation — checkmarks, eyebrow tags, avatar
   tiles, pastel washes behind product cards. Restraint as
   the whole point: papers fanned out on a desk at dusk.
   ========================================================= */

export default function LandingPage() {
  return (
    <main className="act-page act-sans relative min-h-screen overflow-x-clip">
      <Hero />
      <LogoCloud />
      <ProductShowcase />
      <Features />
      <Gallery />
      <JourneyBand />
      <Comparison />
      <FAQ />
      <Footer />
      <LandingAnimator />
    </main>
  );
}

/* ================== NAV (overlay, on hero bg) ================== */
function Nav() {
  const links = [
    ["Roadmap", "#showcase"],
    ["Fitur", "#features"],
    ["Galeri", "#galeri"],
    ["FAQ", "#faq"],
  ];
  return (
    <header>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Wordmark />
          <span className="act-heading text-[20px] text-white">
            Craft<span className="text-white/70">Works</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map(([l, h]) => (
            <a
              key={h}
              href={h}
              className="text-[14px] font-medium text-white/85 transition-colors hover:text-white"
            >
              {l}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2.5 text-[14px] font-medium text-white/85 transition-colors hover:text-white sm:inline-flex"
          >
            Masuk
          </Link>
          <Link href="/onboarding" className="act-pill-light">
            Mulai gratis
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ================== HERO ================== */
function Hero() {
  return (
    <section className="act-hero-full relative" data-gs="section">
      {/* Full-bleed landscape backdrop — the winding path is the roadmap metaphor */}
      <Image
        src="/hero/bg-hero.png"
        alt="Lembah hijau dengan jalan setapak menuju pegunungan—metafora perjalanan karir"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Dark scrim so the white header + hero copy stays legible */}
      <div className="act-hero-scrim absolute inset-0" />

      {/* Header lives inside the bg */}
      <div className="relative z-10">
        <Nav />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-6 pt-16 pb-24 text-center sm:pt-20 sm:pb-28 md:pt-24 md:pb-36">
        <p data-gs="hero-fade" className="mb-5 text-[14px] font-medium tracking-[0.01em] text-white/80">
          Copilot karir untuk semua
        </p>

        <h1
          data-gs="hero-line"
          className="act-display mx-auto max-w-[16ch] text-[40px] text-white sm:text-[54px] md:text-[64px]"
        >
          Karirmu, akhirnya terarah
        </h1>

        <p
          data-gs="hero-fade"
          className="mx-auto mt-6 max-w-[54ch] text-[16px] leading-[1.5] text-white/85"
        >
          Skill, roadmap, lowongan, sampai latihan interview — semua di satu
          tempat.
        </p>

        <div data-gs="hero-fade" className="mt-8 flex items-center justify-center gap-2">
          <Link href="/onboarding" className="act-pill-light">
            Buat roadmap gratis
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <a
            href="#showcase"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-3 text-[14px] font-medium text-white transition-colors hover:bg-white/10"
          >
            Lihat contoh
          </a>
        </div>

        {/* Feature checks */}
        <div
          data-gs="hero-fade"
          className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {[
            "Gratis, tanpa kartu kredit",
            "Skill, lowongan & interview jadi satu",
            "Roadmap pertama dalam 60 detik",
          ].map((t) => (
            <span key={t} className="inline-flex items-center gap-2 text-[14px] font-medium text-white">
              <Check className="h-4 w-4 text-white" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================== LOGO CLOUD — glass proof bar over the hero edge ================== */
function LogoCloud() {
  const logos = [
    "Tokopedia", "Gojek", "Traveloka", "Bukalapak", "Ruangguru",
    "Xendit", "Dana", "Blibli", "Vidio", "Ajaib",
  ];
  return (
    <section className="relative z-20 -mt-10 px-6 sm:-mt-12">
      <div className="act-proofbar mx-auto max-w-[1100px] rounded-[22px] px-6 py-5 sm:rounded-[26px] sm:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
          <p className="flex-none text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--act-graphite)]">
            Bersiap melamar ke perusahaan seperti
          </p>
          <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="act-marquee">
              {[0, 1].map((k) =>
                logos.map((name, i) => (
                  <span
                    key={`${k}-${i}`}
                    className="mx-8 text-[17px] font-semibold tracking-tight text-[var(--act-graphite)] transition-colors hover:text-[var(--act-ink)]"
                  >
                    {name}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================== PRODUCT SHOWCASE ================== */
function ProductShowcase() {
  return (
    <section id="showcase" className="relative py-24" data-gs="section">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto max-w-[44ch] text-center">
          <p className="act-eyebrow mb-4">Satu dashboard, semua langkah</p>
          <h2 className="act-heading text-[32px] text-[var(--act-ink)] md:text-[40px] md:tracking-[-0.03em]">
            Dari posisimu sekarang ke posisi impian
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-[16px] leading-[1.5] text-[var(--act-charcoal)]">
            Posisi sekarang, posisi impian, dan setiap langkah di antaranya —
            plus skill yang perlu diasah dan lowongan yang cocok, semua rapi
            dalam satu tampilan.
          </p>
        </div>

        {/* Primary mockup — an app window floating over atmospheric glow */}
        <div className="relative mx-auto mt-16 max-w-[860px]">
          {/* soft light blooms instead of flat washes */}
          <div aria-hidden className="absolute -inset-x-16 -inset-y-12 -z-10">
            <div className="absolute left-[8%] top-0 h-64 w-64 rounded-full bg-[var(--act-wash-sky)] opacity-80 blur-3xl" />
            <div className="absolute bottom-0 right-[6%] h-56 w-56 rounded-full bg-[var(--act-wash-lilac)] opacity-70 blur-3xl" />
          </div>

          {/* floating glass chips — depth, like signage on the trail */}
          <div
            aria-hidden
            data-gs="float"
            className="absolute -right-4 -top-7 z-20 hidden md:block lg:-right-14"
          >
            <span className="act-glass-chip-light">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
              Skor match 92%
            </span>
          </div>
          <div
            aria-hidden
            data-gs="float"
            className="absolute -bottom-6 -left-4 z-20 hidden md:block lg:-left-14"
          >
            <span className="act-glass-chip-light">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0098f2]" />
              +3 skill baru minggu ini
            </span>
          </div>

          <div className="act-card-line relative overflow-hidden" data-gs="hero-preview">
            {/* window chrome */}
            <div className="flex items-center gap-3 border-b border-[rgba(15,23,42,0.06)] bg-[var(--act-mist)]/60 px-5 py-3.5">
              <span className="flex gap-1.5">
                <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </span>
              <span className="mx-auto inline-flex items-center gap-2 rounded-full bg-white px-4 py-1 text-[12px] font-medium text-[var(--act-graphite)] ring-1 ring-inset ring-[rgba(15,23,42,0.06)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--act-blue)]" />
                craft.works/roadmap
              </span>
              <span className="w-12" />
            </div>

            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between">
                <span className="act-tag">Roadmap · Frontend Engineer</span>
                <span className="text-[12px] text-[var(--act-graphite)]">Updated today</span>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
                <RolePanel
                  label="POSISI SEKARANG"
                  avatar="iris"
                  glyph="Y"
                  name="Kamu"
                  detail="Mahasiswa · belajar React"
                />
                <div className="flex items-center justify-center">
                  <DashedArrow />
                </div>
                <RolePanel
                  label="POSISI IMPIAN"
                  avatar="magenta"
                  glyph="F"
                  name="Frontend Engineer"
                  detail="Rp9–14jt · remote-friendly"
                />
              </div>

              <div className="mt-7 border-t border-[var(--act-stone)]/30 pt-6">
                <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--act-graphite)]">
                  Langkah berikutnya
                </p>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-3" data-gs="stagger-parent">
                  {[
                    ["1", "Kuasai TypeScript", "2 minggu"],
                    ["2", "Bangun 3 project", "4 minggu"],
                    ["3", "Latihan interview", "1 minggu"],
                  ].map(([n, t, d]) => (
                    <div
                      key={n}
                      data-gs="stagger-child"
                      className="act-rowhover flex items-center gap-3 rounded-[12px] bg-[var(--act-mist)] px-3.5 py-3"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--act-onyx)] text-[12px] font-semibold text-white">
                        {n}
                      </span>
                      <div className="leading-tight">
                        <div className="text-[14px] font-medium text-[var(--act-ink)]">{t}</div>
                        <div className="text-[12px] text-[var(--act-graphite)]">{d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function RolePanel({
  label,
  avatar,
  glyph,
  name,
  detail,
}: {
  label: string;
  avatar: "iris" | "magenta" | "blue";
  glyph: string;
  name: string;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3.5">
      <span className={`act-avatar act-avatar-${avatar} text-[16px] font-semibold`}>
        {glyph}
      </span>
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--act-graphite)]">
          {label}
        </div>
        <div className="act-heading text-[20px] text-[var(--act-ink)]">{name}</div>
        <div className="text-[13px] text-[var(--act-graphite)]">{detail}</div>
      </div>
    </div>
  );
}

/* ================== FEATURES — bento ================== */
function Features() {
  return (
    <section id="features" className="py-24" data-gs="section">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto max-w-[44ch] text-center">
          <p className="act-eyebrow mb-4">Semua alat dalam satu copilot</p>
          <h2 className="act-heading text-[32px] text-[var(--act-ink)] md:text-[40px] md:tracking-[-0.03em]">
            Empat alat, satu copilot
          </h2>
        </div>

        <div
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-6"
          data-gs="stagger-parent"
        >
          {/* 01 — Roadmap personal (featured) */}
          <div
            className="act-feature p-6 sm:col-span-2 lg:col-span-4 lg:p-7"
            style={featureVars("#38bdf8", "#0098f2", "rgba(0,152,242,0.5)")}
            data-gs="stagger-child"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-[40ch]">
                <span className="act-icon-tile">
                  <Compass className="h-5 w-5" />
                </span>
                <h3 className="act-heading mt-5 text-[22px] text-[var(--act-ink)]">
                  Roadmap personal
                </h3>
                <p className="mt-2 text-[14px] leading-[1.55] text-[var(--act-charcoal)]">
                  Jalur belajar yang disusun khusus dari titikmu sekarang
                  menuju peran impian — bukan template umum.
                </p>
              </div>
              {/* mini stepper visual */}
              <div className="w-full rounded-[16px] bg-[var(--act-mist)] p-4 md:max-w-[240px]">
                {[
                  ["Kuasai TypeScript", true],
                  ["Bangun 3 project", true],
                  ["Latihan interview", false],
                ].map(([t, done], i, arr) => (
                  <div key={t as string} className="relative flex items-start gap-3 pb-4 last:pb-0">
                    {i < arr.length - 1 && (
                      <span className="absolute left-[9px] top-5 h-full w-px bg-[var(--act-stone)]/40" />
                    )}
                    <span
                      className={`relative z-10 mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full ${
                        done
                          ? "bg-[var(--act-blue)] text-white"
                          : "bg-white ring-1 ring-inset ring-[var(--act-stone)]/60"
                      }`}
                    >
                      {done ? <Check className="h-2.5 w-2.5" /> : null}
                    </span>
                    <span
                      className={`text-[13px] font-medium ${
                        done ? "text-[var(--act-ink)]" : "text-[var(--act-graphite)]"
                      }`}
                    >
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 02 — Analisis skill-gap */}
          <div
            className="act-feature p-6 lg:col-span-2"
            style={featureVars("#8b78ff", "#6d56fc", "rgba(109,86,252,0.5)")}
            data-gs="stagger-child"
          >
            <span className="act-icon-tile">
              <Gauge className="h-5 w-5" />
            </span>
            <h3 className="act-heading mt-5 text-[20px] text-[var(--act-ink)]">
              Analisis skill-gap
            </h3>
            <p className="mt-2 text-[14px] leading-[1.5] text-[var(--act-charcoal)]">
              AI membaca CV-mu, lalu menunjukkan persis skill mana yang perlu
              diperkuat dulu.
            </p>
            <div className="mt-5 space-y-2.5">
              {[
                ["TypeScript", 72],
                ["Testing", 40],
              ].map(([s, p]) => (
                <div key={s as string}>
                  <div className="mb-1 flex justify-between text-[11px] font-medium text-[var(--act-graphite)]">
                    <span>{s}</span>
                    <span>{p}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-[var(--act-mist)]">
                    <div
                      data-gs="bar"
                      data-w={p}
                      className="h-full rounded-full bg-gradient-to-r from-[#8b78ff] to-[var(--act-iris)]"
                      style={{ width: `${p}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 03 — Job match real-time */}
          <div
            className="act-feature p-6 lg:col-span-3"
            style={featureVars("#ff5cd6", "#f200ca", "rgba(242,0,202,0.4)")}
            data-gs="stagger-child"
          >
            <span className="act-icon-tile">
              <Target className="h-5 w-5" />
            </span>
            <h3 className="act-heading mt-5 text-[20px] text-[var(--act-ink)]">
              Job match real-time
            </h3>
            <p className="mt-2 text-[14px] leading-[1.5] text-[var(--act-charcoal)]">
              Lowongan yang benar-benar cocok dengan skill dan levelmu, lengkap
              dengan skor kecocokan.
            </p>
            <div className="mt-5 flex items-center justify-between rounded-[12px] bg-[var(--act-mist)] px-3.5 py-2.5">
              <span className="text-[13px] font-medium text-[var(--act-ink)]">
                Junior Frontend · Xendit
              </span>
              <span className="rounded-full bg-[rgba(242,0,202,0.1)] px-2.5 py-0.5 text-[12px] font-bold text-[var(--act-magenta)]">
                <span data-gs="count" data-to="92">92</span>%
              </span>
            </div>
          </div>

          {/* 04 — Latihan interview */}
          <div
            className="act-feature p-6 lg:col-span-3"
            style={featureVars("#34d399", "#059669", "rgba(5,150,105,0.45)")}
            data-gs="stagger-child"
          >
            <span className="act-icon-tile">
              <Chat className="h-5 w-5" />
            </span>
            <h3 className="act-heading mt-5 text-[20px] text-[var(--act-ink)]">
              Latihan interview
            </h3>
            <p className="mt-2 text-[14px] leading-[1.5] text-[var(--act-charcoal)]">
              Simulasi tanya-jawab khusus role tujuanmu, dengan feedback yang
              to-the-point setiap kali.
            </p>
            <div className="mt-5 space-y-2">
              <div className="w-fit max-w-[85%] rounded-[12px] rounded-bl-[4px] bg-[var(--act-mist)] px-3.5 py-2 text-[13px] text-[var(--act-charcoal)]">
                Ceritakan project React terbaikmu?
              </div>
              <div className="ml-auto w-fit max-w-[85%] rounded-[12px] rounded-br-[4px] bg-gradient-to-r from-[#34d399] to-[#059669] px-3.5 py-2 text-[13px] font-medium text-white">
                Aku bangun dashboard realtime…
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* CSS custom props for the bento tiles' gradient rail + icon */
function featureVars(from: string, to: string, glow: string) {
  return {
    "--rail-from": from,
    "--rail-to": to,
    "--tile-from": from,
    "--tile-to": to,
    "--tile-glow": glow,
  } as CSSProperties;
}

/* ================== GALLERY — tiles read like miniature heroes ================== */
function Gallery() {
  return (
    <section id="galeri" className="py-24" data-gs="section">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto max-w-[46ch] text-center">
          <p className="act-eyebrow mb-4">Perjalananmu, divisualkan</p>
          <h2 className="act-heading text-[32px] text-[var(--act-ink)] md:text-[40px] md:tracking-[-0.03em]">
            Setiap langkah punya pemandangan
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-[16px] leading-[1.5] text-[var(--act-charcoal)]">
            CraftWorks mengubah rencana abstrak jadi peta yang bisa kamu lihat —
            dari skill yang perlu diasah, lowongan yang cocok, sampai puncak
            tujuan.
          </p>
        </div>

        {/* Wide cinematic visual — scrim + glass caption, like the hero */}
        <figure
          className="group relative mx-auto mt-14 max-w-[1000px] overflow-hidden rounded-[28px] shadow-[rgba(15,23,42,0.16)_0px_32px_70px_-30px]"
          data-gs="hero-preview"
        >
          <div className="relative aspect-[1200/640] w-full overflow-hidden sm:aspect-[1200/560]">
            <Image
              src="/gallery/roadmap.png"
              alt="Jalur pendakian berliku dengan penanda batu menuju puncak berbendera merah di pagi hari"
              fill
              sizes="(max-width: 1000px) 100vw, 1000px"
              className="object-cover object-[50%_30%] transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
            />
            <div className="act-scrim-up absolute inset-0" />
            <figcaption className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
              <div>
                <span className="act-glass-chip">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8]" />
                  Roadmap · Frontend Engineer
                </span>
                <h3 className="act-heading mt-3 text-[22px] text-white sm:text-[26px]">
                  Jalur yang terlihat, bukan tebak-tebakan
                </h3>
              </div>
              <span className="hidden text-[13px] font-medium text-white/75 sm:block">
                Milestone demi milestone, sampai bendera puncak
              </span>
            </figcaption>
          </div>
        </figure>
      </div>
    </section>
  );
}

/* ================== COMPARISON ================== */
function Comparison() {
  const cols = ["CraftWorks", "LinkedIn Premium", "Bootcamp", "Career coach", "Kursus online"];
  type Cell = boolean | "partial" | string;
  const rows: { label: string; cells: Cell[] }[] = [
    {
      label: "Biaya bulanan",
      cells: ["Rp0", "Rp450rb", "Rp15jt+", "Rp500rb / sesi", "Rp200rb"],
    },
    { label: "Roadmap personal", cells: [true, false, "partial", true, false] },
    { label: "Analisis skill-gap", cells: [true, false, true, true, false] },
    { label: "Job match real-time", cells: [true, true, false, false, false] },
    { label: "Latihan interview", cells: [true, false, true, true, false] },
    { label: "Bahasa Indonesia", cells: [true, "partial", true, true, "partial"] },
    {
      label: "Pendamping",
      cells: ["AI 24/7", "—", "Mentor batch", "Coach", "—"],
    },
  ];

  function renderCell(c: Cell, highlight: boolean) {
    if (c === true)
      return (
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
            highlight ? "bg-[var(--act-blue)] text-white" : "bg-[rgba(0,152,242,0.1)] text-[var(--act-blue)]"
          }`}
        >
          <Check className="h-3.5 w-3.5" />
        </span>
      );
    if (c === false)
      return <Minus className="mx-auto h-5 w-5 text-[var(--act-stone)]" />;
    if (c === "partial")
      return <span className="text-[14px] text-[var(--act-graphite)]">Sebagian</span>;
    return (
      <span
        className={`text-[14px] ${
          highlight ? "font-semibold text-[var(--act-ink)]" : "text-[var(--act-graphite)]"
        }`}
      >
        {c}
      </span>
    );
  }

  return (
    <section className="act-band-sky py-20" data-gs="section">
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="mx-auto max-w-[40ch] text-center">
          <span className="inline-flex rounded-full bg-[rgba(0,152,242,0.1)] px-4 py-1.5 text-[13px] font-medium text-[var(--act-blue)]">
            Lebih lengkap dari LinkedIn, bootcamp & kursus
          </span>
          <h2 className="act-display mt-6 text-[34px] text-[var(--act-ink)] md:text-[48px]">
            Roadmap, skill-gap, job match. Tanpa langganan.
          </h2>
          <p className="mx-auto mt-4 max-w-[46ch] text-[16px] leading-[1.5] text-[var(--act-charcoal)]">
            Bayar nol, dapat pendamping karir penuh. Mulai dari memetakan
            skill sampai latihan interview — semua dalam satu tempat.
          </p>
          <div className="mt-7 flex flex-col items-center gap-2">
            <Link href="/onboarding" className="act-pill">
              Buat roadmap pertama
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <span className="text-[13px] text-[var(--act-graphite)]">Gratis selamanya</span>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
            {["0 biaya langganan", "Roadmap personal", "Job match real-time"].map((t) => (
              <span key={t} className="inline-flex items-center gap-2 text-[14px] font-medium text-[var(--act-ink)]">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--act-blue)] text-white">
                  <Check className="h-3 w-3" />
                </span>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-14 overflow-x-auto">
          <div className="act-card-line min-w-[760px] overflow-hidden rounded-[24px]" data-gs="stagger-parent">
            {/* header row */}
            <div className="grid grid-cols-[1.3fr_repeat(5,1fr)] border-b border-[var(--act-stone)]/25">
              <div className="px-6 py-5" />
              {cols.map((c, i) => (
                <div
                  key={c}
                  className={`relative flex flex-col items-center justify-center gap-1.5 px-3 py-4 text-center text-[14px] font-semibold ${
                    i === 0
                      ? "bg-gradient-to-b from-[rgba(0,152,242,0.1)] to-[rgba(0,152,242,0.04)] text-[var(--act-blue)]"
                      : "text-[var(--act-graphite)]"
                  }`}
                >
                  {i === 0 && (
                    <>
                      <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#38bdf8] to-[var(--act-blue)]" />
                      <span className="rounded-full bg-[var(--act-onyx)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-white">
                        Rekomendasi
                      </span>
                    </>
                  )}
                  {c}
                </div>
              ))}
            </div>

            {rows.map((r, ri) => (
              <div
                key={r.label}
                data-gs="stagger-child"
                className={`act-rowhover grid grid-cols-[1.3fr_repeat(5,1fr)] items-center ${
                  ri !== rows.length - 1 ? "border-b border-[var(--act-stone)]/20" : ""
                }`}
              >
                <div className="px-6 py-5 text-[14px] font-medium text-[var(--act-ink)]">
                  {r.label}
                </div>
                {r.cells.map((cell, ci) => (
                  <div
                    key={ci}
                    className={`px-3 py-5 text-center ${
                      ci === 0
                        ? "bg-[rgba(0,152,242,0.05)] shadow-[inset_1px_0_0_rgba(0,152,242,0.14),inset_-1px_0_0_rgba(0,152,242,0.14)]"
                        : ""
                    }`}
                  >
                    {renderCell(cell, ci === 0)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================== JOURNEY BAND — dark cinematic moment, echoes the hero ================== */
function JourneyBand() {
  const stats: { value: string; count?: string; suffix: string; label: string }[] = [
    { value: "12.4", count: "12.4", suffix: "rb+", label: "roadmap dibuat" },
    { value: "72", count: "72", suffix: "%", label: "rata-rata skor match" },
    { value: "3.1", count: "3.1", suffix: "bln", label: "menuju kerja pertama" },
    { value: "Rp0", suffix: "", label: "biaya langganan" },
  ];
  return (
    <section className="act-cinema act-grain" data-gs="section">
      {/* night at base camp — pure dark band, sky glow only */}
      <div className="act-cinema-scrim absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-[1100px] px-6 py-24 md:py-28">
        <div className="mx-auto max-w-[760px] text-center">
          <span className="act-glass-chip">
            <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8]" />
            Cerita dari jalur
          </span>
          <blockquote className="act-heading mx-auto mt-7 max-w-[28ch] text-[26px] leading-[1.3] text-white md:text-[34px]">
            “Skill, lowongan, sampai latihan interview semua di satu tempat —
            aku nggak bingung lagi harus ngapain. Tiga bulan kemudian aku tanda
            tangan kontrak pertama.”
          </blockquote>
          <div className="mt-7 flex flex-col items-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#38bdf8] to-[var(--act-iris)] text-[15px] font-bold text-white ring-2 ring-white/25">
              DA
            </span>
            <p className="act-script mt-3 text-[24px] text-[#bae6fd]">Dewi Anggraini</p>
            <p className="mt-0.5 text-[13px] text-white/65">
              Frontend Engineer · ex-mahasiswa Informatika
            </p>
          </div>
        </div>

        {/* Stats — milestones logged at base camp */}
        <div className="mt-16 grid grid-cols-2 gap-y-10 border-t border-white/12 pt-12 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="act-display text-[40px] text-white md:text-[48px]">
                {s.count ? (
                  <span data-gs="count" data-to={s.count}>
                    {s.value}
                  </span>
                ) : (
                  <span>{s.value}</span>
                )}
                {s.suffix && (
                  <span className="ml-1 align-baseline text-[20px] font-semibold text-[#7dd3fc] md:text-[24px]">
                    {s.suffix}
                  </span>
                )}
              </div>
              <div className="mt-1.5 text-[13.5px] text-white/65">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================== FAQ ================== */
function FAQ() {
  const faqs = [
    ["Apakah benar-benar gratis?", "Fitur inti — roadmap, analisis skill-gap, dan job match — bisa dipakai tanpa biaya langganan. Kami tidak menyimpan kartu kredit kamu."],
    ["Cocok untuk siapa saja?", "Untuk siapa pun yang sedang menata karir — mahasiswa tingkat akhir, fresh graduate yang cari kerja pertama, sampai pekerja yang mau pindah jalur. CraftWorks menyesuaikan roadmap dengan titik awal masing-masing."],
    ["Dari mana data lowongannya?", "Kami mengumpulkan lowongan dari berbagai sumber publik dan mencocokkannya dengan profil skill kamu secara real-time."],
    ["Apakah CV saya aman?", "Data kamu dienkripsi dan hanya dipakai untuk menyusun roadmap dan rekomendasi. Kamu bisa menghapusnya kapan saja."],
    ["Bahasa apa yang didukung?", "Antarmuka dan percakapan tersedia dalam Bahasa Indonesia, dengan dukungan istilah teknis berbahasa Inggris."],
  ];
  return (
    <section id="faq" className="py-24" data-gs="section">
      <div className="mx-auto max-w-[760px] px-6">
        <div className="mb-10 text-center">
          <p className="act-eyebrow mb-4">Masih penasaran?</p>
          <h2 className="act-heading text-[32px] text-[var(--act-ink)] md:text-[40px] md:tracking-[-0.03em]">
            Pertanyaan umum
          </h2>
        </div>

        <div className="space-y-3" data-gs="stagger-parent">
          {faqs.map(([q, a], i) => (
            <details
              key={q}
              className="act-faq-card group"
              open={i === 0}
              data-gs="stagger-child"
            >
              <summary className="flex items-center justify-between gap-6 px-5 py-4.5 sm:px-6 sm:py-5">
                <span className="text-[15.5px] font-medium text-[var(--act-ink)]">{q}</span>
                <Plus className="act-faq-sign h-7 w-7 flex-none p-1.5 text-[var(--act-ink)]" />
              </summary>
              <p className="-mt-1 px-5 pb-5 text-[14.5px] leading-[1.6] text-[var(--act-charcoal)] sm:px-6">
                {a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================== FINALE — full-bleed CTA + footer, the hero's bookend ================== */
function Footer() {
  return (
    <footer className="act-cinema act-grain text-white">
      <Image
        src="/hero/footer.png"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="act-kenburns object-cover object-[60%_45%]"
      />
      <div className="act-cinema-scrim-footer absolute inset-0 z-[1]" />

      <div className="relative z-10 mx-auto max-w-[1200px] px-6">
        {/* The second summit — CTA over the open landscape */}
        <div className="pb-5 pt-12 text-center md:pb-6 md:pt-14" data-gs="section">
          <span className="act-glass-chip">
            <Check className="h-3.5 w-3.5 text-[#38bdf8]" />
            Gratis · tanpa kartu kredit
          </span>
          <h2 className="act-display mx-auto mt-5 text-[30px] leading-[1.04] text-white sm:text-[40px] md:text-[48px]">
            Puncakmu sudah{" "}
            <span className="act-script whitespace-nowrap text-[1.14em] leading-none text-[#7dd3fc]">
              menunggu
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-[15px] leading-[1.6] text-white/85 md:text-[16px]">
            Buat roadmap pertamamu dalam 60 detik. Tanpa kartu kredit, tanpa
            langganan, tanpa drama — tinggal melangkah.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
            <Link href="/onboarding" className="act-pill-hero">
              Mulai gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#showcase" className="act-pill-ghost-hero">
              Lihat contoh
            </a>
          </div>
          <p className="act-script mt-6 text-[19px] text-[#bae6fd]/90">
            sampai jumpa di puncak
          </p>
        </div>

        {/* Trailhead at night — links over the darkest scrim */}
        <div className="pb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="flex flex-col items-start justify-between gap-8 pt-6 md:flex-row">
            <div className="max-w-[34ch]">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-white/10 ring-1 ring-inset ring-white/20">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                    <path
                      d="M5 19V5M5 12c4-6 10-6 14 0"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="act-heading text-[20px] text-white">
                  Craft<span className="text-[#7dd3fc]">Works</span>
                </span>
              </Link>
              <p className="mt-4 text-[14px] leading-[1.6] text-white/65">
                Pelatih karir AI yang menemani kamu dari nol sampai dapat kerja
                atau project pertama.
              </p>
              <div className="mt-5 flex gap-2.5">
                {[
                  [
                    "X",
                    "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25h6.826l4.713 6.231 5.451-6.231z",
                  ],
                  [
                    "LinkedIn",
                    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 11.001-4.124 2.062 2.062 0 01-.001 4.124zm1.777 13.019H3.56V9h3.554v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
                  ],
                  [
                    "Instagram",
                    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838a6 6 0 100 12 6 6 0 000-12zm0 9.9a3.9 3.9 0 110-7.8 3.9 3.9 0 010 7.8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
                  ],
                ].map(([label, d]) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/65 ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/15 hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d={d} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-14 gap-y-6 text-[14px] sm:grid-cols-3">
              {[
                ["Produk", ["Roadmap", "Skill-gap", "Job match"]],
                ["Perusahaan", ["Tentang", "Blog", "Karier"]],
                ["Bantuan", ["FAQ", "Kontak", "Privasi"]],
              ].map(([title, items]) => (
                <div key={title as string}>
                  <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/45">
                    {title as string}
                  </div>
                  <ul className="space-y-2">
                    {(items as string[]).map((it) => (
                      <li key={it}>
                        <a
                          href="#"
                          className="inline-block text-white/75 transition-all hover:translate-x-0.5 hover:text-white"
                        >
                          {it}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-[13px] text-white/50 sm:flex-row">
            <span>© {new Date().getFullYear()} CraftWorks · Made in Jakarta</span>
            <span className="act-script text-[18px] text-[#7dd3fc]/80">
              jalan setapak menuju puncak
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* =====================================================
   ICONS & MARKS — minimal, hairline stroke
   ===================================================== */
function Wordmark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--act-onyx)]">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <path d="M5 19V5M5 12c4-6 10-6 14 0" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Minus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DashedArrow() {
  return (
    <svg viewBox="0 0 80 24" className="h-6 w-20 rotate-90 text-[var(--act-stone)] md:rotate-0" fill="none">
      <path d="M2 12h64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 6" />
      <path d="M62 6l8 6-8 6" stroke="var(--act-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Compass({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function Gauge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M4 18a8 8 0 1116 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 18l4-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Target({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function Chat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M5 6h14a1 1 0 011 1v8a1 1 0 01-1 1H9l-4 3V7a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
