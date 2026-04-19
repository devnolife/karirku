import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function saveGoal(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const targetRole = String(formData.get("targetRole") ?? "").trim();
  const targetTrack = String(formData.get("targetTrack") ?? "fulltime");
  const targetCity = String(formData.get("targetCity") ?? "").trim() || null;
  const weeklyHours = Number(formData.get("weeklyHours") ?? 0);
  const budgetIdr = Number(formData.get("budgetIdr") ?? 0);

  if (!targetRole) throw new Error("Target role wajib diisi");

  await prisma.careerGoal.create({
    data: {
      userId: session.user.id,
      targetRole,
      targetTrack: targetTrack as "fulltime" | "freelance" | "both",
      targetCity,
      weeklyHours: weeklyHours || null,
      budgetIdr: budgetIdr || null,
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold">Set career goal</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        AI butuh tahu kamu mau kemana. Jawaban ini bisa diubah kapan saja.
      </p>

      <form action={saveGoal} className="mt-8 space-y-5">
        <Field label="Target role" name="targetRole" placeholder="Contoh: Data Engineer" required />

        <div>
          <label className="mb-1 block text-sm font-medium">Mode karir</label>
          <select
            name="targetTrack"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="fulltime">Full-time (karyawan)</option>
            <option value="freelance">Freelance / project</option>
            <option value="both">Dua-duanya</option>
          </select>
        </div>

        <Field label="Kota target (opsional)" name="targetCity" placeholder="Jakarta / Remote" />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Jam belajar / minggu" name="weeklyHours" type="number" placeholder="10" />
          <Field label="Budget course / bulan (Rp)" name="budgetIdr" type="number" placeholder="200000" />
        </div>

        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-full bg-indigo-600 px-8 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Simpan & lanjut
        </button>
      </form>

      <p className="mt-6 text-xs text-zinc-500">
        Catatan: di Sprint 1-2 ini, goal disimpan tapi belum di-generate roadmap AI.
        Fitur itu aktif di Sprint 3-4.
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
      />
    </div>
  );
}
