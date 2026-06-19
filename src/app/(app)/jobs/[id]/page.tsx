import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getJobDetail } from "@/server/queries/jobs";
import { ApplyButton } from "@/components/ApplyButton";

const REGION_BADGE: Record<string, { label: string; cls: string }> = {
  indonesia: { label: "🇮🇩 Indonesia", cls: "act-chip-green" },
  remote: { label: "Remote", cls: "act-chip-blue" },
  foreign: { label: "Luar negeri", cls: "act-chip-mute" },
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const job = await getJobDetail(user.id, id);
  if (!job) notFound();

  const matchClass = job.matchPct >= 70 ? "text-[var(--act-magenta)]" : job.matchPct >= 50 ? "text-[var(--act-iris)]" : "text-[var(--act-graphite)]";
  const region = REGION_BADGE[job.region];
  const descParas = job.description.split(/\n{1,}/).filter((p) => p.trim());

  return (
    <div className="act-rise mx-auto max-w-[900px] space-y-8 px-6 py-8 md:px-10">
      <Link href="/jobs" className="text-sm font-medium text-[var(--act-graphite)] hover:text-[var(--act-ink)]">
        ← Kembali ke Lowongan
      </Link>

      {/* Header */}
      <div className="act-card-2 act-rail act-rail-magenta p-6 md:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`act-chip ${region.cls}`}>{region.label}</span>
              {job.isNative && <span className="act-chip act-chip-iris">Native · lamar in-platform</span>}
              {job.type && <span className="act-chip act-chip-mute">{job.type}</span>}
              {job.level && <span className="act-chip act-chip-mute">{job.level}</span>}
            </div>
            <h1 className="act-display mt-3 text-3xl leading-[1.1] md:text-4xl">{job.title}</h1>
            <p className="mt-2 text-[15px] text-[var(--act-charcoal)]">
              <span className="font-semibold text-[var(--act-ink)]">{job.company}</span> · {job.location}
            </p>
            <p className="mt-1 text-sm text-[var(--act-graphite)]">{job.salary} · diposting {job.posted}</p>
          </div>
          <div className="flex flex-none flex-col items-center gap-1 rounded-2xl bg-[var(--act-mist)] px-5 py-3">
            <span className={`act-display text-4xl ${matchClass}`}>{job.matchPct}<span className="text-lg">%</span></span>
            <span className="act-kicker !text-[10px]">match skill</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[rgba(15,23,42,0.08)] pt-5">
          <ApplyButton jobId={job.id} alreadyApplied={job.applied} isExternal={!!job.applyUrl} />
          {job.applyUrl && (
            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--act-graphite)] hover:underline">
              Lihat di situs asli ↗
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Description + requirements */}
        <div className="space-y-6 lg:col-span-2">
          {descParas.length > 0 ? (
            <div className="act-card-2 p-6">
              <h2 className="act-heading text-lg text-[var(--act-ink)]">Deskripsi pekerjaan</h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-[var(--act-charcoal)]">
                {descParas.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
              </div>
            </div>
          ) : (
            <div className="act-card-2 p-6">
              <h2 className="act-heading text-lg text-[var(--act-ink)]">Deskripsi pekerjaan</h2>
              <p className="mt-3 text-sm text-[var(--act-graphite)]">
                Deskripsi detail belum tersedia. {job.applyUrl ? "Lihat lowongan asli untuk info lengkap." : ""}
              </p>
            </div>
          )}

          {job.requirements.length > 0 && (
            <div className="act-card-2 p-6">
              <h2 className="act-heading text-lg text-[var(--act-ink)]">Kualifikasi</h2>
              <ul className="mt-3 space-y-2">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex gap-2.5 text-[15px] text-[var(--act-charcoal)]">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-[var(--act-blue)]" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Skills sidebar */}
        <div className="space-y-6">
          <div className="act-card-2 p-6">
            <h2 className="act-heading text-base text-[var(--act-ink)]">Skill dibutuhkan</h2>
            <p className="mt-1 text-xs text-[var(--act-graphite)]">{job.matchedSkills.length}/{job.skills.length} kamu kuasai</p>
            <div className="mt-4 space-y-3">
              {job.matchedSkills.length > 0 && (
                <div>
                  <span className="act-kicker !text-[10px]">Kamu punya</span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {job.matchedSkills.map((s) => (
                      <span key={s} className="rounded-md bg-[rgba(5,150,105,0.1)] px-2 py-0.5 text-[11px] font-semibold text-[#059669]">✓ {s}</span>
                    ))}
                  </div>
                </div>
              )}
              {job.missingSkills.length > 0 && (
                <div>
                  <span className="act-kicker !text-[10px]">Perlu dipelajari</span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {job.missingSkills.map((s) => (
                      <span key={s} className="rounded-md bg-[rgba(242,0,202,0.08)] px-2 py-0.5 text-[11px] font-semibold text-[var(--act-magenta)]">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {job.skills.length === 0 && (
                <p className="text-sm text-[var(--act-graphite)]">Skill belum di-ekstrak.</p>
              )}
            </div>
            {job.missingSkills.length > 0 && (
              <Link href="/learn" className="act-pill-ghost mt-4 inline-flex !text-xs">
                Lihat kursus untuk skill ini →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
