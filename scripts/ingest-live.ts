/**
 * Ingest lowongan LIVE dari job board asli (Greenhouse, Lever, Ashby — JSON publik).
 *
 * Alur: fetch board → normalisasi (title/url/lokasi/deskripsi/requirements) →
 * bersihkan HTML → ekstraksi skill deterministik (match taksonomi, tanpa AI) →
 * upsert ke tabel `jobs` (source = provider, sourceUrl asli) → generate embedding.
 * Hanya menyimpan role yang relevan (≥1 skill terdeteksi) supaya fokus ke posisi
 * teknologi. `prioritizeSea` membatasi ke lowongan Indonesia/SEA/remote-APAC.
 *
 * Run: pnpm ingest:live
 * Prereq: internet (boards-api.greenhouse.io / api.lever.co / api.ashbyhq.com),
 * Ollama, DATABASE_URL.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });
import { cleanRichText, cleanText, decodeEntities } from "@/lib/html";

type Provider = "greenhouse" | "lever" | "ashby";

type Company = {
  name: string;
  slug: string;
  provider: Provider;
  /** Kalau true, hanya simpan lowongan Indonesia/SEA/remote-APAC (terdekat utk user ID). */
  prioritizeSea?: boolean;
};

// Perusahaan asli dengan board publik. Diutamakan yang punya posisi Indonesia/SEA.
const COMPANIES: Company[] = [
  // ── Indonesia / SEA (prioritizeSea: hanya lowongan terdekat) ──
  { name: "Xendit", slug: "xendit", provider: "greenhouse", prioritizeSea: true },
  { name: "Ninja Van", slug: "ninjavan", provider: "lever", prioritizeSea: true },
  { name: "Nium", slug: "nium", provider: "lever", prioritizeSea: true },
  { name: "Thoughtworks", slug: "thoughtworks", provider: "greenhouse", prioritizeSea: true },
  { name: "Databricks", slug: "databricks", provider: "greenhouse", prioritizeSea: true },
  { name: "Stripe", slug: "stripe", provider: "greenhouse", prioritizeSea: true },
  { name: "Coinbase", slug: "coinbase", provider: "greenhouse", prioritizeSea: true },
  { name: "MongoDB", slug: "mongodb", provider: "greenhouse", prioritizeSea: true },
  { name: "OpenAI", slug: "openai", provider: "ashby", prioritizeSea: true },
  // ── Global remote (pelengkap; tampil di bawah loker ID) ──
  { name: "GitLab", slug: "gitlab", provider: "greenhouse", prioritizeSea: false },
  { name: "Figma", slug: "figma", provider: "greenhouse", prioritizeSea: false },
  { name: "Dropbox", slug: "dropbox", provider: "greenhouse", prioritizeSea: false },
];

// Kota/keyword Indonesia + SEA + APAC.
const SEA_KEYWORDS = [
  "indonesia", "jakarta", "bandung", "surabaya", "makassar", "yogya", "bekasi",
  "tangerang", "bali", "medan", "semarang",
  "singapore", "malaysia", "kuala lumpur", "philippines", "manila",
  "thailand", "bangkok", "vietnam", "ho chi minh", "hanoi",
  "hong kong", "taiwan", "taipei", "india", "bangalore", "bengaluru",
  "japan", "tokyo", "korea", "seoul", "asia", "apac",
];

// Penanda remote yang JELAS bukan-SEA (supaya remote-US dll tidak ikut prioritizeSea).
const NON_SEA_REMOTE = /\b(us|u\.s\.|usa|united states|canada|emea|europe|uk|united kingdom|americas|latam|brazil|mexico|germany|france)\b/i;

function isSeaLocation(location: string): boolean {
  const l = location.toLowerCase();
  if (SEA_KEYWORDS.some((k) => l.includes(k))) return true;
  // Remote generik (tanpa negara non-SEA spesifik) dianggap dapat diakses dari ID.
  if (/\bremote\b/.test(l) && !NON_SEA_REMOTE.test(l)) return true;
  return false;
}

const MAX_PER_COMPANY = 100;
const EMBED_CONCURRENCY = 4;

type JobTypeValue = "fulltime" | "parttime" | "contract" | "remote" | "hybrid" | "onsite";

// ── Normalisasi job lintas-provider ──
type NormalizedJob = {
  title: string;
  url: string;
  location: string;
  description: string;
  requirements: string[];
  type: JobTypeValue;
  postedAt: Date;
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type SkillMatcher = { name: string; re: RegExp }[];

function buildMatcher(skills: { name: string; aliases: string[] }[]): SkillMatcher {
  const matchers: SkillMatcher = [];
  for (const s of skills) {
    const terms = [s.name, ...s.aliases].filter((t) => {
      const hasSpecial = /[#+.]/.test(t);
      return t.length >= 3 || hasSpecial;
    });
    if (terms.length === 0) continue;
    const alt = terms.map((t) => escapeRegExp(t.toLowerCase())).join("|");
    matchers.push({ name: s.name, re: new RegExp(`(?<![a-z0-9])(?:${alt})(?![a-z0-9])`, "i") });
  }
  return matchers;
}

function extractSkills(text: string, matcher: SkillMatcher): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const m of matcher) {
    if (m.re.test(lower)) found.push(m.name);
  }
  return found;
}

/** Ambil item `<li>` dari potongan HTML, bersih jadi teks. */
function liItems(html: string): string[] {
  const items: string[] = [];
  const re = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = cleanText(m[1]);
    if (text && text.length >= 8 && text.length <= 300) items.push(text);
  }
  return items;
}

/**
 * Cari section requirements/kualifikasi di HTML lalu ambil bullet-nya.
 * Heuristik: temukan heading yang menyebut require/qualif/looking-for, lalu
 * kumpulkan `<li>` setelahnya (hingga ~4000 char). Fallback: [].
 */
function extractRequirementsFromHtml(html: string): string[] {
  if (!html) return [];
  // Decode dulu — sumber spt Greenhouse mengirim HTML ter-entity-encode (&lt;li&gt;).
  const decoded = decodeEntities(html);
  const headingRe = /(requirements?|qualifications?|what (?:you['’]?ll need|we['’]?re looking for)|who you are|skills?\s*(?:&|and)?\s*(?:experience|requirements?)|you (?:have|should have|bring))/i;
  const idx = decoded.search(headingRe);
  if (idx === -1) return [];
  const tail = decoded.slice(idx, idx + 4000);
  return liItems(tail).slice(0, 8);
}

function inferLevel(title: string): "intern" | "junior" | "mid" | "senior" | "lead" | "manager" {
  const t = title.toLowerCase();
  if (/\bintern\b/.test(t)) return "intern";
  if (/\b(jr|junior|entry|associate|graduate)\b/.test(t)) return "junior";
  if (/\b(manager|head of|director)\b/.test(t)) return "manager";
  if (/\b(lead|principal|staff)\b/.test(t)) return "lead";
  if (/\b(senior|sr|sIII|iv|v)\b/.test(t)) return "senior";
  return "mid";
}

function inferType(location: string, hint?: string): JobTypeValue {
  const l = `${location} ${hint ?? ""}`.toLowerCase();
  if (l.includes("contract") || l.includes("contractor")) return "contract";
  if (l.includes("part-time") || l.includes("part time") || l.includes("parttime")) return "parttime";
  if (l.includes("hybrid")) return "hybrid";
  if (l.includes("remote")) return "remote";
  if (l.includes("on-site") || l.includes("onsite") || l.includes("on site")) return "onsite";
  return "fulltime";
}

// ── Provider fetchers → NormalizedJob[] ──

type GhJob = {
  title?: string;
  absolute_url?: string;
  location?: { name?: string };
  content?: string;
  updated_at?: string;
};

async function fetchGreenhouse(slug: string): Promise<NormalizedJob[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`;
  const res = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(30_000) });
  const json = (await res.json()) as { jobs?: GhJob[] };
  const jobs = Array.isArray(json.jobs) ? json.jobs : [];
  const out: NormalizedJob[] = [];
  for (const j of jobs) {
    const title = (j.title ?? "").trim();
    const link = j.absolute_url;
    if (!title || !link) continue;
    const html = j.content ?? "";
    const location = j.location?.name ?? "Remote";
    out.push({
      title,
      url: link,
      location,
      description: cleanRichText(html),
      requirements: extractRequirementsFromHtml(html),
      type: inferType(location),
      postedAt: j.updated_at ? new Date(j.updated_at) : new Date(),
    });
  }
  return out;
}

type LeverJob = {
  text?: string;
  hostedUrl?: string;
  applyUrl?: string;
  categories?: { location?: string; commitment?: string; allLocations?: string[] };
  createdAt?: number;
  descriptionPlain?: string;
  description?: string;
  lists?: { text?: string; content?: string }[];
  additionalPlain?: string;
};

async function fetchLever(slug: string): Promise<NormalizedJob[]> {
  const url = `https://api.lever.co/v0/postings/${slug}?mode=json`;
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  const jobs = (await res.json()) as LeverJob[];
  if (!Array.isArray(jobs)) return [];
  const out: NormalizedJob[] = [];
  for (const j of jobs) {
    const title = (j.text ?? "").trim();
    const link = j.hostedUrl ?? j.applyUrl;
    if (!title || !link) continue;
    const location = j.categories?.location ?? (j.categories?.allLocations ?? [])[0] ?? "Remote";
    // Deskripsi: intro + isi list (digabung jadi paragraf).
    const listText = (j.lists ?? [])
      .map((l) => `${l.text ? `${l.text}:\n` : ""}${cleanRichText(l.content ?? "")}`)
      .join("\n\n");
    const description = [
      cleanRichText(j.descriptionPlain ?? j.description ?? ""),
      listText,
      cleanRichText(j.additionalPlain ?? ""),
    ]
      .filter(Boolean)
      .join("\n\n");
    // Requirements dari list yang judulnya menyebut require/qualif.
    const reqList = (j.lists ?? []).find((l) => /requir|qualif|looking for|you have|skills/i.test(l.text ?? ""));
    const requirements = reqList ? liItems(reqList.content ?? "").slice(0, 8) : extractRequirementsFromHtml(j.description ?? "");
    out.push({
      title,
      url: link,
      location,
      description,
      requirements,
      type: inferType(location, j.categories?.commitment),
      postedAt: j.createdAt ? new Date(j.createdAt) : new Date(),
    });
  }
  return out;
}

type AshbyJob = {
  title?: string;
  jobUrl?: string;
  applyUrl?: string;
  location?: string;
  secondaryLocations?: { location?: string }[];
  employmentType?: string;
  isRemote?: boolean;
  publishedAt?: string;
  descriptionHtml?: string;
  descriptionPlain?: string;
};

async function fetchAshby(slug: string): Promise<NormalizedJob[]> {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=false`;
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  const json = (await res.json()) as { jobs?: AshbyJob[] };
  const jobs = Array.isArray(json.jobs) ? json.jobs : [];
  const out: NormalizedJob[] = [];
  for (const j of jobs) {
    const title = (j.title ?? "").trim();
    const link = j.jobUrl ?? j.applyUrl;
    if (!title || !link) continue;
    const location = j.location ?? "Remote";
    const html = j.descriptionHtml ?? "";
    out.push({
      title,
      url: link,
      location: j.isRemote && !/remote/i.test(location) ? `${location} · Remote` : location,
      description: html ? cleanRichText(html) : cleanRichText(j.descriptionPlain ?? ""),
      requirements: extractRequirementsFromHtml(html),
      type: inferType(location, j.employmentType),
      postedAt: j.publishedAt ? new Date(j.publishedAt) : new Date(),
    });
  }
  return out;
}

async function fetchCompany(co: Company): Promise<NormalizedJob[]> {
  if (co.provider === "greenhouse") return fetchGreenhouse(co.slug);
  if (co.provider === "lever") return fetchLever(co.slug);
  return fetchAshby(co.slug);
}

async function main() {
  const { prisma } = await import("@/lib/db");
  const { generateEmbedding, setEmbedding } = await import("@/lib/ai/embeddings");

  const taxonomy = await prisma.skillTaxonomy.findMany({ select: { name: true, aliases: true } });
  const matcher = buildMatcher(taxonomy);
  console.log(`🔎 ${taxonomy.length} skill taksonomi dimuat untuk ekstraksi.`);

  const newJobIds: string[] = [];
  let scanned = 0;
  let skippedNoSkill = 0;

  for (const co of COMPANIES) {
    process.stdout.write(`→ ${co.name} (${co.provider}): fetch... `);
    let jobs: NormalizedJob[] = [];
    try {
      jobs = await fetchCompany(co);
    } catch (err) {
      console.log(`gagal: ${err instanceof Error ? err.message : err}`);
      continue;
    }
    console.log(`${jobs.length} lowongan`);

    let taken = 0;
    let skippedRegion = 0;
    for (const j of jobs) {
      if (taken >= MAX_PER_COMPANY) break;
      scanned += 1;

      if (co.prioritizeSea && !isSeaLocation(j.location)) {
        skippedRegion += 1;
        continue;
      }

      const skills = extractSkills(`${j.title}. ${j.description}`, matcher);
      if (skills.length === 0) {
        skippedNoSkill += 1;
        continue;
      }
      taken += 1;

      const job = await prisma.job.upsert({
        where: { sourceUrl: j.url },
        create: {
          source: co.provider,
          sourceUrl: j.url,
          title: j.title,
          company: co.name,
          location: j.location,
          type: j.type,
          level: inferLevel(j.title),
          description: j.description.slice(0, 4000),
          requirements: j.requirements,
          skills,
          isActive: true,
          postedAt: j.postedAt,
        },
        update: {
          title: j.title,
          location: j.location,
          type: j.type,
          skills,
          requirements: j.requirements,
          description: j.description.slice(0, 4000),
          isActive: true,
        },
      });
      newJobIds.push(job.id);
    }
    const regionNote = co.prioritizeSea ? ` (lewati ${skippedRegion} non-SEA)` : "";
    console.log(`  ✓ ${co.name}: ${taken} role teknologi disimpan${regionNote}`);
  }

  console.log(`\n📊 Discan ${scanned}, dilewati (non-tech) ${skippedNoSkill}, disimpan ${newJobIds.length}`);

  console.log(`🧠 Generate embedding untuk ${newJobIds.length} lowongan live...`);
  let done = 0;
  for (let i = 0; i < newJobIds.length; i += EMBED_CONCURRENCY) {
    const batch = newJobIds.slice(i, i + EMBED_CONCURRENCY);
    await Promise.allSettled(
      batch.map(async (id) => {
        const j = await prisma.job.findUnique({ where: { id } });
        if (!j) return;
        const text = [j.title, j.company ?? "", j.location ?? "", j.skills.join(", "), j.description ?? ""]
          .filter(Boolean)
          .join("\n");
        const vec = await generateEmbedding(text);
        await setEmbedding("jobs", id, vec);
      }),
    );
    done += batch.length;
    process.stdout.write(`\r  embedding: ${done}/${newJobIds.length}`);
  }
  process.stdout.write("\n");

  const live = await prisma.job.count({ where: { source: { in: ["greenhouse", "lever", "ashby"] } } });
  console.log(`\n✅ Total lowongan live (greenhouse+lever+ashby) di DB: ${live}`);
  await prisma.$disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ ingest:live gagal:", err);
  process.exit(1);
});
