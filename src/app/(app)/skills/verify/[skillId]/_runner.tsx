"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { GradeResult } from "./actions";

export type ClientQuestion = { question: string; options: string[] };

/**
 * UI kuis: tampilkan soal, kumpulkan jawaban, submit ke grade action.
 * Jawaban benar TIDAK ada di client — penilaian dilakukan server.
 */
export function QuizRunner({
  skillId,
  skillName,
  questions,
  onGrade,
}: {
  skillId: string;
  skillName: string;
  questions: ClientQuestion[];
  onGrade: (skillId: string, answers: number[]) => Promise<GradeResult>;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<GradeResult | null>(null);
  const [pending, startTransition] = useTransition();

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);

  function submit() {
    startTransition(async () => {
      const arr = questions.map((_, i) => answers[i] ?? -1);
      const r = await onGrade(skillId, arr);
      setResult(r);
    });
  }

  if (result) {
    return (
      <div className="act-card-2 p-8 text-center">
        <div className={`act-display text-6xl ${result.passed ? "text-[#059669]" : "text-[var(--act-magenta)]"}`}>
          {result.correct}/{result.total}
        </div>
        <h2 className="act-heading mt-4 text-2xl text-[var(--act-ink)]">
          {result.passed ? "Lulus! 🎉" : "Belum lulus"}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-[var(--act-charcoal)]">
          {result.passed
            ? `Skill "${skillName}" sekarang terverifikasi. Readiness kamu naik & profil makin dipercaya perusahaan.`
            : `Butuh minimal 70% benar untuk verifikasi. Pelajari lagi lalu coba ulang.`}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => router.push("/skills")} className="act-pill !text-sm">
            Kembali ke Skill
          </button>
          {!result.passed && (
            <button onClick={() => { setResult(null); setAnswers({}); }} className="act-pill-ghost !text-sm">
              Coba lagi
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => (
        <div key={qi} className="act-card-2 p-6">
          <div className="flex items-baseline gap-2">
            <span className="act-display text-xl text-[var(--act-graphite)]">{qi + 1}</span>
            <h3 className="text-base font-semibold text-[var(--act-ink)]">{q.question}</h3>
          </div>
          <div className="mt-4 space-y-2">
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi;
              return (
                <button
                  key={oi}
                  type="button"
                  onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                  className={
                    selected
                      ? "flex w-full items-center gap-3 rounded-xl border border-[var(--act-blue)] bg-[var(--act-sky-50)] px-4 py-3 text-left text-sm font-medium text-[var(--act-ink)] transition-all"
                      : "flex w-full items-center gap-3 rounded-xl border border-[rgba(15,23,42,0.1)] bg-[var(--act-mist)] px-4 py-3 text-left text-sm text-[var(--act-charcoal)] transition-all hover:border-[var(--act-blue)]"
                  }
                >
                  <span className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-bold ${selected ? "bg-[var(--act-blue)] text-white" : "border border-[rgba(15,23,42,0.2)]"}`}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--act-graphite)]">
          {Object.keys(answers).length}/{questions.length} terjawab · lulus ≥70%
        </span>
        <button
          onClick={submit}
          disabled={!allAnswered || pending}
          className="act-pill !px-8 !text-sm disabled:opacity-50"
        >
          {pending ? "Menilai…" : "Submit jawaban"}
        </button>
      </div>
    </div>
  );
}
