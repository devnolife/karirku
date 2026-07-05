/**
 * Registry adapter autofill — cari adapter berdasarkan URL halaman form.
 * Pola mengikuti src/lib/scraper/providers/index (registry per portal).
 */

import type { AutofillAdapter } from "../types";
import greenhouse from "./greenhouse";
import lever from "./lever";
import ashby from "./ashby";
import jobstreet from "./jobstreet";
import glints from "./glints";

export const ADAPTERS: AutofillAdapter[] = [
  greenhouse,
  lever,
  ashby,
  jobstreet,
  glints,
];

/** Kembalikan adapter pertama yang cocok dengan URL, atau null. */
export function findAdapter(url: string): AutofillAdapter | null {
  return ADAPTERS.find((a) => a.matchUrl.test(url)) ?? null;
}
