/**
 * Build extension → extension/dist (esbuild).
 * Jalankan: pnpm ext:build
 * Load di Chrome: chrome://extensions → Load unpacked → extension/dist
 */

import { build } from "esbuild";
import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "dist");

mkdirSync(dist, { recursive: true });

await build({
  entryPoints: [
    join(root, "src/background.ts"),
    join(root, "src/content.ts"),
    join(root, "src/popup.ts"),
  ],
  outdir: dist,
  bundle: true,
  format: "iife",
  target: "chrome110",
  minify: process.argv.includes("--minify"),
  logLevel: "info",
});

cpSync(join(root, "manifest.json"), join(dist, "manifest.json"));
cpSync(join(root, "popup.html"), join(dist, "popup.html"));

console.log(`[ext] build selesai → ${dist}`);
