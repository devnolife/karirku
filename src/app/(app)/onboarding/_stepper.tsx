import Link from "next/link";

const STEPS = [
  { n: 1, label: "Skill", href: "/onboarding" },
  { n: 2, label: "Goal", href: "/onboarding/goal" },
  { n: 3, label: "Review", href: "/onboarding/review" },
] as const;

/**
 * Indikator langkah onboarding (Skill → Goal → Review).
 */
export function OnboardingStepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <nav className="flex items-center gap-2" aria-label="Langkah onboarding">
      {STEPS.map((s, i) => {
        const done = s.n < current;
        const active = s.n === current;
        return (
          <div key={s.n} className="flex items-center gap-2">
            <Link
              href={s.href}
              className={
                active
                  ? "flex items-center gap-2 rounded-full bg-[var(--act-onyx)] px-3.5 py-1.5 text-sm font-semibold text-white"
                  : done
                    ? "flex items-center gap-2 rounded-full bg-[var(--act-sky-50)] px-3.5 py-1.5 text-sm font-semibold text-[var(--act-blue)]"
                    : "flex items-center gap-2 rounded-full bg-[var(--act-mist)] px-3.5 py-1.5 text-sm font-medium text-[var(--act-graphite)]"
              }
            >
              <span
                className={
                  active
                    ? "flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[var(--act-onyx)]"
                    : done
                      ? "flex h-5 w-5 items-center justify-center rounded-full bg-[var(--act-blue)] text-[11px] font-bold text-white"
                      : "flex h-5 w-5 items-center justify-center rounded-full border border-[rgba(15,23,42,0.2)] text-[11px] font-bold"
                }
              >
                {done ? "✓" : s.n}
              </span>
              {s.label}
            </Link>
            {i < STEPS.length - 1 && (
              <span className="h-px w-5 bg-[rgba(15,23,42,0.15)]" aria-hidden />
            )}
          </div>
        );
      })}
    </nav>
  );
}
