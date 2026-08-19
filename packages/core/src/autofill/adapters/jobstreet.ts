/**
 * Adapter JobStreet (id.jobstreet.com / seek) — form profil & apply.
 * Struktur form JobStreet lebih dinamis; aturan berbasis label ID/EN.
 */

import type { AutofillAdapter } from "../types.js";

const adapter: AutofillAdapter = {
  id: "jobstreet",
  matchUrl: /(?:id|www)\.jobstreet\.(?:com|co\.id)\//i,
  rules: [
    { match: /first[\s_-]?name|nama\s*depan/, get: (p) => p.firstName },
    { match: /last[\s_-]?name|nama\s*belakang/, get: (p) => p.lastName },
    { match: /full[\s_-]?name|nama\s*lengkap|\bnama\b/, get: (p) => p.fullName },
    { match: /e-?mail/, get: (p) => p.email },
    { match: /phone|telepon|\bhp\b|ponsel|mobile/, get: (p) => p.phone },
    { match: /location|lokasi|kota|domisili/, get: (p) => p.city },
    { match: /job\s*title|jabatan|posisi/, get: (p) => p.currentTitle ?? p.headline },
    { match: /company|perusahaan/, get: (p) => p.currentCompany },
    { match: /summary|ringkasan|tentang/, get: (p) => p.summary },
  ],
};

export default adapter;
