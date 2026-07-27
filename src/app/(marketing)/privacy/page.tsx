import type { Metadata } from "next";
import { PageHeader, Section } from "../_ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Kebijakan Privasi — ${SITE.name}`,
  description: `Bagaimana ${SITE.name} mengumpulkan, menggunakan, dan melindungi data pribadimu.`,
};

const LAST_UPDATED = "1 Januari 2026";

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Kebijakan"
        accent="Privasi"
        description={`Terakhir diperbarui: ${LAST_UPDATED}. Halaman ini menjelaskan data apa yang kami kumpulkan dan bagaimana kami menggunakannya.`}
      />

      <Section title="1. Data yang kami kumpulkan">
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong className="font-medium">Data akun</strong> &mdash; nama, email, dan kredensial
            login (termasuk data dari penyedia OAuth jika kamu memakainya).
          </li>
          <li>
            <strong className="font-medium">Data profil karir</strong> &mdash; skill, pengalaman,
            pendidikan, target role, CV, dan portofolio yang kamu unggah.
          </li>
          <li>
            <strong className="font-medium">Data aktivitas</strong> &mdash; lowongan yang kamu
            lihat, simpan, atau lamar, serta progres belajar.
          </li>
          <li>
            <strong className="font-medium">Data teknis</strong> &mdash; log akses, tipe perangkat,
            dan cookie sesi yang diperlukan agar layanan berfungsi.
          </li>
        </ul>
      </Section>

      <Section title="2. Bagaimana data digunakan">
        <p>
          Data dipakai untuk menjalankan fitur inti: analisis skill-gap, penyusunan roadmap,
          pencocokan lowongan, dan pembuatan materi lamaran. Kami juga menggunakan data agregat
          dan anonim untuk memperbaiki kualitas rekomendasi.
        </p>
      </Section>

      <Section title="3. Pemrosesan oleh AI">
        <p>
          Analisis AI dijalankan pada infrastruktur yang kami kelola sendiri. Data profilmu tidak
          digunakan untuk melatih model pihak ketiga, dan tidak dijual kepada siapa pun.
        </p>
      </Section>

      <Section title="4. Berbagi data">
        <p>
          Kami hanya membagikan data bila: (a) kamu secara aktif melamar sehingga profil dikirim ke
          perusahaan terkait; (b) diperlukan oleh penyedia infrastruktur yang terikat perjanjian
          kerahasiaan; atau (c) diwajibkan oleh hukum yang berlaku.
        </p>
      </Section>

      <Section title="5. Integrasi opsional">
        <p>
          Fitur seperti koneksi Gmail atau ekstensi browser hanya aktif setelah kamu memberi izin
          eksplisit, dan dapat dicabut kapan saja dari halaman pengaturan.
        </p>
      </Section>

      <Section title="6. Penyimpanan dan keamanan">
        <p>
          Data disimpan selama akunmu aktif. Kami menerapkan enkripsi saat transit, kontrol akses
          berbasis peran, dan pencatatan audit untuk operasi sensitif.
        </p>
      </Section>

      <Section title="7. Hak kamu">
        <ul className="ml-5 list-disc space-y-1">
          <li>mengakses dan memperbarui data profil kapan saja;</li>
          <li>meminta ekspor data yang kamu berikan;</li>
          <li>meminta penghapusan akun beserta data terkait;</li>
          <li>menarik persetujuan atas integrasi opsional.</li>
        </ul>
      </Section>

      <Section title="8. Kontak">
        <p>
          Permintaan terkait data pribadi dapat dikirim ke{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="font-medium text-[#138E5F] underline underline-offset-4"
          >
            {SITE.email}
          </a>
          . Kami akan menindaklanjuti dalam 30 hari kerja.
        </p>
      </Section>
    </>
  );
}
