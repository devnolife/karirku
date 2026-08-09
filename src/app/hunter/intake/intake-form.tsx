"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "url" | "text" | "image";

export function IntakeForm() {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [noDocs, setNoDocs] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function submit() {
    setBusy(true);
    setMsg("");
    try {
      const body: Record<string, unknown> = { title, company, noDocs };
      if (mode === "url") {
        body.url = url;
      } else if (mode === "text") {
        body.text = text;
      } else {
        if (!file) throw new Error("Pilih gambar dulu.");
        const buf = await file.arrayBuffer();
        let bin = "";
        const bytes = new Uint8Array(buf);
        for (let i = 0; i < bytes.length; i += 0x8000) {
          bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        }
        body.imageBase64 = btoa(bin);
        body.imageMime = file.type;
      }
      const res = await fetch("/api/hunter/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { pid?: number; message?: string; error?: string };
      if (!res.ok) throw new Error(data.message ?? data.error ?? `HTTP ${res.status}`);
      setMsg(
        `▶ Diproses di background (pid ${data.pid}). Job akan muncul di Jobs Queue setelah ekstraksi + evaluasi LLM selesai (bisa beberapa menit).`,
      );
      setUrl("");
      setText("");
      setFile(null);
      setTimeout(() => router.refresh(), 5000);
    } catch (e) {
      setMsg("✗ " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const tab = (m: Mode, label: string) => (
    <button
      key={m}
      onClick={() => setMode(m)}
      className={
        "px-3 py-1.5 rounded-md text-sm font-medium transition " +
        (mode === m ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700")
      }
    >
      {label}
    </button>
  );

  const canSubmit =
    (mode === "url" && /^https?:\/\//i.test(url)) ||
    (mode === "text" && text.trim().length > 50) ||
    (mode === "image" && !!file);

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex gap-2">{[tab("url", "🔗 URL"), tab("image", "🖼 Gambar"), tab("text", "📋 Teks")]}</div>

      {mode === "url" && (
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://perusahaan.com/careers/backend-engineer"
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        />
      )}
      {mode === "text" && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Tempel deskripsi / requirement lowongan di sini…"
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-mono"
        />
      )}
      {mode === "image" && (
        <div className="space-y-2">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-slate-300"
          />
          <p className="text-xs text-slate-500">
            Screenshot requirement (png/jpg/webp/gif, maks 8 MB). Dibaca via vision LLM lokal.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul (opsional — dideteksi otomatis)"
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        />
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Perusahaan (opsional)"
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-400">
        <input type="checkbox" checked={noDocs} onChange={(e) => setNoDocs(e.target.checked)} />
        Hanya evaluasi (skip tailor CV &amp; cover letter)
      </label>

      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={busy || !canSubmit}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {busy ? "…" : "🚀 Proses & Siapkan Lamaran"}
        </button>
      </div>
      {msg && <p className="text-sm text-slate-300">{msg}</p>}
    </div>
  );
}
