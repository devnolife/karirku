import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  getProfile,
  getSkillCatalog,
  saveProfileBasics,
  setUserSkills,
  setSkillProficiency,
  regenerateProfileEmbedding,
} from "@/server/queries/profile";
import { ProfileSkillsEditor } from "./_editor";

async function saveBasicsAction(formData: FormData) {
  "use server";
  const user = await requireUser();
  await saveProfileBasics(user.id, {
    headline: String(formData.get("headline") ?? ""),
    summary: String(formData.get("summary") ?? ""),
  });
  await regenerateProfileEmbedding(user.id);
  revalidatePath("/profile");
}

async function saveSkillsAction(formData: FormData) {
  "use server";
  const user = await requireUser();
  const ids = (formData.getAll("skill") as string[]).filter(Boolean);
  await setUserSkills(user.id, ids);
  await regenerateProfileEmbedding(user.id);
  revalidatePath("/profile");
}

async function setProficiencyAction(skillId: string, proficiency: number) {
  "use server";
  const user = await requireUser();
  await setSkillProficiency(user.id, skillId, proficiency);
  revalidatePath("/profile");
}

export default async function ProfilePage() {
  const user = await requireUser();
  const [profile, catalog] = await Promise.all([
    getProfile(user.id),
    getSkillCatalog(),
  ]);
  const groups = [...catalog.entries()].map(([category, skills]) => ({ category, skills }));
  const verifiedCount = profile.skills.filter((s) => s.verified).length;

  return (
    <div className="act-rise mx-auto max-w-[1000px] space-y-8 px-6 py-10 md:px-10">
      <section className="overflow-hidden rounded-[24px] border border-[rgba(4,39,24,0.1)] bg-[var(--act-sky-50)] shadow-[0_18px_36px_-30px_rgba(4,39,24,0.5)]">
        <div className="p-6 sm:p-8">
          <span className="act-eyebrow">Career studio · profile</span>
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="inline-flex h-16 w-16 flex-none items-center justify-center rounded-[20px] bg-[var(--act-onyx)] text-xl font-semibold text-white shadow-[0_12px_24px_-14px_rgba(4,39,24,0.7)]">
                {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
              </span>
              <div className="min-w-0">
                <h1 className="act-display text-3xl text-[var(--act-ink)] sm:text-4xl">{user.name}</h1>
                <p className="mt-1 truncate text-sm text-[var(--act-charcoal)]">{profile.headline || "Membangun arah karir yang lebih jelas"}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="act-chip act-chip-blue">{profile.skills.length} skill</span>
              <span className="act-chip act-chip-iris">{verifiedCount} verified</span>
            </div>
          </div>
        </div>
        <p className="border-t border-[rgba(4,39,24,0.08)] bg-white/55 px-6 py-4 text-sm leading-relaxed text-[var(--act-charcoal)] sm:px-8">
          Ini adalah aset karirmu untuk rekomendasi loker, skill-gap, readiness, dan pencarian talent.
        </p>
      </section>

      <form action={saveBasicsAction} className="act-card-2 overflow-hidden">
        <div className="border-b border-[rgba(4,39,24,0.08)] px-6 py-5">
          <span className="act-kicker">Identitas profesional</span>
          <h2 className="act-heading mt-1 text-xl text-[var(--act-ink)]">Ceritakan fokusmu</h2>
        </div>
        <div className="space-y-5 p-6">
          <div className="flex items-center gap-3 rounded-2xl border border-[rgba(4,39,24,0.08)] bg-[var(--act-mist)] p-4">
            <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#D4E5CD] text-sm font-semibold text-[var(--act-onyx)]">
              {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
            </span>
          <div>
            <p className="text-base font-semibold text-[var(--act-ink)]">{user.name}</p>
            <p className="text-xs text-[var(--act-graphite)]">{user.email}</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-[var(--act-ink)]">Headline</label>
          <input
            name="headline"
            defaultValue={profile.headline}
            placeholder="Contoh: Frontend Engineer (aspiring)"
            className="act-field mt-2"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-[var(--act-ink)]">Ringkasan</label>
          <textarea
            name="summary"
            defaultValue={profile.summary}
            placeholder="Ceritakan singkat tentang dirimu, fokus, dan target karir."
            rows={4}
            className="act-field mt-2 !h-auto py-3"
          />
        </div>

          <div className="flex justify-end border-t border-[rgba(4,39,24,0.08)] pt-5">
            <button type="submit" className="act-pill !text-sm">Simpan profil</button>
          </div>
        </div>
      </form>

      <section className="act-card-2 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[rgba(4,39,24,0.08)] bg-[#D4E5CD]/35 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="act-kicker !text-[var(--act-blue)]">Keahlian</span>
            <h2 className="act-heading mt-1 text-xl text-[var(--act-ink)]">Skill yang kamu bawa</h2>
          </div>
          <div className="flex gap-2">
            <span className="act-chip act-chip-blue">{profile.skills.length} skill</span>
            <span className="act-chip act-chip-iris">{verifiedCount} verified</span>
          </div>
        </div>
        <div className="p-6">
          <ProfileSkillsEditor
            skills={profile.skills}
            catalog={groups}
            saveSkills={saveSkillsAction}
            setProficiency={setProficiencyAction}
          />
        </div>
      </section>
    </div>
  );
}
