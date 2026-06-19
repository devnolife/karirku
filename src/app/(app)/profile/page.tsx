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
    <div className="act-rise mx-auto max-w-[1000px] space-y-8 px-6 py-8 md:px-10">
      <div>
        <span className="act-eyebrow">Studio · Profil</span>
        <h1 className="act-display mt-3 text-4xl leading-[1.05] md:text-5xl">
          Profil <span className="act-sky-text">karir kamu.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] text-[var(--act-charcoal)]">
          Profil ini jadi aset yang dibaca semua permukaan: rekomendasi loker,
          skill-gap, readiness, dan pencarian talent oleh perusahaan.
        </p>
      </div>

      {/* Identity */}
      <form action={saveBasicsAction} className="act-card-2 space-y-5 p-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-[var(--act-onyx)] text-base font-semibold text-white">
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

        <div className="flex justify-end">
          <button type="submit" className="act-pill !text-sm">Simpan profil</button>
        </div>
      </form>

      {/* Skills */}
      <div className="act-card-2 p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="act-chip act-chip-blue">{profile.skills.length} skill</span>
          <span className="act-chip act-chip-iris">{verifiedCount} verified</span>
        </div>
        <ProfileSkillsEditor
          skills={profile.skills}
          catalog={groups}
          saveSkills={saveSkillsAction}
          setProficiency={setProficiencyAction}
        />
      </div>
    </div>
  );
}
