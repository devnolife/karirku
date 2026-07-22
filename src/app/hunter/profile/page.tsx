import { hunterDb } from "@/lib/hunter";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  const raw = hunterDb().getSetting("profile", "{}");
  let profile: Record<string, unknown> = {};
  try {
    profile = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    /* keep empty */
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold">Data Diri</h1>
        <p className="text-sm text-slate-400 mt-1">
          Sumber data tunggal untuk auto-apply — cover letter, form pelamar, dan jawaban
          screening akan diambil dari sini (nanti oleh LLM server).
        </p>
      </div>
      <ProfileForm initial={profile} />
    </div>
  );
}
