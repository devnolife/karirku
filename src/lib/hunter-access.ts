import { auth, type SessionUser } from "@/lib/auth";
import {
  FEATURE_HUNTER_AUTO_APPLY,
  hasEntitlement,
} from "@/lib/entitlements";

export type HunterAccessOptions = {
  /** Aksi yang menjalankan otomasi atau mengirim lamaran sungguhan. */
  requireAutoApply?: boolean;
};

export type HunterAccessResult =
  | { ok: true; user: SessionUser; userId: string }
  | { ok: false; response: Response };

/**
 * Kebijakan akses Hunter.
 *
 * Dulu Hunter adalah alat satu-operator: seluruh datanya global, sehingga
 * satu-satunya cara mengamankannya adalah mengunci ke satu email pemilik.
 * Sejak tabel hunter ber-scope `userId`, isolasi dijamin oleh query — tiap
 * pemanggil hanya menyentuh barisnya sendiri.
 *
 * Yang tersisa dijaga adalah aksi yang memakai sumber daya bersama dan
 * berdampak ke dunia luar: menjalankan mesin otomasi dan mengirim lamaran.
 * Itu tetap di balik entitlement.
 */
export function hunterAccessStatus(
  user: Pick<SessionUser, "role"> | null,
  options: HunterAccessOptions = {},
  hasAutoApply = false,
): 200 | 401 | 403 {
  if (!user) return 401;
  if (options.requireAutoApply && !hasAutoApply) return 403;
  return 200;
}

/** Autentikasi + otorisasi satu request Hunter, sekaligus memberi `userId` untuk scoping. */
export async function authorizeHunterApi(
  options: HunterAccessOptions = {},
): Promise<HunterAccessResult> {
  const session = await auth();
  const user = session?.user ?? null;

  const autoApply =
    user && options.requireAutoApply
      ? await hasEntitlement(user.id, FEATURE_HUNTER_AUTO_APPLY)
      : false;
  const status = hunterAccessStatus(user, options, autoApply);

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
    return {
      ok: false,
      response: Response.json(
        {
          error: "forbidden",
          message: "Entitlement Hunter Auto-Apply belum aktif.",
        },
        { status },
      ),
    };
  }

  const authed = user as SessionUser;
  return { ok: true, user: authed, userId: authed.id };
}
