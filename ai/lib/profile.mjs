/**
 * ai/lib/profile.mjs — Profil kandidat sebagai "source of truth" anti-fabrication.
 * Semua klaim di output LLM harus berasal dari berkas-berkas ini.
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const FILES = {
  resume: 'applications/cv/RESUME.md',
  penjelasan: 'applications/cv/penjelasan-diri.txt',
  profil: 'applications/letters/PROFIL-COPY-PASTE.md',
};

function readIfExists(rel) {
  const p = path.resolve(ROOT, rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

/** Fakta keras dari AGENTS.md yang wajib konsisten. */
export const FACTS = `
FAKTA KANDIDAT (WAJIB — jangan menyimpang):
- Nama: Andi Agung Dwi Arya (devnolife), Full-Stack & AI/ML Engineer, Makassar, Indonesia.
- Pengalaman: 5+ tahun ngoding harian sejak 2021. 205+ repo original.
- Pendidikan: S1 (Sarjana). Bahasa: Indonesia + Inggris (menulis mahir).
- Gaji floor: Rp 10 juta/bulan (remote); ikuti batas bawah range lowongan jika lebih tinggi.
- Bukti app store: Saku Sultan (React Native/Expo, fintech) LIVE di Play Store (com.saku_sultan) & App Store (id6444094885). devnolife adalah ENGINEER, bukan founder.
- Backend Go production: go-sakusultan (Gin+pgx, RabbitMQ+Kafka) dan core-llm (Go 1.25, chi v5, LLM/RAG — repo PRIVATE, "bisa didemokan").
- Dashboard live: SAKTI/SINTEKMu — https://simtekmu.teknik.unismuh.ac.id
ATURAN:
- JANGAN overclaim; hanya klaim yang didukung dokumen profil.
- Hanya cantumkan link repo PUBLIK/live; repo private sebut sebagai pengalaman tanpa link.
`.trim();

export function loadProfile() {
  const resume = readIfExists(FILES.resume);
  if (!resume) throw new Error(`Profil tidak ditemukan: ${FILES.resume}`);
  return {
    resume,
    penjelasan: readIfExists(FILES.penjelasan),
    profil: readIfExists(FILES.profil),
    facts: FACTS,
  };
}

/** Konteks ringkas untuk prompt evaluasi (resume + fakta). */
export function profileContext() {
  const p = loadProfile();
  return `${p.facts}\n\n=== RESUME (source of truth) ===\n${p.resume}`;
}
