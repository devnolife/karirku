// WWR deep scanner — RSS + fetch detail tiap lowongan (apply URL, deskripsi, gaji).
//   node wwr-deep.js
const https = require('https');
const fs = require('fs');
const path = require('path');

const FEEDS = [
  ['full-stack', 'https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss'],
  ['back-end', 'https://weworkremotely.com/categories/remote-back-end-programming-jobs.rss'],
  ['front-end', 'https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss'],
  ['devops', 'https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss'],
  ['all-prog', 'https://weworkremotely.com/categories/remote-programming-jobs.rss'],
];

function get(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 4) {
        const next = res.headers.location.startsWith('http') ? res.headers.location : 'https://weworkremotely.com' + res.headers.location;
        return resolve(get(next, redirects + 1));
      }
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

const tag = (b, n) => {
  const m = b.match(new RegExp(`<${n}[^>]*>([\\s\\S]*?)</${n}>`, 'i'));
  return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
};
const strip = h => h.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|h\d)>/gi, '\n').replace(/<li[^>]*>/gi, '• ')
  .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#\d+;/g, '')
  .replace(/&[a-z]+;/gi, ' ').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

// devnolife stack
const CORE = ['react', 'next.js', 'nextjs', 'node', 'typescript', 'javascript', 'python', 'fastapi',
  'golang', ' go ', 'nestjs', 'express', 'postgres', 'mysql', 'mongodb', 'prisma', 'react native',
  'expo', 'llm', 'rag', 'openai', 'ai agent', 'machine learning', 'rest api', 'graphql', 'docker'];
const NEG = /\b(sales|recruiter|marketing manager|copywriter|customer support|account executive|designer only|\.net\b|c#|ruby on rails|rails\b|php only|wordpress|shopify|salesforce|drupal|magento|scala|elixir|clojure|kotlin android|swift ios only|java enterprise|spring boot)\b/i;
const SENIOR = /\b(senior|sr\.|lead|staff|principal)\b/i;

(async () => {
  const seen = new Map();
  for (const [cat, url] of FEEDS) {
    let xml = '';
    try { xml = await get(url); } catch (e) { console.error('feed fail', cat, e.message); continue; }
    const items = xml.split(/<item>/i).slice(1);
    for (const it of items) {
      const link = tag(it, 'link');
      if (!link || seen.has(link)) continue;
      seen.set(link, {
        cat,
        title: tag(it, 'title'),
        region: tag(it, 'region') || tag(it, 'category') || '',
        type: tag(it, 'type') || '',
        pub: tag(it, 'pubDate'),
        desc: strip(tag(it, 'description')).slice(0, 400),
        link,
      });
    }
    process.stderr.write(`${cat}: ${items.length}\n`);
  }

  const rows = [...seen.values()]
    .filter(j => !NEG.test(j.title))
    .filter(j => /anywhere|worldwide|global|asia|apac/i.test(j.region + ' ' + j.desc) || !j.region);

  process.stderr.write(`\ntotal unik: ${seen.size} | lolos filter awal: ${rows.length}\n`);

  // fetch detail for top candidates
  const scoreQuick = j => {
    const h = (j.title + ' ' + j.desc).toLowerCase();
    return CORE.filter(c => h.includes(c)).length + (SENIOR.test(j.title) ? 2 : 0);
  };
  rows.sort((a, b) => scoreQuick(b) - scoreQuick(a));
  const top = rows.slice(0, 30);

  const out = [];
  for (const j of top) {
    let html = '';
    try { html = await get(j.link); } catch (e) { }
    const body = strip(html);
    const applyMatch = html.match(/href="(https?:\/\/[^"]*(?:apply|greenhouse|lever|workable|ashby|breezy|recruitee|smartrecruiters|jobs\.|careers)[^"]*)"/i);
    const salary = (body.match(/\$\s?[\d,]{3,}\s*[-–—to]{1,3}\s*\$?\s?[\d,]{3,}/i) || body.match(/\$[\d,]{4,}\s*(?:\/|per\s)?(?:yr|year|annually|month|mo)/i) || [])[0] || '';
    const hay = (j.title + ' ' + body).toLowerCase();
    const matched = CORE.filter(c => hay.includes(c));
    let score = matched.length * 4;
    if (SENIOR.test(j.title)) score += 8;
    if (/anywhere in the world|worldwide/i.test(j.region)) score += 12;
    if (/\bgo\b|golang/.test(hay) && /react|next/.test(hay)) score += 6;
    if (/llm|rag|ai agent|openai/.test(hay)) score += 8;
    if (/contract|freelance/i.test(j.type)) score += 2;
    if (NEG.test(body.slice(0, 3000))) score -= 10;
    out.push({ ...j, score, matched: matched.slice(0, 12), salary, applyUrl: applyMatch ? applyMatch[1] : '', bodyLen: body.length, body: body.slice(0, 2600) });
    process.stderr.write('.');
  }
  process.stderr.write('\n');

  out.sort((a, b) => b.score - a.score);
  fs.writeFileSync(path.join(__dirname, 'wwr.json'), JSON.stringify(out, null, 1));

  out.slice(0, 14).forEach((j, i) => {
    console.log(`\n${'='.repeat(84)}`);
    console.log(`${i + 1}. [skor ${j.score}] ${j.title}`);
    console.log(`   ${j.region} | ${j.type} | ${j.cat}${j.salary ? ' | GAJI: ' + j.salary : ''}`);
    console.log(`   Stack cocok: ${j.matched.join(', ')}`);
    console.log(`   ${j.link}`);
    if (j.applyUrl) console.log(`   APPLY: ${j.applyUrl.slice(0, 110)}`);
  });
  console.log(`\n\nDetail lengkap tersimpan di wwr.json (${out.length} lowongan)`);
})();
