import { MOCK_COURSES, MOCK_ACTIVITY } from "@/lib/mock/data";
import { PageHeader, CourseRow } from "../_dash/parts";
import { GuideTeaser } from "../_GuideTeaser";

export default function LearnPage() {
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
          <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
            {MOCK_COURSES.map((c, i) => <CourseRow key={c.id} course={c} idx={i} />)}
          </ul>
        </div>
        <div className="act-card-2 overflow-hidden lg:col-span-2">
          <div className="border-b border-[rgba(15,23,42,0.07)] px-5 py-3.5">
            <span className="act-kicker">Activity log</span>
          </div>
          <ol className="divide-y divide-[rgba(15,23,42,0.07)]">
            {MOCK_ACTIVITY.map((a, i) => (
              <li key={i} className="px-5 py-4">
                <span className="act-kicker !text-[11px]">{a.time}</span>
                <p className="mt-1 text-sm leading-snug text-[var(--act-charcoal)]">{a.text}</p>
              </li>
            ))}
          </ol>
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
