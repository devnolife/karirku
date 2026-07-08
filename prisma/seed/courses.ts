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

import type { PrismaClient } from "@prisma/client";

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
