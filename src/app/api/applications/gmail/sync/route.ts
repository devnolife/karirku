import { z } from "zod";
import { auth } from "@/lib/auth";
import { syncGmailOutcomeSuggestions } from "@/server/services/gmail-outcomes";

const BodySchema = z.object({
  days: z.number().int().min(1).max(90).default(30),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    const raw = await req.json().catch(() => ({}));
    body = BodySchema.parse(raw);
  } catch (error) {
    return Response.json(
      {
        error: "invalid_body",
        message: error instanceof Error ? error.message : "Body tidak valid",
      },
      { status: 400 },
    );
  }

  try {
    const result = await syncGmailOutcomeSuggestions(
      session.user.id,
      new URL(req.url).origin,
      body.days,
    );
    return Response.json({ ok: true, ...result });
  } catch (error) {
    console.error(
      `[gmail-sync] gagal untuk user ${session.user.id}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return Response.json(
      { error: "sync_failed", message: "Sinkronisasi Gmail gagal." },
      { status: 502 },
    );
  }
}
