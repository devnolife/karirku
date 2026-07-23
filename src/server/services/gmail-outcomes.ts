import { createHash } from "node:crypto";
import { google } from "googleapis";
import { prisma } from "@/lib/db";
import { decryptSecret, encryptSecret } from "@/lib/security/secrets";
import { gmailOAuthClient } from "@/lib/gmail/oauth";
import type { ApplicationStatusValue } from "@/lib/applications/status";

type Classification = {
  status: ApplicationStatusValue;
  confidence: number;
} | null;

const STATUS_PATTERNS: Array<{
  status: ApplicationStatusValue;
  confidence: number;
  pattern: RegExp;
}> = [
  // Negative outcome must win when a subject also mentions interview/offer.
  {
    status: "rejected",
    confidence: 0.96,
    pattern:
      /unfortunately|not moving forward|cannot offer|unable to offer|tidak dapat melanjutkan|belum berhasil|rejected|penolakan/i,
  },
  {
    status: "offered",
    confidence: 0.96,
    pattern: /\boffer\b|job offer|penawaran kerja|surat penawaran/i,
  },
  {
    status: "interview",
    confidence: 0.92,
    pattern:
      /interview|wawancara|technical test|coding test|assessment|tes teknis|jadwal bertemu/i,
  },
  {
    status: "screened",
    confidence: 0.78,
    pattern:
      /shortlist|screening|reviewing your application|application update|proses seleksi|tahap berikutnya/i,
  },
];

export function classifyRecruitmentEmail(
  subject: string,
  snippet: string,
): Classification {
  const text = `${subject} ${snippet}`.replace(/\s+/g, " ").trim();
  for (const rule of STATUS_PATTERNS) {
    if (rule.pattern.test(text)) {
      return { status: rule.status, confidence: rule.confidence };
    }
  }
  return null;
}

function keywords(value: string): string[] {
  const stop = new Set([
    "the",
    "and",
    "for",
    "with",
    "engineer",
    "developer",
    "specialist",
    "pt",
    "inc",
    "ltd",
  ]);
  return value
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((word) => word.length >= 3 && !stop.has(word));
}

export function applicationEmailMatchScore(
  subjectAndSnippet: string,
  company: string | null,
  title: string,
): number {
  const haystack = subjectAndSnippet.toLowerCase();
  const companyTokens = keywords(company ?? "");
  const titleTokens = keywords(title);
  const companyHits = companyTokens.filter((token) =>
    haystack.includes(token),
  ).length;
  const titleHits = titleTokens.filter((token) =>
    haystack.includes(token),
  ).length;
  const companyScore = companyTokens.length
    ? companyHits / companyTokens.length
    : 0;
  const titleScore = titleTokens.length ? titleHits / titleTokens.length : 0;
  return Math.min(1, companyScore * 0.65 + titleScore * 0.35);
}

function header(
  headers: Array<{ name?: string | null; value?: string | null }> | undefined,
  name: string,
): string {
  return (
    headers?.find(
      (item) => item.name?.toLowerCase() === name.toLowerCase(),
    )?.value ?? ""
  );
}

function senderDomain(from: string): string | null {
  const match = from.match(/@([a-z0-9.-]+\.[a-z]{2,})/i);
  return match?.[1]?.toLowerCase() ?? null;
}

export type GmailSyncResult = {
  scanned: number;
  suggested: number;
  unmatched: number;
};

/** Read metadata, propose status changes, and never mutate applications. */
export async function syncGmailOutcomeSuggestions(
  userId: string,
  origin: string,
  days = 30,
): Promise<GmailSyncResult> {
  const connection = await prisma.gmailConnection.findUnique({
    where: { userId },
  });
  if (!connection?.encryptedRefreshToken) {
    throw new Error("Gmail belum terhubung");
  }

  const client = gmailOAuthClient(origin);
  client.setCredentials({
    access_token: connection.encryptedAccessToken
      ? decryptSecret(connection.encryptedAccessToken)
      : undefined,
    refresh_token: decryptSecret(connection.encryptedRefreshToken),
    expiry_date: connection.tokenExpiresAt?.getTime(),
  });
  const gmail = google.gmail({ version: "v1", auth: client });

  const applications = await prisma.application.findMany({
    where: { userId },
    orderBy: { appliedAt: "desc" },
    take: 200,
    include: {
      job: { select: { title: true, company: true } },
    },
  });

  const list = await gmail.users.messages.list({
    userId: "me",
    maxResults: 75,
    q: `newer_than:${Math.max(1, Math.min(90, days))}d {interview application lamaran recruiter offer assessment screening}`,
  });

  let scanned = 0;
  let suggested = 0;
  let unmatched = 0;

  for (const item of list.data.messages ?? []) {
    if (!item.id) continue;
    scanned += 1;
    const message = await gmail.users.messages.get({
      userId: "me",
      id: item.id,
      format: "metadata",
      metadataHeaders: ["Subject", "From", "Date"],
    });
    const headers = message.data.payload?.headers;
    const subject = header(headers, "Subject");
    const from = header(headers, "From");
    const snippet = message.data.snippet ?? "";
    const classification = classifyRecruitmentEmail(subject, snippet);
    if (!classification) continue;

    const haystack = `${subject} ${snippet}`;
    const ranked = applications
      .map((application) => ({
        application,
        score: applicationEmailMatchScore(
          haystack,
          application.job.company,
          application.job.title,
        ),
      }))
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    if (!best || best.score < 0.3) {
      unmatched += 1;
      continue;
    }

    const messageIdHash = createHash("sha256")
      .update(`${userId}:${item.id}`)
      .digest("hex");
    const confidence = Math.round(
      classification.confidence * best.score * 100,
    ) / 100;
    if (confidence < 0.35) {
      unmatched += 1;
      continue;
    }
    await prisma.gmailStatusSuggestion.upsert({
      where: { userId_messageIdHash: { userId, messageIdHash } },
      create: {
        userId,
        applicationId: best.application.id,
        messageIdHash,
        senderDomain: senderDomain(from),
        subjectPreview: subject.slice(0, 200) || null,
        receivedAt: message.data.internalDate
          ? new Date(Number(message.data.internalDate))
          : null,
        suggestedStatus: classification.status,
        confidence,
      },
      update: {
        applicationId: best.application.id,
        senderDomain: senderDomain(from),
        subjectPreview: subject.slice(0, 200) || null,
        suggestedStatus: classification.status,
        confidence,
      },
    });
    suggested += 1;
  }

  const credentials = client.credentials;
  await prisma.gmailConnection.update({
    where: { userId },
    data: {
      lastSyncedAt: new Date(),
      encryptedAccessToken: credentials.access_token
        ? encryptSecret(credentials.access_token)
        : connection.encryptedAccessToken,
      tokenExpiresAt: credentials.expiry_date
        ? new Date(credentials.expiry_date)
        : connection.tokenExpiresAt,
    },
  });

  return { scanned, suggested, unmatched };
}
