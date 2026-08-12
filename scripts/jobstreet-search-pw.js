const { chromium } = require('playwright-core');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const SEARCHES = [
  { label: 'fullstack', url: 'https://id.jobstreet.com/id/full-stack-developer-jobs?sortmode=ListedDate' },
  { label: 'fullstack remote', url: 'https://id.jobstreet.com/id/full-stack-developer-jobs?worktype=244%2C242&sortmode=ListedDate' },
  { label: 'react native', url: 'https://id.jobstreet.com/id/react-native-jobs?sortmode=ListedDate' },
  { label: 'golang', url: 'https://id.jobstreet.com/id/golang-jobs?sortmode=ListedDate' },
  { label: 'nextjs', url: 'https://id.jobstreet.com/id/next-js-jobs?sortmode=ListedDate' },
  { label: 'ai engineer', url: 'https://id.jobstreet.com/id/ai-engineer-jobs?sortmode=ListedDate' },
];

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0] || await ctx.newPage();

  const all = new Map();
  for (const s of SEARCHES) {
    try { await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 60000 }); } catch { console.log(`[${s.label}] goto gagal`); continue; }
    await sleep(7000);
    const rows = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('article, [data-card-type="JobCard"], [data-automation="normalJob"]').forEach(el => {
        const t = el.querySelector('[data-automation="jobTitle"]');
        if (!t) return;
        const q = sel => { const e = el.querySelector(sel); return e ? e.innerText.trim() : ''; };
        const href = t.getAttribute('href') || '';
        const id = (href.match(/\/job\/(\d+)/) || href.match(/jobId=(\d+)/) || [])[1] || '';
        out.push({
          id, title: t.innerText.trim(),
          company: q('[data-automation="jobCompany"]'),
          loc: q('[data-automation="jobCardLocation"]'),
          salary: q('[data-automation="jobSalary"]'),
          posted: q('[data-automation="jobListingDate"]'),
          teaser: q('[data-automation="jobShortDescription"]').slice(0, 130),
          href: href.startsWith('http') ? href : 'https://id.jobstreet.com' + href,
        });
      });
      return out;
    });
    console.log(`[${s.label}] ${rows.length} hasil`);
    rows.forEach(r => { if (r.id && !all.has(r.id)) all.set(r.id, { ...r, src: s.label }); });
    await sleep(1500);
  }

  const list = [...all.values()];
  fs.writeFileSync('data/jobstreet-found.json', JSON.stringify(list, null, 1));
  console.log('\nTOTAL UNIK:', list.length);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
