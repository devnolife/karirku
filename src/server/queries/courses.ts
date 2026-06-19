/**
 * Rekomendasi course: utamakan course yang mengajarkan skill yang masih kurang
 * (missing) dari skill-gap user. Fallback: course gratis/populer.
 */

import { prisma } from "@/lib/db";
import type { CourseView } from "@/lib/view-models";
import { getSkillGap } from "./skills";

function mapLevel(level: string | null): CourseView["level"] {
  if (level === "advanced") return "Advanced";
  if (level === "intermediate") return "Intermediate";
  return "Beginner";
}

type CourseRow = {
  id: string;
  title: string;
  provider: string | null;
  level: string | null;
  durationHours: number | null;
  priceIdr: number;
  rating: number | null;
  isPrakerja: boolean;
  skillsTaught: string[];
};

function toView(c: CourseRow, tag: string): CourseView {
  return {
    id: c.id,
    title: c.title,
    provider: c.provider ?? "Online",
    level: mapLevel(c.level),
    hours: Math.round(c.durationHours ?? 0),
    priceIdr: c.priceIdr,
    rating: c.rating ?? 4.5,
    tag,
  };
}

export async function getRecommendedCourses(userId: string, limit = 6): Promise<CourseView[]> {
  const gap = await getSkillGap(userId);

  // Map nama skill kurang → id taxonomy.
  const missingIds = gap.missingNames.length
    ? (
        await prisma.skillTaxonomy.findMany({
          where: { name: { in: gap.missingNames, mode: "insensitive" } },
          select: { id: true, name: true },
        })
      )
    : [];
  const idToName = new Map(missingIds.map((s) => [s.id, s.name]));

  let courses: CourseRow[] = [];
  if (missingIds.length > 0) {
    courses = await prisma.course.findMany({
      where: { skillsTaught: { hasSome: missingIds.map((s) => s.id) } },
      orderBy: [{ priceIdr: "asc" }, { rating: "desc" }],
      take: limit,
      select: {
        id: true, title: true, provider: true, level: true, durationHours: true,
        priceIdr: true, rating: true, isPrakerja: true, skillsTaught: true,
      },
    });
  }

  // Fallback: lengkapi dengan course gratis/rating tinggi kalau kurang.
  if (courses.length < limit) {
    const seen = new Set(courses.map((c) => c.id));
    const extra = await prisma.course.findMany({
      where: { id: { notIn: [...seen] } },
      orderBy: [{ priceIdr: "asc" }, { rating: "desc" }],
      take: limit - courses.length,
      select: {
        id: true, title: true, provider: true, level: true, durationHours: true,
        priceIdr: true, rating: true, isPrakerja: true, skillsTaught: true,
      },
    });
    courses = [...courses, ...extra];
  }

  return courses.map((c) => {
    const taughtMissing = c.skillsTaught.map((id) => idToName.get(id)).find(Boolean);
    const tag = taughtMissing ?? (c.isPrakerja ? "Prakerja" : "Rekomendasi");
    return toView(c, tag);
  });
}
