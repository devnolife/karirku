import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/server/queries/profile";
import { getActiveGoal } from "@/server/queries/goal";
import { OnboardingStepper } from "../_stepper";

async function finishAction() {
  "use server";
  redirect("/dashboard");
}

export default async function OnboardingReviewPage() {
  const user = await requireUser();
  const [profile, goal] = await Promise.all([
    getProfile(user.id),
    getActiveGoal(user.id),
  ]);

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-12">
      <div className="mb-8"><OnboardingStepper current={3} /></div>

      <div className="act-rise">
        <span className="act-eyebrow">Onboarding · Step 3</span>
        <h1 className="act-display mt-4 text-5xl leading-[1.04] md:text-6xl">
          Semua sudah <span className="act-sky-text">siap.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[var(--act-charcoal)]">
          Cek ringkasan profilmu. Dashboard, skill-gap, dan rekomendasi loker akan
          memakai data ini.
        </p>
      </div>

      <div className="act-rise mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Goal */}
        <div className="act-card-2 act-rail act-rail-iris p-6">
          <div className="flex items-center justify-between">
            <span className="act-kicker">Career goal</span>
            <Link href="/onboarding/goal" className="text-xs font-semibold text-[var(--act-blue)] hover:underline">Ubah</Link>
          </div>
          {goal ? (
            <div className="mt-3 space-y-1.5">
              <p className="act-heading text-xl text-[var(--act-ink)]">{goal.targetRole}</p>
              <p className="text-sm text-[var(--act-graphite)]">
                {goal.targetTrack} · {goal.targetCity ?? "Lokasi bebas"}
              </p>
              <p className="text-sm text-[var(--act-graphite)]">
                {goal.weeklyHours} jam/minggu ·{" "}
                {goal.budgetIdr > 0 ? `Rp ${goal.budgetIdr.toLocaleString("id-ID")}/bln` : "course gratis"}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--act-graphite)]">
              Belum ada goal. <Link href="/onboarding/goal" className="font-semibold text-[var(--act-blue)]">Atur sekarang</Link>.
            </p>
          )}
        </div>

        {/* Skills */}
        <div className="act-card-2 act-rail act-rail-blue p-6">
          <div className="flex items-center justify-between">
            <span className="act-kicker">Skill ({profile.skills.length})</span>
            <Link href="/onboarding" className="text-xs font-semibold text-[var(--act-blue)] hover:underline">Ubah</Link>
          </div>
          {profile.skills.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.skills.map((s) => (
                <span key={s.id} className="rounded-md bg-[rgba(0,152,242,0.08)] px-2 py-0.5 text-[11px] font-semibold text-[var(--act-blue)]">
                  {s.name}
                  {s.verified && <span className="ml-1 text-[var(--act-iris)]">✓</span>}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--act-graphite)]">
              Belum ada skill. <Link href="/onboarding" className="font-semibold text-[var(--act-blue)]">Tambah sekarang</Link>.
            </p>
          )}
        </div>
      </div>

      <form action={finishAction} className="act-rise mt-8 flex justify-end">
        <button type="submit" className="act-pill group justify-center !px-8 !py-3.5 !text-[15px]">
          Selesai · ke dashboard
          <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </form>
    </div>
  );
}
