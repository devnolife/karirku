import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

const VERSION = "v1";

function encryptionKey(): Buffer {
  const configured = process.env.OAUTH_TOKEN_ENCRYPTION_KEY;
  if (!configured && process.env.NODE_ENV === "production") {
    throw new Error("OAUTH_TOKEN_ENCRYPTION_KEY wajib di-set di production");
  }
  return createHash("sha256")
    .update(
      configured ??
        process.env.AUTOFILL_TOKEN_SECRET ??
        "karirku-oauth-dev-only-key",
    )
    .digest();
}

/** AES-256-GCM envelope: version.iv.tag.ciphertext (base64url). */
export function encryptSecret(plainText: string): string {
  if (!plainText) throw new Error("encryptSecret: empty plaintext");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    VERSION,
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptSecret(envelope: string): string {
  const [version, ivRaw, tagRaw, cipherRaw] = envelope.split(".");
  if (version !== VERSION || !ivRaw || !tagRaw || !cipherRaw) {
    throw new Error("decryptSecret: invalid envelope");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivRaw, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(cipherRaw, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
