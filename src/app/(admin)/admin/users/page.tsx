import { MOCK_ADMIN_USERS, ROLE_LABEL, type AdminUser } from "@/lib/mock/data";
import { PageHead, StatusDot } from "../../_ui";
import { applyUserOverrides, readAdminOverrides } from "../../_overrides";
import { toggleUserStatus, toggleAutoApplyEntitlement } from "../../_actions";
import { ActionButton } from "../../_action-button";
import { isProductionMode } from "@/lib/mode";
import { prisma } from "@/lib/db";
import { FEATURE_HUNTER_AUTO_APPLY, hasEntitlement } from "@/lib/entitlements";

type UserRow = AdminUser & { autoApply: boolean };

/**
 * Dual-mode: production baca langsung dari Prisma (`users` + `entitlements`);
 * mock (default sekarang) pakai fixture + cookie overrides yang sudah ada.
 * `status`/`plan` di cabang production masih placeholder — model billing/
 * status real belum termasuk cakupan spec ini (lihat
 * docs/superpowers/specs/2026-07-06-hunter-premium-foundation-design.md).
 */
async function loadUsers(): Promise<UserRow[]> {
  if (isProductionMode()) {
    const users = await prisma.user.findMany({
      include: { entitlements: true },
      orderBy: { createdAt: "desc" },
    });
    return users.map((u) => ({
      id: u.id,
      name: u.name ?? u.email,
      email: u.email,
      role: u.role,
      status: "active",
      joined: u.createdAt.toLocaleDateString("id-ID"),
      plan: "Free",
      autoApply: u.entitlements.some(
        (e) => e.feature === FEATURE_HUNTER_AUTO_APPLY && e.status === "active",
      ),
    }));
  }

  const overrides = await readAdminOverrides();
  const users = applyUserOverrides(MOCK_ADMIN_USERS, overrides);
  return Promise.all(
    users.map(async (u) => ({
      ...u,
      autoApply: await hasEntitlement(u.id, FEATURE_HUNTER_AUTO_APPLY),
    })),
  );
}

export default async function AdminUsersPage() {
  const users = await loadUsers();
  const active = users.filter((u) => u.status === "active").length;

  return (
    <div className="act-rise space-y-6">
      <PageHead
        title="Kelola pengguna"
        desc="Daftar akun, role, & status. Data ilustratif (mode demo)."
        action={
          <div className="flex gap-2">
            <span className="act-chip act-chip-blue">{users.length} total</span>
            <span className="act-chip act-chip-green">{active} aktif</span>
          </div>
        }
      />

      <div className="act-card-2 overflow-hidden">
        <div className="hidden grid-cols-12 gap-3 border-b border-[rgba(15,23,42,0.07)] px-5 py-3 md:grid">
          <Th className="col-span-3">Nama</Th>
          <Th className="col-span-2">Role</Th>
          <Th className="col-span-1">Plan</Th>
          <Th className="col-span-2">Status</Th>
          <Th className="col-span-2">Auto-Apply</Th>
          <Th className="col-span-2 text-right">Aksi</Th>
        </div>
        <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
          {users.map((u) => (
            <li key={u.id} className="act-rowhover grid grid-cols-12 items-center gap-3 px-5 py-4">
              <div className="col-span-12 flex items-center gap-3 md:col-span-3">
                <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[var(--act-onyx)] text-xs font-semibold text-white">
                  {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--act-ink)]">{u.name}</div>
                  <div className="truncate text-xs text-[var(--act-graphite)]">{u.email}</div>
                </div>
              </div>
              <div className="col-span-6 md:col-span-2">
                <span className="act-chip act-chip-iris">{ROLE_LABEL[u.role]}</span>
              </div>
              <div className="col-span-6 text-sm text-[var(--act-charcoal)] md:col-span-1">{u.plan}</div>
              <div className="col-span-6 md:col-span-2">
                <StatusDot
                  tone={u.status === "active" ? "green" : u.status === "pending" ? "amber" : "mute"}
                  label={u.status}
                />
              </div>
              <div className="col-span-6 md:col-span-2">
                <span className={`act-chip ${u.autoApply ? "act-chip-green" : "act-chip-mute"}`}>
                  {u.autoApply ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <div className="col-span-12 flex flex-wrap justify-end gap-x-3 gap-y-1 text-left md:col-span-2 md:text-right">
                <ActionButton
                  action={toggleUserStatus.bind(null, u.id)}
                  label={u.status === "active" ? "Suspend" : "Aktifkan"}
                />
                <ActionButton
                  action={toggleAutoApplyEntitlement.bind(null, u.id)}
                  label={u.autoApply ? "Cabut Auto-Apply" : "Aktifkan Auto-Apply"}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`act-kicker !text-[11px] ${className}`}>{children}</span>;
}
