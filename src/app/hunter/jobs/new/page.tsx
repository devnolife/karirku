import { JobForm } from "./job-form";

export const dynamic = "force-dynamic";

export default function NewJobPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold">Tambah Job Manual</h1>
        <p className="text-sm text-slate-400 mt-1">
          Masukkan lowongan dari mana saja — cukup link, deskripsi, dan/atau screenshot.
          Job masuk ke queue dan bisa diproses auto-apply.
        </p>
      </div>
      <JobForm />
    </div>
  );
}
