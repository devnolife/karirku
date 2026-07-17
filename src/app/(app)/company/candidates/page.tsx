import { requireUser } from "@/lib/auth";
import { getCompanyCandidates, CANDIDATE_STAGES } from "@/server/queries/company";
import { StageControl } from "@/components/StageControl";
import { Empty } from "@/components/ui/empty";

const STAGE_CHIP: Record<string, string> = {
  applied: "bg-blue-600/10 text-blue-700",
  screening: "bg-violet-600/10 text-violet-700",
  interview: "bg-amber-500/10 text-amber-700",
  offer: "bg-brand-100 text-brand-700",
  rejected: "bg-rose-600/10 text-rose-700",
};

export default async function CompanyCandidatesPage() {
  const user = await requireUser();
  const candidates = await getCompanyCandidates(user.id);
  const readyToReview = candidates.filter((candidate) => candidate.stage === "applied").length;

  return (
    <div className="act-rise mx-auto max-w-[1280px] space-y-7 px-5 py-8 sm:px-8 sm:py-12">
      <div className="flex flex-col gap-5 border-b border-[rgba(4,39,24,0.08)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">ATS workspace / Review queue</span>
          <h1 className="act-display mt-3 text-4xl text-brand-950 md:text-5xl">Tinjau sinyal, lalu gerakkan proses.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#476655]">Skor kecocokan dan kesiapan membuat prioritas review lebih jelas sebelum Anda memilih stage berikutnya.</p>
        </div>
        <div className="rounded-[18px] border border-[rgba(4,39,24,0.08)] bg-brand-50 px-4 py-3 text-right"><p className="text-xs font-semibold text-[#6E8D7B]">Perlu direview</p><p className="act-display mt-0.5 text-2xl text-brand-950">{readyToReview}</p></div>
      </div>

      <section className="rounded-[22px] border border-[rgba(4,39,24,0.08)] bg-white p-3 shadow-[0_14px_35px_-30px_rgba(4,39,24,0.5)]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="shrink-0 px-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6E8D7B]">Stage</span>
          {CANDIDATE_STAGES.map((stage) => {
            const count = candidates.filter((candidate) => candidate.stage === stage.key).length;
            return <span key={stage.key} className={`inline-flex shrink-0 items-center gap-2 rounded-[14px] px-3 py-2 text-sm font-semibold ${STAGE_CHIP[stage.key] ?? "bg-brand-50 text-brand-950/70"}`}><span>{stage.label}</span><span className="rounded-full bg-white px-1.5 py-0.5 text-xs">{count}</span></span>;
          })}
          <span className="ml-auto shrink-0 rounded-[14px] bg-[var(--act-wash-lilac)] px-3 py-2 text-xs font-semibold text-[#315644]">{candidates.length} total kandidat</span>
        </div>
      </section>

      {candidates.length === 0 ? (
        <Empty title="Belum ada kandidat" description="Kandidat muncul di sini setelah ada yang melamar lowonganmu." />
      ) : (
        <section className="overflow-hidden rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-white shadow-[0_18px_45px_-36px_rgba(4,39,24,0.5)]">
          <div className="flex items-center justify-between border-b border-[rgba(4,39,24,0.08)] bg-brand-50 px-6 py-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">Candidate queue</p><p className="mt-1 text-sm text-[#476655]">Diurutkan menurut kecocokan skill.</p></div><span className="hidden text-xs font-semibold text-[#476655] sm:block">Ubah stage langsung dari setiap kandidat</span></div>
          <ul className="divide-y divide-[rgba(4,39,24,0.08)]">
            {candidates.map((candidate) => {
              const stageLabel = CANDIDATE_STAGES.find((stage) => stage.key === candidate.stage)?.label ?? candidate.stage;
              const matchTone = candidate.matchPct >= 70 ? "bg-brand-100 text-brand-700" : candidate.matchPct >= 40 ? "bg-amber-500/15 text-amber-700" : "bg-rose-600/10 text-rose-700";
              const readiness = candidate.matchPct >= 75 ? "Siap ditinjau" : "Butuh telaah";
              return (
                <li key={candidate.id} className="grid gap-5 px-5 py-5 transition-colors hover:bg-[#F9FCF9] lg:grid-cols-[minmax(0,1.3fr)_0.8fr_1fr_auto] lg:items-center lg:px-6">
                  <div className="flex min-w-0 items-center gap-3"><span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-brand-950 text-xs font-bold text-white">{candidate.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span><div className="min-w-0"><p className="truncate text-[15px] font-semibold text-brand-950">{candidate.name}</p><p className="mt-1 truncate text-xs text-[#6E8D7B]">{candidate.appliedFor} <span aria-hidden>·</span> {candidate.applied}</p></div></div>
                  <div className="flex items-center gap-3"><span className={`act-display inline-flex h-12 w-12 items-center justify-center rounded-[16px] text-base ${matchTone}`}>{candidate.matchPct}%</span><div><p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6E8D7B]">Match</p><p className="mt-1 text-xs font-semibold text-[#315644]">{readiness}</p></div></div>
                  <div><div className="flex flex-wrap gap-1.5">{candidate.skills.length > 0 ? candidate.skills.map((skill) => <span key={skill} className="rounded-full border border-[rgba(25,143,56,0.14)] bg-brand-50 px-2 py-1 text-[11px] font-semibold text-brand-700">{skill}</span>) : <span className="text-xs text-[#6E8D7B]">Belum ada skill</span>}</div><span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${STAGE_CHIP[candidate.stage] ?? "bg-[var(--act-wash-petal)] text-brand-950/70"}`}>{stageLabel}</span></div>
                  <div className="flex items-center justify-between gap-3 lg:block lg:text-right"><span className="text-xs font-semibold text-[#6E8D7B] lg:hidden">Perbarui stage</span><StageControl applicationId={candidate.id} current={candidate.rawStatus} /></div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
