import Link from "next/link";
import Image from "next/image";
import { LandingAnimator } from "@/components/LandingAnimator";

/* =========================================================
   Karir.ai — Landing V4
   "Clean Paper Desk" — the Acctual design system.
   Near-monochrome paper neutrals, hairline borders, soft
   20–32px radii, a single dark onyx pill CTA. Chromatic
   color (Invoice Blue, magenta, iris) appears only as small
   functional punctuation — checkmarks, eyebrow tags, avatar
   tiles, pastel washes behind product cards. Restraint as
   the whole point: papers fanned out on a desk at dusk.
   ========================================================= */

export default function LandingV4() {
  return (
    <main className="act-page act-sans relative min-h-screen overflow-x-clip">
      <Hero />
      <LogoCloud />
      <ProductShowcase />
      <Features />
      <HowItWorks />
      <Testimonial />
      <Stats />
      <FAQ />
      <CTA />
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
    ["Cara kerja", "#how"],
    ["FAQ", "#faq"],
  ];
  return (
    <header>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5">
        <Link href="/v4" className="flex items-center gap-2.5">
          <Wordmark />
          <span className="act-heading text-[20px] text-white">
            Karir<span className="text-white/70">.ai</span>
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
          Pelatih karir AI · tanpa biaya langganan
        </p>

        <h1
          data-gs="hero-line"
          className="act-display mx-auto max-w-[16ch] text-[40px] text-white sm:text-[54px] md:text-[64px]"
        >
          Karir yang bekerja lebih keras
        </h1>

        <p
          data-gs="hero-fade"
          className="mx-auto mt-6 max-w-[54ch] text-[16px] leading-[1.5] text-white/85"
        >
          Dari nol sampai dapat kerja atau project pertama. Karir.ai memetakan
          skill-gap kamu, menyusun roadmap, dan menemani setiap langkah —
          setenang jalan setapak menuju puncak.
        </p>

        <div data-gs="hero-fade" className="mt-8 flex items-center justify-center gap-2">
          <Link href="/onboarding" className="act-pill-light">
            Buat roadmap
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
            "0 biaya langganan",
            "Roadmap dalam 60 detik",
            "Cocok untuk fresh grad & switcher",
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

/* ================== LOGO CLOUD ================== */
function LogoCloud() {
  const logos = [
    "Tokopedia", "Gojek", "Traveloka", "Bukalapak", "Ruangguru",
    "Xendit", "Dana", "Blibli", "Vidio", "Ajaib",
  ];
  return (
    <section className="border-y border-[var(--act-stone)]/30 bg-[var(--act-mist)] py-7">
      <div className="mx-auto max-w-[1200px] px-6">
        <p className="mb-5 text-center text-[12px] text-[var(--act-graphite)]">
          Talenta kami berlabuh di tim-tim terbaik
        </p>
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="act-marquee">
            {[0, 1].map((k) =>
              logos.map((name, i) => (
                <span
                  key={`${k}-${i}`}
                  className="mx-8 text-[18px] font-semibold tracking-tight text-[var(--act-graphite)]"
                >
                  {name}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================== PRODUCT SHOWCASE ================== */
function ProductShowcase() {
  return (
    <section id="showcase" className="relative py-20" data-gs="section">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto max-w-[44ch] text-center">
          <p className="act-eyebrow mb-4">Satu kartu, seluruh peta</p>
          <h2 className="act-heading text-[32px] text-[var(--act-ink)] md:text-[40px] md:tracking-[-0.03em]">
            Lihat jalurmu seperti membaca invoice
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-[16px] leading-[1.5] text-[var(--act-charcoal)]">
            Posisi sekarang, posisi impian, dan setiap langkah di antaranya —
            terbaca rapi dalam satu kartu putih bersih.
          </p>
        </div>

        {/* Primary mockup over a sky wash */}
        <div className="relative mx-auto mt-14 max-w-[860px]">
          <div className="absolute -inset-x-6 -inset-y-8 act-wash-sky rounded-[32px]" />
          <div className="act-card relative p-6 md:p-8" data-gs="hero-preview">
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
              <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                {[
                  ["1", "Kuasai TypeScript", "2 minggu"],
                  ["2", "Bangun 3 project", "4 minggu"],
                  ["3", "Latihan interview", "1 minggu"],
                ].map(([n, t, d]) => (
                  <div
                    key={n}
                    className="flex items-center gap-3 rounded-[12px] bg-[var(--act-mist)] px-3.5 py-3"
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

        {/* Two satellite cards on rotating pastel washes */}
        <div
          className="mt-8 grid gap-6 md:grid-cols-2"
          data-gs="stagger-parent"
        >
          <SatelliteCard
            wash="act-wash-lilac"
            tag="Skill-gap"
            tagColor="iris"
            title="Apa yang kurang"
            rows={[
              ["TypeScript", 72],
              ["Testing", 40],
              ["System design", 28],
            ]}
          />
          <SatelliteCard
            wash="act-wash-petal"
            tag="Job match"
            tagColor="magenta"
            title="Cocok untukmu"
            matches={[
              ["Junior Frontend · Xendit", "92%"],
              ["React Dev · Vidio", "88%"],
              ["Web Engineer · Dana", "81%"],
            ]}
          />
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

function SatelliteCard({
  wash,
  tag,
  tagColor,
  title,
  rows,
  matches,
}: {
  wash: string;
  tag: string;
  tagColor: "iris" | "magenta";
  title: string;
  rows?: [string, number][];
  matches?: [string, string][];
}) {
  const accent = tagColor === "iris" ? "var(--act-iris)" : "var(--act-magenta)";
  return (
    <div className="relative" data-gs="stagger-child">
      <div className={`absolute -inset-x-4 -inset-y-5 ${wash} rounded-[28px]`} />
      <div className="act-card relative p-6">
        <span
          className="act-tag"
          style={{ background: `${accent}14`, color: accent }}
        >
          {tag}
        </span>
        <h3 className="act-heading mt-4 text-[20px] text-[var(--act-ink)]">{title}</h3>

        {rows && (
          <div className="mt-5 space-y-3.5">
            {rows.map(([skill, pct]) => (
              <div key={skill}>
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="font-medium text-[var(--act-charcoal)]">{skill}</span>
                  <span className="text-[var(--act-graphite)]">{pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--act-mist)]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: accent }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {matches && (
          <div className="mt-5 space-y-2.5">
            {matches.map(([role, score]) => (
              <div
                key={role}
                className="flex items-center justify-between rounded-[12px] bg-[var(--act-mist)] px-3.5 py-2.5"
              >
                <span className="text-[14px] font-medium text-[var(--act-ink)]">{role}</span>
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: accent }}
                >
                  {score}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================== FEATURES ================== */
function Features() {
  const features = [
    {
      icon: <Compass className="h-5 w-5" />,
      title: "Roadmap personal",
      body: "Jalur belajar yang disusun dari posisimu sekarang menuju peran yang kamu incar — bukan template generik.",
    },
    {
      icon: <Gauge className="h-5 w-5" />,
      title: "Analisis skill-gap",
      body: "AI membaca CV dan pengalamanmu, lalu menunjukkan persis skill mana yang perlu diperkuat dulu.",
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: "Job match real-time",
      body: "Lowongan yang benar-benar cocok dengan skill dan levelmu, lengkap dengan skor kecocokan.",
    },
    {
      icon: <Chat className="h-5 w-5" />,
      title: "Latihan interview",
      body: "Simulasi tanya-jawab khusus role tujuanmu, dengan feedback yang to-the-point setiap kali.",
    },
  ];
  return (
    <section id="features" className="py-20" data-gs="section">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto max-w-[44ch] text-center">
          <p className="act-eyebrow mb-4">Semua di satu meja</p>
          <h2 className="act-heading text-[32px] text-[var(--act-ink)] md:text-[40px] md:tracking-[-0.03em]">
            Empat alat, satu copilot
          </h2>
        </div>

        <div
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          data-gs="stagger-parent"
        >
          {features.map((f) => (
            <div
              key={f.title}
              className="act-card p-6"
              data-gs="stagger-child"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--act-mist)] text-[var(--act-blue)]">
                {f.icon}
              </span>
              <h3 className="act-heading mt-5 text-[20px] text-[var(--act-ink)]">{f.title}</h3>
              <p className="mt-2 text-[14px] leading-[1.5] text-[var(--act-charcoal)]">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================== HOW IT WORKS ================== */
function HowItWorks() {
  const steps = [
    ["01", "Cerita posisimu", "Jawab beberapa pertanyaan singkat soal latar belakang dan tujuan karirmu."],
    ["02", "Terima roadmap", "Karir.ai menyusun jalur belajar dan target yang realistis dalam hitungan detik."],
    ["03", "Jalani & lacak", "Selesaikan langkah, latihan interview, dan lamar lowongan yang paling cocok."],
  ];
  return (
    <section id="how" className="bg-[var(--act-mist)] py-20" data-gs="section">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto max-w-[44ch] text-center">
          <p className="act-eyebrow mb-4">Tiga langkah, tanpa ribet</p>
          <h2 className="act-heading text-[32px] text-[var(--act-ink)] md:text-[40px] md:tracking-[-0.03em]">
            Cara kerjanya
          </h2>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-[20px] border border-[var(--act-stone)]/30 bg-[var(--act-stone)]/30 md:grid-cols-3">
          {steps.map(([n, t, b]) => (
            <div key={n} className="bg-[var(--act-paper)] p-7">
              <span className="act-heading text-[40px] text-[var(--act-blue)]">{n}</span>
              <h3 className="act-heading mt-3 text-[20px] text-[var(--act-ink)]">{t}</h3>
              <p className="mt-2 text-[14px] leading-[1.5] text-[var(--act-charcoal)]">{b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================== TESTIMONIAL ================== */
function Testimonial() {
  return (
    <section className="py-20" data-gs="section">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="act-card mx-auto max-w-[820px] px-8 py-12 text-center md:px-14">
          <Quote className="mx-auto h-7 w-7 text-[var(--act-blue)]" />
          <blockquote className="act-heading mx-auto mt-6 max-w-[30ch] text-[24px] leading-[1.35] text-[var(--act-ink)]">
            “Roadmap-nya bikin aku berhenti bingung. Tiga bulan kemudian aku
            tanda tangan kontrak frontend pertama.”
          </blockquote>
          <div className="mt-6">
            <p className="act-script text-[24px] text-[var(--act-graphite)]">Dewi Anggraini</p>
            <p className="mt-0.5 text-[13px] text-[var(--act-graphite)]">
              Frontend Engineer · ex-mahasiswa Informatika
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================== STATS ================== */
function Stats() {
  const stats = [
    ["12.400", "roadmap dibuat"],
    ["72", "rata-rata skor match"],
    ["3.1", "bulan menuju kerja"],
    ["0", "biaya langganan"],
  ];
  return (
    <section className="bg-[var(--act-mist)] py-16" data-gs="section">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 px-6 md:grid-cols-4">
        {stats.map(([n, l]) => (
          <div key={l} className="text-center">
            <div className="act-display text-[40px] text-[var(--act-ink)] md:text-[48px]">{n}</div>
            <div className="mt-1 text-[14px] text-[var(--act-graphite)]">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ================== FAQ ================== */
function FAQ() {
  const faqs = [
    ["Apakah benar-benar gratis?", "Fitur inti — roadmap, analisis skill-gap, dan job match — bisa dipakai tanpa biaya langganan. Kami tidak menyimpan kartu kredit kamu."],
    ["Apakah cocok untuk fresh graduate?", "Sangat cocok. Karir.ai dirancang untuk menemani dari nol, baik kamu baru lulus maupun ingin pindah jalur karir."],
    ["Dari mana data lowongannya?", "Kami mengumpulkan lowongan dari berbagai sumber publik dan mencocokkannya dengan profil skill kamu secara real-time."],
    ["Apakah CV saya aman?", "Data kamu dienkripsi dan hanya dipakai untuk menyusun roadmap dan rekomendasi. Kamu bisa menghapusnya kapan saja."],
    ["Bahasa apa yang didukung?", "Antarmuka dan percakapan tersedia dalam Bahasa Indonesia, dengan dukungan istilah teknis berbahasa Inggris."],
  ];
  return (
    <section id="faq" className="py-20" data-gs="section">
      <div className="mx-auto max-w-[760px] px-6">
        <div className="mb-10 text-center">
          <p className="act-eyebrow mb-4">Masih penasaran?</p>
          <h2 className="act-heading text-[32px] text-[var(--act-ink)] md:text-[40px] md:tracking-[-0.03em]">
            Pertanyaan umum
          </h2>
        </div>

        <div>
          {faqs.map(([q, a], i) => (
            <details
              key={q}
              className={`act-faq group ${i === 0 ? "act-hairline" : "act-hairline"}`}
              open={i === 0}
            >
              <summary className="flex items-center justify-between gap-6 py-5">
                <span className="text-[16px] font-medium text-[var(--act-ink)]">{q}</span>
                <Plus className="act-faq-sign h-5 w-5 flex-none text-[var(--act-ink)]" />
              </summary>
              <p className="-mt-1 pb-5 text-[15px] leading-[1.55] text-[var(--act-charcoal)]">
                {a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================== CTA ================== */
function CTA() {
  return (
    <section className="py-20" data-gs="section">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="relative overflow-hidden rounded-[32px] bg-[var(--act-paper)] px-8 py-16 text-center shadow-[var(--act-card-shadow)] md:px-14">
          <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full act-wash-sky opacity-70 blur-2xl" />
          <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full act-wash-petal opacity-70 blur-2xl" />
          <div className="relative">
            <h2 className="act-display mx-auto max-w-[18ch] text-[36px] text-[var(--act-ink)] md:text-[52px]">
              Bersihkan meja, mulai jalanmu
            </h2>
            <p className="mx-auto mt-4 max-w-[50ch] text-[16px] leading-[1.5] text-[var(--act-charcoal)]">
              Buat roadmap pertamamu dalam 60 detik. Tanpa kartu kredit, tanpa
              langganan, tanpa drama.
            </p>
            <div className="mt-8 flex items-center justify-center gap-2">
              <Link href="/onboarding" className="act-pill">
                Mulai gratis
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <a href="#showcase" className="act-pill-ghost">
                Lihat contoh
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================== FOOTER ================== */
function Footer() {
  return (
    <footer className="border-t border-[var(--act-stone)]/30 bg-[var(--act-mist)] py-12">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div className="max-w-[34ch]">
            <Link href="/v4" className="flex items-center gap-2.5">
              <Wordmark />
              <span className="act-heading text-[20px] text-[var(--act-onyx)]">
                Karir<span className="text-[var(--act-blue)]">.ai</span>
              </span>
            </Link>
            <p className="mt-3 text-[14px] leading-[1.5] text-[var(--act-graphite)]">
              Pelatih karir AI yang menemani kamu dari nol sampai dapat kerja
              atau project pertama.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-14 gap-y-2 text-[14px] sm:grid-cols-3">
            {[
              ["Produk", ["Roadmap", "Skill-gap", "Job match"]],
              ["Perusahaan", ["Tentang", "Blog", "Karier"]],
              ["Bantuan", ["FAQ", "Kontak", "Privasi"]],
            ].map(([title, items]) => (
              <div key={title as string}>
                <div className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--act-graphite)]">
                  {title as string}
                </div>
                <ul className="space-y-1.5">
                  {(items as string[]).map((it) => (
                    <li key={it}>
                      <a href="#" className="text-[var(--act-charcoal)] hover:text-[var(--act-blue)]">
                        {it}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[var(--act-stone)]/30 pt-6 text-[13px] text-[var(--act-graphite)] sm:flex-row">
          <span>© {new Date().getFullYear()} Karir.ai · Made in Jakarta</span>
          <span className="act-script text-[18px]">papers, fanned out at dusk</span>
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

function DashedArrow() {
  return (
    <svg viewBox="0 0 80 24" className="h-6 w-20 rotate-90 text-[var(--act-stone)] md:rotate-0" fill="none">
      <path d="M2 12h64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 6" />
      <path d="M62 6l8 6-8 6" stroke="var(--act-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Quote({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M9 7H5a2 2 0 00-2 2v4a2 2 0 002 2h2v1a2 2 0 01-2 2H4v2h1a4 4 0 004-4V9a2 2 0 00-2-2H9zm10 0h-4a2 2 0 00-2 2v4a2 2 0 002 2h2v1a2 2 0 01-2 2h-1v2h1a4 4 0 004-4V9a2 2 0 00-2-2h2z" />
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
