/**
 * POST /api/newsletter — pendaftaran newsletter dari footer landing page.
 * Body: { email: string }
 *
 * Tanpa provider email eksternal, endpoint hanya memvalidasi + mencatat pendaftaran.
 * Set NEWSLETTER_WEBHOOK_URL untuk meneruskan ke penyedia (Mailchimp, Buttondown, dst).
 */

import { NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

export async function POST(req: Request) {
  let email: string;
  try {
    email = BodySchema.parse(await req.json()).email;
  } catch {
    return NextResponse.json(
      { error: "Masukkan alamat email yang valid." },
      { status: 400 },
    );
  }

  const webhook = process.env.NEWSLETTER_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "landing-footer" }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`webhook responded ${res.status}`);
    } catch (err) {
      console.error("[newsletter] webhook gagal:", err);
      return NextResponse.json(
        { error: "Gagal menyimpan pendaftaran. Coba lagi sebentar lagi." },
        { status: 502 },
      );
    }
  } else {
    console.info(`[newsletter] pendaftaran baru: ${email}`);
  }

  return NextResponse.json({ ok: true });
}
