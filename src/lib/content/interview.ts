/**
 * Bank soal latihan interview (editorial, statis). Bukan mock placeholder.
 */

export type InterviewTrack = "frontend" | "backend" | "design" | "umum";

export const INTERVIEW_TRACKS: { key: InterviewTrack; label: string }[] = [
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
  { key: "design", label: "Product Design" },
  { key: "umum", label: "Umum / HR" },
];

export type InterviewQuestion = {
  question: string;
  category: "Behavioral" | "Technical" | "HR";
  hint: string;
  sample: string;
};

export const INTERVIEW_QUESTIONS: Record<InterviewTrack, InterviewQuestion[]> = {
  frontend: [
    { question: "Jelaskan perbedaan controlled vs uncontrolled component di React.", category: "Technical", hint: "Hubungkan dengan sumber kebenaran state (React state vs DOM).", sample: "Controlled: nilai input dikendalikan React state lewat value+onChange, jadi React satu-satunya sumber kebenaran. Uncontrolled: DOM yang menyimpan nilai, diakses via ref. Controlled lebih mudah divalidasi & disinkronkan." },
    { question: "Bagaimana kamu mengoptimalkan performa render aplikasi React?", category: "Technical", hint: "Sebut memoization, code splitting, dan menghindari re-render tak perlu.", sample: "Saya identifikasi re-render lewat profiler, pakai React.memo/useMemo/useCallback untuk bagian berat, lakukan code splitting dengan lazy/Suspense, dan virtualisasi list panjang. Result: TTI turun signifikan." },
    { question: "Ceritakan saat kamu memperbaiki bug UI yang sulit.", category: "Behavioral", hint: "Pakai STAR: konteks, tugas, aksi, hasil.", sample: "Situation: layout rusak di Safari saja. Task: temukan akar masalah. Action: reproduksi, isolasi ke flexbox gap, ganti dengan fallback margin. Result: konsisten lintas browser, 0 laporan ulang." },
  ],
  backend: [
    { question: "Kapan pakai SQL vs NoSQL?", category: "Technical", hint: "Pertimbangkan struktur data, relasi, dan skala.", sample: "SQL untuk data relasional dengan konsistensi kuat & query kompleks. NoSQL untuk skema fleksibel, throughput tinggi, atau data dokumen. Saya pilih berdasarkan pola akses, bukan tren." },
    { question: "Bagaimana kamu mengamankan REST API?", category: "Technical", hint: "Auth, validasi, rate limit, dan least privilege.", sample: "Autentikasi (JWT/OAuth), otorisasi per-resource, validasi input, rate limiting, HTTPS, dan prinsip least privilege di DB. Plus logging untuk audit." },
    { question: "Ceritakan saat kamu menangani insiden production.", category: "Behavioral", hint: "Fokus ke proses & komunikasi, bukan menyalahkan.", sample: "Situation: error rate naik tiba-tiba. Action: rollback cepat, komunikasi ke tim, lalu root cause via log. Result: downtime <10 menit, ditambah postmortem & alert baru." },
  ],
  design: [
    { question: "Bagaimana proses desainmu dari brief ke solusi?", category: "Behavioral", hint: "Riset → ide → prototipe → validasi.", sample: "Saya mulai dari memahami masalah & user, riset cepat, sketsa beberapa arah, prototipe, lalu uji ke user dan iterasi berdasarkan temuan." },
    { question: "Bagaimana kamu menjaga konsistensi di banyak layar?", category: "Technical", hint: "Design system, token, komponen.", sample: "Saya bangun design system: token warna/spacing/tipografi dan komponen reusable. Ini mempercepat desain & menjaga konsistensi tim." },
    { question: "Ceritakan saat keputusan desainmu ditolak stakeholder.", category: "Behavioral", hint: "Tunjukkan empati & data.", sample: "Saya dengarkan kekhawatiran mereka, bawa data uji & metrik, tawarkan A/B test. Result: keputusan berbasis bukti, hubungan tim tetap sehat." },
  ],
  umum: [
    { question: "Ceritakan tentang dirimu.", category: "HR", hint: "Ringkas: sekarang, pengalaman relevan, dan yang kamu cari.", sample: "Saya [role] dengan fokus [keahlian]. Di pengalaman terakhir saya [pencapaian terukur]. Saya sedang mencari peran yang [alasan cocok dengan posisi ini]." },
    { question: "Apa kelebihan dan kekuranganmu?", category: "HR", hint: "Kekurangan harus jujur + cara kamu memperbaikinya.", sample: "Kelebihan: detail & komunikatif. Kekurangan: dulu sulit mendelegasikan; saya perbaiki dengan membangun trust dan checklist agar bisa lepas kendali." },
    { question: "Kenapa kamu ingin bekerja di sini?", category: "HR", hint: "Sambungkan misi perusahaan dengan tujuanmu.", sample: "Saya tertarik karena [produk/misi spesifik], dan keahlian saya di [skill] bisa langsung berkontribusi ke [tujuan tim]." },
  ],
};

