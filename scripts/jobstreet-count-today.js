const puppeteer = require('puppeteer-core');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null, protocolTimeout: 120000 });
  const pages = await browser.pages();
  const page = pages.find(p => /jobstreet/i.test(p.url())) || pages[0];
  await page.bringToFront();
  try { await page.goto('https://id.jobstreet.com/id/my-activity/applied-jobs', { waitUntil: 'domcontentloaded', timeout: 60000 }); } catch (e) {}
  await sleep(11000);
  for (let i = 0; i < 4; i++) { await page.evaluate(() => window.scrollBy(0, 1800)); await sleep(800); }

  const rows = await page.evaluate(() => {
    const t = document.body.innerText;
    const blocks = t.split('Posisi Pekerjaan').slice(1);
    return blocks.map(b => {
      const L = b.split('\n').map(s => s.trim()).filter(Boolean);
      const title = L[0] || '';
      const ci = L.indexOf('Perusahaan');
      const company = ci >= 0 ? (L[ci + 1] || '') : '';
      const dateLine = L.find(x => /^\d{1,2} \w{3} \d{4}$/.test(x)) || '';
      const salary = L.find(x => /Rp ?[\d.,]/.test(x)) || '';
      const status = L.find(x => /Dilamar di Jobstreet|Dilihat oleh perusahaan|Telah membuka situs|Kemungkinan tidak dilanjutkan/i.test(x)) || '';
      return { title, company, date: dateLine, salary, status };
    });
  });

  const today = rows.filter(r => /3 Agu 2026/.test(r.date));
  console.log('=== DILAMAR HARI INI (3 Agu 2026) di JobStreet ===');
  today.forEach((r, i) => console.log(`${i + 1}. ${r.title}\n   ${r.company} | ${r.salary || 'gaji tidak ditampilkan'} | ${r.status}`));
  console.log('\nJUMLAH JOBSTREET HARI INI:', today.length);
  console.log('TOTAL SEMUA LAMARAN DI RIWAYAT:', rows.length);

  browser.disconnect();
  process.exit(0);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
