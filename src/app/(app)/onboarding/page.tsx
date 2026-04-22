import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveGoal as persistGoal, getGoal } from "@/lib/mock/session";
import type { MockGoal } from "@/lib/mock/data";

async function saveGoalAction(formData: FormData) {
  "use server";
  const targetRole = String(formData.get("targetRole") ?? "").trim();
  if (!targetRole) throw new Error("Target role wajib diisi");

  const goal: MockGoal = {
    targetRole,
    targetTrack:
      (String(formData.get("targetTrack") ?? "fulltime") as MockGoal["targetTrack"]) ||
      "fulltime",
    targetCity: String(formData.get("targetCity") ?? "").trim() || null,
    weeklyHours: Number(formData.get("weeklyHours") ?? 0) || 0,
    budgetIdr: Number(formData.get("budgetIdr") ?? 0) || 0,
  };

  await persistGoal(goal);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export default async function OnboardingPage() {
  const current = await getGoal();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8">
        <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
          Step 1 dari 3
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Set career goal
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          AI butuh tahu kamu mau kemana. Jawaban ini bisa diubah kapan saja.
        </p>
      </div>

      <form
        action={saveGoalAction}
        className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <Field
          label="Target role"
          name="targetRole"
          placeholder="Contoh: Frontend Engineer"
          defaultValue={current?.targetRole}
          required
          helper="Role spesifik lebih baik dari role umum — ini bikin market scan & gap analysis lebih akurat."
        />

        <TrackPicker defaultValue={current?.targetTrack ?? "fulltime"} />

        <Field
          label="Kota target"
          name="targetCity"
          placeholder="Jakarta / Remote"
          defaultValue={current?.targetCity ?? undefined}
          helper="Opsional. Isi kalau kamu punya preferensi lokasi."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Jam belajar per minggu"
            name="weeklyHours"
            type="number"
            placeholder="10"
            defaultValue={current?.weeklyHours ? String(current.weeklyHours) : undefined}
            suffix="jam"
            helper="Karir.ai akan mengatur beban roadmap sesuai kapasitas kamu."
          />
          <Field
            label="Budget course per bulan"
            name="budgetIdr"
            type="number"
            placeholder="200000"
            defaultValue={current?.budgetIdr ? String(current.budgetIdr) : undefined}
            prefix="Rp"
            helper="Isi 0 kalau cuma mau pakai course gratis (Prakerja, YouTube, Dicoding free)."
          />
        </div>

        <div className="flex flex-col-reverse items-stretch gap-3 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
          <p className="text-xs text-zinc-500">
            Mode demo: data disimpan di cookie browser kamu, bukan server.
          </p>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 px-8 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Simpan & lanjut
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
              <path
                d="M5 12h14M13 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

function TrackPicker({ defaultValue }: { defaultValue: MockGoal["targetTrack"] }) {
  const options: { value: MockGoal["targetTrack"]; title: string; desc: string }[] = [
    { value: "fulltime", title: "Full-time", desc: "Karyawan tetap di perusahaan." },
    { value: "freelance", title: "Freelance", desc: "Project based, remote klien." },
    { value: "both", title: "Dua-duanya", desc: "Fleksibel, apa yang ketemu duluan." },
  ];
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">Mode karir</label>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((o) => (
          <label
            key={o.value}
            className="relative cursor-pointer rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-indigo-300 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/60 has-[:checked]:ring-2 has-[:checked]:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700 dark:has-[:checked]:bg-indigo-950/30"
          >
            <input
              type="radio"
              name="targetTrack"
              value={o.value}
              defaultChecked={o.value === defaultValue}
              className="peer absolute inset-0 cursor-pointer opacity-0"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{o.title}</span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 dark:border-zinc-600">
                <span className="h-1.5 w-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100" />
              </span>
            </div>
            <p className="mt-1.5 text-xs text-zinc-500">{o.desc}</p>
          </label>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  helper,
  prefix,
  suffix,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  helper?: string;
  prefix?: string;
  suffix?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-sm font-medium">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative flex items-center rounded-lg border border-zinc-300 bg-white transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900">
        {prefix && <span className="pl-3 text-sm text-zinc-500">{prefix}</span>}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          className="w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-zinc-400"
        />
        {suffix && <span className="pr-3 text-sm text-zinc-500">{suffix}</span>}
      </div>
      {helper && <p className="mt-1.5 text-xs text-zinc-500">{helper}</p>}
    </div>
  );
}
