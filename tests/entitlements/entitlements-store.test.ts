import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyGrant,
  applyRevoke,
  checkEntitlement,
  type MockEntitlementMap,
} from "@/lib/mock/entitlements-store";

const FEATURE = "hunter_auto_apply";

test("checkEntitlement: user tanpa entry apa pun → false", () => {
  const map: MockEntitlementMap = {};
  assert.equal(checkEntitlement(map, "u1", FEATURE), false);
});

test("applyGrant → checkEntitlement true untuk user & feature yang di-grant", () => {
  let map: MockEntitlementMap = {};
  map = applyGrant(map, "u1", FEATURE);
  assert.equal(checkEntitlement(map, "u1", FEATURE), true);
});

test("applyGrant tidak memengaruhi user lain", () => {
  let map: MockEntitlementMap = {};
  map = applyGrant(map, "u1", FEATURE);
  assert.equal(checkEntitlement(map, "u2", FEATURE), false);
});

test("applyGrant idempotent (grant dua kali tidak duplikat)", () => {
  let map: MockEntitlementMap = {};
  map = applyGrant(map, "u1", FEATURE);
  map = applyGrant(map, "u1", FEATURE);
  assert.deepEqual(map["u1"], [FEATURE]);
});

test("applyRevoke → checkEntitlement false setelah di-revoke", () => {
  let map: MockEntitlementMap = {};
  map = applyGrant(map, "u1", FEATURE);
  map = applyRevoke(map, "u1", FEATURE);
  assert.equal(checkEntitlement(map, "u1", FEATURE), false);
});

test("applyRevoke pada user/feature yang belum ada → aman, tidak throw", () => {
  const map: MockEntitlementMap = {};
  const next = applyRevoke(map, "u-tidak-ada", FEATURE);
  assert.equal(checkEntitlement(next, "u-tidak-ada", FEATURE), false);
});

test("grant feature berbeda untuk user yang sama saling independen", () => {
  let map: MockEntitlementMap = {};
  map = applyGrant(map, "u1", FEATURE);
  map = applyGrant(map, "u1", "other_feature");
  map = applyRevoke(map, "u1", FEATURE);
  assert.equal(checkEntitlement(map, "u1", FEATURE), false);
  assert.equal(checkEntitlement(map, "u1", "other_feature"), true);
});
