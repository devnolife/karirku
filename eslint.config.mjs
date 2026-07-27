import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Hunter is intentionally executable CommonJS so it can run directly with
  // `node hunter/run.js` without the Next.js/TypeScript build pipeline.
  {
    files: ["hunter/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Architecture boundary: the project is split in two halves.
  //
  //   src/core/**  — engine: LLM, OCR, matching, scraper, queue, workers, data
  //                  access. Runtime-agnostic Node code, runs without Next.js.
  //   everything   — the Next.js fullstack app: src/app, src/components,
  //   else           src/server/{actions,queries,services}, src/lib (web glue).
  //
  // Dependencies may only point web → core, never the other way around. Keeping
  // this one-way lets the engine be type-checked and run standalone
  // (`pnpm typecheck:core`, `pnpm worker`).
  {
    files: ["src/core/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "next",
                "next/*",
                "react",
                "react/*",
                "react-dom",
                "react-dom/*",
                "server-only",
                "@/app",
                "@/app/*",
                "@/components",
                "@/components/*",
                "@/server",
                "@/server/*",
                "@/lib",
                "@/lib/*",
              ],
              message:
                "src/core must not depend on the Next.js layer. Move shared logic into src/core, or invert the dependency so the web layer calls core.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
