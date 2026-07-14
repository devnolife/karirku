import { requireUser } from "@/lib/auth";
import { getFreelancerMeta, type ProposalItem } from "@/server/queries/freelance";
import { GuideTeaser } from "../_GuideTeaser";
import { Empty } from "@/components/ui/empty";

function rupiah(n: number): string {
  if (n <= 0) return "—";
  const jt = n / 1_000_000;
  return `Rp ${Number.isInteger(jt) ? jt : jt.toFixed(1)} jt`;
}

function rel(daysAgo: number): string {
  if (daysAgo <= 0) return "hari ini";
  if (daysAgo === 1) return "kemarin";
  if (daysAgo < 7) return `${daysAgo} hari lalu`;
  return `${Math.round(daysAgo / 7)} minggu lalu`;
}

export default async function ProposalsPage() {
  const user = await requireUser();
  const meta = await getFreelancerMeta(user.id);
  const proposals = meta.proposals;
  const portfolio = meta.portfolio;
  const won = proposals.filter((proposal) => proposal.status === "won").length;
  const active = proposals.filter((proposal) => proposal.status === "sent" || proposal.status === "shortlisted").length;
  const drafts = proposals.filter((proposal) => proposal.status === "draft").length;

  return (
    <div className="act-rise mx-auto max-w-[1280px] space-y-7 px-5 py-8 sm:px-8 md:py-10">
      <section className="rounded-[24px] border border-[#042718]/[0.08] bg-[#F2FBF6] p-5 sm:p-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#198F38]">Freelancer workspace</span>
            <h1 className="act-display mt-3 text-4xl leading-[0.98] tracking-[-0.04em] text-[#042718] sm:text-5xl">Proposal studio.</h1>
            <p className="mt-4 text-sm leading-6 text-[#042718]/70">Kelola setiap proposal dan bangun portofolio yang membuat klien yakin.</p>
          </div>
          <button className="group inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-[#042718] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#198F38]">
            Generate proposal AI
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="mt-7 grid grid-cols-3 overflow-hidden rounded-2xl border border-[#042718]/[0.08] bg-white">
          <OutcomeMetric label="Dalam proses" value={active} tone="bg-[#D2DDEA]/55" />
          <OutcomeMetric label="Menang" value={won} tone="bg-[#D4E5CD]" />
          <OutcomeMetric label="Draft siap" value={drafts} tone="bg-[#EBE3D2]" />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-[24px] border border-[#042718]/[0.08] bg-white">
          <div className="flex items-center justify-between border-b border-[#042718]/[0.08] px-5 py-4 sm:px-6">
            <div>
              <h2 className="act-heading text-xl text-[#042718]">Dokumen proposal</h2>
              <p className="mt-0.5 text-xs text-[#042718]/60">{proposals.length} proposal tersimpan</p>
            </div>
            <span className="rounded-full bg-[#F2FBF6] px-3 py-1 text-xs font-bold text-[#198F38]">{won} won</span>
          </div>
          {proposals.length === 0 ? (
            <div className="p-5"><Empty title="Belum ada proposal" description="Buat proposal dari halaman Projects." /></div>
          ) : (
            <ul className="divide-y divide-[#042718]/[0.08]">
              {proposals.map((proposal, index) => (
                <li key={index} className="group px-5 py-5 transition-colors hover:bg-[#F2FBF6]/70 sm:px-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EBE3D2] text-[11px] font-bold text-[#042718]">PR</span>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-[#042718]">{proposal.project}</h3>
                        <p className="mt-1 text-sm text-[#042718]/65">{proposal.client} <span className="mx-1 text-[#042718]/35">/</span> {proposal.amountIdr > 0 ? rel(proposal.daysAgo) : "Belum dikirim"}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                      <p className="text-sm font-semibold text-[#042718]">{rupiah(proposal.amountIdr)}</p>
                      <ProposalChip status={proposal.status} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="overflow-hidden rounded-[24px] border border-[#042718]/[0.08] bg-white">
          <div className="border-b border-[#042718]/[0.08] px-5 py-4">
            <h2 className="act-heading text-xl text-[#042718]">Portofolio</h2>
            <p className="mt-0.5 text-xs text-[#042718]/60">Bukti kerja untuk setiap pitch.</p>
          </div>
          {portfolio.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[#042718]/65">Belum ada item portofolio.</p>
          ) : (
            <ul className="divide-y divide-[#042718]/[0.08]">
              {portfolio.map((item, index) => (
                <li key={item.title} className="flex items-center gap-3 px-5 py-4">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-[#042718] ${index % 2 === 0 ? "bg-[#D4E5CD]" : "bg-[#D2DDEA]"}`}>{item.title.charAt(0)}</span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-[#042718]">{item.title}</h3>
                    <p className="mt-0.5 text-xs text-[#042718]/60">{item.category} · {item.tag}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      <GuideTeaser
        showInterview={false}
        items={[
          { href: "/guides/daftar-upwork", title: "Daftar & menang di Upwork", desc: "Profil & proposal yang dilirik klien global." },
          { href: "/guides/proposal-rate-freelance", title: "Proposal & rate", desc: "Nulis proposal yang dibalas + hitung rate." },
        ]}
      />
    </div>
  );
}

function OutcomeMetric({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={`min-w-0 px-3 py-4 text-center sm:px-5 ${tone}`}>
      <p className="act-display text-2xl leading-none text-[#042718] sm:text-3xl">{value}</p>
      <p className="mt-1.5 truncate text-[10px] font-bold uppercase tracking-[0.1em] text-[#042718]/60">{label}</p>
    </div>
  );
}

function ProposalChip({ status }: { status: ProposalItem["status"] }) {
  const config = {
    won: { className: "border-[#198F38]/20 bg-[#D4E5CD] text-[#0B5D25]", label: "Won" },
    shortlisted: { className: "border-[#0F766E]/20 bg-[#D2DDEA] text-[#0F5B67]", label: "Shortlist" },
    sent: { className: "border-[#D97706]/20 bg-[#FFF3D8] text-[#A85A00]", label: "Terkirim" },
    draft: { className: "border-[#042718]/10 bg-[#F7F5F0] text-[#042718]/65", label: "Draft" },
  }[status];

  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${config.className}`}>{config.label}</span>;
}
