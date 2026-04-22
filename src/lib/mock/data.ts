/**
 * Mock fixtures untuk mode UI/UX-first.
 * Tidak ada database / API call — semua data statis di sini.
 */

export type SkillTone = "rose" | "amber" | "emerald" | "sky" | "violet";

export type MockUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
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
  email: "dimas@karir.ai",
  image: null,
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
