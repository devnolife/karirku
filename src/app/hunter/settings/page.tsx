import { hunterDb } from "@/core/hunter";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const rows = hunterDb().getDb().prepare(`SELECT key, value FROM settings`).all() as {
    key: string;
    value: string;
  }[];
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-extrabold">Settings</h1>
      <SettingsForm initial={settings} />
      <div className="text-xs text-slate-500 space-y-1">
        <p>• Salary rule (hard-coded in apply-engine): never offer below a job&apos;s stated minimum; floor {settings.salary_floor_juta || "10"} jt if unstated.</p>
        <p>• Unknown screening questions are skipped with a reason — never guessed.</p>
        <p>• LinkedIn &amp; Upwork are scan-only (apply is bot-blocked / needs Connects).</p>
      </div>
    </div>
  );
}
