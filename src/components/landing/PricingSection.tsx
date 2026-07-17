"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type BillingPeriod = "monthly" | "yearly";

interface Plan {
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  freeForever: boolean;
  cta: string;
  features: string[];
  highlighted: boolean;
  check: string;
}

const plans: Plan[] = [
  {
    name: "Gratis",
    description: "Untuk talent mulai membangun profil karir",
    monthlyPrice: "Rp0",
    yearlyPrice: "Rp0",
    freeForever: true,
    cta: "Mulai Gratis",
    features: [
      "Profil karir dasar",
      "Lamar lowongan pekerjaan",
      "3 AI match per minggu",
      "Akses komunitas talent",
      "Rekomendasi lowongan mingguan",
    ],
    highlighted: false,
    check: "text-brand-600",
  },
  {
    name: "Talent Pro",
    description: "Terbaik untuk mempercepat karirmu",
    monthlyPrice: "Rp49rb",
    yearlyPrice: "Rp38rb",
    freeForever: false,
    cta: "Coba Talent Pro",
    features: [
      "Semua fitur paket Gratis",
      "AI matching tanpa batas",
      "Readiness score & insight profil",
      "Verifikasi skill prioritas",
      "Roadmap belajar personal",
    ],
    highlighted: true,
    check: "text-violet-600",
  },
  {
    name: "Perusahaan",
    description: "Untuk tim rekrutmen & perusahaan",
    monthlyPrice: "Rp990rb",
    yearlyPrice: "Rp760rb",
    freeForever: false,
    cta: "Hubungi Kami",
    features: [
      "Posting lowongan tanpa batas",
      "Cari talent pre-qualified",
      "Shortlist kandidat otomatis",
      "Analitik kandidat lengkap",
      "Dukungan prioritas",
    ],
    highlighted: false,
    check: "text-blue-600",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" },
} as const;

function CheckIcon({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ArrowUpRightIcon({ className }: { className: string }) {
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
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

export function PricingSection() {
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  return (
    <section
      id="pricing"
      className="w-full bg-[#ffffff] py-20 lg:py-32 overflow-hidden flex justify-center"
    >
      <div className="w-full max-w-[1248px] lg:px-0 px-6 flex flex-col items-center">
        <motion.div
          {...fadeUp}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E5F2ED] border border-brand-950/08"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-sparkles text-[#15803D]"
          >
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            <path d="M20 3v4" />
            <path d="M22 5h-4" />
            <path d="M4 17v2" />
            <path d="M5 18H3" />
          </svg>
          <span className="font-inter text-sm font-medium text-[#15803D]">
            Paket Harga
          </span>
        </motion.div>
        <motion.h2
          {...fadeUp}
          className="mt-6 w-full max-w-[800px] text-center text-brand-950 font-onest text-[36px] sm:text-[48px] lg:text-[64px] font-semibold leading-[1.1] tracking-[-2px] sm:tracking-[-3px]"
        >
          Pilih{" "}
          <span className="font-playfair italic font-medium text-black/40">
            paket
          </span>{" "}
          yang sesuai perjalanan karirmu
        </motion.h2>
        <motion.p
          {...fadeUp}
          className="mt-6 w-full max-w-[600px] text-center font-inter text-[16px] sm:text-[18px] font-normal leading-[24px] sm:leading-[28px] text-brand-950 opacity-80"
        >
          Harga sederhana dan transparan untuk talent maupun perusahaan — mulai
          gratis, upgrade kapan saja.
        </motion.p>
        <motion.div
          {...fadeUp}
          className="mt-10 flex items-center p-1.5 bg-white border border-brand-950/08 rounded-full shadow-sm mb-16"
        >
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`px-8 py-2 h-11 flex items-center justify-center rounded-full text-[15px] font-medium transition-all duration-300 ${
              billing === "monthly"
                ? "bg-brand-950 text-white shadow-md shadow-brand-950/10"
                : "gap-2 text-brand-950/60 hover:text-brand-950"
            }`}
          >
            Bulanan
          </button>
          <button
            type="button"
            onClick={() => setBilling("yearly")}
            className={`px-8 py-2 h-11 flex items-center justify-center rounded-full text-[15px] font-medium transition-all duration-300 gap-2 ${
              billing === "yearly"
                ? "bg-brand-950 text-white shadow-md shadow-brand-950/10"
                : "text-brand-950/60 hover:text-brand-950"
            }`}
          >
            Tahunan
            <span className="px-2 py-0.5 rounded-full bg-brand-500 text-[10px] text-white font-bold whitespace-nowrap">
              Hemat 23%
            </span>
          </button>
        </motion.div>
        <div className="flex flex-col lg:flex-row gap-6 w-full justify-center">
          {plans.map((plan) => (
            <motion.div key={plan.name} {...fadeUp} className="w-full lg:w-auto">
              <div
                className={`relative flex flex-col items-start w-full lg:w-[404px] p-[32px] rounded-[30px] border transition-all duration-500 overflow-hidden cursor-pointer group ${
                  plan.highlighted
                    ? "border-violet-600/30 shadow-[0_24px_48px_-24px_rgba(124,58,237,0.4)] -translate-y-2.5"
                    : "border-brand-950/08 bg-white"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute inset-0 z-0">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    >
                      <source
                        src="/videos/P01-Header-01-BG.mp4"
                        type="video/mp4"
                      />
                    </video>
                    <div className="absolute inset-0 bg-[#D4E8E1]/15 backdrop-blur-[4px]" />
                  </div>
                )}
                <div className="relative z-10 w-full flex flex-col">
                  <div className="flex flex-col gap-[6px]">
                    <h3 className="text-brand-950 font-onest text-[28px] font-semibold leading-[34px] tracking-[-0.8px]">
                      {plan.name}
                    </h3>
                    <p className="text-brand-950 font-inter text-[16px] font-normal leading-[24px] tracking-[-0.3px] opacity-80">
                      {plan.description}
                    </p>
                  </div>
                  <div
                    className={`mt-[16px] border-t w-full transition-colors duration-300 ${
                      plan.highlighted
                        ? "border-brand-950/20"
                        : "border-brand-950/08"
                    }`}
                  />
                  <div className="mt-[16px] flex flex-col">
                    <div className="flex items-baseline">
                      <span className="text-brand-950 font-onest text-[56px] font-semibold leading-[64px] tracking-[-2px]">
                        {billing === "monthly"
                          ? plan.monthlyPrice
                          : plan.yearlyPrice}
                      </span>
                    </div>
                    <p className="mt-[16px] text-brand-950 font-inter text-[18px] font-normal leading-[28px] tracking-[-0.3px] opacity-80">
                      {plan.freeForever
                        ? "Gratis selamanya"
                        : billing === "monthly"
                          ? "Per bulan, ditagih bulanan"
                          : "Per bulan, ditagih tahunan"}
                    </p>
                  </div>
                  <Link
                    href="/login"
                    className={`mt-[24px] flex items-center justify-between self-stretch rounded-full border transition-all duration-500 relative overflow-hidden p-[8px_8px_8px_20px] flex-row ${
                      plan.highlighted
                        ? "bg-brand-950 border-brand-950 text-white"
                        : "bg-white border-brand-950/10 text-brand-950"
                    }`}
                  >
                    <span className="font-inter text-[18px] font-medium leading-[28px] z-10">
                      {plan.cta}
                    </span>
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 z-10 ${
                        plan.highlighted ? "bg-white" : "bg-brand-950"
                      }`}
                    >
                      <ArrowUpRightIcon
                        className={`lucide lucide-arrow-up-right transition-colors duration-300 ${
                          plan.highlighted ? "text-brand-950" : "text-white"
                        }`}
                      />
                    </div>
                  </Link>
                  <div className="mt-[24px] flex flex-col">
                    <p
                      className={`font-inter text-[14px] font-medium leading-[20px] uppercase transition-colors duration-300 ${
                        plan.highlighted
                          ? "text-white opacity-70"
                          : "text-brand-950/40"
                      }`}
                    >
                      FITUR
                    </p>
                    <ul className="mt-[16px] flex flex-col gap-[12px]">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div
                            className={`mt-1 flex items-center justify-center w-6 h-6 rounded-full transition-all duration-500 ${
                              plan.highlighted ? "bg-white" : "bg-transparent"
                            }`}
                          >
                            <CheckIcon
                              className={`lucide lucide-check ${plan.check}`}
                            />
                          </div>
                          <span
                            className={`font-inter text-[18px] font-normal leading-[28px] tracking-[-0.3px] transition-colors duration-300 ${
                              plan.highlighted
                                ? "text-white"
                                : "text-brand-950/80"
                            }`}
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
