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
    <div className="mx-auto max-w-[980px] px-6 py-10 md:py-14">
      <div className="mb-10"><OnboardingStepper current={1} /></div>

      <div className="act-rise max-w-2xl">
        <span className="act-eyebrow">Onboarding · Step 1</span>
        <h1 className="act-display mt-3 text-4xl leading-[1.04] md:text-5xl">
          Mulai dari skill yang <span className="text-[var(--act-blue)]">sudah kamu kuasai.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[var(--act-charcoal)]">
          Pilih skill yang sudah kamu kuasai. Ini jadi dasar skill-gap analysis,
          rekomendasi loker, dan readiness score kamu. Bisa diubah kapan saja di
          halaman Profil.
        </p>
      </div>

      <form action={saveSkillsAction} className="act-rise mt-8">
        <div className="act-card-2 overflow-hidden">
          <div className="border-b border-[rgba(4,39,24,0.08)] bg-brand-50 px-6 py-4">
            <span className="act-kicker !text-[var(--act-blue)]">Pilih keahlianmu</span>
          </div>
          <div className="p-6 md:p-8">
          <SkillPicker groups={groups} initialSelected={owned} />
          </div>
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
