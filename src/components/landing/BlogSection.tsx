"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const MotionLink = motion.create(Link);

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

interface BlogTag {
  label: string;
  bg: string;
  text: string;
}

const aiArticleTags: BlogTag[] = [
  { label: "AI", bg: "bg-violet-50", text: "text-violet-700" },
  { label: "Karir", bg: "bg-brand-100", text: "text-brand-700" },
  { label: "Tips", bg: "bg-amber-100", text: "text-amber-700" },
];

const portfolioArticleTags: BlogTag[] = [
  { label: "Portofolio", bg: "bg-blue-50", text: "text-blue-700" },
  { label: "Karir", bg: "bg-brand-100", text: "text-brand-700" },
  { label: "Tips", bg: "bg-amber-100", text: "text-amber-700" },
];

function BlogTags({ tags }: { tags: BlogTag[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {tags.map((tag) => (
        <div
          key={tag.label}
          className={`px-[10px] py-[3px] rounded-[6px] text-center font-sans text-[14px] font-medium leading-[20px] ${tag.bg} ${tag.text}`}
        >
          {tag.label}
        </div>
      ))}
    </div>
  );
}

export function BlogSection() {
  return (
    <section id="blog" className="w-full bg-[#FFFFFF] py-16 md:py-[100px] flex justify-center">
      <div className="w-full max-w-[1440px] px-6 lg:px-[96px]">
        <div className="w-full max-w-[1248px] mx-auto">
          <div className="flex flex-col items-center text-center mb-12 md:mb-[80px]">
            <motion.div
              {...fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 border border-[#138E5F]/10 mb-6"
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
                className="lucide lucide-sparkles w-3.5 h-3.5 text-[#138E5F]"
              >
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                <path d="M20 3v4" />
                <path d="M22 5h-4" />
                <path d="M4 17v2" />
                <path d="M5 18H3" />
              </svg>
              <span className="text-[#138E5F] text-[13px] font-sans font-medium uppercase tracking-wider">
                Artikel Terbaru
              </span>
            </motion.div>
            <motion.h2
              {...fadeUp}
              className="text-[32px] sm:text-[40px] md:text-[52px] font-onest font-semibold text-brand-950 leading-[1.1] md:leading-[58px] tracking-tight md:tracking-[-2px] mb-6 max-w-3xl"
            >
              Insight untuk{" "}
              <span className="font-playfair italic text-[rgba(4,39,24,0.40)]">
                mengelola
              </span>{" "}
              karirmu lebih cerdas
            </motion.h2>
            <motion.p
              {...fadeUp}
              className="text-[15px] md:text-[18px] text-brand-950 leading-[1.6] md:leading-[28px] max-w-[612px] font-sans opacity-60"
            >
              Pelajari cara mengembangkan skill, menonjol di mata recruiter,
              dan mengambil keputusan karir yang lebih baik lewat tips dari
              para ahli.
            </motion.p>
          </div>
          <div className="flex flex-col lg:flex-row gap-6 justify-center">
            <MotionLink
              href="/guides"
              {...fadeUp}
              className="group cursor-pointer flex flex-col items-start bg-white hover:bg-[#F6FDFF] rounded-[24px] overflow-hidden border border-brand-950/10 shadow-[0_4px_24px_rgba(4,39,24,0.02)] hover:shadow-[0_20px_60px_rgba(4,39,24,0.08)] transition-all duration-500 w-full lg:w-[612px]"
            >
              <div className="w-full h-[300px] md:h-[440px] overflow-hidden">
                <img
                  alt="Bagaimana AI mengubah cara kita mencari kerja"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src="/images/blogs-img-01.jpg"
                />
              </div>
              <div className="flex flex-col p-6 md:p-[40px] gap-4 w-full self-stretch lg:w-[612px]">
                <span className="text-brand-950 font-sans text-base md:text-[18px] leading-[28px] opacity-80">
                  19 Feb 2026
                </span>
                <h3 className="text-brand-950 font-onest text-[28px] md:text-[34px] font-semibold leading-[1.1] md:leading-[38px] tracking-[-1px]">
                  Bagaimana AI mengubah cara kita mencari kerja
                </h3>
                <p className="text-brand-950 font-sans text-base md:text-[18px] leading-[28px] opacity-80">
                  Kenali bagaimana tools berbasis AI membantumu menemukan
                  lowongan yang tepat, menyusun CV, dan mempersiapkan
                  interview dengan lebih percaya diri.
                </p>
                <BlogTags tags={aiArticleTags} />
                <span className="text-[#138E5F] font-sans text-base md:text-[18px] font-medium leading-[28px] group-hover:underline underline-offset-4">
                  Baca selengkapnya
                </span>
              </div>
            </MotionLink>
            <MotionLink
              href="/guides"
              {...fadeUp}
              className="group cursor-pointer flex flex-col items-start bg-white hover:bg-[#F6FDFF] rounded-[24px] overflow-hidden border border-brand-950/10 shadow-[0_4px_24px_rgba(4,39,24,0.02)] hover:shadow-[0_20px_60px_rgba(4,39,24,0.08)] transition-all duration-500 w-full lg:w-[612px]"
            >
              <div className="flex flex-col p-6 md:p-[40px] gap-4 w-full self-stretch lg:w-[612px]">
                <span className="text-brand-950 font-sans text-base md:text-[18px] leading-[28px] opacity-80">
                  13 Mei 2026
                </span>
                <h3 className="text-brand-950 font-onest text-[28px] md:text-[34px] font-semibold leading-[1.1] md:leading-[38px] tracking-[-1px]">
                  Cara membangun portofolio yang dilirik recruiter
                </h3>
                <p className="text-brand-950 font-sans text-base md:text-[18px] leading-[28px] opacity-80">
                  Pelajari cara menyusun portofolio yang menonjolkan karya
                  terbaikmu dan membuat recruiter tertarik sejak pandangan
                  pertama.
                </p>
                <BlogTags tags={portfolioArticleTags} />
                <span className="text-[#138E5F] font-sans text-base md:text-[18px] font-medium leading-[28px] group-hover:underline underline-offset-4">
                  Baca selengkapnya
                </span>
              </div>
              <div className="w-full h-[300px] md:h-[440px] overflow-hidden">
                <img
                  alt="Cara membangun portofolio yang dilirik recruiter"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src="/images/blogs-img-02.jpg"
                />
              </div>
            </MotionLink>
          </div>
        </div>
      </div>
    </section>
  );
}
