import Link from "next/link";
import { getMockSession } from "@/lib/mock/session";
import { getReadiness, getRoadmapMilestones } from "@/lib/data/jobseeker";
import { PageHeader, MilestoneRow, EmptyState } from "../_dash/parts";

export default async function RoadmapPage() {
  const session = await getMockSession();
  const [milestones, r] = await Promise.all([
    getRoadmapMilestones(session.user.email),
    getReadiness(session.user.email),
  ]);
  return (
    <div className="act-rise mx-auto max-w-[1200px] space-y-8 px-6 py-8 md:px-10">
      <PageHeader
        title={<>Next moves <span className="text-[var(--act-iris)]">kamu.</span></>}
        meta={`${r.weeksDone} selesai · ${r.weeksTotal - r.weeksDone} to go`}
        action={<span className="act-chip act-chip-iris">{r.weeksDone}/{r.weeksTotal}</span>}
      />
      {milestones.length === 0 ? (
        <EmptyState
          glyph="milestones"
          title="Roadmap kamu belum disusun"
          desc="Tentukan target role & jam belajar per minggu, lalu AI menyusun rencana 6 minggu yang realistis."
          action={
            <Link href="/onboarding" className="act-pill !text-sm">
              Mulai dari goal
            </Link>
          }
        />
      ) : (
        <ol className="act-card-2 divide-y divide-[rgba(15,23,42,0.07)] overflow-hidden">
          {milestones.map((m) => <MilestoneRow key={m.week} milestone={m} />)}
        </ol>
      )}
    </div>
  );
}
