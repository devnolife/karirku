import { MOCK_MILESTONES, MOCK_READINESS } from "@/lib/mock/data";
import { PageHeader, MilestoneRow } from "../_dash/parts";

export default function RoadmapPage() {
  const r = MOCK_READINESS;
  return (
    <div className="act-rise mx-auto max-w-[1200px] space-y-8 px-6 py-8 md:px-10">
      <PageHeader
        kicker="Roadmap 6 minggu"
        title={<>Next moves <span className="text-[var(--act-iris)]">kamu.</span></>}
        meta={`${r.weeksDone} selesai · ${r.weeksTotal - r.weeksDone} to go`}
        action={<span className="act-chip act-chip-iris">{r.weeksDone}/{r.weeksTotal}</span>}
      />
      <ol className="act-card-2 divide-y divide-[rgba(15,23,42,0.07)] overflow-hidden">
        {MOCK_MILESTONES.map((m) => <MilestoneRow key={m.week} milestone={m} />)}
      </ol>
    </div>
  );
}
