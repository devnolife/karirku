import { google } from "googleapis";

export const GMAIL_READONLY_SCOPE =
  "https://www.googleapis.com/auth/gmail.readonly";

export function gmailOAuthClient(origin: string) {
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
