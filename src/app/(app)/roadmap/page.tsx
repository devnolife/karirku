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
  const current = roadmap.milestones.find((milestone) => milestone.status === "in_progress");
  const remaining = roadmap.milestones.filter((milestone) => milestone !== current);

  return (
    <div className="act-rise mx-auto max-w-[1040px] space-y-8 px-6 py-10 md:px-10">
      <PageHeader
        kicker="Career studio · journey"
        title={<>Langkah berikutnya <span className="text-[var(--act-blue)]">terarah.</span></>}
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
        <div className="space-y-5">
          {current && (
            <section className="overflow-hidden rounded-[24px] border border-[rgba(25,143,56,0.24)] bg-[var(--act-sky-50)] shadow-[0_18px_36px_-28px_rgba(4,39,24,0.48)]">
              <div className="flex flex-col gap-2 border-b border-[rgba(4,39,24,0.09)] bg-[var(--act-wash-sky)]/65 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="act-kicker !text-[var(--act-blue)]">Fokus saat ini</span>
                  <h2 className="act-heading mt-1 text-lg text-[var(--act-ink)]">Milestone yang sedang kamu bangun</h2>
                </div>
                <span className="act-chip act-chip-blue">Minggu {current.week}</span>
              </div>
              <ol><MilestoneRow milestone={current} /></ol>
            </section>
          )}
          {remaining.length > 0 && (
            <section className="act-card-2 overflow-hidden">
              <div className="flex items-center justify-between border-b border-[rgba(4,39,24,0.08)] px-5 py-4">
                <div>
                  <span className="act-kicker">Jejak perjalanan</span>
                  <h2 className="act-heading mt-1 text-lg text-[var(--act-ink)]">Yang sudah dan akan datang</h2>
                </div>
                <span className="text-xs font-medium text-[var(--act-graphite)]">{toGo} minggu tersisa</span>
              </div>
              <ol className="divide-y divide-[rgba(4,39,24,0.08)]">
                {remaining.map((m) => <MilestoneRow key={m.week} milestone={m} />)}
              </ol>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
