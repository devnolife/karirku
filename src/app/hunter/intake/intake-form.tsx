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
        `[QUEUED] pid ${data.pid} — job muncul di Jobs Queue setelah ekstraksi + evaluasi LLM selesai (bisa beberapa menit).`,
      );
      setUrl("");
      setText("");
      setFile(null);
      setTimeout(() => router.refresh(), 5000);
    } catch (e) {
      setMsg("[FAIL] " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const tab = (m: Mode, label: string) => (
    <button
      key={m}
      onClick={() => setMode(m)}
      className={
        "border px-3 py-1.5 [font-family:var(--font-hunter-mono)] text-[10px] uppercase tracking-[0.12em] transition-colors duration-150 ease-out " +
        (mode === m
          ? "border-[#FF6B1A] bg-[#FF6B1A] text-[#0D0F0C]"
          : "border-[#262B24] text-[#8A9088] hover:border-[#4C5349] hover:text-[#E6E4DC]")
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
    <div className="space-y-4 border border-[#262B24] p-5">
      <div className="flex gap-1.5">{[tab("url", "URL"), tab("image", "Image"), tab("text", "Text")]}</div>

      {mode === "url" && (
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://perusahaan.com/careers/backend-engineer"
          className="w-full border border-[#262B24] bg-[#0A0C09] px-3 py-2 [font-family:var(--font-hunter-mono)] text-sm text-[#E6E4DC] placeholder:text-[#4C5349] focus:border-[#FF6B1A] focus:outline-none"
        />
      )}
      {mode === "text" && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Tempel deskripsi / requirement lowongan di sini…"
          className="w-full border border-[#262B24] bg-[#0A0C09] px-3 py-2 [font-family:var(--font-hunter-mono)] text-sm text-[#E6E4DC] placeholder:text-[#4C5349] focus:border-[#FF6B1A] focus:outline-none"
        />
      )}
      {mode === "image" && (
        <div className="space-y-2">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-[#8A9088] file:mr-3 file:border file:border-[#262B24] file:bg-transparent file:px-3 file:py-1.5 file:[font-family:var(--font-hunter-mono)] file:text-[10px] file:uppercase file:tracking-[0.12em] file:text-[#8A9088]"
          />
          <p className="[font-family:var(--font-hunter-mono)] text-[11px] text-[#4C5349]">
            screenshot requirement (png/jpg/webp/gif, maks 8 MB) — dibaca via vision LLM lokal.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul (opsional — dideteksi otomatis)"
          className="border border-[#262B24] bg-[#0A0C09] px-3 py-2 text-sm text-[#E6E4DC] placeholder:text-[#4C5349] focus:border-[#FF6B1A] focus:outline-none"
        />
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Perusahaan (opsional)"
          className="border border-[#262B24] bg-[#0A0C09] px-3 py-2 text-sm text-[#E6E4DC] placeholder:text-[#4C5349] focus:border-[#FF6B1A] focus:outline-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-[#8A9088]">
        <input type="checkbox" checked={noDocs} onChange={(e) => setNoDocs(e.target.checked)} className="accent-[#FF6B1A]" />
        Hanya evaluasi (skip tailor CV &amp; cover letter)
      </label>

      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={busy || !canSubmit}
          className="border border-[#FF6B1A] bg-[#FF6B1A] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0D0F0C] transition-colors duration-150 ease-out hover:border-[#FF8140] hover:bg-[#FF8140] active:scale-[0.97] disabled:opacity-40"
        >
          {busy ? "…" : "Proses & Siapkan Lamaran"}
        </button>
      </div>
      {msg && <p className="[font-family:var(--font-hunter-mono)] text-xs text-[#8A9088]">{msg}</p>}
    </div>
  );
}
