import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "generated/**", "node_modules/**", "hunter/**", "tools/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    rules: {
      // The whole point of this package: it must stay framework-agnostic.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "next", message: "karirku-core must stay framework-agnostic." },
            { name: "react", message: "karirku-core must stay framework-agnostic." },
            { name: "react-dom", message: "karirku-core must stay framework-agnostic." },
            { name: "server-only", message: "karirku-core must stay framework-agnostic." },
            {
              name: "@prisma/client",
              message: "Import the generated client instead (../generated/prisma/index.js).",
            },
          ],
          patterns: [
            { group: ["next/*"], message: "karirku-core must stay framework-agnostic." },
            { group: ["react/*"], message: "karirku-core must stay framework-agnostic." },
          ],
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["tests/**/*.ts", "scripts/**/*.ts", "prisma/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
