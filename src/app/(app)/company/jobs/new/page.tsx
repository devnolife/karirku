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
  const { prisma } = await import("@/lib/db");
  const taxo = skills.length ? await prisma.skillTaxonomy.findMany({ where: { id: { in: skills } }, select: { name: true } }) : [];
  const skillNames = taxo.map((skill) => skill.name);
  const salaryMin = Number(formData.get("salaryMin") ?? 0) || null;
  const salaryMax = Number(formData.get("salaryMax") ?? 0) || null;

  const id = await createNativeJob(user.id, {
    title,
    location: String(formData.get("location") ?? "").trim(),
    type: String(formData.get("type") ?? "fulltime") as JobTypeValue,
    level: String(formData.get("level") ?? "mid") as LevelValue,
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
    <div className="act-rise mx-auto max-w-[1020px] px-5 py-8 sm:px-8 sm:py-12">
      <Link href="/company/jobs" className="text-sm font-semibold text-[#476655] transition-colors hover:text-[#042718]">← Kembali ke portfolio lowongan</Link>
      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_250px] lg:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#198F38]">Role brief / Langkah 1 dari 1</span>
          <h1 className="act-display mt-3 text-4xl text-[#042718] md:text-5xl">Bangun brief untuk peran yang tepat.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#476655]">Mulai dari konteks peran, lalu beri sinyal skill yang akan dipakai untuk mencocokkan talent.</p>
        </div>
        <aside className="rounded-[20px] border border-[rgba(4,39,24,0.08)] bg-[#D2DDEA] p-5 text-sm leading-6 text-[#315644]">
          <p className="font-bold text-[#042718]">Brief yang jelas memberi hasil lebih baik.</p>
          <p className="mt-2">Jelaskan dampak peran dan skill inti agar pencocokan kandidat lebih relevan.</p>
        </aside>
      </div>

      <form action={createJobAction} className="mt-9 space-y-5">
        <section className="rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-white p-6 shadow-[0_18px_45px_-36px_rgba(4,39,24,0.5)] sm:p-8">
          <SectionHeading number="01" title="Fondasi peran" description="Beri kandidat gambaran singkat tentang peran dan cara kerjanya." />
          <div className="mt-7 space-y-6">
            <Field label="Judul posisi" required><input name="title" required placeholder="Contoh: Frontend Engineer" className="act-field !border-[rgba(4,39,24,0.12)] !bg-[#F9FCF9]" /></Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Lokasi"><input name="location" placeholder="Jakarta · Hybrid / Remote" className="act-field !border-[rgba(4,39,24,0.12)] !bg-[#F9FCF9]" /></Field>
              <Field label="Tipe"><select name="type" className="act-field !border-[rgba(4,39,24,0.12)] !bg-[#F9FCF9]" defaultValue="fulltime">{JOB_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Level"><select name="level" className="act-field !border-[rgba(4,39,24,0.12)] !bg-[#F9FCF9]" defaultValue="mid">{LEVEL_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
              <Field label="Gaji min (Rp/bln)"><input name="salaryMin" type="number" placeholder="8000000" className="act-field !border-[rgba(4,39,24,0.12)] !bg-[#F9FCF9]" /></Field>
              <Field label="Gaji max (Rp/bln)"><input name="salaryMax" type="number" placeholder="14000000" className="act-field !border-[rgba(4,39,24,0.12)] !bg-[#F9FCF9]" /></Field>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-white p-6 shadow-[0_18px_45px_-36px_rgba(4,39,24,0.5)] sm:p-8">
          <SectionHeading number="02" title="Cerita dan sinyal kecocokan" description="Detail ini menjadi konteks marketplace dan dasar pencocokan talent." />
          <div className="mt-7">
            <Field label="Deskripsi"><textarea name="description" rows={6} placeholder="Tanggung jawab, kualifikasi, dan benefit." className="act-field !h-auto !border-[rgba(4,39,24,0.12)] !bg-[#F9FCF9] py-3" /></Field>
          </div>
          <div className="mt-7 rounded-[20px] border border-[rgba(25,143,56,0.14)] bg-[#F2FBF6] p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between"><div><p className="font-semibold text-[#042718]">Skill yang dibutuhkan</p><p className="mt-1 text-xs leading-5 text-[#476655]">Pilih skill inti. Sistem akan menggunakannya untuk mengurutkan kandidat yang relevan.</p></div><span className="text-xs font-bold uppercase tracking-[0.12em] text-[#198F38]">Match signal</span></div>
            <div className="mt-5"><SkillPicker groups={groups} /></div>
          </div>
        </section>
        <div className="flex flex-col-reverse gap-3 border-t border-[rgba(4,39,24,0.08)] pt-5 sm:flex-row sm:justify-end">
          <Link href="/company/jobs" className="act-pill-ghost justify-center !text-sm">Batal</Link>
          <button type="submit" className="act-pill justify-center !bg-[#042718] !text-sm">Posting lowongan</button>
        </div>
      </form>
    </div>
  );
}

function SectionHeading({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#042718] text-xs font-bold text-white">{number}</span><div><h2 className="act-heading text-xl text-[#042718]">{title}</h2><p className="mt-1 text-sm leading-6 text-[#476655]">{description}</p></div></div>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div><label className="flex items-center gap-1 text-sm font-semibold text-[#042718]">{label}{required && <span className="text-[#198F38]">*</span>}</label><div className="mt-2">{children}</div></div>;
}
