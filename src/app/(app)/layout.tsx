import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/dashboard" className="text-lg font-bold">
            Karir<span className="text-indigo-600">.ai</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
            <Link href="/onboarding" className="hover:text-indigo-600">Goal</Link>
            <span className="text-zinc-500">{session.user.email}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className="text-zinc-500 hover:text-red-600">
                Keluar
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
