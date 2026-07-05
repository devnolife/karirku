/**
 * Helper bersama route /api/autofill/* — CORS untuk extension + resolusi
 * user dari bearer token.
 *
 * Catatan CORS: fetch dari background service worker extension dengan
 * host_permissions tidak terkena CORS, tapi header tetap dikirim agar
 * pengembangan (mis. dari popup/devtools) tidak tersandung preflight.
 */

import { NextResponse } from "next/server";
import { bearerFromRequest, verifyToken } from "@/lib/autofill/token";

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export function corsJson(body: unknown, init?: { status?: number }): NextResponse {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: CORS_HEADERS,
  });
}

export function corsPreflight(): NextResponse {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/** Ambil userId dari bearer token; null bila tidak valid. */
export function userFromRequest(req: Request): string | null {
  return verifyToken(bearerFromRequest(req));
}

export function unauthorized(): NextResponse {
  return corsJson(
    { error: "unauthorized", message: "Extension token tidak valid atau kedaluwarsa" },
    { status: 401 },
  );
}
