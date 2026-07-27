import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Section } from "../_ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Kontak — ${SITE.name}`,
  description: "Hubungi tim CraftWorks untuk pertanyaan produk, kerja sama, atau dukungan akun.",
};

const channels = [
  {
    title: "Pertanyaan umum & dukungan",
    detail: SITE.email,
    href: `mailto:${SITE.email}`,
    note: "Balasan rata-rata dalam 1–2 hari kerja.",
  },
  {
    title: "Kerja sama & perusahaan",
    detail: `partner@${SITE.email.split("@")[1]}`,
    href: `mailto:partner@${SITE.email.split("@")[1]}`,
    note: "Untuk posting lowongan, hiring partner, atau kolaborasi konten.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Kontak"
        title="Ada yang ingin kamu"
        accent="tanyakan?"
        description="Kami senang mendengar masukan, pertanyaan, maupun ide kerja sama. Pilih kanal yang paling sesuai di bawah ini."
      />

      <Section title="Kanal kontak">
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          {channels.map((channel) => (
            <a
              key={channel.title}
              href={channel.href}
              className="rounded-[20px] border border-[#042718]/10 bg-white p-6 transition-colors hover:bg-[#F6FDFF]"
            >
              <h3 className="font-onest text-[18px] font-semibold text-[#042718]">
                {channel.title}
              </h3>
              <p className="mt-2 font-medium text-[#138E5F] underline underline-offset-4">
                {channel.detail}
              </p>
              <p className="mt-2 text-[15px] leading-[24px] opacity-70">{channel.note}</p>
            </a>
          ))}
        </div>
      </Section>

      <Section title="Sudah punya akun?">
        <p>
          Sebagian pertanyaan soal lowongan, roadmap, atau lamaran bisa langsung kamu selesaikan
          dari dashboard.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex items-center rounded-full bg-[#042718] px-6 py-3 font-medium text-white transition-colors hover:bg-[#063b25]"
          >
            Masuk ke dashboard
          </Link>
          <Link
            href="/guides"
            className="inline-flex items-center rounded-full border border-[#042718]/15 px-6 py-3 font-medium transition-colors hover:bg-[#F6FDFF]"
          >
            Baca panduan
          </Link>
        </div>
      </Section>
    </>
  );
}
