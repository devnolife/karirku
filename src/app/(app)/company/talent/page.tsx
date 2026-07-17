import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCompanyJobOptions, searchTalentForJob, type TalentMatch } from "@/server/queries/company";
import { Empty } from "@/components/ui/empty";

const BAND_LABEL: Record<string, string> = { ready: "Ready", getting_there: "Getting there", not_ready: "Belum siap" };

export default async function TalentSearchPage({ searchParams }: { searchParams: Promise<{ job?: string }> }) {
  const user = await requireUser();
  const { job: selectedJobId } = await searchParams;
  const jobs = await getCompanyJobOptions(user.id);
  const activeJobId = selectedJobId ?? jobs[0]?.id ?? null;
  const activeJob = jobs.find((job) => job.id === activeJobId) ?? null;
  let talents: TalentMatch[] | null = null;
  if (activeJobId) talents = await searchTalentForJob(user.id, activeJobId, 20);

  return (
    <div className="act-rise mx-auto max-w-[1280px] space-y-7 px-5 py-8 sm:px-8 sm:py-12">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
        <div><span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">Talent marketplace / Discovery</span><h1 className="act-display mt-3 text-4xl text-brand-950 md:text-5xl">Temukan talent yang sudah memberi sinyal siap.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#476655]">Mulai dari lowongan Anda, lalu lihat skill yang terverifikasi dan indikator readiness secara berdampingan.</p></div>
        <div className="rounded-[20px] border border-[rgba(4,39,24,0.08)] bg-[var(--act-wash-sky)] p-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#315644]">Discovery signal</p><p className="act-heading mt-2 text-lg text-brand-950">Match, verifikasi, dan readiness dalam satu urutan.</p></div>
      </div>

      {jobs.length === 0 ? <Empty title="Belum ada lowongan" description="Posting lowongan dulu untuk mulai mencari talent yang cocok." actionLabel="Posting lowongan" actionHref="/company/jobs/new" /> : (
        <>
          <section className="rounded-[22px] border border-[rgba(4,39,24,0.08)] bg-white p-4 shadow-[0_14px_35px_-30px_rgba(4,39,24,0.5)]"><div className="flex flex-col gap-3"><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6E8D7B]">Cari berdasarkan lowongan</p><span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-[#315644]">{jobs.length} lowongan</span></div><div className="flex gap-2 overflow-x-auto pb-1">{jobs.map((job) => <Link key={job.id} href={`/company/talent?job=${job.id}`} className={job.id === activeJobId ? "shrink-0 rounded-full bg-brand-950 px-4 py-2.5 text-sm font-semibold text-white" : "shrink-0 rounded-full border border-[rgba(4,39,24,0.1)] bg-[#F9FCF9] px-4 py-2.5 text-sm font-semibold text-[#476655] transition-colors hover:border-brand-600 hover:text-brand-950"}>{job.title}</Link>)}</div></div></section>
          {!talents || talents.length === 0 ? <Empty title="Belum ada talent cocok" description={`Belum ada kandidat dengan skill yang relevan untuk ${activeJob?.title ?? "lowongan ini"}.`} /> : (
            <section><div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">Recommended for</p><h2 className="act-heading mt-1 text-2xl text-brand-950">{activeJob?.title}</h2></div><p className="text-sm text-[#476655]">{talents.length} talent sesuai ditemukan</p></div><ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{talents.map((talent) => {
              const band = BAND_LABEL[talent.readinessBand] ?? "Readiness";
              const verified = talent.totalSkills > 0 ? Math.round((talent.verifiedCount / talent.totalSkills) * 100) : 0;
              const matchTone = talent.matchPct >= 70 ? "bg-brand-100 text-brand-700" : talent.matchPct >= 40 ? "bg-amber-500/15 text-amber-700" : "bg-rose-600/10 text-rose-700";
              return <li key={talent.userId} className="flex min-h-[270px] flex-col rounded-[24px] border border-[rgba(4,39,24,0.08)] bg-white p-5 shadow-[0_16px_38px_-34px_rgba(4,39,24,0.52)] transition-transform hover:-translate-y-0.5"><div className="flex items-start justify-between gap-3"><span className="inline-flex h-11 w-11 items-center justify-center rounded-[15px] bg-brand-950 text-xs font-bold text-white">{talent.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span><span className={`rounded-[14px] px-2.5 py-2 text-sm font-bold ${matchTone}`}>{talent.matchPct}% match</span></div><div className="mt-4"><p className="text-[15px] font-semibold text-brand-950">{talent.name}</p><p className="mt-1 min-h-10 text-xs leading-5 text-[#6E8D7B]">{talent.headline}</p></div><div className="mt-4 flex flex-wrap gap-1.5">{talent.matchedSkills.length > 0 ? talent.matchedSkills.map((skill) => <span key={skill} className="rounded-full border border-[rgba(25,143,56,0.16)] bg-brand-50 px-2 py-1 text-[11px] font-bold text-brand-700">{skill}</span>) : <span className="text-xs text-[#6E8D7B]">Tidak ada skill yang sama</span>}</div><div className="mt-auto grid grid-cols-2 gap-3 border-t border-[rgba(4,39,24,0.08)] pt-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.11em] text-[#6E8D7B]">Verified skill</p><p className="mt-1 text-sm font-bold text-teal-700">{talent.verifiedCount}/{talent.totalSkills} <span className="font-medium text-[#476655]">({verified}%)</span></p></div><div><p className="text-[10px] font-bold uppercase tracking-[0.11em] text-[#6E8D7B]">Readiness</p><p className="mt-1 text-sm font-bold text-brand-600">{talent.readinessScore}% <span className="font-medium text-[#476655]">{band}</span></p></div></div></li>;
            })}</ul></section>
          )}
        </>
      )}
    </div>
  );
}
