/**
 * Pengukuran kecocokan skill (job-fit) — deterministik, tanpa DB/AI.
 *
 * Fokus produk CraftWorks: agregasi lowongan + **mengukur** kesiapan kandidat,
 * sementara proses melamar tetap di website asli (lihat Job.sourceUrl). Modul
 * ini menjawab "seberapa siap user dari sisi skill" dan skill apa yang masih
 * kurang (untuk rekomendasi course / skill gap).
 *
 * Ini adalah scorer baseline berbasis *coverage* skill lowongan. Sengaja
 * eksplisit & explainable; nanti bisa dilengkapi semantic similarity berbasis
 * embedding (Job.embedding vector(768)) sebagai composite — bukan pengganti.
 */

/**
 * Alias konservatif satu arah → bentuk kanonik. Hanya untuk varian penulisan
 * yang jelas merujuk teknologi sama. Hindari alias lintas-ekosistem/level
 * (mis. jangan `react → next.js`) atau yang terlalu luas (`ai`, `ml`).
 */
const SKILL_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  reactjs: "react",
  "react.js": "react",
  "react js": "react",
  nextjs: "next.js",
  "next js": "next.js",
  nodejs: "node.js",
  "node js": "node.js",
  node: "node.js",
};

/** Normalisasi dasar + alias → bentuk kanonik untuk perbandingan. */
function canonical(skill: string): string {
  const base = skill.trim().toLowerCase().replace(/\s+/g, " ");
  return SKILL_ALIASES[base] ?? base;
}

export interface SkillMatchResult {
  /** 0-100, persentase skill lowongan yang dimiliki user (coverage). */
  matchPct: number;
  /** Skill lowongan yang dimiliki user — label dari lowongan, urutan dijaga. */
  matched: string[];
  /** Skill lowongan yang belum dimiliki user — untuk skill gap / rekomendasi. */
  missing: string[];
  /** Jumlah skill lowongan unik yang dinilai. `0` = belum ada data skill (bukan "tidak cocok"). */
  total: number;
}

/**
 * Hitung coverage skill kandidat terhadap skill yang diminta lowongan.
 *
 * Denominator memakai skill lowongan unik (setelah normalisasi). `matched` dan
 * `missing` mengembalikan label asli dari `jobSkills` (dedupe, urutan asli)
 * supaya tetap relevan dengan lowongan saat ditampilkan.
 */
export function skillCoverageScore(userSkills: string[], jobSkills: string[]): SkillMatchResult {
  const userSet = new Set(
    userSkills.map((s) => canonical(s)).filter((s) => s.length > 0),
  );

  // Dedupe skill lowongan by kanonik, simpan label asli pertama + urutannya.
  const seen = new Set<string>();
  const jobEntries: { label: string; key: string }[] = [];
  for (const raw of jobSkills) {
    const key = canonical(raw);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    jobEntries.push({ label: raw.trim(), key });
  }

  const matched: string[] = [];
  const missing: string[] = [];
  for (const { label, key } of jobEntries) {
    if (userSet.has(key)) matched.push(label);
    else missing.push(label);
  }

  const total = jobEntries.length;
  const matchPct = total === 0 ? 0 : Math.round((matched.length / total) * 100);

  return { matchPct, matched, missing, total };
}
