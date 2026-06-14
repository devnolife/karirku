"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SideItem = { href: string; label: string; icon: string };

export function AppSidebarNav({
  items,
  collapsed = false,
}: {
  items: SideItem[];
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            aria-current={active ? "page" : undefined}
            className={
              "flex items-center rounded-xl text-sm font-medium transition-colors " +
              (collapsed ? "justify-center px-0 py-2.5 " : "gap-3 px-3.5 py-2.5 ") +
              (active
                ? "bg-[var(--act-onyx)] text-white"
                : "text-[var(--act-charcoal)] hover:bg-[rgba(15,15,15,0.05)]")
            }
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px] flex-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d={item.icon} />
            </svg>
            {!collapsed && item.label}
          </Link>
        );
      })}
    </nav>
  );
}
