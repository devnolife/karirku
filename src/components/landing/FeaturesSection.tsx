"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

interface Feature {
  title: string;
  description: string;
  image: string;
  icon: ReactNode;
}

const features: Feature[] = [
  {
    title: "AI Job Matching",
    description:
      "Cocokkan profilmu dengan lowongan paling relevan secara otomatis lewat AI yang memahami skill dan pengalamanmu.",
    image: "/images/P01-Feature-UI-01.svg",
    icon: (
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
        className="lucide lucide-chart-pie w-6 h-6 text-[#198F38] stroke-[3px]"
      >
        <path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"></path>
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
      </svg>
    ),
  },
  {
    title: "Readiness Score",
    description:
      "Ketahui seberapa siap kamu bersaing dan dapatkan prediksi peluang lolos sebelum melamar.",
    image: "/images/P01-Feature-UI-02.svg",
    icon: (
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
        className="lucide lucide-chart-column w-6 h-6 text-[#198F38] stroke-[3px]"
      >
        <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
        <path d="M18 17V9"></path>
        <path d="M13 17V5"></path>
        <path d="M8 17v-3"></path>
      </svg>
    ),
  },
  {
    title: "Skill Terverifikasi",
    description:
      "Buktikan kemampuanmu lewat proof of work terverifikasi yang membuat profilmu lebih dipercaya perusahaan.",
    image: "/images/P01-Feature-UI-03.svg",
    icon: (
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
        className="lucide lucide-shield w-6 h-6 text-[#198F38] stroke-[3px]"
      >
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
      </svg>
    ),
  },
  {
    title: "Roadmap Belajar Instan",
    description:
      "Dapatkan jalur belajar yang dipersonalisasi untuk menutup skill gap dan meraih posisi impianmu lebih cepat.",
    image: "/images/P01-Feature-UI-04.svg",
    icon: (
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
        className="lucide lucide-zap w-6 h-6 text-[#198F38] stroke-[3px]"
      >
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
      </svg>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section id="fitur" className="w-full bg-[#FFFFFF] py-20 lg:py-32 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center">
            <motion.div
              {...fadeUp}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#198F38]/10 bg-[#198F38]/5 whitespace-nowrap"
            >
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
                className="lucide lucide-sparkles w-4 h-4 text-[#198F38]"
              >
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                <path d="M20 3v4"></path>
                <path d="M22 5h-4"></path>
                <path d="M4 17v2"></path>
                <path d="M5 18H3"></path>
              </svg>
              <span className="text-[#198F38] text-center font-inter text-base font-normal leading-6 tracking-[-0.3px]">
                Fitur Unggulan
              </span>
            </motion.div>
            <motion.h2
              {...fadeUp}
              className="mt-6 w-full max-w-[686px] text-[#042718] text-center font-onest text-[32px] sm:text-[40px] lg:text-[52px] font-semibold leading-tight lg:leading-[58px] tracking-[-1.2px] sm:tracking-[-1.8px]"
            >
              Kuasai Karirmu
              <br className="block sm:hidden" /> dengan{" "}
              <span className="text-black/40 font-playfair italic font-semibold">
                fitur
              </span>{" "}
              Cerdas
            </motion.h2>
            <motion.p
              {...fadeUp}
              className="mt-3 w-full max-w-[514px] text-[#042718] text-center font-inter text-base sm:text-lg font-normal leading-relaxed sm:leading-7 opacity-80"
            >
              Semua yang kamu butuhkan untuk merancang masa depan karier dalam
              satu platform yang simpel dan cerdas.
            </motion.p>
          </div>
          <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                {...fadeUp}
                className="flex flex-col items-start shrink-0 border border-[#042718]/10 overflow-hidden bg-white group w-full rounded-[24px] sm:rounded-[32px]"
              >
                <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[440px] overflow-hidden flex items-center justify-center p-6 sm:p-8 bg-[#F9FAFB]">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                  >
                    <source src="/videos/P01-Header-01-BG.mp4" type="video/mp4" />
                  </video>
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <img
                      alt={feature.title}
                      className="h-full w-full object-contain pointer-events-none select-none transition-all duration-500 group-hover:translate-y-[-10px]"
                      src={feature.image}
                    />
                  </div>
                </div>
                <div className="p-6 sm:p-10 flex flex-col sm:flex-row items-start gap-5 self-stretch bg-white">
                  <div className="w-10 h-10 p-2 flex items-center justify-center border border-[#198F38]/20 bg-[#198F38]/5 rounded-lg shrink-0">
                    {feature.icon}
                  </div>
                  <div className="flex flex-col gap-[10px]">
                    <h3 className="text-[#042718] font-onest text-xl sm:text-2xl font-semibold leading-tight sm:leading-[30px] tracking-[-0.8px]">
                      {feature.title}
                    </h3>
                    <p className="text-[#042718] font-inter text-base sm:text-lg font-normal leading-relaxed sm:leading-[28px] opacity-80">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
