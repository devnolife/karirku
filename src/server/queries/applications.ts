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

const EXTERNAL_SOURCES = new Set(["greenhouse", "lever", "ashby", "http"]);

export type ApplyResult =
  | { ok: true; mode: "native" }
  | { ok: true; mode: "external"; redirectUrl: string }
  | { ok: false; reason: "not_found" | "already_applied" };

/** Lamar ke sebuah job. Idempoten — tolak kalau sudah pernah melamar. */
export async function applyToJob(userId: string, jobId: string): Promise<ApplyResult> {
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
  const rows = await prisma.application.findMany({
    where: { userId },
    select: { jobId: true },
  });
  return new Set(rows.map((r) => r.jobId));
}
