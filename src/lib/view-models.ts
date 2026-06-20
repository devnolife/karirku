/**
 * View-model types untuk komponen dashboard/halaman. Bentuk display murni
 * (bukan baris DB). Query di src/server/queries/ memetakan baris Prisma ke sini.
 */

export type SkillTone = "rose" | "amber" | "emerald" | "sky" | "violet";

export type SkillView = {
  name: string;
  category: "core" | "nice-to-have" | "soft";
  current: number; // 0-100
  required: number; // 0-100
  tone: SkillTone;
};

export type MilestoneView = {
  week: number;
  title: string;
  status: "done" | "in_progress" | "upcoming";
  courses: { title: string; provider: string; hours: number }[];
};

export type JobView = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  posted: string;
  matchPct: number;
  skills: string[];
  applyUrl?: string;
  applied?: boolean;
  sourceLabel?: string;
};

export type CourseView = {
  id: string;
  title: string;
  provider: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  hours: number;
  priceIdr: number;
  rating: number;
  tag: string;
};

export type ReadinessView = {
  score: number;
  lastWeek: number;
  hoursThisWeek: number;
  hoursTarget: number;
  weeksDone: number;
  weeksTotal: number;
};
