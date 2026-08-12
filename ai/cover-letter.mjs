#!/usr/bin/env node
/**
 * ai/cover-letter.mjs — Generate surat lamaran/cover letter per lowongan.
 *
 * Usage:
 *   node ai/cover-letter.mjs <jobId>
 *
 * Sumber gaya: applications/letters/PROFIL-COPY-PASTE.md + fakta AGENTS.md.
 * Output: applications/letters/generated/<id>-<slug>.md
 * Bahasa mengikuti bahasa lowongan.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { chat, config, formatUsage, shutdownLlm } from './lib/llm-client.mjs';
import { loadProfile } from './lib/profile.mjs';
import { getDb, getJob } from './lib/db.mjs';

const OUT_DIR = 'applications/letters/generated';
const MAX_JD_CHARS = 8000;

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'job';
}

async function main() {
  const id = Number(process.argv[2]);
  if (!id) {
    console.error('Usage: node ai/cover-letter.mjs <jobId>');
    process.exit(1);
  }
  const job = getJob(id);
  if (!job) throw new Error(`Job ${id} tidak ditemukan`);

  const profile = loadProfile();
  console.log(`Cover letter untuk [${id}] ${job.title} — ${job.company || '?'} (model: ${config.modelLlm})`);

  const output = await chat([
    {
      role: 'system',
      content: `Kamu menulis cover letter singkat dan meyakinkan atas nama kandidat.

${profile.facts}

=== RESUME (source of truth) ===
${profile.resume}

${profile.profil ? `=== CONTOH GAYA PENULISAN KANDIDAT ===\n${profile.profil.slice(0, 4000)}` : ''}

ATURAN:
1. Tulis dalam BAHASA YANG SAMA dengan teks lowongan.
2. Panjang 180-300 kata. Struktur: pembuka yang spesifik ke perusahaan/peran → 2-3 bukti relevan (proyek nyata dari resume) → penutup call-to-action.
3. DILARANG mengarang pengalaman/skill/angka di luar resume. Hanya link repo publik/live yang boleh disebut; repo private disebut "bisa didemokan".
4. Nada: percaya diri, konkret, tanpa basa-basi klise ("saya adalah pekerja keras") dan tanpa placeholder.
5. Balas HANYA isi surat (markdown), tanpa penjelasan tambahan.`,
    },
    {
      role: 'user',
      content: `LOWONGAN:
Judul: ${job.title}
Perusahaan: ${job.company || '?'}
Lokasi: ${job.location || '-'} | Remote: ${job.remote ? 'ya' : 'tidak/tak jelas'}

DESKRIPSI:
${String(job.description || '(tidak ada deskripsi — tulis berdasarkan judul)').slice(0, MAX_JD_CHARS)}`,
    },
  ], { model: config.modelLlm });

  mkdirSync(path.resolve(OUT_DIR), { recursive: true });
  const outPath = path.join(OUT_DIR, `${id}-${slugify(job.company || job.title)}.md`);
  const header = `<!-- Job #${id}: ${job.title} @ ${job.company || '?'} | ${job.url} | generated ${new Date().toISOString()} -->\n\n`;
  writeFileSync(path.resolve(outPath), header + output.trim() + '\n', 'utf8');
  console.log(`  → ${outPath}\n${formatUsage()}`);
  getDb().close();
}

main().catch(err => { console.error(err.message); process.exitCode = 1; }).finally(() => shutdownLlm());
