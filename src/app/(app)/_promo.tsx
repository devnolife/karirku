import Link from "next/link";

export function SidebarPromo() {
  return (
    <div className="studio-promo">
      <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/10">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 7h16v10H4z" />
          <path d="M9 12h6M12 9v6" />
        </svg>
      </span>
      <p className="mt-3 text-[15px] font-semibold leading-tight">
        Pasang Extension<br />Auto-Fill
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-white/68">
        Isi form lamaran otomatis dari profilmu.
      </p>
      <Link
        href="/guides"
        className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-brand-50 px-4 py-2 text-[13px] font-semibold text-brand-950 transition hover:bg-white"
      >
        Pelajari
      </Link>
    </div>
  );
}
