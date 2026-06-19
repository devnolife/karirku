/**
 * Agregasi untuk panel admin — semua dari DB / BullMQ (bukan mock).
 */

import { prisma } from "@/lib/db";
import { allQueues } from "@/lib/queue";
import type { UserRole } from "@/lib/roles";

export type PlatformStats = {
  totalUsers: number;
  newUsersWeek: number;
  activeJobs: number;
  indexedCourses: number;
  totalSkills: number;
  totalApplications: number;
  totalRoles: number;
  roleBreakdown: { role: UserRole; count: number }[];
};

export async function getPlatformStats(): Promise<PlatformStats> {
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const [totalUsers, newUsersWeek, activeJobs, indexedCourses, totalSkills, totalApplications, grouped] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.job.count({ where: { isActive: true } }),
      prisma.course.count(),
      prisma.skillTaxonomy.count(),
      prisma.application.count(),
      prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    ]);

  const order: UserRole[] = ["jobseeker", "freelancer", "company", "admin"];
  const counts = new Map<string, number>(grouped.map((g) => [g.role, g._count._all]));
  const roleBreakdown = order.map((role) => ({ role, count: counts.get(role) ?? 0 }));

  return {
    totalUsers,
    newUsersWeek,
    activeJobs,
    indexedCourses,
    totalSkills,
    totalApplications,
    totalRoles: totalUsers,
    roleBreakdown,
  };
}

/** Pertumbuhan user per bulan (3 bulan terakhir), dari users.createdAt. */
export async function getUserGrowth(): Promise<{ label: string; value: number }[]> {
  const now = new Date();
  const months: { label: string; start: Date; end: Date }[] = [];
  for (let i = 2; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    months.push({
      label: start.toLocaleDateString("id-ID", { month: "short" }),
      start,
      end,
    });
  }

  const results = await Promise.all(
    months.map((m) =>
      prisma.user.count({ where: { createdAt: { gte: m.start, lt: m.end } } }),
    ),
  );

  // Kumulatif agar tampak pertumbuhan total.
  let cumulative = await prisma.user.count({
    where: { createdAt: { lt: months[0].start } },
  });
  return months.map((m, i) => {
    cumulative += results[i];
    return { label: m.label, value: cumulative };
  });
}

export type AdminJobRow = {
  id: string;
  title: string;
  company: string;
  location: string;
  source: string;
  isActive: boolean;
  postedAt: string;
};

export async function getAdminJobs(limit = 20): Promise<AdminJobRow[]> {
  const jobs = await prisma.job.findMany({
    orderBy: { scrapedAt: "desc" },
    take: limit,
    select: {
      id: true, title: true, company: true, location: true, source: true,
      isActive: true, postedAt: true, scrapedAt: true,
    },
  });
  return jobs.map((j) => ({
    id: j.id,
    title: j.title,
    company: j.company ?? "—",
    location: j.location ?? "Remote",
    source: j.source,
    isActive: j.isActive,
    postedAt: (j.postedAt ?? j.scrapedAt).toLocaleDateString("id-ID"),
  }));
}

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
};

export async function getAdminUsers(limit = 50): Promise<AdminUserRow[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name ?? u.email,
    email: u.email,
    role: u.role as UserRole,
    joinedAt: u.createdAt.toLocaleDateString("id-ID"),
  }));
}

export type AdminCourseRow = {
  id: string;
  title: string;
  provider: string;
  priceIdr: number;
  isPrakerja: boolean;
  source: string;
};

export async function getAdminCourses(limit = 30): Promise<AdminCourseRow[]> {
  const courses = await prisma.course.findMany({
    orderBy: { scrapedAt: "desc" },
    take: limit,
    select: { id: true, title: true, provider: true, priceIdr: true, isPrakerja: true, source: true },
  });
  return courses.map((c) => ({
    id: c.id,
    title: c.title,
    provider: c.provider ?? "—",
    priceIdr: c.priceIdr,
    isPrakerja: c.isPrakerja,
    source: c.source,
  }));
}

export type QueueStat = { name: string; waiting: number; active: number; completed: number; failed: number };

/** Statistik antrian BullMQ (real). Aman kalau Redis tidak tersedia → 0. */
export async function getQueueStats(): Promise<QueueStat[]> {
  try {
    return await Promise.all(
      allQueues.map(async (q) => {
        const counts = await q.getJobCounts("waiting", "active", "completed", "failed");
        return {
          name: q.name,
          waiting: counts.waiting ?? 0,
          active: counts.active ?? 0,
          completed: counts.completed ?? 0,
          failed: counts.failed ?? 0,
        };
      }),
    );
  } catch {
    return allQueues.map((q) => ({ name: q.name, waiting: 0, active: 0, completed: 0, failed: 0 }));
  }
}

/** Aktivitas pipeline: lowongan terbaru per sumber (proxy run scraper). */
export async function getRecentIngest(limit = 6): Promise<
  { source: string; items: number; lastAt: string }[]
> {
  const grouped = await prisma.job.groupBy({
    by: ["source"],
    _count: { _all: true },
    _max: { scrapedAt: true },
    orderBy: { _max: { scrapedAt: "desc" } },
    take: limit,
  });
  return grouped.map((g) => ({
    source: g.source,
    items: g._count._all,
    lastAt: g._max.scrapedAt ? g._max.scrapedAt.toLocaleDateString("id-ID") : "—",
  }));
}
