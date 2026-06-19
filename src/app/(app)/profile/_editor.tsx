"use client";

import { useState, useTransition } from "react";
import { SkillPicker, type PickerSkill } from "@/components/SkillPicker";

export type EditableSkill = {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  verified: boolean;
};

const PROF_LABEL = ["", "Pemula", "Dasar", "Menengah", "Mahir", "Ahli"];

/**
 * Editor skill interaktif: atur proficiency 1-5, hapus, tambah via picker.
 * Submit ke server actions yang diberikan parent.
 */
export function ProfileSkillsEditor({
  skills,
  catalog,
  saveSkills,
  setProficiency,
}: {
  skills: EditableSkill[];
  catalog: { category: string; skills: PickerSkill[] }[];
  saveSkills: (formData: FormData) => Promise<void>;
  setProficiency: (skillId: string, proficiency: number) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();

  const ownedIds = skills.map((s) => s.id);

  function changeProficiency(skillId: string, value: number) {
    startTransition(async () => {
      await setProficiency(skillId, value);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="act-kicker">Skill kamu ({skills.length})</span>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="act-pill-ghost !text-sm"
        >
          {adding ? "Tutup" : "+ Tambah / ubah skill"}
        </button>
      </div>

      {adding && (
        <form action={saveSkills} className="act-card-2 mt-4 p-5">
          <SkillPicker groups={catalog} initialSelected={ownedIds} />
          <div className="mt-5 flex justify-end">
            <button type="submit" className="act-pill !text-sm">Simpan skill</button>
          </div>
        </form>
      )}

      {skills.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--act-graphite)]">
          Belum ada skill. Klik &ldquo;Tambah skill&rdquo; untuk mulai.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {skills.map((s) => (
            <li key={s.id} className="act-card-2 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--act-ink)]">{s.name}</span>
                {s.verified ? (
                  <span className="act-chip act-chip-iris !py-0.5 !text-[10px]">✓ verified</span>
                ) : (
                  <span className="act-chip act-chip-mute !py-0.5 !text-[10px]">self-report</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={5}
                  defaultValue={s.proficiency}
                  disabled={pending}
                  onChange={(e) => changeProficiency(s.id, Number(e.target.value))}
                  className="w-32 accent-[var(--act-blue)]"
                  aria-label={`Proficiency ${s.name}`}
                />
                <span className="w-16 text-xs font-medium text-[var(--act-graphite)]">
                  {PROF_LABEL[s.proficiency] ?? s.proficiency}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
