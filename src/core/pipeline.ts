/**
 * Konstanta & tipe pipeline lamaran — client-safe (TANPA import Prisma),
 * supaya bisa dipakai komponen client (StageControl) maupun server query.
 */

export type PipelineStatus = "applied" | "screened" | "interview" | "offered" | "rejected";

export const PIPELINE_OPTIONS: { value: PipelineStatus; label: string }[] = [
  { value: "applied", label: "Applied" },
  { value: "screened", label: "Screening" },
  { value: "interview", label: "Interview" },
  { value: "offered", label: "Offer" },
  { value: "rejected", label: "Tolak" },
];
