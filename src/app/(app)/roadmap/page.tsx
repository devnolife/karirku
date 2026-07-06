import { requireUser } from "@/lib/auth";
import { getRoadmap } from "@/server/queries/roadmap";
import { hasAnyPath } from "@/server/services/learning-path";
import { getActiveGoal } from "@/server/queries/goal";
import { PageHeader, MilestoneRow } from "../_dash/parts";
import { Empty } from "@/components/ui/empty";
import { RegenerateRoadmapButton } from "@/components/RegenerateRoadmapButton";

export default async function RoadmapPage() {
  const user = await requireUser();
  const [roadmap, hasPath, goal] = await Promise.all([
    getRoadmap(user.id),
    hasAnyPath(user.id),
    getActiveGoal(user.id),
  ]);
  const toGo = Math.max(0, roadmap.weeksTotal - roadmap.weeksDone);

  return (
    <div className="act-rise mx-auto max-w-[1200px] space-y-8 px-6 py-8 md:px-10">
      <PageHeader
        kicker="Roadmap"
        title={<>Next moves <span className="text-[var(--act-iris)]">kamu.</span></>}
        meta={goal ? `Target: ${goal.targetRole} · ${roadmap.weeksDone}/${roadmap.weeksTotal} selesai` : `${roadmap.weeksDone} selesai · ${toGo} to go`}
        action={<RegenerateRoadmapButton hasPath={hasPath} />}
      />
      {roadmap.milestones.length === 0 ? (
        goal ? (
          <Empty
            title="Belum ada roadmap"
            description={"Klik \u201cGenerate roadmap (AI)\u201d di atas untuk menyusun learning path mingguan personal berdasarkan skill-gap kamu."}
          />
        ) : (
          <Empty
            title="Belum ada roadmap"
            description="Atur target role di Goal dulu, lalu generate roadmap belajar otomatis."
            actionLabel="Atur goal"
            actionHref="/onboarding"
          />
        )
      ) : (
        <ol className="act-card-2 divide-y divide-[rgba(15,23,42,0.07)] overflow-hidden">
          {roadmap.milestones.map((m) => <MilestoneRow key={m.week} milestone={m} />)}
        </ol>
      )}
    </div>
  );
}
