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
    <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-8 px-6 py-16">
      <aside className="act-rise col-span-12 md:col-span-4 md:sticky md:top-24 md:self-start">
        <span className="act-eyebrow">Onboarding · atur goal</span>
        <h1 className="act-display mt-4 text-5xl leading-[1.04] md:text-6xl">
          Set career <span className="act-sky-text">goal.</span>
        </h1>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--act-charcoal)]">
          AI butuh tahu kamu mau kemana. Jawaban ini bisa diubah kapan aja —
          roadmap akan otomatis re-generate.
        </p>
        <div className="act-card-2 act-wash-iris-soft mt-8 border-[rgba(109,86,252,0.18)] p-5">
          <span className="act-kicker">Tips</span>
          <ul className="mt-3 space-y-3 text-sm text-[var(--act-charcoal)]">
            <li className="flex gap-2.5">
              <CheckIcon />
              Role spesifik (bukan &ldquo;tech&rdquo; doang) bikin analisis lebih tajam.
            </li>
            <li className="flex gap-2.5">
              <CheckIcon />
              Jujur soal jam belajar. Roadmap nyesuaiin ke kapasitas kamu.
            </li>
          </ul>
        </div>
      </aside>

      <form action={saveGoalAction} className="act-rise col-span-12 md:col-span-8">
        <div className="act-card-2 act-rail act-rail-rainbow divide-y divide-[rgba(15,23,42,0.07)] overflow-hidden pt-1">
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

          <FormRow label="Jam belajar / minggu" helper="CraftWorks nyesuaiin beban roadmap ke kapasitas kamu.">
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
          <span className="text-xs text-[var(--act-graphite)]">
            Demo · data disimpan di cookie browser, bukan server.
          </span>
          <button
            type="submit"
            className="act-pill group justify-center !px-8 !py-3.5 !text-[15px]"
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 flex-none text-[var(--act-blue)]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
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
        <label className="flex items-center gap-1 text-base font-semibold text-[var(--act-ink)]">
          {label}
          {required && <span className="text-[var(--act-magenta)]">*</span>}
        </label>
        {helper && <p className="mt-1.5 text-xs leading-relaxed text-[var(--act-graphite)]">{helper}</p>}
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
  if (prefix || suffix) {
    return (
      <div className="act-field-wrap">
        {prefix && <span className="text-sm font-medium text-[var(--act-graphite)]">{prefix}</span>}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
        />
        {suffix && <span className="text-sm font-medium text-[var(--act-graphite)]">{suffix}</span>}
      </div>
    );
  }
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      required={required}
      defaultValue={defaultValue}
      className="act-field"
    />
  );
}

function TrackPicker({ defaultValue }: { defaultValue: MockGoal["targetTrack"] }) {
  const options: { value: MockGoal["targetTrack"]; title: string; desc: string }[] = [
    { value: "fulltime", title: "Full-time", desc: "Karyawan tetap." },
    { value: "freelance", title: "Freelance", desc: "Project based." },
    { value: "both", title: "Dua-duanya", desc: "Fleksibel." },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {options.map((o) => (
        <label
          key={o.value}
          className="relative flex cursor-pointer flex-col gap-1 rounded-2xl border border-[rgba(15,23,42,0.1)] bg-[var(--act-mist)] p-4 transition-all hover:border-[rgba(0,152,242,0.4)] has-[:checked]:border-[var(--act-blue)] has-[:checked]:bg-[var(--act-sky-50)] has-[:checked]:shadow-[0_0_0_3px_rgba(0,152,242,0.12)]"
        >
          <input
            type="radio"
            name="targetTrack"
            value={o.value}
            defaultChecked={o.value === defaultValue}
            className="peer sr-only"
          />
          <span className="flex items-center justify-between">
            <span className="text-base font-semibold text-[var(--act-ink)]">{o.title}</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[rgba(15,23,42,0.25)] peer-checked:border-[var(--act-blue)]">
              <span className="h-2 w-2 rounded-full bg-[var(--act-blue)] opacity-0 transition-opacity peer-checked:opacity-100" />
            </span>
          </span>
          <span className="text-xs text-[var(--act-graphite)]">{o.desc}</span>
        </label>
      ))}
    </div>
  );
}
