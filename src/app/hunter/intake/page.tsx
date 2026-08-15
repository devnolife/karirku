import { prisma } from "@devnolife/karirku-core/db";
import { getSession } from "@/lib/auth";
import { IntakeForm } from "./intake-form";

export const dynamic = "force-dynamic";

export default async function IntakePage() {
  const { user } = await getSession();
  const recent = await prisma.hunterJob.findMany({
    where: { userId: user.id, platform: "intake" },
    select: {
      id: true, title: true, company: true, llmScore: true,
      llmTier: true, llmReportPath: true, status: true, foundAt: true,
    },
    orderBy: { id: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-10">
      <div className="border-b border-[#262B24] pb-5">
        <h1 className="text-3xl font-black uppercase tracking-tight">Intake</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#8A9088]">
          Tempel URL, upload screenshot requirement, atau tempel deskripsi. Sistem mengekstrak JD,
          mengevaluasi dengan LLM, lalu menyiapkan CV tailored + cover letter otomatis.
        </p>
      </div>

      <IntakeForm />

      <section>
        <h2 className="mb-4 [font-family:var(--font-hunter-mono)] text-[11px] uppercase tracking-[0.2em] text-[#4C5349]">
          01 / Intake terakhir
        </h2>
        {recent.length === 0 ? (
          <p className="[font-family:var(--font-hunter-mono)] text-xs text-[#4C5349]">
            belum ada. job hasil intake akan tampil di sini dan di Jobs Queue.
          </p>
        ) : (
          <table className="w-full border border-[#262B24] text-sm">
            <thead>
              <tr className="border-b border-[#262B24] text-left [font-family:var(--font-hunter-mono)] text-[10px] uppercase tracking-[0.14em] text-[#4C5349]">
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Judul</th>
                <th className="px-3 py-2 font-medium">Perusahaan</th>
                <th className="px-3 py-2 font-medium">Skor LLM</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((j) => (
                <tr key={String(j.id)} className="border-b border-[#1A1D18] transition-colors duration-150 ease-out last:border-b-0 hover:bg-[#141712]">
                  <td className="px-3 py-2 [font-family:var(--font-hunter-mono)] text-xs tabular-nums text-[#4C5349]">{String(j.id)}</td>
                  <td className="px-3 py-2 font-bold">{String(j.title)}</td>
                  <td className="px-3 py-2 text-[#8A9088]">{String(j.company ?? "—")}</td>
                  <td className="px-3 py-2 [font-family:var(--font-hunter-mono)] text-xs">
                    {j.llmScore != null ? (
                      <span className="font-semibold text-[#FF6B1A]">{Number(j.llmScore).toFixed(1)}</span>
                    ) : (
                      <span className="text-[#4C5349]">[wait]</span>
                    )}
                  </td>
                  <td className="px-3 py-2 [font-family:var(--font-hunter-mono)] text-xs text-[#8A9088]">{String(j.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
