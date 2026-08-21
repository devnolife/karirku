import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hunter engine loads better-sqlite3 (native addon) at runtime.
  // Izinkan akses dev resources (HMR, streaming chunk) dari origin selain
  // localhost: IP jaringan lokal + host port-forward / tunnel VS Code & Codespaces.
  // Tanpa ini, buka app lewat origin lain bikin chunk gagal load → error boundary.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "10.33.33.11",
    "*.devtunnels.ms",
    "*.app.github.dev",
    "*.githubpreview.dev",
  ],
  // Skip type-checking during `next build` to save RAM/time.
  // Run `npm run typecheck` separately instead.
  typescript: {
    ignoreBuildErrors: true,
  },
  // Next.js 16 uses Turbopack by default. The engine is a workspace package
  // (packages/core), so it resolves inside this directory — the inferred root
  // is correct and needs no widening.
  turbopack: {
    root: import.meta.dirname,
  },
  experimental: {
    serverActions: {
      // Asisten Lamar mengirim data URL gambar (sudah dikecilkan) ke server action.
      bodySizeLimit: "8mb",
      // Izinkan Server Action saat app diakses lewat port-forward / tunnel VS Code
      // (di balik proxy, header Host bisa beda dengan Origin → default-nya diblok).
      allowedOrigins: [
        "localhost:3030",
        "127.0.0.1:3030",
        "10.33.33.11:3030",
        "*.devtunnels.ms",
        "*.app.github.dev",
        "*.githubpreview.dev",
      ],
    },
  },
};

export default nextConfig;
