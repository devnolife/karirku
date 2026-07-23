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
  type ResumeFilePayload,
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

/** Revoke token di server, lalu hapus kredensial lokal extension. */
async function disconnect(): Promise<BgResponse> {
  const { token, apiBase } = await getStorage();
  if (!token) {
    await chrome.storage.local.remove([STORAGE_KEYS.token, STORAGE_KEYS.user]);
    return { ok: true, data: { revoked: 0 } };
  }
  try {
    const res = await fetch(`${apiBase}/api/autofill/token`, {
      method: "DELETE",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as
        | { message?: string }
        | null;
      return {
        ok: false,
        error: body?.message ?? `Gagal memutus koneksi (HTTP ${res.status}).`,
      };
    }
    await chrome.storage.local.remove([STORAGE_KEYS.token, STORAGE_KEYS.user]);
    return { ok: true, data: await res.json() };
  } catch (err) {
    return {
      ok: false,
      error: `Tidak dapat merevoke token: ${err instanceof Error ? err.message : String(err)}`,
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

/** Ambil file CV user dari server sebagai base64 (untuk injeksi input file). */
async function fetchResumeFile(): Promise<BgResponse<ResumeFilePayload>> {
  const { token, apiBase } = await getStorage();
  if (!token) return { ok: false, error: "Belum terhubung ke karirku." };
  try {
    const res = await fetch(`${apiBase}/api/autofill/resume/file`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 404) return { ok: false, error: "Belum ada file CV — upload di halaman profil karirku." };
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const mimeType = res.headers.get("Content-Type") ?? "application/pdf";
    const fileName = decodeURIComponent(res.headers.get("X-File-Name") ?? "cv.pdf");
    const buf = await res.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    return { ok: true, data: { fileName, mimeType, base64: btoa(binary) } };
  } catch (err) {
    return { ok: false, error: `Gagal mengambil CV: ${err instanceof Error ? err.message : String(err)}` };
  }
}

chrome.runtime.onMessage.addListener((msg: BgRequest, _sender, sendResponse) => {
  (async (): Promise<BgResponse> => {
    switch (msg.kind) {
      case "CONNECT":
        return connect();
      case "DISCONNECT":
        return disconnect();
      case "GET_STATUS": {
        const { token, user, enabled, apiBase } = await getStorage();
        return { ok: true, data: { connected: Boolean(token), user, enabled, apiBase } };
      }
      case "MAP_FORM":
        return apiFetch<MapResult>("/api/autofill/map", msg.snapshot);
      case "REPORT":
        return apiFetch("/api/autofill/report", msg.payload);
      case "GET_RESUME_FILE":
        return fetchResumeFile();
      case "SAVE_ANSWERS":
        return apiFetch("/api/autofill/answers", { answers: msg.answers });
      default:
        return { ok: false, error: "Pesan tidak dikenal" };
    }
  })().then(sendResponse);
  return true; // async response
});
