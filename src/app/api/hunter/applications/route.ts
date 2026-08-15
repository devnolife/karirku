import { NextRequest } from "next/server";
import { prisma } from "@devnolife/karirku-core/db";
import { authorizeHunterApi } from "@/lib/hunter-access";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const access = await authorizeHunterApi();
  if (!access.ok) return access.response;

  const sp = request.nextUrl.searchParams;
  const platform = sp.get("platform");
  const replyStatus = sp.get("replyStatus");

  const applications = await prisma.hunterApplication.findMany({
    where: {
      userId: access.userId,
      ...(platform ? { platform } : {}),
      ...(replyStatus ? { replyStatus } : {}),
    },
    include: {
      job: { select: { url: true, salaryMin: true, salaryMax: true, matchScore: true } },
    },
    orderBy: { appliedAt: "desc" },
    take: 500,
  });
  return Response.json({ applications });
}
