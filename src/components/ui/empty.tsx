import Link from "next/link";

/**
 * Empty state ringan, konsisten dengan design system `act-*`.
 */
export function Empty({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="act-card-2 flex flex-col items-center justify-center gap-3 border-dashed px-6 py-14 text-center">
      <h3 className="act-heading text-lg text-[var(--act-ink)]">{title}</h3>
      {description && (
        <p className="max-w-md text-sm leading-relaxed text-[var(--act-graphite)]">
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="act-pill mt-2 !px-6 !py-2.5 !text-sm">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
