import { getSession, signOut as authSignOut } from "@/lib/auth";
import { ROLE_LABEL, type UserRole } from "@/lib/roles";
import { type SideItem } from "./_sidebar";
import { AppShell } from "./_shell";

const IC = {
  overview: "M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z",
  skills: "M5 20V8m6 12V4m6 16v-9",
  roadmap: "M9 6h11M9 12h11M9 18h11M5 6h.01M5 12h.01M5 18h.01",
  jobs: "M4 7h16v12H4zM9 7V5a2 2 0 012-2h2a2 2 0 012 2v2",
  learn: "M3 5l9-2 9 2-9 2-9-2zm0 0v9m9 7c-3-2-6-2.5-9-2.5V14m18-9v9c-3 0-6 .5-9 2.5",
  goal: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01",
  guides: "M4 5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9-2v5h5",
  projects: "M12 2l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5",
  proposals: "M7 3h7l5 5v13H7zM14 3v5h5",
  candidates: "M9 11a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0M17 11a4 4 0 000-8",
  profile: "M12 14a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 0114 0",
  applications: "M9 11l3 3 8-8M5 12a7 7 0 0011 5.7",
};

const NAV_BY_ROLE: Record<UserRole, SideItem[]> = {
  jobseeker: [
    { href: "/dashboard", label: "Overview", icon: IC.overview },
    { href: "/profile", label: "Profil", icon: IC.profile },
    { href: "/skills", label: "Skill-gap", icon: IC.skills },
    { href: "/roadmap", label: "Roadmap", icon: IC.roadmap },
    { href: "/jobs", label: "Lowongan", icon: IC.jobs },
    { href: "/applications", label: "Lamaran", icon: IC.applications },
    { href: "/learn", label: "Belajar", icon: IC.learn },
    { href: "/onboarding", label: "Goal", icon: IC.goal },
    { href: "/guides", label: "Panduan", icon: IC.guides },
  ],
  freelancer: [
    { href: "/dashboard", label: "Overview", icon: IC.overview },
    { href: "/profile", label: "Profil", icon: IC.profile },
    { href: "/projects", label: "Projects", icon: IC.projects },
    { href: "/proposals", label: "Proposal", icon: IC.proposals },
    { href: "/onboarding", label: "Goal", icon: IC.goal },
    { href: "/guides", label: "Panduan", icon: IC.guides },
  ],
  company: [
    { href: "/dashboard", label: "Overview", icon: IC.overview },
    { href: "/company/jobs", label: "Lowongan", icon: IC.jobs },
    { href: "/company/candidates", label: "Kandidat", icon: IC.candidates },
    { href: "/guides", label: "Panduan", icon: IC.guides },
  ],
  admin: [{ href: "/dashboard", label: "Overview", icon: IC.overview }],
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const role = session.user.role;
  const items = NAV_BY_ROLE[role];

  async function signOut() {
    "use server";
    await authSignOut({ redirectTo: "/login" });
  }

  return (
    <AppShell
      roleLabel={ROLE_LABEL[role]}
      items={items}
      user={{ name: session.user.name, email: session.user.email }}
      signOut={signOut}
    >
      {children}
    </AppShell>
  );
}
