"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

interface ProcessStep {
  tabLabel: string;
  title: string;
  description: string;
  features: string[];
  image: string;
  accentCls: string;
  tileCls: string;
  icon: (className: string) => ReactNode;
}

const userRoundIcon = (className: string) => (
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
    className={`lucide lucide-user-round ${className}`}
  >
    <circle cx="12" cy="8" r="5"></circle>
    <path d="M20 21a8 8 0 0 0-16 0"></path>
  </svg>
);

const badgeCheckIcon = (className: string) => (
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
    className={`lucide lucide-badge-check ${className}`}
  >
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
);

const zapIcon = (className: string) => (
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
    className={`lucide lucide-zap ${className}`}
  >
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
  </svg>
);

const sendIcon = (className: string) => (
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
    className={`lucide lucide-send ${className}`}
  >
    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
    <path d="m21.854 2.147-10.94 10.939"></path>
  </svg>
);

const steps: ProcessStep[] = [
  {
    tabLabel: "Bangun profilmu",
    title: "Bangun Profil Terbaikmu",
    description:
      "Buat profil karir yang menonjol dalam hitungan menit — tampilkan pengalaman, portofolio, dan keahlianmu dalam satu halaman yang rapi dan profesional.",
    features: [
      "Template profil profesional siap pakai",
      "Impor pengalaman langsung dari CV lama",
      "Portofolio dan sertifikat dalam satu tempat",
    ],
    image: "/images/P01-Process-img-01.png",
    accentCls: "text-brand-600",
    tileCls: "border-brand-600/20 bg-brand-600/5",
    icon: userRoundIcon,
  },
  {
    tabLabel: "Verifikasi skill",
    title: "Verifikasi Skill-mu",
    description:
      "Ikuti asesmen singkat untuk membuktikan keahlianmu — profil terverifikasi lebih dipercaya perusahaan dan tampil lebih menonjol di hasil pencarian.",
    features: [
      "Asesmen skill singkat dan terarah",
      "Badge terverifikasi di profilmu",
      "Lebih dipercaya oleh perusahaan",
    ],
    image: "/images/P01-Process-img-01.png",
    accentCls: "text-teal-600",
    tileCls: "border-teal-600/20 bg-teal-600/5",
    icon: badgeCheckIcon,
  },
  {
    tabLabel: "Di-match oleh AI",
    title: "Di-match oleh AI",
    description:
      "AI kami menganalisis profil dan preferensimu, lalu merekomendasikan peluang yang paling sesuai — tanpa perlu scroll ratusan lowongan.",
    features: [
      "Rekomendasi lowongan yang relevan",
      "Skor kecocokan untuk setiap peluang",
      "Notifikasi saat ada peluang baru",
    ],
    image: "/images/P01-Process-img-01.png",
    accentCls: "text-violet-600",
    tileCls: "border-violet-600/20 bg-violet-600/5",
    icon: zapIcon,
  },
  {
    tabLabel: "Lamar & terhubung",
    title: "Lamar & Terhubung",
    description:
      "Lamar dengan sekali klik atau biarkan perusahaan menghubungimu langsung — pantau semua proses lamaranmu dari satu dasbor.",
    features: [
      "Lamar sekali klik dengan profilmu",
      "Perusahaan bisa menghubungimu duluan",
      "Pantau status lamaran secara real-time",
    ],
    image: "/images/P01-Process-img-01.png",
    accentCls: "text-blue-600",
    tileCls: "border-blue-600/20 bg-blue-600/5",
    icon: sendIcon,
  },
];

function CheckItem({ label }: { label: string }) {
  return (
    <motion.div className="flex items-center gap-3" {...fadeUp}>
      <div className="w-5 h-5 rounded-full bg-brand-600/10 flex items-center justify-center shrink-0">
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
          className="lucide lucide-check w-3 h-3 text-brand-600 stroke-[3px]"
        >
          <path d="M20 6 9 17l-5-5"></path>
        </svg>
      </div>
      <span className="text-brand-950 font-inter text-base font-medium leading-6 tracking-[-0.3px]">
        {label}
      </span>
    </motion.div>
  );
}

export function ProcessSection() {
  const [activeStep, setActiveStep] = useState(0);
  const step = steps[activeStep];

  return (
    <section
      id="cara-kerja"
      className="w-full bg-[#F6FDFF] py-20 lg:py-32 overflow-hidden"
    >
      <div className="w-full max-w-[1248px] mx-auto relative px-4 md:px-6">
        <div className="flex flex-col items-start gap-12 lg:gap-16">
          <div className="flex flex-col items-start">
            <motion.div
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-600/10 bg-brand-600/5 whitespace-nowrap mb-6"
              {...fadeUp}
            >
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
                className="lucide lucide-sparkles w-4 h-4 text-brand-600"
              >
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                <path d="M20 3v4"></path>
                <path d="M22 5h-4"></path>
                <path d="M4 17v2"></path>
                <path d="M5 18H3"></path>
              </svg>
              <span className="text-brand-600 text-center font-inter text-base font-normal leading-6 tracking-[-0.3px]">
                Cara Kerja
              </span>
            </motion.div>
            <motion.h2
              className="text-brand-950 font-onest text-[32px] sm:text-[44px] lg:text-[52px] font-semibold leading-tight lg:leading-[58px] tracking-[-1.2px] lg:tracking-[-1.8px] w-full lg:max-w-[556px] text-left"
              {...fadeUp}
            >
              Kelola karirmu
              <br className="block lg:hidden" /> dalam 4 langkah{" "}
              <span className="text-black/40 font-playfair italic font-semibold">
                sederhana
              </span>
            </motion.h2>
          </div>
          <div className="w-full flex flex-col gap-6">
            <div className="w-full">
              <motion.div
                className="w-full bg-white p-4 lg:px-6 lg:py-4 rounded-2xl shadow-[0_1px_20px_0_rgba(4,39,24,0.04)] flex items-center lg:justify-between gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide snap-x"
                {...fadeUp}
              >
                {steps.map((s, index) => {
                  const isActive = index === activeStep;
                  return (
                    <button
                      key={s.tabLabel}
                      type="button"
                      onClick={() => setActiveStep(index)}
                      className={`flex items-center gap-3 px-4 sm:px-6 py-2.5 rounded-xl transition-all duration-300 shrink-0 snap-start ${
                        isActive ? "bg-white" : "hover:bg-[#F6FDFF]"
                      }`}
                    >
                      {s.icon(
                        `w-[22px] h-[22px] ${
                          isActive ? s.accentCls : "text-brand-950/60"
                        }`
                      )}
                      <span
                        className={`font-inter text-base sm:text-[18px] leading-[28px] whitespace-nowrap ${
                          isActive
                            ? `${s.accentCls} font-medium`
                            : "text-brand-950/60 font-normal"
                        }`}
                      >
                        {s.tabLabel}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            </div>
            <div className="w-full">
              <div className="w-full bg-white rounded-[32px] border border-brand-950/[0.04] shadow-[0_0_20px_0_rgba(4,39,24,0.04)] flex flex-col lg:flex-row items-center justify-between p-6 lg:pt-4 lg:pr-4 lg:pb-4 lg:pl-16 gap-12 lg:gap-0 overflow-hidden">
                <div
                  key={activeStep}
                  className="w-full lg:w-[534px] flex flex-col items-start text-left"
                >
                  <motion.div
                    className={`w-16 h-16 rounded-xl border ${step.tileCls} shadow-sm flex items-center justify-center p-4 mb-3`}
                    {...fadeUp}
                  >
                    {step.icon(`w-8 h-8 ${step.accentCls}`)}
                  </motion.div>
                  <motion.h3
                    className="text-brand-950 font-onest text-[28px] lg:text-[34px] font-semibold leading-tight lg:leading-[38px] tracking-[-1px] mb-4"
                    {...fadeUp}
                  >
                    {step.title}
                  </motion.h3>
                  <motion.p
                    className="text-brand-950 font-inter text-base lg:text-[18px] font-normal leading-relaxed lg:leading-[28px] opacity-80 mb-8"
                    {...fadeUp}
                  >
                    {step.description}
                  </motion.p>
                  <div className="flex flex-col gap-3 mb-12">
                    {step.features.map((feature) => (
                      <CheckItem key={feature} label={feature} />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-3 py-2 rounded-full bg-brand-950 group cursor-pointer relative h-14 transition-all duration-300 flex-row pl-5 pr-2"
                  >
                    <span className="font-inter text-base lg:text-[18px] font-medium leading-[28px] text-white">
                      Coba Gratis
                    </span>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center relative overflow-hidden">
                      <div>
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
                          className="lucide lucide-arrow-up-right w-4 h-4 text-brand-950"
                        >
                          <path d="M7 7h10v10"></path>
                          <path d="M7 17 17 7"></path>
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
                <div className="w-full lg:w-[516px] h-[400px] sm:h-[500px] lg:h-[560px] relative rounded-[24px] overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 z-0">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover opacity-60"
                    >
                      <source src="/videos/P01-Header-01-BG.mp4" type="video/mp4" />
                    </video>
                  </div>
                  <motion.div
                    className="relative z-10 w-full flex items-center justify-center p-6 lg:p-0"
                    {...fadeUp}
                  >
                    <img
                      alt={step.title}
                      className="w-full max-w-[384px] h-auto object-contain drop-shadow-2xl"
                      src={step.image}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
