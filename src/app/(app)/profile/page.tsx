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
import { CvReportCard } from "./_cv-report";
import { CvImportCard } from "./_cv-import";
import { ProfileTabs, TabIcon, type ProfileTab } from "./_tabs";
import { getCvAnalysis } from "@/server/queries/cv-analysis";

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

  const { prisma } = await import("@devnolife/karirku-core/db");
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
  const { prisma } = await import("@devnolife/karirku-core/db");
  const [profile, catalog, cvFile, cvState] = await Promise.all([
    getProfile(user.id),
    getSkillCatalog(),
    prisma.resumeFile
      .findUnique({
        where: { userId: user.id },
        select: { fileName: true, sizeBytes: true, updatedAt: true },
      })
      .catch(() => null),
    getCvAnalysis(user.id).catch(() => ({ status: "no_file" }) as const),
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

  /* ------------------------------ panels ------------------------------ */

  const identityPanel = (
    <>
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

      <div className="act-card-2 p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3.5">
            <span className="page-accent-chip grid h-11 w-11 flex-none place-items-center rounded-2xl">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 20V8m6 12V4m6 16v-9" />
              </svg>
            </span>
            <div className="min-w-0">
              <h2 className="act-heading text-[17px] text-[var(--act-ink)]">Skill</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--act-graphite)]">
                Dipakai untuk menghitung match lowongan dan skill-gap.
              </p>
            </div>
          </div>
          <div className="flex flex-none gap-2">
            <span className="act-chip act-chip-blue">{profile.skills.length} skill</span>
            <span className="act-chip act-chip-iris">{verifiedCount} verified</span>
          </div>
        </div>
        <ProfileSkillsEditor
          skills={profile.skills}
          catalog={groups}
          saveSkills={saveSkillsAction}
          setProficiency={setProficiencyAction}
        />
      </div>
    </>
  );

  const contactPanel = (
    <form action={saveContactAction} className="act-card-2 space-y-5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3.5">
          <span className="page-accent-chip grid h-11 w-11 flex-none place-items-center rounded-2xl">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 11l3 3 8-8M5 12a7 7 0 0011 5.7" />
            </svg>
          </span>
          <div className="min-w-0">
            <h2 className="act-heading text-[17px] text-[var(--act-ink)]">Data lamaran (auto-fill)</h2>
            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-[var(--act-graphite)]">
              Data ini dipakai extension untuk mengisi form lamaran otomatis.
              {missingLabels.length > 0 && (
                <> Lengkapi: <span className="font-semibold text-[var(--act-ink)]">{missingLabels.join(", ")}</span>.</>
              )}
            </p>
          </div>
        </div>
        <span className="act-chip act-chip-blue flex-none">
          {filledCount}/{autofillChecks.length} terisi
        </span>
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
  );

  const cvPanel = (
    <>
      <form action={uploadResumeAction} className="act-card-2 overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div className="flex min-w-0 gap-3.5">
            <span className="page-accent-chip grid h-11 w-11 flex-none place-items-center rounded-2xl">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
              </svg>
            </span>
            <div className="min-w-0">
              <h2 className="act-heading text-[17px] text-[var(--act-ink)]">File CV</h2>
              <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-[var(--act-graphite)]">
                CV ini otomatis dipasang extension ke field upload form lamaran.
                {cvFile ? (
                  <>
                    {" "}Terpasang{" "}
                    <span className="font-semibold text-[var(--act-ink)]">{cvFile.fileName}</span>{" "}
                    ({Math.round(cvFile.sizeBytes / 1024)} KB).
                  </>
                ) : (
                  <> Belum ada. Upload PDF/DOC maks 5 MB.</>
                )}
              </p>
            </div>
          </div>
          <button type="submit" className="act-pill flex-none !text-sm">
            {cvFile ? "Ganti CV" : "Upload CV"}
          </button>
        </div>

        <div className="space-y-3 border-t border-[rgba(15,43,61,0.07)] bg-[rgba(15,43,61,0.02)] px-6 py-4">
          {cvNotice && (
            <div
              role="status"
              className={`rounded-xl border px-4 py-2.5 text-[13px] font-medium ${cvNotice.tone}`}
            >
              {cvNotice.message}
            </div>
          )}
          <input
            type="file"
            name="cv"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
            className="block w-full text-[13px] text-[var(--act-charcoal)] file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-[var(--act-ink)] file:shadow-sm"
          />
        </div>
      </form>

      <CvImportCard hasFile={!!cvFile} autoRun={cv === "uploaded"} />

      <CvReportCard
        state={cvState.status}
        analysis={"analysis" in cvState ? cvState.analysis : null}
        fileName={"fileName" in cvState ? cvState.fileName : undefined}
      />
    </>
  );

  const preferencesPanel = (
    <form action={savePreferencesAction} className="act-card-2 space-y-5 p-6">
      <div className="flex min-w-0 gap-3.5">
        <span className="page-accent-chip grid h-11 w-11 flex-none place-items-center rounded-2xl">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16M9 4v4M15 10v4M7 16v4" />
          </svg>
        </span>
        <div className="min-w-0">
          <h2 className="act-heading text-[17px] text-[var(--act-ink)]">Preferensi kerja</h2>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-[var(--act-graphite)]">
            Rekomendasi loker dihitung dari data ini, bukan tebakan.
          </p>
        </div>
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
  );

  const tabs: ProfileTab[] = [
    {
      key: "profil",
      label: "Profil",
      icon: TabIcon.User,
      panel: identityPanel,
    },
    {
      key: "lamaran",
      label: "Data lamaran",
      icon: TabIcon.Form,
      attention: missingLabels.length > 0,
      panel: contactPanel,
    },
    {
      key: "cv",
      label: "CV & ATS",
      icon: TabIcon.Doc,
      attention: !cvFile || cvState.status === "not_analyzed" || cvState.status === "stale",
      panel: cvPanel,
    },
    {
      key: "preferensi",
      label: "Preferensi",
      icon: TabIcon.Sliders,
      attention: profile.preferences.desiredRoles.length === 0,
      panel: preferencesPanel,
    },
  ];

  return (
    <div className="act-rise app-page space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="act-eyebrow">Studio · Profil</span>
          <h1 className="act-display mt-2 text-3xl leading-[1.05] md:text-4xl">
            Profil <span className="act-sky-text">karir kamu.</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--act-charcoal)]">
            Aset yang dibaca semua permukaan: rekomendasi loker, skill-gap, readiness,
            dan pencarian talent oleh perusahaan.
          </p>
        </div>
      </div>

      <ProfileTabs tabs={tabs} initial={cv ? "cv" : "profil"} />
    </div>
  );
}
