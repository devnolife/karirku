import { getSession } from "@/lib/auth";
import { GUIDES } from "@/core/content/guides";
import { GuidesExplorer } from "./GuidesExplorer";

export default async function GuidesPage() {
  const session = await getSession();
  const role = session.user.role;

  // Panduan relevan dengan role tampil lebih dulu.
  const guides = [...GUIDES].sort((a, b) => {
    const ar = a.forRoles.includes(role) ? 0 : 1;
    const br = b.forRoles.includes(role) ? 0 : 1;
    return ar - br;
  });

  return (
    <div className="act-rise mx-auto max-w-[1200px] space-y-8 px-6 py-10 md:py-12">
      <header className="max-w-3xl border-b border-[rgba(4,39,24,0.08)] pb-8">
        <span className="studio-section-kicker">Bacaan karier</span>
        <h1 className="act-display mt-3 text-4xl leading-[1.05] md:text-5xl">
          Dituntun dari{" "}
          <span className="text-[var(--act-blue)]">daftar sampai diterima.</span>
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--act-charcoal)]">
          Cara daftar Upwork &amp; LinkedIn, dasar kerja remote, persiapan interview,
          sampai bikin CV lolos ATS — langkah demi langkah, plus latihan interview.
        </p>
      </header>

      <GuidesExplorer guides={guides} highlightRole={role} />
    </div>
  );
}
