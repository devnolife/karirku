// Scan JobStreet khusus lowongan REMOTE (worktype=242 remote, 244 hybrid) — simpan saja, tanpa apply.
const { chromium } = require('playwright-core');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const SEARCHES = [
  { label: 'fullstack remote', url: 'https://id.jobstreet.com/id/full-stack-developer-jobs?worktype=242&sortmode=ListedDate' },
  { label: 'backend remote', url: 'https://id.jobstreet.com/id/backend-developer-jobs?worktype=242&sortmode=ListedDate' },
  { label: 'frontend remote', url: 'https://id.jobstreet.com/id/frontend-developer-jobs?worktype=242&sortmode=ListedDate' },
  { label: 'react native remote', url: 'https://id.jobstreet.com/id/react-native-jobs?worktype=242&sortmode=ListedDate' },
  { label: 'golang remote', url: 'https://id.jobstreet.com/id/golang-jobs?worktype=242&sortmode=ListedDate' },
  { label: 'software engineer remote', url: 'https://id.jobstreet.com/id/software-engineer-jobs?worktype=242&sortmode=ListedDate' },
  { label: 'web developer remote', url: 'https://id.jobstreet.com/id/web-developer-jobs?worktype=242&sortmode=ListedDate' },
];

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0] || await ctx.newPage();

  const all = new Map();
  for (const s of SEARCHES) {
    try { await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 60000 }); } catch { console.log(`[${s.label}] goto gagal`); continue; }
    await sleep(6000);
    const rows = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('article, [data-card-type="JobCard"], [data-automation="normalJob"]').forEach(el => {
        const t = el.querySelector('[data-automation="jobTitle"]');
        if (!t) return;
        const q = sel => { const e = el.querySelector(sel); return e ? e.innerText.trim() : ''; };
        const href = t.getAttribute('href') || '';
        const id = (href.match(/\/job\/(\d+)/) || [])[1] || '';
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
    rows.forEach(r => { if (r.id && !all.has(r.id)) all.set(r.id, { ...r, src: s.label, remote: 1 }); });
    await sleep(1500);
  }

  const list = [...all.values()];
  fs.writeFileSync('data/jobstreet-remote-found.json', JSON.stringify(list, null, 1));
  console.log('\nTOTAL UNIK REMOTE:', list.length);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
