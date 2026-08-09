const puppeteer = require('puppeteer-core');
const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const RULES = [
  { re: /^immediately$/i, why: 'start date' },
  { re: /^full[- ]?time/i, why: 'engagement' },
  { re: /^actively looking/i, why: 'intent' },
  { re: /^long[- ]?term/i, why: 'engagement' },
];

async function snap(page) {
  return page.evaluate(() => {
    const vis = e => e.offsetParent !== null;
    return {
      url: location.href,
      step: (document.body.innerText.match(/Step (\d) of (\d)/) || []).slice(1).join('/'),
      radios: [...document.querySelectorAll('input[type=radio],input[type=checkbox]')].filter(vis).map(e => {
        const l = e.id ? document.querySelector(`label[for="${CSS.escape(e.id)}"]`) : null;
        let t = l ? l.innerText : '';
        if (!t) { const p = e.closest('label'); if (p) t = p.innerText; }
        return { id: e.id, val: e.value, label: t.replace(/\n/g, ' ').trim().slice(0, 50), checked: e.checked };
      }),
      texts: [...document.querySelectorAll('input[type=text],input[type=number],textarea')].filter(vis).map(e => {
        const l = e.id ? document.querySelector(`label[for="${CSS.escape(e.id)}"]`) : null;
        let near = '';
        if (!l) { let n = e.parentElement; for (let i = 0; i < 4 && n; i++) { const t = (n.innerText || '').split('\n')[0]; if (t && t.length < 55) { near = t; break; } n = n.parentElement; } }
        return { id: e.id, ph: e.placeholder || '', label: (l ? l.innerText : near).trim().slice(0, 45), len: (e.value || '').length };
      }),
      sections: [...document.querySelectorAll('[role="button"]')].filter(vis).map(b => ({ t: (b.innerText || '').split('\n')[0].trim().slice(0, 50), done: /Complete/i.test(b.innerText || '') })),
      btns: [...document.querySelectorAll('button')].filter(vis).map(b => ({ t: (b.innerText || '').trim().slice(0, 28), d: b.disabled })).filter(b => b.t && !/feedback/i.test(b.t)),
      body: document.body.innerText.slice(0, 1000),
    };
  });
}

const clickId = (page, id) => page.evaluate(i => { const e = document.getElementById(i); if (!e) return 'missing'; e.click(); return 'ok'; }, id);
const clickBtn = (page, re) => page.evaluate(r => {
  const b = [...document.querySelectorAll('button')].filter(x => x.offsetParent && !x.disabled).find(x => new RegExp(r, 'i').test((x.innerText || '').trim()));
  if (!b) return 'not found'; b.click(); return 'clicked';
}, re);
const openSection = (page, re) => page.evaluate(r => {
  const b = [...document.querySelectorAll('[role="button"]')].filter(x => x.offsetParent).find(x => new RegExp(r, 'i').test((x.innerText || '').split('\n')[0]));
  if (!b) return 'not found'; b.click(); return 'opened';
}, re);

(async () => {
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: { width: 1400, height: 1200 }, protocolTimeout: 180000 });
  const pages = await browser.pages();
  const page = pages.find(p => /proxify/i.test(p.url())) || pages[0];
  await page.bringToFront();
  const client = await page.createCDPSession();

  for (let round = 0; round < 25; round++) {
    await sleep(3000);
    const s = await snap(page);
    console.log(`\n[${round}] ${s.url.split('/').pop()} step=${s.step}`);
    if (s.sections.length) console.log('  seksi:', JSON.stringify(s.sections.map(x => x.t + (x.done ? '✓' : ''))));

    // 1. jawab radio yang terlihat
    let acted = false;
    for (const r of s.radios) {
      if (r.checked) continue;
      const rule = RULES.find(x => x.re.test(r.label));
      if (rule) { await clickId(page, r.id); console.log('  pilih:', r.label); acted = true; await sleep(1500); break; }
    }
    if (acted) continue;

    // 1b. jawab lewat tombol pilihan (bukan radio)
    const optBtn = s.btns.find(b => /^full[- ]?time/i.test(b.t) && !b.d);
    if (optBtn) {
      console.log('  pilih (tombol):', optBtn.t.replace(/\n/g, ' '), await clickBtn(page, '^Full-time'));
      await sleep(2000);
      const cont = await clickBtn(page, '^Continue');
      if (cont === 'clicked') console.log('  continue');
      await sleep(2500);
      continue;
    }

    // 2. isi rate (EUR/bulan)
    const rate = s.texts.find(t => /rate|monthly|salary|€|eur/i.test(t.label + t.ph) && t.len === 0);
    if (rate) {
      await page.evaluate(i => { const e = document.getElementById(i); if (e) { e.focus(); e.click(); } }, rate.id);
      await sleep(500);
      await client.send('Input.insertText', { text: '3000' });
      await sleep(1500);
      console.log('  rate -> 3000 EUR/bulan');
      const cont = await clickBtn(page, '^Continue');
      if (cont === 'clicked') console.log('  continue');
      await sleep(2500);
      continue;
    }

    // 3. buka seksi yang belum selesai
    const pending = s.sections.find(x => !x.done);
    if (pending && s.radios.length === 0 && s.texts.length === 0) {
      console.log('  buka seksi:', pending.t, await openSection(page, pending.t.slice(0, 25)));
      await sleep(2500);
      continue;
    }

    // 4. next
    const next = s.btns.find(b => /^next|continue|submit|finish/i.test(b.t) && !b.d);
    if (next) { console.log('  next ->', await clickBtn(page, '^' + next.t.split(' ')[0])); await sleep(7000); continue; }

    console.log('  buntu. btns:', JSON.stringify(s.btns.map(b => b.t + (b.d ? '(off)' : ''))));
    console.log('  radios:', JSON.stringify(s.radios.map(r => r.label + (r.checked ? '[X]' : ''))));
    console.log('  texts:', JSON.stringify(s.texts.map(t => (t.label || t.ph) + '(' + t.len + ')')));
    console.log('  body:', s.body.slice(0, 500).replace(/\n+/g, ' | '));
    await page.screenshot({ path: path.join(__dirname, 'proxify-stuck.png'), fullPage: true });
    break;
  }

  await page.screenshot({ path: path.join(__dirname, 'proxify-end.png'), fullPage: true });
  browser.disconnect();
  process.exit(0);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
