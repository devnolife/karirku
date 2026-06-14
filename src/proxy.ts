/**
 * MIDDLEWARE (Next 16 `proxy.ts`) — proteksi route berbasis cookie demo + role.
 * Mode demo: tidak ada session DB/JWT. Login menyimpan:
 *   - cookie `kai_demo`      = "1" (penanda sudah masuk)
 *   - cookie `kai_demo_role` = jobseeker | freelancer | company | admin
 */
import { NextResponse, type NextRequest } from "next/server";

const VALID_ROLES = ["jobseeker", "freelancer", "company", "admin"] as const;
type Role = (typeof VALID_ROLES)[number];

function resolveRole(value: string | undefined): Role {
  return value && (VALID_ROLES as readonly string[]).includes(value)
    ? (value as Role)
    : "jobseeker";
}

function homeForRole(role: Role): string {
  return role === "admin" ? "/admin" : "/dashboard";
}

/** Role wajib untuk prefix route tertentu.
 *  - Role spesifik  → hanya role itu
 *  - "shared"       → semua role non-admin (admin dipantul ke /admin)
 *  - "auth"         → cukup login, semua role termasuk admin
 *  - null           → tidak terproteksi
 */
function requiredRoleFor(pathname: string): Role | "shared" | "auth" | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/company")) return "company";
  if (
    pathname.startsWith("/projects") ||
    pathname.startsWith("/proposals")
  )
    return "freelancer";
  if (
    pathname.startsWith("/skills") ||
    pathname.startsWith("/roadmap") ||
    pathname.startsWith("/jobs") ||
    pathname.startsWith("/learn")
  )
    return "jobseeker";
  if (pathname.startsWith("/guides") || pathname.startsWith("/interview"))
    return "auth";
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding"))
    return "shared";
  return null;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoggedIn = request.cookies.get("kai_demo")?.value === "1";
  const role = resolveRole(request.cookies.get("kai_demo_role")?.value);

  // Sudah login tapi membuka /login → lempar ke home sesuai role.
  if (pathname === "/login") {
    return isLoggedIn
      ? NextResponse.redirect(new URL(homeForRole(role), request.url))
      : NextResponse.next();
  }

  const required = requiredRoleFor(pathname);
  if (!required) return NextResponse.next();

  // Belum login → semua route terproteksi diarahkan ke /login.
  if (!isLoggedIn) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Route yang cukup butuh login (semua role boleh, termasuk admin).
  if (required === "auth") return NextResponse.next();

  // Route khusus role (admin / freelancer / company).
  if (required !== "shared" && role !== required) {
    return NextResponse.redirect(new URL(homeForRole(role), request.url));
  }

  // Route bersama (dashboard/onboarding) tidak untuk admin.
  if (required === "shared" && role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/skills/:path*",
    "/roadmap/:path*",
    "/jobs/:path*",
    "/learn/:path*",
    "/projects/:path*",
    "/proposals/:path*",
    "/company/:path*",
    "/guides/:path*",
    "/interview/:path*",
    "/admin/:path*",
  ],
};
