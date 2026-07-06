import { SkPage, SkPageHeader, SkPanel } from "../_dash/skeleton";

/* Mirrors skills page: header + two skill-bar panels. */
export default function SkillsLoading() {
  return (
    <SkPage>
      <SkPageHeader />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkPanel lines={4} />
        <SkPanel lines={4} />
      </div>
    </SkPage>
  );
}
