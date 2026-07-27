/**
 * Entrypoint for `pnpm serve`. Loads .env then starts the control API.
 */
import { config as loadEnv } from "dotenv";

// quiet: stdout carries structured JSON logs; the dotenv banner would corrupt
// anything parsing them.
loadEnv({ path: ".env", quiet: true });
loadEnv({ path: ".env.local", override: true, quiet: true });

const { startControlServer } = await import("./index.js");

startControlServer().catch((err: unknown) => {
  console.error(`✖ control api gagal start: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
