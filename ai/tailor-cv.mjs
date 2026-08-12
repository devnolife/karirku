#!/usr/bin/env node
/**
 * ai/tailor-cv.mjs — Tailor CV ATS per lowongan (anti-fabrication).
 *
 * Usage:
 *   node ai/tailor-cv.mjs <jobId> [--no-pdf]
 *
 * Input : JD dari data/hunter.db + applications/cv/resume-ats.html sebagai basis.
 * Output: applications/cv/tailored/<id>-<slug>.html (+ .pdf).
 *
 * Yang boleh diubah LLM: Professional Summary, urutan/penekanan bullet,
 * urutan skill. TIDAK boleh menambah klaim/skill/pengalaman baru di luar
 * RESUME.md, tidak mengubah kontak, tanggal, nama perusahaan, atau struktur/CSS.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { chat, config, formatUsage, shutdownLlm } from './lib/llm-client.mjs';
import { loadProfile } from './lib/profile.mjs';
import { getDb, getJob } from './lib/db.mjs';
import { htmlToPdf } from './lib/pdf.mjs';

const BASE_HTML = 'applications/cv/resume-ats.html';
const OUT_DIR = 'applications/cv/tailored';
const MAX_JD_CHARS = 10000;

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'job';
}

async function main() {
  const args = process.argv.slice(2);
  const id = Number(args[0]);
  if (!id) {
    console.error('Usage: node ai/tailor-cv.mjs <jobId> [--no-pdf]');
    process.exit(1);
  }
  const job = getJob(id);
  if (!job) throw new Error(`Job ${id} tidak ditemukan`);
  if (!job.description) throw new Error(`Job ${id} tidak punya description`);

  const baseHtml = readFileSync(path.resolve(BASE_HTML), 'utf8');
  const profile = loadProfile();

  console.log(`Tailoring CV untuk [${id}] ${job.title} — ${job.company || '?'} (model: ${config.modelLlm})`);

  const output = await chat([
    {
      role: 'system',
      content: `Kamu adalah penulis CV ahli ATS. Tugasmu: menyesuaikan (tailor) CV HTML terhadap satu lowongan.

${profile.facts}

=== RESUME SOURCE OF TRUTH ===
${profile.resume}

ATURAN KERAS:
1. Balas HANYA dengan dokumen HTML lengkap (mulai <!DOCTYPE html>), tanpa penjelasan, tanpa markdown fence.
2. JANGAN mengubah: <style>, struktur heading, kontak, nama perusahaan, jabatan, tanggal.
3. Boleh diubah: teks Professional Summary (fokuskan ke lowongan), urutan & penekanan bullet pengalaman, urutan item Technical Skills, pemilihan proyek yang di-highlight.
4. DILARANG menambah skill/klaim/angka yang tidak ada di resume source of truth di atas.
5. Pertahankan format ATS: satu kolom, tanpa tabel/ikon, tanggal satu baris.
6. Gunakan bahasa yang sama dengan CV asli (Inggris), kecuali lowongan berbahasa Indonesia penuh → boleh Indonesia.`,
    },
    {
      role: 'user',
      content: `LOWONGAN TARGET:
Judul: ${job.title}
Perusahaan: ${job.company || '?'}
Deskripsi:
${String(job.description).slice(0, MAX_JD_CHARS)}

CV HTML BASIS:
${baseHtml}`,
    },
  ], { model: config.modelLlm, maxTokens: 16384 });

  let html = output.trim();
  // buang markdown fence jika model tetap menambahkannya
  html = html.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/, '');
  if (!/^<!DOCTYPE html>/i.test(html)) throw new Error('Output LLM bukan dokumen HTML utuh — batal menyimpan');
  for (const must of ['andiagung193@gmail.com', '+62 851 7107 9607']) {
    if (!html.includes(must)) throw new Error(`Kontak hilang dari hasil tailor (${must}) — batal menyimpan`);
  }

  mkdirSync(path.resolve(OUT_DIR), { recursive: true });
  const base = `${id}-${slugify(job.company || job.title)}`;
  const htmlPath = path.join(OUT_DIR, `${base}.html`);
  writeFileSync(path.resolve(htmlPath), html, 'utf8');
  console.log(`  → ${htmlPath}`);

  if (!args.includes('--no-pdf')) {
    const pdfPath = path.join(OUT_DIR, `${base}.pdf`);
    await htmlToPdf(htmlPath, pdfPath);
    console.log(`  → ${pdfPath}`);
  }
  console.log(formatUsage());
  getDb().close();
}

main().catch(err => { console.error(err.message); process.exitCode = 1; }).finally(() => shutdownLlm());
