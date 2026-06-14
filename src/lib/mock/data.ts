/**
 * Mock fixtures untuk mode UI/UX-first.
 * Tidak ada database / API call — semua data statis di sini.
 */

export type SkillTone = "rose" | "amber" | "emerald" | "sky" | "violet";

/** Selaras dengan enum UserRole di prisma/schema.prisma. */
export type UserRole = "jobseeker" | "freelancer" | "company" | "admin";

export type MockUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
};

export const ROLE_LABEL: Record<UserRole, string> = {
  jobseeker: "Jobseeker",
  freelancer: "Freelancer",
  company: "Company",
  admin: "Admin",
};

export type MockGoal = {
  targetRole: string;
  targetTrack: "fulltime" | "freelance" | "both";
  targetCity: string | null;
  weeklyHours: number;
  budgetIdr: number;
};

export type MockSkill = {
  name: string;
  category: "core" | "nice-to-have" | "soft";
  current: number; // 0-100
  required: number; // 0-100
  tone: SkillTone;
};

export type MockMilestone = {
  week: number;
  title: string;
  status: "done" | "in_progress" | "upcoming";
  courses: { title: string; provider: string; hours: number }[];
};

export type MockJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  posted: string;
  matchPct: number;
  skills: string[];
};

export type MockCourse = {
  id: string;
  title: string;
  provider: "Dicoding" | "Prakerja" | "Coursera" | "YouTube";
  level: "Beginner" | "Intermediate" | "Advanced";
  hours: number;
  priceIdr: number;
  rating: number;
  tag: string;
};

export const MOCK_USER: MockUser = {
  id: "demo-user",
  name: "Dimas Prakoso",
  email: "dimas@craft.works",
  image: null,
  role: "jobseeker",
};

/** Satu user demo per role — dipilih saat login. */
export const MOCK_USERS: Record<UserRole, MockUser> = {
  jobseeker: MOCK_USER,
  freelancer: {
    id: "demo-freelancer",
    name: "Sari Wulandari",
    email: "sari@craft.works",
    image: null,
    role: "freelancer",
  },
  company: {
    id: "demo-company",
    name: "PT Nara Teknologi",
    email: "hr@nara.id",
    image: null,
    role: "company",
  },
  admin: {
    id: "demo-admin",
    name: "Admin CraftWorks",
    email: "admin@craft.works",
    image: null,
    role: "admin",
  },
};

export const MOCK_GOAL: MockGoal = {
  targetRole: "Frontend Engineer",
  targetTrack: "fulltime",
  targetCity: "Jakarta / Remote",
  weeklyHours: 10,
  budgetIdr: 200_000,
};

export const MOCK_SKILLS: MockSkill[] = [
  { name: "React", category: "core", current: 88, required: 90, tone: "emerald" },
  { name: "TypeScript", category: "core", current: 64, required: 85, tone: "amber" },
  { name: "Testing (Jest/RTL)", category: "core", current: 32, required: 70, tone: "rose" },
  { name: "Next.js", category: "core", current: 72, required: 80, tone: "sky" },
  { name: "CSS / Tailwind", category: "core", current: 80, required: 80, tone: "emerald" },
  { name: "System Design (FE)", category: "nice-to-have", current: 40, required: 65, tone: "amber" },
  { name: "Accessibility (a11y)", category: "nice-to-have", current: 35, required: 60, tone: "rose" },
  { name: "Komunikasi", category: "soft", current: 75, required: 75, tone: "violet" },
];

export const MOCK_MILESTONES: MockMilestone[] = [
  {
    week: 1,
    title: "Fondasi Testing dengan Jest",
    status: "done",
    courses: [{ title: "Belajar Fundamental Testing", provider: "Dicoding", hours: 8 }],
  },
  {
    week: 2,
    title: "React Testing Library hands-on",
    status: "done",
    courses: [{ title: "Testing React Components", provider: "Coursera", hours: 6 }],
  },
  {
    week: 3,
    title: "TypeScript generics & utility types",
    status: "in_progress",
    courses: [{ title: "TypeScript Lanjutan", provider: "Dicoding", hours: 10 }],
  },
  {
    week: 4,
    title: "Mini project: Todo app + tests",
    status: "upcoming",
    courses: [],
  },
  {
    week: 5,
    title: "Accessibility fundamentals",
    status: "upcoming",
    courses: [{ title: "Web Accessibility", provider: "Coursera", hours: 5 }],
  },
  {
    week: 6,
    title: "Mock interview & resume review",
    status: "upcoming",
    courses: [],
  },
];

export const MOCK_JOBS: MockJob[] = [
  {
    id: "j1",
    title: "Frontend Engineer",
    company: "Tokopedia",
    location: "Jakarta · Hybrid",
    salary: "Rp 14–20 jt",
    posted: "2 hari lalu",
    matchPct: 82,
    skills: ["React", "TypeScript", "Next.js"],
  },
  {
    id: "j2",
    title: "React Developer",
    company: "Xendit",
    location: "Remote (SEA)",
    salary: "Rp 18–25 jt",
    posted: "4 hari lalu",
    matchPct: 74,
    skills: ["React", "Testing", "TypeScript"],
  },
  {
    id: "j3",
    title: "Frontend Engineer (Mid)",
    company: "Ruangguru",
    location: "Jakarta · Onsite",
    salary: "Rp 12–18 jt",
    posted: "1 minggu lalu",
    matchPct: 68,
    skills: ["React", "Tailwind", "Testing"],
  },
  {
    id: "j4",
    title: "Web Engineer",
    company: "Gojek",
    location: "Jakarta · Hybrid",
    salary: "Rp 15–22 jt",
    posted: "3 hari lalu",
    matchPct: 71,
    skills: ["React", "Next.js", "a11y"],
  },
];

export const MOCK_COURSES: MockCourse[] = [
  {
    id: "c1",
    title: "Belajar Fundamental Aplikasi Web dengan React",
    provider: "Dicoding",
    level: "Intermediate",
    hours: 40,
    priceIdr: 0,
    rating: 4.8,
    tag: "Bersertifikat",
  },
  {
    id: "c2",
    title: "Testing React Applications",
    provider: "Coursera",
    level: "Intermediate",
    hours: 18,
    priceIdr: 0,
    rating: 4.6,
    tag: "Audit gratis",
  },
  {
    id: "c3",
    title: "TypeScript Deep Dive",
    provider: "Dicoding",
    level: "Advanced",
    hours: 32,
    priceIdr: 150_000,
    rating: 4.7,
    tag: "Prakerja eligible",
  },
  {
    id: "c4",
    title: "Web Accessibility",
    provider: "Coursera",
    level: "Beginner",
    hours: 12,
    priceIdr: 0,
    rating: 4.5,
    tag: "Audit gratis",
  },
];

export const MOCK_READINESS = {
  score: 72,
  lastWeek: 66,
  weeksTotal: 6,
  weeksDone: 2,
  hoursThisWeek: 6.5,
  hoursTarget: 10,
};

export const MOCK_MARKET_TREND = [
  { label: "Mar", value: 42 },
  { label: "Apr", value: 55 },
  { label: "May", value: 48 },
  { label: "Jun", value: 64 },
  { label: "Jul", value: 70 },
  { label: "Aug", value: 66 },
  { label: "Sep", value: 78 },
  { label: "Oct", value: 85 },
];

export const MOCK_ACTIVITY = [
  { time: "Hari ini · 09:12", text: "Menyelesaikan kuis Jest Fundamentals (skor 88)." },
  { time: "Kemarin · 21:30", text: "Menambah sertifikat Dicoding — React Testing." },
  { time: "2 hari lalu", text: "AI update gap analysis: Testing naik prioritas ke High." },
  { time: "3 hari lalu", text: "Apply: Frontend Engineer @ Tokopedia." },
  { time: "1 minggu lalu", text: "Set target role: Frontend Engineer." },
];

/* =====================================================================
   ADMIN FIXTURES — semua data ilustratif (mock), tidak ada DB.
   ===================================================================== */

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "suspended" | "pending";
  joined: string;
  plan: "Free" | "Pro" | "Freelancer" | "Startup";
};

export const MOCK_ADMIN_USERS: AdminUser[] = [
  { id: "u1", name: "Dimas Prakoso", email: "dimas@craft.works", role: "jobseeker", status: "active", joined: "12 Mei 2026", plan: "Pro" },
  { id: "u2", name: "Sari Wulandari", email: "sari@craft.works", role: "freelancer", status: "active", joined: "3 Mei 2026", plan: "Freelancer" },
  { id: "u3", name: "PT Nara Teknologi", email: "hr@nara.id", role: "company", status: "active", joined: "28 Apr 2026", plan: "Startup" },
  { id: "u4", name: "Rizky Hidayat", email: "rizky@gmail.com", role: "jobseeker", status: "pending", joined: "1 Jun 2026", plan: "Free" },
  { id: "u5", name: "Maya Anjani", email: "maya@gmail.com", role: "jobseeker", status: "active", joined: "20 Apr 2026", plan: "Free" },
  { id: "u6", name: "Budi Santoso", email: "budi@freelance.id", role: "freelancer", status: "suspended", joined: "15 Mar 2026", plan: "Free" },
  { id: "u7", name: "CV Sinar Abadi", email: "admin@sinarabadi.co.id", role: "company", status: "active", joined: "9 Apr 2026", plan: "Startup" },
  { id: "u8", name: "Putri Lestari", email: "putri@gmail.com", role: "jobseeker", status: "active", joined: "30 Mei 2026", plan: "Pro" },
];

export type AdminJob = {
  id: string;
  title: string;
  company: string;
  source: string;
  location: string;
  status: "active" | "draft" | "expired";
  applicants: number;
  posted: string;
};

export const MOCK_ADMIN_JOBS: AdminJob[] = [
  { id: "aj1", title: "Frontend Engineer", company: "Tokopedia", source: "jobstreet", location: "Jakarta", status: "active", applicants: 142, posted: "2 hari lalu" },
  { id: "aj2", title: "React Developer", company: "Xendit", source: "kalibrr", location: "Remote", status: "active", applicants: 88, posted: "4 hari lalu" },
  { id: "aj3", title: "Data Engineer", company: "Gojek", source: "glints", location: "Jakarta", status: "active", applicants: 203, posted: "1 hari lalu" },
  { id: "aj4", title: "UI/UX Designer", company: "Ruangguru", source: "manual", location: "Bandung", status: "draft", applicants: 0, posted: "—" },
  { id: "aj5", title: "Backend Engineer (Go)", company: "Bukalapak", source: "jobstreet", location: "Jakarta", status: "expired", applicants: 67, posted: "3 minggu lalu" },
  { id: "aj6", title: "Mobile Engineer", company: "Dana", source: "kalibrr", location: "Jakarta", status: "active", applicants: 51, posted: "5 hari lalu" },
];

export type AdminCourse = {
  id: string;
  title: string;
  provider: string;
  source: string;
  isPrakerja: boolean;
  priceIdr: number;
  enrollment: number;
  status: "indexed" | "review";
};

export const MOCK_ADMIN_COURSES: AdminCourse[] = [
  { id: "ac1", title: "Belajar Fundamental Aplikasi Web dengan React", provider: "Dicoding", source: "dicoding", isPrakerja: true, priceIdr: 0, enrollment: 12400, status: "indexed" },
  { id: "ac2", title: "Testing React Applications", provider: "Coursera", source: "coursera", isPrakerja: false, priceIdr: 0, enrollment: 3200, status: "indexed" },
  { id: "ac3", title: "TypeScript Deep Dive", provider: "Dicoding", source: "dicoding", isPrakerja: true, priceIdr: 150_000, enrollment: 5800, status: "indexed" },
  { id: "ac4", title: "Web Accessibility Fundamentals", provider: "Coursera", source: "coursera", isPrakerja: false, priceIdr: 0, enrollment: 1100, status: "review" },
  { id: "ac5", title: "Dasar Pemrograman untuk Pemula", provider: "Kelas Terbuka", source: "youtube", isPrakerja: false, priceIdr: 0, enrollment: 45000, status: "indexed" },
];

export type ScraperRun = {
  id: string;
  source: string;
  type: "jobs" | "courses";
  status: "success" | "running" | "failed";
  items: number;
  duration: string;
  finishedAt: string;
};

export const MOCK_SCRAPER_RUNS: ScraperRun[] = [
  { id: "r1", source: "Jobstreet", type: "jobs", status: "success", items: 1240, duration: "4m 12s", finishedAt: "Hari ini · 06:04" },
  { id: "r2", source: "Kalibrr", type: "jobs", status: "success", items: 860, duration: "3m 02s", finishedAt: "Hari ini · 06:09" },
  { id: "r3", source: "Glints", type: "jobs", status: "running", items: 412, duration: "—", finishedAt: "berjalan…" },
  { id: "r4", source: "Dicoding", type: "courses", status: "success", items: 320, duration: "1m 48s", finishedAt: "Hari ini · 02:10" },
  { id: "r5", source: "Prakerja", type: "courses", status: "failed", items: 0, duration: "0m 14s", finishedAt: "Hari ini · 02:12" },
  { id: "r6", source: "YouTube Edu", type: "courses", status: "success", items: 156, duration: "2m 30s", finishedAt: "Kemarin · 23:40" },
];

export const MOCK_QUEUE_STATS = {
  waiting: 38,
  active: 5,
  completed: 4821,
  failed: 12,
};

export const MOCK_PLATFORM_STATS = {
  totalUsers: 5842,
  newUsersWeek: 318,
  activeJobs: 2410,
  indexedCourses: 1180,
  proSubscribers: 214,
  mrrIdr: 21_186_000,
};

export const MOCK_PLATFORM_TREND = [
  { label: "Apr", value: 3200 },
  { label: "Mei", value: 4100 },
  { label: "Jun", value: 5842 },
];

export const MOCK_ROLE_BREAKDOWN: { role: UserRole; count: number }[] = [
  { role: "jobseeker", count: 4210 },
  { role: "freelancer", count: 980 },
  { role: "company", count: 642 },
  { role: "admin", count: 10 },
];

/* =====================================================================
   FREELANCER FIXTURES — data ilustratif (mock).
   ===================================================================== */

export const MOCK_FREELANCER = {
  rating: 4.9,
  reviews: 38,
  completedProjects: 42,
  earningsIdr: 86_500_000,
  responseRate: 96,
  readiness: 81,
  hourlyRateIdr: 250_000,
};

export type FreelanceProject = {
  id: string;
  title: string;
  client: string;
  budget: string;
  duration: string;
  posted: string;
  matchPct: number;
  skills: string[];
  type: "Fixed" | "Hourly";
};

export const MOCK_PROJECTS: FreelanceProject[] = [
  { id: "p1", title: "Landing page React + animasi", client: "Kopi Kenangan", budget: "Rp 8–12 jt", duration: "3 minggu", posted: "1 hari lalu", matchPct: 92, skills: ["React", "Tailwind", "GSAP"], type: "Fixed" },
  { id: "p2", title: "Dashboard admin Next.js", client: "Eduka", budget: "Rp 15–22 jt", duration: "6 minggu", posted: "2 hari lalu", matchPct: 84, skills: ["Next.js", "TypeScript", "Chart"], type: "Fixed" },
  { id: "p3", title: "Maintenance web app (hourly)", client: "Nara Tech", budget: "Rp 300k/jam", duration: "Ongoing", posted: "3 hari lalu", matchPct: 78, skills: ["React", "Node", "Bugfix"], type: "Hourly" },
  { id: "p4", title: "Komponen UI library", client: "Pinjam Modal", budget: "Rp 10–14 jt", duration: "4 minggu", posted: "5 hari lalu", matchPct: 71, skills: ["React", "Storybook", "a11y"], type: "Fixed" },
];

export type Proposal = {
  id: string;
  project: string;
  client: string;
  status: "draft" | "sent" | "shortlisted" | "won";
  amount: string;
  sentAt: string;
};

export const MOCK_PROPOSALS: Proposal[] = [
  { id: "pr1", project: "Redesign company profile", client: "Sinar Abadi", status: "won", amount: "Rp 9,5 jt", sentAt: "1 minggu lalu" },
  { id: "pr2", project: "Web app POS UMKM", client: "Warung Pintar", status: "shortlisted", amount: "Rp 18 jt", sentAt: "3 hari lalu" },
  { id: "pr3", project: "Landing page event", client: "Devfest", status: "sent", amount: "Rp 6 jt", sentAt: "2 hari lalu" },
  { id: "pr4", project: "Migrasi ke Next.js", client: "Eduka", status: "draft", amount: "—", sentAt: "—" },
];

export type PortfolioItem = { title: string; category: string; tag: string };

export const MOCK_PORTFOLIO: PortfolioItem[] = [
  { title: "E-commerce headless", category: "Web App", tag: "Next.js" },
  { title: "Dashboard analitik SaaS", category: "Dashboard", tag: "React" },
  { title: "Company profile sinematik", category: "Landing", tag: "GSAP" },
];

export const MOCK_FREELANCER_ACTIVITY = [
  { time: "Hari ini · 08:40", text: "Proposal 'Web app POS UMKM' masuk shortlist." },
  { time: "Kemarin · 16:10", text: "Project 'Redesign company profile' ditandai selesai (5★)." },
  { time: "2 hari lalu", text: "AI generate proposal untuk 'Landing page event'." },
  { time: "4 hari lalu", text: "Update portofolio: tambah 'Dashboard analitik SaaS'." },
];

/* =====================================================================
   COMPANY FIXTURES — data ilustratif (mock).
   ===================================================================== */

export const MOCK_COMPANY = {
  openJobs: 4,
  totalCandidates: 128,
  interviews: 9,
  hires: 3,
  profileViews: 1840,
};

export type CompanyJob = {
  id: string;
  title: string;
  location: string;
  type: "Full-time" | "Contract" | "Internship";
  applicants: number;
  status: "active" | "draft" | "closed";
  posted: string;
};

export const MOCK_COMPANY_JOBS: CompanyJob[] = [
  { id: "cj1", title: "Frontend Engineer", location: "Jakarta · Hybrid", type: "Full-time", applicants: 64, status: "active", posted: "3 hari lalu" },
  { id: "cj2", title: "Product Designer", location: "Remote", type: "Full-time", applicants: 41, status: "active", posted: "5 hari lalu" },
  { id: "cj3", title: "Backend Engineer (Go)", location: "Jakarta · Onsite", type: "Contract", applicants: 23, status: "active", posted: "1 minggu lalu" },
  { id: "cj4", title: "QA Intern", location: "Bandung", type: "Internship", applicants: 0, status: "draft", posted: "—" },
];

export type CandidateStage = "applied" | "screening" | "interview" | "offer";

export type Candidate = {
  id: string;
  name: string;
  appliedFor: string;
  matchPct: number;
  stage: CandidateStage;
  skills: string[];
  applied: string;
};

export const MOCK_CANDIDATES: Candidate[] = [
  { id: "k1", name: "Andika Putra", appliedFor: "Frontend Engineer", matchPct: 91, stage: "interview", skills: ["React", "TypeScript", "Next.js"], applied: "2 hari lalu" },
  { id: "k2", name: "Rina Melati", appliedFor: "Product Designer", matchPct: 88, stage: "offer", skills: ["Figma", "UX", "Design System"], applied: "4 hari lalu" },
  { id: "k3", name: "Fajar Nugroho", appliedFor: "Frontend Engineer", matchPct: 82, stage: "screening", skills: ["React", "CSS", "Testing"], applied: "1 hari lalu" },
  { id: "k4", name: "Sinta Dewi", appliedFor: "Backend Engineer (Go)", matchPct: 79, stage: "screening", skills: ["Go", "PostgreSQL", "Docker"], applied: "3 hari lalu" },
  { id: "k5", name: "Bayu Saputra", appliedFor: "Frontend Engineer", matchPct: 74, stage: "applied", skills: ["React", "Redux"], applied: "Hari ini" },
  { id: "k6", name: "Citra Anggraini", appliedFor: "Product Designer", matchPct: 70, stage: "applied", skills: ["Figma", "Prototype"], applied: "Hari ini" },
];

export const CANDIDATE_STAGES: { key: CandidateStage; label: string }[] = [
  { key: "applied", label: "Applied" },
  { key: "screening", label: "Screening" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
];

/* =====================================================================
   GUIDES / PANDUAN — artikel statis (mode demo).
   ===================================================================== */

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

export const MOCK_GUIDES: Guide[] = [
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

export const MOCK_INTERVIEW_QUESTIONS: Record<InterviewTrack, InterviewQuestion[]> = {
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

