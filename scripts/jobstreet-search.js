const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const SEARCHES = [
  { label: 'fullstack remote', url: 'https://id.jobstreet.com/id/full-stack-developer-jobs?worktype=244%2C242&sortmode=ListedDate' },
  { label: 'ai engineer', url: 'https://id.jobstreet.com/id/ai-engineer-jobs?sortmode=ListedDate' },
  { label: 'react native', url: 'https://id.jobstreet.com/id/react-native-jobs?sortmode=ListedDate' },
  { label: 'golang', url: 'https://id.jobstreet.com/id/golang-jobs?sortmode=ListedDate' },
  { label: 'nextjs', url: 'https://id.jobstreet.com/id/next-js-jobs?sortmode=ListedDate' },
  { label: 'remote developer', url: 'https://id.jobstreet.com/id/jobs?keywords=developer%20remote&sortmode=ListedDate' },
];

async function scrape(page, s) {
  try { await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 60000 }); } catch (e) { return []; }
  await sleep(8000);
  return page.evaluate(() => {
    const out = [];
    document.querySelectorAll('article, [data-card-type="JobCard"], [data-automation="normalJob"]').forEach(el => {
      const t = el.querySelector('[data-automation="jobTitle"]');
      const c = el.querySelector('[data-automation="jobCompany"]');
      const loc = el.querySelector('[data-automation="jobCardLocation"]');
      const sal = el.querySelector('[data-automation="jobSalary"]');
      const date = el.querySelector('[data-automation="jobListingDate"]');
      const teaser = el.querySelector('[data-automation="jobShortDescription"]');
      if (!t) return;
      const href = t.getAttribute('href') || '';
      const id = (href.match(/\/job\/(\d+)/) || href.match(/jobId=(\d+)/) || [])[1] || '';
      out.push({
        id,
        title: t.innerText.trim(),
        company: c ? c.innerText.trim() : '',
        loc: loc ? loc.innerText.trim() : '',
        salary: sal ? sal.innerText.trim() : '',
        posted: date ? date.innerText.trim() : '',
        teaser: teaser ? teaser.innerText.trim().slice(0, 130) : '',
        href: href.startsWith('http') ? href : 'https://id.jobstreet.com' + href,
      });
    });
    return out;
  });
}

(async () => {
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null, protocolTimeout: 120000 });
  const pages = await browser.pages();
  const page = pages.find(p => /jobstreet/i.test(p.url())) || pages[0];
  await page.bringToFront();

  const all = new Map();
  for (const s of SEARCHES) {
    const rows = await scrape(page, s);
    console.log(`[${s.label}] ${rows.length} hasil`);
    rows.forEach(r => { if (r.id && !all.has(r.id)) all.set(r.id, { ...r, src: s.label }); });
    await sleep(1500);
  }

  const list = [...all.values()];
  fs.writeFileSync(path.join(__dirname, 'found.json'), JSON.stringify(list, null, 1));
  console.log('\nTOTAL UNIK:', list.length);

  browser.disconnect();
  process.exit(0);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
