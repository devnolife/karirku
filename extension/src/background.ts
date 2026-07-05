/**
 * Background service worker — satu-satunya komponen yang bicara ke API
 * karirku. Token disimpan di chrome.storage.local; fetch memakai
 * host_permissions sehingga bebas CORS.
 */

import {
  DEFAULT_API_BASE,
  STORAGE_KEYS,
  type BgRequest,
  type BgResponse,
  type MapResult,
} from "./shared";

async function getStorage(): Promise<{
  token: string | null;
  apiBase: string;
  enabled: boolean;
  user: { id: string; name?: string; email?: string } | null;
}> {
  const raw = await chrome.storage.local.get([
    STORAGE_KEYS.token,
    STORAGE_KEYS.apiBase,
    STORAGE_KEYS.enabled,
    STORAGE_KEYS.user,
  ]);
  return {
    token: (raw[STORAGE_KEYS.token] as string | undefined) ?? null,
    apiBase: (raw[STORAGE_KEYS.apiBase] as string | undefined) ?? DEFAULT_API_BASE,
    enabled: (raw[STORAGE_KEYS.enabled] as boolean | undefined) ?? true,
    user: (raw[STORAGE_KEYS.user] as { id: string } | undefined) ?? null,
  };
}

/** Login: tukar cookie sesi karirku (sudah login di browser) → token. */
async function connect(): Promise<BgResponse> {
  const { apiBase } = await getStorage();
  try {
    const res = await fetch(`${apiBase}/api/autofill/token`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      return {
        ok: false,
        error: body?.message ?? `Gagal menghubungkan (HTTP ${res.status}). Login dulu di ${apiBase}`,
      };
    }
    const data = (await res.json()) as {
      token: string;
      user: { id: string; name?: string; email?: string };
    };
    await chrome.storage.local.set({
      [STORAGE_KEYS.token]: data.token,
      [STORAGE_KEYS.user]: data.user,
    });
    return { ok: true, data: { user: data.user } };
  } catch (err) {
    return {
      ok: false,
      error: `Tidak bisa mengakses server karirku: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function apiFetch<T>(path: string, body: unknown): Promise<BgResponse<T>> {
  const { token, apiBase } = await getStorage();
  if (!token) return { ok: false, error: "Belum terhubung ke karirku. Buka popup extension → Hubungkan." };
  try {
    const res = await fetch(`${apiBase}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      await chrome.storage.local.remove([STORAGE_KEYS.token, STORAGE_KEYS.user]);
      return { ok: false, error: "Sesi kedaluwarsa — hubungkan ulang lewat popup extension." };
    }
    if (!res.ok) {
      const err = (await res.json().catch(() => null)) as { message?: string } | null;
      return { ok: false, error: err?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, data: (await res.json()) as T };
  } catch (err) {
    return {
      ok: false,
      error: `Request gagal: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

chrome.runtime.onMessage.addListener((msg: BgRequest, _sender, sendResponse) => {
  (async (): Promise<BgResponse> => {
    switch (msg.kind) {
      case "CONNECT":
        return connect();
      case "GET_STATUS": {
        const { token, user, enabled, apiBase } = await getStorage();
        return { ok: true, data: { connected: Boolean(token), user, enabled, apiBase } };
      }
      case "MAP_FORM":
        return apiFetch<MapResult>("/api/autofill/map", msg.snapshot);
      case "REPORT":
        return apiFetch("/api/autofill/report", msg.payload);
      default:
        return { ok: false, error: "Pesan tidak dikenal" };
    }
  })().then(sendResponse);
  return true; // async response
});
