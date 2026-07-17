import { requireUser } from "@/lib/auth";
import { getRecommendedCourses } from "@/server/queries/courses";
import { getSkillGap } from "@/server/queries/skills";
import { PageHeader } from "../_dash/parts";
import { GuideTeaser } from "../_GuideTeaser";
import { Empty } from "@/components/ui/empty";

export default async function LearnPage() {
  const user = await requireUser();
  const [courses, gap] = await Promise.all([
    getRecommendedCourses(user.id, 8),
    getSkillGap(user.id),
  ]);

  return (
    <div className="act-rise mx-auto max-w-[1200px] space-y-8 px-6 py-10 md:px-10">
      <PageHeader
        kicker="Career studio · learning shelf"
        title={<>Belajar yang paling <span className="text-[var(--act-blue)]">berdampak.</span></>}
        meta="Kursus prioritas sesuai skill-gap kamu"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <span className="act-kicker">Pilihan untukmu</span>
              <h2 className="act-heading mt-1 text-xl text-[var(--act-ink)]">Kursus prioritas</h2>
            </div>
            <span className="text-xs font-medium text-[var(--act-graphite)]">{courses.length} rekomendasi</span>
          </div>
          {courses.length === 0 ? (
            <div className="act-card-2 p-5">
              <Empty title="Belum ada rekomendasi kursus" description="Lengkapi skill & goal kamu dulu." />
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {courses.map((course, index) => (
                <li key={course.id} className="act-card-2 flex min-h-[184px] flex-col p-5 transition-colors hover:border-[rgba(25,143,56,0.25)] hover:bg-[#FAFFFC]">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--act-wash-sky)] font-semibold text-[var(--act-onyx)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {course.priceIdr === 0 ? (
                      <span className="act-chip act-chip-green">Gratis</span>
                    ) : (
                      <span className="text-sm font-semibold text-[var(--act-ink)]">Rp {(course.priceIdr / 1000).toFixed(0)}k</span>
                    )}
                  </div>
                  <div className="mt-5">
                    <p className="text-xs font-semibold text-[var(--act-iris)]">{course.provider}</p>
                    <h3 className="act-heading mt-1 text-base leading-snug text-[var(--act-ink)]">{course.title}</h3>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-5 text-xs text-[var(--act-graphite)]">
                    <span>{course.level}</span><span>{course.hours} jam</span><span>Rating {course.rating}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside className="act-card-2 h-fit overflow-hidden lg:col-span-2">
          <div className="border-b border-[rgba(4,39,24,0.08)] bg-amber-500/10 px-5 py-4">
            <span className="act-kicker !text-amber-700">Arah belajarmu</span>
            <h2 className="act-heading mt-1 text-lg text-[var(--act-ink)]">Fokus skill</h2>
          </div>
          {gap.missingNames.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[var(--act-graphite)]">
              Mantap — skill kamu sudah menutup kebutuhan role target.
            </p>
          ) : (
            <ol className="divide-y divide-[rgba(4,39,24,0.08)]">
              {gap.missingNames.slice(0, 6).map((name, i) => (
                <li key={name} className="flex items-center gap-3 px-5 py-4">
                  <span className="act-display flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15 text-sm text-amber-800">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--act-ink)]">{name}</p>
                    <p className="text-xs text-[var(--act-graphite)]">diminta lowongan, belum kamu kuasai</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>

      <GuideTeaser
        items={[
          { href: "/guides/optimasi-linkedin", title: "Optimasi LinkedIn", desc: "Biar profilmu muncul di pencarian recruiter." },
          { href: "/guides/resume-ats", title: "Resume lolos ATS", desc: "Format CV yang terbaca mesin & manusia." },
        ]}
      />
    </div>
  );
}
