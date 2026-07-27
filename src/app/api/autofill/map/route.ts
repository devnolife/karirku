/**
 * POST /api/autofill/map — inti fitur: struktur form → mapping field→value.
 * Body: FormSnapshot (divalidasi zod). Auth: bearer extension token.
 */

import { z } from "zod";
import { prisma } from "@devnolife/karirku-core/db";
import { mapForm } from "@devnolife/karirku-core/autofill/engine";
import { getSavedAnswers } from "@devnolife/karirku-core/autofill/answers";
import { getProfileData } from "@devnolife/karirku-core/autofill/profile";
import { corsJson, corsPreflight, unauthorized, userFromRequest } from "../_lib";

const FieldSchema = z.object({
  selector: z.string().min(1).max(500),
  name: z.string().max(300).optional(),
  id: z.string().max(300).optional(),
  label: z.string().max(500).optional(),
  type: z.string().min(1).max(30),
  required: z.boolean().optional(),
  options: z.array(z.string().max(300)).max(100).optional(),
  autocomplete: z.string().max(100).optional(),
  placeholder: z.string().max(300).optional(),
});

const SnapshotSchema = z.object({
  url: z.url(),
  pageTitle: z.string().max(500).optional(),
  jobTitle: z.string().max(300).optional(),
  company: z.string().max(300).optional(),
  fields: z.array(FieldSchema).min(1).max(200),
});

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  const userId = await userFromRequest(req);
  if (!userId) return unauthorized();

  let snapshot;
  try {
    snapshot = SnapshotSchema.parse(await req.json());
  } catch (err) {
    return corsJson(
      { error: "invalid_body", message: err instanceof Error ? err.message : "Body tidak valid" },
      { status: 400 },
    );
  }

  const [profile, savedAnswers] = await Promise.all([
    getProfileData(userId),
    getSavedAnswers(userId),
  ]);
  if (!profile) {
    return corsJson(
      { error: "profile_not_found", message: "Profil user tidak ditemukan — lengkapi profil di karirku" },
      { status: 404 },
    );
  }

  const result = await mapForm(snapshot, profile, {
    // LLM bisa dimatikan via env kalau Ollama/vLLM tidak tersedia.
    useLlm: process.env.AUTOFILL_USE_LLM !== "0",
    savedAnswers,
  });

  // Best-effort log (skip di mock mode).
  if (process.env.DATABASE_URL) {
    try {
      await prisma.autofillLog.create({
        data: {
          userId,
          url: snapshot.url,
          portal: result.portal,
          fieldsTotal: snapshot.fields.length,
          fieldsFilled: result.mappings.length,
          method: result.method,
          status: "mapped",
        },
      });
    } catch (err) {
      console.warn(
        `[autofill] gagal mencatat log map: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return corsJson(result);
}
