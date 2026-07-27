export const APPLICATION_STATUSES = [
  "applied",
  "screened",
  "interview",
  "offered",
  "accepted",
  "rejected",
  "ghosted",
  "withdrawn",
] as const;

export type ApplicationStatusValue = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatusValue, string> = {
  applied: "Dilamar",
  screened: "Di-screening",
  interview: "Interview",
  offered: "Ditawari",
  accepted: "Diterima",
  rejected: "Ditolak",
  ghosted: "Tanpa kabar",
  withdrawn: "Dibatalkan",
};

const PIPELINE_RANK: Partial<Record<ApplicationStatusValue, number>> = {
  applied: 0,
  screened: 1,
  interview: 2,
  offered: 3,
  accepted: 4,
};

export function isApplicationStatus(
  value: string,
): value is ApplicationStatusValue {
  return (APPLICATION_STATUSES as readonly string[]).includes(value);
}

export function statusLabel(status: string): string {
  return isApplicationStatus(status)
    ? APPLICATION_STATUS_LABEL[status]
    : status;
}

/**
 * Keep the highest positive pipeline stage even after a terminal rejection,
 * ghosting, or withdrawal event.
 */
export function highestStageReached(
  current: string | null | undefined,
  next: ApplicationStatusValue,
): string {
  if (!current || !isApplicationStatus(current)) {
    return PIPELINE_RANK[next] === undefined ? "applied" : next;
  }
  const currentRank = PIPELINE_RANK[current] ?? -1;
  const nextRank = PIPELINE_RANK[next] ?? -1;
  return nextRank > currentRank ? next : current;
}
