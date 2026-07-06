import Link from "next/link";
import { getMockSession, getGoal } from "@/lib/mock/session";
import {
  MOCK_FREELANCER,
  MOCK_PROJECTS,
  MOCK_PROPOSALS,
  MOCK_FREELANCER_ACTIVITY,
} from "@/lib/mock/data";
import { getReadiness, getRecommendedJobs } from "@/lib/data/jobseeker";
import { StatCard, GaugeProgress, HatchedBars, SecondaryModeCard, type BarDatum } from "../_dash/parts";

const PROJECT_TILES = [
  "bg-[linear-gradient(140deg,#38bdf8,#0098f2)]",
  "bg-[linear-gradient(140deg,#8b78ff,#6d56fc)]",
  "bg-[linear-gradient(140deg,#34d399,#059669)]",
  "bg-[linear-gradient(140deg,#ff77dd,#f200ca)]",
];

const PROPOSAL_CHIP: Record<string, { cls: string; label: string }> = {
  won: { cls: "act-chip-green", label: "Won" },
  shortlisted: { cls: "act-chip-blue", label: "Shortlisted" },
  sent: { cls: "act-chip-mute", label: "Terkirim" },
  draft: { cls: "act-chip-amber", label: "Draft" },
};

export async function FreelancerOverview() {
  const session = await getMockSession();
  const goal = await getGoal();
  const firstName = session.user.name.split(" ")[0];
  const f = MOCK_FREELANCER;
  const showFulltimeMode = goal?.targetTrack === "both";
  const [readiness, jobs] = showFulltimeMode
    ? await Promise.all([getReadiness(session.user.email), getRecommendedJobs(session.user.email)])
    : [null, null];
  const bestJob = jobs ? [...jobs].sort((a, b) => b.matchPct - a.matchPct)[0] : null;
  const rankedProjects = [...MOCK_PROJECTS].sort((a, b) => b.matchPct - a.matchPct);
  const topProject = rankedProjects[0];
  const won = MOCK_PROPOSALS.filter((p) => p.status === "won").length;

  // Earnings 7 hari terakhir (presentasi) — sebagian hari kosong (arsir).
  const dayLabels = ["S", "S", "R", "K", "J", "S", "M"];
  const factors = [0.4, 0.75, 0.55, 1.1, 0.9, 0, 0];
  const activeDay = 4;
  const earningBars: BarDatum[] = dayLabels.map((label, i) => ({
    label,
    value: Math.round((f.earningsIdr / 1_000_000) * 0.01 * factors[i] * 10) / 10,
    active: i === activeDay,
  }));

  return (
    <div className="act-rise mx-auto max-w-[1280px] space-y-6 px-5 py-6 md:px-8">
      {/* Header + CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="act-display text-3xl leading-[1.04] md:text-4xl">
            Halo, <span className="act-sky-text">{firstName}.</span>
          </h1>
          <p className="mt-2 text-[15px] text-[var(--act-charcoal)]">
            {goal?.targetRole ? `${goal.targetRole} · ` : ""}rate Rp {(f.hourlyRateIdr / 1000).toFixed(0)}k/jam · ⭐ {f.rating} ({f.reviews} ulasan)
          </p>
        </div>
        <div className="flex flex-none gap-2.5">
          <Link href="/projects" className="act-pill !px-5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Cari project
          </Link>
          <Link href="/proposals" className="act-pill-ghost !border !border-[rgba(15,23,42,0.14)] !px-5">
            Kelola proposal
          </Link>
        </div>
      </div>

      {/* Stat row */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total earnings"
          value={<>Rp {(f.earningsIdr / 1_000_000).toFixed(1)}<span className="text-2xl">jt</span></>}
          delta="lifetime"
          featured
        />
        <StatCard
          label="Proposal won"
          value={won}
          delta={`dari ${MOCK_PROPOSALS.length} kirim`}
          href="/proposals"
        />
        <StatCard
          label="Match terbaik"
          value={<>{topProject.matchPct}<span className="text-2xl">%</span></>}
          delta={`${MOCK_PROJECTS.length} project baru`}
          href="/projects"
        />
        <StatCard
          label="Kesiapan profil"
          value={<>{f.readiness}<span className="text-2xl">%</span></>}
          delta={`response rate ${f.responseRate}%`}
        />
      </section>

      {/* Bento — 3 kolom */}
      <section className="grid grid-cols-12 gap-4">
        {/* Kiri: earnings bar + aktivitas */}
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-5">
          <div className="act-card-2 p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="act-kicker">Earnings</span>
                <h3 className="act-heading mt-1 text-xl">7 hari terakhir</h3>
              </div>
              <span className="act-chip act-chip-blue">{f.completedProjects} project selesai</span>
            </div>
            <div className="mt-6">
              <HatchedBars data={earningBars} />
            </div>
          </div>

          <div className="act-card-2 p-6">
            <h3 className="act-heading text-lg">Aktivitas terbaru</h3>
            <ul className="mt-4 space-y-3.5">
              {MOCK_FREELANCER_ACTIVITY.slice(0, 4).map((a, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-[var(--act-blue)]" />
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--act-charcoal)]">{a.text}</p>
                    <p className="text-xs text-[var(--act-graphite)]">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tengah: reminder + gauge */}
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-3">
          <div className="act-card-2 flex flex-col p-6">
            <span className="act-kicker">Project prioritas</span>
            <h3 className="act-heading mt-2 text-lg leading-snug">{topProject.title}</h3>
            <p className="mt-1 text-xs text-[var(--act-graphite)]">
              {topProject.client} · {topProject.budget}
            </p>
            <Link href="/projects" className="act-pill mt-5 !w-full justify-center">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              Lihat detail
            </Link>
          </div>

          <div className="act-card-2 flex-1 p-6">
            <span className="act-kicker">Response rate</span>
            <div className="mt-5">
              <GaugeProgress
                pct={f.responseRate}
                label="tingkat respons"
                segments={[
                  { label: `Won (${won})`, color: "var(--act-sky-deep)" },
                  { label: `Shortlisted`, color: "var(--act-sky-bright)" },
                  { label: `Lainnya`, color: "rgba(15,23,42,0.14)" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Kanan: project list + kartu gelap proposal */}
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-4">
          <div className="act-card-2 flex-1 p-6">
            <div className="flex items-center justify-between">
              <h3 className="act-heading text-lg">Project cocok</h3>
              <Link href="/projects" className="act-chip act-chip-mute !text-[11px]">
                {MOCK_PROJECTS.length} posisi
              </Link>
            </div>
            <ul className="mt-4 space-y-4">
              {rankedProjects.slice(0, 4).map((p, i) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className={`act-tile ${PROJECT_TILES[i % PROJECT_TILES.length]}`}>{p.client.charAt(0)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--act-ink)]">{p.title}</p>
                    <p className="truncate text-xs text-[var(--act-graphite)]">{p.client} · {p.budget}</p>
                  </div>
                  <span className="act-display flex-none text-lg text-[var(--act-blue)]">
                    {p.matchPct}<span className="text-[11px]">%</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="act-promo">
            <div className="flex items-center justify-between">
              <span className="act-kicker !text-white/60">Proposal terbaru</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold">
                {MOCK_PROPOSALS.length} terkirim
              </span>
            </div>
            <p className="mt-3 truncate text-lg font-semibold">{MOCK_PROPOSALS[0].project}</p>
            <p className="truncate text-xs text-white/60">
              {MOCK_PROPOSALS[0].client} · {PROPOSAL_CHIP[MOCK_PROPOSALS[0].status].label}
            </p>
            <Link
              href="/proposals"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[var(--act-ink)] transition hover:bg-white/90"
            >
              Kelola proposal
            </Link>
          </div>
        </div>
      </section>

      {/* Mode kedua: full-time (muncul hanya bila Mode karir = "Dua-duanya") */}
      {showFulltimeMode && readiness && bestJob && (
        <SecondaryModeCard
          href="/jobs"
          tone="blue"
          label="Mode full-time aktif"
          title={bestJob.title}
          subtitle={`${bestJob.company} · ${bestJob.location}`}
          stats={[
            { label: "readiness", value: `${readiness.score}%` },
            { label: "match", value: `${bestJob.matchPct}%` },
          ]}
        />
      )}
    </div>
  );
}
