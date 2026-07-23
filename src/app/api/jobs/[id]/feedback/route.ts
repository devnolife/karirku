/**
 * POST /api/jobs/[id]/feedback — feedback user terhadap lowongan.
 * Body: { action: "saved" | "hidden" | "irrelevant" | "clear" }
 * Sinyal ini dipakai ranking rekomendasi (hidden/irrelevant → hilang dari
 * daftar; irrelevant juga memberi penalti lowongan serupa).
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { markRecommendationInteraction } from "@/server/services/recommendation-interactions";

export const dynamic = "force-dynamic";

const ACTIONS = new Set(["saved", "hidden", "irrelevant", "clear"]);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: jobId } = await params;

  let action: string;
  let impressionId: string | undefined;
  try {
    const body = await req.json();
    action = String(body?.action ?? "");
    impressionId =
      typeof body?.impressionId === "string" ? body.impressionId : undefined;
  } catch {
    return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });
  }
  if (!ACTIONS.has(action)) {
    return NextResponse.json(
      { error: `action harus salah satu: ${[...ACTIONS].join(", ")}` },
      { status: 400 },
    );
  }
  if (
    impressionId &&
    !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(impressionId)
  ) {
    return NextResponse.json(
      { error: "impressionId tidak valid" },
      { status: 400 },
    );
  }

  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { id: true } });
  if (!job) {
    return NextResponse.json({ error: "Lowongan tidak ditemukan" }, { status: 404 });
  }

  const userId = session.user.id;
  if (action === "clear") {
    await prisma.jobFeedback.deleteMany({ where: { userId, jobId } });
    return NextResponse.json({ ok: true, action: null });
  }

  const fb = await prisma.jobFeedback.upsert({
    where: { userId_jobId: { userId, jobId } },
    create: { userId, jobId, action: action as "saved" | "hidden" | "irrelevant" },
    update: { action: action as "saved" | "hidden" | "irrelevant" },
  });
  const interaction =
    fb.action === "saved"
      ? "save"
      : fb.action === "hidden"
        ? "hide"
        : "irrelevant";
  try {
    await markRecommendationInteraction(
      userId,
      jobId,
      interaction,
      impressionId,
    );
  } catch (error) {
    console.warn(
      `[recommendation] gagal mencatat ${interaction}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
  return NextResponse.json({ ok: true, action: fb.action });
}
