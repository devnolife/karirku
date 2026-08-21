"use client";

import { useRef, useState, useTransition } from "react";
import {
  analyzeJobInput,
  draftApplication,
  saveImportedApplication,
} from "@/server/actions/apply-assistant";
import {
  CHANNEL_OPTIONS,
  TONE_OPTIONS,
  type AnalyzeResult,
  type ApplicationDraft,
  type ApplyChannel,
  type ApplyTone,
  type ExtractedJob,
  type ImportMode,
  type ImportOrigin,
} from "@devnolife/karirku-core/apply-assistant/types";

type Step = "input" | "review" | "draft";

const MODE_TABS: { value: ImportMode; label: string; icon: string }[] = [
  { value: "link", label: "Link", icon: "M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07L11 5M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07L13 19" },
  { value: "text", label: "Deskripsi", icon: "M4 6h16M4 12h16M4 18h10" },
  { value: "image", label: "Gambar", icon: "M4 5h16v14H4zM4 15l4-4 3 3 5-5 4 4" },
];

/** Kecilkan gambar di sisi client → JPEG dataURL agar payload aman & cepat. */
function downscaleImage(file: File, maxSide = 1500, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca berkas."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Gambar tidak bisa dimuat."));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas tidak didukung."));
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function ApplyAssistant({
  ocrAvailable,
  skillCount,
}: {
  ocrAvailable: boolean;
  skillCount: number;
}) {
  const [step, setStep] = useState<Step>("input");
  const [mode, setMode] = useState<ImportMode>("link");

  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [analyzing, startAnalyze] = useTransition();
  const [analyzeError, setAnalyzeError] = useState("");

  const [job, setJob] = useState<ExtractedJob | null>(null);
  const [origin, setOrigin] = useState<ImportOrigin | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [missing, setMissing] = useState<string[]>([]);

  const [tone, setTone] = useState<ApplyTone>("formal");
  const [channel, setChannel] = useState<ApplyChannel>("email");
  const [extraNote, setExtraNote] = useState("");

  const [drafting, startDraft] = useTransition();
  const [draftError, setDraftError] = useState("");
  const [draft, setDraft] = useState<ApplicationDraft | null>(null);
  const [copied, setCopied] = useState(false);

  const [saving, startSave] = useTransition();
  const [saveMsg, setSaveMsg] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setAnalyzeError("");
    if (!file.type.startsWith("image/")) {
      setAnalyzeError("Berkas harus berupa gambar.");
      return;
    }
    try {
      const dataUrl = await downscaleImage(file);
      setImageDataUrl(dataUrl);
      setImageName(file.name);
    } catch (e) {
      setAnalyzeError(e instanceof Error ? e.message : "Gagal memproses gambar.");
    }
  }

  function analyze() {
    setAnalyzeError("");
    startAnalyze(async () => {
      const res: AnalyzeResult = await analyzeJobInput({
        mode,
        url: mode === "link" ? url : undefined,
        text: mode === "text" ? text : undefined,
        imageDataUrl: mode === "image" ? imageDataUrl : undefined,
      });
      if (!res.ok) {
        setAnalyzeError(res.error);
        return;
      }
      setJob(res.job);
      setOrigin(res.origin);
      setMatched(res.matchedSkills);
      setMissing(res.missingSkills);
      setDraft(null);
      setSaveMsg("");
      setStep("review");
    });
  }

  function generate() {
    if (!job) return;
    setDraftError("");
    setSaveMsg("");
    startDraft(async () => {
      const res = await draftApplication({ job, tone, channel, extraNote });
      if (!res.ok) {
        setDraftError(res.error);
        return;
      }
      setDraft(res.draft);
      setCopied(false);
      setStep("draft");
    });
  }

  function copyDraft() {
    if (!draft) return;
    const full = [draft.subject ? `Subjek: ${draft.subject}` : "", draft.message]
      .filter(Boolean)
      .join("\n\n");
    navigator.clipboard?.writeText(full).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => setCopied(false),
    );
  }

  function save() {
    if (!job || !draft) return;
    const full = [draft.subject ? `Subjek: ${draft.subject}` : "", draft.message]
      .filter(Boolean)
      .join("\n\n");
    startSave(async () => {
      const res = await saveImportedApplication({ job, message: full });
      setSaveMsg(res.ok ? "Tersimpan ke Lamaran ✓" : res.error);
    });
  }

  function reset() {
    setStep("input");
    setJob(null);
    setDraft(null);
    setAnalyzeError("");
    setDraftError("");
    setSaveMsg("");
    setUrl("");
    setText("");
    setImageDataUrl("");
    setImageName("");
  }

  const canAnalyze =
    (mode === "link" && url.trim().length > 8) ||
    (mode === "text" && text.trim().length > 20) ||
    (mode === "image" && imageDataUrl.length > 0);

  return (
    <div className="space-y-6">
      <Stepper step={step} />

      {step === "input" && (
        <section className="act-card-2 p-5 sm:p-7">
          {/*
            Segmented control di dalam satu track: bentuknya menegaskan bahwa
            ketiganya adalah SATU pilihan yang saling meniadakan — berbeda dari
            deretan pil terpisah yang terbaca seperti tiga tombol aksi.
          */}
          <div
            role="tablist"
            aria-label="Sumber lowongan"
            className="inline-flex gap-1 rounded-xl bg-[rgba(15,43,61,0.05)] p-1"
          >
            {MODE_TABS.map((t) => {
              const active = mode === t.value;
              const disabled = t.value === "image" && !ocrAvailable;
              return (
                <button
                  key={t.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  disabled={disabled}
                  onClick={() => setMode(t.value)}
                  className={
                    "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-colors " +
                    (active
                      ? "bg-white text-[var(--act-ink)] shadow-[0_1px_3px_rgba(15,43,61,0.14)]"
                      : "text-[var(--act-graphite)] hover:text-[var(--act-ink)]") +
                    (disabled ? " cursor-not-allowed opacity-40" : "")
                  }
                  title={disabled ? "OCR tidak tersedia di server ini" : undefined}
                >
                  <span className={active ? "text-[var(--page-accent,var(--act-blue))]" : ""}>
                    <Icon d={t.icon} />
                  </span>
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            {mode === "link" && (
              <label className="block">
                <span className="text-sm font-semibold text-[var(--act-ink)]">
                  URL lowongan
                </span>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://perusahaan.com/careers/frontend-engineer"
                  className="act-field mt-2 !border-[rgba(15,43,61,0.12)] !bg-[rgba(15,43,61,0.02)]"
                />
                <span className="mt-2 block text-xs text-[var(--act-graphite)]">
                  Tempel tautan lowongan publik. Halaman yang butuh login/JS mungkin
                  tak terbaca — pakai tab Deskripsi bila begitu.
                </span>
              </label>
            )}

            {mode === "text" && (
              <label className="block">
                <span className="text-sm font-semibold text-[var(--act-ink)]">
                  Deskripsi lowongan
                </span>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={9}
                  placeholder="Tempel teks lowongan lengkap: posisi, perusahaan, kualifikasi, skill, kontak…"
                  className="act-field mt-2 !h-auto !border-[rgba(15,43,61,0.12)] !bg-[rgba(15,43,61,0.02)] py-3"
                />
              </label>
            )}

            {mode === "image" && (
              <div>
                <span className="text-sm font-semibold text-[var(--act-ink)]">
                  Gambar / screenshot poster lowongan
                </span>
                <div className="mt-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFile(e.target.files?.[0])}
                  />
                  {imageDataUrl ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageDataUrl}
                        alt="Pratinjau lowongan"
                        className="max-h-48 w-auto rounded-[14px] border border-[rgba(15,43,61,0.12)] object-contain"
                      />
                      <div className="text-sm text-[var(--act-graphite)]">
                        <p className="font-semibold text-[var(--act-ink)]">{imageName}</p>
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="mt-1 font-semibold text-[var(--page-accent,var(--act-blue))] hover:underline"
                        >
                          Ganti gambar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex w-full flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-[rgba(15,43,61,0.18)] bg-[rgba(15,43,61,0.02)] px-4 py-10 text-center transition-colors hover:border-[var(--page-accent,var(--act-blue))] hover:bg-[var(--page-tint,var(--act-blue-50))]"
                    >
                      <Icon d="M12 16V4M12 4l-4 4M12 4l4 4M4 20h16" big />
                      <span className="text-sm font-semibold text-[var(--act-ink)]">
                        Klik untuk pilih gambar
                      </span>
                      <span className="text-xs text-[var(--act-graphite)]">
                        Teks pada gambar dibaca via OCR (Indonesia + Inggris)
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {analyzeError && <ErrorNote>{analyzeError}</ErrorNote>}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={analyze}
              disabled={!canAnalyze || analyzing}
              className="act-pill justify-center !text-sm disabled:opacity-50"
            >
              {analyzing ? "Menganalisis lowongan…" : "Analisis lowongan →"}
            </button>
          </div>
          {analyzing && (
            <p className="mt-3 text-right text-xs text-[var(--act-graphite)]">
              AI membaca & merapikan detail lowongan…
            </p>
          )}
        </section>
      )}

      {step === "review" && job && (
        <ReviewStep
          job={job}
          origin={origin}
          matched={matched}
          missing={missing}
          skillCount={skillCount}
          tone={tone}
          channel={channel}
          extraNote={extraNote}
          drafting={drafting}
          draftError={draftError}
          onJobChange={setJob}
          onTone={setTone}
          onChannel={setChannel}
          onExtraNote={setExtraNote}
          onBack={reset}
          onGenerate={generate}
        />
      )}

      {step === "draft" && draft && job && (
        <DraftStep
          draft={draft}
          job={job}
          channel={channel}
          copied={copied}
          drafting={drafting}
          saving={saving}
          saveMsg={saveMsg}
          onCopy={copyDraft}
          onRegenerate={generate}
          onSave={save}
          onEdit={() => setStep("review")}
          onReset={reset}
        />
      )}
    </div>
  );
}

/* ---------------- Review step ---------------- */

function ReviewStep({
  job,
  origin,
  matched,
  missing,
  skillCount,
  tone,
  channel,
  extraNote,
  drafting,
  draftError,
  onJobChange,
  onTone,
  onChannel,
  onExtraNote,
  onBack,
  onGenerate,
}: {
  job: ExtractedJob;
  origin: ImportOrigin | null;
  matched: string[];
  missing: string[];
  skillCount: number;
  tone: ApplyTone;
  channel: ApplyChannel;
  extraNote: string;
  drafting: boolean;
  draftError: string;
  onJobChange: (j: ExtractedJob) => void;
  onTone: (t: ApplyTone) => void;
  onChannel: (c: ApplyChannel) => void;
  onExtraNote: (v: string) => void;
  onBack: () => void;
  onGenerate: () => void;
}) {
  function set<K extends keyof ExtractedJob>(key: K, value: ExtractedJob[K]) {
    onJobChange({ ...job, [key]: value });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="act-card-2 space-y-5 p-5 sm:p-7">
        <div className="flex items-center justify-between">
          <span className="act-kicker">Tinjau & rapikan</span>
          {origin && (
            <span className="act-chip act-chip-mute">
              Dari: {origin.label}
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <LField label="Posisi">
            <input value={job.title} onChange={(e) => set("title", e.target.value)} className="act-field !border-[rgba(15,43,61,0.12)] !bg-[rgba(15,43,61,0.02)]" />
          </LField>
          <LField label="Perusahaan">
            <input value={job.company} onChange={(e) => set("company", e.target.value)} className="act-field !border-[rgba(15,43,61,0.12)] !bg-[rgba(15,43,61,0.02)]" />
          </LField>
          <LField label="Lokasi">
            <input value={job.location} onChange={(e) => set("location", e.target.value)} className="act-field !border-[rgba(15,43,61,0.12)] !bg-[rgba(15,43,61,0.02)]" />
          </LField>
          <LField label="Tipe / Level">
            <input
              value={[job.employmentType, job.level].filter(Boolean).join(" · ")}
              onChange={(e) => set("employmentType", e.target.value)}
              className="act-field !border-[rgba(15,43,61,0.12)] !bg-[rgba(15,43,61,0.02)]"
            />
          </LField>
        </div>

        <LField label="Skill diminta (pisahkan koma)">
          <input
            value={job.skills.join(", ")}
            onChange={(e) => set("skills", splitList(e.target.value, ","))}
            className="act-field !border-[rgba(15,43,61,0.12)] !bg-[rgba(15,43,61,0.02)]"
          />
        </LField>

        <LField label="Kualifikasi (satu per baris)">
          <textarea
            value={job.requirements.join("\n")}
            onChange={(e) => set("requirements", splitList(e.target.value, "\n"))}
            rows={5}
            className="act-field !h-auto !border-[rgba(15,43,61,0.12)] !bg-[rgba(15,43,61,0.02)] py-3"
          />
        </LField>

        <LField label="Deskripsi">
          <textarea
            value={job.description}
            onChange={(e) => set("description", e.target.value)}
            rows={5}
            className="act-field !h-auto !border-[rgba(15,43,61,0.12)] !bg-[rgba(15,43,61,0.02)] py-3"
          />
        </LField>

        <div className="grid gap-4 sm:grid-cols-2">
          <LField label="Email lamaran (opsional)">
            <input value={job.applyEmail} onChange={(e) => set("applyEmail", e.target.value)} placeholder="hr@perusahaan.com" className="act-field !border-[rgba(15,43,61,0.12)] !bg-[rgba(15,43,61,0.02)]" />
          </LField>
          <LField label="Gaji (opsional)">
            <input value={job.salaryText} onChange={(e) => set("salaryText", e.target.value)} placeholder="Rp 10–15 jt" className="act-field !border-[rgba(15,43,61,0.12)] !bg-[rgba(15,43,61,0.02)]" />
          </LField>
        </div>
      </section>

      <aside className="space-y-5">
        <div className="act-card-2 p-5">
          <span className="act-kicker">Kecocokan skill</span>
          {skillCount === 0 ? (
            <p className="mt-2 text-sm text-[var(--act-graphite)]">
              Tambahkan skill di Profil agar pesan lebih personal.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-[var(--act-ink)]">
                <span className="text-2xl font-bold text-[var(--page-accent,var(--act-blue))]">
                  {matched.length}
                </span>{" "}
                skill kamu cocok dengan lowongan ini.
              </p>
              {matched.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {matched.slice(0, 12).map((s) => (
                    <span key={s} className="act-chip act-chip-green">{s}</span>
                  ))}
                </div>
              )}
              {missing.length > 0 && (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--act-graphite)]">
                    Belum dimiliki
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {missing.slice(0, 10).map((s) => (
                      <span key={s} className="act-chip act-chip-mute">{s}</span>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="act-card-2 space-y-4 p-5">
          <span className="act-kicker">Bentuk pesan</span>
          <OptionGroup
            label="Kanal"
            value={channel}
            options={CHANNEL_OPTIONS}
            onChange={(v) => onChannel(v as ApplyChannel)}
          />
          <OptionGroup
            label="Nada"
            value={tone}
            options={TONE_OPTIONS}
            onChange={(v) => onTone(v as ApplyTone)}
          />
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--act-graphite)]">
              Catatan tambahan (opsional)
            </span>
            <textarea
              value={extraNote}
              onChange={(e) => onExtraNote(e.target.value)}
              rows={2}
              placeholder="mis. bisa mulai segera, tertarik karena…"
              className="act-field mt-2 !h-auto !border-[rgba(15,43,61,0.12)] !bg-[rgba(15,43,61,0.02)] py-2 text-sm"
            />
          </label>
        </div>

        {draftError && <ErrorNote>{draftError}</ErrorNote>}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onGenerate}
            disabled={drafting}
            className="act-pill justify-center !text-sm disabled:opacity-50"
          >
            {drafting ? "Menulis lamaran…" : "Buatkan pesan lamaran ✦"}
          </button>
          {drafting && (
            <p className="text-center text-xs text-[var(--act-graphite)]">
              AI menyusun pesan personal — bisa sampai ~30 detik.
            </p>
          )}
          <button
            type="button"
            onClick={onBack}
            className="act-pill-ghost justify-center !text-sm"
          >
            ← Mulai ulang
          </button>
        </div>
      </aside>
    </div>
  );
}

/* ---------------- Draft step ---------------- */

function DraftStep({
  draft,
  job,
  channel,
  copied,
  drafting,
  saving,
  saveMsg,
  onCopy,
  onRegenerate,
  onSave,
  onEdit,
  onReset,
}: {
  draft: ApplicationDraft;
  job: ExtractedJob;
  channel: ApplyChannel;
  copied: boolean;
  drafting: boolean;
  saving: boolean;
  saveMsg: string;
  onCopy: () => void;
  onRegenerate: () => void;
  onSave: () => void;
  onEdit: () => void;
  onReset: () => void;
}) {
  const channelLabel =
    CHANNEL_OPTIONS.find((c) => c.value === channel)?.label ?? "Pesan";
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <section className="act-card-2 space-y-4 p-5 sm:p-7">
        <div className="flex items-center justify-between">
          <span className="act-kicker">Pesan lamaran · {channelLabel}</span>
          <button
            type="button"
            onClick={onCopy}
            className="act-pill-ghost !text-xs"
          >
            {copied ? "Tersalin ✓" : "Salin semua"}
          </button>
        </div>

        {draft.subject && (
          <div className="rounded-[14px] border border-[rgba(15,43,61,0.1)] bg-[rgba(15,43,61,0.02)] px-4 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--act-graphite)]">
              Subjek
            </span>
            <p className="mt-0.5 text-sm font-semibold text-[var(--act-ink)]">
              {draft.subject}
            </p>
          </div>
        )}

        <textarea
          readOnly
          value={draft.message}
          rows={16}
          className="act-field !h-auto w-full !border-[rgba(15,43,61,0.12)] !bg-white py-3 font-mono text-[13px] leading-6"
        />

        {job.applyEmail && (
          <p className="text-sm text-[var(--act-graphite)]">
            Kirim ke:{" "}
            <a
              href={`mailto:${job.applyEmail}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.message)}`}
              className="font-semibold text-[var(--page-accent,var(--act-blue))] hover:underline"
            >
              {job.applyEmail}
            </a>
          </p>
        )}
        {job.applyUrl && (
          <p className="text-sm text-[var(--act-graphite)]">
            Loker asli:{" "}
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold text-[var(--page-accent,var(--act-blue))] hover:underline"
            >
              buka tautan ↗
            </a>
          </p>
        )}
      </section>

      <aside className="space-y-5">
        {draft.highlights.length > 0 && (
          <div className="act-card-2 p-5">
            <span className="act-kicker">Kekuatan yang ditonjolkan</span>
            <ul className="mt-3 space-y-2">
              {draft.highlights.map((h, i) => (
                <li key={i} className="flex gap-2 text-sm text-[var(--act-ink)]">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--act-blue)]" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="act-card-2 space-y-2 p-5">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="act-pill justify-center !text-sm disabled:opacity-50"
          >
            {saving ? "Menyimpan…" : "Simpan ke Lamaran"}
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={drafting}
            className="act-pill-ghost justify-center !text-sm disabled:opacity-50"
          >
            {drafting ? "Membuat ulang…" : "↻ Buat ulang"}
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="act-pill-ghost justify-center !text-sm"
          >
            ← Ubah detail
          </button>
          <button
            type="button"
            onClick={onReset}
            className="w-full text-center text-xs font-semibold text-[var(--act-graphite)] hover:underline"
          >
            Lowongan baru
          </button>
          {saveMsg && (
            <p className="pt-1 text-center text-xs font-semibold text-[var(--page-accent,var(--act-blue))]">
              {saveMsg}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

/* ---------------- small pieces ---------------- */

/**
 * Indikator progres 3 langkah.
 *
 * Sengaja TIDAK berbentuk pil seperti pemilih input di bawahnya: keduanya dulu
 * memakai pil gelap yang sama persis, sehingga penanda progres (tidak bisa
 * diklik) tampak seperti tombol pilihan. Bentuk lingkaran bernomor + garis
 * penghubung membacanya sebagai urutan, bukan pilihan.
 */
function Stepper({ step }: { step: Step }) {
  const items: { key: Step; label: string }[] = [
    { key: "input", label: "Input" },
    { key: "review", label: "Tinjau" },
    { key: "draft", label: "Pesan" },
  ];
  const order: Step[] = ["input", "review", "draft"];
  const idx = order.indexOf(step);

  return (
    <ol className="flex items-center gap-1.5" aria-label="Progres">
      {items.map((it, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li key={it.key} className="flex items-center gap-1.5">
            <span
              className="flex items-center gap-2"
              aria-current={active ? "step" : undefined}
            >
              <span
                className={
                  "grid h-6 w-6 flex-none place-items-center rounded-full text-[11px] font-bold transition-colors " +
                  (active
                    ? "bg-[var(--page-accent,var(--act-blue))] text-white"
                    : done
                      ? "bg-[color-mix(in_srgb,var(--page-accent,var(--act-blue))_16%,transparent)] text-[var(--page-accent,var(--act-blue))]"
                      : "border border-[rgba(15,43,61,0.16)] text-[var(--act-stone)]")
                }
              >
                {done ? (
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={
                  "text-[13px] font-semibold " +
                  (active
                    ? "text-[var(--act-ink)]"
                    : done
                      ? "text-[var(--page-accent,var(--act-blue))]"
                      : "text-[var(--act-stone)]")
                }
              >
                {it.label}
              </span>
            </span>
            {i < items.length - 1 && (
              <span
                aria-hidden
                className={
                  "mx-1.5 h-px w-6 sm:w-10 " +
                  (done ? "bg-[var(--page-accent,var(--act-blue))]" : "bg-[rgba(15,43,61,0.14)]")
                }
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function OptionGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string; hint: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--act-graphite)]">
        {label}
      </span>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              title={o.hint}
              className={`rounded-[10px] px-2 py-2 text-xs font-semibold transition-colors ${active
                  ? "bg-[var(--page-accent,var(--act-blue))] text-white"
                  : "border border-[rgba(15,43,61,0.12)] text-[var(--act-charcoal)] hover:bg-[var(--page-tint,var(--act-blue-50))]"
                }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--act-graphite)]">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-[12px] border border-[rgba(180,83,9,0.25)] bg-[rgba(180,83,9,0.06)] px-4 py-3 text-sm text-[#8a3f08]">
      {children}
    </div>
  );
}

function Icon({ d, big }: { d: string; big?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={big ? "h-6 w-6 text-[var(--page-accent,var(--act-blue))]" : "h-4 w-4"}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

function splitList(value: string, sep: string): string[] {
  return value
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean);
}
