"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/core/db";
import { revalidatePath } from "next/cache";
import { cleanRichText } from "@/core/html";
import { hostFromUrl } from "@/core/source";
import { getProfile } from "@/server/queries/profile";
import {
  extractJobFromText,
  extractJobFromImage,
  draftApplicationMessage,
} from "@/core/ai/apply-assistant";
import type { JobPostingExtraction } from "@/core/ai/schemas";
import type {
  AnalyzeResult,
  ApplyChannel,
  ApplyTone,
  DraftResult,
  ExtractedJob,
  ImportMode,
  SaveResult,
} from "@/core/apply-assistant/types";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function err(message: string): { ok: false; error: string } {
  return { ok: false, error: message };
}

function clean1(s: string, max = 300): string {
  return s.replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanList(items: string[], max = 20, itemMax = 400): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const v = raw.replace(/\s+/g, " ").trim().slice(0, itemMax);
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
    if (out.length >= max) break;
  }
  return out;
}

/** Rapikan hasil ekstraksi AI menjadi ExtractedJob yang aman ditampilkan. */
function normalizeJob(x: JobPostingExtraction): ExtractedJob {
  const email = clean1(x.applyEmail, 160);
  const applyUrl = clean1(x.applyUrl, 400);
  return {
    title: clean1(x.title, 160),
    company: clean1(x.company, 160),
    location: clean1(x.location, 160),
    employmentType: clean1(x.employmentType, 80),
    level: clean1(x.level, 60),
    description: x.description.replace(/\r/g, "").trim().slice(0, 4000),
    requirements: cleanList(x.requirements),
    skills: cleanList(x.skills, 30, 60),
    salaryText: clean1(x.salaryText, 120),
    applyEmail: /.+@.+\..+/.test(email) ? email : "",
    applyUrl: /^https?:\/\//i.test(applyUrl) ? applyUrl : "",
  };
}

/** Cocokkan skill lowongan dengan skill user (deterministik). */
function matchSkills(
  job: ExtractedJob,
  userSkillNames: string[],
): { matched: string[]; missing: string[] } {
  const userNorm = userSkillNames.map((s) => s.toLowerCase().trim());
  const haystack = [
    job.skills.join(" "),
    job.requirements.join(" "),
    job.description,
    job.title,
  ]
    .join(" ")
    .toLowerCase();

  const matched: string[] = [];
  for (const name of userSkillNames) {
    const n = name.toLowerCase().trim();
    if (!n) continue;
    const re = new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (job.skills.some((s) => s.toLowerCase() === n) || re.test(haystack)) {
      matched.push(name);
    }
  }

  const matchedNorm = new Set(matched.map((s) => s.toLowerCase()));
  const missing = job.skills.filter((s) => {
    const n = s.toLowerCase();
    return !userNorm.includes(n) && !matchedNorm.has(n);
  });

  return { matched: matched.slice(0, 30), missing: missing.slice(0, 30) };
}

/** Guard SSRF sederhana untuk fetch link (tool lokal, tetap perlu batas). */
function isFetchableUrl(url: string): boolean {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  const host = u.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host === "0.0.0.0" ||
    host === "[::1]"
  ) {
    return false;
  }
  return true;
}

async function fetchJobPage(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) throw new Error(`Halaman membalas ${res.status}`);
    const buf = await res.arrayBuffer();
    const html = new TextDecoder("utf-8").decode(buf.slice(0, 500_000));
    // Ambil hanya bagian <body>, buang script/style, lalu bersihkan jadi teks.
    const body = html.replace(/<head[\s\S]*?<\/head>/i, "");
    const stripped = body
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
    return cleanRichText(stripped);
  } finally {
    clearTimeout(timer);
  }
}

function dataUrlToBuffer(dataUrl: string): Buffer | null {
  const m = /^data:(image\/[a-z0-9.+-]+);base64,([\s\S]+)$/i.exec(dataUrl.trim());
  if (!m) return null;
  try {
    const buf = Buffer.from(m[2], "base64");
    if (buf.length === 0 || buf.length > MAX_IMAGE_BYTES) return null;
    return buf;
  } catch {
    return null;
  }
}

export type AnalyzeInput = {
  mode: ImportMode;
  text?: string;
  url?: string;
  imageDataUrl?: string;
};

/** Analisis input (link/teks/gambar) → lowongan terstruktur + kecocokan skill. */
export async function analyzeJobInput(input: AnalyzeInput): Promise<AnalyzeResult> {
  const user = await requireUser();

  let raw: JobPostingExtraction;
  let origin: { mode: ImportMode; label: string };

  try {
    if (input.mode === "link") {
      const url = (input.url ?? "").trim();
      if (!isFetchableUrl(url)) {
        return err("URL tidak valid. Gunakan tautan http/https lowongan publik.");
      }
      const pageText = await fetchJobPage(url);
      if (pageText.replace(/\s+/g, "").length < 60) {
        return err(
          "Halaman tidak bisa dibaca otomatis (mungkin butuh login/JavaScript). Coba salin-tempel teksnya.",
        );
      }
      raw = await extractJobFromText(pageText, `halaman web (${hostFromUrl(url) ?? url})`);
      if (!raw.applyUrl) raw.applyUrl = url;
      origin = { mode: "link", label: hostFromUrl(url) ?? "Tautan" };
    } else if (input.mode === "image") {
      const buf = dataUrlToBuffer(input.imageDataUrl ?? "");
      if (!buf) return err("Gambar tidak valid atau terlalu besar (maks 8MB).");
      const { job } = await extractJobFromImage(buf);
      raw = job;
      origin = { mode: "image", label: "Gambar" };
    } else {
      const text = (input.text ?? "").trim();
      if (text.length < 20) return err("Teks lowongan terlalu pendek.");
      raw = await extractJobFromText(text, "deskripsi yang ditempel user");
      origin = { mode: "text", label: "Deskripsi" };
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal menganalisis input.";
    return err(msg);
  }

  const job = normalizeJob(raw);
  if (!job.title && !job.company && job.requirements.length === 0 && job.skills.length === 0) {
    return err("Tidak menemukan detail lowongan yang bisa dikenali. Coba input lain.");
  }

  const profile = await getProfile(user.id);
  const { matched, missing } = matchSkills(job, profile.skills.map((s) => s.name));

  return { ok: true, job, origin, matchedSkills: matched, missingSkills: missing };
}

export type DraftInput = {
  job: ExtractedJob;
  tone: ApplyTone;
  channel: ApplyChannel;
  extraNote?: string;
};

/** Susun pesan lamaran yang dipersonalisasi dari lowongan + profil user. */
export async function draftApplication(input: DraftInput): Promise<DraftResult> {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const { matched } = matchSkills(input.job, profile.skills.map((s) => s.name));

  try {
    const draft = await draftApplicationMessage({
      job: {
        title: input.job.title,
        company: input.job.company,
        location: input.job.location,
        requirements: input.job.requirements,
        skills: input.job.skills,
      },
      applicant: {
        name: user.name ?? "",
        headline: profile.headline,
        summary: profile.summary,
        currentTitle: profile.contact.currentTitle,
        currentCompany: profile.contact.currentCompany,
        yearsExperience: profile.contact.yearsExperience,
        city: profile.contact.city,
        phone: profile.contact.phone,
        email: user.email ?? "",
        linkedinUrl: profile.contact.linkedinUrl,
        portfolioUrl: profile.contact.portfolioUrl,
        githubUrl: profile.contact.githubUrl,
        skills: profile.skills.map((s) => s.name),
      },
      matchedSkills: matched,
      tone: input.tone,
      channel: input.channel,
      extraNote: (input.extraNote ?? "").trim().slice(0, 500),
    });
    return { ok: true, draft };
  } catch (e) {
    console.warn("[apply-assistant] draft gagal:", e);
    return err(
      "Gagal membuat pesan lamaran (AI mungkin sibuk). Coba lagi sebentar.",
    );
  }
}

/** Simpan lowongan impor + catat sebagai lamaran (muncul di /applications). */
export async function saveImportedApplication(input: {
  job: ExtractedJob;
  message: string;
}): Promise<SaveResult> {
  const user = await requireUser();
  const job = input.job;
  if (!job.title) return err("Judul lowongan kosong, tidak bisa disimpan.");

  // sourceUrl kanonik & unik: tautan asli → mailto → sintetis per (user, judul, perusahaan).
  const slug = `${job.title}-${job.company}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
  const canonicalUrl = job.applyUrl
    ? job.applyUrl
    : job.applyEmail
      ? `mailto:${job.applyEmail}`
      : `import://${user.id}/${slug || Date.now()}`;

  try {
    const jobRow = await prisma.job.upsert({
      where: { sourceUrl: canonicalUrl },
      create: {
        source: "import",
        sourceUrl: canonicalUrl,
        title: job.title,
        company: job.company || null,
        location: job.location || null,
        description: job.description || null,
        requirements: job.requirements,
        skills: job.skills,
        // Impor pribadi user — jangan tampil di board publik.
        isActive: false,
        postedAt: new Date(),
      },
      update: {
        title: job.title,
        company: job.company || null,
        location: job.location || null,
        skills: job.skills,
      },
      select: { id: true },
    });

    const existing = await prisma.application.findFirst({
      where: { userId: user.id, jobId: jobRow.id },
      select: { id: true },
    });
    if (existing) {
      revalidatePath("/applications");
      return { ok: true, applicationId: existing.id };
    }

    const app = await prisma.application.create({
      data: {
        userId: user.id,
        jobId: jobRow.id,
        mode: "external",
        status: "applied",
        events: {
          create: {
            status: "applied",
            source: "system",
            note: `Dibuat via Asisten Lamar.\n\n${input.message.slice(0, 1800)}`,
          },
        },
      },
      select: { id: true },
    });

    revalidatePath("/applications");
    return { ok: true, applicationId: app.id };
  } catch (e) {
    console.warn("[apply-assistant] simpan gagal:", e);
    return err("Gagal menyimpan lamaran.");
  }
}
