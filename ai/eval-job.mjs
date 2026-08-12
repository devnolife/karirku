#!/usr/bin/env node
/**
 * ai/eval-job.mjs — Evaluasi lowongan di hunter.db dengan LLM (Ollama lokal).
 *
 * Usage:
 *   node ai/eval-job.mjs <jobId>
 *   node ai/eval-job.mjs --all-new [--limit N]   (default limit 10)
 *
 * Output: laporan markdown di data/ai-reports/<id>-<slug>.md,
 * update kolom jobs.llm_score (1-5), llm_tier, llm_report_path, match_score (0-100).
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chat, config, formatUsage, shutdownLlm } from './lib/llm-client.mjs';
import { profileContext } from './lib/profile.mjs';
import { getDb, getJob, getUnevaluatedJobs, saveEvaluation } from './lib/db.mjs';
import { classifyTier } from './classify-tier.mjs';

const REPORT_DIR = path.resolve(process.cwd(), 'data/ai-reports');
const MAX_JD_CHARS = 12000;

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'job';
}

function buildPrompt(job) {
  const jd = String(job.description || '').slice(0, MAX_JD_CHARS);
  const salary = job.salary_min || job.salary_max
    ? `${job.salary_min ?? '?'} - ${job.salary_max ?? '?'} ${job.currency ?? ''}`
    : 'tidak dicantumkan';
  return [
    {
      role: 'system',
      content: `Kamu adalah evaluator lowongan kerja yang tajam dan jujur untuk kandidat berikut.

${profileContext()}

TUGAS: Evaluasi lowongan terhadap profil kandidat. Balas dalam BAHASA YANG SAMA dengan teks lowongan (Indonesia → Indonesia, Inggris → Inggris).

FORMAT BALASAN (markdown, patuhi persis):
## Ringkasan
(2-3 kalimat: apa perannya, cocok atau tidak, kenapa)

## Skor
SCORE: <angka 1.0-5.0, satu desimal>
FIT: <persentase kecocokan skill 0-100>%

## Kecocokan
- (bullet: skill/pengalaman kandidat yang match dengan requirement)

## Gap
- (bullet: requirement yang TIDAK dimiliki kandidat; tulis "tidak ada gap berarti" jika kosong)

## Red Flags
- (bullet: tanda bahaya — gaji di bawah floor Rp 10jt, lokasi wajib onsite jauh, requirement tidak realistis, indikasi scam/MLM; tulis "tidak ada" jika bersih)

## Gaji
(bandingkan gaji lowongan vs floor Rp 10 juta; beri rekomendasi angka yang diajukan)

## Rekomendasi
VERDICT: <APPLY | SKIP | REVIEW>
(1-2 kalimat alasan)

ATURAN SKOR: 5=sangat cocok+gaji bagus, 4=cocok layak apply, 3=borderline, 2=kurang cocok, 1=jangan. Gaji di bawah floor tanpa ruang nego = maksimal 2. Peran non-engineering (sales/marketing/manager non-teknis) = maksimal 2.`,
    },
    {
      role: 'user',
      content: `LOWONGAN:
Judul: ${job.title}
Perusahaan: ${job.company || 'tidak diketahui'}
Platform: ${job.platform} | Lokasi: ${job.location || '-'} | Remote: ${job.remote ? 'ya' : 'tidak/tak jelas'}
Gaji: ${salary}
URL: ${job.url}

DESKRIPSI:
${jd}`,
    },
  ];
}

function parseScore(text) {
  const m = text.match(/SCORE:\s*([0-9]+(?:\.[0-9]+)?)/i);
  const score = m ? Math.min(5, Math.max(1, parseFloat(m[1]))) : null;
  const v = text.match(/VERDICT:\s*(APPLY|SKIP|REVIEW)/i);
  return { score, verdict: v ? v[1].toUpperCase() : null };
}

async function evaluateJob(job) {
  console.log(`\n[${job.id}] ${job.title} — ${job.company || '?'} (${job.platform})`);
  const output = await chat(buildPrompt(job), { model: config.modelLlm });
  const { score, verdict } = parseScore(output);
  if (score == null) throw new Error('LLM tidak mengembalikan SCORE yang bisa diparse');

  mkdirSync(REPORT_DIR, { recursive: true });
  const reportPath = path.join('data/ai-reports', `${job.id}-${slugify(job.company || job.title)}.md`);
  const header = `# Evaluasi #${job.id} — ${job.title}\n\n- Perusahaan: ${job.company || '?'}\n- URL: ${job.url}\n- Dievaluasi: ${new Date().toISOString()} (model: ${config.modelLlm})\n\n---\n\n`;
  writeFileSync(path.resolve(process.cwd(), reportPath), header + output, 'utf8');

  const tier = classifyTier(job.title);
  saveEvaluation(job.id, { score, tier, reportPath });
  console.log(`  → SCORE ${score} | ${verdict || '?'} | tier ${tier} | ${reportPath}`);
  return { id: job.id, score, verdict };
}

async function main() {
  const args = process.argv.slice(2);
  let jobs;
  if (args.includes('--all-new')) {
    const li = args.indexOf('--limit');
    const limit = li >= 0 ? Number(args[li + 1]) : 10;
    jobs = getUnevaluatedJobs(limit);
    if (!jobs.length) return console.log('Tidak ada job status=new yang belum dievaluasi.');
  } else {
    const id = Number(args[0]);
    if (!id) {
      console.error('Usage: node ai/eval-job.mjs <jobId> | --all-new [--limit N]');
      process.exit(1);
    }
    const job = getJob(id);
    if (!job) throw new Error(`Job ${id} tidak ditemukan`);
    jobs = [job];
  }

  const results = [];
  for (const job of jobs) {
    try {
      results.push(await evaluateJob(job));
    } catch (err) {
      console.error(`  ✗ [${job.id}] gagal: ${err.message}`);
    }
  }
  console.log(`\nSelesai: ${results.length}/${jobs.length} dievaluasi. ${formatUsage()}`);
  getDb().close();
}

main().catch(err => { console.error(err.message); process.exitCode = 1; }).finally(() => shutdownLlm());
