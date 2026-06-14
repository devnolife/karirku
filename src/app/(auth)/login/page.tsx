import { signInDemo, homeForRole } from "@/lib/mock/session";
import type { UserRole } from "@/lib/mock/data";
import { redirect } from "next/navigation";
import Link from "next/link";

async function signInAction(role: UserRole) {
  "use server";
  await signInDemo(role);
  redirect(homeForRole(role));
}

const ROLE_OPTIONS: {
  role: UserRole;
  title: string;
  desc: string;
  email: string;
}[] = [
  { role: "jobseeker", title: "Jobseeker", desc: "Roadmap belajar, skill-gap, & job match.", email: "dimas@craft.works" },
  { role: "freelancer", title: "Freelancer", desc: "Portofolio, project match, & proposal.", email: "sari@craft.works" },
  { role: "company", title: "Company", desc: "Posting lowongan & AI screening kandidat.", email: "hr@nara.id" },
  { role: "admin", title: "Admin", desc: "Kelola users, jobs, courses, & pipeline.", email: "admin@craft.works" },
];

export default function LoginPage() {
  return (
    <main className="app-canvas act-sans relative flex min-h-screen flex-1 items-stretch text-[var(--act-ink)]">
      {/* Left — brand context */}
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden p-12 md:flex">
        <div className="act-band-sky absolute inset-0 -z-10" />
        <div
          className="absolute inset-0 -z-10 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(620px 360px at 12% -8%, rgba(0,152,242,0.18), transparent 70%), radial-gradient(560px 420px at 92% 108%, rgba(109,86,252,0.14), transparent 70%)",
          }}
        />
        <Link href="/" className="inline-flex items-center gap-2.5">
          <Wordmark />
          <span className="act-heading text-[19px]">
            Craft<span className="text-[var(--act-graphite)]">Works</span>
          </span>
        </Link>

        <div>
          <span className="act-tag">Welcome back</span>
          <p className="act-display mt-6 text-[40px] leading-[1.08] text-[var(--act-ink)]">
            Karir bukan{" "}
            <span className="act-sky-text">lomba</span>, tapi navigasi. Kamu cuma
            butuh peta yang jujur.
          </p>
          <p className="act-script mt-6 text-2xl text-[var(--act-iris)]">
            — manifesto CraftWorks
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-[rgba(0,152,242,0.16)] pt-5 text-sm text-[var(--act-graphite)]">
          <span>Demo mode · v1.0</span>
          <span>Apr 2026</span>
        </div>
      </aside>

      {/* Right — form */}
      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="act-rise act-card-2 act-rail act-rail-rainbow w-full max-w-md p-8 pt-9 md:p-10">
          <Link
            href="/"
            className="mb-9 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--act-graphite)] transition-colors hover:text-[var(--act-ink)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Kembali
          </Link>

          <span className="act-eyebrow block">Sign in</span>
          <h1 className="act-display mt-3 text-[44px] leading-[1.04]">
            Masuk ke <span className="act-sky-text">CraftWorks</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--act-charcoal)]">
            Versi demo — jalan tanpa database &amp; OAuth. Pilih role untuk
            explore alur &amp; dashboard masing-masing.
          </p>

          <form className="mt-8 space-y-2.5">
            {ROLE_OPTIONS.map((o) => (
              <button
                key={o.role}
                type="submit"
                data-role={o.role}
                formAction={signInAction.bind(null, o.role)}
                className="group flex w-full items-center gap-3.5 rounded-2xl border border-[rgba(15,23,42,0.1)] bg-[var(--act-mist)] p-4 text-left transition-all hover:border-[var(--act-blue)] hover:bg-[var(--act-sky-50)]"
              >
                <RoleGlyph role={o.role} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-[var(--act-ink)]">
                      {o.title}
                    </span>
                    <span className="text-[11px] text-[var(--act-graphite)]">
                      {o.email}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--act-graphite)]">
                    {o.desc}
                  </span>
                </span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 flex-none text-[var(--act-graphite)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--act-blue)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>
            ))}

            <button
              type="button"
              disabled
              className="inline-flex h-[52px] w-full cursor-not-allowed items-center justify-center gap-3 rounded-full border border-[rgba(15,23,42,0.1)] bg-[var(--act-mist)] text-sm font-medium text-[var(--act-graphite)]"
            >
              <GoogleIcon />
              Google — nonaktif di demo
            </button>
          </form>

          <p className="mt-8 text-xs text-[var(--act-graphite)]">
            Dengan masuk, kamu setuju{" "}
            <Link href="#" className="font-medium text-[var(--act-ink)] underline underline-offset-2">Syarat</Link>
            {" & "}
            <Link href="#" className="font-medium text-[var(--act-ink)] underline underline-offset-2">Privasi</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}

function RoleGlyph({ role }: { role: UserRole }) {
  const cfg: Record<UserRole, { bg: string; d: string }> = {
    jobseeker: { bg: "bg-[linear-gradient(140deg,#38bdf8,var(--act-blue))]", d: "M12 14a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 0114 0" },
    freelancer: { bg: "bg-[linear-gradient(140deg,#8b78ff,var(--act-iris))]", d: "M4 7h16v12H4zM9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" },
    company: { bg: "bg-[linear-gradient(140deg,#ff5cd6,var(--act-magenta))]", d: "M4 20V5a1 1 0 011-1h9a1 1 0 011 1v15M15 9h4a1 1 0 011 1v10M7 8h2M7 12h2M7 16h2" },
    admin: { bg: "bg-[linear-gradient(140deg,#34d399,#059669)]", d: "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" },
  };
  const c = cfg[role];
  return (
    <span className={`inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl text-white ${c.bg}`}>
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={c.d} />
      </svg>
    </span>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="opacity-60">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.28-1.93-6.15-4.53H2.17v2.84A10.99 10.99 0 0 0 12 23Z" />
    </svg>
  );
}

function Wordmark() {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--act-onyx)] text-white shadow-[var(--act-soft-shadow)]">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 19 L12 5 L19 19" />
        <path d="M8 14 H16" />
      </svg>
    </span>
  );
}
