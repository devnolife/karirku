import Link from "next/link";
import { getMockSession } from "@/lib/mock/session";
import {
  MOCK_COMPANY,
  MOCK_CANDIDATES,
  CANDIDATE_STAGES,
  type CandidateStage,
} from "@/lib/mock/data";
import { StatCard, GaugeProgress, HatchedBars, type BarDatum } from "../_dash/parts";

const CANDIDATE_TILES = [
  "bg-[linear-gradient(140deg,#38bdf8,#0098f2)]",
  "bg-[linear-gradient(140deg,#8b78ff,#6d56fc)]",
  "bg-[linear-gradient(140deg,#34d399,#059669)]",
  "bg-[linear-gradient(140deg,#ff77dd,#f200ca)]",
];

export async function CompanyOverview() {
  const session = await getMockSession();
  const c = MOCK_COMPANY;
  const byStage = (s: CandidateStage) => MOCK_CANDIDATES.filter((k) => k.stage === s);
  const rankedCandidates = [...MOCK_CANDIDATES].sort((a, b) => b.matchPct - a.matchPct);
  const topCandidate = rankedCandidates[0];

  // Profil dilihat 7 hari terakhir (presentasi).
  const dayLabels = ["S", "S", "R", "K", "J", "S", "M"];
  const factors = [0.5, 0.8, 0.65, 1.2, 0.95, 0, 0];
  const activeDay = 4;
  const viewBars: BarDatum[] = dayLabels.map((label, i) => ({
    label,
    value: Math.round(c.profileViews * 0.01 * factors[i]),
    active: i === activeDay,
  }));

  const offerCount = byStage("offer").length;
  const interviewCount = byStage("interview").length;
  const otherCount = MOCK_CANDIDATES.length - offerCount - interviewCount;
  const offerPct = Math.round((offerCount / Math.max(1, MOCK_CANDIDATES.length)) * 100);

  return (
    <div className="act-rise mx-auto max-w-[1280px] space-y-6 px-5 py-6 md:px-8">
      {/* Header + CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="act-display text-3xl leading-[1.04] md:text-4xl">
            Hai, <span className="act-sky-text">{session.user.name}.</span>
          </h1>
          <p className="mt-2 text-[15px] text-[var(--act-charcoal)]">
            {c.openJobs} lowongan aktif · {c.totalCandidates} kandidat · {c.interviews} interview terjadwal.
          </p>
        </div>
        <div className="flex flex-none gap-2.5">
          <Link href="/company/jobs" className="act-pill !px-5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Posting lowongan
          </Link>
          <Link href="/company/candidates" className="act-pill-ghost !border !border-[rgba(15,23,42,0.14)] !px-5">
            Lihat kandidat
          </Link>
        </div>
      </div>

      {/* Stat row */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Profil dilihat"
          value={c.profileViews.toLocaleString("id-ID")}
          delta="30 hari terakhir"
          featured
        />
        <StatCard label="Lowongan aktif" value={c.openJobs} delta="sedang hiring" href="/company/jobs" />
        <StatCard label="Total kandidat" value={c.totalCandidates} delta="semua lowongan" href="/company/candidates" />
        <StatCard label="Hires bulan ini" value={c.hires} delta={`${c.interviews} interview terjadwal`} />
      </section>

      {/* Bento — 3 kolom */}
      <section className="grid grid-cols-12 gap-4">
        {/* Kiri: profile views bar + ATS pipeline */}
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-5">
          <div className="act-card-2 p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="act-kicker">Profil dilihat</span>
                <h3 className="act-heading mt-1 text-xl">7 hari terakhir</h3>
              </div>
              <span className="act-chip act-chip-blue">{c.profileViews.toLocaleString("id-ID")} total</span>
            </div>
            <div className="mt-6">
              <HatchedBars data={viewBars} />
            </div>
          </div>

          <div className="act-card-2 p-6">
            <div className="flex items-center justify-between">
              <h3 className="act-heading text-lg">ATS pipeline</h3>
              <Link href="/company/candidates" className="act-pill-ghost !text-[var(--act-blue)] !text-xs">
                Detail
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CANDIDATE_STAGES.map((st) => {
                const items = byStage(st.key);
                return (
                  <div key={st.key} className="rounded-xl bg-[var(--act-mist)] p-3.5">
                    <span className="act-kicker !text-[10.5px]">{st.label}</span>
                    <div className="act-display mt-1 text-xl text-[var(--act-ink)]">{items.length}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tengah: reminder + gauge */}
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-3">
          <div className="act-card-2 flex flex-col p-6">
            <span className="act-kicker">Kandidat teratas</span>
            <h3 className="act-heading mt-2 text-lg leading-snug">{topCandidate.name}</h3>
            <p className="mt-1 text-xs text-[var(--act-graphite)]">
              {topCandidate.appliedFor} · {topCandidate.matchPct}% match
            </p>
            <Link href="/company/candidates" className="act-pill mt-5 !w-full justify-center">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              Lihat profil
            </Link>
          </div>

          <div className="act-card-2 flex-1 p-6">
            <span className="act-kicker">Progress hiring</span>
            <div className="mt-5">
              <GaugeProgress
                pct={offerPct}
                label="di tahap offer"
                segments={[
                  { label: `Offer (${offerCount})`, color: "var(--act-sky-deep)" },
                  { label: `Interview (${interviewCount})`, color: "var(--act-sky-bright)" },
                  { label: `Lainnya (${otherCount})`, color: "rgba(15,23,42,0.14)" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Kanan: top candidates + kartu gelap */}
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-4">
          <div className="act-card-2 flex-1 p-6">
            <div className="flex items-center justify-between">
              <h3 className="act-heading text-lg">Top kandidat (AI)</h3>
              <Link href="/company/candidates" className="act-chip act-chip-mute !text-[11px]">
                {MOCK_CANDIDATES.length} total
              </Link>
            </div>
            <ul className="mt-4 space-y-4">
              {rankedCandidates.slice(0, 4).map((k, i) => (
                <li key={k.id} className="flex items-center gap-3">
                  <span className={`act-tile ${CANDIDATE_TILES[i % CANDIDATE_TILES.length]}`}>
                    {k.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--act-ink)]">{k.name}</p>
                    <p className="truncate text-xs text-[var(--act-graphite)]">{k.appliedFor}</p>
                  </div>
                  <span className="act-display flex-none text-lg text-[var(--act-blue)]">
                    {k.matchPct}<span className="text-[11px]">%</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="act-promo">
            <div className="flex items-center justify-between">
              <span className="act-kicker !text-white/60">Kandidat teratas</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold">
                {topCandidate.matchPct}% match
              </span>
            </div>
            <p className="mt-3 truncate text-lg font-semibold">{topCandidate.name}</p>
            <p className="truncate text-xs text-white/60">{topCandidate.appliedFor}</p>
            <Link
              href="/company/candidates"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[var(--act-ink)] transition hover:bg-white/90"
            >
              Lihat detail
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
