import { hunterDb } from "@devnolife/karirku-core/hunter";
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
    <div className="max-w-2xl space-y-8">
      <div className="border-b border-[#262B24] pb-5">
        <h1 className="text-3xl font-black uppercase tracking-tight">Settings</h1>
      </div>
      <SettingsForm initial={settings} />
      <div className="space-y-1 [font-family:var(--font-hunter-mono)] text-[11px] leading-relaxed text-[#4C5349]">
        <p>&gt; salary rule (hard-coded in apply-engine): never offer below a job&apos;s stated minimum; floor {settings.salary_floor_juta || "10"} jt if unstated.</p>
        <p>&gt; unknown screening questions are skipped with a reason — never guessed.</p>
        <p>&gt; linkedin &amp; upwork are scan-only (apply is bot-blocked / needs connects).</p>
      </div>
    </div>
  );
}
