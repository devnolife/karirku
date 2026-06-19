import {
  getPlatformStats,
  getUserGrowth,
  getRecentIngest,
} from "@/server/queries/admin";
import { ROLE_LABEL } from "@/lib/roles";
import { PageHead, StatusDot } from "../_ui";

export default async function AdminOverviewPage() {
  const [s, growth, ingest] = await Promise.all([
    getPlatformStats(),
    getUserGrowth(),
    getRecentIngest(),
  ]);
  const totalRoles = s.totalRoles || 1;
  const trendMax = Math.max(1, ...growth.map((t) => t.value));

  return (
    <div className="act-rise space-y-10">
      <PageHead
        kicker="Admin · Overview"
        title="Ringkasan platform"
        desc="Metrik utama CraftWorks — data real dari database."
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat label="Total users" value={s.totalUsers.toLocaleString("id-ID")} caption={`+${s.newUsersWeek} minggu ini`} tone="blue" />
        <Stat label="Lowongan aktif" value={s.activeJobs.toLocaleString("id-ID")} caption="ter-index" tone="magenta" />
        <Stat label="Course ter-index" value={s.indexedCourses.toLocaleString("id-ID")} caption="multi-provider" tone="iris" />
        <Stat label="Skill taxonomy" value={s.totalSkills.toLocaleString("id-ID")} caption="skill ter-kurasi" tone="mint" />
        <Stat label="Total lamaran" value={s.totalApplications.toLocaleString("id-ID")} caption="aplikasi tercatat" tone="blue" />
        <Stat label="User baru / minggu" value={s.newUsersWeek.toLocaleString("id-ID")} caption="net growth" tone="iris" />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Growth */}
        <div className="act-card-2 p-6">
          <span className="act-kicker">Pertumbuhan user</span>
          <h3 className="act-heading mt-2 text-xl">3 bulan terakhir</h3>
          <div className="mt-6 flex items-end gap-4">
            {growth.map((t) => (
              <div key={t.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold text-[var(--act-ink)]">
                  {t.value.toLocaleString("id-ID")}
                </span>
                <div className="flex h-[120px] w-full items-end">
                  <div
                    className="w-full rounded-t-lg bg-[linear-gradient(180deg,#38bdf8,var(--act-blue))]"
                    style={{ height: `${(t.value / trendMax) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--act-graphite)]">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Role breakdown */}
        <div className="act-card-2 p-6">
          <span className="act-kicker">Komposisi role</span>
          <h3 className="act-heading mt-2 text-xl">{totalRoles.toLocaleString("id-ID")} akun</h3>
          <div className="mt-6 space-y-4">
            {s.roleBreakdown.map((r) => {
              const pct = Math.round((r.count / totalRoles) * 100);
              return (
                <div key={r.role}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-[var(--act-ink)]">
                      {ROLE_LABEL[r.role]}
                    </span>
                    <span className="text-xs text-[var(--act-graphite)]">
                      {r.count.toLocaleString("id-ID")} · {pct}%
                    </span>
                  </div>
                  <div className="act-track mt-2">
                    <i style={{ width: `${pct}%`, background: "linear-gradient(90deg,#8b78ff,var(--act-iris))" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent pipeline */}
      <section className="act-card-2 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
          <span className="act-kicker">Ingest pipeline per sumber</span>
          <span className="act-chip act-chip-mute">{ingest.length} sumber</span>
        </div>
        <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
          {ingest.map((r) => (
            <li key={r.source} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <span className="text-sm font-semibold text-[var(--act-ink)]">{r.source}</span>
                <span className="ml-2 text-xs text-[var(--act-graphite)]">
                  {r.items} item · {r.lastAt}
                </span>
              </div>
              <StatusDot tone="green" label="indexed" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  caption,
  tone,
}: {
  label: string;
  value: string;
  caption: string;
  tone: "blue" | "iris" | "mint" | "magenta";
}) {
  const valueColor = {
    blue: "text-[var(--act-blue)]",
    iris: "text-[var(--act-iris)]",
    mint: "text-[#059669]",
    magenta: "text-[var(--act-magenta)]",
  }[tone];
  const railClass = {
    blue: "act-rail-blue",
    iris: "act-rail-iris",
    mint: "act-rail-mint",
    magenta: "act-rail-magenta",
  }[tone];
  return (
    <div className={`act-card-2 act-rail ${railClass} p-5`}>
      <span className="act-kicker">{label}</span>
      <div className={`act-display mt-2 text-3xl ${valueColor}`}>{value}</div>
      <p className="mt-1 text-xs text-[var(--act-graphite)]">{caption}</p>
    </div>
  );
}
