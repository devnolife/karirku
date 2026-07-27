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

import { prisma } from "@devnolife/karirku-core/db";
import { isProductionMode } from "@devnolife/karirku-core/mode";
import {
  highestStageReached,
  statusLabel,
  type ApplicationStatusValue,
} from "@devnolife/karirku-core/applications/status";
import { markRecommendationInteraction } from "@/server/services/recommendation-interactions";

const EXTERNAL_SOURCES = new Set(["greenhouse", "lever", "ashby", "kalibrr", "import", "http"]);

export type ApplyResult =
  | { ok: true; mode: "native" }
  | { ok: true; mode: "external"; redirectUrl: string }
  | { ok: false; reason: "not_found" | "already_applied" };

/** Lamar ke sebuah job. Idempoten — tolak kalau sudah pernah melamar. */
export async function applyToJob(
  userId: string,
  jobId: string,
  impressionId?: string,
): Promise<ApplyResult> {
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
      events: {
        create: {
          status: "applied",
          source: "system",
          note: "Lamaran dicatat oleh Karirku.",
        },
      },
    },
  });
  try {
    await markRecommendationInteraction(
      userId,
      jobId,
      "apply",
      impressionId,
    );
  } catch (error) {
    console.warn(
      `[recommendation] gagal mencatat apply: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

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
  timeline: Array<{
    id: string;
    status: string;
    source: "manual" | "email" | "system";
    note: string | null;
    occurredAt: string;
  }>;
};

export { statusLabel };

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
        timeline: [],
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
      events: {
        orderBy: { occurredAt: "desc" },
        take: 5,
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
    applyUrl:
      EXTERNAL_SOURCES.has(a.job.source) && /^(https?:|mailto:)/i.test(a.job.sourceUrl ?? "")
        ? a.job.sourceUrl
        : null,
    timeline: a.events.map((event) => ({
      id: event.id,
      status: event.status,
      source: event.source,
      note: event.note,
      occurredAt: event.occurredAt.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    })),
  }));
}

export type UpdateApplicationStatusResult =
  | { ok: true }
  | { ok: false; reason: "not_found" };

/** Update snapshot + append immutable event, always scoped to the owner. */
export async function updateApplicationStatus(
  userId: string,
  applicationId: string,
  status: ApplicationStatusValue,
  note?: string,
): Promise<UpdateApplicationStatusResult> {
  return prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM applications
      WHERE id = ${applicationId}::uuid AND user_id = ${userId}::uuid
      FOR UPDATE
    `;
    if (!locked.length) return { ok: false, reason: "not_found" } as const;

    const application = await tx.application.findUnique({
      where: { id: applicationId },
      include: { outcome: true },
    });
    if (!application) return { ok: false, reason: "not_found" } as const;

    const cleanNote = note?.trim().slice(0, 2_000) || null;
    const stageReached = highestStageReached(
      application.outcome?.stageReached,
      status,
    );

    await tx.application.update({
      where: { id: application.id },
      data: {
        status,
        events: {
          create: {
            status,
            source: "manual",
            note: cleanNote,
            confidence: 1,
          },
        },
        outcome: {
          upsert: {
            create: {
              stageReached,
              feedback: cleanNote,
            },
            update: {
              stageReached,
              ...(cleanNote ? { feedback: cleanNote } : {}),
            },
          },
        },
      },
    });

    return { ok: true } as const;
  });
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
