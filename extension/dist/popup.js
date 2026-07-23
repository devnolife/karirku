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

  // extension/src/popup.ts
  var statusEl = document.getElementById("status");
  var connectBtn = document.getElementById("connect");
  var disconnectBtn = document.getElementById("disconnect");
  var enabledEl = document.getElementById("enabled");
  var apiBaseEl = document.getElementById("apiBase");
  function sendBg(msg) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        msg,
        (res) => resolve(res ?? { ok: false, error: "Tidak ada respons" })
      );
    });
  }
  async function refresh() {
    const res = await sendBg({ kind: "GET_STATUS" });
    if (!res.ok) {
      statusEl.textContent = `Error: ${res.error}`;
      return;
    }
    const { connected, user, enabled, apiBase } = res.data;
    enabledEl.checked = enabled;
    apiBaseEl.value = apiBase;
    if (connected && user) {
      statusEl.textContent = `\u2705 Terhubung sebagai ${user.name ?? user.email ?? "user"}`;
      connectBtn.textContent = "Hubungkan ulang";
      disconnectBtn.hidden = false;
    } else {
      statusEl.textContent = "\u2B1C Belum terhubung. Login di karirku, lalu klik Hubungkan.";
      connectBtn.textContent = "Hubungkan ke Karirku";
      disconnectBtn.hidden = true;
    }
  }
  connectBtn.addEventListener("click", async () => {
    connectBtn.disabled = true;
    statusEl.textContent = "Menghubungkan\u2026";
    const base = apiBaseEl.value.trim() || DEFAULT_API_BASE;
    await chrome.storage.local.set({ [STORAGE_KEYS.apiBase]: base });
    const res = await sendBg({ kind: "CONNECT" });
    if (!res.ok) statusEl.textContent = `\u274C ${res.error}`;
    else await refresh();
    connectBtn.disabled = false;
  });
  disconnectBtn.addEventListener("click", async () => {
    disconnectBtn.disabled = true;
    statusEl.textContent = "Memutuskan koneksi\u2026";
    const res = await sendBg({ kind: "DISCONNECT" });
    if (!res.ok) statusEl.textContent = `\u274C ${res.error}`;
    else await refresh();
    disconnectBtn.disabled = false;
  });
  enabledEl.addEventListener("change", async () => {
    await chrome.storage.local.set({ [STORAGE_KEYS.enabled]: enabledEl.checked });
  });
  apiBaseEl.addEventListener("change", async () => {
    await chrome.storage.local.set({
      [STORAGE_KEYS.apiBase]: apiBaseEl.value.trim() || DEFAULT_API_BASE
    });
  });
  void refresh();
})();
