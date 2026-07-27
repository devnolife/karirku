import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Section } from "../_ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Karir — ${SITE.name}`,
  description:
    "Bergabung membangun AI career copilot untuk Indonesia. Lihat posisi yang sedang kami buka.",
};

const openRoles = [
  {
    title: "Full-stack Engineer (Next.js / TypeScript)",
    type: "Full-time",
    location: "Remote (Indonesia)",
    summary:
      "Membangun product surface end-to-end: app router, server actions, dan integrasi pipeline data lowongan.",
  },
  {
    title: "AI / ML Engineer",
    type: "Full-time",
    location: "Remote (Indonesia)",
    summary:
      "Mengembangkan skill extraction, matching, dan sistem rekomendasi di atas model yang kami self-host.",
  },
  {
    title: "Product Designer",
    type: "Kontrak",
    location: "Remote (Indonesia)",
    summary:
      "Merancang alur guidance yang jelas: dari assessment, roadmap belajar, sampai proses melamar.",
  },
];

export default function CareersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Karir"
        title="Bangun produk yang mengubah jalur"
        accent="karir"
        description="Kami tim kecil yang bergerak cepat. Kalau kamu senang menyelesaikan masalah nyata dengan produk yang dipakai orang banyak, kita cocok."
      />

      <Section title="Posisi yang dibuka">
        <ul className="mt-2 flex flex-col gap-4">
          {openRoles.map((role) => (
            <li
              key={role.title}
              className="rounded-[20px] border border-[#042718]/10 bg-white p-6 transition-colors hover:bg-[#F6FDFF]"
            >
              <h3 className="font-onest text-[20px] font-semibold text-[#042718]">
                {role.title}
              </h3>
              <p className="mt-1 text-[14px] uppercase tracking-wide opacity-60">
                {role.type} &middot; {role.location}
              </p>
              <p className="mt-3 text-[16px] leading-[26px] opacity-80">{role.summary}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Cara melamar">
        <p>
          Kirim CV atau portofolio ke{" "}
          <a
            href={`mailto:${SITE.email}?subject=Lamaran%20-%20Posisi`}
            className="font-medium text-[#138E5F] underline underline-offset-4"
          >
            {SITE.email}
          </a>{" "}
          dengan subjek nama posisi. Kami balas semua lamaran dalam 7 hari kerja.
        </p>
        <div className="mt-2">
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full bg-[#042718] px-6 py-3 font-medium text-white transition-colors hover:bg-[#063b25]"
          >
            Ada pertanyaan? Hubungi kami
          </Link>
        </div>
      </Section>
    </>
  );
}
