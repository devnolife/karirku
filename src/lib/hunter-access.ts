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
 * Pure policy used by the API guard and unit tests.
 * Hunter is intentionally a single-operator, admin-only tool.
 */
export function hunterAccessStatus(
  user: Pick<SessionUser, "role"> | null,
  options: HunterAccessOptions = {},
  hasAutoApply = false,
): 200 | 401 | 403 {
  if (!user) return 401;
  if (user.role !== "admin") return 403;
  if (options.requireAutoApply && !hasAutoApply) return 403;
  return 200;
}

/** Authenticate and authorize one Hunter API request. */
export async function authorizeHunterApi(
  options: HunterAccessOptions = {},
): Promise<HunterAccessResult> {
  const session = await auth();
  const user = session?.user ?? null;
  const autoApply =
    user?.role === "admin" && options.requireAutoApply
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
    const message =
      options.requireAutoApply && user?.role === "admin"
        ? "Entitlement Hunter Auto-Apply belum aktif."
        : "Hunter hanya dapat diakses admin.";
    return {
      ok: false,
      response: Response.json({ error: "forbidden", message }, { status }),
    };
  }

  return { ok: true, user: user as SessionUser };
}
