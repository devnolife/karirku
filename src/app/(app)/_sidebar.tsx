"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SideItem = { href: string; label: string; icon: string; badge?: string };
export type NavGroup = { label?: string; items: SideItem[] };

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebarNav({
  groups,
  collapsed = false,
}: {
  groups: NavGroup[];
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  return (
    <nav className="space-y-6">
      {!collapsed && <div className="studio-nav-kicker">Career Studio</div>}
      {groups.map((group, gi) => (
        <div key={group.label ?? gi} className="space-y-1.5">
          {group.label && !collapsed && (
            <div className="px-2 pb-1">
              <span className="act-kicker !text-[10.5px]">{group.label}</span>
            </div>
          )}
          {group.items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                aria-current={active ? "page" : undefined}
                className={
                  "act-nav" +
                  (collapsed ? " act-nav-collapsed" : "") +
                  (active ? " act-nav-active" : "")
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
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="act-chip act-chip-mute !px-2 !py-0.5 !text-[10px]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
