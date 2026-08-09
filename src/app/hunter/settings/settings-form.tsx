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
    setMsg(res.ok ? "[OK] saved" : "[FAIL] save failed");
    router.refresh();
  }

  const input =
    "w-full border border-[#262B24] bg-[#0A0C09] px-3 py-2 text-sm text-[#E6E4DC] placeholder:text-[#4C5349] focus:border-[#FF6B1A] focus:outline-none";
  const label = "text-[10px] font-medium uppercase tracking-[0.16em] text-[#8A9088]";

  return (
    <div className="space-y-4 border border-[#262B24] p-5">
      <label className="block">
        <span className={label}>Apply mode</span>
        <select value={form.apply_mode} onChange={(e) => set("apply_mode", e.target.value)} className={input + " mt-1.5"}>
          <option value="manual">manual — I approve each job in the queue</option>
          <option value="auto">auto — apply when match ≥ threshold</option>
        </select>
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className={label}>Salary floor (juta IDR)</span>
          <input type="number" value={form.salary_floor_juta} onChange={(e) => set("salary_floor_juta", e.target.value)} className={input + " mt-1.5 [font-family:var(--font-hunter-mono)] tabular-nums"} />
        </label>
        <label className="block">
          <span className={label}>Match threshold (0–100)</span>
          <input type="number" value={form.match_threshold} onChange={(e) => set("match_threshold", e.target.value)} className={input + " mt-1.5 [font-family:var(--font-hunter-mono)] tabular-nums"} />
        </label>
      </div>
      <label className="block">
        <span className={label}>Keywords (JSON array)</span>
        <textarea rows={3} value={form.keywords} onChange={(e) => set("keywords", e.target.value)} className={input + " mt-1.5 [font-family:var(--font-hunter-mono)] text-xs"} />
      </label>
      <label className="block">
        <span className={label}>Avoid keywords (JSON array)</span>
        <textarea rows={2} value={form.avoid_keywords} onChange={(e) => set("avoid_keywords", e.target.value)} className={input + " mt-1.5 [font-family:var(--font-hunter-mono)] text-xs"} />
      </label>
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={busy}
          className="border border-[#FF6B1A] bg-[#FF6B1A] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0D0F0C] transition-colors duration-150 ease-out hover:border-[#FF8140] hover:bg-[#FF8140] active:scale-[0.97] disabled:opacity-40"
        >
          {busy ? "Saving…" : "Save settings"}
        </button>
        {msg && <span className="[font-family:var(--font-hunter-mono)] text-xs text-[#8A9088]">{msg}</span>}
      </div>
    </div>
  );
}
