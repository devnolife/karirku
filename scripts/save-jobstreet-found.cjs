// Simpan hasil data/jobstreet-found.json ke data/hunter.db (tanpa apply).
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const root = path.join(__dirname, '..');
const db = new DatabaseSync(path.join(root, 'data/hunter.db'));
const file = process.argv[2] || 'data/jobstreet-found.json';
const jobs = require(path.join(root, file));

function parseSalary(s) {
  if (!s) return [null, null];
  const nums = [...s.matchAll(/Rp\s*([\d.]+)/g)].map(m => Math.round(parseInt(m[1].replace(/\./g, ''), 10) / 1e6));
  return [nums[0] ?? null, nums[1] ?? nums[0] ?? null];
}

let ins = 0, dup = 0;
const has = db.prepare("SELECT id FROM jobs WHERE platform='jobstreet' AND external_id=?");
const stmt = db.prepare(`INSERT INTO jobs (platform, external_id, title, company, url, location, remote, salary_min, salary_max, description, status)
  VALUES ('jobstreet', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`);
for (const j of jobs) {
  if (has.get(j.id)) { dup++; continue; }
  const [lo, hi] = parseSalary(j.salary);
  const desc = [j.teaser, j.salary && `Gaji: ${j.salary}`, j.posted && `Posted: ${j.posted}`, `Search: ${j.src}`].filter(Boolean).join(' | ');
  stmt.run(j.id, j.title, j.company, j.href, j.loc, j.remote ? 1 : 0, lo, hi, desc);
  ins++;
}
console.log(`Inserted: ${ins}, duplikat dilewati: ${dup}, total file: ${jobs.length}`);
console.log('Total jobs jobstreet di DB:', db.prepare("SELECT COUNT(*) c FROM jobs WHERE platform='jobstreet'").get().c);
