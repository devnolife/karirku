"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

interface Metric {
  value: string;
  suffix: string;
  label: string;
  description: string;
  numCls: string;
}

const metrics: Metric[] = [
  {
    value: "250",
    suffix: "K+",
    label: "Talent Terdaftar",
    description:
      "Talenta di seluruh Indonesia membangun profil terverifikasi dan siap direkrut setiap harinya.",
    numCls: "text-brand-600",
  },
  {
    value: "84",
    suffix: "%",
    label: "Akurasi kecocokan karir",
    description:
      "Talent menemukan peluang yang tepat berkat AI matching dan analisis kecocokan yang lebih cerdas.",
    numCls: "text-violet-600",
  },
  {
    value: "500",
    suffix: "K+",
    label: "Lowongan teragregasi",
    description:
      "Lowongan dari berbagai platform dan perusahaan terkurasi dalam satu tempat untuk karirmu.",
    numCls: "text-blue-600",
  },
];

export function MetricsSection() {
  return (
    <section className="w-full bg-[#F6FDFF] py-16 lg:pt-32 lg:pb-16 overflow-hidden flex justify-center">
      <div className="w-full max-w-[1248px] px-6 lg:px-0 flex flex-col items-center">
        <motion.div
          {...fadeUp}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E5F2ED] border border-brand-950/[0.08]"
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
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
            <path d="M20 3v4"></path>
            <path d="M22 5h-4"></path>
            <path d="M4 17v2"></path>
            <path d="M5 18H3"></path>
          </svg>
          <span className="text-sm font-medium text-[#15803D]">Angka Kunci</span>
        </motion.div>
        <motion.h2
          {...fadeUp}
          className="mt-6 sm:mt-8 w-full max-w-[970px] text-center text-[30px] sm:text-[36px] lg:text-[42px] font-semibold leading-[1.2] sm:leading-[44px] lg:leading-[48px] tracking-[-1.5px] sm:tracking-[-2px] text-brand-950"
        >
          Berkarir lebih cerdas, berkembang lebih cepat, dan mengambil keputusan
          karir yang lebih tepat. Mari kendalikan karirmu bersama.
        </motion.h2>
        <div className="mt-12 sm:mt-16 lg:mt-20 flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start items-center sm:items-start gap-10 sm:gap-x-6 lg:gap-[24px] w-full">
          {metrics.map((metric) => (
            <motion.div
              key={metric.label}
              {...fadeUp}
              className="flex flex-col items-start w-full sm:w-[400px]"
            >
              <div className="flex flex-col items-start w-full sm:w-[294px] p-[20px_24px] gap-2.5 rounded-[24px] bg-white/40 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(4,39,24,0.06)]">
                <div className="flex justify-center items-baseline gap-[2px]">
                  <span className={`${metric.numCls} text-[52px] font-semibold leading-[58px] tracking-[-1.8px]`}>
                    {metric.value}
                  </span>
                  <span className="text-black/40 text-[42px] font-semibold leading-[48px] tracking-[-2px]">
                    {metric.suffix}
                  </span>
                </div>
                <p className="text-brand-950 text-[18px] font-medium leading-[28px]">
                  {metric.label}
                </p>
              </div>
              <p className="mt-4 text-brand-950 text-[16px] font-normal leading-[24px] tracking-[-0.3px] opacity-80 line-clamp-2 pr-[20px]">
                {metric.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
