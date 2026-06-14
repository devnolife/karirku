import { MOCK_ADMIN_COURSES } from "@/lib/mock/data";
import { PageHead, StatusDot } from "../../_ui";

export default function AdminCoursesPage() {
  const courses = MOCK_ADMIN_COURSES;
  const prakerja = courses.filter((c) => c.isPrakerja).length;

  return (
    <div className="act-rise space-y-8">
      <PageHead
        kicker="Admin · Courses"
        title="Kelola course"
        desc="Katalog course multi-provider. Data ilustratif (mode demo)."
        action={
          <div className="flex gap-2">
            <span className="act-chip act-chip-blue">{courses.length} total</span>
            <span className="act-chip act-chip-green">{prakerja} Prakerja</span>
          </div>
        }
      />

      <div className="act-card-2 overflow-hidden">
        <div className="hidden grid-cols-12 gap-3 border-b border-[rgba(15,23,42,0.07)] px-5 py-3 md:grid">
          <span className="act-kicker !text-[11px] col-span-5">Course</span>
          <span className="act-kicker !text-[11px] col-span-2">Provider</span>
          <span className="act-kicker !text-[11px] col-span-2">Harga</span>
          <span className="act-kicker !text-[11px] col-span-1">Enroll</span>
          <span className="act-kicker !text-[11px] col-span-2">Status</span>
        </div>
        <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
          {courses.map((c) => (
            <li key={c.id} className="act-rowhover grid grid-cols-12 items-center gap-3 px-5 py-4">
              <div className="col-span-12 md:col-span-5">
                <div className="text-sm font-semibold leading-snug text-[var(--act-ink)]">{c.title}</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <span className="act-chip act-chip-mute !py-0.5">{c.source}</span>
                  {c.isPrakerja && <span className="act-chip act-chip-green !py-0.5">Prakerja</span>}
                </div>
              </div>
              <div className="col-span-6 text-sm text-[var(--act-charcoal)] md:col-span-2">{c.provider}</div>
              <div className="col-span-6 md:col-span-2">
                {c.priceIdr === 0 ? (
                  <span className="act-chip act-chip-green">Gratis</span>
                ) : (
                  <span className="text-sm font-semibold text-[var(--act-ink)]">
                    Rp {(c.priceIdr / 1000).toFixed(0)}k
                  </span>
                )}
              </div>
              <div className="col-span-6 text-xs text-[var(--act-graphite)] md:col-span-1">
                {(c.enrollment / 1000).toFixed(1)}k
              </div>
              <div className="col-span-6 md:col-span-2">
                <StatusDot tone={c.status === "indexed" ? "blue" : "amber"} label={c.status} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
