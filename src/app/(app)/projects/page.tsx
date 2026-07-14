import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getFreelanceProjects } from "@/server/queries/freelance";
import { Empty } from "@/components/ui/empty";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await getFreelanceProjects(user.id);
  const [recommended, ...moreProjects] = projects;

  return (
    <div className="act-rise mx-auto max-w-[1320px] space-y-7 px-5 py-8 sm:px-8 md:py-10">
      <section className="overflow-hidden rounded-[24px] border border-[#042718]/[0.08] bg-[#F2FBF6] px-5 py-6 sm:px-7 sm:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#198F38]">Freelancer workspace</span>
            <h1 className="act-display mt-3 text-4xl leading-[0.98] tracking-[-0.04em] text-[#042718] sm:text-5xl">
              Opportunity board.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#042718]/70">
              Pilihan proyek yang diselaraskan dengan skill, pengalaman, dan rate kamu.
            </p>
          </div>
          <div className="flex w-fit items-center gap-3 rounded-2xl border border-[#042718]/[0.08] bg-white px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4E5CD] text-sm font-bold text-[#042718]">
              {projects.length}
            </span>
            <div>
              <p className="text-sm font-semibold text-[#042718]">Proyek untukmu</p>
              <p className="text-xs text-[#042718]/60">Diperbarui untuk profilmu</p>
            </div>
          </div>
        </div>
      </section>

      {projects.length === 0 ? (
        <Empty title="Belum ada project" description="Project baru akan muncul di sini begitu tersedia." />
      ) : (
        <div className="space-y-5">
          <section className="overflow-hidden rounded-[24px] border border-[#042718]/[0.08] bg-white">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="p-5 sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-[#D4E5CD] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#042718]">
                      Rekomendasi utama
                    </span>
                    <h2 className="act-heading mt-4 text-2xl leading-tight text-[#042718] sm:text-3xl">{recommended.title}</h2>
                    <p className="mt-2 text-sm text-[#042718]/65">
                      <span className="font-semibold text-[#042718]">{recommended.client}</span> <span className="mx-1 text-[#042718]/35">/</span> {recommended.type}
                    </p>
                  </div>
                  <MatchScore value={recommended.matchPct} />
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {recommended.skills.map((skill) => (
                    <span key={skill} className="rounded-full border border-[#198F38]/15 bg-[#F2FBF6] px-3 py-1.5 text-xs font-semibold text-[#198F38]">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-7 flex flex-col gap-4 border-t border-[#042718]/[0.08] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-7">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#042718]/45">Budget</p>
                      <p className="mt-1 text-sm font-semibold text-[#042718]">{recommended.budget}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#042718]/45">Timeline</p>
                      <p className="mt-1 text-sm font-semibold text-[#042718]">{recommended.duration} · {recommended.posted}</p>
                    </div>
                  </div>
                  <button className="group inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-[#042718] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#198F38]">
                    Buat proposal
                    <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex min-h-40 items-center justify-center border-t border-[#042718]/[0.08] bg-[#D2DDEA]/45 p-6 lg:border-t-0 lg:border-l">
                <MatchScore value={recommended.matchPct} large />
              </div>
            </div>
          </section>

          {moreProjects.length > 0 && (
            <section className="overflow-hidden rounded-[24px] border border-[#042718]/[0.08] bg-white">
              <div className="flex items-center justify-between border-b border-[#042718]/[0.08] px-5 py-4 sm:px-6">
                <div>
                  <h2 className="act-heading text-lg text-[#042718]">Lebih banyak peluang</h2>
                  <p className="mt-0.5 text-xs text-[#042718]/60">Temukan brief yang sesuai berikutnya.</p>
                </div>
                <span className="rounded-full bg-[#EBE3D2] px-3 py-1 text-xs font-semibold text-[#042718]">{moreProjects.length} proyek</span>
              </div>
              <div className="divide-y divide-[#042718]/[0.08]">
                {moreProjects.map((project) => (
                  <article key={project.id} className="flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-[#F2FBF6]/70 sm:px-6 lg:flex-row lg:items-center">
                    <div className="min-w-0 flex-1">
                      <h3 className="act-heading text-lg text-[#042718]">{project.title}</h3>
                      <p className="mt-1 text-sm text-[#042718]/65"><span className="font-semibold text-[#042718]">{project.client}</span> <span className="mx-1 text-[#042718]/35">/</span> {project.type}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {project.skills.map((skill) => (
                          <span key={skill} className="rounded-md bg-[#F2FBF6] px-2 py-1 text-[11px] font-semibold text-[#198F38]">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-5 lg:w-[380px] lg:justify-between">
                      <div className="text-sm">
                        <p className="font-semibold text-[#042718]">{project.budget}</p>
                        <p className="mt-1 text-xs text-[#042718]/60">{project.duration} · {project.posted}</p>
                      </div>
                      <MatchScore value={project.matchPct} />
                      <button className="rounded-xl border border-[#042718]/15 px-3 py-2 text-sm font-semibold text-[#042718] transition-colors hover:border-[#198F38] hover:bg-[#D4E5CD]">
                        Buat proposal
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <div className="flex justify-center pt-1">
        <Link href="/dashboard" className="rounded-xl border border-[#042718]/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#042718] transition-colors hover:bg-[#F2FBF6]">Kembali ke dashboard</Link>
      </div>
    </div>
  );
}

function MatchScore({ value, large = false }: { value: number; large?: boolean }) {
  return (
    <div className={`shrink-0 rounded-2xl border border-[#198F38]/15 bg-[#F2FBF6] px-3 py-2 text-center ${large ? "min-w-36 px-5 py-4" : "min-w-20"}`}>
      <p className={`act-display leading-none text-[#198F38] ${large ? "text-4xl" : "text-2xl"}`}>{value}%</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#042718]/55">Match</p>
    </div>
  );
}
