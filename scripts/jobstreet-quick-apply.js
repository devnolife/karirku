const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const RULES = [
  { re: /gaji bulanan yang kamu inginkan/i, key: 'SALARY' },
  { re: /kualifikasi mana yang kamu miliki/i, val: 'Sarjana (S1)' },
  { re: /hak(mu)? bekerja di Indonesia/i, pick: o => o.find(x => /warga negara indonesia|indonesian citizen|WNI/i.test(x)) },
  { re: /as an? Full[ -]?Stack.*(Developer|Engineer)|as a Fullstack/i, val: 'More than 5 years' },
  { re: /as an? Back[ -]?end.*(Developer|Engineer)|as a Backend/i, val: 'More than 5 years' },
  { re: /as an? Front[ -]?end.*(Developer|Engineer)/i, val: 'More than 5 years' },
  { re: /as an? Software (Developer|Engineer)/i, val: 'More than 5 years' },
  { re: /as an API Developer/i, val: '5 years' },
  { re: /as a Golang Backend Engineer/i, val: '2 years' },
  { re: /Mobile App (Developer|Engineer)|as an? Mobile (Developer|Engineer)|React Native/i, val: '4 years' },
  { re: /pengembangan software|software development/i, pick: o => o.find(x => /lebih dari 5|more than 5/i.test(x)) },
  { re: /query SQL/i, val: '5 tahun' },
  { re: /manajemen proyek|project management/i, val: '2 tahun' },
  { re: /agile/i, pick: o => o.find(x => /^ya$|^yes$/i.test(x)) },
  { re: /bahasa inggris|english/i, pick: o => o.find(x => /mahir|fluent|advanced/i.test(x)) },
];

async function click(page, re) {
  await page.evaluate(r => {
    const b = [...document.querySelectorAll('button')].find(x => new RegExp(r, 'i').test((x.innerText || '').trim()));
    if (b) b.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, re.source);
  await sleep(1500);
  const p = await page.evaluate(r => {
    const b = [...document.querySelectorAll('button')].find(x => new RegExp(r, 'i').test((x.innerText || '').trim()));
    if (!b || b.disabled) return null;
    const q = b.getBoundingClientRect();
    return { x: q.x + q.width / 2, y: q.y + q.height / 2, t: b.innerText.trim().slice(0, 20) };
  }, re.source);
  if (!p) return null;
  await page.mouse.move(p.x, p.y, { steps: 5 });
  await sleep(300);
  await page.mouse.down(); await sleep(90); await page.mouse.up();
  return p.t;
}

(async () => {
  const job = JSON.parse(fs.readFileSync(path.join(__dirname, 'job-reddog.json'), 'utf8'));
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null, protocolTimeout: 240000 });
  const pages = await browser.pages();
  const page = pages.find(p => /jobstreet/i.test(p.url())) || pages[0];
  await page.bringToFront();

  // start fresh from apply URL
  try { await page.goto(job.applyUrl, { waitUntil: 'domcontentloaded', timeout: 90000 }); } catch (e) {}
  await sleep(12000);
  console.log('url:', page.url());

  const ta = await page.$('textarea');
  if (!ta) {
    const txt = await page.evaluate(() => document.body.innerText.slice(0, 400));
    console.log('tidak ada textarea. Halaman:\n' + txt);
    browser.disconnect(); process.exit(2);
  }

  // pilih tulis surat lamaran
  await page.evaluate(() => { const r = document.querySelector('input[name="coverLetter-method"][value="change"]'); if (r && !r.checked) r.click(); });
  await sleep(3000);

  await page.click('textarea');
  await sleep(400);
  await page.keyboard.down('Control'); await page.keyboard.press('KeyA'); await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await sleep(1200);
  const cleared = await page.$eval('textarea', e => e.value.length);
  console.log('cleared ->', cleared);
  if (cleared !== 0) { console.log('gagal clear'); browser.disconnect(); process.exit(3); }

  const client = await page.createCDPSession();
  await client.send('Input.insertText', { text: job.cover });
  await sleep(2000);
  const st = await page.$eval('textarea', e => ({ len: e.value.length, dup: e.value.split('Kepada Tim Rekrutmen').length - 1 }));
  console.log('cover:', JSON.stringify(st));
  if (st.dup !== 1 || st.len < 500) { console.log('cover bermasalah'); browser.disconnect(); process.exit(3); }

  for (let step = 0; step < 6; step++) {
    const s = await page.evaluate(() => ({ sel: document.querySelectorAll('select').length, rev: /kirim lamaran/i.test(document.body.innerText), title: document.title }));
    console.log(`[${step}] ${s.title} | selects:${s.sel} review:${s.rev}`);

    if (s.rev) {
      const r = await page.evaluate(() => {
        const t = document.body.innerText;
        return { cover: /Kamu menulis surat lamaran/i.test(t), q: (t.match(/Anda menjawab (\d+) dari (\d+)/) || []).slice(1).join('/'), creds: (t.match(/(\d+) kredensial/) || [])[1] };
      });
      console.log('  REVIEW:', JSON.stringify(r));
      if (!r.cover) { console.log('  STOP: cover hilang'); break; }
      if (r.q && r.q.split('/')[0] !== r.q.split('/')[1]) { console.log('  STOP: pertanyaan kurang'); break; }
      console.log('  KIRIM ->', await click(page, /kirim lamaran/));
      await sleep(16000);
      const d = await page.evaluate(() => ({ url: location.href, ok: /Lamaranmu telah dikirim/i.test(document.body.innerText) || /apply\/success/.test(location.href) }));
      console.log('  HASIL:', d.ok ? 'TERKIRIM ✓' : 'GAGAL', d.url.slice(0, 85));
      browser.disconnect();
      process.exit(d.ok ? 0 : 1);
    }

    if (s.sel > 0) {
      const info = await page.evaluate(() => [...document.querySelectorAll('select')].map(x => {
        const l = x.id ? document.querySelector(`label[for="${x.id}"]`) : null;
        return { id: x.id, q: l ? l.innerText.trim() : '', opts: [...x.options].map(o => ({ t: o.text, v: o.value })) };
      }));
      let bad = false;
      for (const q of info) {
        const texts = q.opts.map(o => o.t);
        const rule = RULES.find(r => r.re.test(q.q));
        let want = null;
        if (rule) {
          if (rule.key === 'SALARY') want = job.salary;
          else if (rule.val) want = texts.find(t => t === rule.val);
          else if (rule.pick) want = rule.pick(texts);
        }
        const opt = want ? q.opts.find(o => o.t === want) : null;
        if (!opt) { console.log('  UNMATCHED:', q.q.slice(0, 58), JSON.stringify(texts.slice(0, 9))); bad = true; continue; }
        await page.evaluate((id, v) => {
          const el = document.getElementById(id);
          Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set.call(el, v);
          el.dispatchEvent(new Event('change', { bubbles: true }));
          el.dispatchEvent(new Event('blur', { bubbles: true }));
        }, q.id, opt.v);
        console.log('  Q:', q.q.slice(0, 50), '=>', want);
        await sleep(700);
      }
      if (bad) { console.log('  STOP'); break; }
    }

    const c = await click(page, /^lanjut/);
    console.log('  lanjut ->', c);
    if (!c) break;
    await sleep(11000);
  }

  browser.disconnect();
  process.exit(1);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
