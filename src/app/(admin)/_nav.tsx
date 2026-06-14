"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: string };

const ITEMS: Item[] = [
  { href: "/admin", label: "Overview", icon: "M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z" },
  { href: "/admin/users", label: "Users", icon: "M9 11a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0M17 11a4 4 0 000-8" },
  { href: "/admin/jobs", label: "Jobs", icon: "M4 7h16v12H4zM9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" },
  { href: "/admin/courses", label: "Courses", icon: "M3 5l9-2 9 2-9 2-9-2zm0 0v9m9 7c-3-2-6-2.5-9-2.5V14m18-9v9c-3 0-6 .5-9 2.5" },
  { href: "/admin/scraper", label: "Scraper", icon: "M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1m0-12.8l-2.1 2.1M7.7 16.3l-2.1 2.1M12 8a4 4 0 100 8 4 4 0 000-8z" },
  { href: "/guides", label: "Panduan", icon: "M4 5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9-2v5h5" },
];

export function AdminSidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {ITEMS.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors " +
              (active
                ? "bg-[var(--act-onyx)] text-white"
                : "text-[var(--act-charcoal)] hover:bg-[rgba(15,15,15,0.05)]")
            }
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] flex-none" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d={item.icon} />
            </svg>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
