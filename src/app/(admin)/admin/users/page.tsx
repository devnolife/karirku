import { getAdminUsers } from "@/server/queries/admin";
import { ROLE_LABEL } from "@/lib/roles";
import { PageHead, StatusDot } from "../../_ui";

export default async function AdminUsersPage() {
  const users = await getAdminUsers(50);

  return (
    <div className="act-rise space-y-8">
      <PageHead
        kicker="Admin · Users"
        title="Kelola pengguna"
        desc="Daftar akun, role, & tanggal bergabung. Data real dari database."
        action={<span className="act-chip act-chip-blue">{users.length} total</span>}
      />

      <div className="act-card-2 overflow-hidden">
        <div className="hidden grid-cols-12 gap-3 border-b border-[rgba(15,23,42,0.07)] px-5 py-3 md:grid">
          <Th className="col-span-5">Nama</Th>
          <Th className="col-span-3">Role</Th>
          <Th className="col-span-2">Status</Th>
          <Th className="col-span-2">Bergabung</Th>
        </div>
        <ul className="divide-y divide-[rgba(15,23,42,0.07)]">
          {users.map((u) => (
            <li key={u.id} className="act-rowhover grid grid-cols-12 items-center gap-3 px-5 py-4">
              <div className="col-span-12 flex items-center gap-3 md:col-span-5">
                <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[var(--act-onyx)] text-xs font-semibold text-white">
                  {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--act-ink)]">{u.name}</div>
                  <div className="truncate text-xs text-[var(--act-graphite)]">{u.email}</div>
                </div>
              </div>
              <div className="col-span-6 md:col-span-3">
                <span className="act-chip act-chip-iris">{ROLE_LABEL[u.role]}</span>
              </div>
              <div className="col-span-6 md:col-span-2">
                <StatusDot tone="green" label="active" />
              </div>
              <div className="col-span-6 text-xs text-[var(--act-graphite)] md:col-span-2">{u.joinedAt}</div>
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
