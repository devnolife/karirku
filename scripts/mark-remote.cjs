const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(path.join(__dirname, '..', 'data/hunter.db'));
// tandai remote=1 juga untuk yang tadinya duplikat tapi muncul di scan remote
const found = require(path.join(__dirname, '..', 'data/jobstreet-remote-found.json'));
const upd = db.prepare("UPDATE jobs SET remote=1 WHERE platform='jobstreet' AND external_id=?");
for (const j of found) upd.run(j.id);

const rows = db.prepare("SELECT id,title,company,location,salary_min,salary_max,description FROM jobs WHERE platform='jobstreet' AND status='new' AND remote=1 ORDER BY id DESC").all();
console.log('Remote tersimpan (status new):', rows.length, '\n');
const rx = /full.?stack|golang|react|next|node|backend|frontend|software|web dev|mobile|ai/i;
for (const r of rows.filter(r => rx.test(r.title))) {
  const sal = r.salary_min ? ` | ${r.salary_min}-${r.salary_max} jt` : '';
  console.log(`#${r.id} ${r.title} | ${r.company} | ${r.location}${sal}`);
}
