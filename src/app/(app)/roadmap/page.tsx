import { requireUser } from "@/lib/auth";
import { getRoadmap } from "@/server/queries/roadmap";
import { PageHeader, MilestoneRow } from "../_dash/parts";
import { Empty } from "@/components/ui/empty";

export default async function RoadmapPage() {
  const user = await requireUser();
  const roadmap = await getRoadmap(user.id);
  const toGo = Math.max(0, roadmap.weeksTotal - roadmap.weeksDone);

  return (
    <div className="act-rise mx-auto max-w-[1200px] space-y-8 px-6 py-8 md:px-10">
      <PageHeader
        kicker="Roadmap"
        title={<>Next moves <span className="text-[var(--act-iris)]">kamu.</span></>}
        meta={`${roadmap.weeksDone} selesai · ${toGo} to go`}
        action={<span className="act-chip act-chip-iris">{roadmap.weeksDone}/{roadmap.weeksTotal}</span>}
      />
      {roadmap.milestones.length === 0 ? (
        <Empty
          title="Belum ada roadmap"
          description="Atur target role di Goal untuk membuat learning path mingguan otomatis."
          actionLabel="Atur goal"
          actionHref="/onboarding"
        />
      ) : (
        <ol className="act-card-2 divide-y divide-[rgba(15,23,42,0.07)] overflow-hidden">
          {roadmap.milestones.map((m) => <MilestoneRow key={m.week} milestone={m} />)}
        </ol>
      )}
    </div>
  );
}
