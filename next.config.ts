import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hunter engine loads better-sqlite3 (native addon) at runtime.
  serverExternalPackages: ["better-sqlite3"],
  // Izinkan akses dev resources dari IP jaringan lokal (HMR, streaming chunk).
  allowedDevOrigins: ["10.33.33.11"],
  // Skip type-checking during `next build` to save RAM/time.
  // Run `npm run typecheck` separately instead.
  typescript: {
    ignoreBuildErrors: true,
  },
  // Next.js 16 uses Turbopack by default. Setting an explicit (empty)
  // turbopack config silences the webpack/turbopack mismatch warning
  // and keeps the dev server lean.
  turbopack: {},
  experimental: {
    // Asisten Lamar mengirim data URL gambar (sudah dikecilkan) ke server action.
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
