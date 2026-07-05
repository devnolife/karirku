/**
 * Adapter Glints (glints.com) — form apply & profil.
 * Aturan berbasis label ID/EN karena atribut name Glints sering berubah.
 */

import type { AutofillAdapter } from "../types";

const adapter: AutofillAdapter = {
  id: "glints",
  matchUrl: /(?:www\.|employers\.)?glints\.com\//i,
  rules: [
    { match: /first[\s_-]?name|nama\s*depan/, get: (p) => p.firstName },
    { match: /last[\s_-]?name|nama\s*belakang/, get: (p) => p.lastName },
    { match: /full[\s_-]?name|nama\s*lengkap|\bnama\b/, get: (p) => p.fullName },
    { match: /e-?mail/, get: (p) => p.email },
    { match: /phone|whatsapp|telepon|\bhp\b/, get: (p) => p.phone },
    { match: /location|lokasi|kota|city|domisili/, get: (p) => p.city },
    { match: /linked[\s_-]?in/, get: (p) => p.linkedinUrl },
    { match: /portfolio|portofolio|website/, get: (p) => p.portfolioUrl },
    { match: /headline|job\s*title|jabatan|posisi/, get: (p) => p.currentTitle ?? p.headline },
    { match: /expected\s*salary|gaji|ekspektasi/, get: (p) => (p.expectedSalaryIdr !== undefined ? String(p.expectedSalaryIdr) : undefined) },
  ],
};

export default adapter;
