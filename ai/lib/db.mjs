/**
 * ai/lib/db.mjs — akses data/hunter.db + migrasi kolom AI.
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = process.env.HUNTER_DB || path.resolve(process.cwd(), 'data/hunter.db');

let _db = null;

export function getDb() {
  if (_db) return _db;
  _db = new DatabaseSync(DB_PATH);
  migrate(_db);
  return _db;
}

function migrate(db) {
  const cols = new Set(db.prepare('pragma table_info(jobs)').all().map(c => c.name));
  const add = (name, type) => {
    if (!cols.has(name)) db.exec(`ALTER TABLE jobs ADD COLUMN ${name} ${type}`);
  };
  add('llm_score', 'REAL');
  add('llm_tier', 'TEXT');
  add('llm_report_path', 'TEXT');
  add('llm_evaluated_at', 'TEXT');
}

export function getJob(id) {
  return getDb().prepare('SELECT * FROM jobs WHERE id = ?').get(id);
}

export function getUnevaluatedJobs(limit = 10) {
  return getDb().prepare(`
    SELECT * FROM jobs
    WHERE status = 'new' AND llm_evaluated_at IS NULL
      AND length(coalesce(description, '')) > 100
    ORDER BY found_at DESC LIMIT ?
  `).all(limit);
}

export function saveEvaluation(id, { score, tier, reportPath }) {
  getDb().prepare(`
    UPDATE jobs SET llm_score = ?, llm_tier = ?, llm_report_path = ?,
      llm_evaluated_at = datetime('now'),
      match_score = ?
    WHERE id = ?
  `).run(score, tier, reportPath, Math.round(score * 20), id);
}

/** Insert job hasil intake manual (URL/gambar/teks). Return id baru. */
export function insertJob({ platform = 'intake', externalId = null, title, company = null, url = null, location = null, remote = 0, salaryMin = null, salaryMax = null, currency = null, description }) {
  const res = getDb().prepare(`
    INSERT INTO jobs (platform, external_id, title, company, url, location, remote,
      salary_min, salary_max, currency, description, match_score, status, found_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'new', datetime('now'))
  `).run(platform, externalId ?? `intake-${Date.now()}`, title, company, url ?? `intake://job-${Date.now()}`, location, remote ? 1 : 0, salaryMin, salaryMax, currency, description);
  return Number(res.lastInsertRowid);
}
