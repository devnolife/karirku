const puppeteer = require('puppeteer-core');
const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const HIGHLIGHTS = `Full-Stack & AI/ML Engineer with 5+ years shipping production software across 205+ original repositories.

Saku Sultan - fintech e-wallet and bill-payment app I built and shipped to both Google Play and the App Store (10,000+ installs, 4.7 rating). React Native/Expo mobile app, NestJS backend later ported to Go (Gin + pgx) with RabbitMQ job queues and Kafka transaction event streams, real-time ledger on PostgreSQL, plus the admin dashboard. Handled EAS build/submit and passed both Apple and Google review.

SINTEKMu - faculty information system running in production at simtekmu.teknik.unismuh.ac.id. Next.js, TypeScript, Prisma and PostgreSQL with six role levels, RBAC, approval workflows and reporting. 580+ commits over more than a year, still maintained.

core-llm - production Go 1.25 backend (chi v5) powering fokusngajar.id: LLM/RAG pipeline with PDF ingestion, chunking, embeddings and retrieval, rate limiting, metrics and Docker multi-stage builds.

PemiluDigital - end-to-end election platform for a regional legislative body: real-time vote tallying, role-based access and a full audit trail.

I use AI development tools (GitHub Copilot, Copilot CLI) daily for coding, debugging and technical documentation, always reviewing and taking full ownership of the output. Comfortable working remote and async with documented written communication. GitHub: github.com/devnolife`;

const vis = `el => el.offsetParent !== null && el.getBoundingClientRect().width > 0`;

async function read(page) {
  return page.evaluate(() => {
    const vis = el => el.offsetParent !== null && el.getBoundingClientRect().width > 0;
    const big = [...document.querySelectorAll('h1,h2')].filter(vis).map(h => h.innerText.trim()).filter(Boolean);
    const opts = [];
    document.querySelectorAll('input[type=radio],input[type=checkbox]').forEach(el => {
      if (!vis(el)) return;
      const r = el.getBoundingClientRect();
      if (r.top > 1000) return;
      let lbl = '';
      const l = el.closest('label');
      if (l) lbl = l.innerText;
      if (!lbl) { let n = el.parentElement; for (let i = 0; i < 4 && n; i++) { const t = (n.innerText || '').trim(); if (t && t.length < 120) { lbl = t; break; } n = n.parentElement; } }
      opts.push({ label: lbl.replace(/\n/g, ' · ').trim().slice(0, 70), checked: el.checked, x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) });
    });
    const texts = [...document.querySelectorAll('input[type=text],input[type=email],input[type=number],textarea')].filter(vis)
      .map(e => { const r = e.getBoundingClientRect(); return { tag: e.tagName, ph: e.placeholder || '', name: e.name, len: (e.value || '').length, x: Math.round(r.x + 30), y: Math.round(r.y + r.height / 2) }; });
    const combos = [...document.querySelectorAll('[role="combobox"],.MuiSelect-select')].filter(vis)
      .map(c => { const r = c.getBoundingClientRect(); return { t: (c.innerText || '').trim().slice(0, 40), x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; });
    const btns = [...document.querySelectorAll('button')].filter(vis).map(b => { const r = b.getBoundingClientRect(); return { t: (b.innerText || '').trim(), disabled: b.disabled, x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; }).filter(b => b.t && !/feedback/i.test(b.t));
    return { url: location.href, active: big[0] || '', opts, texts, combos, btns };
  });
}

async function tap(page, x, y, wait = 1300) {
  await page.mouse.move(x, y, { steps: 4 });
  await sleep(220);
  await page.mouse.down(); await sleep(80); await page.mouse.up();
  await sleep(wait);
}

async function pickCombo(page, comboText, wantRe) {
  const c = (await read(page)).combos.find(x => new RegExp(comboText, 'i').test(x.t));
  if (!c) return 'no combo';
  await tap(page, c.x, c.y, 2200);
  const items = await page.evaluate(() => [...document.querySelectorAll('li,[role="option"]')].filter(o => o.offsetParent !== null)
    .map(o => { const r = o.getBoundingClientRect(); return { t: o.innerText.trim().slice(0, 40), x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; }).filter(o => o.t));
  const m = items.find(i => wantRe.test(i.t));
  if (!m) return 'no option in ' + JSON.stringify(items.map(i => i.t));
  await tap(page, m.x, m.y, 1800);
  return 'picked ' + m.t;
}

function choose(opts) {
  const has = re => opts.filter(o => re.test(o.label));
  if (has(/^full-time/i).length && has(/part-time/i).length) return has(/^full-time/i).slice(0, 1);
  if (has(/full[- ]?stack web developer/i).length) return has(/full[- ]?stack web developer/i).slice(0, 1);
  const y = has(/\b2021\b/);
  if (y.length && has(/\b20(1[5-9]|2[0-6])\b/).length >= 3) return y.slice(0, 1);
  if (has(/upper[- ]?intermediate/i).length) return has(/upper[- ]?intermediate/i).slice(0, 1);
  if (has(/^advanced|^fluent|^c1\b|^c2\b/i).length) return has(/^advanced|^fluent|^c1\b|^c2\b/i).slice(0, 1);
  const techWants = [/^react$/i, /^react\.?js/i, /next/i, /^node/i, /typescript/i, /^go$|golang/i, /python/i, /postgres/i, /react native/i];
  const hits = [];
  for (const w of techWants) { const m = opts.find(o => w.test(o.label) && !hits.includes(o)); if (m) hits.push(m); }
  if (hits.length >= 3) return hits.slice(0, 8);
  return [];
}

(async () => {
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: { width: 1400, height: 1000 }, protocolTimeout: 180000 });
  const pages = await browser.pages();
  const page = pages.find(p => /me\.lemon\.io/i.test(p.url())) || pages[0];
  await page.bringToFront();

  for (let step = 0; step < 14; step++) {
    await sleep(2500);
    let s = await read(page);
    const stepName = s.url.split('=').pop();
    console.log(`\n[${step}] ${stepName}`);
    if (s.opts.length) console.log('  opsi:', JSON.stringify(s.opts.map(o => o.label + (o.checked ? '[X]' : ''))));
    if (s.combos.length) console.log('  combo:', JSON.stringify(s.combos.map(c => c.t)));
    if (s.texts.length) console.log('  input:', JSON.stringify(s.texts.map(t => `${t.tag}:${t.ph || t.name}(${t.len})`)));

    if (/registration|sign ?up/i.test(stepName) || s.texts.some(t => /email|password/i.test(t.ph + t.name))) {
      console.log('  >> STEP REGISTRASI — berhenti.');
      await page.screenshot({ path: path.join(__dirname, 'lemon-reg.png'), fullPage: true });
      break;
    }

    // textarea (highlights)
    const ta = s.texts.find(t => t.tag === 'TEXTAREA');
    if (ta && ta.len < 50) {
      await tap(page, ta.x, ta.y, 600);
      const cl = await page.createCDPSession();
      await cl.send('Input.insertText', { text: HIGHLIGHTS });
      await sleep(1800);
      const n = await page.evaluate(() => { const t = [...document.querySelectorAll('textarea')].find(x => x.offsetParent); return t ? t.value.length : 0; });
      console.log('  highlights ->', n);
    } else if (s.opts.length) {
      const picks = choose(s.opts);
      if (!picks.length) { console.log('  >> tidak tahu pilihan. berhenti.'); await page.screenshot({ path: path.join(__dirname, 'lemon-stuck.png') }); break; }
      for (const p of picks) { if (!p.checked) { await tap(page, p.x, p.y); console.log('  pilih:', p.label); } }
    }

    // seniority combobox if present
    s = await read(page);
    if (s.combos.some(c => /seniority level/i.test(c.t))) {
      console.log('  seniority ->', await pickCombo(page, 'seniority level', /^senior$/i));
    }

    await sleep(1500);
    s = await read(page);
    const next = s.btns.find(b => /ok, next|^next$|continue|submit|enter the/i.test(b.t) && !b.disabled);
    if (!next) { console.log('  next tidak aktif:', JSON.stringify(s.btns.map(b => b.t + (b.disabled ? '(off)' : '')))); await page.screenshot({ path: path.join(__dirname, 'lemon-nonext.png') }); break; }
    await tap(page, next.x, next.y, 3000);
    console.log('  next ->', next.t);
  }

  await page.screenshot({ path: path.join(__dirname, 'lemon-final.png') });
  browser.disconnect();
  process.exit(0);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
