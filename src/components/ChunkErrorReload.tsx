"use client";

import { useEffect } from "react";

/**
 * Self-heal untuk stale chunk.
 *
 * Di App Router, konten route dimuat lewat chunk JS terpisah. Kalau tab
 * dibuka lama lalu server dev/prod merecompile (hash chunk berubah), navigasi
 * client ke route yang belum ter-load bisa gagal fetch chunk → halaman blank
 * (mis. /dashboard cuma menampilkan skeleton selamanya) sementara halaman
 * statis awal tetap tampil. Handler ini mendeteksi ChunkLoadError lalu reload
 * sekali untuk mengambil chunk terbaru.
 *
 * Guard: maksimal satu reload per 10 detik (via sessionStorage) supaya tidak
 * pernah loop kalau chunk memang benar-benar hilang.
 */
const RELOAD_KEY = "cw:chunk-reload-at";
const RELOAD_WINDOW_MS = 10_000;

const CHUNK_ERROR_PATTERNS = [
  "ChunkLoadError",
  "Loading chunk",
  "Loading CSS chunk",
  "Failed to fetch dynamically imported module",
  "error loading dynamically imported module",
  "Importing a module script failed",
];

function isChunkError(message: unknown): boolean {
  if (typeof message !== "string") return false;
  return CHUNK_ERROR_PATTERNS.some((p) => message.includes(p));
}

function reloadOnce(): void {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? "0");
    if (Date.now() - last < RELOAD_WINDOW_MS) return; // sudah baru reload → jangan loop
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // sessionStorage bisa diblokir; tetap coba reload sekali.
  }
  window.location.reload();
}

/** Cek apakah <script>/<link> yang gagal load adalah chunk Next.js. */
function isNextChunkAsset(target: EventTarget | null): boolean {
  const el = target as (HTMLScriptElement & HTMLLinkElement) | null;
  const url = el?.src || el?.href || "";
  return typeof url === "string" && url.includes("/_next/static/");
}

export function ChunkErrorReload() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      // Resource load gagal (mis. <script> chunk 404 saat full load): tidak
      // bubble & message-nya kosong, jadi cek elemen target-nya langsung.
      if (event.target && event.target !== window && isNextChunkAsset(event.target)) {
        reloadOnce();
        return;
      }
      const err = event.error as { name?: string; message?: string } | undefined;
      if (isChunkError(err?.name) || isChunkError(err?.message) || isChunkError(event.message)) {
        reloadOnce();
      }
    }

    function onRejection(event: PromiseRejectionEvent) {
      const reason = event.reason as { name?: string; message?: string } | string | undefined;
      if (typeof reason === "string") {
        if (isChunkError(reason)) reloadOnce();
        return;
      }
      if (isChunkError(reason?.name) || isChunkError(reason?.message)) {
        reloadOnce();
      }
    }

    // capture:true wajib untuk menangkap error load resource (script/link).
    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
