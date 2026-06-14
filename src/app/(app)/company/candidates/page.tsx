import { MOCK_CANDIDATES, CANDIDATE_STAGES } from "@/lib/mock/data";

export default function CompanyCandidatesPage() {
  const candidates = [...MOCK_CANDIDATES].sort((a, b) => b.matchPct - a.matchPct);

  return (
    <div className="act-rise mx-auto max-w-[1400px] space-y-8 px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="act-eyebrow">Company · Kandidat</span>
          <h1 className="act-display mt-3 text-4xl leading-[1.05] md:text-5xl">
            Kandidat <span className="act-sky-text">terscreening.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--act-graphite)]">
            Pelamar yang sudah disaring & diberi skor oleh AI. Data ilustratif (mode demo).
          </p>
        </div>
        <span className="act-chip act-chip-blue">{candidates.length} kandidat</span>
      </div>

      {/* Stage summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CANDIDATE_STAGES.map((st) => {
          const n = MOCK_CANDIDATES.filter((k) => k.stage === st.key).length;
          return (
            <div key={st.key} className="act-card-2 p-4">
              <span className="act-kicker">{st.label}</span>
              <div className="act-display mt-1 text-2xl text-[var(--act-ink)]">{n}</div>
            </div>
          );
        })}
      </div>

      <div className="act-card-2 overflow-hidden">
        <div className="hidden grid-cols-12 gap-3 border-b border-[rgba(15,23,42,0.07)] px-5 py-3 md:grid">
          <span className="act-kicker !text-[11px] col-span-1">Match</span>
          <span className="act-kicker !text-[11px] col-span-4">Kandidat</span>
          <span className="act-kicker !text-[11px] col-span-3">Skills</span>
          <span className="act-kicker !text-[11px] col-span-2">Stage</span>
          <span className="act-kicker !text-[11px] col-span-2 text-right">Aksi</span>
        </div>
        <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
          {candidates.map((k) => {
            const matchClass = k.matchPct >= 85 ? "text-[var(--act-magenta)]" : k.matchPct >= 75 ? "text-[var(--act-iris)]" : "text-[var(--act-graphite)]";
            const stageCls = { applied: "act-chip-mute", screening: "act-chip-blue", interview: "act-chip-iris", offer: "act-chip-green" }[k.stage];
            const stageLabel = CANDIDATE_STAGES.find((s) => s.key === k.stage)?.label ?? k.stage;
            return (
              <li key={k.id} className="act-rowhover grid grid-cols-12 items-center gap-3 px-5 py-4">
                <div className="col-span-3 md:col-span-1">
                  <span className={`act-display text-2xl ${matchClass}`}>{k.matchPct}</span>
                </div>
                <div className="col-span-9 flex items-center gap-3 md:col-span-4">
                  <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[var(--act-onyx)] text-xs font-semibold text-white">
                    {k.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[var(--act-ink)]">{k.name}</div>
                    <div className="truncate text-xs text-[var(--act-graphite)]">{k.appliedFor} · {k.applied}</div>
                  </div>
                </div>
                <div className="col-span-6 md:col-span-3">
                  <div className="flex flex-wrap gap-1.5">
                    {k.skills.map((s) => (
                      <span key={s} className="rounded-md bg-[rgba(0,152,242,0.08)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--act-blue)]">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="col-span-3 md:col-span-2">
                  <span className={`act-chip ${stageCls}`}>{stageLabel}</span>
                </div>
                <div className="col-span-3 text-right md:col-span-2">
                  <button className="text-xs font-semibold text-[var(--act-blue)] hover:underline">Lihat</button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
