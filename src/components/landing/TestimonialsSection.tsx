"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  accent: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "\u201CAI matching CraftWorks akurat banget. Saya tidak lagi melamar ke ratusan lowongan acak \u2014 rekomendasi yang muncul benar-benar sesuai skill dan arah karir saya.\u201D",
    name: "Raka Pradana",
    role: "Frontend Developer",
    avatar: "/images/photo-1507003211169-0a1dd7228f2d.jpg",
    accent: "border-violet-300",
  },
  {
    quote:
      "\u201CSebagai fresh graduate, readiness score membantu saya tahu persis kekurangan apa yang harus diperbaiki sebelum melamar. Rasanya seperti punya mentor karir pribadi.\u201D",
    name: "Nadia Rahmawati",
    role: "Fresh Graduate, Sistem Informasi",
    avatar: "/images/photo-1494790108377-be9c29b29330.jpg",
    accent: "border-blue-300",
  },
  {
    quote:
      "\u201CSetelah skill saya terverifikasi di CraftWorks, profil saya jauh lebih sering dilirik recruiter. Dua minggu kemudian saya sudah tanda tangan kontrak baru.\u201D",
    name: "Bima Saputra",
    role: "Digital Marketer",
    avatar: "/images/photo-1472099645785-5658abf4ff4e.jpg",
    accent: "border-teal-300",
  },
  {
    quote:
      "\u201CScreening kandidat yang dulu makan waktu berminggu-minggu kini selesai dalam hitungan hari. Skill yang sudah terverifikasi membuat kami yakin sejak awal.\u201D",
    name: "Sinta Maharani",
    role: "HR Manager, Perusahaan Teknologi",
    avatar: "/images/photo-1438761681033-6461ffad8d80.jpg",
    accent: "border-brand-300",
  },
  {
    quote:
      "\u201CSebagai founder, waktu adalah segalanya. CraftWorks menyodorkan kandidat yang benar-benar siap kerja, jadi tim kecil kami bisa merekrut cepat tanpa salah pilih.\u201D",
    name: "Arif Wicaksono",
    role: "Founder Startup EdTech",
    avatar: "/images/photo-1500648767791-00dcc994a43e.jpg",
    accent: "border-violet-300",
  },
];

const GAP = 24;
const COUNT = TESTIMONIALS.length;

function TestimonialCard({
  testimonial,
  isActive,
  width,
}: {
  testimonial: Testimonial;
  isActive: boolean;
  width: number;
}) {
  return (
    <div
      className={
        isActive
          ? "relative flex flex-col items-center shrink-0 rounded-[24px] md:rounded-[30px] transition-all duration-500 overflow-hidden p-[32px] md:p-[48px_48px_40px_48px] border border-[rgba(255,255,255,0.1)] shadow-[0_20px_50px_rgba(4,39,24,0.1)]"
          : "relative flex flex-col items-center shrink-0 rounded-[24px] md:rounded-[30px] transition-all duration-500 overflow-hidden p-[32px] md:p-[48px_48px_40px_48px] border border-[rgba(4,39,24,0.08)] bg-[rgba(255,255,255,0.20)]"
      }
      style={{ width }}
    >
      {isActive && (
        <>
          <div className="absolute inset-0 z-0">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src="/videos/P01-Header-01-BG.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[140px] bg-white/[0.05] backdrop-blur-md z-[5] pointer-events-none [mask-image:linear-gradient(to_top,black_40%,transparent)]"></div>
        </>
      )}
      <div className="relative z-10 flex flex-col items-center w-full h-full justify-center">
        <div className="flex items-center justify-center min-h-[90px] md:min-h-[102px] mb-[48px]">
          <p
            className={
              isActive
                ? "font-medium text-center transition-colors duration-500 text-white text-[20px] md:text-[26px] leading-[28px] md:leading-[34px] line-clamp-4"
                : "font-medium text-center transition-colors duration-500 text-brand-950 text-[18px] md:text-[22px] leading-[24px] md:leading-[30px] line-clamp-3"
            }
          >
            {testimonial.quote}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div
            className={`w-[48px] h-[48px] rounded-full overflow-hidden mb-[12px] border-2 ${
              isActive ? "border-white/20" : testimonial.accent
            }`}
          >
            <img
              alt={testimonial.name}
              className="w-full h-full object-cover"
              src={testimonial.avatar}
            />
          </div>
          <p
            className={`font-medium text-[16px] md:text-[18px] leading-[28px] text-center mb-[4px] transition-colors duration-500 ${
              isActive ? "text-white" : "text-brand-950"
            }`}
          >
            {testimonial.name}
          </p>
          <p
            className={`text-[12px] md:text-[14px] leading-[20px] text-center transition-colors duration-500 ${
              isActive ? "text-white/80" : "text-brand-950 opacity-80"
            }`}
          >
            {testimonial.role}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const [active, setActive] = useState(4);
  const [cardWidth, setCardWidth] = useState(660);

  useEffect(() => {
    const update = () => {
      setCardWidth(Math.min(660, window.innerWidth - 48));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const cards = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];
  const activeStripIndex = COUNT + active;
  const offset = -(activeStripIndex * (cardWidth + GAP) + cardWidth / 2);

  const goPrev = () => setActive((prev) => (prev - 1 + COUNT) % COUNT);
  const goNext = () => setActive((prev) => (prev + 1) % COUNT);

  return (
    <section className="w-full bg-[#F6FDFF] py-16 lg:pt-16 lg:pb-32 overflow-hidden flex justify-center">
      <div className="w-full max-w-[1440px] flex flex-col items-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[1248px] px-6 lg:px-0 flex flex-col items-center text-center mt-0 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#138E5F]/[0.05] border border-[#138E5F]/10 mb-4">
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
              className="lucide lucide-star w-3.5 h-3.5 text-amber-500 fill-amber-500"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span className="text-[14px] font-medium text-[#138E5F] tracking-tight">
              Testimoni
            </span>
          </div>
          <h2 className="text-brand-950 text-[28px] sm:text-[36px] md:text-[52px] font-semibold leading-tight tracking-tight max-w-[690px] mb-4 lg:mb-6">
            Dipercaya oleh mereka yang{" "}
            <i className="font-playfair text-[rgba(0,0,0,0.40)]">mengambil kendali</i> atas
            karirnya
          </h2>
          <p className="text-brand-950 opacity-80 text-[16px] md:text-[18px] leading-[24px] md:leading-[28px] max-w-[576px]">
            Lihat bagaimana talenta dan perusahaan menemukan kecocokan lebih cepat,
            membuktikan skill, dan membangun karir bersama CraftWorks.
          </p>
        </motion.div>
        <div className="relative w-full overflow-visible">
          <div className="relative flex justify-start items-center overflow-visible min-h-[400px] md:min-h-[500px]">
            <motion.div
              className="flex gap-6 items-center flex-nowrap ml-[50%]"
              animate={{ x: offset }}
              transition={{ type: "tween", duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            >
              {cards.map((testimonial, i) => (
                <TestimonialCard
                  key={`${testimonial.name}-${i}`}
                  testimonial={testimonial}
                  isActive={i === activeStripIndex}
                  width={cardWidth}
                />
              ))}
            </motion.div>
          </div>
          <div className="absolute inset-y-0 left-0 w-[100px] md:w-[180px] z-20 pointer-events-none bg-gradient-to-r from-[#F6FDFF] via-[#F6FDFF]/70 to-transparent"></div>
          <div className="absolute inset-y-0 right-0 w-[100px] md:w-[180px] z-20 pointer-events-none bg-gradient-to-l from-[#F6FDFF] via-[#F6FDFF]/70 to-transparent"></div>
        </div>
        <div className="w-full max-w-[1248px] flex items-center justify-center gap-3 mt-12">
          <button
            type="button"
            aria-label="Testimoni sebelumnya"
            onClick={goPrev}
            className="w-[48px] h-[48px] md:w-[60px] md:h-[60px] rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer border-[rgba(4,39,24,0.08)] bg-white/5 hover:bg-white/20"
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
              className="lucide lucide-arrow-left w-5 h-5 md:w-6 md:h-6 text-brand-950"
            >
              <path d="m12 19-7-7 7-7"></path>
              <path d="M19 12H5"></path>
            </svg>
          </button>
          <button
            type="button"
            aria-label="Testimoni berikutnya"
            onClick={goNext}
            className="w-[48px] h-[48px] md:w-[60px] md:h-[60px] rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer bg-brand-950 hover:bg-brand-950/90 shadow-lg"
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
              className="lucide lucide-arrow-right w-5 h-5 md:w-6 md:h-6 text-white"
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
