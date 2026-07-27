export interface MarketJobInput {
  title: string;
  location: string | null;
  type: string | null;
  skills: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  company: string | null;
  source: string;
  jobSourceId: string | null;
}

export interface AggregatedMarketStat {
  roleName: string;
  city: string;
  snapshotDate: Date;
  topSkills: { name: string; count: number }[];
  salaryP25: number | null;
  salaryP50: number | null;
  salaryP75: number | null;
  salaryValues: number[];
  salarySampleSize: number;
  openPositions: number;
  sourceCount: number;
  trend3mo: number | null;
  topCompanies: string[];
}

const ROLE_RULES: readonly [RegExp, string][] = [
  [/\b(machine learning|ml|artificial intelligence|ai)\b.*\b(engineer|developer|specialist)\b|\bml engineer\b/, "Machine Learning Engineer"],
  [/\bdata engineer\b/, "Data Engineer"],
  [/\bdata scientist\b/, "Data Scientist"],
  [/\bdata analyst\b|\banalytics analyst\b/, "Data Analyst"],
  [/\b(front[\s-]?end|react|web ui)\b.*\b(engineer|developer)\b|\bfront[\s-]?end\b/, "Frontend Engineer"],
  [/\b(back[\s-]?end|server[\s-]?side)\b.*\b(engineer|developer)\b|\bback[\s-]?end\b/, "Backend Engineer"],
  [/\bfull[\s-]?stack\b/, "Full Stack Engineer"],
  [/\b(android|ios|mobile|flutter|react native)\b.*\b(engineer|developer)\b/, "Mobile Engineer"],
  [/\b(site reliability|sre)\b/, "Site Reliability Engineer"],
  [/\bdevops\b/, "DevOps Engineer"],
  [/\bplatform engineer\b/, "Platform Engineer"],
  [/\b(cloud engineer|cloud architect)\b/, "Cloud Engineer"],
  [/\b(cyber ?security|security engineer|information security)\b/, "Security Engineer"],
  [/\b(quality assurance|qa engineer|test automation|software tester)\b/, "QA Engineer"],
  [/\bengineering manager\b|\bsoftware development manager\b/, "Engineering Manager"],
  [/\bproduct manager\b|\bproduct owner\b/, "Product Manager"],
  [/\bproject manager\b|\bprogram manager\b/, "Project Manager"],
  [/\b(ui.?ux|ux.?ui|product designer|user experience designer)\b/, "Product Designer"],
  [/\bgraphic designer\b|\bvisual designer\b/, "Graphic Designer"],
  [/\bbusiness analyst\b/, "Business Analyst"],
  [/\b(product marketing|digital marketing|marketing specialist)\b/, "Marketing Specialist"],
  [/\b(recruiter|talent acquisition)\b/, "Recruiter"],
  [/\b(customer support|customer service|customer success)\b/, "Customer Support"],
  [/\b(accountant|accounting|akuntan)\b/, "Accountant"],
  [/\b(sales|business development)\b/, "Business Development"],
  [/\b(software|application|web)\b.*\b(engineer|developer|programmer)\b|\bsoftware developer\b/, "Software Engineer"],
];

const ACRONYMS = new Map([
  ["ai", "AI"],
  ["hr", "HR"],
  ["ios", "iOS"],
  ["ml", "ML"],
  ["qa", "QA"],
  ["seo", "SEO"],
  ["sql", "SQL"],
  ["ui", "UI"],
  ["ux", "UX"],
]);

function cleanText(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFKC")
    .replace(/[’']/g, "")
    .replace(/[_/|,;:()[\]{}]+/g, " ")
    .replace(/[-–—]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => ACRONYMS.get(word) ?? `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}

export function normalizeRole(title: string): string {
  const normalized = cleanText(title);
  for (const [pattern, role] of ROLE_RULES) {
    if (pattern.test(normalized)) return role;
  }

  const withoutNoise = normalized
    .replace(
      /\b(intern(ship)?|junior|jr|mid level|midlevel|senior|sr|lead|principal|staff|head of|associate|entry level|graduate)\b/g,
      " ",
    )
    .replace(/\b(i|ii|iii|iv|v)\b$/g, " ")
    .replace(/\b(full time|part time|contract|remote|hybrid|onsite)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return titleCase(withoutNoise || normalized || "unknown role").slice(0, 255);
}

const CITY_RULES: readonly [RegExp, string][] = [
  [/\b(jabodetabek|jakarta|south jakarta|north jakarta|west jakarta|east jakarta|central jakarta)\b/, "Jakarta"],
  [/\b(bandung)\b/, "Bandung"],
  [/\b(surabaya)\b/, "Surabaya"],
  [/\b(yogyakarta|jogja|yogya)\b/, "Yogyakarta"],
  [/\b(denpasar|bali)\b/, "Bali"],
  [/\b(tangerang|bsd|serpong)\b/, "Tangerang"],
  [/\b(bekasi)\b/, "Bekasi"],
  [/\b(bogor)\b/, "Bogor"],
  [/\b(depok)\b/, "Depok"],
  [/\b(medan)\b/, "Medan"],
  [/\b(semarang)\b/, "Semarang"],
  [/\b(makassar)\b/, "Makassar"],
  [/\b(malang)\b/, "Malang"],
  [/\b(batam)\b/, "Batam"],
  [/\b(singapore)\b/, "Singapore"],
  [/\b(kuala lumpur)\b/, "Kuala Lumpur"],
  [/\b(manila)\b/, "Manila"],
  [/\b(bangkok)\b/, "Bangkok"],
  [/\b(ho chi minh)\b/, "Ho Chi Minh City"],
  [/\b(hanoi)\b/, "Hanoi"],
  [/\b(bengaluru|bangalore)\b/, "Bengaluru"],
  [/\b(tokyo)\b/, "Tokyo"],
  [/\b(london)\b/, "London"],
  [/\b(new york)\b/, "New York"],
  [/\b(san francisco)\b/, "San Francisco"],
];

export function normalizeLocation(
  location: string | null,
  type: string | null,
): { city: string; remote: boolean } {
  const normalized = cleanText(location);
  if (
    type?.toLowerCase() === "remote" ||
    /\b(remote|work from home|working from home|wfh|anywhere|worldwide)\b/.test(normalized)
  ) {
    return { city: "Remote", remote: true };
  }
  for (const [pattern, city] of CITY_RULES) {
    if (pattern.test(normalized)) return { city, remote: false };
  }

  const first = (location ?? "")
    .normalize("NFKC")
    .split(/[,;|/•]/, 1)[0]
    .replace(/\b(greater|hybrid|on[\s-]?site)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { city: first ? titleCase(cleanText(first)).slice(0, 100) : "Unknown", remote: false };
}

export const MONTHLY_IDR_RATES: Readonly<Record<string, number>> = Object.freeze({
  IDR: 1,
  USD: 16_300,
  SGD: 12_700,
  MYR: 3_700,
  EUR: 19_000,
  GBP: 22_000,
  AUD: 10_600,
});

function positive(value: number | null): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * Jobs store monthly salary values. This converts supported currencies to a
 * representative monthly IDR midpoint without inventing an unknown cadence.
 */
export function normalizeMonthlySalary(input: {
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
}): number | null {
  const rate = MONTHLY_IDR_RATES[(input.currency ?? "IDR").trim().toUpperCase()];
  if (!rate) return null;
  let min = positive(input.salaryMin);
  let max = positive(input.salaryMax);
  if (min === null && max === null) return null;
  if (min !== null && max !== null && min > max) [min, max] = [max, min];
  const representative = min !== null && max !== null ? (min + max) / 2 : (min ?? max);
  const monthlyIdr = Math.round((representative as number) * rate);
  return monthlyIdr <= 2_000_000_000 ? monthlyIdr : null;
}

/** Linear-interpolated percentile (p in 0..1), rounded to an integer. */
export function percentile(values: readonly number[], p: number): number | null {
  if (values.length === 0) return null;
  if (!Number.isFinite(p) || p < 0 || p > 1) throw new RangeError("percentile p must be between 0 and 1");
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return Math.round(sorted[lower]);
  const fraction = index - lower;
  return Math.round(sorted[lower] + (sorted[upper] - sorted[lower]) * fraction);
}

export function marketGroupKey(roleName: string, city: string): string {
  return JSON.stringify([roleName, city]);
}

export function calculateThreeMonthTrend(current: number, baseline: number | undefined): number | null {
  if (baseline === undefined || baseline <= 0) return null;
  return Math.round((((current - baseline) / baseline) * 100) * 100) / 100;
}

type CountEntry = { label: string; count: number };

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function addCount(counts: Map<string, CountEntry>, raw: string): void {
  const label = raw.normalize("NFKC").replace(/\s+/g, " ").trim();
  if (!label) return;
  const key = label.toLowerCase();
  const current = counts.get(key);
  counts.set(key, {
    label: current && compareText(current.label, label) <= 0 ? current.label : label,
    count: (current?.count ?? 0) + 1,
  });
}

function ranked(counts: Map<string, CountEntry>, limit: number): CountEntry[] {
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || compareText(a.label.toLowerCase(), b.label.toLowerCase()))
    .slice(0, limit);
}

export function aggregateMarketStats(
  jobs: readonly MarketJobInput[],
  snapshotDate: Date,
  previousOpenPositions: ReadonlyMap<string, number> = new Map(),
): AggregatedMarketStat[] {
  const groups = new Map<
    string,
    {
      roleName: string;
      city: string;
      jobs: MarketJobInput[];
    }
  >();

  for (const job of jobs) {
    const roleName = normalizeRole(job.title);
    const { city } = normalizeLocation(job.location, job.type);
    const key = marketGroupKey(roleName, city);
    const group = groups.get(key) ?? { roleName, city, jobs: [] };
    group.jobs.push(job);
    groups.set(key, group);
  }

  const day = new Date(Date.UTC(
    snapshotDate.getUTCFullYear(),
    snapshotDate.getUTCMonth(),
    snapshotDate.getUTCDate(),
  ));
  return [...groups.entries()]
    .map(([key, group]): AggregatedMarketStat => {
      const skillCounts = new Map<string, CountEntry>();
      const companyCounts = new Map<string, CountEntry>();
      const sourceKeys = new Set<string>();
      const salaries: number[] = [];

      for (const job of group.jobs) {
        const uniqueSkills = new Map<string, string>();
        for (const skill of job.skills.map((item) => item.normalize("NFKC").replace(/\s+/g, " ").trim()).filter(Boolean)) {
          const normalized = skill.toLowerCase();
          const current = uniqueSkills.get(normalized);
          if (!current || compareText(skill, current) < 0) uniqueSkills.set(normalized, skill);
        }
        for (const skill of uniqueSkills.values()) {
          addCount(skillCounts, skill);
        }
        if (job.company) addCount(companyCounts, job.company);
        sourceKeys.add(job.jobSourceId ? `registry:${job.jobSourceId}` : `legacy:${job.source.toLowerCase()}`);
        const salary = normalizeMonthlySalary(job);
        if (salary !== null) salaries.push(salary);
      }

      return {
        roleName: group.roleName,
        city: group.city,
        snapshotDate: day,
        topSkills: ranked(skillCounts, 10).map(({ label, count }) => ({ name: label, count })),
        salaryP25: percentile(salaries, 0.25),
        salaryP50: percentile(salaries, 0.5),
        salaryP75: percentile(salaries, 0.75),
        salaryValues: [...salaries].sort((a, b) => a - b),
        salarySampleSize: salaries.length,
        openPositions: group.jobs.length,
        sourceCount: sourceKeys.size,
        trend3mo: calculateThreeMonthTrend(group.jobs.length, previousOpenPositions.get(key)),
        topCompanies: ranked(companyCounts, 5).map(({ label }) => label),
      };
    })
    .sort(
      (a, b) =>
        compareText(a.roleName.toLowerCase(), b.roleName.toLowerCase()) ||
        compareText(a.city.toLowerCase(), b.city.toLowerCase()),
    );
}

export function subtractUtcMonths(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() - months;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay)));
}
