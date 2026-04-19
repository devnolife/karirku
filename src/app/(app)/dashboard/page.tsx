import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [goal, activePath, skillCount] = await Promise.all([
    prisma.careerGoal.findFirst({
      where: { userId, status: "active" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.learningPath.findFirst({
      where: { userId, status: "active" },
      include: { milestones: { orderBy: { weekNumber: "asc" } } },
    }),
    prisma.userSkill.count({ where: { userId } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold">Halo, {session!.user!.name?.split(" ")[0] ?? "kamu"} 👋</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Dashboard ini masih kerangka. Fitur guidance loop aktif di Sprint 3-4.
      </p>

      {!goal ? (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50 p-8 text-center dark:border-indigo-900 dark:bg-indigo-950/30">
          <h2 className="text-xl font-semibold">Belum ada goal karir</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Yuk mulai — AI butuh tahu kamu mau kemana.
          </p>
          <Link
            href="/onboarding"
            className="mt-4 inline-flex h-10 items-center rounded-full bg-indigo-600 px-6 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Set goal
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Card title="Goal aktif">
            <div className="font-semibold">{goal.targetRole}</div>
            <div className="mt-1 text-xs text-zinc-500">
              {goal.targetTrack} · {goal.targetCity ?? "—"}
            </div>
          </Card>
          <Card title="Progress path">
            {activePath ? (
              <>
                <div className="font-semibold">{Math.round(activePath.progressPct)}%</div>
                <div className="mt-1 text-xs text-zinc-500">
                  Readiness: {activePath.readinessScore}/100
                </div>
              </>
            ) : (
              <div className="text-sm text-zinc-500">
                Path akan di-generate AI (Sprint 3-4)
              </div>
            )}
          </Card>
          <Card title="Skill kamu">
            <div className="font-semibold">{skillCount}</div>
            <div className="mt-1 text-xs text-zinc-500">terdaftar</div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-xs uppercase tracking-wider text-zinc-500">{title}</div>
      <div className="mt-3 text-2xl">{children}</div>
    </div>
  );
}
