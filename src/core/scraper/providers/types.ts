/**
 * Provider plugin contract — port dari pola "zero-token" career-ops ke TypeScript.
 *
 * Provider hanya menarik daftar lowongan dari JSON API publik portal (Greenhouse,
 * Ashby, Lever). Tidak ada scraping HTML, tidak ada token AI yang dipakai di sini.
 * Hasilnya berupa {@link RawListing} yang downstream (enrich worker) ubah jadi
 * row `Job` di Prisma.
 */

export interface RawListing {
  /** Judul lowongan, sudah di-trim. */
  title: string;
  /** URL absolut posting — dipakai sebagai kunci dedupe (Job.sourceUrl). */
  url: string;
  /** Stable provider identity, preferred over URL when available. */
  externalId?: string;
  /** Nama perusahaan; bisa kosong kalau sumber tidak mengeksposnya. */
  company: string;
  /** Lokasi; bisa kosong. */
  location: string;
  /** Deskripsi hanya bila provider benar-benar mengembalikannya. */
  description?: string;
  /** Requirements terstruktur bila tersedia dari provider. */
  requirements?: string[];
  /** Tipe kerja hasil normalisasi dari metadata provider. */
  type?: "fulltime" | "parttime" | "contract" | "remote" | "hybrid" | "onsite";
  /** Rentang gaji bulanan dalam currency sumber, bila tersedia. */
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  /** Timestamp publikasi dari provider, dalam ISO-8601. */
  postedAt?: string;
}

export interface PortalEntry {
  /** Primary key JobSource; kosong hanya untuk fallback tanpa DB. */
  jobSourceId?: string;
  /** Label perusahaan; muncul di log dan sebagai fallback company. */
  name: string;
  /** Default true. */
  enabled?: boolean;
  /** URL halaman karier publik; dibaca oleh detect(). */
  careersUrl?: string;
  /** URL API eksplisit (mis. boards-api Greenhouse). */
  api?: string;
  /** Provider id eksplisit — melewati detect(). */
  provider?: string;
  /** Region informasional dari registry. */
  region?: string | null;
}

export interface FetchOptions {
  timeoutMs?: number;
  headers?: Record<string, string>;
  redirect?: RequestRedirect;
}

export interface HttpCtx {
  fetchJson: (url: string, opts?: FetchOptions) => Promise<unknown>;
}

export interface DetectHit {
  url: string;
}

export interface Provider {
  /** Unik di antara semua provider yang terdaftar. */
  id: string;
  /** Auto-deteksi dari entry; kembalikan null kalau bukan miliknya. */
  detect(entry: PortalEntry): DetectHit | null;
  /** Tarik daftar lowongan. Wajib diimplementasikan. */
  fetch(entry: PortalEntry, ctx: HttpCtx): Promise<RawListing[]>;
}
