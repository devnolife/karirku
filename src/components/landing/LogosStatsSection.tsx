"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" },
} as const;

interface StatCard {
  logoAlt: string;
  logoSrc: string;
  description: string;
  stat: string;
  statLabel: string;
  bgColor: string;
  statCls: string;
}

const statCards: StatCard[] = [
  {
    logoAlt: "Lumassa",
    logoSrc: "/images/Lumassa.svg",
    description:
      "Profil terverifikasi, readiness score, dan AI matching membantu tim rekrutmen menemukan talenta yang tepat tanpa menyaring ratusan CV secara manual.",
    stat: "42%",
    statLabel: "Lebih cepat menemukan kandidat siap kerja",
    bgColor: "bg-[var(--act-wash-lilac)]",
    statCls: "text-brand-600",
  },
  {
    logoAlt: "Catalyst",
    logoSrc: "/images/Catalyst.svg",
    description:
      "Setiap pelamar datang dengan skill yang sudah tervalidasi dan portofolio nyata, sehingga proses seleksi langsung fokus pada talenta paling potensial.",
    stat: "34%",
    statLabel: "Peningkatan kualitas pelamar di setiap lowongan",
    bgColor: "bg-[var(--act-wash-petal)]",
    statCls: "text-violet-600",
  },
  {
    logoAlt: "Naxus",
    logoSrc: "/images/Naxus.svg",
    description:
      "Pipeline rekrutmen terstruktur dengan shortlist otomatis dan insight kandidat real-time untuk keputusan hiring yang lebih cepat dan akurat.",
    stat: "26%",
    statLabel: "Pengurangan waktu screening kandidat",
    bgColor: "bg-[var(--act-wash-sky)]",
    statCls: "text-amber-600",
  },
];

export function LogosStatsSection() {
  return (
    <section className="w-full bg-[#F6FDFF] py-20 lg:py-32 flex justify-center">
      <div className="w-full max-w-[1440px] px-6 lg:px-[96px]">
        <div className="w-full max-w-[1248px] mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 md:mb-[64px] gap-8">
            <motion.h1
              {...fadeUp}
              className="max-w-[584px] text-[36px] md:text-[52px] font-heading font-semibold leading-[42px] md:leading-[58px] tracking-[-1.2px] md:tracking-[-1.8px] text-brand-950"
            >
              Fondasi karir yang lebih cerdas untuk{" "}
              <span className="font-playfair italic text-[rgba(0,0,0,0.40)]">
                pertumbuhan
              </span>{" "}
              berskala
            </motion.h1>
            <motion.button
              {...fadeUp}
              className="flex items-center h-[56px] min-w-fit w-max bg-brand-950 rounded-full group cursor-pointer transition-colors duration-300 hover:bg-[#063b25] overflow-hidden gap-[12px] pl-[20px] pr-[8px]"
              tabIndex={0}
            >
              <div className="order-1 font-sans text-[18px] font-medium leading-[28px] text-white whitespace-nowrap">
                Coba Gratis
              </div>
              <div className="order-2 w-[40px] h-[40px] bg-white rounded-full flex items-center justify-center shrink-0">
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
                  className="lucide lucide-arrow-up-right w-[16px] h-[16px] text-brand-950"
                >
                  <path d="M7 7h10v10" />
                  <path d="M7 17 17 7" />
                </svg>
              </div>
            </motion.button>
          </div>
          <div className="flex flex-col lg:flex-row gap-[24px]">
            {statCards.map((card) => (
              <motion.div
                key={card.logoAlt}
                {...fadeUp}
                className={`flex w-full lg:w-[400px] p-6 md:p-8 flex-col items-start rounded-[24px] ${card.bgColor}`}
              >
                <div className="flex items-center gap-[12px] mb-[20px]">
                  <div className="h-[36px] flex items-center [filter:brightness(0)_saturate(100%)_invert(11%)_sepia(21%)_saturate(2304%)_hue-rotate(111deg)_brightness(91%)_contrast(100%)]">
                    <img
                      alt={card.logoAlt}
                      className="h-[36px] w-auto"
                      referrerPolicy="no-referrer"
                      src={card.logoSrc}
                    />
                  </div>
                </div>
                <p className="font-sans text-[16px] md:text-[18px] font-medium leading-[24px] md:leading-[28px] text-brand-950 opacity-80 min-h-0 md:min-h-[112px]">
                  {card.description}
                </p>
                <div className="mt-12 md:mt-[80px]">
                  <h2 className={`font-heading text-[40px] md:text-[52px] font-semibold leading-[46px] md:leading-[58px] tracking-[-1.2px] md:tracking-[-1.8px] ${card.statCls}`}>
                    <span>{card.stat}</span>
                  </h2>
                  <p className="mt-[12px] md:mt-[16px] font-sans text-[16px] md:text-[18px] font-normal leading-[24px] md:leading-[28px] text-brand-950 opacity-80">
                    {card.statLabel}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
