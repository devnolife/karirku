/**
 * Ingest lowongan LIVE dari job board asli (Greenhouse, JSON publik).
 *
 * Alur: fetch `?content=true` → strip HTML → ekstraksi skill deterministik
 * (match taksonomi, tanpa AI) → upsert ke tabel `jobs` (source="greenhouse",
 * sourceUrl + deskripsi asli) → generate embedding. Hanya menyimpan role yang
 * relevan (≥1 skill terdeteksi) supaya fokus ke posisi teknologi.
 *
 * Run: pnpm ingest:live
 * Prereq: internet (boards-api.greenhouse.io), Ollama, DATABASE_URL.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

// Perusahaan asli dengan board Greenhouse publik (banyak role remote).
const COMPANIES = [
  { name: "GitLab", slug: "gitlab" },
  { name: "Figma", slug: "figma" },
  { name: "Dropbox", slug: "dropbox" },
];

const MAX_PER_COMPANY = 80;
const EMBED_CONCURRENCY = 4;

type GhJob = {
  title?: string;
  absolute_url?: string;
  location?: { name?: string };
  content?: string;
  updated_at?: string;
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type SkillMatcher = { name: string; re: RegExp }[];

function buildMatcher(skills: { name: string; aliases: string[] }[]): SkillMatcher {
  const matchers: SkillMatcher = [];
  for (const s of skills) {
    const terms = [s.name, ...s.aliases].filter((t) => {
      const hasSpecial = /[#+.]/.test(t);
      return t.length >= 3 || hasSpecial; // buang term ≤2 huruf yang ambigu
    });
    if (terms.length === 0) continue;
    const alt = terms.map((t) => escapeRegExp(t.toLowerCase())).join("|");
    // batas non-alfanumerik supaya tidak ketangkap di tengah kata
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

function inferLevel(title: string): "intern" | "junior" | "mid" | "senior" | "lead" | "manager" {
  const t = title.toLowerCase();
  if (/\bintern\b/.test(t)) return "intern";
  if (/\b(jr|junior|entry|associate|graduate)\b/.test(t)) return "junior";
  if (/\b(manager|head of|director)\b/.test(t)) return "manager";
  if (/\b(lead|principal|staff)\b/.test(t)) return "lead";
  if (/\b(senior|sr|sIII|iv|v)\b/.test(t)) return "senior";
  return "mid";
}

function inferType(location: string): "fulltime" | "contract" | "parttime" | "remote" {
  const l = location.toLowerCase();
  if (l.includes("contract")) return "contract";
  if (l.includes("part-time") || l.includes("part time")) return "parttime";
  if (l.includes("remote")) return "remote";
  return "fulltime";
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
    const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${co.slug}/jobs?content=true`;
    process.stdout.write(`→ ${co.name}: fetch... `);
    let jobs: GhJob[] = [];
    try {
      const res = await fetch(apiUrl, { redirect: "error", signal: AbortSignal.timeout(30_000) });
      const json = (await res.json()) as { jobs?: GhJob[] };
      jobs = Array.isArray(json.jobs) ? json.jobs : [];
    } catch (err) {
      console.log(`gagal: ${err instanceof Error ? err.message : err}`);
      continue;
    }
    console.log(`${jobs.length} lowongan`);

    let taken = 0;
    for (const j of jobs) {
      if (taken >= MAX_PER_COMPANY) break;
      const title = (j.title ?? "").trim();
      const url = j.absolute_url;
      if (!title || !url) continue;
      scanned += 1;

      const desc = stripHtml(j.content ?? "");
      const skills = extractSkills(`${title}. ${desc}`, matcher);
      if (skills.length === 0) {
        skippedNoSkill += 1;
        continue; // hanya simpan role teknologi yang relevan
      }
      taken += 1;

      const location = j.location?.name ?? "Remote";
      const job = await prisma.job.upsert({
        where: { sourceUrl: url },
        create: {
          source: "greenhouse",
          sourceUrl: url,
          title,
          company: co.name,
          location,
          type: inferType(location),
          level: inferLevel(title),
          description: desc.slice(0, 4000),
          requirements: [],
          skills,
          isActive: true,
          postedAt: j.updated_at ? new Date(j.updated_at) : new Date(),
        },
        update: {
          title,
          location,
          skills,
          description: desc.slice(0, 4000),
          isActive: true,
        },
      });
      newJobIds.push(job.id);
    }
    console.log(`  ✓ ${co.name}: ${taken} role teknologi disimpan`);
  }

  console.log(`\n📊 Discan ${scanned}, dilewati (non-tech) ${skippedNoSkill}, disimpan ${newJobIds.length}`);

  // Generate embedding untuk job yang baru diingest.
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

  const live = await prisma.job.count({ where: { source: "greenhouse" } });
  console.log(`\n✅ Total lowongan live (greenhouse) di DB: ${live}`);
  await prisma.$disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ ingest:live gagal:", err);
  process.exit(1);
});
