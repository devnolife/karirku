import { requireUser } from "@/lib/auth";
import { getRoadmap } from "@/server/queries/roadmap";
import { hasAnyPath } from "@/server/services/learning-path";
import { getActiveGoal } from "@/server/queries/goal";
import { roadmapShUrl } from "@/core/content/roadmap-reference";
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
  const referenceUrl = goal ? roadmapShUrl(goal.targetRole) : null;

  return (
    <div className="act-rise app-page space-y-8">
      <PageHeader
        kicker="Roadmap"
        title={<>Next moves <span className="text-[var(--act-iris)]">kamu.</span></>}
        meta={goal ? `Target: ${goal.targetRole} · ${roadmap.weeksDone}/${roadmap.weeksTotal} selesai` : `${roadmap.weeksDone} selesai · ${toGo} tersisa`}
        action={<RegenerateRoadmapButton hasPath={hasPath} />}
      />
      {referenceUrl && (
        <p className="-mt-4 text-xs text-[var(--act-graphite)]">
          Referensi komunitas:{" "}
          <a
            href={referenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline decoration-dotted underline-offset-2 hover:text-[var(--act-iris)]"
          >
            roadmap resmi {goal!.targetRole} di roadmap.sh ↗
          </a>{" "}
          lalu bandingkan dengan roadmap personal kamu di bawah.
        </p>
      )}
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
        <div className="act-bezel">
          <ol className="act-bezel-core divide-y divide-[rgba(15,23,42,0.07)] overflow-hidden">
            {roadmap.milestones.map((m) => <MilestoneRow key={m.id} milestone={m} />)}
          </ol>
        </div>
      )}
    </div>
  );
}
