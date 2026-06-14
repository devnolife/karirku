export function PageHead({
  kicker,
  title,
  desc,
  action,
}: {
  kicker: string;
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="act-eyebrow">{kicker}</span>
        <h1 className="act-display mt-3 text-3xl leading-[1.05] md:text-4xl">{title}</h1>
        {desc && <p className="mt-2 max-w-xl text-sm text-[var(--act-graphite)]">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusDot({
  tone,
  label,
}: {
  tone: "green" | "blue" | "magenta" | "amber" | "mute";
  label: string;
}) {
  const cls = {
    green: "act-chip-green",
    blue: "act-chip-blue",
    magenta: "act-chip-magenta",
    amber: "act-chip-amber",
    mute: "act-chip-mute",
  }[tone];
  return <span className={`act-chip ${cls}`}>{label}</span>;
}
