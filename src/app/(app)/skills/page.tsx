import { MOCK_SKILLS } from "@/lib/mock/data";
import { PageHeader, SkillBar } from "../_dash/parts";

export default function SkillsPage() {
  const core = MOCK_SKILLS.filter((s) => s.category === "core");
  const other = MOCK_SKILLS.filter((s) => s.category !== "core");

  return (
    <div className="act-rise mx-auto max-w-[1200px] space-y-8 px-6 py-8 md:px-10">
      <PageHeader
        kicker="Skill-gap analyzer"
        title={<>Skill kamu <span className="text-[var(--act-blue)]">vs target.</span></>}
        meta="AI-powered · updated 2d ago"
        action={<span className="act-chip act-chip-blue">{MOCK_SKILLS.length} skill</span>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="act-card-2 p-6">
          <span className="act-chip act-chip-blue">Core — wajib</span>
          <div className="mt-5 space-y-5">
            {core.map((s) => <SkillBar key={s.name} skill={s} tone="blue" />)}
          </div>
        </div>
        <div className="act-card-2 p-6">
          <span className="act-chip act-chip-iris">Nice-to-have + Soft</span>
          <div className="mt-5 space-y-5">
            {other.map((s) => <SkillBar key={s.name} skill={s} tone="iris" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
