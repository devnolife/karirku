import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { getJobDetail } from "@/server/queries/jobs";
import { parseLocation, locationFlag } from "@/lib/location";
import { ApplyButton } from "@/components/ApplyButton";

const REGION_BADGE: Record<string, { label: string; cls: string }> = {
  indonesia: { label: "🇮🇩 Indonesia", cls: "act-chip-green" },
  remote: { label: "Remote", cls: "act-chip-blue" },
  foreign: { label: "Global", cls: "act-chip-mute" },
};

const AVATAR_TONES = ["act-avatar-magenta", "act-avatar-blue", "act-avatar-iris"];

const TILE: Record<string, CSSProperties> = {
  blue: { "--tile-from": "#38bdf8", "--tile-to": "#0098f2" } as CSSProperties,
  iris: { "--tile-from": "#8b78ff", "--tile-to": "#6d56fc" } as CSSProperties,
  magenta: { "--tile-from": "#ff5ce0", "--tile-to": "#f200ca" } as CSSProperties,
  mint: { "--tile-from": "#34d399", "--tile-to": "#059669" } as CSSProperties,
};

const ICONS: Record<string, ReactNode> = {
  pin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></svg>
  ),
  briefcase: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
  ),
  layers: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></svg>
  ),
  wallet: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" /><path d="M21 11h-6a2 2 0 0 0 0 4h6Z" /></svg>
  ),
};

function Fact({ icon, tone, label, value }: { icon: ReactNode; tone: string; label: string; value: string }) {
  return (
    <div className="act-card-2 flex items-center gap-3 p-4">
      <span className="act-icon-tile flex-none" style={TILE[tone]}>{icon}</span>
      <div className="min-w-0">
        <span className="act-kicker block !text-[10px]">{label}</span>
        <span className="block truncate text-sm font-semibold text-[var(--act-ink)]">{value}</span>
      </div>
    </div>
  );
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const job = await getJobDetail(user.id, id);
  if (!job) notFound();

  const ringColor =
    job.matchPct >= 70 ? "var(--act-magenta)" : job.matchPct >= 40 ? "var(--act-iris)" : "var(--act-blue)";
  const region = REGION_BADGE[job.region];
  const loc = parseLocation(job.location);
  const descParas = job.description.split(/\n{1,}/).map((p) => p.trim()).filter(Boolean);
  const avatarTone = AVATAR_TONES[(job.company.charCodeAt(0) || 0) % AVATAR_TONES.length];

  return (
    <div className="act-rise mx-auto max-w-[1080px] space-y-6 px-6 py-8 md:px-10">
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--act-graphite)] transition-colors hover:text-[var(--act-ink)]">
        ← Kembali ke Lowongan
      </Link>

      {/* Hero header */}
      <div className="act-card-2 act-rail act-rail-magenta act-wash-petal-soft overflow-hidden p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <span className={`act-avatar ${avatarTone} !h-14 !w-14 flex-none !rounded-2xl text-xl font-bold`}>
              {job.company.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`act-chip ${region.cls}`}>{region.label}</span>
                {job.isNative && <span className="act-chip act-chip-iris">Native · lamar di sini</span>}
              </div>
              <h1 className="act-display mt-3 text-3xl leading-[1.08] md:text-[40px]">{job.title}</h1>
              <p className="mt-2 text-[15px] text-[var(--act-charcoal)]">
                <span className="font-semibold text-[var(--act-ink)]">{job.company}</span>
                <span className="text-[var(--act-graphite)]"> · diposting {job.posted}</span>
              </p>
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-medium text-[var(--act-ink)]">
                <span className="text-[var(--act-blue)]">{ICONS.pin}</span>
                <span>{loc.flag} {loc.primary}</span>
                {loc.extraCount > 0 && (
                  <span className="text-[13px] font-normal text-[var(--act-graphite)]">+{loc.extraCount} lokasi lain</span>
                )}
              </p>
            </div>
          </div>

          {/* Match ring */}
          <div className="flex flex-none items-center gap-4">
            <div
              className="relative grid h-[104px] w-[104px] flex-none place-items-center rounded-full"
              style={{ background: `conic-gradient(${ringColor} ${job.matchPct * 3.6}deg, rgba(15,23,42,0.08) 0deg)` }}
            >
              <div className="grid h-[84px] w-[84px] place-items-center rounded-full bg-white text-center">
                <span className="act-display text-3xl leading-none" style={{ color: ringColor }}>
                  {job.matchPct}
                  <span className="text-sm">%</span>
                </span>
                <span className="act-kicker mt-0.5 !text-[9px]">match</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-[rgba(15,23,42,0.08)] pt-6">
          <ApplyButton jobId={job.id} alreadyApplied={job.applied} isExternal={!!job.applyUrl} />
          <span className="text-sm text-[var(--act-graphite)]">
            <span className="font-semibold text-[var(--act-ink)]">{job.matchedSkills.length}</span> dari{" "}
            <span className="font-semibold text-[var(--act-ink)]">{job.skills.length || "—"}</span> skill kamu cocok
          </span>
          {job.applyUrl && (
            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs font-medium text-[var(--act-blue)] hover:underline">
              Lihat di situs asli ↗
            </a>
          )}
        </div>
      </div>

      {/* Facts strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Fact icon={ICONS.pin} tone="blue" label="Lokasi" value={`${loc.flag} ${loc.primary}${loc.extraCount > 0 ? ` +${loc.extraCount}` : ""}`} />
        <Fact icon={ICONS.briefcase} tone="iris" label="Tipe" value={job.type ?? "—"} />
        <Fact icon={ICONS.layers} tone="magenta" label="Level" value={job.level ?? "—"} />
        <Fact icon={ICONS.wallet} tone="mint" label="Gaji" value={job.salary} />
      </div>

      {/* All locations (jobs with multiple offices/regions) */}
      {loc.all.length > 1 && (
        <div className="act-card-2 flex flex-wrap items-center gap-x-3 gap-y-2 p-4">
          <span className="act-kicker !text-[10px]">Lokasi asli ({loc.all.length})</span>
          <div className="flex flex-wrap gap-1.5">
            {loc.all.map((l) => (
              <span key={l} className="rounded-md bg-[var(--act-mist)] px-2.5 py-1 text-xs font-medium text-[var(--act-charcoal)] ring-1 ring-[rgba(15,23,42,0.06)]">
                {locationFlag(l)} {l}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Description + requirements */}
        <div className="space-y-6 lg:col-span-2">
          <div className="act-card-2 p-6 md:p-7">
            <h2 className="act-heading text-lg text-[var(--act-ink)]">Deskripsi pekerjaan</h2>
            {descParas.length > 0 ? (
              <div className="mt-4 space-y-3.5 text-[15px] leading-[1.7] text-[var(--act-charcoal)]">
                {descParas.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[var(--act-graphite)]">
                Deskripsi detail belum tersedia.{job.applyUrl ? " Lihat lowongan asli untuk info lengkap." : ""}
              </p>
            )}
          </div>

          {job.requirements.length > 0 && (
            <div className="act-card-2 p-6 md:p-7">
              <h2 className="act-heading text-lg text-[var(--act-ink)]">Kualifikasi</h2>
              <ul className="mt-4 space-y-3">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-[var(--act-charcoal)]">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[var(--act-blue)]" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills coverage */}
          <div className="act-card-2 p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="act-heading text-base text-[var(--act-ink)]">Skill cocok</h2>
              <span className="text-sm font-bold" style={{ color: ringColor }}>
                {job.matchedSkills.length}/{job.skills.length || 0}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[rgba(15,23,42,0.08)]">
              <div className="h-full rounded-full" style={{ width: `${job.matchPct}%`, background: ringColor }} />
            </div>

            <div className="mt-5 space-y-4">
              {job.matchedSkills.length > 0 && (
                <div>
                  <span className="act-kicker !text-[10px]">Kamu kuasai</span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {job.matchedSkills.map((s) => (
                      <span key={s} className="rounded-md bg-[rgba(5,150,105,0.1)] px-2 py-0.5 text-[11px] font-semibold text-[#059669]">✓ {s}</span>
                    ))}
                  </div>
                </div>
              )}
              {job.missingSkills.length > 0 && (
                <div>
                  <span className="act-kicker !text-[10px]">Perlu dipelajari</span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {job.missingSkills.map((s) => (
                      <span key={s} className="rounded-md bg-[rgba(242,0,202,0.08)] px-2 py-0.5 text-[11px] font-semibold text-[var(--act-magenta)]">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {job.skills.length === 0 && (
                <p className="text-sm text-[var(--act-graphite)]">Skill untuk lowongan ini belum di-ekstrak.</p>
              )}
            </div>

            {job.missingSkills.length > 0 && (
              <Link href="/learn" className="act-pill-ghost mt-5 inline-flex w-full justify-center !text-xs">
                Belajar skill yang kurang →
              </Link>
            )}
          </div>

          {/* About company */}
          <div className="act-card-2 p-6">
            <span className="act-kicker !text-[10px]">Tentang perusahaan</span>
            <div className="mt-3 flex items-center gap-3">
              <span className={`act-avatar ${avatarTone} flex-none font-bold`}>{job.company.slice(0, 1).toUpperCase()}</span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--act-ink)]">{job.company}</p>
                <p className="truncate text-xs text-[var(--act-graphite)]">{loc.flag} {loc.primary}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-[rgba(15,23,42,0.07)] pt-4 text-xs text-[var(--act-graphite)]">
              <span className="act-chip act-chip-mute !text-[10px]">{job.isNative ? "Mitra platform" : "Sumber eksternal"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
