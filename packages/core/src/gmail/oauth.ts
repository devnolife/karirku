import { google } from "googleapis";

export const GMAIL_READONLY_SCOPE =
  "https://www.googleapis.com/auth/gmail.readonly";

// Derived from `googleapis` (a direct dependency) rather than imported from
// google-auth-library, so the emitted .d.ts stays portable instead of pointing
// at a transitive pnpm store path.
export type GmailOAuthClient = InstanceType<typeof google.auth.OAuth2>;

export function gmailOAuthClient(origin: string): GmailOAuthClient {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET belum diset");
  }
  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    new URL("/api/auth/gmail/callback", origin).toString(),
  );
}
