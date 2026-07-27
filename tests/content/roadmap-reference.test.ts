import { test } from "node:test";
import assert from "node:assert/strict";

import { roadmapShUrl } from "@/core/content/roadmap-reference";

test("roadmapShUrl: role frontend umum", () => {
  assert.equal(roadmapShUrl("Frontend Engineer"), "https://roadmap.sh/frontend");
  assert.equal(roadmapShUrl("React Developer"), "https://roadmap.sh/frontend");
});

test("roadmapShUrl: full stack menang atas frontend/backend", () => {
  assert.equal(roadmapShUrl("Full Stack Developer"), "https://roadmap.sh/full-stack");
  assert.equal(roadmapShUrl("Fullstack Engineer"), "https://roadmap.sh/full-stack");
});

test("roadmapShUrl: role data & AI", () => {
  assert.equal(roadmapShUrl("Data Analyst"), "https://roadmap.sh/data-analyst");
  assert.equal(roadmapShUrl("Data Engineer"), "https://roadmap.sh/data-engineer");
  assert.equal(roadmapShUrl("Machine Learning Engineer"), "https://roadmap.sh/machine-learning");
  assert.equal(roadmapShUrl("AI Engineer"), "https://roadmap.sh/ai-engineer");
});

test("roadmapShUrl: role tanpa padanan -> null", () => {
  assert.equal(roadmapShUrl("Akuntan"), null);
  assert.equal(roadmapShUrl("Digital Marketing Specialist"), null);
});
