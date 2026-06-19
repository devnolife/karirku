import { getSession } from "@/lib/auth";
import { GUIDES } from "@/lib/content/guides";
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
    <div className="act-rise mx-auto max-w-[1400px] space-y-8 px-6 py-12">
      <div className="max-w-2xl">
        <span className="act-eyebrow">Panduan & belajar</span>
        <h1 className="act-display mt-3 text-4xl leading-[1.05] md:text-5xl">
          Dituntun dari{" "}
          <span className="act-sky-text">daftar sampai diterima.</span>
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--act-charcoal)]">
          Cara daftar Upwork &amp; LinkedIn, dasar kerja remote, persiapan interview,
          sampai bikin CV lolos ATS — langkah demi langkah, plus latihan interview.
        </p>
      </div>

      <GuidesExplorer guides={guides} highlightRole={role} />
    </div>
  );
}
