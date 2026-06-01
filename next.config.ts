import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabling typescript and eslint checks during next build to save RAM
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Experimental options to reduce memory usage
  experimental: {
    // Disable separate Webpack worker to save memory (reduces processes & duplicate V8 instances)
    webpackBuildWorker: false,
  },
  webpack: (config, { dev, isServer }) => {
    // Optimizations for development mode to reduce memory footprint
    if (dev) {
      // Exclude heavy/non-Next.js folders from being watched
      config.watchOptions = {
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/.next/**",
          "**/career-ops/**",
          "**/data/**",
          "**/reports/**",
        ],
      };

      // Limit memory caching in Webpack
      if (config.cache && typeof config.cache === "object") {
        config.cache.maxGenerations = 1;
      }
    }
    return config;
  },
};

export default nextConfig;
