/**
 * Adapter Ashby — form apply di jobs.ashbyhq.com.
 * Field sistem Ashby memakai prefix _systemfield_ (name, email, phone,
 * location, resume); custom question berbasis label.
 */

import type { AutofillAdapter } from "../types.js";

const adapter: AutofillAdapter = {
  id: "ashby",
  matchUrl: /jobs\.ashbyhq\.com\//i,
  rules: [
    { match: /_systemfield_name|full[\s_-]?name|\bname\b/, get: (p) => p.fullName },
    { match: /_systemfield_email|e-?mail/, get: (p) => p.email },
    { match: /_systemfield_phone|phone/, get: (p) => p.phone },
    { match: /_systemfield_location|location|city/, get: (p) => [p.city, p.country].filter(Boolean).join(", ") || undefined },
    { match: /linked[\s_-]?in/, get: (p) => p.linkedinUrl },
    { match: /git[\s_-]?hub/, get: (p) => p.githubUrl },
    { match: /website|portfolio/, get: (p) => p.portfolioUrl },
  ],
};

export default adapter;
