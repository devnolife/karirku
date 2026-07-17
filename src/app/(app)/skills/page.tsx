import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getSkillGap } from "@/server/queries/skills";
import { getProfile } from "@/server/queries/profile";
import { PageHeader, SkillBar } from "../_dash/parts";
import { Empty } from "@/components/ui/empty";

export default async function SkillsPage() {
  const user = await requireUser();
  const [gap, profile] = await Promise.all([
    getSkillGap(user.id, 12),
    getProfile(user.id),
  ]);
  const core = gap.skills.filter((s) => s.category === "core");
  const other = gap.skills.filter((s) => s.category !== "core");
  const verifiedCount = profile.skills.filter((s) => s.verified).length;

  return (
    <div className="act-rise mx-auto max-w-[1200px] space-y-8 px-6 py-10 md:px-10">
      <PageHeader
        kicker="Career studio · skills"
        title={<>Peta skill untuk <span className="text-[var(--act-blue)]">targetmu.</span></>}
        meta={`Coverage ${gap.coveragePct}% dari kebutuhan lowongan yang relevan`}
        action={<span className="act-chip act-chip-blue">{gap.skills.length} terpetakan</span>}
      />

      {gap.skills.length === 0 ? (
        <Empty
          title="Belum ada data skill-gap"
          description="Atur target role di Goal agar kami bisa membandingkan skill kamu dengan kebutuhan lowongan."
          actionLabel="Atur goal"
          actionHref="/onboarding"
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <section className="rounded-[24px] border border-[rgba(4,39,24,0.1)] bg-[var(--act-sky-50)] p-6 shadow-[0_14px_30px_-28px_rgba(4,39,24,0.5)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="act-kicker !text-[var(--act-blue)]">Fondasi target</span>
                <h2 className="act-heading mt-2 text-xl text-[var(--act-ink)]">Skill inti</h2>
              </div>
              <span className="act-chip act-chip-amber">Wajib</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--act-charcoal)]">
              Prioritaskan gap terbesar di sini untuk menaikkan kesiapanmu lebih cepat.
            </p>
            <div className="mt-6 space-y-5">
              {core.length > 0
                ? core.map((s) => <SkillBar key={s.name} skill={s} tone="green" />)
                : <p className="text-sm text-[var(--act-graphite)]">Belum ada skill core terdeteksi.</p>}
            </div>
          </section>
          <section className="act-card-2 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="act-kicker">Penguat profil</span>
                <h2 className="act-heading mt-2 text-xl text-[var(--act-ink)]">Nice-to-have & soft skill</h2>
              </div>
              <span className="rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-700">Nilai tambah</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--act-charcoal)]">
              Bekal pembeda yang memperluas pilihan role dan cara kamu bekerja.
            </p>
            <div className="mt-6 space-y-5">
              {other.length > 0
                ? other.map((s) => <SkillBar key={s.name} skill={s} tone="iris" />)
                : <p className="text-sm text-[var(--act-graphite)]">Belum ada skill tambahan terdeteksi.</p>}
            </div>
          </section>
        </div>
      )}

      {profile.skills.length > 0 && (
        <section className="overflow-hidden rounded-[24px] border border-[rgba(4,39,24,0.1)] bg-white shadow-[0_16px_32px_-28px_rgba(4,39,24,0.52)]">
          <div className="flex flex-col gap-4 border-b border-[rgba(4,39,24,0.08)] bg-teal-500/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="act-kicker !text-[var(--act-teal)]">Bukti kemampuan</span>
              <h2 className="act-heading mt-1 text-xl text-[var(--act-ink)]">Verifikasi skill</h2>
            </div>
            <span className="act-chip act-chip-teal">{verifiedCount}/{profile.skills.length} terverifikasi</span>
          </div>
          <div className="p-6">
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--act-charcoal)]">
            Selesaikan kuis singkat untuk memberi sinyal yang lebih kuat tentang kemampuanmu pada recruiter.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {profile.skills.map((s) =>
              s.verified ? (
                <span key={s.id} className="inline-flex items-center gap-1 rounded-full border border-[rgba(13,148,136,0.25)] bg-[rgba(13,148,136,0.08)] px-3.5 py-2 text-sm font-semibold text-[var(--act-teal)]">
                  ✓ {s.name}
                </span>
              ) : (
                <Link
                  key={s.id}
                  href={`/skills/verify/${s.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(4,39,24,0.12)] bg-[var(--act-mist)] px-3.5 py-2 text-sm font-medium text-[var(--act-charcoal)] transition-colors hover:border-[var(--act-blue)] hover:bg-[var(--act-sky-50)] hover:text-[var(--act-blue)]"
                >
                  {s.name}
                  <span className="text-[11px] text-[var(--act-graphite)]">Verifikasi →</span>
                </Link>
              ),
            )}
          </div>
          </div>
        </section>
      )}
    </div>
  );
}
