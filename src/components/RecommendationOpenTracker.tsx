"use client";

import { useEffect } from "react";

/** Best-effort analytics; no UI or product behavior depends on this request. */
export function RecommendationOpenTracker({
  jobId,
  impressionId,
}: {
  jobId: string;
  impressionId?: string;
}) {
  useEffect(() => {
    if (!impressionId) return;
    const controller = new AbortController();
    void fetch(`/api/jobs/${jobId}/open`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ impressionId }),
      keepalive: true,
      signal: controller.signal,
    }).catch(() => undefined);
    return () => controller.abort();
  }, [impressionId, jobId]);

  return null;
}
