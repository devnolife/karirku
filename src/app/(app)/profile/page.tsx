import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  getProfile,
  getSkillCatalog,
  saveProfileBasics,
  saveProfileContact,
  saveProfilePreferences,
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

async function saveContactAction(formData: FormData) {
  "use server";
  const user = await requireUser();
  const s = (k: string) => String(formData.get(k) ?? "");
  const num = (k: string) => {
    const v = Number(String(formData.get(k) ?? "").replace(/[^\d]/g, ""));
    return Number.isFinite(v) && v > 0 ? v : null;
  };
  await saveProfileContact(user.id, {
    phone: s("phone"),
    city: s("city"),
    country: s("country"),
    linkedinUrl: s("linkedinUrl"),
    githubUrl: s("githubUrl"),
    portfolioUrl: s("portfolioUrl"),
    currentTitle: s("currentTitle"),
    currentCompany: s("currentCompany"),
    yearsExperience: num("yearsExperience"),
    expectedSalaryIdr: num("expectedSalaryIdr"),
  });
  revalidatePath("/profile");
}

async function savePreferencesAction(formData: FormData) {
  "use server";
  const user = await requireUser();
  const list = (k: string) =>
    String(formData.get(k) ?? "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  const minSalary = Number(String(formData.get("minSalaryIdr") ?? "").replace(/[^\d]/g, ""));
  await saveProfilePreferences(user.id, {
    desiredRoles: list("desiredRoles"),
    preferredLocations: list("preferredLocations"),
    remoteOnly: formData.get("remoteOnly") === "on",
    minSalaryIdr: Number.isFinite(minSalary) && minSalary > 0 ? minSalary : null,
    desiredLevel: String(formData.get("desiredLevel") ?? "") || null,
  });
  await regenerateProfileEmbedding(user.id);
  revalidatePath("/profile");
}

const CV_MAX_BYTES = 5 * 1024 * 1024;
const CV_MIME_ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

async function uploadResumeAction(formData: FormData) {
  "use server";
  const user = await requireUser();
  const file = formData.get("cv");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/profile?cv=empty");
  }
  if (file.size > CV_MAX_BYTES) {
    redirect("/profile?cv=too-large");
  }
  if (!CV_MIME_ALLOWED.has(file.type)) {
    redirect("/profile?cv=unsupported");
  }

  const { prisma } = await import("@/lib/db");
  const data = Buffer.from(await file.arrayBuffer());
  await prisma.resumeFile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      fileName: file.name.slice(0, 255),
      mimeType: file.type,
      data,
      sizeBytes: file.size,
    },
    update: { fileName: file.name.slice(0, 255), mimeType: file.type, data, sizeBytes: file.size },
  });
  revalidatePath("/profile");
  redirect("/profile?cv=uploaded");
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

const CV_NOTICE: Record<string, { tone: string; message: string }> = {
  uploaded: {
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
    message: "CV berhasil disimpan dan siap dipakai extension.",
  },
  empty: {
    tone: "border-amber-200 bg-amber-50 text-amber-800",
    message: "Pilih file CV terlebih dahulu.",
  },
  "too-large": {
    tone: "border-red-200 bg-red-50 text-red-800",
    message: "Ukuran CV melebihi batas 5 MB.",
  },
  unsupported: {
    tone: "border-red-200 bg-red-50 text-red-800",
    message: "Format CV harus PDF, DOC, atau DOCX.",
  },
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ cv?: string }>;
}) {
  const user = await requireUser();
  const { cv } = await searchParams;
  const cvNotice = cv ? CV_NOTICE[cv] : undefined;
  const { prisma } = await import("@/lib/db");
  const [profile, catalog, cvFile] = await Promise.all([
    getProfile(user.id),
    getSkillCatalog(),
    prisma.resumeFile
      .findUnique({
        where: { userId: user.id },
        select: { fileName: true, sizeBytes: true, updatedAt: true },
      })
      .catch(() => null),
  ]);
  const groups = [...catalog.entries()].map(([category, skills]) => ({ category, skills }));
  const verifiedCount = profile.skills.filter((s) => s.verified).length;

  // Kelengkapan data lamaran — makin lengkap, makin banyak field terisi otomatis.
  const c = profile.contact;
  const autofillChecks: Array<[string, boolean]> = [
    ["No. HP", !!c.phone],
    ["Kota", !!c.city],
    ["Negara", !!c.country],
    ["LinkedIn", !!c.linkedinUrl],
    ["GitHub", !!c.githubUrl],
    ["Portfolio", !!c.portfolioUrl],
    ["Posisi saat ini", !!c.currentTitle],
    ["Perusahaan", !!c.currentCompany],
    ["Lama pengalaman", c.yearsExperience !== null],
    ["Ekspektasi gaji", c.expectedSalaryIdr !== null],
    ["Ringkasan", !!profile.summary],
    ["Skill", profile.skills.length > 0],
    ["File CV", !!cvFile],
  ];
  const filledCount = autofillChecks.filter(([, ok]) => ok).length;
  const missingLabels = autofillChecks.filter(([, ok]) => !ok).map(([l]) => l);

  return (
    <div className="act-rise app-page space-y-8">
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

      {/* Data lamaran (autofill) */}
      <form action={saveContactAction} className="act-card-2 space-y-5 p-6">
        <div>
          <div className="flex items-center justify-between">
            <span className="act-kicker">Data lamaran (auto-fill)</span>
            <span className="act-chip act-chip-blue">
              {filledCount}/{autofillChecks.length} terisi
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--act-graphite)]">
            Data ini dipakai extension untuk mengisi form lamaran otomatis.
            {missingLabels.length > 0 && (
              <> Lengkapi: <span className="font-medium">{missingLabels.join(", ")}</span>.</>
            )}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-[var(--act-ink)]">No. HP / WhatsApp</label>
            <input name="phone" defaultValue={c.phone} placeholder="+62 812-xxxx-xxxx" className="act-field mt-2" />
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--act-ink)]">Kota</label>
            <input name="city" defaultValue={c.city} placeholder="Jakarta" className="act-field mt-2" />
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--act-ink)]">Negara</label>
            <input name="country" defaultValue={c.country} placeholder="Indonesia" className="act-field mt-2" />
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--act-ink)]">LinkedIn</label>
            <input name="linkedinUrl" defaultValue={c.linkedinUrl} placeholder="https://linkedin.com/in/..." className="act-field mt-2" />
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--act-ink)]">GitHub</label>
            <input name="githubUrl" defaultValue={c.githubUrl} placeholder="https://github.com/..." className="act-field mt-2" />
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--act-ink)]">Portfolio / website</label>
            <input name="portfolioUrl" defaultValue={c.portfolioUrl} placeholder="https://..." className="act-field mt-2" />
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--act-ink)]">Posisi saat ini</label>
            <input name="currentTitle" defaultValue={c.currentTitle} placeholder="Frontend Engineer" className="act-field mt-2" />
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--act-ink)]">Perusahaan saat ini</label>
            <input name="currentCompany" defaultValue={c.currentCompany} placeholder="PT ..." className="act-field mt-2" />
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--act-ink)]">Lama pengalaman (tahun)</label>
            <input name="yearsExperience" type="number" min={0} max={50} defaultValue={c.yearsExperience ?? ""} className="act-field mt-2" />
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--act-ink)]">Ekspektasi gaji (IDR/bulan)</label>
            <input name="expectedSalaryIdr" type="number" min={0} step={500000} defaultValue={c.expectedSalaryIdr ?? ""} placeholder="15000000" className="act-field mt-2" />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="act-pill !text-sm">Simpan data lamaran</button>
        </div>
      </form>

      {/* File CV */}
      <form action={uploadResumeAction} className="act-card-2 space-y-4 p-6">
        {cvNotice && (
          <div
            role="status"
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${cvNotice.tone}`}
          >
            {cvNotice.message}
          </div>
        )}
        <div>
          <span className="act-kicker">File CV</span>
          <p className="mt-2 text-sm text-[var(--act-graphite)]">
            CV ini otomatis dipasang extension ke field upload form lamaran.
            {cvFile ? (
              <>
                {" "}Terpasang: <span className="font-medium text-[var(--act-ink)]">{cvFile.fileName}</span>{" "}
                ({Math.round(cvFile.sizeBytes / 1024)} KB)
              </>
            ) : (
              <> Belum ada. Upload PDF/DOC maks 5 MB.</>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            name="cv"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
            className="text-sm text-[var(--act-charcoal)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--act-mist)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--act-ink)]"
          />
          <button type="submit" className="act-pill !text-sm">
            {cvFile ? "Ganti CV" : "Upload CV"}
          </button>
        </div>
      </form>

      {/* Preferensi kerja */}
      <form action={savePreferencesAction} className="act-card-2 space-y-5 p-6">
        <div>
          <span className="act-kicker">Preferensi kerja</span>
          <p className="mt-2 text-sm text-[var(--act-graphite)]">
            Rekomendasi loker dihitung dari data ini, bukan tebakan.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-[var(--act-ink)]">Role yang dicari</label>
            <input
              name="desiredRoles"
              defaultValue={profile.preferences.desiredRoles.join(", ")}
              placeholder="Frontend Engineer, Fullstack Developer (pisahkan dengan koma)"
              className="act-field mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--act-ink)]">Lokasi diinginkan</label>
            <input
              name="preferredLocations"
              defaultValue={profile.preferences.preferredLocations.join(", ")}
              placeholder="Jakarta, Bandung, Remote"
              className="act-field mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--act-ink)]">Level diinginkan</label>
            <select name="desiredLevel" defaultValue={profile.preferences.desiredLevel ?? ""} className="act-field mt-2">
              <option value="">Bebas</option>
              <option value="intern">Intern</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--act-ink)]">Gaji minimum (IDR/bulan)</label>
            <input
              name="minSalaryIdr"
              type="number"
              min={0}
              step={500000}
              defaultValue={profile.preferences.minSalaryIdr ?? ""}
              placeholder="10000000"
              className="act-field mt-2"
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              id="remoteOnly"
              name="remoteOnly"
              type="checkbox"
              defaultChecked={profile.preferences.remoteOnly}
              className="h-4 w-4 accent-[var(--act-blue)]"
            />
            <label htmlFor="remoteOnly" className="text-sm font-semibold text-[var(--act-ink)]">
              Hanya remote
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="act-pill !text-sm">Simpan preferensi</button>
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
