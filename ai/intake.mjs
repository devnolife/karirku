#!/usr/bin/env node
/**
 * ai/intake.mjs — Masukkan lowongan dari URL / gambar requirement / teks bebas
 * ke hunter.db, lalu otomatis: eval LLM → tailor CV → cover letter.
 *
 * Usage:
 *   node ai/intake.mjs --url "https://..." [opsi]
 *   node ai/intake.mjs --image path/screenshot.png [opsi]
 *   node ai/intake.mjs --text path/jd.txt [opsi]
 *   Opsi: --title "..." --company "..." --no-docs (skip tailor+cover)
 *
 * Gambar dibaca via vision LLM Ollama (AI_MODEL_LLM harus multimodal, mis. gemma3).
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { chat, config } from './lib/llm-client.mjs';
import { getDb, insertJob } from './lib/db.mjs';

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}
const has = (name) => process.argv.includes(name);

// ── Ekstraksi sumber ────────────────────────────────────────────────

async function fromUrl(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', accept: 'text/html,*/*' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Fetch ${url} → HTTP ${res.status}`);
  const html = await res.text();
  // Strip HTML → teks polos sederhana
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;|&[a-z]+;/gi, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
  if (text.length < 200) throw new Error('Halaman terlalu pendek/kosong — kemungkinan butuh JavaScript. Coba copy-paste teksnya manual (--text).');
  return text.slice(0, 30000);
}

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' };

async function fromImage(imgPath) {
  const ext = path.extname(imgPath).toLowerCase();
  const mime = MIME[ext];
  if (!mime) throw new Error(`Format gambar tidak didukung: ${ext}`);
  const b64 = readFileSync(imgPath).toString('base64');
  return chat([
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Ini screenshot lowongan kerja / job requirement. Transkripsikan SEMUA teks yang terbaca apa adanya (judul, perusahaan, requirement, gaji, lokasi, dst). Balas hanya dengan teks hasil transkripsi, tanpa komentar.' },
        { type: 'image_url', image_url: { url: `data:${mime};base64,${b64}` } },
      ],
    },
  ], { model: config.modelLlm, temperature: 0 });
}

// ── Parse metadata via LLM fast ─────────────────────────────────────

async function parseMeta(text, hint = {}) {
  const fallback = {
    title: hint.title || text.split('\n').find(l => l.trim())?.trim().slice(0, 120) || 'Untitled Job',
    company: hint.company || null,
    location: null, remote: false, salaryMin: null, salaryMax: null, currency: null,
  };
  let out;
  try {
    out = await chat([
      {
        role: 'system',
        content: 'Ekstrak metadata lowongan dari teks. Balas HANYA JSON valid: {"title": string, "company": string|null, "location": string|null, "remote": boolean, "salary_min": number|null, "salary_max": number|null, "currency": string|null}. Gaji dalam angka penuh (mis. 10 juta → 10000000). Jangan mengarang.',
      },
      { role: 'user', content: text.slice(0, 6000) },
    ], { model: config.modelFast, temperature: 0, maxTokens: 512 });
  } catch (err) {
    console.error(`   ⚠ LLM tidak tersedia (${err.message}) — pakai metadata fallback; evaluasi bisa diulang nanti.`);
    return fallback;
  }
  try {
    const json = JSON.parse(out.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
    return {
      title: hint.title || json.title || 'Untitled Job',
      company: hint.company || json.company || null,
      location: json.location || null,
      remote: !!json.remote,
      salaryMin: json.salary_min ?? null,
      salaryMax: json.salary_max ?? null,
      currency: json.currency || null,
    };
  } catch {
    return fallback;
  }
}

function runStep(label, script, jobId) {
  console.log(`\n=== ${label} ===`);
  const r = spawnSync(process.execPath, [script, String(jobId)], { stdio: 'inherit', cwd: process.cwd() });
  if (r.status !== 0) console.error(`  ✗ ${label} gagal (exit ${r.status}) — lanjut.`);
}

async function main() {
  const url = arg('--url');
  const image = arg('--image');
  const textPath = arg('--text');
  if (!url && !image && !textPath) {
    console.error('Usage: node ai/intake.mjs --url <url> | --image <file> | --text <file> [--title t] [--company c] [--no-docs]');
    process.exit(1);
  }

  console.log('1) Ekstraksi deskripsi lowongan...');
  let description;
  if (url) description = await fromUrl(url);
  else if (image) description = await fromImage(image);
  else description = readFileSync(textPath, 'utf8');
  console.log(`   ${description.length} karakter.`);

  console.log('2) Parse metadata (LLM fast)...');
  const meta = await parseMeta(description, { title: arg('--title'), company: arg('--company') });
  console.log(`   ${meta.title} — ${meta.company || '?'} | ${meta.location || '-'} | remote=${meta.remote}`);

  const jobId = insertJob({ ...meta, url: url || null, description });
  console.log(`3) Job tersimpan: id=${jobId}`);
  getDb().close();

  runStep('Evaluasi LLM', 'ai/eval-job.mjs', jobId);
  if (!has('--no-docs')) {
    runStep('Tailor CV', 'ai/tailor-cv.mjs', jobId);
    runStep('Cover letter', 'ai/cover-letter.mjs', jobId);
  }
  console.log(`\nSelesai. Lihat /hunter/jobs (job #${jobId}) atau data/ai-reports/.`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
