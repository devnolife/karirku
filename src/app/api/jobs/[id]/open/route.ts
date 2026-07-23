import { auth } from "@/lib/auth";
import { markRecommendationInteraction } from "@/server/services/recommendation-interactions";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id: jobId } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(jobId)) {
    return Response.json({ error: "invalid_job_id" }, { status: 400 });
  }
  const body = (await req.json().catch(() => null)) as {
    impressionId?: unknown;
  } | null;
  const impressionId =
    typeof body?.impressionId === "string" ? body.impressionId : undefined;
  if (
    !impressionId ||
    !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(impressionId)
  ) {
    return Response.json({ ok: true, attributed: false });
  }

  const attributed = await markRecommendationInteraction(
    session.user.id,
    jobId,
    "open",
    impressionId,
  );
  return Response.json({ ok: true, attributed });
}
