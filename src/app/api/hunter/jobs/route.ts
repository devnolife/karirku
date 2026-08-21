import { NextRequest } from "next/server";
import { prisma } from "@devnolife/karirku-core/db";
import { authorizeHunterApi } from "@/lib/hunter-access";

export const dynamic = "force-dynamic";

const PLATFORMS = new Set(["freelancer", "jobstreet", "linkedin", "upwork"]);
const STATUSES = new Set(["new", "queued", "applied", "skipped", "expired"]);

export async function GET(request: NextRequest) {
  const access = await authorizeHunterApi();
  if (!access.ok) return access.response;

  const sp = request.nextUrl.searchParams;
  const platform = sp.get("platform");
  const status = sp.get("status");
  const minScore = sp.get("minScore");
  const rawLimit = Number(sp.get("limit") ?? 200);
  const limit =
    Number.isInteger(rawLimit) && rawLimit >= 1 && rawLimit <= 500
      ? rawLimit
      : 200;

  if (platform && !PLATFORMS.has(platform)) {
    return Response.json({ error: "platform tidak valid" }, { status: 400 });
  }
  if (status && !STATUSES.has(status)) {
    return Response.json({ error: "status tidak valid" }, { status: 400 });
  }
  const score = minScore === null ? null : Number(minScore);
  if (
    score !== null &&
    (!Number.isInteger(score) || score < 0 || score > 100)
  ) {
    return Response.json({ error: "minScore harus 0-100" }, { status: 400 });
  }

  const jobs = await prisma.hunterJob.findMany({
    where: {
      userId: access.userId,
      ...(platform ? { platform } : {}),
      ...(status ? { status } : {}),
      ...(score !== null ? { matchScore: { gte: score } } : {}),
    },
    orderBy: [{ matchScore: "desc" }, { foundAt: "desc" }],
    take: limit,
  });
  return Response.json({ jobs });
}

export async function PATCH(request: NextRequest) {
  const access = await authorizeHunterApi();
  if (!access.ok) return access.response;

  const body = await request.json();
  const { id, status } = body as { id?: number; status?: string };
  if (
    typeof id !== "number" ||
    !Number.isInteger(id) ||
    id <= 0 ||
    !status ||
    !STATUSES.has(status)
  ) {
    return Response.json(
      { error: `need { id, status in ${[...STATUSES].join("|")} }` },
      { status: 400 },
    );
  }
  // updateMany + filter userId, bukan update by id: id-nya integer berurutan,
  // jadi update by id saja memungkinkan siapa pun mengubah job milik user lain
  // hanya dengan menebak angka.
  const result = await prisma.hunterJob.updateMany({
    where: { id, userId: access.userId },
    data: { status },
  });
  if (result.count === 0) {
    return Response.json({ error: "job tidak ditemukan" }, { status: 404 });
  }
  return Response.json({ ok: true });
}
