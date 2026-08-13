/**
 * Environment contract for the Next.js app.
 *
 * The engine owns its own variables and validates them in
 * `@devnolife/karirku-core/env`; this module covers what only the web app
 * reads, then defers to the engine so a single call reports every problem.
 *
 * Called once from `instrumentation.ts`, i.e. before the first request is
 * served, so a missing OAuth secret takes the server down at boot instead of
 * turning into a 500 the first time somebody tries to sign in.
 */
import { z } from "zod";

/**
 * Treat an empty string as "not set" — Docker Compose renders `${FOO:-}` as an
 * empty string rather than omitting the variable.
 */
function optional<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((v) => (v === "" ? undefined : v), schema.optional());
}

const secret = z
  .string()
  .trim()
  .min(32, "minimal 32 karakter — generate dengan `openssl rand -base64 32`");

const webSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  NEXTAUTH_SECRET: optional(z.string().trim()),
  NEXTAUTH_URL: optional(z.string().trim().url()),

  GITHUB_CLIENT_ID: optional(z.string().trim()),
  GITHUB_CLIENT_SECRET: optional(z.string().trim()),

  NEWSLETTER_WEBHOOK_URL: optional(z.string().trim().url()),

  RECOMMENDATION_SHADOW_SAMPLE_RATE: optional(z.coerce.number().min(0).max(1)),

  AI_PROVIDER: optional(z.enum(["ollama", "github", "auto"])),
  GITHUB_MODELS_TOKEN: optional(z.string().trim()),

  // Hunter adalah alat satu-operator: profil, cover letter, dan sesi browser
  // yang dipakainya milik satu orang. Dikunci ke email pemiliknya agar admin
  // lain tidak ikut melihat riwayat lamaran dan email pribadi tersebut.
  HUNTER_OWNER_EMAIL: optional(z.string().trim().email()),
});

export type WebEnv = z.infer<typeof webSchema>;

function productionProblems(env: WebEnv): string[] {
  const problems: string[] = [];

  const parsedSecret = secret.safeParse(env.NEXTAUTH_SECRET ?? "");
  if (!parsedSecret.success) {
    problems.push(`NEXTAUTH_SECRET: ${parsedSecret.error.issues[0]?.message ?? "tidak valid"}`);
  } else if (env.NEXTAUTH_SECRET === "change-me-in-production") {
    problems.push("NEXTAUTH_SECRET masih memakai nilai contoh dari .env.example");
  }

  if (!env.NEXTAUTH_URL) {
    problems.push("NEXTAUTH_URL wajib di-set di production (dipakai untuk callback OAuth)");
  } else if (!env.NEXTAUTH_URL.startsWith("https://")) {
    problems.push("NEXTAUTH_URL harus https di production — cookie sesi di-set Secure");
  }

  // GitHub sign-in is the only login path; without it nobody can get in.
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    problems.push("GITHUB_CLIENT_ID dan GITHUB_CLIENT_SECRET wajib di-set — login lewat GitHub");
  }

  if (env.AI_PROVIDER === "github" && !env.GITHUB_MODELS_TOKEN) {
    problems.push('AI_PROVIDER="github" butuh GITHUB_MODELS_TOKEN');
  }

  return problems;
}

/**
 * Validate the web app's environment, then the engine's.
 *
 * @throws {Error} listing every problem found across both layers.
 */
export async function assertWebEnv(source: NodeJS.ProcessEnv = process.env): Promise<WebEnv> {
  const parsed = webSchema.safeParse(source);
  const problems: string[] = [];

  if (!parsed.success) {
    problems.push(...parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
  } else if (parsed.data.NODE_ENV === "production") {
    problems.push(...productionProblems(parsed.data));
  }

  const { assertCoreEnv, EnvValidationError } = await import("@devnolife/karirku-core/env");
  try {
    assertCoreEnv(source);
  } catch (err) {
    if (err instanceof EnvValidationError) problems.push(...err.problems);
    else throw err;
  }

  if (problems.length) {
    throw new Error(
      `Konfigurasi environment tidak valid:\n${problems.map((p) => `  • ${p}`).join("\n")}`,
    );
  }

  return parsed.success ? parsed.data : webSchema.parse(source);
}
