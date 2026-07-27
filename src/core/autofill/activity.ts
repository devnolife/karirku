/**
 * Helper murni untuk menampilkan aktivitas autofill ke user (transparansi).
 * Tidak menyentuh DB — mudah diuji. Query DB ada di
 * `src/server/queries/autofill.ts` dan memakai fungsi-fungsi ini.
 */

export type AutofillLogInput = {
  url: string;
  portal: string | null;
  method: string;
  status: string;
  fieldsTotal: number;
  fieldsFilled: number;
};

/** Host ringkas dari URL portal (tanpa `www.`), fallback ke string asli. */
export function autofillHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.slice(0, 60);
  }
}

/** Label sumber pengisian yang dapat dipahami user. */
export function describeAutofillMethod(method: string): string {
  switch (method) {
    case "adapter":
      return "Profil (presisi)";
    case "llm":
      return "AI (perlu review)";
    case "mixed":
      return "Profil + AI";
    default:
      return "—";
  }
}

/** Label status sesi autofill. `submitted` = user yang menekan submit. */
export function describeAutofillStatus(status: string): string {
  switch (status) {
    case "submitted":
      return "Dikirim oleh kamu";
    case "filled":
      return "Terisi — menunggu review";
    case "mapped":
      return "Dipetakan";
    case "error":
      return "Gagal";
    default:
      return status;
  }
}

export type AutofillActivitySummary = {
  sessions: number;
  submitted: number;
  fieldsFilled: number;
  portals: number;
};

/**
 * Ringkasan agregat untuk header aktivitas. `portals` = jumlah host unik,
 * `fieldsFilled` = total field yang pernah dibantu isi.
 */
export function summarizeAutofillActivity(
  logs: AutofillLogInput[],
): AutofillActivitySummary {
  const hosts = new Set<string>();
  let submitted = 0;
  let fieldsFilled = 0;
  for (const log of logs) {
    hosts.add(log.portal ?? autofillHost(log.url));
    if (log.status === "submitted") submitted++;
    fieldsFilled += Math.max(0, log.fieldsFilled);
  }
  return {
    sessions: logs.length,
    submitted,
    fieldsFilled,
    portals: hosts.size,
  };
}
