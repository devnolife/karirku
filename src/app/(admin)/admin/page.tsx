import {
  MOCK_PLATFORM_STATS,
  MOCK_PLATFORM_TREND,
  MOCK_ROLE_BREAKDOWN,
  MOCK_SCRAPER_RUNS,
  ROLE_LABEL,
} from "@/lib/mock/data";
import { PageHead, StatusDot } from "../_ui";
import { StatCard, DonutProgress, HatchedBars, type BarDatum } from "../../(app)/_dash/parts";

export default function AdminOverviewPage() {
  const s = MOCK_PLATFORM_STATS;
  const totalRoles = MOCK_ROLE_BREAKDOWN.reduce((a, r) => a + r.count, 0);
  const trendMax = Math.max(...MOCK_PLATFORM_TREND.map((t) => t.value));

  const growthBars: BarDatum[] = MOCK_PLATFORM_TREND.map((t, i) => ({
    label: t.label,
    value: t.value,
    active: i === MOCK_PLATFORM_TREND.length - 1,
  }));

  const topRole = [...MOCK_ROLE_BREAKDOWN].sort((a, b) => b.count - a.count)[0];
  const topRolePct = Math.round((topRole.count / totalRoles) * 100);
  const roleColors = ["var(--act-sky-deep)", "var(--act-sky-bright)", "var(--act-iris)", "rgba(15,23,42,0.14)"];

  return (
    <div className="act-rise space-y-6">
      <PageHead
        kicker="Admin · Overview"
        title="Ringkasan platform"
        desc="Metrik utama CraftWorks — data ilustratif (mode demo)."
      />

      {/* Stat row */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total users"
          value={s.totalUsers.toLocaleString("id-ID")}
          delta={`+${s.newUsersWeek} minggu ini`}
          featured
        />
        <StatCard
          label="Lowongan aktif"
          value={s.activeJobs.toLocaleString("id-ID")}
          delta="ter-index"
          href="/admin/jobs"
        />
        <StatCard
          label="Course ter-index"
          value={s.indexedCourses.toLocaleString("id-ID")}
          delta="multi-provider"
          href="/admin/courses"
        />
        <StatCard
          label="MRR"
          value={`Rp ${(s.mrrIdr / 1_000_000).toFixed(1)}jt`}
          delta={`${s.proSubscribers.toLocaleString("id-ID")} subscriber Pro`}
        />
      </section>

      {/* Bento: growth bars + role donut */}
      <section className="grid grid-cols-12 gap-4">
        <div className="act-card-2 col-span-12 p-6 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <span className="act-kicker">Pertumbuhan user</span>
              <h3 className="act-heading mt-1 text-xl">3 bulan terakhir</h3>
            </div>
            <span className="act-chip act-chip-blue">{(trendMax / 1000).toFixed(1)}k puncak</span>
          </div>
          <div className="mt-6">
            <HatchedBars data={growthBars} />
          </div>
        </div>

        <div className="act-card-2 col-span-12 p-6 lg:col-span-5">
          <span className="act-kicker">Komposisi role</span>
          <div className="mt-4">
            <DonutProgress
              primaryPct={topRolePct}
              primaryLabel={ROLE_LABEL[topRole.role]}
              segments={MOCK_ROLE_BREAKDOWN.map((r, i) => ({
                label: `${ROLE_LABEL[r.role]} (${r.count.toLocaleString("id-ID")})`,
                color: roleColors[i % roleColors.length],
              }))}
            />
          </div>
        </div>
      </section>

      {/* Recent pipeline */}
      <section className="act-card-2 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
          <span className="act-kicker">Aktivitas pipeline terbaru</span>
          <span className="act-chip act-chip-mute">{MOCK_SCRAPER_RUNS.length} run</span>
        </div>
        <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
          {MOCK_SCRAPER_RUNS.slice(0, 4).map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <span className="text-sm font-semibold text-[var(--act-ink)]">{r.source}</span>
                <span className="ml-2 text-xs text-[var(--act-graphite)]">
                  {r.type} · {r.items} item · {r.finishedAt}
                </span>
              </div>
              <StatusDot
                tone={r.status === "success" ? "green" : r.status === "running" ? "blue" : "magenta"}
                label={r.status}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
