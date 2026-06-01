/**
 * HTTP transport bersama untuk provider — port dari career-ops/providers/_http.mjs.
 * Pure fetch + JSON, dengan timeout dan User-Agent yang sopan.
 */

import { DEFAULT_USER_AGENT } from "../base";
import type { FetchOptions, HttpCtx } from "./types";

const DEFAULT_TIMEOUT_MS = 10_000;

interface HttpError extends Error {
  status?: number;
}

async function fetchWithTimeout(
  url: string,
  { timeoutMs = DEFAULT_TIMEOUT_MS, headers = {}, redirect = "follow" }: FetchOptions = {},
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "user-agent": DEFAULT_USER_AGENT, ...headers },
      redirect,
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      const snippet = body.replace(/\s+/g, " ").trim().slice(0, 300);
      const err: HttpError = new Error(snippet ? `HTTP ${res.status}: ${snippet}` : `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchJson(url: string, opts: FetchOptions = {}): Promise<unknown> {
  const res = await fetchWithTimeout(url, opts);
  return res.json();
}

export function makeHttpCtx(): HttpCtx {
  return { fetchJson };
}
