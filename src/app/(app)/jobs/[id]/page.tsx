import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { getJobDetail } from "@/server/queries/jobs";
import { parseLocation, locationFlag } from "@/lib/location";
import { describeJobSource } from "@/lib/source";
import { ApplyButton } from "@/components/ApplyButton";

const REGION_BADGE: Record<string, { label: string; cls: string }> = {
  indonesia: { label: "🇮🇩 Indonesia", cls: "act-chip-green" },
  remote: { label: "Remote", cls: "act-chip-blue" },
  foreign: { label: "Global", cls: "act-chip-mute" },
};

const FACT_TONES: Record<string, string> = {
  blue: "bg-blue-600/10 text-blue-700",
  iris: "bg-violet-600/10 text-violet-700",
  amber: "bg-amber-500/15 text-amber-700",
  mint: "bg-[var(--act-wash-sky)] text-[var(--act-onyx)]",
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
  link: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
  ),
  shield: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
  ),
  info: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
  ),
};

function Fact({ icon, tone, label, value }: { icon: ReactNode; tone: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-[rgba(4,39,24,0.08)] bg-white p-4 shadow-[0_10px_20px_-24px_rgba(4,39,24,0.45)]">
      <span className={`inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl ${FACT_TONES[tone]}`}>{icon}</span>
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

  const ringColor = job.matchPct >= 70 ? "#198F38" : job.matchPct >= 40 ? "#D97706" : "#E11D48";
  const region = REGION_BADGE[job.region];
  const loc = parseLocation(job.location);
  const src = describeJobSource(job.source, job.applyUrl, job.isNative);
  const descParas = job.description.split(/\n{1,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="act-rise mx-auto max-w-[1080px] space-y-6 px-6 py-8 md:px-10">
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--act-graphite)] transition-colors hover:text-[var(--act-ink)]">
        ← Kembali ke Lowongan
      </Link>

      <section aria-labelledby="job-title" className="overflow-hidden rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-brand-50 p-6 shadow-[0_20px_40px_-32px_rgba(4,39,24,0.55)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <span className="inline-flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-[var(--act-onyx)] font-[family-name:var(--font-onest-v)] text-xl font-bold text-white">
              {job.company.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`act-chip ${region.cls}`}>{region.label}</span>
                {job.isNative && <span className="act-chip act-chip-teal">Native · lamar di sini</span>}
              </div>
              <h1 id="job-title" className="act-display mt-3 text-3xl leading-[1.08] md:text-[40px]">{job.title}</h1>
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

          <div className="flex flex-none items-center gap-4 rounded-[20px] border border-[rgba(4,39,24,0.08)] bg-white p-3">
            <div
              className="relative grid h-[104px] w-[104px] flex-none place-items-center rounded-full"
              style={{ background: `conic-gradient(${ringColor} ${job.matchPct * 3.6}deg, rgba(15,23,42,0.08) 0deg)` }}
            >
              <div className="grid h-[84px] w-[84px] place-items-center rounded-full bg-brand-50 text-center">
                <span className="act-display text-3xl leading-none" style={{ color: ringColor }}>
                  {job.matchPct}
                  <span className="text-sm">%</span>
                </span>
                <span className="act-kicker mt-0.5 !text-[9px]">match</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 border-t border-[rgba(4,39,24,0.1)] pt-6">
          <span className="studio-section-kicker">Kesiapan melamar</span>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-3">
            <ApplyButton jobId={job.id} alreadyApplied={job.applied} isExternal={!!job.applyUrl} />
            <span className="text-sm text-[var(--act-graphite)]">
              <span className="font-semibold text-[var(--act-ink)]">{job.matchedSkills.length}</span> dari{" "}
              <span className="font-semibold text-[var(--act-ink)]">{job.skills.length || "—"}</span> skill kamu cocok
            </span>
            {job.applyUrl && (
              <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[var(--act-blue)] hover:underline lg:ml-auto">
                Lihat di situs asli ↗
              </a>
            )}
          </div>
          {/* Redirect notice: jelaskan ke mana lamaran resmi diarahkan */}
          {src.redirectsOut ? (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--act-graphite)]">
              <span className="text-[var(--act-blue)]">{ICONS.link}</span>
              Klik <span className="font-semibold text-[var(--act-ink)]">Lamar</span> → diarahkan ke situs resmi{" "}
              <span className="font-semibold text-[var(--act-ink)]">{src.host}</span> via {src.platform}.
            </p>
          ) : src.kind === "native" ? (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--act-graphite)]">
              <span className="text-[var(--act-teal)]">{ICONS.shield}</span>
              Lamar langsung di KarirKu — lamaranmu tercatat & dikelola di sini.
            </p>
          ) : (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--act-graphite)]">
              <span className="text-[var(--act-graphite)]">{ICONS.info}</span>
              Lowongan contoh (data internal) — belum ada tautan lamaran resmi.
            </p>
          )}
        </div>
      </section>

      {/* Facts strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Fact icon={ICONS.pin} tone="blue" label="Lokasi" value={`${loc.flag} ${loc.primary}${loc.extraCount > 0 ? ` +${loc.extraCount}` : ""}`} />
        <Fact icon={ICONS.briefcase} tone="iris" label="Tipe" value={job.type ?? "—"} />
        <Fact icon={ICONS.layers} tone="amber" label="Level" value={job.level ?? "—"} />
        <Fact icon={ICONS.wallet} tone="mint" label="Gaji" value={job.salary} />
      </div>

      {/* All locations (jobs with multiple offices/regions) */}
      {loc.all.length > 1 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[20px] border border-[rgba(4,39,24,0.08)] bg-[var(--act-wash-blue)] p-4">
          <span className="act-kicker !text-[10px]">Lokasi asli ({loc.all.length})</span>
          <div className="flex flex-wrap gap-1.5">
            {loc.all.map((l) => (
              <span key={l} className="rounded-md bg-white/70 px-2.5 py-1 text-xs font-medium text-[var(--act-charcoal)] ring-1 ring-[rgba(4,39,24,0.06)]">
                {locationFlag(l)} {l}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Description + requirements */}
        <div className="space-y-6 lg:col-span-2">
           <article className="rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-white p-6 shadow-[0_14px_28px_-26px_rgba(4,39,24,0.4)] md:p-7">
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
          </article>

          {job.requirements.length > 0 && (
             <section className="rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-[var(--act-wash-sky)] p-6 md:p-7">
              <h2 className="act-heading text-lg text-[var(--act-ink)]">Kualifikasi</h2>
              <ul className="mt-4 space-y-3">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-[var(--act-charcoal)]">
                     <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[var(--act-green)]" />
                    {r}
                  </li>
                ))}
              </ul>
             </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills coverage */}
           <section className="rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-white p-6 shadow-[0_14px_28px_-26px_rgba(4,39,24,0.4)]">
            <div className="flex items-baseline justify-between">
              <h2 className="act-heading text-base text-[var(--act-ink)]">Skill cocok</h2>
              <span className="text-sm font-bold" style={{ color: ringColor }}>
                {job.matchedSkills.length}/{job.skills.length || 0}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[rgba(15,23,42,0.08)]">
               <div className="h-full rounded-full" style={{ width: `${job.matchPct}%`, backgroundColor: ringColor }} />
            </div>

            <div className="mt-5 space-y-4">
              {job.matchedSkills.length > 0 && (
                <div>
                  <span className="act-kicker !text-[10px]">Kamu kuasai</span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {job.matchedSkills.map((s) => (
                       <span key={s} className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-[var(--act-blue)]">✓ {s}</span>
                    ))}
                  </div>
                </div>
              )}
              {job.missingSkills.length > 0 && (
                <div>
                  <span className="act-kicker !text-[10px]">Perlu dipelajari</span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {job.missingSkills.map((s) => (
                       <span key={s} className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700">{s}</span>
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
          </section>

          {/* About company */}
           <aside className="rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-[var(--act-wash-lilac)] p-6">
            <span className="act-kicker !text-[10px]">Tentang perusahaan</span>
            <div className="mt-3 flex items-center gap-3">
               <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[var(--act-violet)] font-bold text-white">{job.company.slice(0, 1).toUpperCase()}</span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--act-ink)]">{job.company}</p>
                <p className="truncate text-xs text-[var(--act-graphite)]">{loc.flag} {loc.primary}</p>
              </div>
            </div>
             <div className="mt-4 border-t border-[rgba(4,39,24,0.1)] pt-4">
              <span className="act-kicker !text-[10px]">Sumber lowongan</span>
              <div className="mt-2 flex items-center gap-2">
                <span className={`act-chip !text-[10px] ${src.kind === "native" ? "act-chip-teal" : src.kind === "external" ? "act-chip-blue" : "act-chip-mute"}`}>
                  {src.kind === "external" ? `via ${src.platform}` : src.kind === "native" ? "KarirKu (native)" : "Data contoh"}
                </span>
              </div>
              {src.redirectsOut && src.host && (
                <p className="mt-2 text-xs leading-relaxed text-[var(--act-graphite)]">
                  Lamaran resmi diarahkan ke{" "}
                  <span className="break-all font-semibold text-[var(--act-ink)]">{src.host}</span>.
                </p>
              )}
              {src.kind === "native" && (
                <p className="mt-2 text-xs leading-relaxed text-[var(--act-graphite)]">
                  Diposting langsung oleh perusahaan di KarirKu.
                </p>
              )}
              {job.applyUrl && (
                <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--act-blue)] hover:underline">
                  Buka tautan asli ↗
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
