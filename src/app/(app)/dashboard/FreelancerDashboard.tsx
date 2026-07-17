import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getActiveGoal } from "@/server/queries/goal";
import { getFreelancerMeta, getFreelanceProjects } from "@/server/queries/freelance";
import { Kpi } from "../_dash/parts";

export async function FreelancerOverview() {
  const user = await requireUser();
  const [goal, meta, projects] = await Promise.all([
    getActiveGoal(user.id),
    getFreelancerMeta(user.id),
    getFreelanceProjects(user.id, 5),
  ]);
  const firstName = user.name.split(" ")[0];
  const f = meta.stats;
  const won = meta.proposals.filter((p) => p.status === "won").length;
  const topProject = projects[0] ?? null;

  return (
    <div className="act-rise mx-auto max-w-[1200px] space-y-7 px-6 py-8 md:px-10">
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-7">
        <div className="flex flex-col justify-center lg:col-span-7 lg:py-4">
          <span className="act-eyebrow">FREELANCE STUDIO</span>
          <h1 className="act-display mt-4 text-5xl text-brand-950 sm:text-6xl md:text-7xl">
            Halo, <span className="act-script font-semibold">{firstName}.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--act-charcoal)]">
            {goal?.targetRole ? `${goal.targetRole} · ` : ""}Rp {(f.hourlyRateIdr / 1000).toFixed(0)}k/jam · Rating {f.rating} dari {f.reviews} ulasan
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/projects" className="act-pill group !bg-brand-950 !px-5">
              Lihat project
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/proposals" className="act-pill-ghost border border-brand-950/15 !px-5 text-brand-950">
              Buka proposal
            </Link>
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-[24px] border border-brand-950/10 bg-[var(--act-wash-lilac)] p-6 shadow-[0_16px_40px_-26px_rgba(4,39,24,0.55)] lg:col-span-5 sm:p-7">
          <svg viewBox="0 0 180 180" className="absolute -right-8 -top-8 h-44 w-44 text-brand-950/10" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
            <circle cx="90" cy="90" r="72" />
            <circle cx="90" cy="90" r="52" />
            <path d="M18 90h144M90 18v144" />
          </svg>
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="act-kicker !text-brand-950/60">Kesiapan profil</span>
                <p className="mt-3 text-sm leading-relaxed text-brand-950/75">Studio kamu siap menerima peluang yang tepat.</p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brand-950/15 bg-white/55 text-brand-950">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 3v18M3 12h18" />
                  <circle cx="12" cy="12" r="8" />
                </svg>
              </span>
            </div>
            <div className="mt-8 flex items-end gap-2">
              <span className="act-display text-7xl text-brand-950">{f.readiness}</span>
              <span className="mb-2 text-xl font-semibold text-brand-950/60">%</span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-brand-950/12 pt-5">
              <MiniStat label="Project selesai" value={`${f.completedProjects}`} />
              <MiniStat label="Response rate" value={`${f.responseRate}%`} />
            </div>
          </div>
        </aside>
      </section>

      <section aria-labelledby="peluang-heading">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <span className="act-eyebrow">PILIHAN UNTUKMU</span>
            <h2 id="peluang-heading" className="act-display mt-1 text-2xl text-brand-950 md:text-3xl">Peluang terbaikmu</h2>
          </div>
          <span className="hidden text-sm text-[var(--act-graphite)] sm:block">Fokus pada langkah berikutnya.</span>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="relative overflow-hidden rounded-[24px] bg-[radial-gradient(380px_220px_at_92%_-6%,rgba(124,58,237,0.3),transparent_62%),radial-gradient(320px_200px_at_0%_105%,rgba(34,197,94,0.2),transparent_60%)] bg-brand-950 p-6 text-white shadow-[0_20px_42px_-24px_rgba(4,39,24,0.9)] sm:p-7 lg:col-span-3">
            <svg viewBox="0 0 260 190" className="absolute -right-12 -bottom-20 h-64 w-80 text-brand-600/45" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
              <path d="M15 155C55 58 106 27 154 72c34 31 49 80 92-35" />
              <path d="M12 176C63 76 108 72 151 112c33 31 57 33 98-70" />
              <circle cx="154" cy="72" r="5" fill="currentColor" />
            </svg>
            <div className="relative flex h-full flex-col">
              <span className="act-kicker !text-white/60">PROJECT MATCH</span>
              {topProject ? (
                <>
                  <div className="mt-7 flex items-end justify-between gap-5">
                    <div className="min-w-0">
                      <h3 className="act-display text-2xl leading-tight text-white sm:text-3xl">{topProject.title}</h3>
                      <p className="mt-2 truncate text-sm text-white/70">{topProject.client} · {topProject.budget}</p>
                    </div>
                    <div className="act-display shrink-0 text-5xl text-[#B7F3C5]">{topProject.matchPct}<span className="text-2xl">%</span></div>
                  </div>
                </>
              ) : (
                <div className="mt-7">
                  <h3 className="act-display text-2xl text-white">Project yang pas sedang dicari.</h3>
                  <p className="mt-2 text-sm text-white/70">Cek peluang terbaru untuk menemukan kecocokan terbaik.</p>
                </div>
              )}
              <Link href="/projects" className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-brand-950 transition-colors hover:bg-brand-50">
                Jelajahi project
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="flex flex-col rounded-[24px] border border-brand-950/10 bg-brand-50 p-6 sm:p-7 lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <span className="act-kicker !text-brand-600">PROPOSAL PIPELINE</span>
              <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">Aktif</span>
            </div>
            <div className="mt-7 flex items-end gap-3">
              <span className="act-display text-6xl text-brand-950">{won}</span>
              <span className="mb-2 text-sm text-brand-950/65">proposal menang</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-brand-950/70">Dari {meta.proposals.length} proposal terkirim, terus rapikan pitch terbaikmu.</p>
            <Link href="/proposals" className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-semibold text-brand-600 hover:text-brand-950">
              Kelola proposal
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi label="Total earnings" value={`Rp ${(f.earningsIdr / 1_000_000).toFixed(1)} jt`} caption="sepanjang perjalanan" tone="mint" />
        <Kpi label="Proposal won" value={won} caption={`dari ${meta.proposals.length} proposal terkirim`} tone="blue" />
        <Kpi label="Rating" value={f.rating} caption={`${f.reviews} ulasan dari klien`} tone="magenta" />
      </section>
    </div>
  );
}

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="act-display text-2xl text-brand-950">{value}</div>
      <div className="mt-0.5 text-[11px] font-medium text-brand-950/60">{label}</div>
    </div>
  );
}
