// hunter/db.js — SQLite data layer for the Hunter job-automation engine.
// CommonJS so every module runs directly via `node` without a build step.
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = process.env.HUNTER_DB || path.join(DATA_DIR, "hunter.db");

let db;

function getDb() {
  if (db) return db;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  migrate(db);
  return db;
}

function migrate(db) {
  db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL UNIQUE,          -- freelancer | upwork | linkedin | jobstreet | gmail
    username TEXT,
    email TEXT,
    profile_url TEXT,
    can_auto_apply INTEGER NOT NULL DEFAULT 0,
    login_status TEXT NOT NULL DEFAULT 'unknown',  -- ok | expired | unknown
    last_checked TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    external_id TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT,
    url TEXT NOT NULL,
    location TEXT,
    remote INTEGER NOT NULL DEFAULT 0,
    salary_min INTEGER,                     -- juta IDR (or USD for freelancer, see currency)
    salary_max INTEGER,
    currency TEXT DEFAULT 'IDR',
    description TEXT,
    match_score INTEGER NOT NULL DEFAULT 0, -- 0..100
    status TEXT NOT NULL DEFAULT 'new',     -- new | queued | applied | skipped | expired
    skip_reason TEXT,
    found_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(platform, external_id)
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER REFERENCES jobs(id),
    platform TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT,
    url TEXT,
    channel TEXT NOT NULL DEFAULT 'auto',   -- auto | manual | imported
    applied_at TEXT NOT NULL DEFAULT (datetime('now')),
    salary_offered TEXT,
    cover_letter TEXT,
    reply_status TEXT NOT NULL DEFAULT 'silent', -- silent | replied | interview | rejected | offer
    last_reply_at TEXT,
    last_reply_snippet TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gmail_id TEXT NOT NULL UNIQUE,
    thread_id TEXT,
    from_addr TEXT,
    subject TEXT,
    snippet TEXT,
    received_at TEXT,
    application_id INTEGER REFERENCES applications(id),
    classification TEXT                      -- reply | interview | rejected | offer | other
  );

  CREATE TABLE IF NOT EXISTS runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,                      -- scan | apply | sync-email | full
    platform TEXT,
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    finished_at TEXT,
    ok INTEGER,
    stats_json TEXT,
    log TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  `);

  // seed accounts (idempotent)
  const seed = db.prepare(`INSERT OR IGNORE INTO accounts (platform, username, email, profile_url, can_auto_apply, notes) VALUES (?,?,?,?,?,?)`);
  seed.run("freelancer", "devnolife", "andi_agung@student.unismuh.ac.id", "https://www.freelancer.co.id/u/devnolife", 1, "Bid via REST API (cookie GETAFREE uid;hash). 5+ bid aktif.");
  seed.run("jobstreet", "Andi Agung", "andi_agung@student.unismuh.ac.id", "https://id.jobstreet.com/id/profile/me", 1, "Quick Apply terbukti otomatis. Salary >= minimum lowongan.");
  seed.run("upwork", "lawcode", "andi_agung@student.unismuh.ac.id", "https://www.upwork.com/freelancers/~015f17cc227ea29874", 0, "Scan saja: apply butuh Connects + identity verification.");
  seed.run("linkedin", "andi-agung-63522b224", "andi_agung@student.unismuh.ac.id", "https://www.linkedin.com/in/andi-agung-63522b224/", 0, "Scan saja: Easy Apply diblokir untuk otomasi.");
  seed.run("gmail", "andi_agung", "andi_agung@student.unismuh.ac.id", null, 0, "Sumber email tracker (Gmail API OAuth, scope readonly).");

  // default settings (idempotent)
  const st = db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?,?)`);
  st.run("apply_mode", "manual");            // manual | auto
  st.run("salary_floor_juta", "10");         // jangan tawar di bawah ini bila minimum tak tercantum
  st.run("match_threshold", "60");           // skor minimum untuk auto-apply
  st.run("keywords", JSON.stringify(["full stack","react","next.js","react native","node","typescript","python","fastapi","mobile","frontend","backend","javascript","ai","llm"]));
  st.run("avoid_keywords", JSON.stringify(["wordpress","shopify","salesforce","magento",".net","c#","c++","angular","java ","kotlin","flutter only","unity","devops only"]));

  // idempotent column additions (SQLite has no IF NOT EXISTS for columns)
  const jobCols = db.prepare(`PRAGMA table_info(jobs)`).all().map((c) => c.name);
  if (!jobCols.includes("image_path")) {
    db.exec(`ALTER TABLE jobs ADD COLUMN image_path TEXT`); // screenshot for manually added jobs
  }

  // operator profile (data diri) — single JSON doc consumed by the apply engine / LLM
  st.run("profile", JSON.stringify({
    full_name: "Andi Agung Dwi Arya",
    headline: "Full-Stack & AI/ML Engineer",
    email: "andi_agung@student.unismuh.ac.id",
    phone: "",
    location: "Makassar, Indonesia",
    birth_date: "",
    links: {
      github: "https://github.com/devnolife",
      linkedin: "https://www.linkedin.com/in/andi-agung-63522b224/",
      portfolio: "",
      jobstreet: "https://id.jobstreet.com/id/profile/me",
    },
    summary: "Full-Stack & AI/ML Engineer, 5+ tahun ngoding harian sejak 2021, 205+ repo original. Flagship: Saku Sultan (e-wallet React Native/Expo, live di App Store & Play Store).",
    education: { degree: "S1 (Sarjana)", institution: "Universitas Muhammadiyah Makassar", field: "Informatika", grad_year: "" },
    years_experience_total: 5,
    years_experience_mobile: 4,
    skills: ["react", "next.js", "react native", "expo", "node", "typescript", "python", "fastapi", "go", "postgresql", "llm", "rag"],
    flagship_projects: [
      { name: "Saku Sultan", url: "https://play.google.com/store/apps/details?id=com.saku_sultan", note: "E-wallet RN/Expo, live App Store + Play Store" },
      { name: "SINTEKMu", url: "https://simtekmu.teknik.unismuh.ac.id", note: "Dashboard enterprise Next.js" },
      { name: "fokusngajar.id", url: "https://fokusngajar.id", note: "Produk LLM production (backend Go)" },
    ],
    screening: {
      salary_floor_juta: 10,
      english_level: "menulis dengan mahir",
      languages: ["Indonesia", "Inggris"],
      remote_preference: "remote",
    },
  }));
}

// ---- helpers -------------------------------------------------------------
function upsertJob(j) {
  const d = getDb();
  const existed = d.prepare(`SELECT 1 FROM jobs WHERE platform=? AND external_id=?`).get(j.platform, j.external_id);
  const ins = d.prepare(`INSERT INTO jobs (platform, external_id, title, company, url, location, remote, salary_min, salary_max, currency, description, match_score)
    VALUES (@platform,@external_id,@title,@company,@url,@location,@remote,@salary_min,@salary_max,@currency,@description,@match_score)
    ON CONFLICT(platform, external_id) DO UPDATE SET
      title=excluded.title, company=COALESCE(excluded.company, jobs.company),
      salary_min=COALESCE(excluded.salary_min, jobs.salary_min),
      salary_max=COALESCE(excluded.salary_max, jobs.salary_max),
      match_score=MAX(jobs.match_score, excluded.match_score)`);
  ins.run({
    company: null, location: null, remote: 0, salary_min: null, salary_max: null,
    currency: "IDR", description: null, match_score: 0, ...j,
  });
  const row = d.prepare(`SELECT * FROM jobs WHERE platform=? AND external_id=?`).get(j.platform, j.external_id);
  row._isNew = !existed;
  return row;
}

function recordApplication(a) {
  const d = getDb();
  const r = d.prepare(`INSERT INTO applications (job_id, platform, title, company, url, channel, salary_offered, cover_letter, notes)
    VALUES (@job_id,@platform,@title,@company,@url,@channel,@salary_offered,@cover_letter,@notes)`).run({
      job_id: null, company: null, url: null, channel: "auto",
      salary_offered: null, cover_letter: null, notes: null, ...a,
    });
  if (a.job_id) d.prepare(`UPDATE jobs SET status='applied' WHERE id=?`).run(a.job_id);
  return r.lastInsertRowid;
}

function startRun(type, platform) {
  const d = getDb();
  const r = d.prepare(`INSERT INTO runs (type, platform) VALUES (?,?)`).run(type, platform || null);
  return r.lastInsertRowid;
}

function finishRun(id, ok, stats, log) {
  getDb().prepare(`UPDATE runs SET finished_at=datetime('now'), ok=?, stats_json=?, log=? WHERE id=?`)
    .run(ok ? 1 : 0, JSON.stringify(stats || {}), (log || "").slice(0, 8000), id);
}

function getSetting(key, fallback) {
  const row = getDb().prepare(`SELECT value FROM settings WHERE key=?`).get(key);
  return row ? row.value : fallback;
}

function setSetting(key, value) {
  getDb().prepare(`INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run(key, String(value));
}

module.exports = { getDb, DB_PATH, upsertJob, recordApplication, startRun, finishRun, getSetting, setSetting };
