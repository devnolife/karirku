import { test } from "node:test";
import assert from "node:assert/strict";

import { matchRoute, routes } from "../../src/server/routes.js";

test("health is the only route reachable without a key", () => {
  const open = routes.filter((r) => r.open).map((r) => `${r.method} ${r.pattern}`);
  assert.deepEqual(open, ["GET /health"]);
});

test("static routes match exactly", () => {
  const matched = matchRoute("GET", "/api/status");
  assert.ok(matched && !("methodMismatch" in matched));
  assert.equal(matched.route.pattern, "/api/status");
  assert.deepEqual(matched.params, {});
});

test("dynamic segments are captured and decoded", () => {
  const matched = matchRoute("GET", "/api/jobs/scraper/job%20-1");
  assert.ok(matched && !("methodMismatch" in matched));
  assert.deepEqual(matched.params, { queue: "scraper", id: "job -1" });
});

test("segment count must line up", () => {
  assert.equal(matchRoute("GET", "/api/jobs/scraper"), null);
  assert.equal(matchRoute("GET", "/api/jobs/scraper/1/extra"), null);
});

test("a known path with the wrong verb reports a method mismatch", () => {
  const result = matchRoute("GET", "/api/jobs/scan");
  assert.deepEqual(result, { methodMismatch: true });
});

test("unknown paths do not match", () => {
  assert.equal(matchRoute("GET", "/nope"), null);
  assert.equal(matchRoute("GET", "/"), null);
});

test("trailing slashes are tolerated", () => {
  const matched = matchRoute("GET", "/api/status/");
  assert.ok(matched && !("methodMismatch" in matched));
});

test("a dynamic route cannot shadow the static route above it", () => {
  // "/api/jobs/scan" is POST-only and 3 segments; "/api/jobs/:queue/:id" is 4.
  // A GET to the 4-segment form must reach the job lookup, not the scan route.
  const matched = matchRoute("GET", "/api/jobs/scan/123");
  assert.ok(matched && !("methodMismatch" in matched));
  assert.equal(matched.route.pattern, "/api/jobs/:queue/:id");
});
