// WWR (We Work Remotely) FREE scanner — public RSS feeds, no login, no payment.
//   node _wwr.js scan
// Filters: Indonesia-eligible (or worldwide) AND devnolife stack fit. Outputs ranked matches.
const https = require("https");
const fs = require("fs");

const FEEDS = [
  ["full-stack", "https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss"],
  ["back-end", "https://weworkremotely.com/categories/remote-back-end-programming-jobs.rss"],
  ["front-end", "https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss"],
  ["devops", "https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss"],
];

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(d));
    }).on("error", reject);
  });
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  if (!m) return "";
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}
function attr(block, name, a) {
  const m = block.match(new RegExp(`<${name}[^>]*${a}="([^"]+)"`, "i"));
  return m ? m[1] : "";
}

const STACK = /\b(react native|react|next\.?js|node\.?js|node|typescript|javascript|python|fastapi|flask|django|go\b|golang|laravel|php|postgres|mysql|mongodb|firebase|supabase|api|rest|graphql|full[- ]?stack|backend|back[- ]?end|frontend|front[- ]?end|mobile|android|ios|kotlin|expo|flutter|ai|llm|machine learning)\b/gi;
function stackScore(t) { const m = (t || "").match(STACK); return m ? new Set(m.map((x) => x.toLowerCase())).size : 0; }

// Roles to avoid (not devnolife's fit)
const NEG = /\b(salesforce|shopify expert|wordpress only|\.net|c#|ruby on rails|rails|elixir|scala|clojure|drupal|magento|sysadmin|sre lead|principal|staff engineer|engineering manager|director)\b/i;

(async () => {
  const cmd = process.argv[2] || "scan";
  const seen = {};
  const jobs = [];
  for (const [cat, url] of FEEDS) {
    let xml = "";
    try { xml = await get(url); } catch (e) { console.error("feed fail", cat, e.message); continue; }
    const items = xml.split(/<item>/).slice(1).map((s) => s.split(/<\/item>/)[0]);
    for (const it of items) {
      const title = tag(it, "title");
      const link = tag(it, "link") || attr(it, "link", "href");
      const region = tag(it, "region");
      const country = tag(it, "country");
      const skills = tag(it, "skills");
      const type = tag(it, "type");
      const descRaw = tag(it, "description").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
      const key = title + "|" + link;
      if (seen[key]) continue; seen[key] = 1;
      const hay = `${title} ${skills} ${descRaw.slice(0, 400)}`;
      const idnOk = /indonesia/i.test(country) || /anywhere in the world/i.test(region) || country === "";
      const fit = stackScore(`${title} ${skills}`);
      const neg = NEG.test(title);
      jobs.push({ cat, title, link, region, idnOk, skills: skills.slice(0, 90), type, fit, neg,
        descSnippet: descRaw.slice(0, 160) });
    }
  }
  // rank: Indonesia-eligible + strong stack fit + not negative
  const ranked = jobs
    .filter((j) => j.idnOk && j.fit >= 2 && !j.neg)
    .sort((a, b) => b.fit - a.fit)
    .slice(0, 30);

  const summary = {
    total_fetched: jobs.length,
    indonesia_eligible: jobs.filter((j) => j.idnOk).length,
    ranked_count: ranked.length,
    ranked: ranked.map((j) => ({ title: j.title, cat: j.cat, type: j.type, region: j.region, fit: j.fit, skills: j.skills, link: j.link })),
  };
  console.log(JSON.stringify(summary, null, 1));

  if (cmd === "save") {
    const md = ["# WWR Jobs — Indonesia-eligible + stack fit (FREE, no login)", "", `Discovered ${new Date().toISOString().slice(0,10)}. Total fetched: ${jobs.length}, Indonesia-eligible: ${summary.indonesia_eligible}.`, "", "Apply GRATIS langsung ke perusahaan lewat link (tanpa akun WWR Pro).", ""];
    ranked.forEach((j, i) => {
      md.push(`## ${i + 1}. ${j.title}  \n- Kategori: ${j.cat} · Tipe: ${j.type} · Region: ${j.region} · fit=${j.fit}\n- Skills: ${j.skills}\n- Apply: ${j.link}\n`);
    });
    fs.writeFileSync("C:\\Users\\devno\\.copilot\\session-state\\aaf576fe-7e2c-46f5-abba-d2403e09df74\\files\\wwr-jobs-shortlist.md", md.join("\n"));
    console.log("\nSAVED shortlist md");
  }
})().catch((e) => { console.error("ERR:", e.message); process.exit(1); });
