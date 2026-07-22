"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Profile = Record<string, unknown>;

const input =
  "w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:border-blue-600 focus:ring-blue-600";
const label = "text-sm font-medium text-slate-300";
const section = "rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4";

function get(obj: Profile, ...keys: string[]): string {
  let cur: unknown = obj;
  for (const k of keys) {
    if (typeof cur !== "object" || cur === null) return "";
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur == null ? "" : String(cur);
}

function getJson(obj: Profile, key: string): string {
  const v = obj[key];
  return v == null ? "[]" : JSON.stringify(v, null, 1);
}

export function ProfileForm({ initial }: { initial: Profile }) {
  const [f, setF] = useState({
    full_name: get(initial, "full_name"),
    headline: get(initial, "headline"),
    email: get(initial, "email"),
    phone: get(initial, "phone"),
    location: get(initial, "location"),
    birth_date: get(initial, "birth_date"),
    github: get(initial, "links", "github"),
    linkedin: get(initial, "links", "linkedin"),
    portfolio: get(initial, "links", "portfolio"),
    jobstreet: get(initial, "links", "jobstreet"),
    summary: get(initial, "summary"),
    degree: get(initial, "education", "degree"),
    institution: get(initial, "education", "institution"),
    field: get(initial, "education", "field"),
    grad_year: get(initial, "education", "grad_year"),
    years_experience_total: get(initial, "years_experience_total") || "5",
    years_experience_mobile: get(initial, "years_experience_mobile") || "4",
    skills: getJson(initial, "skills"),
    flagship_projects: getJson(initial, "flagship_projects"),
    salary_floor_juta: get(initial, "screening", "salary_floor_juta") || "10",
    english_level: get(initial, "screening", "english_level"),
    languages: initial.screening ? JSON.stringify((initial.screening as Profile).languages ?? []) : "[]",
    remote_preference: get(initial, "screening", "remote_preference"),
  });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  async function save() {
    let skills: unknown, projects: unknown, languages: unknown;
    try {
      skills = JSON.parse(f.skills);
      projects = JSON.parse(f.flagship_projects);
      languages = JSON.parse(f.languages);
      if (!Array.isArray(skills) || !Array.isArray(projects) || !Array.isArray(languages)) throw new Error();
    } catch {
      setMsg("✗ skills / projects / languages harus JSON array yang valid");
      return;
    }
    const profile = {
      full_name: f.full_name,
      headline: f.headline,
      email: f.email,
      phone: f.phone,
      location: f.location,
      birth_date: f.birth_date,
      links: { github: f.github, linkedin: f.linkedin, portfolio: f.portfolio, jobstreet: f.jobstreet },
      summary: f.summary,
      education: { degree: f.degree, institution: f.institution, field: f.field, grad_year: f.grad_year },
      years_experience_total: parseInt(f.years_experience_total, 10) || 0,
      years_experience_mobile: parseInt(f.years_experience_mobile, 10) || 0,
      skills,
      flagship_projects: projects,
      screening: {
        salary_floor_juta: parseInt(f.salary_floor_juta, 10) || 10,
        english_level: f.english_level,
        languages,
        remote_preference: f.remote_preference,
      },
    };
    setBusy(true);
    const res = await fetch("/api/hunter/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setBusy(false);
    setMsg(res.ok ? "✓ tersimpan" : "✗ gagal menyimpan");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className={section}>
        <h2 className="font-bold text-amber-400">Identitas</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="block col-span-2 sm:col-span-1">
            <span className={label}>Nama lengkap</span>
            <input value={f.full_name} onChange={set("full_name")} className={input + " mt-1"} />
          </label>
          <label className="block col-span-2 sm:col-span-1">
            <span className={label}>Headline</span>
            <input value={f.headline} onChange={set("headline")} className={input + " mt-1"} />
          </label>
          <label className="block">
            <span className={label}>Email</span>
            <input type="email" value={f.email} onChange={set("email")} className={input + " mt-1"} />
          </label>
          <label className="block">
            <span className={label}>Telepon/WA</span>
            <input value={f.phone} onChange={set("phone")} className={input + " mt-1"} />
          </label>
          <label className="block">
            <span className={label}>Lokasi</span>
            <input value={f.location} onChange={set("location")} className={input + " mt-1"} />
          </label>
          <label className="block">
            <span className={label}>Tanggal lahir</span>
            <input type="date" value={f.birth_date} onChange={set("birth_date")} className={input + " mt-1"} />
          </label>
        </div>
      </div>

      <div className={section}>
        <h2 className="font-bold text-amber-400">Links</h2>
        <div className="grid grid-cols-2 gap-4">
          {(["github", "linkedin", "portfolio", "jobstreet"] as const).map((k) => (
            <label key={k} className="block">
              <span className={label + " capitalize"}>{k}</span>
              <input value={f[k]} onChange={set(k)} className={input + " mt-1"} />
            </label>
          ))}
        </div>
      </div>

      <div className={section}>
        <h2 className="font-bold text-amber-400">Ringkasan (dipakai untuk cover letter)</h2>
        <textarea rows={4} value={f.summary} onChange={set("summary")} className={input} />
      </div>

      <div className={section}>
        <h2 className="font-bold text-amber-400">Pendidikan</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className={label}>Jenjang</span>
            <input value={f.degree} onChange={set("degree")} className={input + " mt-1"} />
          </label>
          <label className="block">
            <span className={label}>Institusi</span>
            <input value={f.institution} onChange={set("institution")} className={input + " mt-1"} />
          </label>
          <label className="block">
            <span className={label}>Jurusan</span>
            <input value={f.field} onChange={set("field")} className={input + " mt-1"} />
          </label>
          <label className="block">
            <span className={label}>Tahun lulus</span>
            <input value={f.grad_year} onChange={set("grad_year")} className={input + " mt-1"} />
          </label>
        </div>
      </div>

      <div className={section}>
        <h2 className="font-bold text-amber-400">Pengalaman & Skills</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className={label}>Pengalaman total (tahun)</span>
            <input type="number" value={f.years_experience_total} onChange={set("years_experience_total")} className={input + " mt-1"} />
          </label>
          <label className="block">
            <span className={label}>Pengalaman mobile (tahun)</span>
            <input type="number" value={f.years_experience_mobile} onChange={set("years_experience_mobile")} className={input + " mt-1"} />
          </label>
        </div>
        <label className="block">
          <span className={label}>Skills (JSON array)</span>
          <textarea rows={3} value={f.skills} onChange={set("skills")} className={input + " mt-1 font-mono text-xs"} />
        </label>
        <label className="block">
          <span className={label}>Proyek unggulan (JSON array of {"{name,url,note}"})</span>
          <textarea rows={5} value={f.flagship_projects} onChange={set("flagship_projects")} className={input + " mt-1 font-mono text-xs"} />
        </label>
      </div>

      <div className={section}>
        <h2 className="font-bold text-amber-400">Default Screening</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className={label}>Gaji minimum (juta IDR)</span>
            <input type="number" value={f.salary_floor_juta} onChange={set("salary_floor_juta")} className={input + " mt-1"} />
          </label>
          <label className="block">
            <span className={label}>Level Bahasa Inggris</span>
            <input value={f.english_level} onChange={set("english_level")} className={input + " mt-1"} />
          </label>
          <label className="block">
            <span className={label}>Bahasa (JSON array)</span>
            <input value={f.languages} onChange={set("languages")} className={input + " mt-1 font-mono text-xs"} />
          </label>
          <label className="block">
            <span className={label}>Preferensi kerja</span>
            <input value={f.remote_preference} onChange={set("remote_preference")} className={input + " mt-1"} placeholder="remote / hybrid / onsite" />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={busy} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 font-semibold text-sm disabled:opacity-50">
          {busy ? "Menyimpan…" : "Simpan profil"}
        </button>
        {msg && <span className="text-sm text-slate-400">{msg}</span>}
      </div>
    </div>
  );
}
