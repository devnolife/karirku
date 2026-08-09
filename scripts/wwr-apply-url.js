const https = require('https');
const fs = require('fs');
const path = require('path');

function get(url, redirects = 0) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150.0.0.0 Safari/537.36' } }, res => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 5) {
        const next = res.headers.location.startsWith('http') ? res.headers.location : 'https://weworkremotely.com' + res.headers.location;
        return resolve(get(next, redirects + 1));
      }
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => resolve({ html: d, finalUrl: url, status: res.statusCode }));
    }).on('error', () => resolve({ html: '', finalUrl: url, status: 0 }));
  });
}

const TARGETS = [
  'https://weworkremotely.com/remote-jobs/lemon-io-senior-react-full-stack-developer-5',
  'https://weworkremotely.com/remote-jobs/proxify-ab-senior-fullstack-developer-react-js-node-js-2',
  'https://weworkremotely.com/remote-jobs/mindrift-freelance-full-stack-web-app-developer-1',
  'https://weworkremotely.com/remote-jobs/coinbase-senior-software-engineer-full-stack-coinbase-advisor-agentic-trading',
  'https://weworkremotely.com/remote-jobs/hygraph-senior-fullstack-engineer-f-m-d-berlin-i-germany-emea-i-remote',
  'https://weworkremotely.com/remote-jobs/superplane-product-engineer-1',
  'https://weworkremotely.com/remote-jobs/sticker-mule-software-engineer-3',
  'https://weworkremotely.com/remote-jobs/reveleer-full-stack-ai-engineer',
];

const strip = h => h.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|h\d)>/gi, '\n').replace(/<li[^>]*>/gi, '• ')
  .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#\d+;/g, '')
  .replace(/&[a-z]+;/gi, ' ').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

(async () => {
  const out = [];
  for (const url of TARGETS) {
    const { html, status } = await get(url);
    if (!html) { console.log('FAIL', url); continue; }
    // find all outbound links that look like an application
    const links = [...html.matchAll(/href="(https?:\/\/[^"]+)"/gi)].map(m => m[1])
      .filter(u => !/weworkremotely\.com|twitter|facebook|linkedin\.com\/company|instagram|youtube|\.css|\.js|\.png|\.jpg|\.svg|apple\.com|google\.com|rss/i.test(u));
    const uniq = [...new Set(links)];
    const applyish = uniq.filter(u => /apply|greenhouse|lever\.co|workable|ashbyhq|breezy|recruitee|smartrecruiters|jobs\.|careers|boards\.|jobvite|bamboo|join\.|typeform|airtable|forms\./i.test(u));
    const body = strip(html);
    const idx = body.indexOf('Apply');
    out.push({ url, status, applyCandidates: applyish.slice(0, 6), otherLinks: uniq.slice(0, 8), bodyLen: body.length });
    console.log('\n' + '='.repeat(80));
    console.log(url.split('/').pop());
    console.log('  status:', status, '| body:', body.length);
    console.log('  APPLY:', applyish.length ? applyish.slice(0, 4).join('\n         ') : '(tidak ketemu)');
    if (!applyish.length) console.log('  links lain:', uniq.slice(0, 6).join(' | ').slice(0, 200));
  }
  fs.writeFileSync(path.join(__dirname, 'wwr-apply.json'), JSON.stringify(out, null, 1));
})();
