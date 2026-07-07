"use strict";
(() => {
  // extension/src/shared.ts
  var STORAGE_KEYS = {
    token: "kai_token",
    apiBase: "kai_api_base",
    enabled: "kai_enabled",
    user: "kai_user"
  };
  var DEFAULT_API_BASE = "http://localhost:3000";

  // extension/src/background.ts
  async function getStorage() {
    const raw = await chrome.storage.local.get([
      STORAGE_KEYS.token,
      STORAGE_KEYS.apiBase,
      STORAGE_KEYS.enabled,
      STORAGE_KEYS.user
    ]);
    return {
      token: raw[STORAGE_KEYS.token] ?? null,
      apiBase: raw[STORAGE_KEYS.apiBase] ?? DEFAULT_API_BASE,
      enabled: raw[STORAGE_KEYS.enabled] ?? true,
      user: raw[STORAGE_KEYS.user] ?? null
    };
  }
  async function connect() {
    const { apiBase } = await getStorage();
    try {
      const res = await fetch(`${apiBase}/api/autofill/token`, {
        method: "POST",
        credentials: "include"
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        return {
          ok: false,
          error: body?.message ?? `Gagal menghubungkan (HTTP ${res.status}). Login dulu di ${apiBase}`
        };
      }
      const data = await res.json();
      await chrome.storage.local.set({
        [STORAGE_KEYS.token]: data.token,
        [STORAGE_KEYS.user]: data.user
      });
      return { ok: true, data: { user: data.user } };
    } catch (err) {
      return {
        ok: false,
        error: `Tidak bisa mengakses server karirku: ${err instanceof Error ? err.message : String(err)}`
      };
    }
  }
  async function apiFetch(path, body) {
    const { token, apiBase } = await getStorage();
    if (!token) return { ok: false, error: "Belum terhubung ke karirku. Buka popup extension \u2192 Hubungkan." };
    try {
      const res = await fetch(`${apiBase}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (res.status === 401) {
        await chrome.storage.local.remove([STORAGE_KEYS.token, STORAGE_KEYS.user]);
        return { ok: false, error: "Sesi kedaluwarsa \u2014 hubungkan ulang lewat popup extension." };
      }
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        return { ok: false, error: err?.message ?? `HTTP ${res.status}` };
      }
      return { ok: true, data: await res.json() };
    } catch (err) {
      return {
        ok: false,
        error: `Request gagal: ${err instanceof Error ? err.message : String(err)}`
      };
    }
  }
  async function fetchResumeFile() {
    const { token, apiBase } = await getStorage();
    if (!token) return { ok: false, error: "Belum terhubung ke karirku." };
    try {
      const res = await fetch(`${apiBase}/api/autofill/resume/file`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 404) return { ok: false, error: "Belum ada file CV \u2014 upload di halaman profil karirku." };
      if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
      const mimeType = res.headers.get("Content-Type") ?? "application/pdf";
      const fileName = decodeURIComponent(res.headers.get("X-File-Name") ?? "cv.pdf");
      const buf = await res.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(buf);
      const CHUNK = 32768;
      for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
      }
      return { ok: true, data: { fileName, mimeType, base64: btoa(binary) } };
    } catch (err) {
      return { ok: false, error: `Gagal mengambil CV: ${err instanceof Error ? err.message : String(err)}` };
    }
  }
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    (async () => {
      switch (msg.kind) {
        case "CONNECT":
          return connect();
        case "GET_STATUS": {
          const { token, user, enabled, apiBase } = await getStorage();
          return { ok: true, data: { connected: Boolean(token), user, enabled, apiBase } };
        }
        case "MAP_FORM":
          return apiFetch("/api/autofill/map", msg.snapshot);
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
    return true;
  });
})();
