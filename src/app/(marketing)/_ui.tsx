import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  accent,
  description,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description: string;
}) {
  return (
    <header className="mb-12">
      <span className="inline-flex items-center rounded-full bg-[#E4F3EB] px-3 py-1.5 text-[13px] font-medium uppercase tracking-wider text-[#138E5F]">
        {eyebrow}
      </span>
      <h1 className="mt-5 font-onest text-[36px] font-semibold leading-[1.1] tracking-[-1.2px] md:text-[52px] md:tracking-[-1.8px]">
        {title}
        {accent ? (
          <>
            {" "}
            <span className="font-playfair italic text-black/40">{accent}</span>
          </>
        ) : null}
      </h1>
      <p className="mt-5 max-w-[620px] text-[18px] leading-[28px] opacity-80">{description}</p>
    </header>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-onest text-[24px] font-semibold leading-[30px] tracking-[-0.8px]">
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-[17px] leading-[28px] opacity-80">{children}</div>
    </section>
  );
}
