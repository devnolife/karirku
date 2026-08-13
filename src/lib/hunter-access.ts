import { auth, type SessionUser } from "@/lib/auth";
import {
  FEATURE_HUNTER_AUTO_APPLY,
  hasEntitlement,
} from "@/lib/entitlements";

export type HunterAccessOptions = {
  requireAutoApply?: boolean;
};

export type HunterAccessResult =
  | { ok: true; user: SessionUser }
  | { ok: false; response: Response };

/**
 * Email pemilik Hunter, atau null bila belum dikonfigurasi.
 *
 * Dibaca dari `process.env` saat dipanggil, bukan di-cache saat modul dimuat,
 * agar validasi env terpusat (`assertWebEnv`) tetap satu-satunya sumber
 * kebenaran soal bentuk nilainya.
 */
export function hunterOwnerEmail(): string | null {
  const raw = process.env.HUNTER_OWNER_EMAIL?.trim().toLowerCase();
  return raw ? raw : null;
}

/**
 * Hunter bukan fitur multi-user: profil kandidat, cover letter, jawaban
 * screening, dan sesi browser yang dipakainya milik satu orang, dan datanya
 * berisi riwayat lamaran serta email pribadi. Karena itu `role=admin` saja
 * tidak cukup — admin lain tidak boleh ikut membacanya.
 *
 * Tanpa `HUNTER_OWNER_EMAIL`, kebijakan jatuh kembali ke admin-only. Ini
 * disengaja: memaksa env baru akan mengunci pemilik keluar dari alatnya sendiri
 * saat deploy, dan itu kegagalan yang lebih buruk daripada mempertahankan
 * perilaku lama pada instalasi satu-admin.
 */
export function isHunterOwner(
  email: string | null | undefined,
  owner: string | null = hunterOwnerEmail(),
): boolean {
  if (!owner) return true;
  return typeof email === "string" && email.toLowerCase() === owner;
}

/**
 * Pure policy used by the API guard and unit tests.
 * Hunter is intentionally a single-operator tool.
 */
export function hunterAccessStatus(
  user: Pick<SessionUser, "role"> & { email?: string | null } | null,
  options: HunterAccessOptions = {},
  hasAutoApply = false,
  owner: string | null = hunterOwnerEmail(),
): 200 | 401 | 403 {
  if (!user) return 401;
  if (user.role !== "admin") return 403;
  if (!isHunterOwner(user.email, owner)) return 403;
  if (options.requireAutoApply && !hasAutoApply) return 403;
  return 200;
}

/** Authenticate and authorize one Hunter API request. */
export async function authorizeHunterApi(
  options: HunterAccessOptions = {},
): Promise<HunterAccessResult> {
  const session = await auth();
  const user = session?.user ?? null;
  const owner = hunterOwnerEmail();
  const allowed = user?.role === "admin" && isHunterOwner(user.email, owner);
  const autoApply =
    allowed && options.requireAutoApply
      ? await hasEntitlement(user.id, FEATURE_HUNTER_AUTO_APPLY)
      : false;
  const status = hunterAccessStatus(user, options, autoApply, owner);

  if (status === 401) {
    return {
      ok: false,
      response: Response.json(
        { error: "unauthorized", message: "Login diperlukan." },
        { status },
      ),
    };
  }
  if (status === 403) {
    const message = !allowed
      ? "Hunter adalah alat pribadi pemilik instance ini."
      : "Entitlement Hunter Auto-Apply belum aktif.";
    return {
      ok: false,
      response: Response.json({ error: "forbidden", message }, { status }),
    };
  }

  return { ok: true, user: user as SessionUser };
}
