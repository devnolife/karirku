import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import {
  ArrowRight as PhArrowRight,
  Check as PhCheck,
  Plus as PhPlus,
  Minus as PhMinus,
  Compass as PhCompass,
  Gauge as PhGauge,
  Target as PhTarget,
  ChatCircle as PhChat,
} from "@phosphor-icons/react/dist/ssr";
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
        alt="Lembah hijau dengan jalan setapak menuju pegunungan, metafora perjalanan karir"
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

      <div className="relative z-10 mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-6 pt-14 pb-24 sm:pt-16 sm:pb-28 md:pt-20 md:pb-32 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Copy — left aligned */}
        <div className="text-center lg:text-left">
          <p data-gs="hero-fade" className="mb-5 text-[14px] font-medium tracking-[0.01em] text-white/80">
            Copilot karir untuk semua
          </p>

          <h1
            data-gs="hero-line"
            className="act-display mx-auto max-w-[16ch] text-[40px] text-white sm:text-[54px] md:text-[60px] lg:mx-0"
          >
            Karirmu, akhirnya terarah
          </h1>

          <p
            data-gs="hero-fade"
            className="mx-auto mt-6 max-w-[46ch] text-[16px] leading-[1.5] text-white/85 lg:mx-0"
          >
            Skill, roadmap, lowongan, sampai latihan interview. Semua di satu
            tempat.
          </p>

          <div data-gs="hero-fade" className="mt-8 flex items-center justify-center gap-2 lg:justify-start">
            <Link href="/onboarding" className="act-pill-light">
              Mulai gratis
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href="#showcase"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-3 text-[14px] font-medium text-white transition-colors hover:bg-white/10"
            >
              Lihat contoh
            </a>
          </div>
        </div>

        {/* Glass roadmap preview — real mini component, floats over the valley */}
        <div data-gs="hero-fade" className="hidden lg:block">
          <div className="rounded-[22px] border border-white/25 bg-white/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_24px_60px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/70">
                Roadmap kamu
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                16 minggu
              </span>
            </div>
            <div className="mt-4 space-y-2.5">
              {[
                ["Kuasai TypeScript", "minggu 1-2", true],
                ["Bangun 3 project", "minggu 3-6", true],
                ["Latihan interview", "minggu 7", false],
              ].map(([t, d, done]) => (
                <div
                  key={t as string}
                  className="flex items-center gap-3 rounded-[14px] bg-white/10 px-3.5 py-3 ring-1 ring-inset ring-white/10"
                >
                  <span
                    className={`flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full ${
                      done ? "bg-[#5cb3e8] text-white" : "bg-white/15 text-white/50"
                    }`}
                  >
                    {done ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  <div className="leading-tight">
                    <div className="text-[14px] font-semibold text-white">{t}</div>
                    <div className="text-[11.5px] text-white/60">{d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3.5">
              <span className="text-[12px] text-white/65">Skor match terbaik</span>
              <span className="text-[15px] font-bold text-[#7dd3fc]">
                <span data-gs="count" data-to="92">92</span>%
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================== LOGO CLOUD — glass proof bar over the hero edge ================== */
function LogoCloud() {
  const logos = [
    ["Gojek", "/logos/gojek.svg"],
    ["Grab", "/logos/grab.svg"],
    ["Shopee", "/logos/shopee.svg"],
    ["Bukalapak", "/logos/bukalapak.svg"],
    ["Xendit", "/logos/xendit.svg"],
    ["Blibli", "/logos/blibli.svg"],
  ];
  return (
    <section className="relative z-20 -mt-10 px-6 sm:-mt-12">
      <div className="act-proofbar mx-auto max-w-[1100px] rounded-[22px] px-6 py-5 sm:rounded-[26px] sm:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
          <p className="flex-none text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--act-graphite)]">
            Bersiap melamar ke perusahaan seperti
          </p>
          <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="act-marquee items-center">
              {[0, 1].map((k) =>
                logos.map(([name, src]) => (
                  <Image
                    key={`${k}-${name}`}
                    src={src}
                    alt={name}
                    width={26}
                    height={26}
                    className="mx-8 h-[26px] w-auto opacity-70 transition-opacity hover:opacity-100"
                  />
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
          <h2 className="act-heading text-[32px] text-[var(--act-ink)] md:text-[40px] md:tracking-[-0.03em]">
            Dari posisimu sekarang ke posisi impian
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-[16px] leading-[1.5] text-[var(--act-charcoal)]">
            Posisi sekarang, posisi impian, dan setiap langkah di antaranya.
            Plus skill yang perlu diasah dan lowongan yang cocok, semua rapi
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

          {/* floating glass chips — depth, like signage on the trail (angka contoh/mock) */}
          <div
            aria-hidden
            data-gs="float"
            className="absolute -right-4 -top-7 z-20 hidden md:block lg:-right-14"
          >
            <span className="act-glass-chip-light">Skor match 92%</span>
          </div>
          <div
            aria-hidden
            data-gs="float"
            className="absolute -bottom-6 -left-4 z-20 hidden md:block lg:-left-14"
          >
            <span className="act-glass-chip-light">+3 skill baru minggu ini</span>
          </div>

          <div className="act-card-line act-tilt relative overflow-hidden" data-gs="hero-preview" data-gs-tilt>
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
                  detail="Rp9-14jt · remote-friendly"
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
            style={featureVars("#5cb3e8", "#2b8fd6", "rgba(43,143,214,0.45)")}
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
                  menuju peran impian, bukan template umum.
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
                      className={`relative z-10 mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full ${done
                        ? "bg-[var(--act-blue)] text-white"
                        : "bg-white ring-1 ring-inset ring-[var(--act-stone)]/60"
                        }`}
                    >
                      {done ? <Check className="h-2.5 w-2.5" /> : null}
                    </span>
                    <span
                      className={`text-[13px] font-medium ${done ? "text-[var(--act-ink)]" : "text-[var(--act-graphite)]"
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
            style={featureVars(
              "#948ae3",
              "#7568d9",
              "rgba(117,104,217,0.45)",
              "radial-gradient(120% 130% at 50% 0%, #f0eefb, var(--act-wash-lilac) 82%)"
            )}
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
                      className="h-full rounded-full bg-gradient-to-r from-[#948ae3] to-[var(--act-iris)]"
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
            style={featureVars("#eab264", "#e29a3c", "rgba(226,154,60,0.4)")}
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
              <span className="rounded-full bg-[rgba(245,158,11,0.12)] px-2.5 py-0.5 text-[12px] font-bold text-[#b45309]">
                <span data-gs="count" data-to="92">92</span>%
              </span>
            </div>
          </div>

          {/* 04 — Latihan interview */}
          <div
            className="act-feature p-6 lg:col-span-3"
            style={featureVars(
              "#5eb3a4",
              "#3d9a8b",
              "rgba(61,154,139,0.45)",
              "radial-gradient(120% 130% at 50% 0%, #e9f5f0, var(--act-wash-mint) 86%)"
            )}
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
              <div className="ml-auto w-fit max-w-[85%] rounded-[12px] rounded-br-[4px] bg-gradient-to-r from-[#5eb3a4] to-[#3d9a8b] px-3.5 py-2 text-[13px] font-medium text-white">
                Aku bangun dashboard realtime…
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* CSS custom props for the bento tiles' gradient rail + icon.
   `bg` opsional: tinted wash agar grid tidak putih-putih semua. */
function featureVars(from: string, to: string, glow: string, bg?: string) {
  return {
    "--rail-from": from,
    "--rail-to": to,
    "--tile-from": from,
    "--tile-to": to,
    "--tile-glow": glow,
    ...(bg ? { "--feature-bg": bg } : {}),
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
            CraftWorks mengubah rencana abstrak jadi peta yang bisa kamu lihat.
            Dari skill yang perlu diasah, lowongan yang cocok, sampai puncak
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
            <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <div>
                <span className="act-glass-chip">Roadmap · Frontend Engineer</span>
                <h3 className="act-heading mt-3 text-[22px] text-white sm:text-[26px]">
                  Jalur yang terlihat, bukan tebak-tebakan
                </h3>
              </div>
            </figcaption>
          </div>
        </figure>
      </div>
    </section>
  );
}

/* ================== COMPARISON — featured card vs compact competitors ================== */
function Comparison() {
  const features = [
    "Roadmap personal",
    "Analisis skill-gap",
    "Job match real-time",
    "Latihan interview",
    "Bahasa Indonesia",
    "Pendamping AI 24/7",
  ];
  /* Kompetitor: harga + fitur yang TIDAK didapat */
  const others: { name: string; price: string; missing: string[] }[] = [
    { name: "LinkedIn Premium", price: "Rp450rb/bln", missing: ["Roadmap personal", "Skill-gap", "Latihan interview"] },
    { name: "Bootcamp", price: "Rp15jt+", missing: ["Job match real-time", "Pendamping 24/7"] },
    { name: "Career coach", price: "Rp500rb/sesi", missing: ["Job match real-time", "Selalu tersedia"] },
    { name: "Kursus online", price: "Rp200rb/bln", missing: ["Roadmap personal", "Job match", "Interview"] },
  ];

  return (
    <section className="act-band-sky py-20" data-gs="section">
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="mx-auto max-w-[40ch] text-center">
          <h2 className="act-display text-[34px] text-[var(--act-ink)] md:text-[48px]">
            Roadmap, skill-gap, job match. Tanpa langganan.
          </h2>
          <p className="mx-auto mt-4 max-w-[46ch] text-[16px] leading-[1.5] text-[var(--act-charcoal)]">
            Bayar nol, dapat pendamping karir penuh. Mulai dari memetakan
            skill sampai latihan interview, semua dalam satu tempat.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_1fr]" data-gs="stagger-parent">
          {/* Featured — CraftWorks */}
          <div
            data-gs="stagger-child"
            className="relative overflow-hidden rounded-[26px] bg-[var(--act-onyx)] p-7 text-white shadow-[0_30px_70px_-28px_rgba(13,17,27,0.55)] md:p-9"
          >
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(480px_260px_at_85%_0%,rgba(56,189,248,0.25),transparent_60%),radial-gradient(420px_240px_at_0%_100%,rgba(109,86,252,0.2),transparent_60%)]"
            />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="act-heading text-[22px]">
                  Craft<span className="text-[#7dd3fc]">Works</span>
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em]">
                  Rekomendasi
                </span>
              </div>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="act-display text-[52px] leading-none">Rp0</span>
                <span className="text-[15px] text-white/70">selamanya</span>
              </div>
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[14px] font-medium">
                    <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#5cb3e8] text-white">
                      <Check className="h-3 w-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/onboarding" className="act-pill-light mt-8 inline-flex">
                Mulai gratis
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Competitors — compact 2x2 */}
          <div className="grid gap-4 sm:grid-cols-2">
            {others.map((o) => (
              <div
                key={o.name}
                data-gs="stagger-child"
                className="act-card-2 flex flex-col p-5"
              >
                <span className="text-[15px] font-semibold text-[var(--act-ink)]">{o.name}</span>
                <span className="mt-1 text-[13px] font-medium text-[var(--act-graphite)]">{o.price}</span>
                <ul className="mt-4 space-y-1.5 border-t border-[rgba(15,23,42,0.07)] pt-3.5">
                  {o.missing.map((m) => (
                    <li key={m} className="flex items-center gap-2 text-[12.5px] text-[var(--act-graphite)]">
                      <Minus className="h-3.5 w-3.5 flex-none text-[var(--act-stone)]" />
                      {m}
                    </li>
                  ))}
                </ul>
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
  /* Angka di bawah adalah data contoh (mock) untuk demo. */
  return (
    <section className="act-cinema act-grain" data-gs="section">
      {/* night at base camp — pure dark band, sky glow only */}
      <div className="act-cinema-scrim absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-[1100px] px-6 py-24 md:py-28">
        <div className="mx-auto max-w-[760px] text-center">
          <blockquote className="act-heading mx-auto max-w-[28ch] text-[26px] leading-[1.3] text-white md:text-[34px]">
            “Skill, lowongan, sampai latihan interview semua di satu tempat.
            Aku nggak bingung lagi harus ngapain. Tiga bulan kemudian aku tanda
            tangan kontrak pertama.”
          </blockquote>
          <div className="mt-7 flex flex-col items-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#5cb3e8] to-[var(--act-iris)] text-[15px] font-bold text-white ring-2 ring-white/25">
              DA
            </span>
            <p className="act-script mt-3 text-[24px] text-[#bae6fd]">Dewi Anggraini</p>
            <p className="mt-0.5 text-[13px] text-white/65">
              Frontend Engineer · ex-mahasiswa Informatika
            </p>
          </div>
        </div>

        {/* Stats — one featured milestone + three supporting */}
        <div
          className="mt-16 grid gap-4 border-t border-white/12 pt-12 md:grid-cols-[1.2fr_repeat(3,1fr)] md:gap-6"
          data-gs="stagger-parent"
        >
          {/* Featured stat */}
          <div
            data-gs="stagger-child"
            className="rounded-[20px] bg-white/[0.07] p-6 ring-1 ring-inset ring-white/15 backdrop-blur-sm md:p-7"
          >
            <div className="act-display text-[56px] leading-none text-white md:text-[64px]">
              <span data-gs="count" data-to="12.4">12.4</span>
              <span className="ml-1 align-baseline text-[24px] font-semibold text-[#7dd3fc]">rb+</span>
            </div>
            <div className="mt-2 text-[14.5px] font-medium text-white/80">roadmap dibuat</div>
            <div className="mt-1 text-[12.5px] text-white/50">dan terus bertambah tiap hari</div>
          </div>
          {/* Supporting stats */}
          {[
            { count: "72", suffix: "%", label: "rata-rata skor match" },
            { count: "3.1", suffix: "bln", label: "menuju kerja pertama" },
            { value: "Rp0", suffix: "", label: "biaya langganan" },
          ].map((s) => (
            <div
              key={s.label}
              data-gs="stagger-child"
              className="flex flex-col justify-center rounded-[20px] p-5 text-center ring-1 ring-inset ring-white/10 md:p-6"
            >
              <div className="act-display text-[34px] text-white md:text-[38px]">
                {s.count ? (
                  <span data-gs="count" data-to={s.count}>{s.count}</span>
                ) : (
                  <span>{s.value}</span>
                )}
                {s.suffix && (
                  <span className="ml-1 align-baseline text-[17px] font-semibold text-[#7dd3fc]">
                    {s.suffix}
                  </span>
                )}
              </div>
              <div className="mt-1.5 text-[13px] text-white/65">{s.label}</div>
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
    ["Apakah benar-benar gratis?", "Fitur inti (roadmap, analisis skill-gap, dan job match) bisa dipakai tanpa biaya langganan. Kami tidak menyimpan kartu kredit kamu."],
    ["Cocok untuk siapa saja?", "Untuk siapa pun yang sedang menata karir: mahasiswa tingkat akhir, fresh graduate yang cari kerja pertama, sampai pekerja yang mau pindah jalur. CraftWorks menyesuaikan roadmap dengan titik awal masing-masing."],
    ["Dari mana data lowongannya?", "Kami mengumpulkan lowongan dari berbagai sumber publik dan mencocokkannya dengan profil skill kamu secara real-time."],
    ["Apakah CV saya aman?", "Data kamu dienkripsi dan hanya dipakai untuk menyusun roadmap dan rekomendasi. Kamu bisa menghapusnya kapan saja."],
    ["Bahasa apa yang didukung?", "Antarmuka dan percakapan tersedia dalam Bahasa Indonesia, dengan dukungan istilah teknis berbahasa Inggris."],
  ];
  return (
    <section id="faq" className="py-24" data-gs="section">
      <div className="mx-auto max-w-[760px] px-6">
        <div className="mb-10 text-center">
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
            <Check className="h-3.5 w-3.5 text-[#5cb3e8]" />
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
            langganan, tanpa drama. Tinggal melangkah.
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
   ICONS & MARKS
   Glyph icons: Phosphor (weight distandarkan; "bold" untuk
   glyph kecil, "regular" untuk icon tile). Wordmark & DashedArrow
   tetap lokal: brand mark & konektor diagram, bukan icon glyph.
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
  return <PhArrowRight weight="bold" className={className} />;
}

function Check({ className }: { className?: string }) {
  return <PhCheck weight="bold" className={className} />;
}

function Plus({ className }: { className?: string }) {
  return <PhPlus weight="bold" className={className} />;
}

function Minus({ className }: { className?: string }) {
  return <PhMinus weight="bold" className={className} />;
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
  return <PhCompass className={className} />;
}

function Gauge({ className }: { className?: string }) {
  return <PhGauge className={className} />;
}

function Target({ className }: { className?: string }) {
  return <PhTarget className={className} />;
}

function Chat({ className }: { className?: string }) {
  return <PhChat className={className} />;
}
