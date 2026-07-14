/**
 * Server actions & query untuk lamaran (Application).
 *
 * Apply terpadu:
 *  - Job native (companyProfileId terisi) → Application(mode=native) in-platform,
 *    muncul di pipeline kandidat perusahaan.
 *  - Job eksternal (source greenhouse/lever/ashby/http, punya sourceUrl asli) →
 *    Application(mode=external) sebagai catatan, lalu redirect ke sourceUrl.
 *  - Dedupe unik per (user, job).
 */

import { prisma } from "@/lib/db";
import { isProductionMode } from "@/lib/mode";

const EXTERNAL_SOURCES = new Set(["greenhouse", "lever", "ashby", "kalibrr", "http"]);

export type ApplyResult =
  | { ok: true; mode: "native" }
  | { ok: true; mode: "external"; redirectUrl: string }
  | { ok: false; reason: "not_found" | "already_applied" };

/** Lamar ke sebuah job. Idempoten — tolak kalau sudah pernah melamar. */
export async function applyToJob(userId: string, jobId: string): Promise<ApplyResult> {
  if (!isProductionMode()) {
    const [{ DEMO_JOBS }, { readDemoAppliedIds, addDemoAppliedId }] = await Promise.all([
      import("@/lib/mock/demo"),
      import("@/lib/mock/demo-store"),
    ]);
    const job = DEMO_JOBS.find((j) => j.id === jobId);
    if (!job) return { ok: false, reason: "not_found" };
    const applied = await readDemoAppliedIds();
    if (applied.has(jobId)) return { ok: false, reason: "already_applied" };
    await addDemoAppliedId(jobId);
    return job.applyUrl
      ? { ok: true, mode: "external", redirectUrl: job.applyUrl }
      : { ok: true, mode: "native" };
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, source: true, sourceUrl: true, companyProfileId: true, isActive: true },
  });
  if (!job || !job.isActive) return { ok: false, reason: "not_found" };

  const existing = await prisma.application.findFirst({
    where: { userId, jobId },
    select: { id: true },
  });
  if (existing) return { ok: false, reason: "already_applied" };

  const isNative = !!job.companyProfileId;
  const isExternal = EXTERNAL_SOURCES.has(job.source);

  await prisma.application.create({
    data: {
      userId,
      jobId,
      mode: isNative ? "native" : "external",
      status: "applied",
    },
  });

  if (isNative) return { ok: true, mode: "native" };
  if (isExternal && job.sourceUrl) {
    return { ok: true, mode: "external", redirectUrl: job.sourceUrl };
  }
  // Job seed non-native tanpa URL asli: tetap tercatat sebagai applied.
  return { ok: true, mode: "native" };
}

export type ApplicationRow = {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  mode: "native" | "external";
  status: string;
  appliedAt: string;
  applyUrl: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  applied: "Dilamar",
  screened: "Di-screening",
  interview: "Interview",
  offered: "Ditawari",
  accepted: "Diterima",
  rejected: "Ditolak",
  ghosted: "Tanpa kabar",
  withdrawn: "Dibatalkan",
};

export function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

/** Daftar lamaran user (terbaru dulu). */
export async function getUserApplications(userId: string): Promise<ApplicationRow[]> {
  if (!isProductionMode()) {
    const [{ DEMO_APPLICATIONS, DEMO_JOBS }, { readDemoAppliedIds }] = await Promise.all([
      import("@/lib/mock/demo"),
      import("@/lib/mock/demo-store"),
    ]);
    const applied = await readDemoAppliedIds();
    const fromCookie: ApplicationRow[] = DEMO_JOBS.filter((j) => applied.has(j.id)).map(
      (j) => ({
        id: `demo-applied-${j.id}`,
        jobTitle: j.title,
        company: j.company,
        location: j.location.replace(/^\S+\s/, ""),
        mode: j.applyUrl ? "external" : "native",
        status: "applied",
        appliedAt: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        applyUrl: j.applyUrl ?? null,
      }),
    );
    return [...fromCookie, ...DEMO_APPLICATIONS];
  }

  const apps = await prisma.application.findMany({
    where: { userId },
    orderBy: { appliedAt: "desc" },
    include: {
      job: {
        select: { title: true, company: true, location: true, source: true, sourceUrl: true },
      },
    },
  });

  return apps.map((a) => ({
    id: a.id,
    jobTitle: a.job.title,
    company: a.job.company ?? "—",
    location: a.job.location ?? "Remote",
    mode: a.mode as "native" | "external",
    status: a.status,
    appliedAt: a.appliedAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    applyUrl: EXTERNAL_SOURCES.has(a.job.source) ? a.job.sourceUrl : null,
  }));
}

/** Set jobId yang sudah dilamar user (untuk tandai tombol "Sudah dilamar"). */
export async function getAppliedJobIds(userId: string): Promise<Set<string>> {
  if (!isProductionMode()) {
    const { readDemoAppliedIds } = await import("@/lib/mock/demo-store");
    return readDemoAppliedIds();
  }

  const rows = await prisma.application.findMany({
    where: { userId },
    select: { jobId: true },
  });
  return new Set(rows.map((r) => r.jobId));
}
