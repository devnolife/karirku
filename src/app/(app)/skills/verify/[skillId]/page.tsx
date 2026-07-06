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
        <h1 className="act-heading text-2xl text-[var(--act-ink)]">Skill tidak ditemukan</h1>
        <p className="mt-3 text-sm text-[var(--act-graphite)]">
          Skill ini belum ada di profilmu. Tambahkan dulu lewat halaman Profil.
        </p>
        <Link href="/skills" className="act-pill mt-6 inline-flex !text-sm">Kembali ke Skill</Link>
      </div>
    );
  }

  if (skill.verified) {
    return (
      <div className="act-rise mx-auto max-w-[800px] px-6 py-16 text-center">
        <span className="act-chip act-chip-iris">✓ Sudah terverifikasi</span>
        <h1 className="act-heading mt-4 text-2xl text-[var(--act-ink)]">{skill.name} sudah verified</h1>
        <p className="mt-3 text-sm text-[var(--act-graphite)]">
          Skill ini sudah lolos verifikasi. Tidak perlu mengulang.
        </p>
        <Link href="/skills" className="act-pill mt-6 inline-flex !text-sm">Kembali ke Skill</Link>
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
        <h1 className="act-heading text-2xl text-[var(--act-ink)]">Gagal membuat kuis</h1>
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
    );
  }

  // Simpan kunci jawaban di server (tak dikirim ke client).
  await stashAnswers(skillId, quiz.questions);
  const publicQuestions = quiz.questions.map((q) => ({ question: q.question, options: q.options }));

  return (
    <div className="act-rise mx-auto max-w-[800px] space-y-6 px-6 py-8">
      <div>
        <Link href="/skills" className="text-sm font-medium text-[var(--act-graphite)] hover:text-[var(--act-ink)]">
          ← Kembali ke Skill
        </Link>
        <span className="act-eyebrow mt-4 block">Verifikasi skill</span>
        <h1 className="act-display mt-2 text-4xl leading-[1.05]">
          Kuis <span className="act-sky-text">{skill.name}.</span>
        </h1>
        <p className="mt-3 text-[15px] text-[var(--act-charcoal)]">
          {quiz.questions.length} soal pilihan ganda. Jawab benar ≥70% untuk
          mendapat badge <span className="font-semibold text-[var(--act-iris)]">verified</span>.
        </p>
      </div>

      <QuizRunner
        skillId={skillId}
        skillName={skill.name}
        questions={publicQuestions}
        onGrade={gradeQuiz}
      />
    </div>
  );
}
