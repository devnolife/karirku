/**
 * Extension token — HMAC stateless agar tetap berfungsi di mock mode
 * (tanpa DB). Saat DATABASE_URL aktif, hash token juga dicatat ke tabel
 * extension_tokens (best-effort) untuk audit/revocation.
 *
 * Format token: base64url(payload-json) + "." + base64url(hmac-sha256)
 * Payload: { uid, scope, exp }
 */

import { createHmac, createHash, timingSafeEqual } from "node:crypto";

const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 hari
export const TOKEN_SCOPE = "autofill";

function secret(): string {
  const s = process.env.AUTOFILL_TOKEN_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("[autofill] AUTOFILL_TOKEN_SECRET wajib di-set di production");
  }
  return "karirku-autofill-dev-secret";
}

interface TokenPayload {
  uid: string;
  scope: string;
  exp: number; // epoch ms
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function sign(payloadB64: string): string {
  return b64url(createHmac("sha256", secret()).update(payloadB64).digest());
}

/** Terbitkan token baru untuk user. */
export function issueToken(userId: string, ttlMs: number = DEFAULT_TTL_MS): {
  token: string;
  expiresAt: Date;
} {
  const exp = Date.now() + ttlMs;
  const payload: TokenPayload = { uid: userId, scope: TOKEN_SCOPE, exp };
  const payloadB64 = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  return {
    token: `${payloadB64}.${sign(payloadB64)}`,
    expiresAt: new Date(exp),
  };
}

/** Verifikasi token. Return userId atau null bila tidak valid/kedaluwarsa. */
export function verifyToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = sign(payloadB64);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as TokenPayload;
    if (payload.scope !== TOKEN_SCOPE) return null;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    if (typeof payload.uid !== "string" || !payload.uid) return null;
    return payload.uid;
  } catch {
    return null;
  }
}

/** Hash SHA-256 token — hanya ini yang disimpan ke DB. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Ambil bearer token dari header Authorization. */
export function bearerFromRequest(req: Request): string | null {
  const h = req.headers.get("authorization") ?? "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}
