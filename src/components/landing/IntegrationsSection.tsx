"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

interface IntegrationCard {
  name: string;
  description: string;
  icon: string;
  top: number;
}

const leftCards: IntegrationCard[] = [
  {
    name: "JobStreet",
    description: "Job Board",
    icon: "/images/Plaid-icon-01.png",
    top: 0,
  },
  {
    name: "LinkedIn",
    description: "Professional Network",
    icon: "/images/Stripe-icon-02.png",
    top: 96,
  },
  {
    name: "Glints",
    description: "Job Board & Komunitas",
    icon: "/images/PayPal-icon-03.png",
    top: 192,
  },
  {
    name: "Kalibrr",
    description: "Rekrutmen & Asesmen",
    icon: "/images/Visa-icon-04.png",
    top: 288,
  },
];

const rightCards: IntegrationCard[] = [
  {
    name: "Upwork",
    description: "Freelance",
    icon: "/images/Mastercard-icon-05.png",
    top: 0,
  },
  {
    name: "Notion",
    description: "Produktivitas",
    icon: "/images/QuickBooks-icon-06.png",
    top: 96,
  },
  {
    name: "Google Calendar",
    description: "Jadwal Interview",
    icon: "/images/Xero-icon-07.png",
    top: 192,
  },
  {
    name: "Slack",
    description: "Komunikasi Tim",
    icon: "/images/Coinbase-icon-08.png",
    top: 288,
  },
];

interface ConnectorLine {
  path: string;
  startX: number;
  startY: number;
  begin: string;
  gradient: "line-gradient-left" | "line-gradient-right";
}

const connectorLines: ConnectorLine[] = [
  {
    path: "M 560.60303038033 124.60303038033001 Q 410.60303038033 124.60303038033001 280 40",
    startX: 560.60303038033,
    startY: 124.60303038033001,
    begin: "0s",
    gradient: "line-gradient-left",
  },
  {
    path: "M 538.8622305917182 162.2592002113883 Q 388.86223059171823 162.2592002113883 280 136",
    startX: 538.8622305917182,
    startY: 162.2592002113883,
    begin: "0.4s",
    gradient: "line-gradient-left",
  },
  {
    path: "M 538.8622305917182 205.74079978861175 Q 388.86223059171823 205.74079978861175 280 232",
    startX: 538.8622305917182,
    startY: 205.74079978861175,
    begin: "0.8s",
    gradient: "line-gradient-left",
  },
  {
    path: "M 560.60303038033 243.39696961967 Q 410.60303038033 243.39696961967 280 328",
    startX: 560.60303038033,
    startY: 243.39696961967,
    begin: "1.2s",
    gradient: "line-gradient-left",
  },
  {
    path: "M 679.39696961967 124.60303038033001 Q 829.39696961967 124.60303038033001 960 40",
    startX: 679.39696961967,
    startY: 124.60303038033001,
    begin: "0.2s",
    gradient: "line-gradient-right",
  },
  {
    path: "M 701.1377694082818 162.25920021138825 Q 851.1377694082818 162.25920021138825 960 136",
    startX: 701.1377694082818,
    startY: 162.25920021138825,
    begin: "0.6s",
    gradient: "line-gradient-right",
  },
  {
    path: "M 701.1377694082818 205.74079978861175 Q 851.1377694082818 205.74079978861175 960 232",
    startX: 701.1377694082818,
    startY: 205.74079978861175,
    begin: "1s",
    gradient: "line-gradient-right",
  },
  {
    path: "M 679.39696961967 243.39696961967 Q 829.39696961967 243.39696961967 960 328",
    startX: 679.39696961967,
    startY: 243.39696961967,
    begin: "1.4s",
    gradient: "line-gradient-right",
  },
];

function IntegrationCardItem({ card }: { card: IntegrationCard }) {
  return (
    <motion.div
      {...fadeUp}
      className="w-[240px] sm:w-[260px] lg:w-[280px] h-[72px] lg:h-[80px] bg-white rounded-[16px] lg:rounded-[20px] p-3 lg:p-[16px] flex items-center gap-3 lg:gap-4 shadow-[0_4px_20px_rgba(4,39,24,0.02)] group hover:shadow-[0_12px_40px_rgba(4,39,24,0.06)] transition-all cursor-default border border-black/[0.02] lg:absolute"
      style={{ top: `${card.top}px` }}
    >
      <div className="w-[48px] h-[48px] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        <img
          alt={card.name}
          className="w-full h-full object-contain"
          src={card.icon}
        />
      </div>
      <div className="flex flex-col">
        <span className="text-[#042718] font-semibold text-[14px] lg:text-[16px] leading-tight">
          {card.name}
        </span>
        <span className="text-[#042718]/40 text-[12px] lg:text-[13px] font-sans mt-0.5">
          {card.description}
        </span>
      </div>
    </motion.div>
  );
}

export function IntegrationsSection() {
  return (
    <section className="w-full bg-[#F4FAFB] py-16 md:py-[100px] overflow-hidden relative flex justify-center">
      <div className="w-full max-w-[1440px] px-6 lg:px-[96px]">
        <div className="w-full max-w-[1248px] mx-auto">
          <div className="flex flex-col items-center text-center mb-12 md:mb-[80px]">
            <motion.div
              {...fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#138E5F]/5 border border-[#138E5F]/10 mb-6"
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
                className="lucide lucide-star w-4 h-4 text-[#138E5F] fill-[#138E5F]"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span className="text-[#138E5F] text-[14px] font-medium font-sans">
                Integrasi
              </span>
            </motion.div>
            <motion.h2
              {...fadeUp}
              className="text-[32px] sm:text-[40px] md:text-[52px] font-semibold text-[#042718] leading-[1.2] md:leading-[58px] tracking-tight md:tracking-[-1.8px] mb-6 max-w-2xl text-center"
            >
              Hubungkan semua peluang karirmu di{" "}
              <span className="font-playfair italic text-[rgba(0,0,0,0.40)]">
                satu tempat
              </span>
            </motion.h2>
            <motion.p
              {...fadeUp}
              className="text-[15px] md:text-[18px] text-[#042718] leading-[1.6] md:leading-[28px] max-w-[612px] font-sans font-normal opacity-80 text-center"
            >
              Integrasikan job board, jaringan profesional, dan tools
              produktivitasmu untuk melihat seluruh peluang karir secara
              lengkap dan real-time.
            </motion.p>
          </div>
          <div className="relative w-full max-w-[1240px] mx-auto min-h-[400px] lg:h-[368px] flex items-center justify-center">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block"
              viewBox="0 0 1240 368"
            >
              <defs>
                <linearGradient
                  id="line-gradient-left"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#138E5F" stopOpacity="0.02"></stop>
                  <stop offset="100%" stopColor="#138E5F" stopOpacity="0.4"></stop>
                </linearGradient>
                <linearGradient
                  id="line-gradient-right"
                  x1="100%"
                  y1="0%"
                  x2="0%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#138E5F" stopOpacity="0.02"></stop>
                  <stop offset="100%" stopColor="#138E5F" stopOpacity="0.4"></stop>
                </linearGradient>
              </defs>
              {connectorLines.map((line) => (
                <g key={line.begin + line.path}>
                  <path
                    d={line.path}
                    stroke={`url(#${line.gradient})`}
                    fill="none"
                    strokeWidth="1.8"
                    strokeDasharray="4 4"
                    opacity="0.9"
                  ></path>
                  <circle r="3.5" fill="#138E5F">
                    <animateMotion
                      dur="3.5s"
                      repeatCount="indefinite"
                      path={line.path}
                      begin={line.begin}
                    ></animateMotion>
                  </circle>
                </g>
              ))}
              {connectorLines.map((line) => (
                <circle
                  key={`node-${line.begin}`}
                  cx={line.startX}
                  cy={line.startY}
                  r="5"
                  fill="#138E5F"
                  opacity="0.95"
                >
                  <animate
                    attributeName="r"
                    values="5;6;5"
                    dur="2s"
                    repeatCount="indefinite"
                    begin={line.begin}
                  ></animate>
                </circle>
              ))}
            </svg>
            <div className="w-full flex flex-col lg:block relative z-10 lg:h-full">
              <div className="flex flex-wrap lg:grid justify-center gap-4 lg:absolute lg:left-0 lg:top-0 lg:h-full lg:w-[280px] mb-8 lg:mb-0">
                {leftCards.map((card) => (
                  <IntegrationCardItem key={card.name} card={card} />
                ))}
              </div>
              <div className="flex items-center justify-center py-8 lg:py-0 lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
                <div className="relative w-[100px] lg:w-[124px] h-[100px] lg:h-[124px] flex items-center justify-center">
                  <motion.div
                    className="absolute inset-0 -m-8 lg:-m-[58px] rounded-full bg-[#E4F3EB]/60 shadow-[inset_0_0_40px_rgba(19,142,95,0.03)]"
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  ></motion.div>
                  <div className="absolute inset-0 -m-4 lg:-m-[32px] rounded-full bg-white/40 backdrop-blur-[1px]"></div>
                  <div className="w-full h-full rounded-full bg-white shadow-[0_12px_48px_rgba(19,142,95,0.12)] flex items-center justify-center relative z-10">
                    <div className="w-[84px] lg:w-[104px] h-[84px] lg:h-[104px] rounded-full bg-[#FAFFFD] flex items-center justify-center">
                      <img
                        alt="CraftWorks Logo"
                        className="w-[50px] lg:w-[64px] h-[50px] lg:h-[64px] object-contain opacity-95"
                        src="/images/craftworks-icon.svg"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap lg:grid justify-center gap-4 lg:absolute lg:right-0 lg:top-0 lg:h-full lg:w-[280px] mt-8 lg:mt-0">
                {rightCards.map((card) => (
                  <IntegrationCardItem key={card.name} card={card} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center mt-12 md:mt-[80px] gap-6 md:gap-8">
            <motion.div
              {...fadeUp}
              className="inline-flex items-center gap-3 px-5 md:px-[24px] py-2 md:py-[11px] rounded-full border border-[#138E5F]/15 bg-white/50 shadow-[0_4px_24px_rgba(19,142,95,0.03)]"
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
                className="lucide lucide-shield-check w-5 h-5 text-[#138E5F]"
              >
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              <p className="text-[13px] md:text-[15px] font-sans">
                <span className="text-[#138E5F] font-semibold">
                  Data profilmu aman &amp; terenkripsi.
                </span>{" "}
                <span className="text-[#042718]/40">
                  Kami tidak pernah membagikan datamu tanpa izin.
                </span>
              </p>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-[13px] md:text-[15px] text-[#042718]/40 font-sans tracking-tight text-center px-4"
            >
              Dipercaya{" "}
              <span className="font-semibold text-[#138E5F]">50.000+</span>{" "}
              pencari kerja. Terhubung dengan{" "}
              <span className="font-semibold text-[#138E5F]">20+</span>{" "}
              platform karir &amp; produktivitas di Indonesia.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
