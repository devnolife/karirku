import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getUserSkill } from "@/server/queries/profile";
import { generateSkillQuiz, AiJsonError } from "@/lib/ai/quiz";
import { QuizRunner } from "./_runner";
import { gradeQuiz, stashAnswers } from "./actions";

export default async function VerifySkillPage({
  params,
}: {
  params: Promise<{ skillId: string }>;
}) {
  const { skillId } = await params;
  const user = await requireUser();
  const skill = await getUserSkill(user.id, skillId);

  if (!skill) {
    return (
      <div className="act-rise mx-auto max-w-[800px] px-6 py-16 text-center">
        <div className="act-card-2 p-8">
        <h1 className="act-heading text-2xl text-[var(--act-ink)]">Skill tidak ditemukan</h1>
        <p className="mt-3 text-sm text-[var(--act-graphite)]">
          Skill ini belum ada di profilmu. Tambahkan dulu lewat halaman Profil.
        </p>
        <Link href="/skills" className="act-pill mt-6 inline-flex !text-sm">Kembali ke Skill</Link>
        </div>
      </div>
    );
  }

  if (skill.verified) {
    return (
      <div className="act-rise mx-auto max-w-[800px] px-6 py-16 text-center">
        <div className="rounded-[24px] border border-[rgba(15,118,110,0.2)] bg-[#F2FBF6] p-8">
        <span className="act-chip act-chip-iris">✓ Sudah terverifikasi</span>
        <h1 className="act-heading mt-4 text-2xl text-[var(--act-ink)]">{skill.name} sudah verified</h1>
        <p className="mt-3 text-sm text-[var(--act-graphite)]">
          Skill ini sudah lolos verifikasi. Tidak perlu mengulang.
        </p>
        <Link href="/skills" className="act-pill mt-6 inline-flex !text-sm">Kembali ke Skill</Link>
        </div>
      </div>
    );
  }

  // Generate quiz (AI). Tangani gagal dengan pesan ramah.
  let quiz;
  try {
    quiz = await generateSkillQuiz(skill.name);
  } catch (err) {
    const isAi = err instanceof AiJsonError;
    return (
      <div className="act-rise mx-auto max-w-[800px] px-6 py-16 text-center">
        <div className="rounded-[24px] border border-[rgba(180,83,9,0.2)] bg-[#EBE3D2]/45 p-8">
        <span className="act-chip act-chip-amber">Perlu dicoba lagi</span>
        <h1 className="act-heading mt-4 text-2xl text-[var(--act-ink)]">Gagal membuat kuis</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-[var(--act-graphite)]">
          {isAi
            ? "AI sedang tidak bisa menyusun soal yang valid. Pastikan layanan AI (Ollama) aktif, lalu coba lagi."
            : "Terjadi kendala teknis. Coba beberapa saat lagi."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href={`/skills/verify/${skillId}`} className="act-pill !text-sm">Coba lagi</Link>
          <Link href="/skills" className="act-pill-ghost !text-sm">Kembali</Link>
        </div>
        </div>
      </div>
    );
  }

  // Simpan kunci jawaban di server (tak dikirim ke client).
  await stashAnswers(skillId, quiz.questions);
  const publicQuestions = quiz.questions.map((q) => ({ question: q.question, options: q.options }));

  return (
    <div className="act-rise mx-auto max-w-[840px] space-y-6 px-6 py-10">
      <header className="rounded-[24px] border border-[rgba(4,39,24,0.1)] bg-[var(--act-sky-50)] p-6 sm:p-8">
        <Link href="/skills" className="text-sm font-medium text-[var(--act-graphite)] hover:text-[var(--act-ink)]">
          ← Kembali ke Skill
        </Link>
        <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="act-eyebrow">Credential assessment</span>
            <h1 className="act-display mt-2 text-4xl leading-[1.05] text-[var(--act-ink)]">
              Kuis {skill.name}.
            </h1>
          </div>
          <span className="act-chip act-chip-blue">{quiz.questions.length} soal</span>
        </div>
        <div className="mt-5 grid gap-3 border-t border-[rgba(4,39,24,0.09)] pt-5 sm:grid-cols-[auto_1fr] sm:items-start">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--act-onyx)] text-xs font-bold text-white">i</span>
          <p className="text-sm leading-relaxed text-[var(--act-charcoal)]">
            Pilih satu jawaban untuk setiap soal. Kamu perlu minimal 70% jawaban benar untuk mendapatkan credential terverifikasi.
          </p>
        </div>
      </header>

      <QuizRunner
        skillId={skillId}
        skillName={skill.name}
        questions={publicQuestions}
        onGrade={gradeQuiz}
      />
    </div>
  );
}
