"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Link from "next/link";

interface Benefit {
  title: string;
  description: string;
  icon: ReactNode;
}

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const benefits: Benefit[] = [
  {
    title: "Profil hidup yang terus tumbuh",
    description:
      "Profilmu bukan CV statis — setiap skill baru, proyek, dan pencapaian otomatis memperbarui profil karirmu secara real-time.",
    icon: (
      <svg {...iconProps} className="lucide lucide-user w-5 h-5 text-[#198F38]">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    title: "Skill terverifikasi",
    description:
      "Setiap kemampuan divalidasi lewat asesmen terstandar, jadi kamu tampil dengan bukti nyata, bukan sekadar klaim.",
    icon: (
      <svg {...iconProps} className="lucide lucide-badge-check w-5 h-5 text-[#198F38]">
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Readiness score real-time",
    description:
      "Ukur seberapa siap kamu untuk posisi impianmu dan pantau perkembangannya dari waktu ke waktu.",
    icon: (
      <svg {...iconProps} className="lucide lucide-gauge w-5 h-5 text-[#198F38]">
        <path d="m12 14 4-4" />
        <path d="M3.34 19a10 10 0 1 1 17.32 0" />
      </svg>
    ),
  },
  {
    title: "Di-match otomatis",
    description:
      "Algoritma kami mencocokkanmu dengan peluang paling relevan, tanpa perlu melamar ke ratusan lowongan.",
    icon: (
      <svg {...iconProps} className="lucide lucide-zap w-5 h-5 text-[#198F38]">
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
      </svg>
    ),
  },
  {
    title: "Roadmap belajar terarah",
    description:
      "Dapatkan jalur belajar personal yang menutup skill gap menuju karir targetmu, langkah demi langkah.",
    icon: (
      <svg {...iconProps} className="lucide lucide-map w-5 h-5 text-[#198F38]">
        <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
        <path d="M15 5.764v15" />
        <path d="M9 3.236v15" />
      </svg>
    ),
  },
  {
    title: "Portofolio proof-of-work",
    description:
      "Tunjukkan karya nyata dari proyek dan studio, bukan sekadar daftar pengalaman di atas kertas.",
    icon: (
      <svg {...iconProps} className="lucide lucide-briefcase w-5 h-5 text-[#198F38]">
        <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        <rect width="20" height="14" x="2" y="6" rx="2" />
      </svg>
    ),
  },
  {
    title: "Kandidat pre-qualified",
    description:
      "Perusahaan langsung bertemu talenta yang skill dan kesiapannya sudah tervalidasi sejak awal.",
    icon: (
      <svg {...iconProps} className="lucide lucide-user-check w-5 h-5 text-[#198F38]">
        <path d="M2 21a8 8 0 0 1 13.292-6" />
        <circle cx="10" cy="8" r="5" />
        <path d="m16 19 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Screening lebih cepat",
    description:
      "Pangkas waktu rekrutmen dengan readiness score dan hasil asesmen yang tersedia sejak kandidat pertama kali dilihat.",
    icon: (
      <svg {...iconProps} className="lucide lucide-timer w-5 h-5 text-[#198F38]">
        <line x1="10" x2="14" y1="2" y2="2" />
        <line x1="12" x2="15" y1="14" y2="11" />
        <circle cx="12" cy="14" r="8" />
      </svg>
    ),
  },
  {
    title: "Insight kandidat mendalam",
    description:
      "Pahami kekuatan, potensi, dan perkembangan setiap kandidat lewat analitik yang mudah dibaca.",
    icon: (
      <svg {...iconProps} className="lucide lucide-chart-pie w-5 h-5 text-[#198F38]">
        <path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z" />
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      </svg>
    ),
  },
  {
    title: "Satu ekosistem, dua sisi",
    description:
      "Talenta dan perusahaan tumbuh bersama dalam satu platform yang saling menguntungkan.",
    icon: (
      <svg {...iconProps} className="lucide lucide-users w-5 h-5 text-[#198F38]">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

const tags = [
  "Profil Dinamis",
  "Skill Terverifikasi",
  "Readiness Score",
  "Auto-Match",
  "Proof-of-Work",
];

interface BenefitItemProps {
  benefit: Benefit;
  index: number;
  count: number;
  progress: MotionValue<number>;
  isLg: boolean;
}

function BenefitItem({ benefit, index, count, progress, isLg }: BenefitItemProps) {
  const start = (index / count) * 0.85;
  const end = start + 0.1;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [40, 0]);

  return (
    <motion.div
      className="flex gap-6"
      style={isLg ? { opacity, y } : undefined}
    >
      <div className="flex-shrink-0 w-10 h-10 bg-[#f9fafb] border border-[#F8F8FC] rounded-lg flex items-center justify-center">
        {benefit.icon}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-[#042718] font-onest text-[20px] md:text-[24px] font-semibold leading-[26px] md:leading-[30px] tracking-[-0.6px] md:tracking-[-0.8px]">
          {benefit.title}
        </h3>
        <p className="text-[#042718] font-inter text-base md:text-[18px] font-normal leading-[24px] md:leading-[28px] opacity-80">
          {benefit.description}
        </p>
      </div>
    </motion.div>
  );
}

export function BenefitsSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const shiftRef = useRef(0);
  const [isLg, setIsLg] = useState(false);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const listY = useTransform(scrollYProgress, (v) => -v * shiftRef.current);
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      setIsLg(mql.matches);
      if (listRef.current) {
        shiftRef.current = Math.max(0, listRef.current.scrollHeight - 800);
      }
    };
    update();
    mql.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mql.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section id="keuntungan" className="w-full bg-white py-16 md:py-24 lg:py-[120px] flex justify-center">
      <div className="w-full max-w-[1440px] px-6 lg:px-[96px]">
        <div className="w-full max-w-[1248px] mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-[48px] justify-between">
            <div className="w-full lg:max-w-[622px] flex flex-col items-start lg:sticky lg:top-[120px] self-start">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#198F38]/10 bg-[#198F38]/5 whitespace-nowrap mb-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-sparkles w-4 h-4 text-[#198F38]"
                >
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  <path d="M20 3v4" />
                  <path d="M22 5h-4" />
                  <path d="M4 17v2" />
                  <path d="M5 18H3" />
                </svg>
                <span className="text-[#198F38] text-center font-inter text-base font-normal leading-6 tracking-[-0.3px]">
                  Keuntungan
                </span>
              </div>
              <h2 className="text-[#042718] font-onest text-[32px] sm:text-[42px] md:text-[52px] font-semibold leading-[38px] sm:leading-[48px] md:leading-[58px] tracking-[-1.2px] md:tracking-[-1.8px] mb-3">
                Kendalikan penuh pertumbuhan karirmu dengan{" "}
                <span className="text-black/40 font-playfair italic font-semibold">tools</span>{" "}
                cerdas
              </h2>
              <p className="text-[#042718] font-inter text-lg md:text-[20px] font-normal leading-[24px] md:leading-[30px] opacity-80 mb-16 max-w-[560px]">
                Bangun karir lebih cerdas dengan tools yang dirancang untuk memvalidasi
                skill, mengukur kesiapanmu, dan mempertemukanmu dengan peluang yang tepat.
              </p>
              <div className="flex flex-wrap gap-3 mb-12">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-6 py-3 border border-[#042718]/10 rounded-full text-[#042718] font-inter text-[16px] md:text-[18px] font-normal hover:bg-[#F6FDFF] transition-colors cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href="/login"
                className="flex items-center gap-3 py-2 rounded-full bg-[#042718] group cursor-pointer relative h-14 transition-all duration-300 hover:bg-[#063b25] flex-row pl-5 pr-2 w-max"
              >
                <span className="font-inter text-base lg:text-[18px] font-medium leading-[28px] text-white">
                  Coba Gratis
                </span>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center relative overflow-hidden">
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
                    className="lucide lucide-arrow-up-right w-4 h-4 text-[#042718]"
                  >
                    <path d="M7 7h10v10" />
                    <path d="M7 17 17 7" />
                  </svg>
                </div>
              </Link>
            </div>
            <div
              ref={trackRef}
              className="flex-1 lg:max-w-[578px] flex items-start pr-0 lg:h-[300vh] h-auto relative w-full"
            >
              <div className="lg:sticky lg:top-[120px] lg:h-[800px] h-auto flex items-start w-full lg:overflow-hidden overflow-visible">
                <div className="hidden lg:block absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white via-white/95 to-transparent z-10 pointer-events-none" />
                <div className="hidden lg:flex flex-col items-center mr-10 xl:mr-12 relative w-[2px] bg-[#198F38]/10 self-stretch">
                  <motion.div
                    className="w-full bg-[#198F38] absolute top-0 left-0 h-full"
                    style={{ scaleY: lineScaleY, transformOrigin: "50% 0%" }}
                  />
                </div>
                <motion.div
                  ref={listRef}
                  className="w-full lg:w-[514px] flex flex-col gap-10 md:gap-12 lg:gap-16 lg:pt-28 lg:pb-40 pt-0 pb-0"
                  style={isLg ? { y: listY } : undefined}
                >
                  {benefits.map((benefit, index) => (
                    <BenefitItem
                      key={benefit.title}
                      benefit={benefit}
                      index={index}
                      count={benefits.length}
                      progress={scrollYProgress}
                      isLg={isLg}
                    />
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
