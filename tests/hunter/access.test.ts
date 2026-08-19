// Access control for the Hunter API surface. The engine itself (arg
// allowlisting, process locking) is tested in packages/core.
import { test } from "node:test";
import assert from "node:assert/strict";

import { hunterAccessStatus } from "@/lib/hunter-access";

test("Hunter access hanya mengizinkan admin", () => {
  assert.equal(hunterAccessStatus(null), 401);
  assert.equal(hunterAccessStatus({ role: "jobseeker" }), 403);
  assert.equal(hunterAccessStatus({ role: "freelancer" }), 403);
  assert.equal(hunterAccessStatus({ role: "company" }), 403);
  assert.equal(hunterAccessStatus({ role: "admin" }), 200);
});

test("auto-apply admin tetap memerlukan entitlement", () => {
  assert.equal(
    hunterAccessStatus({ role: "admin" }, { requireAutoApply: true }, false),
    403,
  );
  assert.equal(
    hunterAccessStatus({ role: "admin" }, { requireAutoApply: true }, true),
    200,
  );
});
