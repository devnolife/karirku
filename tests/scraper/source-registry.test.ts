import { test } from "node:test";
import assert from "node:assert/strict";

import { fallbackPortals } from "@/lib/scraper/source-seed";
import { jobSourceToPortalEntry } from "@/lib/scraper/sources";

test("JobSource rows map to PortalEntry without spreading arbitrary config", () => {
  const portal = jobSourceToPortalEntry({
    id: "source-1",
    name: "Acme",
    provider: "greenhouse",
    careersUrl: "https://job-boards.greenhouse.io/acme",
    region: "Indonesia",
    enabled: true,
    config: {
      api: "https://boards-api.greenhouse.io/v1/boards/acme/jobs",
      headers: { authorization: "must-not-propagate" },
    },
  });

  assert.deepEqual(portal, {
    jobSourceId: "source-1",
    name: "Acme",
    provider: "greenhouse",
    careersUrl: "https://job-boards.greenhouse.io/acme",
    region: "Indonesia",
    enabled: true,
    api: "https://boards-api.greenhouse.io/v1/boards/acme/jobs",
  });
});

test("fallback contains only enabled deterministic bootstrap sources", () => {
  assert.deepEqual(
    fallbackPortals().map((portal) => portal.name),
    ["Xendit", "GitLab", "Figma", "Dropbox"],
  );
  assert.ok(fallbackPortals().every((portal) => portal.enabled));
});
