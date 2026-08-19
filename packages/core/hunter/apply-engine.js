// hunter/apply-engine.js — shared screening-answer rules.
// Source of truth: AGENTS.md "Aturan lamaran kerja".
//  - Salary: NEVER below the job's advertised minimum; floor from settings
//    (default Rp 10 jt) when the posting doesn't state one.
//  - Experience: 5 yrs general dev, 4 yrs React Native / mobile.
//  - Education: S1 (Sarjana). Languages: English + Indonesian.
//  - Any question needing real judgment => skip (never guess for the user).
const { getSetting } = require("./db");

const PROFILE = {
  devYears: 5,
  mobileYears: 4,
  education: /Sarjana \(S1\)|Bachelor/i,
  englishRating: /menulis dengan mahir|write.*prof/i,
  languages: /^bahasa inggris|^bahasa indonesia|^english|^indonesian/i,
};

const COVER_LETTER =
  "Halo, saya Andi - full-stack & mobile developer 5+ tahun (205+ repo). " +
  "Karya unggulan saya Saku Sultan (e-wallet) live di App Store & Play Store, 10.000+ unduhan. " +
  "Stack: Next.js, React, TypeScript, Node.js, React Native, Python/FastAPI, PostgreSQL, plus integrasi AI/LLM. " +
  "Siap kerja remote, mulai segera. Terima kasih.";

/** Salary options JobStreet offers, in juta IDR, ascending. */
const SAL_OPTS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 40, 60, 80, 100];

function salaryFloor() {
  return parseInt(getSetting("salary_floor_juta", "10"), 10);
}

/**
 * Given the job's stated minimum (juta, 0 = unknown), return the salary
 * option to answer with: smallest option >= max(jobMin, floor).
 */
function pickSalaryJuta(jobMinJuta) {
  const target = Math.max(jobMinJuta || 0, salaryFloor());
  return SAL_OPTS.find((o) => o >= target) || SAL_OPTS[SAL_OPTS.length - 1];
}

/** Classify a screening question; returns an answer plan or null (=judgment, skip). */
function planForQuestion(qLower) {
  if (/gaji|salary/.test(qLower)) return { kind: "salary" };
  if (/kualifikasi|qualification|pendidikan|education/.test(qLower)) return { kind: "education" };
  if (/(react native|mobile)/.test(qLower) && /year|tahun|experience|pengalaman/.test(qLower))
    return { kind: "years", years: PROFILE.mobileYears };
  if (/year|tahun|experience|pengalaman/.test(qLower)) return { kind: "years", years: PROFILE.devYears };
  if (/kemampuan bahasa|english proficiency/.test(qLower)) return { kind: "english-rating" };
  if (/bahasa apa saja|fasih|which languages/.test(qLower)) return { kind: "languages" };
  return null; // unknown → requires human judgment
}

module.exports = { PROFILE, COVER_LETTER, SAL_OPTS, pickSalaryJuta, salaryFloor, planForQuestion };
