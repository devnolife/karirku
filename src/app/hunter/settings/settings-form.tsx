"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [form, setForm] = useState({
    apply_mode: initial.apply_mode || "manual",
    salary_floor_juta: initial.salary_floor_juta || "10",
    match_threshold: initial.match_threshold || "60",
    keywords: initial.keywords || "[]",
    avoid_keywords: initial.avoid_keywords || "[]",
  });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    for (const k of ["keywords", "avoid_keywords"]) {
      try {
        JSON.parse(form[k as keyof typeof form]);
      } catch {
        setMsg(`✗ ${k} must be a JSON array`);
        return;
      }
    }
    setBusy(true);
    const res = await fetch("/api/hunter/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    setMsg(res.ok ? "✓ saved" : "✗ save failed");
    router.refresh();
  }

  const input =
    "w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:border-blue-600 focus:ring-blue-600";

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-slate-300">Apply mode</span>
        <select value={form.apply_mode} onChange={(e) => set("apply_mode", e.target.value)} className={input + " mt-1"}>
          <option value="manual">manual — I approve each job in the queue</option>
          <option value="auto">auto — apply when match ≥ threshold</option>
        </select>
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-300">Salary floor (juta IDR)</span>
          <input type="number" value={form.salary_floor_juta} onChange={(e) => set("salary_floor_juta", e.target.value)} className={input + " mt-1"} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-300">Match threshold (0–100)</span>
          <input type="number" value={form.match_threshold} onChange={(e) => set("match_threshold", e.target.value)} className={input + " mt-1"} />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium text-slate-300">Keywords (JSON array)</span>
        <textarea rows={3} value={form.keywords} onChange={(e) => set("keywords", e.target.value)} className={input + " mt-1 font-mono text-xs"} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-300">Avoid keywords (JSON array)</span>
        <textarea rows={2} value={form.avoid_keywords} onChange={(e) => set("avoid_keywords", e.target.value)} className={input + " mt-1 font-mono text-xs"} />
      </label>
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={busy} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 font-semibold text-sm disabled:opacity-50">
          {busy ? "Saving…" : "Save settings"}
        </button>
        {msg && <span className="text-sm text-slate-400">{msg}</span>}
      </div>
    </div>
  );
}
