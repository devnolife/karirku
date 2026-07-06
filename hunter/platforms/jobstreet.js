// hunter/platforms/jobstreet.js — scan remote jobs + salary-aware Quick Apply.
// Flow proven in-session: resume → cover → role-requirements → profile → review → submit.
// Any screening question the engine can't answer confidently => job marked
// skipped with the reason (never guess on the user's behalf).
const { withPage, goto } = require("../browser");
const { upsertJob, recordApplication, getDb } = require("../db");
const { scoreJob } = require("../matcher");
const { COVER_LETTER, pickSalaryJuta } = require("../apply-engine");

const CATEGORIES = [
  "https://id.jobstreet.com/id/full-stack-developer-jobs/remote",
  "https://id.jobstreet.com/id/react-jobs/remote",
  "https://id.jobstreet.com/id/react-native-jobs/remote",
  "https://id.jobstreet.com/id/software-engineer-jobs/remote",
  "https://id.jobstreet.com/id/web-developer-jobs/remote",
  "https://id.jobstreet.com/id/mobile-developer-jobs/remote",
];

async function checkLogin(page) {
  await goto(page, "https://id.jobstreet.com/id/profile/me", 5000);
  const t = await page.evaluate(() => document.body.innerText);
  return /Andi Agung/i.test(t) && /Informasi pribadi/i.test(t);
}

async function scan({ log = console.log } = {}) {
  return withPage(async (page) => {
    const loggedIn = await checkLogin(page);
    getDb().prepare(`UPDATE accounts SET login_status=?, last_checked=datetime('now') WHERE platform='jobstreet'`)
      .run(loggedIn ? "ok" : "expired");

    const seen = new Set();
    let found = 0, added = 0;
    for (const url of CATEGORIES) {
      await goto(page, url, 4500).catch(() => {});
      const jobs = await page.evaluate(() => {
        const links = [...document.querySelectorAll("a[href*='/job/']")].filter((a) => a.offsetParent && a.innerText.trim().length > 3);
        const out = []; const done = new Set();
        for (const link of links) {
          const href = link.getAttribute("href").split("?")[0];
          if (done.has(href)) continue; done.add(href);
          let card = link;
          for (let i = 0; i < 6 && card.parentElement; i++) { card = card.parentElement; if (card.querySelector("[data-automation='jobCardLocation']")) break; }
          const comp = (card.querySelector("[data-automation='jobCompany'], a[href*='/companies/']") || {}).innerText || "";
          const loc = (card.querySelector("[data-automation='jobCardLocation']") || {}).innerText || "";
          const sal = (card.innerText.match(/Rp[\s\d.,]+/) || [])[0] || "";
          let min = 0; const mm = sal.replace(/\./g, "").match(/Rp\s*(\d+)/);
          if (mm) { const raw = parseInt(mm[1], 10); min = raw >= 1000000 ? Math.round(raw / 1000000) : raw; }
          out.push({
            external_id: (href.match(/\/job\/(\d+)/) || [])[1] || href,
            title: link.innerText.trim().slice(0, 80),
            company: comp.trim().slice(0, 60),
            location: loc.trim().slice(0, 60),
            url: "https://id.jobstreet.com" + href,
            salary_min: min > 0 && min < 500 ? min : null, // sane juta range
          });
        }
        return out;
      });
      for (const j of jobs) {
        if (seen.has(j.external_id)) continue;
        seen.add(j.external_id); found++;
        const match_score = scoreJob({ title: j.title, remote: 1 });
        const row = upsertJob({ platform: "jobstreet", remote: 1, currency: "IDR", match_score, ...j });
        if (row._isNew) added++;
      }
    }
    log(`jobstreet scan: ${found} jobs, ${added} new`);
    return { found, added };
  }, { urlHint: "jobstreet" });
}

/**
 * Quick Apply to one job row from the DB. Returns {ok, reason?}.
 * Marks the job applied/skipped and records the application on success.
 */
async function apply({ jobRowId, log = console.log }) {
  const job = getDb().prepare(`SELECT * FROM jobs WHERE id=?`).get(jobRowId);
  if (!job) return { ok: false, reason: "job row not found" };
  const id = job.external_id;

  return withPage(async (page) => {
    // pre-check state on the job page
    await goto(page, `https://id.jobstreet.com/id/job/${id}`, 3500);
    const st = await page.evaluate(() => ({
      applied: /telah mengirimkan lamaran/i.test(document.body.innerText),
      quick: [...document.querySelectorAll("a,button")].some((e) => e.offsetParent && /lamaran cepat/i.test(e.innerText)),
    }));
    if (st.applied) {
      getDb().prepare(`UPDATE jobs SET status='applied' WHERE id=?`).run(job.id);
      return { ok: false, reason: "already applied" };
    }
    if (!st.quick) {
      getDb().prepare(`UPDATE jobs SET status='skipped', skip_reason='no quick apply (external)' WHERE id=?`).run(job.id);
      return { ok: false, reason: "no quick apply" };
    }

    const targetSal = pickSalaryJuta(job.salary_min || 0);

    // Step 1: resume + cover letter
    await goto(page, `https://id.jobstreet.com/id/job/${id}/apply`, 4500);
    await page.evaluate(() => {
      function near(rd) { let c = rd, n = ""; for (let i = 0; i < 6 && c; i++) { c = c.parentElement; const l = c && c.querySelector("label"); if (l) { n = l.innerText; break; } } return n; }
      const radios = [...document.querySelectorAll("input[type='radio']")].filter((e) => e.offsetParent);
      (radios.find((r) => /Pilih resume/i.test(near(r))) || {}).click?.();
      const s = [...document.querySelectorAll("select")].filter((e) => e.offsetParent)[0];
      if (s) { const o = [...s.options].find((o) => /cv|\.pdf|andi/i.test(o.text)); if (o) { s.value = o.value; s.dispatchEvent(new Event("change", { bubbles: true })); } }
      const tulis = radios.find((r) => /Tulis surat lamaran/i.test(near(r))); if (tulis) tulis.click();
    });
    await page.waitForTimeout(1200);
    await page.evaluate((c) => {
      const ta = [...document.querySelectorAll("textarea")].filter((e) => e.offsetParent)[0];
      if (ta) { const s = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set; s.call(ta, c); ta.dispatchEvent(new Event("input", { bubbles: true })); }
    }, COVER_LETTER);
    await page.waitForTimeout(700);
    await clickLanjut(page);
    await page.waitForTimeout(5000);

    // Step 2: screening questions (if present)
    if (page.url().includes("role-requirements")) {
      const unknown = await page.evaluate((targetSal) => {
        function qOf(el) { let c = el, n = ""; for (let i = 0; i < 7 && c; i++) { c = c.parentElement; const m = (c.innerText || "").match(/[^\n]*\?[^\n]*/); if (m) { n = m[0].toLowerCase(); break; } } return n; }
        function pick(sel, rx) { const o = [...sel.options].find((o) => rx.test(o.text)); if (o) { sel.value = o.value; sel.dispatchEvent(new Event("change", { bubbles: true })); return true; } return false; }
        function pickSalary(sel) {
          const want = new RegExp("^Rp\\s*" + targetSal + "(\\.0)?\\s*(Jt|million)", "i");
          let o = [...sel.options].find((o) => want.test(o.text));
          if (!o) {
            const parsed = [...sel.options].map((op) => { const m = op.text.replace(/\./g, "").match(/Rp\s*(\d+)/); let v = m ? parseInt(m[1], 10) : 0; if (v >= 1000000) v = Math.round(v / 1000000); return { op, v }; }).filter((x) => x.v > 0);
            const cand = parsed.filter((x) => x.v >= targetSal).sort((a, b) => a.v - b.v)[0] || parsed.sort((a, b) => b.v - a.v)[0];
            o = cand && cand.op;
          }
          if (o) { sel.value = o.value; sel.dispatchEvent(new Event("change", { bubbles: true })); return true; }
          return false;
        }
        const unk = [];
        [...document.querySelectorAll("select")].filter((s) => s.offsetParent).forEach((s) => {
          const q = qOf(s); let ok = false;
          if (/gaji|salary/.test(q)) ok = pickSalary(s);
          else if (/kualifikasi|qualification|pendidikan|education/.test(q)) ok = pick(s, /Sarjana \(S1\)|Bachelor/i);
          else if (/(react native|mobile)/.test(q) && /year|tahun|experience|pengalaman/.test(q)) ok = pick(s, /^4 years$|^4 tahun$/);
          else if (/year|tahun|experience|pengalaman/.test(q)) ok = pick(s, /^5 years$|^5 tahun$|More than 5|Lebih dari 5/i);
          if (!ok) unk.push("(sel) " + q.slice(0, 40));
        });
        function labelOf(inp) { if (inp.id) { const l = document.querySelector("label[for='" + inp.id + "']"); if (l) return l.innerText; } const l2 = inp.closest("label"); if (l2) return l2.innerText; let c = inp; for (let i = 0; i < 3 && c; i++) { c = c.parentElement; if (c && c.tagName === "LABEL") return c.innerText; } return ""; }
        const groups = {};
        [...document.querySelectorAll("input[type='radio'],input[type='checkbox']")].filter((e) => e.offsetParent).forEach((e) => { const q = qOf(e); if (!groups[q]) groups[q] = []; groups[q].push(e); });
        for (const q in groups) {
          const inputs = groups[q]; const anyChecked = inputs.some((i) => i.checked);
          if (/kemampuan bahasa|english proficiency/.test(q)) { const t = inputs.find((i) => /menulis dengan mahir|write.*prof/i.test(labelOf(i))) || inputs.find((i) => /mahir|prof/i.test(labelOf(i))); if (t && !t.checked) t.click(); }
          else if (/bahasa apa saja|fasih|which languages/.test(q)) { inputs.forEach((i) => { if (/^bahasa inggris|^bahasa indonesia/i.test(labelOf(i).trim()) && !i.checked) i.click(); }); }
          else if (!anyChecked) unk.push("(choice) " + q.slice(0, 40));
        }
        [...document.querySelectorAll("input[type='text'],input[type='number'],textarea")].filter((e) => e.offsetParent && !e.value).forEach((e) => unk.push("(text) " + qOf(e).slice(0, 35)));
        return [...new Set(unk)];
      }, targetSal);

      if (unknown.length) {
        const reason = "manual questions: " + unknown.join("; ").slice(0, 180);
        getDb().prepare(`UPDATE jobs SET status='skipped', skip_reason=? WHERE id=?`).run(reason, job.id);
        log(`jobstreet apply ${id}: SKIP — ${reason}`);
        return { ok: false, reason };
      }
      await page.waitForTimeout(1000);
      await clickLanjut(page);
      await page.waitForTimeout(5000);
      if (page.url().includes("role-requirements")) {
        getDb().prepare(`UPDATE jobs SET status='skipped', skip_reason='validation stuck' WHERE id=?`).run(job.id);
        return { ok: false, reason: "validation stuck" };
      }
    }

    // Step 3: profile confirmation
    if (page.url().includes("/profile")) { await clickLanjut(page); await page.waitForTimeout(5000); }

    // Step 4: review → submit
    if (page.url().includes("/review")) {
      await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.offsetParent && /kirim lamaran/i.test(x.innerText)); if (b && !b.disabled) b.click(); });
      await page.waitForTimeout(7000);
    }

    const ok = page.url().includes("/success");
    if (ok) {
      recordApplication({
        job_id: job.id, platform: "jobstreet", title: job.title, company: job.company,
        url: job.url, channel: "auto", salary_offered: `Rp ${targetSal} jt`, cover_letter: COVER_LETTER,
      });
      log(`jobstreet apply ${id}: OK (gaji ${targetSal} jt, min ${job.salary_min || "?"})`);
    } else {
      getDb().prepare(`UPDATE jobs SET status='skipped', skip_reason=? WHERE id=?`).run("stopped at " + page.url().split("/apply")[1], job.id);
      log(`jobstreet apply ${id}: stopped at ${page.url()}`);
    }
    return { ok, salary: targetSal };
  }, { urlHint: "jobstreet" });
}

async function clickLanjut(page) {
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button,a")].find((x) => x.offsetParent && /^lanjut/i.test(x.innerText.trim()));
    if (b) b.click();
  });
}

/**
 * Import the existing "Lamaran kerja" history into the applications table
 * so the email tracker has something to match against.
 */
async function importApplied({ log = console.log } = {}) {
  return withPage(async (page) => {
    await goto(page, "https://id.jobstreet.com/id/my-activity/applied-jobs", 6000);
    for (let i = 0; i < 6; i++) { await page.evaluate(() => window.scrollBy(0, 1600)); await page.waitForTimeout(1000); }
    const items = await page.evaluate(() => {
      const t = document.body.innerText;
      // blocks look like: "Posisi Pekerjaan\n<title>\nPerusahaan\n<company>...Dilamar di Jobstreet\n<date>"
      const re = /Posisi Pekerjaan\s*\n([^\n]+)(?:[\s\S]*?Perusahaan\s*\n([^\n]+))?[\s\S]*?Dilamar di Jobstreet\s*\n([^\n]+)/g;
      const out = []; let m;
      while ((m = re.exec(t))) out.push({ title: m[1].trim().slice(0, 90), company: (m[2] || "").trim().slice(0, 60), date: m[3].trim().slice(0, 30) });
      return out;
    });
    const dbase = getDb();
    let imported = 0;
    for (const it of items) {
      const dup = dbase.prepare(`SELECT 1 FROM applications WHERE platform='jobstreet' AND title=?`).get(it.title);
      if (dup) continue;
      dbase.prepare(`INSERT INTO applications (platform, title, company, channel, notes) VALUES ('jobstreet', ?, ?, 'imported', ?)`)
        .run(it.title, it.company || null, "Dilamar " + it.date);
      imported++;
    }
    log(`jobstreet importApplied: ${items.length} in history, ${imported} imported`);
    return { found: items.length, imported };
  }, { urlHint: "jobstreet" });
}

module.exports = { scan, apply, importApplied, CATEGORIES };
