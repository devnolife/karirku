import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  getSkillCatalog,
  getProfile,
  setUserSkills,
  regenerateProfileEmbedding,
} from "@/server/queries/profile";
import { SkillPicker } from "@/components/SkillPicker";
import { OnboardingStepper } from "./_stepper";

async function saveSkillsAction(formData: FormData) {
  "use server";
  const user = await requireUser();
  const skillIds = (formData.getAll("skill") as string[]).filter(Boolean);
  await setUserSkills(user.id, skillIds);
  await regenerateProfileEmbedding(user.id);
  revalidatePath("/onboarding/goal");
  redirect("/onboarding/goal");
}

export default async function OnboardingSkillsPage() {
  const user = await requireUser();
  const [catalog, profile] = await Promise.all([
    getSkillCatalog(),
    getProfile(user.id),
  ]);

  const groups = [...catalog.entries()].map(([category, skills]) => ({ category, skills }));
  const owned = profile.skills.map((s) => s.id);

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12">
      <div className="mb-8"><OnboardingStepper current={1} /></div>

      <div className="act-rise">
        <span className="act-eyebrow">Onboarding · Step 1</span>
        <h1 className="act-display mt-4 text-5xl leading-[1.04] md:text-6xl">
          Skill apa yang <span className="act-sky-text">kamu punya?</span>
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[var(--act-charcoal)]">
          Pilih skill yang sudah kamu kuasai. Ini jadi dasar skill-gap analysis,
          rekomendasi loker, dan readiness score kamu. Bisa diubah kapan saja di
          halaman Profil.
        </p>
      </div>

      <form action={saveSkillsAction} className="act-rise mt-8">
        <div className="act-card-2 p-6 md:p-8">
          <SkillPicker groups={groups} initialSelected={owned} />
        </div>

        <div className="mt-8 flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-[var(--act-graphite)]">
            Minimal pilih beberapa skill inti. Bisa ditambah nanti.
          </span>
          <button
            type="submit"
            className="act-pill group justify-center !px-8 !py-3.5 !text-[15px]"
          >
            Lanjut ke goal
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
