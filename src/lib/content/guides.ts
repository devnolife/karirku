/**
 * Konten panduan (editorial). Statis & disengaja — bukan mock placeholder.
 * Dipindah dari src/lib/mock/data.ts agar bebas dari namespace mock.
 */

import type { UserRole } from "@/lib/roles";

export type GuideCategory =
  | "Platform"
  | "Remote"
  | "Interview"
  | "Resume"
  | "Freelance"
  | "Job board";

export type Guide = {
  slug: string;
  title: string;
  category: GuideCategory;
  summary: string;
  readMins: number;
  forRoles: UserRole[];
  externalUrl?: string;
  externalLabel?: string;
  steps: { title: string; body: string }[];
  tips?: string[];
};

export const GUIDE_CATEGORIES: GuideCategory[] = [
  "Platform",
  "Remote",
  "Interview",
  "Resume",
  "Freelance",
  "Job board",
];

export const GUIDES: Guide[] = [
  {
    slug: "daftar-upwork",
    title: "Daftar & menang di Upwork",
    category: "Platform",
    summary:
      "Bikin akun Upwork, susun profil yang dilirik klien, dan kirim proposal pertama yang menang.",
    readMins: 7,
    forRoles: ["freelancer"],
    externalUrl: "https://www.upwork.com/",
    externalLabel: "Buka Upwork",
    steps: [
      { title: "Buat akun & verifikasi", body: "Daftar pakai email aktif, pilih 'I'm a freelancer', lengkapi nama asli, dan verifikasi identitas. Akun terverifikasi lebih dipercaya klien." },
      { title: "Susun profil yang spesifik", body: "Title jelas (mis. 'React Frontend Developer'), bukan 'Web Developer' umum. Tulis overview yang fokus ke hasil untuk klien, bukan sekadar daftar skill." },
      { title: "Tetapkan rate realistis", body: "Mulai dari rate kompetitif untuk membangun review awal, lalu naikkan seiring rating. Tampilkan rentang yang masuk akal untuk pasar internasional." },
      { title: "Isi portofolio & skill test", body: "Upload 3–5 karya terbaik dengan deskripsi singkat masalah → solusi → hasil. Ambil skill test relevan untuk badge." },
      { title: "Kirim proposal yang personal", body: "Baca job post sampai habis, sebut detail spesifik, tawarkan solusi singkat di 2 kalimat pertama. Hindari template generik." },
    ],
    tips: [
      "Aktif 30–60 menit pertama setelah job diposting — proposal awal lebih dilihat.",
      "Taruh pertanyaan cerdas di akhir proposal untuk memancing balasan.",
      "Jaga Job Success Score: komunikasi cepat & jelas lebih penting dari sekadar harga murah.",
    ],
  },
  {
    slug: "optimasi-linkedin",
    title: "Optimasi LinkedIn biar dilirik recruiter",
    category: "Platform",
    summary:
      "Profil LinkedIn yang muncul di pencarian recruiter: headline, About, skill, dan aktivitas.",
    readMins: 6,
    forRoles: ["jobseeker", "freelancer"],
    externalUrl: "https://www.linkedin.com/",
    externalLabel: "Buka LinkedIn",
    steps: [
      { title: "Foto & headline yang jelas", body: "Pakai foto profesional. Headline bukan cuma jabatan — sebut value + keyword (mis. 'Frontend Engineer · React, TypeScript · Open to work')." },
      { title: "About yang bercerita", body: "3–4 paragraf: siapa kamu, keahlian inti, pencapaian terukur, dan apa yang kamu cari. Sisipkan keyword role targetmu agar muncul di search." },
      { title: "Experience dengan dampak", body: "Tulis pencapaian pakai angka (mis. 'kurangi load time 40%'), bukan sekadar tanggung jawab." },
      { title: "Skill & endorsement", body: "Pilih 3 skill utama yang relevan dengan target role, minta endorsement dari rekan. Skill teratas memengaruhi pencarian recruiter." },
      { title: "Aktif & 'Open to work'", body: "Nyalakan 'Open to work' (recruiter only), posting/komentar relevan 1–2x seminggu untuk naikkan visibilitas." },
    ],
    tips: [
      "Custom URL LinkedIn (linkedin.com/in/namamu) tampak lebih rapi di CV.",
      "Keyword target role harus muncul di headline, About, dan Experience.",
    ],
  },
  {
    slug: "kerja-remote",
    title: "Dasar kerja remote (& klien luar negeri)",
    category: "Remote",
    summary:
      "Cara kerja remote sesungguhnya: tools, etiket komunikasi, beda timezone, dan menerima pembayaran luar.",
    readMins: 8,
    forRoles: ["jobseeker", "freelancer", "company"],
    steps: [
      { title: "Pahami async vs sync", body: "Kerja remote banyak yang asinkron: tidak semua harus meeting. Tulis update jelas, dokumentasikan keputusan, dan jangan menunggu balasan untuk lanjut kerja." },
      { title: "Kuasai tool standar", body: "Slack/Discord (chat), Notion/Linear (dokumen & task), Zoom/Meet (call), Git (kolaborasi kode). Familiar dengan ini mempercepat onboarding." },
      { title: "Etiket komunikasi", body: "Balas dalam waktu wajar, kabari kalau offline, tulis pesan lengkap (konteks + pertanyaan + opsi). Over-communicate lebih baik daripada hilang." },
      { title: "Atur timezone", body: "Sebut zona waktumu (WIB/GMT+7), cari jam overlap dengan tim, dan sepakati 'core hours'. Tools seperti World Time Buddy membantu." },
      { title: "Pembayaran internasional", body: "Siapkan Wise/Payoneer untuk terima USD dengan fee rendah. Pahami invoice sederhana & pajak freelance di Indonesia." },
    ],
    tips: [
      "Ruang kerja & internet stabil = profesionalisme nomor satu di remote.",
      "Rekam keputusan penting di tulisan, bukan cuma di call.",
    ],
  },
  {
    slug: "persiapan-interview",
    title: "Persiapan interview (metode STAR)",
    category: "Interview",
    summary:
      "Jenis interview, pertanyaan yang sering muncul, dan cara jawab terstruktur pakai STAR.",
    readMins: 7,
    forRoles: ["jobseeker", "freelancer"],
    steps: [
      { title: "Kenali tahap interview", body: "Umumnya: HR screening → technical → user/hiring manager → final. Tiap tahap fokus berbeda; sesuaikan persiapanmu." },
      { title: "Riset perusahaan & role", body: "Pahami produk, kompetitor, dan kenapa kamu cocok. Siapkan 2–3 pertanyaan balik yang menunjukkan ketertarikan tulus." },
      { title: "Jawab pakai STAR", body: "Situation, Task, Action, Result. Ceritakan konteks, tugasmu, aksi konkret, dan hasil terukur. Hindari jawaban mengambang." },
      { title: "Latih pertanyaan umum", body: "'Ceritakan tentang dirimu', 'kelebihan/kekurangan', 'konflik tim', 'kenapa kami'. Latih lantang, bukan cuma di kepala." },
      { title: "Technical & behavioral", body: "Untuk teknis: jelaskan proses berpikir sambil mengerjakan. Untuk behavioral: pakai contoh nyata dari pengalaman." },
    ],
    tips: [
      "Pakai fitur Latihan Interview di CraftWorks untuk simulasi tanya-jawab.",
      "Rekam dirimu menjawab — evaluasi kejelasan & durasi (idealnya 1–2 menit/jawaban).",
    ],
  },
  {
    slug: "resume-ats",
    title: "Bikin resume lolos ATS",
    category: "Resume",
    summary:
      "Format CV yang terbaca mesin ATS sekaligus enak dibaca manusia, plus optimasi keyword.",
    readMins: 6,
    forRoles: ["jobseeker", "freelancer"],
    steps: [
      { title: "Pakai format sederhana", body: "Satu kolom, font standar, tanpa tabel/grafik rumit/foto. ATS sering gagal membaca layout kreatif." },
      { title: "Sesuaikan keyword per lowongan", body: "Ambil kata kunci dari job description (skill, tools) dan masukkan secara natural ke CV-mu." },
      { title: "Tulis pencapaian terukur", body: "Format: kata kerja aksi + apa + hasil/angka (mis. 'Membangun fitur X yang menaikkan retensi 12%')." },
      { title: "Bagian wajib & urut", body: "Kontak → ringkasan → pengalaman → skill → pendidikan. Simpan sebagai PDF (kecuali diminta .docx)." },
      { title: "Cek skor ATS", body: "Bandingkan CV vs job description, pastikan keyword penting tercakup tanpa keyword stuffing." },
    ],
    tips: [
      "Nama file rapi: CV_Nama_Role.pdf.",
      "Hindari header/footer untuk info penting — sebagian ATS mengabaikannya.",
    ],
  },
  {
    slug: "proposal-rate-freelance",
    title: "Nulis proposal & hitung rate freelance",
    category: "Freelance",
    summary:
      "Struktur proposal yang dibalas klien dan cara menentukan rate yang adil untuk skill kamu.",
    readMins: 6,
    forRoles: ["freelancer"],
    steps: [
      { title: "Buka dengan solusi, bukan salam", body: "Dua kalimat pertama langsung tunjukkan kamu paham masalah klien dan punya solusinya." },
      { title: "Tunjukkan bukti relevan", body: "Lampirkan 1–2 contoh karya yang paling mirip dengan kebutuhan klien, bukan semua portofolio." },
      { title: "Perjelas scope & timeline", body: "Sebut deliverable, estimasi waktu, dan asumsi. Mengurangi revisi tak berujung di kemudian hari." },
      { title: "Hitung rate", body: "Hitung target penghasilan bulanan ÷ jam kerja produktif, tambahkan buffer untuk pajak/tool/revisi. Bandingkan dengan rate pasar." },
      { title: "Tutup dengan ajakan jelas", body: "Akhiri dengan pertanyaan/CTA: 'Boleh saya kirim rencana ringkas?' untuk memancing balasan." },
    ],
    tips: [
      "Fixed price untuk scope jelas; hourly untuk kerja yang ruang lingkupnya berubah.",
      "Jangan jadi yang termurah — jadi yang paling meyakinkan.",
    ],
  },
  {
    slug: "job-board-lokal",
    title: "Daftar di job board lokal Indonesia",
    category: "Job board",
    summary:
      "Glints, Jobstreet, dan Kalibrr: cara daftar, bedanya, dan strategi melamar yang efektif.",
    readMins: 5,
    forRoles: ["jobseeker"],
    externalUrl: "https://glints.com/id",
    externalLabel: "Buka Glints",
    steps: [
      { title: "Glints — startup & tech", body: "Banyak lowongan startup/tech, ada fitur chat langsung dengan recruiter. Lengkapi profil & skill agar muncul di rekomendasi." },
      { title: "Jobstreet — korporat & umum", body: "Cakupan luas lintas industri. Pakai profil + resume Jobstreet dan aktifkan job alert sesuai role." },
      { title: "Kalibrr — kurasi & profil kuat", body: "Fokus pada profil terstruktur. Isi pengalaman & skill selengkap mungkin untuk lolos filter." },
      { title: "Strategi melamar", body: "Sesuaikan CV per lowongan, lamar yang match ≥70%, dan follow up sopan setelah 1 minggu bila relevan." },
    ],
    tips: [
      "Pasang satu CV utama yang kuat, lalu tweak keyword per lowongan.",
      "Aktifkan notifikasi agar bisa melamar di hari pertama posting.",
    ],
  },
];

/* =====================================================================
   LATIHAN INTERVIEW — bank soal statis (mode demo).
   ===================================================================== */
