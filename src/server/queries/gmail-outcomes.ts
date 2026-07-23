import { prisma } from "@/lib/db";
import { highestStageReached } from "@/lib/applications/status";

export type GmailOutcomeSuggestionView = {
  id: string;
  applicationId: string;
  jobTitle: string;
  company: string;
  suggestedStatus: string;
  confidence: number;
  senderDomain: string | null;
  subjectPreview: string | null;
  receivedAt: string | null;
};

export type GmailOutcomeAssistView = {
  connected: boolean;
  email: string | null;
  lastSyncedAt: string | null;
  suggestions: GmailOutcomeSuggestionView[];
};

export async function getGmailOutcomeAssist(
  userId: string,
): Promise<GmailOutcomeAssistView> {
  const [connection, suggestions] = await Promise.all([
    prisma.gmailConnection.findUnique({
      where: { userId },
      select: { email: true, lastSyncedAt: true },
    }),
    prisma.gmailStatusSuggestion.findMany({
      where: { userId, state: "pending", applicationId: { not: null } },
      orderBy: [{ confidence: "desc" }, { createdAt: "desc" }],
      take: 20,
      include: {
        application: {
          include: {
            job: { select: { title: true, company: true } },
          },
        },
      },
    }),
  ]);

  return {
    connected: Boolean(connection),
    email: connection?.email ?? null,
    lastSyncedAt:
      connection?.lastSyncedAt?.toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }) ?? null,
    suggestions: suggestions.flatMap((suggestion) => {
      if (!suggestion.applicationId || !suggestion.application) return [];
      return [
        {
          id: suggestion.id,
          applicationId: suggestion.applicationId,
          jobTitle: suggestion.application.job.title,
          company: suggestion.application.job.company ?? "—",
          suggestedStatus: suggestion.suggestedStatus,
          confidence: suggestion.confidence,
          senderDomain: suggestion.senderDomain,
          subjectPreview: suggestion.subjectPreview,
          receivedAt:
            suggestion.receivedAt?.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }) ?? null,
        },
      ];
    }),
  };
}

export async function decideGmailOutcomeSuggestion(
  userId: string,
  suggestionId: string,
  decision: "confirm" | "dismiss",
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const claimed = await tx.gmailStatusSuggestion.updateMany({
      where: { id: suggestionId, userId, state: "pending" },
      data: {
        state: decision === "confirm" ? "confirmed" : "dismissed",
        decidedAt: new Date(),
      },
    });
    if (claimed.count !== 1) return false;

    const suggestion = await tx.gmailStatusSuggestion.findUnique({
      where: { id: suggestionId },
      select: {
        id: true,
        applicationId: true,
        suggestedStatus: true,
        confidence: true,
        messageIdHash: true,
        senderDomain: true,
      },
    });
    if (!suggestion) return false;

    if (decision === "dismiss" || !suggestion.applicationId) return true;

    await tx.$queryRaw`
      SELECT id
      FROM applications
      WHERE id = ${suggestion.applicationId}::uuid
        AND user_id = ${userId}::uuid
      FOR UPDATE
    `;
    const application = await tx.application.findFirst({
      where: { id: suggestion.applicationId, userId },
      include: { outcome: true },
    });
    if (!application) return false;
    const status = suggestion.suggestedStatus;
    const stageReached = highestStageReached(
      application.outcome?.stageReached,
      status,
    );
    await tx.application.update({
      where: { id: application.id },
      data: {
        status,
        events: {
          create: {
            status,
            source: "email",
            confidence: suggestion.confidence,
            emailRefHash: suggestion.messageIdHash,
            note: `Dikonfirmasi dari email ${suggestion.senderDomain ?? "rekruter"}.`,
          },
        },
        outcome: {
          upsert: {
            create: { stageReached },
            update: { stageReached },
          },
        },
      },
    });
    return true;
  });
}

export async function disconnectGmail(userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.gmailStatusSuggestion.updateMany({
      where: { userId, state: "pending" },
      data: { state: "dismissed", decidedAt: new Date() },
    }),
    prisma.gmailConnection.deleteMany({ where: { userId } }),
  ]);
}
