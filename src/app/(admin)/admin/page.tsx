import {
  getPlatformStats,
  getUserGrowth,
  getRecentIngest,
} from "@/server/queries/admin";
import { ROLE_LABEL } from "@/lib/roles";
import { PageHead, StatusDot } from "../_ui";
import {
  getRecommendationDataHealth,
  getRecommendationShadowMetrics,
} from "@/server/queries/recommendation-metrics";

export default async function AdminOverviewPage() {
  const [s, growth, ingest, recommendation, dataHealth] = await Promise.all([
    getPlatformStats(),
    getUserGrowth(),
    getRecentIngest(),
    getRecommendationShadowMetrics(),
    getRecommendationDataHealth(),
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
                    className="w-full rounded-t-lg bg-[linear-gradient(180deg,#22C55E,var(--act-blue))]"
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
                    <i style={{ width: `${pct}%`, background: "linear-gradient(90deg,#14B8A6,var(--act-iris))" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="act-card-2 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="act-kicker">Recommendation data health</span>
            <h3 className="act-heading mt-2 text-xl">
              Coverage sumber dan enrichment
            </h3>
          </div>
          <StatusDot
            tone={dataHealth.staleSources === 0 ? "green" : "amber"}
            label={
              dataHealth.staleSources === 0
                ? "sources fresh"
                : `${dataHealth.staleSources} source stale`
            }
          />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            label="Fresh jobs"
            value={`${pct(dataHealth.freshJobs, dataHealth.activeJobs)}%`}
            caption={`${dataHealth.freshJobs}/${dataHealth.activeJobs} terlihat ≤14 hari`}
            tone="blue"
          />
          <Stat
            label="Quality measured"
            value={`${pct(dataHealth.qualityMeasuredJobs, dataHealth.activeJobs)}%`}
            caption="punya data quality score"
            tone="mint"
          />
          <Stat
            label="Embedding coverage"
            value={`${pct(dataHealth.embeddedJobs, dataHealth.activeJobs)}%`}
            caption={`${dataHealth.embeddedJobs} job ber-vector`}
            tone="iris"
          />
          <Stat
            label="Market snapshot"
            value={dataHealth.latestMarketSnapshot ?? "—"}
            caption="snapshot terbaru"
            tone="magenta"
          />
        </div>
      </section>

      <section className="act-card-2 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="act-kicker">Recommendation V2 · shadow</span>
            <h3 className="act-heading mt-2 text-xl">
              V1 tetap tampil sampai sample memadai
            </h3>
          </div>
          <StatusDot
            tone={recommendation.promotionReady ? "green" : "amber"}
            label={
              recommendation.promotionReady
                ? "V2 lolos gate"
                : recommendation.shadowGatePassed
                  ? "butuh cohort terbatas"
                  : recommendation.sampleSufficient
                    ? "V2 belum unggul"
                  : "mengumpulkan data"
            }
          />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            label="Impressions"
            value={recommendation.impressions.toLocaleString("id-ID")}
            caption={`${recommendation.labeled} berlabel`}
            tone="blue"
          />
          <Stat
            label="Precision@10 V1"
            value={formatRate(recommendation.precisionAt10V1)}
            caption="ranking aktif"
            tone="iris"
          />
          <Stat
            label="Precision@10 V2"
            value={formatRate(recommendation.precisionAt10V2)}
            caption="shadow ranking"
            tone="magenta"
          />
          <Stat
            label="Confidence V2"
            value={`${Math.round(recommendation.averageConfidenceV2 * 100)}%`}
            caption={`${recommendation.days} hari`}
            tone="mint"
          />
        </div>
        <p className="mt-4 text-xs text-[var(--act-graphite)]">
          Irrelevant rate V1 {formatRate(recommendation.irrelevantRateV1)} · V2{" "}
          {formatRate(recommendation.irrelevantRateV2)} · open@10 V1{" "}
          {formatRate(recommendation.openRateAt10V1)} · V2{" "}
          {formatRate(recommendation.openRateAt10V2)} · apply rate{" "}
          {formatRate(recommendation.applyRate)} · interview rate{" "}
          {formatRate(recommendation.interviewRate)} · interview@10 V1{" "}
          {formatRate(recommendation.interviewRateAt10V1)} · V2{" "}
          {formatRate(recommendation.interviewRateAt10V2)}. Gate minimum: 100 label dan
          30 outcome positif. Shadow metrics hanya memakai kandidat yang benar-benar
          tampil; aktivasi penuh tetap memerlukan minimal 50 exposure V2 terkontrol
          (saat ini {recommendation.causalV2Exposures}).
        </p>
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

function formatRate(value: number | null): string {
  return value === null ? "—" : `${Math.round(value * 100)}%`;
}

function pct(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
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
    mint: "text-[var(--act-teal)]",
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
