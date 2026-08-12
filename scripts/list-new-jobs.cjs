const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(path.join(__dirname, '..', 'data/hunter.db'));
const rows = db.prepare(`SELECT id, external_id, title, company, location, salary_min, salary_max
  FROM jobs WHERE platform='jobstreet' AND status='new' ORDER BY id DESC LIMIT 77`).all();
const rx = /full.?stack|golang|go dev|react|next|node|backend|frontend|software eng|software dev|web dev|mobile|ai engineer|programmer/i;
const good = rows.filter(r => rx.test(r.title));
console.log('Baru tersimpan:', rows.length, '| relevan by title:', good.length, '\n');
for (const r of good) {
  const sal = r.salary_min ? ` | ${r.salary_min}-${r.salary_max} jt` : '';
  console.log(`#${r.id} [${r.external_id}] ${r.title} | ${r.company} | ${r.location}${sal}`);
}
