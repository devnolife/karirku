import { prisma } from "@devnolife/karirku-core/db";
import { gmailStatus } from "@devnolife/karirku-core/hunter";
import { authorizeHunterApi } from "@/lib/hunter-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await authorizeHunterApi();
  if (!access.ok) return access.response;

  const [accounts, jobs, jobsNew, applications, replied] = await Promise.all([
    prisma.hunterAccount.findMany({
      select: {
        platform: true, username: true, profileUrl: true,
        canAutoApply: true, loginStatus: true, lastChecked: true,
      },
      orderBy: { platform: "asc" },
    }),
    prisma.hunterJob.count(),
    prisma.hunterJob.count({ where: { status: "new" } }),
    prisma.hunterApplication.count(),
    prisma.hunterApplication.count({ where: { replyStatus: { not: "silent" } } }),
  ]);

  return Response.json({
    accounts,
    stats: { jobs, jobsNew, applications, replied },
    gmail: gmailStatus(),
  });
}
