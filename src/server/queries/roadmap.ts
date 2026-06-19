/**
 * Roadmap: milestone learning path user (real, dari path_milestones).
 */

import { prisma } from "@/lib/db";
import type { MilestoneView } from "@/lib/view-models";

function mapStatus(s: string): MilestoneView["status"] {
  if (s === "done") return "done";
  if (s === "in_progress") return "in_progress";
  return "upcoming";
}

export type RoadmapData = {
  milestones: MilestoneView[];
  weeksDone: number;
  weeksTotal: number;
  current: MilestoneView | null;
};

/** Learning path aktif user + milestone-nya (urut minggu). */
export async function getRoadmap(userId: string): Promise<RoadmapData> {
  const path = await prisma.learningPath.findFirst({
    where: { userId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      milestones: { orderBy: { weekNumber: "asc" } },
    },
  });

  if (!path || path.milestones.length === 0) {
    return { milestones: [], weeksDone: 0, weeksTotal: 0, current: null };
  }

  // Kumpulkan semua courseId untuk resolusi judul/provider/jam dalam satu query.
  const courseIds = [...new Set(path.milestones.flatMap((m) => m.courseIds))];
  const courses = courseIds.length
    ? await prisma.course.findMany({
        where: { id: { in: courseIds } },
        select: { id: true, title: true, provider: true, durationHours: true },
      })
    : [];
  const courseById = new Map(courses.map((c) => [c.id, c]));

  const milestones: MilestoneView[] = path.milestones.map((m) => ({
    week: m.weekNumber,
    title: m.title,
    status: mapStatus(m.status),
    courses: m.courseIds
      .map((id) => courseById.get(id))
      .filter((c): c is NonNullable<typeof c> => !!c)
      .map((c) => ({
        title: c.title,
        provider: c.provider ?? "—",
        hours: Math.round(c.durationHours ?? 0),
      })),
  }));

  const weeksDone = milestones.filter((m) => m.status === "done").length;
  const current =
    milestones.find((m) => m.status === "in_progress") ??
    milestones.find((m) => m.status === "upcoming") ??
    milestones[0];

  return { milestones, weeksDone, weeksTotal: milestones.length, current };
}
