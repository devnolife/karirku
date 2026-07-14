"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
} as const;

const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.5 },
} as const;

type FooterLink = {
  label: string;
  href: string;
};

const productLinks: FooterLink[] = [
  { label: "Cari Lowongan", href: "/jobs" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Belajar", href: "/learn" },
  { label: "Roadmap", href: "/roadmap" },
];

const companyLinks: FooterLink[] = [
  { label: "Tentang", href: "#" },
  { label: "Blog", href: "/guides" },
  { label: "Karir", href: "#" },
  { label: "Kontak", href: "#" },
];

function SparklesIcon({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}

function ArrowUpRightIcon({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-twitter opacity-100"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-linkedin opacity-100"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-instagram opacity-100"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const socialLinks = [
  { label: "Instagram", icon: <InstagramIcon /> },
  { label: "LinkedIn", icon: <LinkedinIcon /> },
  { label: "X / Twitter", icon: <TwitterIcon /> },
];

export function FooterSection() {
  return (
    <footer className="relative w-full overflow-hidden flex flex-col items-center">
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src="/videos/P01-Header-01-BG.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-white/20" />
        <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-white/2 backdrop-blur-[2px] [mask-image:linear-gradient(to_top,black_40%,transparent)]" />
      </div>
      <section className="w-full relative pt-[120px] pb-0 overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-white via-white/40 to-transparent" />
        <div className="max-w-[1440px] w-full mx-auto px-6 lg:px-[96px] relative z-10 flex flex-col items-center">
          <div className="max-w-[1248px] w-full flex flex-col items-center">
            <motion.div
              {...fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E4F3EB] border border-[#138E5F]/10 mb-[30px]"
            >
              <SparklesIcon className="lucide lucide-sparkles w-3.5 h-3.5 text-[#138E5F]" />
              <span className="text-[#138E5F] text-[13px] font-sans font-medium uppercase tracking-wider">
                Dibangun untuk karir serius
              </span>
            </motion.div>
            <motion.h2
              {...fadeUp}
              className="w-full max-w-[742px] text-center text-[#042718] font-onest font-semibold text-[42px] md:text-[68px] leading-[1.1] md:leading-[80px] tracking-tight md:tracking-[-2.2px] mb-[12px]"
            >
              Kendalikan penuh{" "}
              <span className="font-playfair italic text-[rgba(0,0,0,0.40)]">karirmu</span> hari
              ini
            </motion.h2>
            <motion.p
              {...fadeUp}
              className="w-full max-w-[660px] text-center text-[#042718] font-sans text-lg md:text-[20px] leading-[1.5] md:leading-[30px] tracking-tight md:tracking-[-0.4px] opacity-80 mb-[64px]"
            >
              Temukan lowongan, bangun skill, dan rancang langkah karirmu &mdash; semua dalam
              satu platform yang intuitif.
            </motion.p>
            <motion.div {...fadeUp} className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/login"
                className="relative flex items-center h-[56px] rounded-full transition-all duration-500 overflow-hidden gap-3 bg-[#042718] text-white shadow-[0_8px_32px_rgba(4,39,24,0.15)] pl-[20px] pr-[8px] flex-row"
              >
                <span className="font-sans font-medium text-[18px] leading-[28px] whitespace-nowrap z-10">
                  Mulai Gratis
                </span>
                <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 z-20 bg-white">
                  <ArrowUpRightIcon className="lucide lucide-arrow-up-right w-4 h-4 text-[#042718]" />
                </div>
              </Link>
              <Link
                href="/jobs"
                className="relative flex items-center h-[56px] rounded-full transition-all duration-500 overflow-hidden gap-3 bg-white/20 backdrop-blur-xl border border-white/60 text-[#042718] w-full sm:w-[232px] justify-between shadow-[0_8px_32px_rgba(255,255,255,0.1)] pl-[20px] pr-[8px] flex-row"
              >
                <span className="font-sans font-medium text-[18px] leading-[28px] whitespace-nowrap z-10">
                  Lihat Lowongan
                </span>
                <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 z-20 bg-[#042718]">
                  <ArrowUpRightIcon className="lucide lucide-arrow-up-right w-4 h-4 text-white" />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      <div className="relative w-full flex flex-col items-center">
        <div className="relative z-10 w-full max-w-[1440px] px-6 lg:px-[96px] pt-[64px] pb-[32px] flex flex-col items-start bg-transparent">
          <motion.div
            {...fadeIn}
            className="w-full lg:w-[1248px] pt-[60px] lg:pt-[120px] pb-[60px] lg:pb-[96px] flex flex-col lg:flex-row items-start gap-[60px] lg:gap-[130px]"
          >
            <div className="w-full lg:w-[440px] flex flex-col gap-6">
              <motion.h3
                {...fadeUp}
                className="text-[#042718] font-onest text-[24px] font-semibold leading-[30px] tracking-[-0.8px]"
              >
                Jangan lewatkan info karir terbaru
              </motion.h3>
              <motion.p
                {...fadeUp}
                className="text-[#042718] font-sans text-[18px] font-normal leading-[28px] opacity-80"
              >
                Tips karir, lowongan pilihan, dan wawasan industri &mdash; langsung ke inbox
                kamu.
              </motion.p>
              <motion.form
                {...fadeUp}
                onSubmit={(event) => event.preventDefault()}
                className="mt-2 relative w-full lg:w-[440px] flex flex-col sm:flex-row items-stretch sm:items-center p-3 sm:p-[6px] gap-3 sm:gap-0 rounded-[28px] sm:rounded-full border border-white/60 bg-white/15 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.05)]"
              >
                <input
                  placeholder="Masukkan email kamu"
                  type="email"
                  className="flex-1 bg-transparent border-none outline-none px-4 py-2 sm:py-0 font-sans text-[18px] text-[#042718] placeholder:text-[#042718]/60"
                />
                <button
                  type="submit"
                  className="flex items-center justify-between sm:justify-start gap-3 bg-white pl-6 pr-2 py-2 sm:pl-[24px] sm:pr-[8px] sm:py-[8px] rounded-full shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <span className="font-sans text-[18px] font-medium text-[#042718]">
                    Berlangganan
                  </span>
                  <div className="w-[36px] h-[36px] bg-[#042718] rounded-full flex items-center justify-center transition-colors duration-300 shrink-0">
                    <ArrowRightIcon className="lucide lucide-arrow-right text-white" />
                  </div>
                </button>
              </motion.form>
            </div>
            <div className="lg:ml-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-nowrap gap-y-12 gap-x-8 lg:gap-[64px] w-full lg:w-auto">
              <div className="lg:w-[152px] flex flex-col gap-[20px] relative">
                <motion.h4
                  {...fadeUp}
                  className="text-[#042718] font-onest text-[24px] font-semibold leading-[30px] tracking-[-0.8px]"
                >
                  Produk
                </motion.h4>
                <ul className="flex flex-col gap-[16px]">
                  {productLinks.map((link) => (
                    <motion.li key={link.label} {...fadeUp}>
                      <Link
                        href={link.href}
                        className="text-[#042718] font-sans text-[18px] font-normal leading-[28px] opacity-80 hover:opacity-100 hover:font-medium transition-all"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                <div className="absolute top-0 -right-[32px] h-full w-[1px] bg-[#042718]/10 hidden lg:block" />
              </div>
              <div className="lg:w-[152px] flex flex-col gap-[20px] relative">
                <motion.h4
                  {...fadeUp}
                  className="text-[#042718] font-onest text-[24px] font-semibold leading-[30px] tracking-[-0.8px]"
                >
                  Perusahaan
                </motion.h4>
                <ul className="flex flex-col gap-[16px]">
                  {companyLinks.map((link) => (
                    <motion.li key={link.label} {...fadeUp}>
                      {link.href.startsWith("/") ? (
                        <Link
                          href={link.href}
                          className="text-[#042718] font-sans text-[18px] font-normal leading-[28px] opacity-80 hover:opacity-100 hover:font-medium transition-all"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-[#042718] font-sans text-[18px] font-normal leading-[28px] opacity-80 hover:opacity-100 hover:font-medium transition-all"
                        >
                          {link.label}
                        </a>
                      )}
                    </motion.li>
                  ))}
                </ul>
                <div className="absolute top-0 -right-[32px] h-full w-[1px] bg-[#042718]/10 hidden lg:block" />
              </div>
              <div className="lg:w-[220px] flex flex-col gap-[20px]">
                <motion.h4
                  {...fadeUp}
                  className="text-[#042718] font-onest text-[24px] font-semibold leading-[30px] tracking-[-0.8px]"
                >
                  Sosial
                </motion.h4>
                <ul className="flex flex-col gap-[16px]">
                  {socialLinks.map((social) => (
                    <motion.li key={social.label} {...fadeUp}>
                      <a
                        href="#"
                        className="flex items-center gap-3 text-[#042718] font-sans text-[18px] font-normal leading-[28px] opacity-80 hover:opacity-100 hover:font-medium transition-all"
                      >
                        {social.icon}
                        {social.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
          <div className="w-[342px] h-[120px] md:w-[720px] md:h-[250px] lg:w-[1248px] lg:h-[430px] flex flex-col justify-center items-center select-none mx-auto lg:mx-0">
            <motion.h1
              {...fadeUp}
              className="w-full text-center text-[#042718] font-onest text-[68px] md:text-[144px] lg:text-[248px] font-bold leading-none tracking-[-2.2px] md:tracking-[-4.8px] lg:tracking-[-8.2px]"
            >
              CraftWorks
            </motion.h1>
          </div>
          <motion.div
            {...fadeIn}
            className="w-full lg:w-[1248px] mt-[24px] pt-8 flex flex-col lg:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-8 text-white font-sans text-[18px] font-normal leading-[28px] opacity-80">
              <a href="#" className="hover:opacity-100 hover:font-medium transition-all">
                Syarat &amp; Ketentuan
              </a>
              <a href="#" className="hover:opacity-100 hover:font-medium transition-all">
                Kebijakan Privasi
              </a>
            </div>
            <div className="text-white font-sans text-[18px] font-normal leading-[28px] opacity-80 text-center lg:text-left">
              &copy; 2026 CraftWorks. Hak cipta dilindungi.
            </div>
            <div className="text-white font-sans text-[18px] font-normal leading-[28px] opacity-80">
              Craft your career, and it works.
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
