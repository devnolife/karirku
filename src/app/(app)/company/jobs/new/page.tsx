import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  createNativeJob,
  JOB_TYPE_OPTIONS,
  LEVEL_OPTIONS,
  type JobTypeValue,
  type LevelValue,
} from "@/server/queries/company";
import { getSkillCatalog } from "@/server/queries/profile";
import { SkillPicker } from "@/components/SkillPicker";

async function createJobAction(formData: FormData) {
  "use server";
  const user = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Judul lowongan wajib diisi");

  const skills = (formData.getAll("skill") as string[]).filter(Boolean);
  // SkillPicker mengirim skillId; ubah ke nama untuk disimpan di Job.skills (string[]).
  const { prisma } = await import("@/lib/db");
  const taxo = skills.length
    ? await prisma.skillTaxonomy.findMany({ where: { id: { in: skills } }, select: { name: true } })
    : [];
  const skillNames = taxo.map((t) => t.name);

  const salaryMin = Number(formData.get("salaryMin") ?? 0) || null;
  const salaryMax = Number(formData.get("salaryMax") ?? 0) || null;

  const id = await createNativeJob(user.id, {
    title,
    location: String(formData.get("location") ?? "").trim(),
    type: (String(formData.get("type") ?? "fulltime") as JobTypeValue),
    level: (String(formData.get("level") ?? "mid") as LevelValue),
    description: String(formData.get("description") ?? "").trim(),
    skills: skillNames,
    salaryMin,
    salaryMax,
  });

  if (!id) throw new Error("Hanya akun perusahaan yang bisa posting lowongan");

  revalidatePath("/company/jobs");
  redirect("/company/jobs");
}

export default async function NewCompanyJobPage() {
  await requireUser();
  const catalog = await getSkillCatalog();
  const groups = [...catalog.entries()].map(([category, skills]) => ({ category, skills }));

  return (
    <div className="act-rise mx-auto max-w-[900px] px-6 py-10">
      <Link href="/company/jobs" className="text-sm font-medium text-[var(--act-graphite)] hover:text-[var(--act-ink)]">
        ← Kembali ke Lowongan
      </Link>
      <span className="act-eyebrow mt-4 block">Company · Posting lowongan</span>
      <h1 className="act-display mt-2 text-4xl leading-[1.05] md:text-5xl">
        Lowongan <span className="act-sky-text">baru.</span>
      </h1>
      <p className="mt-3 text-[15px] text-[var(--act-charcoal)]">
        Lowongan native tampil di marketplace dengan match% otomatis ke talent
        yang relevan, dan kandidat bisa melamar in-platform.
      </p>

      <form action={createJobAction} className="mt-8 space-y-6">
        <div className="act-card-2 space-y-5 p-6">
          <Field label="Judul posisi" required>
            <input name="title" required placeholder="Contoh: Frontend Engineer" className="act-field" />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Lokasi">
              <input name="location" placeholder="Jakarta · Hybrid / Remote" className="act-field" />
            </Field>
            <Field label="Tipe">
              <select name="type" className="act-field" defaultValue="fulltime">
                {JOB_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field label="Level">
              <select name="level" className="act-field" defaultValue="mid">
                {LEVEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Gaji min (Rp/bln)">
              <input name="salaryMin" type="number" placeholder="8000000" className="act-field" />
            </Field>
            <Field label="Gaji max (Rp/bln)">
              <input name="salaryMax" type="number" placeholder="14000000" className="act-field" />
            </Field>
          </div>

          <Field label="Deskripsi">
            <textarea name="description" rows={5} placeholder="Tanggung jawab, kualifikasi, dan benefit." className="act-field !h-auto py-3" />
          </Field>
        </div>

        <div className="act-card-2 p-6">
          <span className="act-kicker">Skill yang dibutuhkan</span>
          <p className="mt-1 text-xs text-[var(--act-graphite)]">Dipakai untuk mencocokkan kandidat.</p>
          <div className="mt-4">
            <SkillPicker groups={groups} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/company/jobs" className="act-pill-ghost !text-sm">Batal</Link>
          <button type="submit" className="act-pill !text-sm">Posting lowongan</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1 text-sm font-semibold text-[var(--act-ink)]">
        {label}
        {required && <span className="text-[var(--act-magenta)]">*</span>}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
