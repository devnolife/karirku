/**
 * POST /api/autofill/report — extension melaporkan hasil sesi autofill.
 * status "filled"    → form terisi, user sedang review.
 * status "submitted" → user menekan submit; bila URL cocok Job di DB,
 *                      catat Application (mode external).
 */

import { z } from "zod";
import { prisma } from "@/lib/db";
import { corsJson, corsPreflight, unauthorized, userFromRequest } from "../_lib";

const ReportSchema = z.object({
  url: z.url(),
  status: z.enum(["filled", "submitted", "error"]),
  portal: z.string().max(100).nullable().optional(),
  method: z.enum(["adapter", "llm", "mixed", "none"]).optional(),
  fieldsTotal: z.number().int().min(0).max(1000),
  fieldsFilled: z.number().int().min(0).max(1000),
});

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  const userId = await userFromRequest(req);
  if (!userId) return unauthorized();

  let report;
  try {
    report = ReportSchema.parse(await req.json());
  } catch (err) {
    return corsJson(
      { error: "invalid_body", message: err instanceof Error ? err.message : "Body tidak valid" },
      { status: 400 },
    );
  }

  let applicationRecorded = false;

  if (process.env.DATABASE_URL) {
    try {
      await prisma.autofillLog.create({
        data: {
          userId,
          url: report.url,
          portal: report.portal ?? null,
          fieldsTotal: report.fieldsTotal,
          fieldsFilled: report.fieldsFilled,
          method: report.method ?? "none",
          status: report.status,
        },
      });

      if (report.status === "submitted") {
        const job = await prisma.job.findUnique({
          where: { sourceUrl: report.url },
          select: { id: true },
        });
        if (job) {
          const existing = await prisma.application.findFirst({
            where: { userId, jobId: job.id },
            select: { id: true },
          });
          if (!existing) {
            await prisma.application.create({
              data: {
                userId,
                jobId: job.id,
                mode: "external",
                status: "applied",
                events: {
                  create: {
                    status: "applied",
                    source: "system",
                    note: "Submit terdeteksi oleh extension Karirku.",
                  },
                },
              },
            });
          }
          // Attribution to a recommendation impression is handled causally at
          // in-app apply-click time (see applyToJob). A submit detected purely
          // on the portal has no impression the user acted through, so we record
          // the application but intentionally do not attribute an impression.
          applicationRecorded = true;
        }
      }
    } catch (err) {
      console.warn(
        `[autofill] gagal mencatat report: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return corsJson({ ok: true, applicationRecorded });
}
