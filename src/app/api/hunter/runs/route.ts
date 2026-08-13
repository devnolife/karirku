import { prisma } from "@devnolife/karirku-core/db";
import { authorizeHunterApi } from "@/lib/hunter-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await authorizeHunterApi();
  if (!access.ok) return access.response;

  const runs = await prisma.hunterRun.findMany({
    select: {
      id: true, type: true, platform: true, ok: true,
      statsJson: true, startedAt: true, finishedAt: true,
    },
    orderBy: { id: "desc" },
    take: 50,
  });
  return Response.json({ runs });
}
