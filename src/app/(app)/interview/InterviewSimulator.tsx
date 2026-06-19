"use client";

import { useState } from "react";
import {
  INTERVIEW_TRACKS,
  INTERVIEW_QUESTIONS,
  type InterviewTrack,
} from "@/lib/content/interview";

type Phase = "pick" | "quiz" | "summary";

export function InterviewSimulator() {
  const [phase, setPhase] = useState<Phase>("pick");
  const [track, setTrack] = useState<InterviewTrack | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [showHint, setShowHint] = useState(false);

  const questions = track ? INTERVIEW_QUESTIONS[track] : [];

  function start(t: InterviewTrack) {
    setTrack(t);
    setIndex(0);
    setAnswers({});
    setRevealed({});
    setShowHint(false);
    setPhase("quiz");
  }

  function restart() {
    setPhase("pick");
    setTrack(null);
  }

  /* ---------- PICK ---------- */
  if (phase === "pick") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {INTERVIEW_TRACKS.map((t) => (
          <button
            key={t.key}
            onClick={() => start(t.key)}
            className="act-card-2 act-rowhover group flex items-center justify-between p-6 text-left"
          >
            <div>
              <h3 className="act-heading text-lg text-[var(--act-ink)]">{t.label}</h3>
              <p className="mt-1 text-sm text-[var(--act-graphite)]">
                {INTERVIEW_QUESTIONS[t.key].length} pertanyaan latihan
              </p>
            </div>
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--act-graphite)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--act-blue)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    );
  }

  /* ---------- SUMMARY ---------- */
  if (phase === "summary") {
    const answeredCount = questions.filter((_, i) => (answers[i] ?? "").trim().length > 0).length;
    return (
      <div className="space-y-6">
        <div className="act-card-2 act-wash-sky-soft border-[rgba(0,152,242,0.18)] p-6">
          <span className="act-kicker">Selesai</span>
          <h2 className="act-display mt-2 text-3xl text-[var(--act-ink)]">
            {answeredCount}<span className="text-[var(--act-graphite)]">/{questions.length}</span> dijawab
          </h2>
          <p className="mt-1 text-sm text-[var(--act-graphite)]">
            Bagus! Bandingkan jawabanmu dengan contoh di bawah dan ulangi sampai lancar.
          </p>
        </div>

        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="act-card-2 p-5">
              <span className={`act-chip ${chipFor(q.category)}`}>{q.category}</span>
              <h3 className="mt-3 text-base font-semibold text-[var(--act-ink)]">{q.question}</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[var(--act-mist)] p-3">
                  <div className="act-kicker !text-[10px]">Jawabanmu</div>
                  <p className="mt-1 text-sm text-[var(--act-charcoal)]">
                    {(answers[i] ?? "").trim() || <span className="text-[var(--act-graphite)]">(kosong)</span>}
                  </p>
                </div>
                <div className="rounded-xl border border-[rgba(0,152,242,0.18)] bg-[var(--act-sky-50)] p-3">
                  <div className="act-kicker !text-[10px]">Contoh jawaban</div>
                  <p className="mt-1 text-sm text-[var(--act-charcoal)]">{q.sample}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={restart} className="act-pill !text-sm">Latihan bidang lain</button>
        </div>
      </div>
    );
  }

  /* ---------- QUIZ ---------- */
  const q = questions[index];
  const isLast = index === questions.length - 1;
  const progress = ((index + 1) / questions.length) * 100;

  function goNext() {
    setShowHint(false);
    if (isLast) {
      setPhase("summary");
    } else {
      setIndex((i) => i + 1);
    }
  }
  function goPrev() {
    setShowHint(false);
    setIndex((i) => Math.max(0, i - 1));
  }

  return (
    <div className="space-y-5">
      {/* progress */}
      <div>
        <div className="flex items-center justify-between text-xs text-[var(--act-graphite)]">
          <span className="font-semibold uppercase tracking-[0.1em]">
            {INTERVIEW_TRACKS.find((t) => t.key === track)?.label}
          </span>
          <span>Soal {index + 1} / {questions.length}</span>
        </div>
        <div className="act-track mt-2">
          <i style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--act-sky-bright), var(--act-sky-deep))" }} />
        </div>
      </div>

      <div className="act-card-2 p-6">
        <span className={`act-chip ${chipFor(q.category)}`}>{q.category}</span>
        <h2 className="act-heading mt-4 text-xl leading-snug text-[var(--act-ink)]">{q.question}</h2>

        <button
          onClick={() => setShowHint((s) => !s)}
          className="mt-3 text-xs font-semibold text-[var(--act-blue)] hover:underline"
        >
          {showHint ? "Sembunyikan hint" : "Lihat hint"}
        </button>
        {showHint && (
          <p className="mt-2 rounded-xl bg-[var(--act-mist)] p-3 text-sm text-[var(--act-charcoal)]">
            💡 {q.hint}
          </p>
        )}

        <textarea
          value={answers[index] ?? ""}
          onChange={(e) => setAnswers((a) => ({ ...a, [index]: e.target.value }))}
          placeholder="Tulis jawabanmu di sini (pakai metode STAR)…"
          rows={5}
          className="act-field mt-4 !h-auto w-full resize-y !rounded-2xl"
        />

        <button
          onClick={() => setRevealed((r) => ({ ...r, [index]: !r[index] }))}
          className="mt-3 text-sm font-semibold text-[var(--act-iris)] hover:underline"
        >
          {revealed[index] ? "Sembunyikan contoh jawaban" : "Lihat contoh jawaban"}
        </button>
        {revealed[index] && (
          <div className="mt-2 rounded-2xl border border-[rgba(0,152,242,0.18)] bg-[var(--act-sky-50)] p-4">
            <div className="act-kicker !text-[10px]">Contoh jawaban terbaik</div>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--act-charcoal)]">{q.sample}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="act-pill-ghost !text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sebelumnya
        </button>
        <button onClick={goNext} className="act-pill group !text-sm">
          {isLast ? "Selesai & lihat ringkasan" : "Berikutnya"}
          <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function chipFor(cat: "Behavioral" | "Technical" | "HR") {
  return { Behavioral: "act-chip-iris", Technical: "act-chip-blue", HR: "act-chip-magenta" }[cat];
}
