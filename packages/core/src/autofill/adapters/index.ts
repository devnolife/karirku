/**
 * Registry adapter autofill — cari adapter berdasarkan URL halaman form.
 * Pola mengikuti src/lib/scraper/providers/index (registry per portal).
 */

import type { AutofillAdapter } from "../types.js";
import greenhouse from "./greenhouse.js";
import lever from "./lever.js";
import ashby from "./ashby.js";
import jobstreet from "./jobstreet.js";
import glints from "./glints.js";

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
