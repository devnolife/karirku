import { hunterDb, gmailStatus } from "@/core/hunter";
import { authorizeHunterApi } from "@/lib/hunter-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await authorizeHunterApi();
  if (!access.ok) return access.response;

  const db = hunterDb().getDb();
  const accounts = db
    .prepare(
      `SELECT platform, username, profile_url, can_auto_apply, login_status, last_checked FROM accounts ORDER BY platform`
    )
    .all();
  const stats = {
    jobs: db.prepare(`SELECT COUNT(*) n FROM jobs`).get(),
    jobsNew: db.prepare(`SELECT COUNT(*) n FROM jobs WHERE status='new'`).get(),
    applications: db.prepare(`SELECT COUNT(*) n FROM applications`).get(),
    replied: db
      .prepare(`SELECT COUNT(*) n FROM applications WHERE reply_status NOT IN ('silent')`)
      .get(),
  };
  return Response.json({ accounts, stats, gmail: gmailStatus() });
}
