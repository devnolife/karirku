import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip type-checking during `next build` to save RAM/time.
  // Run `npm run typecheck` separately instead.
  typescript: {
    ignoreBuildErrors: true,
  },
  // Next.js 16 uses Turbopack by default. Setting an explicit (empty)
  // turbopack config silences the webpack/turbopack mismatch warning
  // and keeps the dev server lean.
  turbopack: {},
};

export default nextConfig;
