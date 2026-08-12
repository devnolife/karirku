const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(path.join(__dirname, '..', 'data/hunter.db'));
const rows = db.prepare("SELECT id,external_id,title,company,location,salary_min,salary_max,description,url FROM jobs WHERE platform='jobstreet' AND status='new'").all();
const rx = /remote|wfh|work from home|jarak jauh|fullstack remote|Search: fullstack remote/i;
const rem = rows.filter(r => rx.test([r.title, r.location, r.description].join(' ')));
console.log('Remote-indicated:', rem.length, 'dari', rows.length, '\n');
for (const r of rem) {
  const sal = r.salary_min ? ` | ${r.salary_min}-${r.salary_max} jt` : '';
  console.log(`#${r.id} ${r.title} | ${r.company} | ${r.location}${sal}`);
  console.log('   ' + (r.description || '').slice(0, 120));
}
