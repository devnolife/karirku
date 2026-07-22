"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const input =
  "w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:border-blue-600 focus:ring-blue-600";
const label = "text-sm font-medium text-slate-300";

export function JobForm() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const data = new FormData(formEl);
    if (!String(data.get("title") || "").trim()) {
      setMsg("✗ judul wajib diisi");
      return;
    }
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/hunter/jobs", { method: "POST", body: data });
    setBusy(false);
    if (res.ok) {
      setMsg("✓ job tersimpan");
      formEl.reset();
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      router.push("/hunter/jobs?platform=manual&status=new");
      router.refresh();
    } else {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setMsg(`✗ ${body?.error || "gagal menyimpan"}`);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
      <label className="block">
        <span className={label}>Judul lowongan *</span>
        <input name="title" required className={input + " mt-1"} placeholder="AI Engineer" />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className={label}>Perusahaan</span>
          <input name="company" className={input + " mt-1"} />
        </label>
        <label className="block">
          <span className={label}>Lokasi</span>
          <input name="location" className={input + " mt-1"} />
        </label>
      </div>
      <label className="block">
        <span className={label}>Link lowongan</span>
        <input name="url" type="url" className={input + " mt-1"} placeholder="https://…" />
      </label>
      <div className="grid grid-cols-3 gap-4">
        <label className="block">
          <span className={label}>Gaji min</span>
          <input name="salary_min" type="number" className={input + " mt-1"} />
        </label>
        <label className="block">
          <span className={label}>Gaji max</span>
          <input name="salary_max" type="number" className={input + " mt-1"} />
        </label>
        <label className="block">
          <span className={label}>Mata uang</span>
          <select name="currency" className={input + " mt-1"} defaultValue="IDR">
            <option value="IDR">IDR (juta)</option>
            <option value="USD">USD</option>
          </select>
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input name="remote" type="checkbox" className="rounded border-slate-700 bg-slate-900" />
        Remote
      </label>
      <label className="block">
        <span className={label}>Deskripsi lowongan</span>
        <textarea name="description" rows={6} className={input + " mt-1"} placeholder="Paste job description di sini…" />
      </label>
      <label className="block">
        <span className={label}>Screenshot lowongan (jpg/png/webp, maks 5 MB)</span>
        <input name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={onImageChange}
          className="mt-1 block w-full text-sm text-slate-400 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-sm file:text-slate-200 hover:file:bg-slate-700" />
      </label>
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="preview screenshot" className="max-h-64 rounded-lg border border-slate-800" />
      )}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 font-semibold text-sm disabled:opacity-50">
          {busy ? "Menyimpan…" : "Simpan job"}
        </button>
        {msg && <span className="text-sm text-slate-400">{msg}</span>}
      </div>
    </form>
  );
}
