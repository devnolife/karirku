/**
 * Runs once per server process, before the first request is handled.
 *
 * The only job here is to validate configuration. Booting with a missing
 * secret is a deployment mistake, and it is far cheaper to catch it as a crash
 * loop the operator sees immediately than as a 500 a user hits later.
 */
export async function register() {
  // The edge runtime has no access to most of these variables and cannot load
  // the engine at all — validation belongs to the Node.js server process.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // `next build` boots a server to prerender pages. Runtime secrets are not
  // available then (and should not be baked into an image), so validating there
  // would fail every CI build for the wrong reason.
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { assertWebEnv } = await import("./lib/env");
  await assertWebEnv();
}
