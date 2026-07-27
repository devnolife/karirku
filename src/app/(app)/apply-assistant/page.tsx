import { requireUser } from "@/lib/auth";
import { getProfile } from "@/server/queries/profile";
import { isOcrAvailable } from "@devnolife/karirku-core/ocr";
import { PageHeader } from "../_dash/parts";
import { ApplyAssistant } from "./_assistant";

export default async function ApplyAssistantPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  const profileReady = Boolean(
    (profile.headline || profile.summary || profile.contact.currentTitle) &&
      profile.skills.length > 0,
  );

  return (
    <div className="act-rise app-page space-y-8">
      <PageHeader
        kicker="Asisten Lamar"
        title={
          <>
            Ubah lowongan apa pun jadi{" "}
            <span className="text-[var(--act-blue)]">lamaran siap kirim.</span>
          </>
        }
        meta="Tempel link · unggah gambar · atau ketik deskripsi"
        action={<span className="act-chip act-chip-blue">AI · lokal</span>}
      />

      {!profileReady && (
        <div className="act-card-2 flex flex-col gap-1 p-5">
          <span className="act-kicker">Lengkapi profil dulu</span>
          <p className="text-sm text-[var(--act-graphite)]">
            Isi headline, pengalaman, dan skill di{" "}
            <a href="/profile" className="font-semibold text-[var(--act-blue)] hover:underline">
              Profil
            </a>{" "}
            agar pesan lamaran yang dibuat lebih personal dan relevan.
          </p>
        </div>
      )}

      <ApplyAssistant
        ocrAvailable={isOcrAvailable()}
        skillCount={profile.skills.length}
      />
    </div>
  );
}
