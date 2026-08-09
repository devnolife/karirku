import { hunterDb } from "@devnolife/karirku-core/hunter";
import { IntakeForm } from "./intake-form";

export const dynamic = "force-dynamic";

export default function IntakePage() {
  const recent = hunterDb()
    .getDb()
    .prepare(
      `SELECT id, title, company, llm_score, llm_tier, llm_report_path, status, found_at
       FROM jobs WHERE platform = 'intake' ORDER BY id DESC LIMIT 20`,
    )
    .all() as Record<string, unknown>[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">➕ Intake Lowongan</h1>
        <p className="mt-1 text-sm text-slate-400">
          Tempel URL, upload screenshot requirement, atau tempel deskripsi. Sistem akan mengekstrak JD,
          mengevaluasi dengan LLM, lalu menyiapkan CV tailored + cover letter otomatis.
        </p>
      </div>

      <IntakeForm />

      <div>
        <h2 className="mb-3 text-lg font-semibold">Intake terakhir</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada. Job hasil intake akan tampil di sini dan di Jobs Queue.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-slate-400">
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-3">Judul</th>
                <th className="py-2 pr-3">Perusahaan</th>
                <th className="py-2 pr-3">Skor LLM</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((j) => (
                <tr key={String(j.id)} className="border-b border-slate-900">
                  <td className="py-2 pr-3 text-slate-500">{String(j.id)}</td>
                  <td className="py-2 pr-3">{String(j.title)}</td>
                  <td className="py-2 pr-3 text-slate-400">{String(j.company ?? "—")}</td>
                  <td className="py-2 pr-3">
                    {j.llm_score != null ? (
                      <span className="font-semibold text-amber-400">{Number(j.llm_score).toFixed(1)}</span>
                    ) : (
                      <span className="text-slate-500">⏳ menunggu…</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-slate-400">{String(j.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
