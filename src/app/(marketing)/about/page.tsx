import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Section } from "../_ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Tentang — ${SITE.name}`,
  description:
    "CraftWorks adalah AI career copilot: bantu kamu menilai skill, menutup gap, dan menemukan peluang kerja yang benar-benar cocok.",
};

const pillars = [
  {
    title: "Assess",
    body: "Kami mulai dari titik nolmu: skill yang sudah dimiliki, pengalaman, dan target karir yang ingin dikejar.",
  },
  {
    title: "Gap & Roadmap",
    body: "AI membandingkan profilmu dengan kebutuhan pasar nyata, lalu menyusun langkah belajar yang konkret dan terukur.",
  },
  {
    title: "Match & Apply",
    body: "Begitu readiness score-mu cukup, kami cocokkan dengan lowongan dan bantu siapkan lamaran yang relevan.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tentang kami"
        title="Kami bantu orang Indonesia merancang"
        accent="karirnya"
        description="CraftWorks bukan sekadar job board. Kami menemani perjalanan karir dari 'belum tahu mau ke mana' sampai dapat kerja atau project pertama."
      />

      <Section title="Kenapa kami ada">
        <p>
          Banyak orang berhenti bukan karena kurang mampu, tapi karena tidak tahu langkah
          berikutnya. Informasi karir tersebar, lowongan sulit dinilai relevansinya, dan
          saran yang beredar sering terlalu umum.
        </p>
        <p>
          Kami membangun copilot karir berbasis AI yang bekerja dengan data lowongan nyata,
          sehingga setiap rekomendasi punya konteks pasar &mdash; bukan tebakan.
        </p>
      </Section>

      <Section title="Bagaimana cara kerjanya">
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-[20px] border border-[#042718]/10 bg-white p-5 transition-colors hover:bg-[#F6FDFF]"
            >
              <h3 className="font-onest text-[18px] font-semibold text-[#042718]">
                {pillar.title}
              </h3>
              <p className="mt-2 text-[15px] leading-[24px] opacity-80">{pillar.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Mulai dari mana">
        <p>
          Buat akun gratis, isi profil singkat, dan kamu langsung dapat gambaran skill-gap
          serta rekomendasi lowongan pertama.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex items-center rounded-full bg-[#042718] px-6 py-3 font-medium text-white transition-colors hover:bg-[#063b25]"
          >
            Coba Gratis
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full border border-[#042718]/15 px-6 py-3 font-medium transition-colors hover:bg-[#F6FDFF]"
          >
            Hubungi kami
          </Link>
        </div>
      </Section>
    </>
  );
}
