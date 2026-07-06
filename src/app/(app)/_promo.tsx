import Link from "next/link";

/**
 * Kartu promo gelap di dasar sidebar (gaya Donezo "Download Mobile App").
 * Di karirku diarahkan ke fitur Extension Auto-Fill yang sudah dibangun.
 */
export function SidebarPromo() {
  return (
    <div className="act-promo">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/12 backdrop-blur">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 7h16v10H4z" />
          <path d="M9 12h6M12 9v6" />
        </svg>
      </span>
      <p className="mt-3 text-[15px] font-semibold leading-tight">
        Pasang Extension<br />Auto-Fill
      </p>
      <p className="mt-1 text-[12px] text-white/65">
        Isi form lamaran otomatis dari profilmu.
      </p>
      <Link
        href="/guides"
        className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[var(--act-ink)] transition hover:bg-white/90"
      >
        Pelajari
      </Link>
    </div>
  );
}
