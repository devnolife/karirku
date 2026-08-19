/**
 * Adapter Lever — form apply di jobs.lever.co/<org>/<id>/apply.
 * Field khas Lever: name (nama lengkap satu field), email, phone, org,
 * urls[LinkedIn], urls[GitHub], urls[Portfolio], comments.
 */

import type { AutofillAdapter } from "../types.js";

const adapter: AutofillAdapter = {
  id: "lever",
  matchUrl: /jobs\.(?:eu\.)?lever\.co\//i,
  rules: [
    { match: /urls\[linkedin\]|linked[\s_-]?in/, get: (p) => p.linkedinUrl },
    { match: /urls\[github\]|git[\s_-]?hub/, get: (p) => p.githubUrl },
    { match: /urls\[(portfolio|other)\]|portfolio|website/, get: (p) => p.portfolioUrl },
    { match: /e-?mail/, get: (p) => p.email },
    { match: /phone/, get: (p) => p.phone },
    { match: /\borg\b|current\s*company|company/, get: (p) => p.currentCompany },
    { match: /location|city/, get: (p) => [p.city, p.country].filter(Boolean).join(", ") || undefined },
    // Lever memakai satu field "name" untuk nama lengkap — taruh setelah
    // pola lain agar tidak menangkap "company name" dsb.
    { match: /full[\s_-]?name|\bname\b/, get: (p) => p.fullName },
  ],
};

export default adapter;
