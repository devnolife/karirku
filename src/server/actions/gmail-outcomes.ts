"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  decideGmailOutcomeSuggestion,
  disconnectGmail,
} from "@/server/queries/gmail-outcomes";

export async function decideGmailSuggestionAction(
  suggestionId: string,
  decision: "confirm" | "dismiss",
): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser();
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(suggestionId)) {
    return { ok: false, message: "ID saran tidak valid." };
  }
  const updated = await decideGmailOutcomeSuggestion(
    user.id,
    suggestionId,
    decision,
  );
  if (!updated) return { ok: false, message: "Saran tidak ditemukan." };
  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return {
    ok: true,
    message:
      decision === "confirm" ? "Status diperbarui." : "Saran diabaikan.",
  };
}

export async function disconnectGmailAction(): Promise<void> {
  const user = await requireUser();
  await disconnectGmail(user.id);
  revalidatePath("/applications");
}
