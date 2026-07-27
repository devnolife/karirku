import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

const PROJECT_ROOT = import.meta.dirname;

/**
 * The engine lives in a separate repo (@devnolife/karirku-core). Installed from
 * the registry it sits inside node_modules and Turbopack resolves it normally.
 * While developing both repos together it is linked from a sibling checkout,
 * so its real path falls outside this directory — and Turbopack refuses to
 * resolve past its inferred root. Widen the root only in that case, so a
 * production build never reaches outside the project.
 */
function turbopackRoot(): string {
  const linked = path.join(PROJECT_ROOT, "node_modules", "@devnolife", "karirku-core");
  try {
    const real = fs.realpathSync(linked);
    if (!real.startsWith(PROJECT_ROOT + path.sep)) {
      return path.dirname(PROJECT_ROOT);
    }
  } catch {
    // Not installed yet — fall through to the default.
  }
  return PROJECT_ROOT;
}

const nextConfig: NextConfig = {
  // Hunter engine loads better-sqlite3 (native addon) at runtime.
  serverExternalPackages: ["better-sqlite3"],
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
  // Next.js 16 uses Turbopack by default.
  turbopack: {
    root: turbopackRoot(),
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
