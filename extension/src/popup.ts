/**
 * Popup — status koneksi, tombol Hubungkan, toggle on/off, konfigurasi
 * URL server (dev: localhost, prod: domain karirku).
 */

import {
  DEFAULT_API_BASE,
  STORAGE_KEYS,
  type BgRequest,
  type BgResponse,
} from "./shared";

const statusEl = document.getElementById("status") as HTMLDivElement;
const connectBtn = document.getElementById("connect") as HTMLButtonElement;
const enabledEl = document.getElementById("enabled") as HTMLInputElement;
const apiBaseEl = document.getElementById("apiBase") as HTMLInputElement;

function sendBg<T>(msg: BgRequest): Promise<BgResponse<T>> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(msg, (res: BgResponse<T>) =>
      resolve(res ?? { ok: false, error: "Tidak ada respons" }),
    );
  });
}

interface Status {
  connected: boolean;
  user: { name?: string; email?: string } | null;
  enabled: boolean;
  apiBase: string;
}

async function refresh(): Promise<void> {
  const res = await sendBg<Status>({ kind: "GET_STATUS" });
  if (!res.ok) {
    statusEl.textContent = `Error: ${res.error}`;
    return;
  }
  const { connected, user, enabled, apiBase } = res.data;
  enabledEl.checked = enabled;
  apiBaseEl.value = apiBase;
  if (connected && user) {
    statusEl.textContent = `✅ Terhubung sebagai ${user.name ?? user.email ?? "user"}`;
    connectBtn.textContent = "Hubungkan ulang";
  } else {
    statusEl.textContent = "⬜ Belum terhubung. Login di karirku, lalu klik Hubungkan.";
    connectBtn.textContent = "Hubungkan ke Karirku";
  }
}

connectBtn.addEventListener("click", async () => {
  connectBtn.disabled = true;
  statusEl.textContent = "Menghubungkan…";
  const base = apiBaseEl.value.trim() || DEFAULT_API_BASE;
  await chrome.storage.local.set({ [STORAGE_KEYS.apiBase]: base });
  const res = await sendBg({ kind: "CONNECT" });
  if (!res.ok) statusEl.textContent = `❌ ${res.error}`;
  else await refresh();
  connectBtn.disabled = false;
});

enabledEl.addEventListener("change", async () => {
  await chrome.storage.local.set({ [STORAGE_KEYS.enabled]: enabledEl.checked });
});

apiBaseEl.addEventListener("change", async () => {
  await chrome.storage.local.set({
    [STORAGE_KEYS.apiBase]: apiBaseEl.value.trim() || DEFAULT_API_BASE,
  });
});

void refresh();
