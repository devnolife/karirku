/**
 * Seed kurasi course/resource belajar GRATIS — prioritas Bahasa Indonesia.
 *
 * Hanya menautkan ke halaman resmi resource (legal; tidak menyalin konten).
 * Sumber open/gratis: Dicoding (kelas gratis), freeCodeCamp (BSD/CC),
 * The Odin Project (CC), MDN (CC BY-SA), YouTube (channel edukasi ID).
 *
 * Idempotent: upsert by sourceUrl (unique). Skill names di-resolve ke
 * SkillTaxonomy IDs — jalankan SETELAH seed skill taxonomy.
 */

import type { PrismaClient } from "../../generated/prisma/index.js";

type SeedCourse = {
  source: string;
  sourceUrl: string;
  title: string;
  provider: string;
  language: "id" | "en";
  level: "beginner" | "intermediate" | "advanced";
  /** Nama skill (dicocokkan ke SkillTaxonomy via slug). */
  skills: string[];
  durationHours: number;
  description: string;
};

const COURSES: SeedCourse[] = [
  // ---- Dicoding (kelas gratis, Bahasa Indonesia) ----
  {
    source: "dicoding",
    sourceUrl: "https://www.dicoding.com/academies/315",
    title: "Belajar Dasar Pemrograman Web",
    provider: "Dicoding",
    language: "id",
    level: "beginner",
    skills: ["HTML", "CSS", "JavaScript"],
    durationHours: 41,
    description:
      "Fondasi HTML, CSS, dan JavaScript dari nol. Kelas gratis berbahasa Indonesia dengan submission yang direview.",
  },
  {
    source: "dicoding",
    sourceUrl: "https://www.dicoding.com/academies/256",
    title: "Belajar Dasar Pemrograman JavaScript",
    provider: "Dicoding",
    language: "id",
    level: "beginner",
    skills: ["JavaScript", "Node.js"],
    durationHours: 45,
    description:
      "Sintaks modern ES6+, async/await, module, dan testing dasar — bekal wajib sebelum framework.",
  },
  {
    source: "dicoding",
    sourceUrl: "https://www.dicoding.com/academies/86",
    title: "Memulai Pemrograman dengan Python",
    provider: "Dicoding",
    language: "id",
    level: "beginner",
    skills: ["Python"],
    durationHours: 30,
    description:
      "Dasar Python: struktur data, OOP, sampai unit test. Cocok untuk jalur data & backend.",
  },
  {
    source: "dicoding",
    sourceUrl: "https://www.dicoding.com/academies/342",
    title: "Belajar Membuat Front-End Web untuk Pemula",
    provider: "Dicoding",
    language: "id",
    level: "intermediate",
    skills: ["HTML", "CSS", "JavaScript"],
    durationHours: 40,
    description:
      "DOM manipulation, event, dan Web Storage — jembatan dari dasar web ke framework seperti React.",
  },
  {
    source: "dicoding",
    sourceUrl: "https://www.dicoding.com/academies/261",
    title: "Belajar Membuat Aplikasi Back-End untuk Pemula",
    provider: "Dicoding",
    language: "id",
    level: "intermediate",
    skills: ["Node.js", "Express.js"],
    durationHours: 45,
    description:
      "Bangun RESTful API dengan Node.js: routing, data storage, dan deploy dasar.",
  },
  {
    source: "dicoding",
    sourceUrl: "https://www.dicoding.com/academies/428",
    title: "Belajar Dasar Git dengan GitHub",
    provider: "Dicoding",
    language: "id",
    level: "beginner",
    skills: ["Git"],
    durationHours: 15,
    description:
      "Version control untuk kolaborasi: commit, branch, merge, dan pull request di GitHub.",
  },
  {
    source: "dicoding",
    sourceUrl: "https://www.dicoding.com/academies/653",
    title: "Belajar Dasar Structured Query Language (SQL)",
    provider: "Dicoding",
    language: "id",
    level: "beginner",
    skills: ["SQL"],
    durationHours: 10,
    description:
      "Query dasar sampai JOIN dan agregasi — skill yang diminta hampir semua role data & backend.",
  },
  {
    source: "dicoding",
    sourceUrl: "https://www.dicoding.com/academies/403",
    title: "Belajar Membuat Aplikasi Web dengan React",
    provider: "Dicoding",
    language: "id",
    level: "intermediate",
    skills: ["React", "JavaScript"],
    durationHours: 40,
    description:
      "Komponen, props, state, dan controlled component — kelas React berbahasa Indonesia.",
  },

  // ---- YouTube edukasi Bahasa Indonesia (gratis) ----
  {
    source: "youtube",
    sourceUrl: "https://www.youtube.com/playlist?list=PLFIM0718LjIWXagluzROrA-iBY9eeUt4w",
    title: "Playlist Belajar JavaScript Lanjutan (ES6+)",
    provider: "Web Programming UNPAS",
    language: "id",
    level: "intermediate",
    skills: ["JavaScript"],
    durationHours: 12,
    description:
      "Seri video Bahasa Indonesia: closure, prototype, async, dan fitur modern JavaScript.",
  },
  {
    source: "youtube",
    sourceUrl: "https://www.youtube.com/playlist?list=PLFIM0718LjIVCmrSWbZPKCccCkfFw-Naa",
    title: "Playlist Belajar CSS Layouting (Flexbox & Grid)",
    provider: "Web Programming UNPAS",
    language: "id",
    level: "beginner",
    skills: ["CSS", "HTML"],
    durationHours: 8,
    description:
      "Flexbox dan CSS Grid dijelaskan step-by-step dalam Bahasa Indonesia.",
  },
  {
    source: "youtube",
    sourceUrl: "https://www.youtube.com/playlist?list=PL-CtdCApEFH-A7jBmdertzbeACuQWvQao",
    title: "Playlist Belajar Docker untuk Pemula",
    provider: "Programmer Zaman Now",
    language: "id",
    level: "beginner",
    skills: ["Docker"],
    durationHours: 6,
    description:
      "Konsep container, image, volume, dan docker-compose dalam Bahasa Indonesia.",
  },

  // ---- freeCodeCamp (gratis, open curriculum) ----
  {
    source: "freecodecamp",
    sourceUrl: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
    title: "Responsive Web Design Certification",
    provider: "freeCodeCamp",
    language: "en",
    level: "beginner",
    skills: ["HTML", "CSS"],
    durationHours: 60,
    description:
      "Kurikulum interaktif gratis + sertifikat: HTML semantik, CSS, Flexbox, Grid, dan accessibility.",
  },
  {
    source: "freecodecamp",
    sourceUrl: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/",
    title: "JavaScript Algorithms and Data Structures",
    provider: "freeCodeCamp",
    language: "en",
    level: "intermediate",
    skills: ["JavaScript"],
    durationHours: 80,
    description:
      "Algoritma, struktur data, dan problem solving dengan JavaScript — bagus untuk persiapan technical test.",
  },
  {
    source: "freecodecamp",
    sourceUrl: "https://www.freecodecamp.org/learn/front-end-development-libraries/",
    title: "Front End Development Libraries",
    provider: "freeCodeCamp",
    language: "en",
    level: "intermediate",
    skills: ["React", "Sass"],
    durationHours: 70,
    description:
      "React, Redux, dan Sass lewat project bersertifikat — gratis penuh.",
  },

  // ---- The Odin Project (open source curriculum) ----
  {
    source: "theodinproject",
    sourceUrl: "https://www.theodinproject.com/paths/foundations",
    title: "The Odin Project — Foundations",
    provider: "The Odin Project",
    language: "en",
    level: "beginner",
    skills: ["HTML", "CSS", "JavaScript", "Git"],
    durationHours: 100,
    description:
      "Kurikulum open-source full-stack: dari cara kerja web, Git, sampai project JavaScript pertama.",
  },
  {
    source: "theodinproject",
    sourceUrl: "https://www.theodinproject.com/paths/full-stack-javascript",
    title: "The Odin Project — Full Stack JavaScript",
    provider: "The Odin Project",
    language: "en",
    level: "advanced",
    skills: ["JavaScript", "React", "Node.js", "Express.js", "PostgreSQL"],
    durationHours: 200,
    description:
      "Jalur lengkap React + Node.js + database dengan project portfolio nyata di tiap bagian.",
  },

  // ---- MDN (dokumentasi resmi, CC BY-SA) ----
  {
    source: "mdn",
    sourceUrl: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
    title: "MDN Learn Web Development",
    provider: "MDN Web Docs",
    language: "en",
    level: "beginner",
    skills: ["HTML", "CSS", "JavaScript"],
    durationHours: 50,
    description:
      "Modul belajar resmi Mozilla — referensi paling akurat untuk fundamental web.",
  },

  // ================= NON-IT: Marketing =================
  {
    source: "google-skillshop",
    sourceUrl: "https://skillshop.docebosaas.com/learn/public/learning-plan/view/163/google-ads-search-professional-certificate",
    title: "Google Ads Search Certification",
    provider: "Google Skillshop",
    language: "id",
    level: "beginner",
    skills: ["Google Ads", "SEM"],
    durationHours: 8,
    description:
      "Sertifikasi resmi Google untuk iklan Search — gratis, tersedia Bahasa Indonesia, diakui industri.",
  },
  {
    source: "google",
    sourceUrl: "https://analytics.google.com/analytics/academy/",
    title: "Google Analytics Certification (GA4)",
    provider: "Google Skillshop",
    language: "en",
    level: "beginner",
    skills: ["Google Analytics", "Data Analysis"],
    durationHours: 10,
    description:
      "Kuasai GA4 dari sumber resminya — skill wajib untuk digital marketing dan data analyst pemula.",
  },
  {
    source: "hubspot",
    sourceUrl: "https://academy.hubspot.com/courses/content-marketing",
    title: "Content Marketing Certification",
    provider: "HubSpot Academy",
    language: "en",
    level: "beginner",
    skills: ["Content Marketing", "Copywriting", "SEO"],
    durationHours: 7,
    description:
      "Strategi konten end-to-end + sertifikat gratis dari HubSpot — bagus untuk CV digital marketing.",
  },
  {
    source: "hubspot",
    sourceUrl: "https://academy.hubspot.com/courses/digital-marketing",
    title: "Digital Marketing Certification",
    provider: "HubSpot Academy",
    language: "en",
    level: "beginner",
    skills: ["Content Marketing", "Email Marketing", "Social Media Marketing"],
    durationHours: 6,
    description:
      "Fondasi digital marketing menyeluruh: paid ads, email, sosmed, dan funnel — gratis bersertifikat.",
  },
  {
    source: "meta",
    sourceUrl: "https://www.facebook.com/business/learn",
    title: "Meta Blueprint — Dasar Iklan Facebook & Instagram",
    provider: "Meta Blueprint",
    language: "id",
    level: "beginner",
    skills: ["Meta Ads", "Social Media Marketing"],
    durationHours: 6,
    description:
      "Kelas resmi Meta (tersedia Bahasa Indonesia) untuk beriklan di Facebook & Instagram.",
  },

  // ================= NON-IT: Desain & Kreatif =================
  {
    source: "figma",
    sourceUrl: "https://help.figma.com/hc/en-us/sections/30880632542743-Figma-Design-for-beginners",
    title: "Figma Design for Beginners",
    provider: "Figma Learn",
    language: "en",
    level: "beginner",
    skills: ["Figma", "UI Design", "Prototyping"],
    durationHours: 5,
    description:
      "Kurikulum resmi Figma: dari canvas pertama sampai prototype interaktif — gratis penuh.",
  },
  {
    source: "google",
    sourceUrl: "https://www.coursera.org/professional-certificates/google-ux-design",
    title: "Google UX Design Professional Certificate",
    provider: "Coursera (Google)",
    language: "en",
    level: "beginner",
    skills: ["UX Design", "UX Research", "Figma", "Prototyping"],
    durationHours: 150,
    description:
      "Jalur karir UX lengkap dari Google — bisa diaudit gratis, financial aid tersedia.",
  },
  {
    source: "canva",
    sourceUrl: "https://www.canva.com/designschool/courses/",
    title: "Canva Design School",
    provider: "Canva",
    language: "en",
    level: "beginner",
    skills: ["Canva", "UI Design"],
    durationHours: 4,
    description:
      "Dasar desain grafis praktis untuk konten sosmed & presentasi — cocok untuk non-desainer.",
  },
  {
    source: "youtube",
    sourceUrl: "https://www.youtube.com/playlist?list=PLYJx6vLZBLPTGGpteQPBcjLXals4l-2rP",
    title: "Playlist Belajar Video Editing CapCut & Premiere",
    provider: "YouTube (kreator ID)",
    language: "id",
    level: "beginner",
    skills: ["Video Editing", "CapCut", "Adobe Premiere"],
    durationHours: 6,
    description:
      "Tutorial editing video berbahasa Indonesia untuk konten kreator pemula.",
  },

  // ================= NON-IT: Bisnis, Data & Office =================
  {
    source: "microsoft",
    sourceUrl: "https://learn.microsoft.com/id-id/training/paths/get-started-data-analytics/",
    title: "Memulai Analitik Data dengan Power BI",
    provider: "Microsoft Learn",
    language: "id",
    level: "beginner",
    skills: ["Power BI", "Data Analysis"],
    durationHours: 6,
    description:
      "Learning path resmi Microsoft (Bahasa Indonesia) untuk analisis data & visualisasi Power BI.",
  },
  {
    source: "freecodecamp",
    sourceUrl: "https://www.freecodecamp.org/learn/data-analysis-with-python/",
    title: "Data Analysis with Python Certification",
    provider: "freeCodeCamp",
    language: "en",
    level: "intermediate",
    skills: ["Data Analysis", "Python", "Pandas"],
    durationHours: 60,
    description:
      "Jembatan dari Excel ke analisis data modern — gratis + sertifikat, cocok lintas jurusan.",
  },
  {
    source: "youtube",
    sourceUrl: "https://www.youtube.com/playlist?list=PL5PjholuMuy1tGDMWLYd6h6z9U4zxzsQE",
    title: "Playlist Belajar Microsoft Excel dari Nol",
    provider: "YouTube (kreator ID)",
    language: "id",
    level: "beginner",
    skills: ["Microsoft Excel", "Data Entry"],
    durationHours: 8,
    description:
      "Excel dasar sampai pivot table & vlookup dalam Bahasa Indonesia — skill wajib admin/finance.",
  },
  {
    source: "hubspot",
    sourceUrl: "https://academy.hubspot.com/courses/inbound-sales",
    title: "Inbound Sales Certification",
    provider: "HubSpot Academy",
    language: "en",
    level: "beginner",
    skills: ["Sales", "CRM", "Negosiasi"],
    durationHours: 3,
    description:
      "Teknik menjual modern berbasis kebutuhan buyer — gratis bersertifikat untuk karir sales/BD.",
  },
  {
    source: "prakerja",
    sourceUrl: "https://www.prakerja.go.id/",
    title: "Katalog Pelatihan Prakerja (Admin, Akuntansi, HR)",
    provider: "Kartu Prakerja",
    language: "id",
    level: "beginner",
    skills: ["Administrasi Perkantoran", "Akuntansi", "Rekrutmen"],
    durationHours: 15,
    description:
      "Pelatihan bersubsidi pemerintah untuk jalur admin, akuntansi, dan HR — cek katalog resmi.",
  },
  {
    source: "youtube",
    sourceUrl: "https://www.youtube.com/playlist?list=PLXn6qeCSVEDCMDgHDwlbrNMTuoNz7Fg1n",
    title: "Playlist Dasar Akuntansi untuk Pemula",
    provider: "YouTube (kreator ID)",
    language: "id",
    level: "beginner",
    skills: ["Akuntansi", "Pembukuan"],
    durationHours: 10,
    description:
      "Siklus akuntansi, jurnal, dan laporan keuangan dijelaskan dalam Bahasa Indonesia.",
  },
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function seedCourses(prisma: PrismaClient): Promise<void> {
  console.log(`🌱 Seeding ${COURSES.length} curated free courses...`);

  // Resolve skill name -> id sekali di awal (skill taxonomy sudah di-seed).
  const slugs = [...new Set(COURSES.flatMap((c) => c.skills.map(slugify)))];
  const skillRows = await prisma.skillTaxonomy.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  });
  const idBySlug = new Map(skillRows.map((s) => [s.slug, s.id]));

  for (const c of COURSES) {
    const skillsTaught = c.skills
      .map((name) => idBySlug.get(slugify(name)))
      .filter((id): id is string => Boolean(id));

    await prisma.course.upsert({
      where: { sourceUrl: c.sourceUrl },
      create: {
        source: c.source,
        sourceUrl: c.sourceUrl,
        title: c.title,
        provider: c.provider,
        language: c.language,
        level: c.level,
        skillsTaught,
        durationHours: c.durationHours,
        priceIdr: 0,
        description: c.description,
      },
      update: {
        title: c.title,
        provider: c.provider,
        language: c.language,
        level: c.level,
        skillsTaught,
        durationHours: c.durationHours,
        priceIdr: 0,
        description: c.description,
      },
    });
  }

  const total = await prisma.course.count();
  console.log(`✅ Courses: ${total} rows`);
}
