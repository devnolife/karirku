import { requireUser } from "@/lib/auth";
import { getFreelancerMeta, type ProposalItem } from "@/server/queries/freelance";
import { PageHeader } from "../_dash/parts";
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
  const won = proposals.filter((p) => p.status === "won").length;

  return (
    <div className="act-rise mx-auto max-w-[1200px] space-y-8 px-6 py-8 md:px-10">
      <PageHeader
        kicker="Apply"
        title={<>Proposal <span className="text-[var(--act-iris)]">& portofolio.</span></>}
        meta={`${won} won · ${proposals.length} proposal terkirim`}
        action={
          <button className="act-pill group !text-sm">
            Generate proposal AI
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="act-card-2 overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
            <span className="act-kicker">Proposal terkirim</span>
            <span className="act-chip act-chip-mute">{proposals.length}</span>
          </div>
          {proposals.length === 0 ? (
            <div className="p-5"><Empty title="Belum ada proposal" description="Buat proposal dari halaman Projects." /></div>
          ) : (
            <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
              {proposals.map((pr, i) => (
                <li key={i} className="act-rowhover grid grid-cols-12 items-center gap-3 px-5 py-4">
                  <div className="col-span-7 min-w-0">
                    <h4 className="truncate text-sm font-semibold text-[var(--act-ink)]">{pr.project}</h4>
                    <p className="text-xs text-[var(--act-graphite)]">{pr.client} · {pr.amountIdr > 0 ? rel(pr.daysAgo) : "draft"}</p>
                  </div>
                  <div className="col-span-2 text-sm font-semibold text-[var(--act-ink)]">{rupiah(pr.amountIdr)}</div>
                  <div className="col-span-3 text-right"><ProposalChip status={pr.status} /></div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="act-card-2 overflow-hidden lg:col-span-2">
          <div className="border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
            <span className="act-kicker">Portofolio</span>
          </div>
          {portfolio.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[var(--act-graphite)]">Belum ada item portofolio.</p>
          ) : (
            <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
              {portfolio.map((it, i) => (
                <li key={it.title} className="flex items-center gap-3 px-5 py-4">
                  <span className={`act-tile ${["bg-[linear-gradient(140deg,#38bdf8,var(--act-blue))]","bg-[linear-gradient(140deg,#8b78ff,var(--act-iris))]","bg-[linear-gradient(140deg,#ff5cd6,var(--act-magenta))]"][i % 3]}`}>{it.title.charAt(0)}</span>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-[var(--act-ink)]">{it.title}</h4>
                    <p className="text-xs text-[var(--act-graphite)]">{it.category} · {it.tag}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
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

function ProposalChip({ status }: { status: ProposalItem["status"] }) {
  const cfg = {
    won: { cls: "act-chip-green", label: "Won" },
    shortlisted: { cls: "act-chip-iris", label: "Shortlist" },
    sent: { cls: "act-chip-blue", label: "Terkirim" },
    draft: { cls: "act-chip-mute", label: "Draft" },
  }[status];
  return <span className={`act-chip ${cfg.cls}`}>{cfg.label}</span>;
}
