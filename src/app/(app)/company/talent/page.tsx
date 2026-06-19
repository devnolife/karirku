import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  getCompanyJobOptions,
  searchTalentForJob,
  type TalentMatch,
} from "@/server/queries/company";
import { Empty } from "@/components/ui/empty";

const BAND_LABEL: Record<string, { label: string; cls: string }> = {
  ready: { label: "Ready", cls: "act-chip-green" },
  getting_there: { label: "Getting there", cls: "act-chip-iris" },
  not_ready: { label: "Belum siap", cls: "act-chip-mute" },
};

export default async function TalentSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const user = await requireUser();
  const { job: selectedJobId } = await searchParams;

  const jobs = await getCompanyJobOptions(user.id);
  const activeJobId = selectedJobId ?? jobs[0]?.id ?? null;
  const activeJob = jobs.find((j) => j.id === activeJobId) ?? null;

  let talents: TalentMatch[] | null = null;
  if (activeJobId) {
    talents = await searchTalentForJob(user.id, activeJobId, 20);
  }

  return (
    <div className="act-rise mx-auto max-w-[1200px] space-y-8 px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="act-eyebrow">Company · Talent search</span>
          <h1 className="act-display mt-3 text-4xl leading-[1.05] md:text-5xl">
            Cari <span className="act-sky-text">talent.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--act-graphite)]">
            Temukan talent pre-qualified yang cocok dengan lowonganmu — di-ranking
            berdasarkan skill match, kemiripan semantik, dan readiness.
          </p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <Empty
          title="Belum ada lowongan"
          description="Posting lowongan dulu untuk mulai mencari talent yang cocok."
          actionLabel="Posting lowongan"
          actionHref="/company/jobs/new"
        />
      ) : (
        <>
          {/* Job selector */}
          <div className="flex flex-wrap gap-2">
            {jobs.map((j) => (
              <Link
                key={j.id}
                href={`/company/talent?job=${j.id}`}
                className={
                  j.id === activeJobId
                    ? "rounded-full bg-[var(--act-onyx)] px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-full border border-[rgba(15,23,42,0.12)] bg-[var(--act-mist)] px-4 py-2 text-sm font-medium text-[var(--act-charcoal)] transition-all hover:border-[var(--act-blue)]"
                }
              >
                {j.title}
              </Link>
            ))}
          </div>

          {/* Results */}
          {!talents || talents.length === 0 ? (
            <Empty
              title="Belum ada talent cocok"
              description={`Belum ada kandidat dengan skill yang relevan untuk ${activeJob?.title ?? "lowongan ini"}.`}
            />
          ) : (
            <div className="act-card-2 overflow-hidden">
              <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
                <span className="act-kicker">Talent cocok untuk {activeJob?.title}</span>
                <span className="act-chip act-chip-blue">{talents.length} kandidat</span>
              </div>
              <div className="hidden grid-cols-12 gap-3 border-b border-[rgba(15,23,42,0.07)] px-5 py-3 md:grid">
                <span className="act-kicker !text-[11px] col-span-1">Match</span>
                <span className="act-kicker !text-[11px] col-span-4">Talent</span>
                <span className="act-kicker !text-[11px] col-span-3">Skill cocok</span>
                <span className="act-kicker !text-[11px] col-span-2">Readiness</span>
                <span className="act-kicker !text-[11px] col-span-2">Verified</span>
              </div>
              <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
                {talents.map((t) => {
                  const matchClass = t.matchPct >= 70 ? "text-[var(--act-magenta)]" : t.matchPct >= 50 ? "text-[var(--act-iris)]" : "text-[var(--act-graphite)]";
                  const band = BAND_LABEL[t.readinessBand];
                  return (
                    <li key={t.userId} className="act-rowhover grid grid-cols-12 items-center gap-3 px-5 py-4">
                      <div className="col-span-3 md:col-span-1">
                        <span className={`act-display text-2xl ${matchClass}`}>{t.matchPct}</span>
                      </div>
                      <div className="col-span-9 flex items-center gap-3 md:col-span-4">
                        <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[var(--act-onyx)] text-xs font-semibold text-white">
                          {t.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-[var(--act-ink)]">{t.name}</div>
                          <div className="truncate text-xs text-[var(--act-graphite)]">{t.headline}</div>
                        </div>
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <div className="flex flex-wrap gap-1.5">
                          {t.matchedSkills.length > 0 ? t.matchedSkills.map((s) => (
                            <span key={s} className="rounded-md bg-[rgba(0,152,242,0.08)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--act-blue)]">{s}</span>
                          )) : <span className="text-xs text-[var(--act-graphite)]">—</span>}
                        </div>
                      </div>
                      <div className="col-span-3 md:col-span-2">
                        <span className={`act-chip ${band.cls}`}>{t.readinessScore}% {band.label}</span>
                      </div>
                      <div className="col-span-3 text-sm text-[var(--act-charcoal)] md:col-span-2">
                        {t.verifiedCount}/{t.totalSkills} skill
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
