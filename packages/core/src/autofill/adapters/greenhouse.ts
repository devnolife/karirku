/**
 * Adapter Greenhouse — form apply di boards.greenhouse.io / job-boards.greenhouse.io.
 * Nama field Greenhouse sangat stabil: first_name, last_name, email, phone,
 * candidate-location, serta custom question berbasis label.
 */

import type { AutofillAdapter } from "../types.js";

const adapter: AutofillAdapter = {
  id: "greenhouse",
  matchUrl: /(?:boards|job-boards)(?:\.eu)?\.greenhouse\.io\//i,
  rules: [
    { match: /first[\s_-]?name/, get: (p) => p.firstName },
    { match: /last[\s_-]?name/, get: (p) => p.lastName },
    { match: /e-?mail/, get: (p) => p.email },
    { match: /phone/, get: (p) => p.phone },
    { match: /candidate[\s_-]?location|location|city/, get: (p) => [p.city, p.country].filter(Boolean).join(", ") || undefined },
    { match: /linked[\s_-]?in/, get: (p) => p.linkedinUrl },
    { match: /git[\s_-]?hub/, get: (p) => p.githubUrl },
    { match: /website|portfolio/, get: (p) => p.portfolioUrl },
  ],
};

export default adapter;
