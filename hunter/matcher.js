// hunter/matcher.js — scores how well a job matches devnolife's profile.
const { getSetting } = require("./db");

function getKeywords() {
  try { return JSON.parse(getSetting("keywords", "[]")); } catch { return []; }
}
function getAvoid() {
  try { return JSON.parse(getSetting("avoid_keywords", "[]")); } catch { return []; }
}

/**
 * Score 0..100. Title hits weigh more than description hits.
 * Avoid-keywords subtract heavily (niche stacks user doesn't do).
 */
function scoreJob({ title = "", description = "", remote = 0 }) {
  const t = title.toLowerCase();
  const d = (description || "").toLowerCase();
  let score = 0;

  for (const kw of getKeywords()) {
    const k = kw.toLowerCase();
    if (t.includes(k)) score += 18;
    else if (d.includes(k)) score += 6;
  }
  for (const kw of getAvoid()) {
    const k = kw.toLowerCase();
    if (t.includes(k)) score -= 35;
    else if (d.includes(k)) score -= 10;
  }
  if (remote) score += 10;
  return Math.max(0, Math.min(100, score));
}

module.exports = { scoreJob, getKeywords, getAvoid };
