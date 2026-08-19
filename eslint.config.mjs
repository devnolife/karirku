import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Architecture boundary: the workspace root is the Next.js app only. The
  // engine (LLM, OCR, matching, scraper, queues, workers, data access) lives
  // in packages/core and is consumed as @devnolife/karirku-core.
  //
  // Reach for it through its published subpaths only — never through dist/,
  // src/, or generated/. Those are implementation details that can move
  // between releases without a major version bump.
  {
    files: ["src/**/*.{ts,tsx}", "tests/**/*.ts", "scripts/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@devnolife/karirku-core/dist",
                "@devnolife/karirku-core/dist/*",
                "@devnolife/karirku-core/src",
                "@devnolife/karirku-core/src/*",
                "@devnolife/karirku-core/generated",
                "@devnolife/karirku-core/generated/*",
                "@devnolife/karirku-core/hunter/*",
              ],
              message:
                "Import karirku-core through its public subpaths (e.g. @devnolife/karirku-core/db), not its internals.",
            },
            {
              group: ["@prisma/client", "@prisma/client/*", ".prisma/*"],
              message:
                "The database is owned by karirku-core. Use @devnolife/karirku-core/db for the client and @devnolife/karirku-core/prisma for its types, so only one PrismaClient instance ever exists.",
            },
            {
              group: ["@/core", "@/core/*"],
              message:
                "src/core no longer exists — it was extracted into @devnolife/karirku-core.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // packages/core ships its own flat config; `pnpm core:lint` runs it.
    "packages/**",
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
