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
    <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6 py-16">
      <aside className="col-span-12 md:col-span-4 md:sticky md:top-24 md:self-start">
        <span className="ed-label">01 / Onboarding · step 1 of 3</span>
        <h1 className="mt-6 text-5xl font-medium leading-[0.95] tracking-[-0.025em] md:text-6xl">
          Set career <span className="ed-serif text-pop">goal.</span>
        </h1>
        <p className="mt-5 text-ink-soft max-w-md">
          AI butuh tahu kamu mau kemana. Jawaban ini bisa diubah kapan aja —
          roadmap akan otomatis re-generate.
        </p>
        <div className="mt-8 ed-hairline-t pt-4">
          <span className="ed-label">Tips</span>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li className="flex gap-2.5">
              <span className="text-pop mt-0.5">→</span>
              Role spesifik (bukan &ldquo;tech&rdquo; doang) bikin analisis lebih tajam.
            </li>
            <li className="flex gap-2.5">
              <span className="text-pop mt-0.5">→</span>
              Jujur soal jam belajar. Roadmap nyesuaiin ke kapasitas kamu.
            </li>
          </ul>
        </div>
      </aside>

      <form action={saveGoalAction} className="col-span-12 md:col-span-8">
        <div className="border border-[var(--rule)] rounded-xl bg-surface divide-y divide-[var(--rule)]">
          <FormRow label="Target role" required helper="Role spesifik bikin skill-gap analysis lebih akurat.">
            <Input
              name="targetRole"
              placeholder="Contoh: Frontend Engineer"
              defaultValue={current?.targetRole}
              required
            />
          </FormRow>

          <FormRow label="Mode karir" helper="Pilih salah satu.">
            <TrackPicker defaultValue={current?.targetTrack ?? "fulltime"} />
          </FormRow>

          <FormRow label="Kota target" helper="Opsional. Kosongin kalau bebas.">
            <Input
              name="targetCity"
              placeholder="Jakarta / Remote"
              defaultValue={current?.targetCity ?? undefined}
            />
          </FormRow>

          <FormRow label="Jam belajar / minggu" helper="Karir.ai nyesuaiin beban roadmap ke kapasitas kamu.">
            <Input
              type="number"
              name="weeklyHours"
              placeholder="10"
              suffix="jam"
              defaultValue={current?.weeklyHours ? String(current.weeklyHours) : undefined}
            />
          </FormRow>

          <FormRow label="Budget course / bulan" helper="Isi 0 kalau cuma mau course gratis.">
            <Input
              type="number"
              name="budgetIdr"
              placeholder="200000"
              prefix="Rp"
              defaultValue={current?.budgetIdr ? String(current.budgetIdr) : undefined}
            />
          </FormRow>
        </div>

        <div className="mt-8 flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="ed-label">
            Demo · data disimpan di cookie browser, bukan server.
          </span>
          <button
            type="submit"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-8 text-base font-medium text-paper hover:bg-pop transition-colors"
          >
            Simpan &amp; lanjut
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

function FormRow({
  label,
  required,
  helper,
  children,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 gap-4 p-6">
      <div className="col-span-12 md:col-span-4">
        <label className="text-base font-medium flex items-center gap-1">
          {label}
          {required && <span className="text-blush">*</span>}
        </label>
        {helper && <p className="mt-1.5 text-xs text-ink-muted">{helper}</p>}
      </div>
      <div className="col-span-12 md:col-span-8">{children}</div>
    </div>
  );
}

function Input({
  name,
  type = "text",
  placeholder,
  defaultValue,
  required,
  prefix,
  suffix,
}: {
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center border-b border-ink pb-1 transition-colors focus-within:border-pop">
      {prefix && <span className="ed-mono text-sm text-ink-muted mr-2">{prefix}</span>}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        className="w-full bg-transparent py-2 text-lg font-medium outline-none placeholder:font-normal placeholder:text-ink-muted"
      />
      {suffix && <span className="ed-mono text-sm text-ink-muted ml-2">{suffix}</span>}
    </div>
  );
}

function TrackPicker({ defaultValue }: { defaultValue: MockGoal["targetTrack"] }) {
  const options: { value: MockGoal["targetTrack"]; title: string; desc: string }[] = [
    { value: "fulltime", title: "Full-time", desc: "Karyawan tetap." },
    { value: "freelance", title: "Freelance", desc: "Project based." },
    { value: "both", title: "Dua-duanya", desc: "Fleksibel." },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--rule)] border border-[var(--rule)] rounded-lg overflow-hidden">
      {options.map((o) => (
        <label
          key={o.value}
          className="relative flex cursor-pointer flex-col gap-1 p-4 transition-colors has-[:checked]:bg-pop has-[:checked]:text-pop-ink"
        >
          <input
            type="radio"
            name="targetTrack"
            value={o.value}
            defaultChecked={o.value === defaultValue}
            className="peer sr-only"
          />
          <span className="flex items-center justify-between">
            <span className="text-base font-medium">{o.title}</span>
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current">
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-0 peer-checked:opacity-100 transition-opacity" />
            </span>
          </span>
          <span className="text-xs opacity-75">{o.desc}</span>
        </label>
      ))}
    </div>
  );
}
