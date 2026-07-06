import { requireUser } from "@/lib/auth";
import { getRecommendedCourses } from "@/server/queries/courses";
import { getSkillGap } from "@/server/queries/skills";
import { PageHeader, CourseRow } from "../_dash/parts";
import { GuideTeaser } from "../_GuideTeaser";
import { Empty } from "@/components/ui/empty";

export default async function LearnPage() {
  const user = await requireUser();
  const [courses, gap] = await Promise.all([
    getRecommendedCourses(user.id, 8),
    getSkillGap(user.id),
  ]);

  return (
    <div className="act-rise mx-auto max-w-[1200px] space-y-8 px-6 py-8 md:px-10">
      <PageHeader
        kicker="Belajar"
        title={<>Belajar <span className="text-[#059669]">ini dulu.</span></>}
        meta="Kursus prioritas sesuai skill-gap kamu"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="act-card-2 overflow-hidden lg:col-span-3">
          <div className="border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
            <span className="act-kicker">Kursus prioritas</span>
          </div>
          {courses.length === 0 ? (
            <div className="p-5">
              <Empty title="Belum ada rekomendasi kursus" description="Lengkapi skill & goal kamu dulu." />
            </div>
          ) : (
            <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
              {courses.map((c, i) => <CourseRow key={c.id} course={c} idx={i} />)}
            </ul>
          )}
        </div>
        <div className="act-card-2 overflow-hidden lg:col-span-2">
          <div className="border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
            <span className="act-kicker">Fokus skill</span>
          </div>
          {gap.missingNames.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[var(--act-graphite)]">
              Mantap — skill kamu sudah menutup kebutuhan role target.
            </p>
          ) : (
            <ol className="divide-y divide-[rgba(15,23,42,0.07)]">
              {gap.missingNames.slice(0, 6).map((name, i) => (
                <li key={name} className="flex items-center gap-3 px-5 py-4">
                  <span className="act-display text-lg text-[var(--act-graphite)]">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--act-ink)]">{name}</p>
                    <p className="text-xs text-[var(--act-graphite)]">diminta lowongan, belum kamu kuasai</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
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
