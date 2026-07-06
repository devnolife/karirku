// hunter/email/gmail.js - Gmail API (OAuth, readonly) inbox sync + reply matcher.
//
// One-time setup (needs the user Google account):
//   1. console.cloud.google.com -> buat project -> enable "Gmail API"
//   2. OAuth consent screen: External, tambahkan akun sendiri sebagai test user
//   3. Credentials -> OAuth client ID -> Desktop app -> download JSON
//      -> simpan sebagai hunter/secrets/gmail-oauth.json (gitignored)
//   4. Jalankan: node hunter/run.js gmail-auth  (buka URL, paste kode)
// Catatan: akun Workspace kampus bisa memblokir OAuth app eksternal;
// fallback = IMAP app-password (lihat PRD).
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { google } = require("googleapis");
const { getDb } = require("../db");

const SECRETS_DIR = path.join(__dirname, "..", "secrets");
const CRED_PATH = path.join(SECRETS_DIR, "gmail-oauth.json");
const TOKEN_PATH = path.join(SECRETS_DIR, "gmail-token.json");
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

function isConfigured() { return fs.existsSync(CRED_PATH); }
function hasToken() { return fs.existsSync(TOKEN_PATH); }

function getOAuthClient() {
  const raw = JSON.parse(fs.readFileSync(CRED_PATH, "utf8"));
  const c = raw.installed || raw.web;
  const redirect = (c.redirect_uris && c.redirect_uris[0]) || "http://localhost";
  return new google.auth.OAuth2(c.client_id, c.client_secret, redirect);
}

/** Interactive one-time auth: prints URL, waits for pasted code, stores token. */
async function authorize() {
  if (!isConfigured()) throw new Error("Belum ada hunter/secrets/gmail-oauth.json - ikuti langkah setup di header file ini.");
  fs.mkdirSync(SECRETS_DIR, { recursive: true });
  const client = getOAuthClient();
  const authUrl = client.generateAuthUrl({ access_type: "offline", scope: SCOPES, prompt: "consent" });
  console.log("\nBuka URL ini, login dengan andi_agung@student.unismuh.ac.id, lalu paste code dari redirect URL (parameter ?code=...):\n\n" + authUrl + "\n");
  const code = await new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("Code: ", (a) => { rl.close(); resolve(a.trim()); });
  });
  const { tokens } = await client.getToken(code);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log("Token tersimpan di " + TOKEN_PATH);
  return true;
}

function getGmail() {
  if (!isConfigured() || !hasToken()) return null;
  const client = getOAuthClient();
  client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8")));
  return google.gmail({ version: "v1", auth: client });
}

// ---- classification ------------------------------------------------------
const PLATFORM_SENDERS = /jobstreet|seek|linkedin|upwork|freelancer/i;
function classify(subject, snippet) {
  const t = (subject + " " + snippet).toLowerCase();
  if (/interview|wawancara|jadwal(kan)? (panggilan|meeting)|schedule a call|invitation to interview/.test(t)) return "interview";
  if (/unfortunately|tidak dapat melanjutkan|belum berhasil|not (been )?selected|regret|maaf.*belum|rejected|tidak lolos/.test(t)) return "rejected";
  if (/offer letter|penawaran kerja|job offer|kontrak kerja/.test(t)) return "offer";
  if (/application|lamaran|applied|apply/.test(t)) return "reply";
  return "other";
}

/** Try to link an email to an application by company name / platform keywords. */
function matchApplication(dbase, fromAddr, subject, snippet) {
  const hay = (fromAddr + " " + subject + " " + snippet).toLowerCase();
  const apps = dbase.prepare("SELECT id, company, title, platform FROM applications").all();
  let best = null, bestLen = 0;
  for (const a of apps) {
    const comp = (a.company || "").toLowerCase().replace(/pt\.?\s+|cv\.?\s+|inc\.?|ltd\.?|pte\.?/g, "").trim();
    if (comp && comp.length >= 4 && hay.includes(comp) && comp.length > bestLen) { best = a; bestLen = comp.length; }
  }
  if (!best) {
    // fallback: title words (>= 2 significant words present)
    for (const a of apps) {
      const words = (a.title || "").toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 4);
      const hits = words.filter((w) => hay.includes(w)).length;
      if (hits >= 2) { best = a; break; }
    }
  }
  return best;
}

/**
 * Pull messages since the oldest un-replied application and update reply
 * status. Returns stats. Throws if OAuth not set up.
 */
async function sync({ days = 30, log = console.log } = {}) {
  const gmail = getGmail();
  if (!gmail) throw new Error("Gmail belum terhubung. Setup OAuth lalu jalankan: node hunter/run.js gmail-auth");
  const dbase = getDb();

  const q = "newer_than:" + days + "d -category:promotions -category:social";
  let pageToken = undefined, fetched = 0, linked = 0;
  do {
    const list = await gmail.users.messages.list({ userId: "me", q, maxResults: 100, pageToken });
    const msgs = list.data.messages || [];
    for (const m of msgs) {
      const exists = dbase.prepare("SELECT 1 FROM emails WHERE gmail_id=?").get(m.id);
      if (exists) continue;
      const full = await gmail.users.messages.get({ userId: "me", id: m.id, format: "metadata", metadataHeaders: ["From", "Subject", "Date"] });
      const headers = Object.fromEntries((full.data.payload.headers || []).map((h) => [h.name.toLowerCase(), h.value]));
      const fromAddr = headers.from || "";
      const subject = headers.subject || "";
      const snippet = full.data.snippet || "";
      const receivedAt = new Date(parseInt(full.data.internalDate, 10)).toISOString();
      const cls = classify(subject, snippet);
      const app = (cls !== "other" || PLATFORM_SENDERS.test(fromAddr)) ? matchApplication(dbase, fromAddr, subject, snippet) : null;
      dbase.prepare("INSERT OR IGNORE INTO emails (gmail_id, thread_id, from_addr, subject, snippet, received_at, application_id, classification) VALUES (?,?,?,?,?,?,?,?)")
        .run(m.id, full.data.threadId, fromAddr.slice(0, 200), subject.slice(0, 300), snippet.slice(0, 500), receivedAt, app ? app.id : null, cls);
      fetched++;
      if (app && cls !== "other") {
        linked++;
        const rank = { reply: 1, interview: 2, rejected: 2, offer: 3 };
        const cur = dbase.prepare("SELECT reply_status FROM applications WHERE id=?").get(app.id).reply_status;
        const curRank = { silent: 0, replied: 1, interview: 2, rejected: 2, offer: 3 }[cur] || 0;
        const newStatus = cls === "reply" ? "replied" : cls;
        if ((rank[cls] || 0) >= curRank) {
          dbase.prepare("UPDATE applications SET reply_status=?, last_reply_at=?, last_reply_snippet=? WHERE id=?")
            .run(newStatus, receivedAt, snippet.slice(0, 300), app.id);
        }
      }
    }
    pageToken = list.data.nextPageToken;
  } while (pageToken && fetched < 500);

  dbase.prepare("UPDATE accounts SET login_status='ok', last_checked=datetime('now') WHERE platform='gmail'").run();
  log("gmail sync: " + fetched + " new emails, " + linked + " linked to applications");
  return { fetched, linked };
}

/** Status for the dashboard without throwing. */
function status() {
  return { configured: isConfigured(), authorized: hasToken(), credPath: CRED_PATH };
}

module.exports = { authorize, sync, status, isConfigured, hasToken, classify, matchApplication };
