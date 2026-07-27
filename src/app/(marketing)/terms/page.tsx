import type { Metadata } from "next";
import { PageHeader, Section } from "../_ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Syarat & Ketentuan — ${SITE.name}`,
  description: `Syarat dan ketentuan penggunaan layanan ${SITE.name}.`,
};

const LAST_UPDATED = "1 Januari 2026";

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Syarat &amp;"
        accent="Ketentuan"
        description={`Terakhir diperbarui: ${LAST_UPDATED}. Dengan menggunakan ${SITE.name}, kamu menyetujui ketentuan di bawah ini.`}
      />

      <Section title="1. Penerimaan ketentuan">
        <p>
          Dengan membuat akun atau menggunakan layanan {SITE.name}, kamu menyatakan telah membaca,
          memahami, dan menyetujui seluruh ketentuan pada halaman ini. Jika tidak setuju, mohon
          untuk tidak menggunakan layanan.
        </p>
      </Section>

      <Section title="2. Akun pengguna">
        <p>
          Kamu bertanggung jawab menjaga kerahasiaan kredensial akun serta seluruh aktivitas yang
          terjadi di dalamnya. Data yang kamu masukkan &mdash; termasuk profil, skill, dan
          pengalaman &mdash; harus akurat dan merupakan milikmu sendiri.
        </p>
      </Section>

      <Section title="3. Penggunaan layanan">
        <p>Kamu setuju untuk tidak:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>menggunakan layanan untuk aktivitas melanggar hukum atau menipu;</li>
          <li>mengunggah konten yang melanggar hak kekayaan intelektual pihak lain;</li>
          <li>melakukan scraping, reverse engineering, atau membebani sistem secara tidak wajar;</li>
          <li>menyalahgunakan fitur otomatisasi lamaran untuk spam.</li>
        </ul>
      </Section>

      <Section title="4. Konten dan rekomendasi AI">
        <p>
          Analisis skill-gap, roadmap, readiness score, serta materi lamaran yang dihasilkan AI
          bersifat rekomendasi. Kami tidak menjamin hasil rekrutmen tertentu. Selalu tinjau ulang
          setiap dokumen sebelum kamu kirimkan ke perusahaan.
        </p>
      </Section>

      <Section title="5. Data lowongan pihak ketiga">
        <p>
          Sebagian lowongan berasal dari sumber publik pihak ketiga. Kami berupaya menjaga
          keakuratan data, namun ketersediaan, deskripsi, dan proses seleksi tetap mengikuti
          ketentuan penerbit lowongan tersebut.
        </p>
      </Section>

      <Section title="6. Langganan dan pembayaran">
        <p>
          Paket gratis tersedia selamanya dengan batas penggunaan tertentu. Untuk paket berbayar,
          tagihan berjalan sesuai periode yang kamu pilih dan dapat dibatalkan kapan saja &mdash;
          akses tetap aktif sampai akhir periode berjalan.
        </p>
      </Section>

      <Section title="7. Penghentian layanan">
        <p>
          Kami dapat menangguhkan atau menutup akun yang melanggar ketentuan ini. Kamu juga dapat
          menutup akunmu kapan saja melalui pengaturan profil atau dengan menghubungi kami.
        </p>
      </Section>

      <Section title="8. Perubahan ketentuan">
        <p>
          Ketentuan ini dapat diperbarui sewaktu-waktu. Perubahan material akan kami informasikan
          melalui email atau notifikasi di dalam aplikasi.
        </p>
      </Section>

      <Section title="9. Kontak">
        <p>
          Pertanyaan seputar ketentuan ini dapat dikirim ke{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="font-medium text-[#138E5F] underline underline-offset-4"
          >
            {SITE.email}
          </a>
          .
        </p>
      </Section>
    </>
  );
}
