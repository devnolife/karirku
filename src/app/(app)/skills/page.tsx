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
    <div className="act-rise mx-auto max-w-[1200px] space-y-8 px-6 py-8 md:px-10">
      <PageHeader
        kicker="Skill-gap analyzer"
        title={<>Skill kamu <span className="text-[var(--act-blue)]">vs target.</span></>}
        meta={`Coverage ${gap.coveragePct}% · dari lowongan yang cocok`}
        action={<span className="act-chip act-chip-blue">{gap.skills.length} skill</span>}
      />

      {gap.skills.length === 0 ? (
        <Empty
          title="Belum ada data skill-gap"
          description="Atur target role di Goal agar kami bisa membandingkan skill kamu dengan kebutuhan lowongan."
          actionLabel="Atur goal"
          actionHref="/onboarding"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="act-card-2 p-6">
            <span className="act-chip act-chip-blue">Core — wajib</span>
            <div className="mt-5 space-y-5">
              {core.length > 0
                ? core.map((s) => <SkillBar key={s.name} skill={s} tone="blue" />)
                : <p className="text-sm text-[var(--act-graphite)]">Belum ada skill core terdeteksi.</p>}
            </div>
          </div>
          <div className="act-card-2 p-6">
            <span className="act-chip act-chip-iris">Nice-to-have + Soft</span>
            <div className="mt-5 space-y-5">
              {other.length > 0
                ? other.map((s) => <SkillBar key={s.name} skill={s} tone="iris" />)
                : <p className="text-sm text-[var(--act-graphite)]">Belum ada skill tambahan terdeteksi.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Verifikasi skill — pembeda inti CraftWorks */}
      {profile.skills.length > 0 && (
        <div className="act-card-2 p-6">
          <div className="flex items-center justify-between">
            <span className="act-kicker">Verifikasi skill</span>
            <span className="act-chip act-chip-iris">{verifiedCount}/{profile.skills.length} verified</span>
          </div>
          <p className="mt-2 text-sm text-[var(--act-graphite)]">
            Skill terverifikasi (lewat kuis AI) menaikkan readiness & dipercaya perusahaan.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.skills.map((s) =>
              s.verified ? (
                <span key={s.id} className="inline-flex items-center gap-1 rounded-full border border-[rgba(109,86,252,0.3)] bg-[rgba(109,86,252,0.08)] px-3 py-1.5 text-sm font-semibold text-[var(--act-iris)]">
                  ✓ {s.name}
                </span>
              ) : (
                <Link
                  key={s.id}
                  href={`/skills/verify/${s.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(15,23,42,0.12)] bg-[var(--act-mist)] px-3 py-1.5 text-sm font-medium text-[var(--act-charcoal)] transition-all hover:border-[var(--act-blue)] hover:text-[var(--act-blue)]"
                >
                  {s.name}
                  <span className="text-[11px] text-[var(--act-graphite)]">· verifikasi</span>
                </Link>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
