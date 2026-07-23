import { test } from "node:test";
import assert from "node:assert/strict";

import {
  highestStageReached,
  isApplicationStatus,
  statusLabel,
} from "@/lib/applications/status";

test("status aplikasi tervalidasi dan berlabel", () => {
  assert.equal(isApplicationStatus("interview"), true);
  assert.equal(isApplicationStatus("unknown"), false);
  assert.equal(statusLabel("offered"), "Ditawari");
});

test("stage tertinggi tidak mundur setelah rejection atau ghosting", () => {
  assert.equal(highestStageReached("interview", "rejected"), "interview");
  assert.equal(highestStageReached("offered", "ghosted"), "offered");
  assert.equal(highestStageReached("screened", "interview"), "interview");
});

test("terminal event pertama tetap memiliki baseline applied", () => {
  assert.equal(highestStageReached(null, "rejected"), "applied");
});
