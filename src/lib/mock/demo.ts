/**
 * Fixture DEMO MODE — dipakai saat `DATABASE_URL` kosong (tanpa Postgres).
 *
 * Bentuknya PERSIS mengikuti view-model / return type di src/server/queries/*
 * sehingga guard `if (!isProductionMode()) return DEMO_X;` cukup satu baris.
 * Saat production mode aktif, modul ini tidak dipakai sama sekali.
 */

import type { SessionUser } from "@/lib/auth";
import type { UserRole } from "@/core/roles";
import type {
  CourseView,
  JobView,
  MilestoneView,
  ReadinessView,
  SkillView,
} from "@/lib/view-models";
import type { UserGoal } from "@/server/queries/goal";
import type { UserContext } from "@/server/queries/context";
import type { SkillGap } from "@/server/queries/skills";
import type { RoadmapData } from "@/server/queries/roadmap";
import type { JobDetail } from "@/server/queries/jobs";
import type { ApplicationRow } from "@/server/queries/applications";
import type {
  OwnedSkill,
  ProfileData,
  SkillOption,
} from "@/server/queries/profile";
import type { FreelancerMeta, ProjectRow } from "@/server/queries/freelance";
import type {
  CandidateRow,
  CompanyJobRow,
  CompanyStats,
  JobOption,
  TalentMatch,
} from "@/server/queries/company";
import type {
  AdminCourseRow,
  AdminJobRow,
  AdminUserRow,
  PlatformStats,
} from "@/server/queries/admin";

/* ================================================================
   USERS & AUTH
   ================================================================ */

export const DEMO_USERS: Record<UserRole, SessionUser> = {
  jobseeker: {
    id: "demo-jobseeker",
    username: "dimas",
    name: "Dimas Prakoso",
    email: "dimas@craft.works",
    image: null,
    role: "jobseeker",
  },
  freelancer: {
    id: "demo-freelancer",
    username: "sari",
    name: "Sari Wulandari",
    email: "sari@craft.works",
    image: null,
    role: "freelancer",
  },
  company: {
    id: "demo-company",
    username: "nara",
    name: "PT Nara Teknologi",
    email: "hr@nara.id",
    image: null,
    role: "company",
  },
  admin: {
    id: "demo-admin",
    username: "admin",
    name: "Admin CraftWorks",
    email: "admin@craft.works",
    image: null,
    role: "admin",
  },
};

/* ================================================================
   GOAL & KONTEKS JOBSEEKER
   ================================================================ */

export const DEMO_GOAL: UserGoal = {
  id: "demo-goal",
  targetRole: "Frontend Engineer",
  targetTrack: "fulltime",
  targetCity: "Jakarta",
  weeklyHours: 10,
  budgetIdr: 200_000,
  readinessScore: 72,
};

const DEMO_SKILL_ITEMS = [
  { id: "sk-react", name: "React", proficiency: 4, verified: true },
  { id: "sk-ts", name: "TypeScript", proficiency: 3, verified: false },
  { id: "sk-next", name: "Next.js", proficiency: 4, verified: true },
  { id: "sk-tailwind", name: "Tailwind CSS", proficiency: 4, verified: false },
  { id: "sk-jest", name: "Jest", proficiency: 2, verified: false },
  { id: "sk-a11y", name: "Web Accessibility", proficiency: 2, verified: false },
  { id: "sk-comm", name: "Komunikasi", proficiency: 4, verified: false },
];

export function demoUserContext(userId: string): UserContext {
  return {
    userId,
    goal: DEMO_GOAL,
    skills: DEMO_SKILL_ITEMS,
    skillNames: DEMO_SKILL_ITEMS.map((s) => s.name),
  };
}

/* ================================================================
   SKILL GAP
   ================================================================ */

const DEMO_SKILLS: SkillView[] = [
  { name: "React", category: "core", current: 88, required: 90, tone: "sky" },
  { name: "TypeScript", category: "core", current: 64, required: 85, tone: "amber" },
  { name: "Jest", category: "core", current: 32, required: 70, tone: "rose" },
  { name: "Next.js", category: "core", current: 72, required: 80, tone: "sky" },
  { name: "Tailwind CSS", category: "core", current: 80, required: 78, tone: "emerald" },
  { name: "System Design (FE)", category: "nice-to-have", current: 40, required: 65, tone: "amber" },
  { name: "Web Accessibility", category: "nice-to-have", current: 35, required: 62, tone: "amber" },
  { name: "Komunikasi", category: "soft", current: 75, required: 75, tone: "violet" },
];

export const DEMO_SKILL_GAP: SkillGap = {
  skills: DEMO_SKILLS,
  coveragePct: 63,
  matchedNames: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Komunikasi"],
  missingNames: ["Jest", "System Design (FE)", "Web Accessibility"],
  requiredNames: DEMO_SKILLS.map((s) => s.name),
};

/* ================================================================
   ROADMAP & READINESS
   ================================================================ */

const DEMO_MILESTONES: MilestoneView[] = [
  {
    id: "demo-ms-1",
    week: 1,
    title: "Fondasi Testing dengan Jest",
    status: "done",
    courses: [{ title: "Testing React Applications", provider: "Coursera", hours: 18 }],
  },
  {
    id: "demo-ms-2",
    week: 2,
    title: "React Testing Library hands-on",
    status: "done",
    courses: [{ title: "Testing React Applications", provider: "Coursera", hours: 18 }],
  },
  {
    id: "demo-ms-3",
    week: 3,
    title: "TypeScript generics & utility types",
    status: "in_progress",
    courses: [{ title: "TypeScript Deep Dive", provider: "Dicoding", hours: 32 }],
  },
  { id: "demo-ms-4", week: 4, title: "Mini project: Todo app + tests", status: "upcoming", courses: [] },
  {
    id: "demo-ms-5",
    week: 5,
    title: "Accessibility fundamentals",
    status: "upcoming",
    courses: [{ title: "Web Accessibility", provider: "Coursera", hours: 12 }],
  },
  { id: "demo-ms-6", week: 6, title: "Mock interview & resume review", status: "upcoming", courses: [] },
];

export const DEMO_ROADMAP: RoadmapData = {
  milestones: DEMO_MILESTONES,
  weeksDone: 2,
  weeksTotal: 6,
  current: DEMO_MILESTONES[2],
};

export const DEMO_READINESS: ReadinessView = {
  score: 72,
  lastWeek: 66,
  hoursThisWeek: 6.5,
  hoursTarget: 10,
  weeksDone: 2,
  weeksTotal: 6,
};

/* ================================================================
   JOBS
   ================================================================ */

export const DEMO_JOBS: JobView[] = [
  {
    id: "demo-job-1",
    title: "Frontend Engineer",
    company: "Arunika Labs",
    location: "🇮🇩 Jakarta",
    salary: "Rp 14–20 jt",
    posted: "2 hari lalu",
    matchPct: 82,
    skills: ["React", "TypeScript", "Next.js"],
    sourceLabel: "Contoh",
  },
  {
    id: "demo-job-2",
    title: "React Developer",
    company: "Samudera Pay",
    location: "🌏 Remote (SEA)",
    salary: "Rp 18–25 jt",
    posted: "4 hari lalu",
    matchPct: 74,
    skills: ["React", "Jest", "TypeScript"],
    sourceLabel: "Contoh",
  },
  {
    id: "demo-job-3",
    title: "Web Engineer",
    company: "Lintas Mobility",
    location: "🇮🇩 Jakarta",
    salary: "Rp 15–22 jt",
    posted: "3 hari lalu",
    matchPct: 71,
    skills: ["React", "Next.js", "Web Accessibility"],
    sourceLabel: "Contoh",
  },
  {
    id: "demo-job-4",
    title: "Frontend Engineer (Mid)",
    company: "Cendekia Edu",
    location: "🇮🇩 Jakarta",
    salary: "Rp 12–18 jt",
    posted: "1 minggu lalu",
    matchPct: 68,
    skills: ["React", "Tailwind CSS", "Jest"],
    sourceLabel: "Contoh",
  },
  {
    id: "demo-job-5",
    title: "Junior Frontend Developer",
    company: "Kanaya Retail",
    location: "🇮🇩 Bandung",
    salary: "Rp 7.5–11 jt",
    posted: "1 minggu lalu",
    matchPct: 57,
    skills: ["JavaScript", "React", "CSS"],
    sourceLabel: "Contoh",
  },
];

export const DEMO_JOB_DETAILS: Record<string, JobDetail> = Object.fromEntries(
  DEMO_JOBS.map((j, i) => [
    j.id,
    {
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location.replace(/^\S+\s/, ""),
      type: ["Hybrid", "Remote", "Hybrid", "Onsite", "Onsite"][i],
      level: ["Mid-level", "Mid-level", "Mid-level", "Mid-level", "Junior"][i],
      salary: j.salary,
      description:
        "Bergabung dengan tim produk untuk membangun antarmuka web yang cepat, aksesibel, dan teruji. Kamu akan bekerja lintas fungsi dengan desainer dan backend engineer dalam siklus rilis dua mingguan.",
      requirements: [
        "Pengalaman 2+ tahun membangun aplikasi web produksi",
        "Menguasai ekosistem React modern (hooks, suspense, RSC)",
        "Terbiasa menulis test (unit & integration)",
        "Komunikasi baik dan terbiasa kerja remote-async",
      ],
      skills: j.skills,
      matchedSkills: j.skills.filter((s) =>
        DEMO_SKILL_ITEMS.some((u) => u.name.toLowerCase() === s.toLowerCase()),
      ),
      missingSkills: j.skills.filter(
        (s) => !DEMO_SKILL_ITEMS.some((u) => u.name.toLowerCase() === s.toLowerCase()),
      ),
      matchPct: j.matchPct,
      matchConfidence: 0.6,
      jobReadiness: 60,
      scoreVersion: "v1",
      freshnessScore: null,
      dataQualityScore: null,
      proofSources: [],
      posted: j.posted,
      source: "demo",
      applyUrl: null,
      isNative: false,
      applied: false,
      region: j.location.includes("Remote") ? ("remote" as const) : ("indonesia" as const),
    } satisfies JobDetail,
  ]),
);

export const DEMO_ROLE_MARKET = {
  openPositions: 128,
  trend: [
    { label: "Intern", value: 9 },
    { label: "Junior", value: 31 },
    { label: "Mid", value: 47 },
    { label: "Senior", value: 33 },
    { label: "Lead", value: 8 },
  ],
};

/* ================================================================
   COURSES
   ================================================================ */

export const DEMO_COURSES: CourseView[] = [
  {
    id: "demo-course-1",
    title: "Belajar Fundamental Aplikasi Web dengan React",
    provider: "Dicoding",
    level: "Intermediate",
    hours: 40,
    priceIdr: 0,
    rating: 4.8,
    tag: "React",
  },
  {
    id: "demo-course-2",
    title: "Testing React Applications",
    provider: "Coursera",
    level: "Intermediate",
    hours: 18,
    priceIdr: 0,
    rating: 4.6,
    tag: "Jest",
  },
  {
    id: "demo-course-3",
    title: "TypeScript Deep Dive",
    provider: "Dicoding",
    level: "Advanced",
    hours: 32,
    priceIdr: 150_000,
    rating: 4.7,
    tag: "Prakerja",
  },
  {
    id: "demo-course-4",
    title: "Web Accessibility",
    provider: "Coursera",
    level: "Beginner",
    hours: 12,
    priceIdr: 0,
    rating: 4.5,
    tag: "Web Accessibility",
  },
];

/* ================================================================
   APPLICATIONS
   ================================================================ */

export const DEMO_APPLICATIONS: ApplicationRow[] = [
  {
    id: "demo-app-1",
    jobTitle: "Frontend Engineer",
    company: "Arunika Labs",
    location: "Jakarta",
    mode: "native",
    status: "interview",
    appliedAt: "3 Jul 2026",
    applyUrl: null,
    timeline: [],
  },
  {
    id: "demo-app-2",
    jobTitle: "UI Engineer",
    company: "Bentala Studio",
    location: "Remote",
    mode: "external",
    status: "applied",
    appliedAt: "27 Jun 2026",
    applyUrl: null,
    timeline: [],
  },
];

/* ================================================================
   PROFILE
   ================================================================ */

const DEMO_OWNED_SKILLS: OwnedSkill[] = DEMO_SKILL_ITEMS.map((s) => ({
  id: s.id,
  name: s.name,
  category: s.name === "Komunikasi" ? "soft" : "frontend",
  proficiency: s.proficiency,
  verified: s.verified,
}));

export const DEMO_PROFILE_DATA: ProfileData = {
  headline: "Frontend developer — React & design system",
  summary:
    "3 tahun membangun antarmuka web di agency; sedang transisi ke product company. Fokus di React, TypeScript, dan kualitas kode (testing, a11y).",
  skills: DEMO_OWNED_SKILLS,
  contact: {
    phone: "0812-0000-0000",
    city: "Jakarta",
    country: "Indonesia",
    linkedinUrl: "https://linkedin.com/in/demo",
    githubUrl: "https://github.com/demo",
    portfolioUrl: "https://demo.dev",
    currentTitle: "Frontend Developer",
    currentCompany: "Agency X",
    yearsExperience: 3,
    expectedSalaryIdr: 12_000_000,
  },
  preferences: {
    desiredRoles: ["Frontend Engineer", "UI Engineer"],
    preferredLocations: ["Jakarta", "Remote"],
    remoteOnly: false,
    minSalaryIdr: 10_000_000,
    desiredLevel: "Mid-level",
  },
};

const CATALOG: Array<[string, string[]]> = [
  ["programming", ["JavaScript", "TypeScript", "Python", "Go", "Java", "PHP"]],
  ["frontend", ["React", "Next.js", "Vue.js", "Tailwind CSS", "Jest", "React Testing Library", "Web Accessibility"]],
  ["backend", ["Node.js", "Express.js", "NestJS", "Laravel", "Django"]],
  ["data", ["SQL", "PostgreSQL", "MongoDB", "Pandas", "Machine Learning"]],
  ["devops", ["Docker", "Kubernetes", "AWS", "CI/CD", "Git", "Linux"]],
  ["design", ["Figma", "UI Design", "UX Research", "Design System"]],
  ["soft", ["Komunikasi", "Problem Solving", "Kepemimpinan", "Kerja Tim", "Bahasa Inggris"]],
];

export function demoSkillCatalog(): Map<string, SkillOption[]> {
  const map = new Map<string, SkillOption[]>();
  for (const [category, names] of CATALOG) {
    map.set(
      category,
      names.map((name) => ({
        id: `demo-skill-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name,
        category,
      })),
    );
  }
  return map;
}

/* ================================================================
   FREELANCER
   ================================================================ */

export const DEMO_PROJECTS: ProjectRow[] = [
  {
    id: "demo-proj-1",
    title: "Redesign dashboard admin SaaS logistik",
    client: "Havara Logistics",
    budget: "Rp 18–25 jt",
    duration: "6 minggu",
    posted: "2 hari lalu",
    matchPct: 87,
    skills: ["React", "Tailwind CSS", "Design System"],
    type: "Fixed",
  },
  {
    id: "demo-proj-2",
    title: "Landing page + CMS untuk brand F&B",
    client: "Dapur Rasa Group",
    budget: "Rp 9–12 jt",
    duration: "3 minggu",
    posted: "4 hari lalu",
    matchPct: 79,
    skills: ["Next.js", "Tailwind CSS", "SEO"],
    type: "Fixed",
  },
  {
    id: "demo-proj-3",
    title: "Maintenance frontend aplikasi kasir",
    client: "Kanaya Retail",
    budget: "Rp 250k/jam",
    duration: "Ongoing",
    posted: "1 minggu lalu",
    matchPct: 72,
    skills: ["React", "TypeScript", "Jest"],
    type: "Hourly",
  },
  {
    id: "demo-proj-4",
    title: "Migrasi web company profile ke Next.js",
    client: "Arunika Labs",
    budget: "Rp 14–17 jt",
    duration: "4 minggu",
    posted: "1 minggu lalu",
    matchPct: 66,
    skills: ["Next.js", "React", "CSS"],
    type: "Fixed",
  },
];

export const DEMO_FREELANCER_META: FreelancerMeta = {
  stats: {
    rating: 4.9,
    reviews: 27,
    completedProjects: 34,
    earningsIdr: 187_500_000,
    responseRate: 96,
    readiness: 81,
    hourlyRateIdr: 250_000,
  },
  portfolio: [
    { title: "Dashboard analitik ritel", category: "Web App", tag: "React" },
    { title: "Design system Bentala", category: "Design System", tag: "Figma" },
    { title: "Landing kampanye fintech", category: "Landing Page", tag: "Next.js" },
  ],
  proposals: [
    { project: "Redesign dashboard admin", client: "Havara Logistics", status: "won", amountIdr: 21_000_000, daysAgo: 3 },
    { project: "Landing page brand F&B", client: "Dapur Rasa Group", status: "shortlisted", amountIdr: 10_500_000, daysAgo: 5 },
    { project: "Audit performa web e-commerce", client: "Kanaya Retail", status: "sent", amountIdr: 7_800_000, daysAgo: 8 },
    { project: "Komponen chart internal", client: "Samudera Pay", status: "draft", amountIdr: 12_400_000, daysAgo: 1 },
  ],
};

/* ================================================================
   COMPANY
   ================================================================ */

export const DEMO_COMPANY_JOBS: CompanyJobRow[] = [
  {
    id: "demo-cjob-1",
    title: "Frontend Engineer",
    location: "Jakarta",
    type: "Hybrid",
    applicants: 14,
    status: "active",
    posted: "5 hari lalu",
  },
  {
    id: "demo-cjob-2",
    title: "Backend Engineer (Go)",
    location: "Jakarta",
    type: "Onsite",
    applicants: 8,
    status: "active",
    posted: "1 minggu lalu",
  },
  {
    id: "demo-cjob-3",
    title: "Product Designer",
    location: "Remote",
    type: "Remote",
    applicants: 0,
    status: "draft",
    posted: "—",
  },
];

export const DEMO_CANDIDATES: CandidateRow[] = [
  {
    id: "demo-cand-1",
    name: "Raka Adyatma",
    appliedFor: "Frontend Engineer",
    matchPct: 88,
    stage: "interview",
    rawStatus: "interview",
    skills: ["React", "TypeScript", "Next.js", "Jest"],
    applied: "4 hari lalu",
  },
  {
    id: "demo-cand-2",
    name: "Nadia Pusparini",
    appliedFor: "Frontend Engineer",
    matchPct: 76,
    stage: "screening",
    rawStatus: "screened",
    skills: ["React", "Tailwind CSS", "Figma"],
    applied: "3 hari lalu",
  },
  {
    id: "demo-cand-3",
    name: "Yusuf Alkhairi",
    appliedFor: "Backend Engineer (Go)",
    matchPct: 71,
    stage: "applied",
    rawStatus: "applied",
    skills: ["Go", "PostgreSQL", "Docker"],
    applied: "kemarin",
  },
  {
    id: "demo-cand-4",
    name: "Tiara Maheswari",
    appliedFor: "Frontend Engineer",
    matchPct: 64,
    stage: "applied",
    rawStatus: "applied",
    skills: ["Vue.js", "CSS", "JavaScript"],
    applied: "hari ini",
  },
];

export const DEMO_COMPANY_STATS: CompanyStats = {
  name: "PT Nara Teknologi",
  openJobs: 2,
  totalCandidates: 22,
  interviews: 3,
  offers: 1,
};

export const DEMO_JOB_OPTIONS: JobOption[] = DEMO_COMPANY_JOBS.map((j) => ({
  id: j.id,
  title: j.title,
}));

export const DEMO_TALENT: TalentMatch[] = [
  {
    userId: "demo-talent-1",
    name: "Raka Adyatma",
    headline: "Frontend engineer — 4 th, ex-startup edtech",
    matchPct: 88,
    readinessScore: 84,
    readinessBand: "ready",
    matchedSkills: ["React", "TypeScript", "Next.js", "Jest"],
    verifiedCount: 3,
    totalSkills: 9,
  },
  {
    userId: "demo-talent-2",
    name: "Sari Wulandari",
    headline: "Frontend freelancer — design system & dashboard",
    matchPct: 81,
    readinessScore: 78,
    readinessBand: "ready",
    matchedSkills: ["React", "Tailwind CSS", "Design System"],
    verifiedCount: 2,
    totalSkills: 8,
  },
  {
    userId: "demo-talent-3",
    name: "Nadia Pusparini",
    headline: "UI engineer — kuat di visual & interaksi",
    matchPct: 67,
    readinessScore: 58,
    readinessBand: "getting_there",
    matchedSkills: ["React", "Tailwind CSS"],
    verifiedCount: 1,
    totalSkills: 6,
  },
];

/* ================================================================
   ADMIN
   ================================================================ */

export const DEMO_PLATFORM_STATS: PlatformStats = {
  totalUsers: 12_847,
  newUsersWeek: 342,
  activeJobs: 1_286,
  indexedCourses: 418,
  totalSkills: 97,
  totalApplications: 5_931,
  totalRoles: 12_847,
  roleBreakdown: [
    { role: "jobseeker", count: 9_412 },
    { role: "freelancer", count: 2_218 },
    { role: "company", count: 1_204 },
    { role: "admin", count: 13 },
  ],
};

export const DEMO_USER_GROWTH = [
  { label: "Mei", value: 11_240 },
  { label: "Jun", value: 12_020 },
  { label: "Jul", value: 12_847 },
];

export const DEMO_ADMIN_JOBS: AdminJobRow[] = [
  { id: "demo-aj-1", title: "Frontend Engineer", company: "Arunika Labs", location: "Jakarta", source: "greenhouse", isActive: true, postedAt: "12/7/2026" },
  { id: "demo-aj-2", title: "Data Analyst", company: "Samudera Pay", location: "Jakarta", source: "lever", isActive: true, postedAt: "11/7/2026" },
  { id: "demo-aj-3", title: "DevOps Engineer", company: "Lintas Mobility", location: "Remote", source: "ashby", isActive: true, postedAt: "10/7/2026" },
  { id: "demo-aj-4", title: "Product Manager", company: "Cendekia Edu", location: "Jakarta", source: "kalibrr", isActive: false, postedAt: "28/6/2026" },
];

export const DEMO_ADMIN_USERS: AdminUserRow[] = [
  { id: "demo-au-1", name: "Dimas Prakoso", email: "dimas@craft.works", role: "jobseeker", joinedAt: "2/3/2026", autoApply: false },
  { id: "demo-au-2", name: "Sari Wulandari", email: "sari@craft.works", role: "freelancer", joinedAt: "17/2/2026", autoApply: true },
  { id: "demo-au-3", name: "PT Nara Teknologi", email: "hr@nara.id", role: "company", joinedAt: "9/1/2026", autoApply: false },
  { id: "demo-au-4", name: "Raka Adyatma", email: "raka.adyatma@mail.id", role: "jobseeker", joinedAt: "22/5/2026", autoApply: false },
  { id: "demo-au-5", name: "Nadia Pusparini", email: "nadia.pusparini@mail.id", role: "jobseeker", joinedAt: "3/6/2026", autoApply: false },
];

export const DEMO_ADMIN_COURSES: AdminCourseRow[] = [
  { id: "demo-ac-1", title: "Belajar Fundamental Aplikasi Web dengan React", provider: "Dicoding", priceIdr: 0, isPrakerja: false, source: "dicoding" },
  { id: "demo-ac-2", title: "TypeScript Deep Dive", provider: "Dicoding", priceIdr: 150_000, isPrakerja: true, source: "dicoding" },
  { id: "demo-ac-3", title: "Testing React Applications", provider: "Coursera", priceIdr: 0, isPrakerja: false, source: "coursera" },
  { id: "demo-ac-4", title: "Web Accessibility", provider: "Coursera", priceIdr: 0, isPrakerja: false, source: "coursera" },
];

export const DEMO_RECENT_INGEST = [
  { source: "greenhouse", items: 412, lastAt: "13/7/2026" },
  { source: "lever", items: 268, lastAt: "13/7/2026" },
  { source: "ashby", items: 194, lastAt: "12/7/2026" },
  { source: "kalibrr", items: 331, lastAt: "12/7/2026" },
  { source: "native", items: 81, lastAt: "11/7/2026" },
];
