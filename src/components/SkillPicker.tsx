"use client";

import { useState } from "react";

export type PickerSkill = { id: string; name: string; category: string };

const CATEGORY_LABEL: Record<string, string> = {
  programming: "Bahasa Pemrograman",
  frontend: "Frontend",
  backend: "Backend",
  mobile: "Mobile",
  data: "Data & AI",
  devops: "DevOps & Cloud",
  design: "Design",
  marketing: "Marketing",
  business: "Bisnis & Manajemen",
  soft: "Soft Skills",
  lain: "Lainnya",
};

/**
 * Multi-select skill dikelompokkan per kategori. Menyimpan pilihan sebagai
 * input[name="skill"] tersembunyi agar ikut submit form server action.
 */
export function SkillPicker({
  groups,
  initialSelected = [],
  name = "skill",
}: {
  groups: { category: string; skills: PickerSkill[] }[];
  initialSelected?: string[];
  name?: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const [query, setQuery] = useState("");

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const q = query.trim().toLowerCase();

  return (
    <div>
      {/* Hidden inputs untuk submit */}
      {[...selected].map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}

      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari skill…"
          className="act-field !h-11 max-w-xs"
        />
        <span className="act-chip act-chip-blue flex-none">{selected.size} dipilih</span>
      </div>

      <div className="mt-5 space-y-6">
        {groups.map((g) => {
          const visible = q
            ? g.skills.filter((s) => s.name.toLowerCase().includes(q))
            : g.skills;
          if (visible.length === 0) return null;
          return (
            <div key={g.category}>
              <h3 className="act-kicker mb-2.5">{CATEGORY_LABEL[g.category] ?? g.category}</h3>
              <div className="flex flex-wrap gap-2">
                {visible.map((s) => {
                  const on = selected.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggle(s.id)}
                      aria-pressed={on}
                      className={
                        on
                          ? "rounded-full border border-[var(--act-blue)] bg-[var(--act-sky-50)] px-3.5 py-1.5 text-sm font-semibold text-[var(--act-blue)] shadow-[0_0_0_3px_rgba(0,152,242,0.1)] transition-all"
                          : "rounded-full border border-[rgba(15,23,42,0.12)] bg-[var(--act-mist)] px-3.5 py-1.5 text-sm font-medium text-[var(--act-charcoal)] transition-all hover:border-[var(--act-blue)]"
                      }
                    >
                      {on && <span className="mr-1 text-[var(--act-blue)]">✓</span>}
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
