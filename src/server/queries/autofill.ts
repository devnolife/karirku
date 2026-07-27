/**
 * Aktivitas autofill milik user — transparansi atas apa yang dibantu isi oleh
 * extension Karirku. Read-only; submit form selalu dilakukan user sendiri.
 */

import { prisma } from "@/core/db";
import {
  autofillHost,
  describeAutofillMethod,
  describeAutofillStatus,
  summarizeAutofillActivity,
  type AutofillActivitySummary,
} from "@/core/autofill/activity";

export type AutofillSessionRow = {
  id: string;
  host: string;
  portalLabel: string | null;
  method: string;
  status: string;
  fieldsFilled: number;
  fieldsTotal: number;
  when: string;
};

export type AutofillActivity = {
  summary: AutofillActivitySummary;
  sessions: AutofillSessionRow[];
};

/** Aktivitas autofill terbaru (default 20 sesi). Summary dihitung atas rentang yang sama. */
export async function getAutofillActivity(
  userId: string,
  take = 20,
): Promise<AutofillActivity> {
  const logs = await prisma.autofillLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      url: true,
      portal: true,
      method: true,
      status: true,
      fieldsTotal: true,
      fieldsFilled: true,
      createdAt: true,
    },
  });

  const summary = summarizeAutofillActivity(logs);
  const sessions: AutofillSessionRow[] = logs.map((log) => ({
    id: log.id,
    host: log.portal ?? autofillHost(log.url),
    portalLabel: log.portal,
    method: describeAutofillMethod(log.method),
    status: describeAutofillStatus(log.status),
    fieldsFilled: log.fieldsFilled,
    fieldsTotal: log.fieldsTotal,
    when: log.createdAt.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  return { summary, sessions };
}
