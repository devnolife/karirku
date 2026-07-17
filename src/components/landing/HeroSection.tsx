"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
} as const;

const navLinks = [
  { label: "Fitur", href: "#fitur", active: false },
  { label: "Cara Kerja", href: "#cara-kerja", active: false },
  { label: "Harga", href: "#pricing", active: false },
  { label: "Blog", href: "#blog", active: false },
];

const partnerLogos = [
  { alt: "Horizon", src: "/images/Horizon.svg" },
  { alt: "Naxus", src: "/images/Naxus.svg" },
  { alt: "Lumassa", src: "/images/Lumassa.svg" },
  { alt: "Cyborg", src: "/images/Cyborg.svg" },
  { alt: "Catalyst", src: "/images/Catalyst.svg" },
];

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

function CraftWorksLogo() {
  return (
    <span className="flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        className="h-7 lg:h-8 w-auto"
      >
        <rect width="48" height="48" rx="12" fill="#042718" />
        <path
          d="M14 34V14M14 24c6.5-9.5 16.5-9.5 22 0"
          stroke="#ffffff"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-onest text-xl lg:text-2xl font-semibold tracking-tight text-brand-950">
        CraftWorks
      </span>
    </span>
  );
}

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden min-h-[800px] lg:min-h-[900px]">
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src="/videos/P01-Header-01-BG.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-12">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <CraftWorksLogo />
          </Link>
          <ul className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={
                    link.active
                      ? "font-inter text-base leading-6 tracking-[-0.3px] text-brand-950 transition-all font-bold opacity-100"
                      : "font-inter text-base leading-6 tracking-[-0.3px] text-brand-950 transition-all font-normal opacity-80 hover:opacity-100 hover:font-bold"
                  }
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/40 group cursor-pointer relative h-11 transition-all duration-300 flex-row pl-[18px] pr-1.5"
            >
              <span className="font-inter text-base font-medium leading-6 tracking-[-0.3px] text-brand-950">
                Mulai Sekarang
              </span>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center relative overflow-hidden shrink-0">
                <div>
                  <ArrowUpRightIcon className="lucide lucide-arrow-up-right w-3 h-3 text-brand-950" />
                </div>
              </div>
            </Link>
            <button className="lg:hidden p-2 text-brand-950 bg-white/20 backdrop-blur-md rounded-full">
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
                className="lucide lucide-menu"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
          </div>
        </nav>
        <div className="flex flex-col items-center mt-12 lg:mt-[80px]">
          <motion.div
            {...fadeUp}
            className="flex flex-row items-center gap-1.5 sm:gap-2 px-3 sm:px-[14px] py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/40 mb-6 whitespace-nowrap"
          >
            <div className="flex items-center gap-1 shrink-0">
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
                className="lucide lucide-sparkles w-3.5 h-3.5 sm:w-4 sm:h-4 fill-brand-950 text-brand-950"
              >
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                <path d="M20 3v4" />
                <path d="M22 5h-4" />
                <path d="M4 17v2" />
                <path d="M5 18H3" />
              </svg>
              <span className="font-inter text-sm sm:text-base lg:text-[18px] font-medium leading-[28px] text-brand-950">
                4.9 rating
              </span>
            </div>
            <span className="font-inter text-sm sm:text-base lg:text-[18px] font-normal leading-[28px] text-[#000000] opacity-60 shrink-0">
              dari 18.3k+ talent
            </span>
          </motion.div>
          <motion.h1
            {...fadeUp}
            className="max-w-[750px] w-full text-center font-onest text-[40px] sm:text-[50px] lg:text-[66px] font-semibold leading-tight lg:leading-[72px] tracking-tight lg:tracking-[-3px] text-brand-950"
          >
            Bangun Karirmu dengan{" "}
            <span className="font-playfair italic font-semibold act-ai-text tracking-normal lg:tracking-[-3.566px]">
              AI-Powered
            </span>{" "}
            Matching
          </motion.h1>
          <motion.p
            {...fadeUp}
            className="max-w-[630px] w-full text-center mt-5 font-inter text-lg lg:text-[20px] font-normal leading-relaxed lg:leading-[30px] tracking-[-0.4px] text-brand-950"
          >
            Bangun profil karir yang menonjol, verifikasi skill-mu, dan biarkan AI
            mencocokkanmu dengan lowongan serta proyek yang paling tepat.
          </motion.p>
          <motion.button
            {...fadeUp}
            className="flex items-center gap-3 py-2 rounded-full bg-brand-950 mt-8 lg:mt-12 group cursor-pointer relative h-14 border border-white/20 transition-all duration-300 flex-row pl-5 pr-2"
          >
            <span className="font-inter text-base lg:text-[18px] font-medium leading-[28px] text-white">
              Coba Gratis
            </span>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center relative overflow-hidden shrink-0">
              <div>
                <ArrowUpRightIcon className="lucide lucide-arrow-up-right w-4 h-4 text-brand-950" />
              </div>
            </div>
          </motion.button>
          <motion.div
            {...fadeUp}
            className="mt-20 lg:mt-[220px] flex flex-col items-center gap-10 w-full"
          >
            <div className="px-[16px] py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/20">
              <p className="font-inter text-sm lg:text-base font-medium leading-6 tracking-[-0.3px] text-white text-center">
                Dipercaya oleh tim rekrutmen modern di Indonesia
              </p>
            </div>
            <div
              className="w-full mt-4 overflow-hidden"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
              }}
            >
              <motion.div
                className="flex items-center gap-12 sm:gap-16 lg:gap-24 w-fit"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
              >
                {[...partnerLogos, ...partnerLogos].map((logo, i) => (
                  <img
                    key={`${logo.alt}-${i}`}
                    alt={logo.alt}
                    className="h-6 sm:h-7 lg:h-9 w-auto hover:opacity-80 transition-opacity"
                    src={logo.src}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
