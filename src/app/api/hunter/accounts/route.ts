import { prisma } from "@devnolife/karirku-core/db";
import { gmailStatus } from "@devnolife/karirku-core/hunter";
import { authorizeHunterApi } from "@/lib/hunter-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await authorizeHunterApi();
  if (!access.ok) return access.response;
  const { userId } = access;

  const [accounts, jobs, jobsNew, applications, replied] = await Promise.all([
    prisma.hunterAccount.findMany({
      where: { userId },
      select: {
        platform: true, username: true, profileUrl: true,
        canAutoApply: true, loginStatus: true, lastChecked: true,
      },
      orderBy: { platform: "asc" },
    }),
    prisma.hunterJob.count({ where: { userId } }),
    prisma.hunterJob.count({ where: { userId, status: "new" } }),
    prisma.hunterApplication.count({ where: { userId } }),
    prisma.hunterApplication.count({
      where: { userId, replyStatus: { not: "silent" } },
    }),
  ]);

  return Response.json({
    accounts,
    stats: { jobs, jobsNew, applications, replied },
    gmail: gmailStatus(),
  });
}
