/**
 * MIDDLEWARE (Next 16 `proxy.ts`) — proteksi route berbasis cookie sesi + role.
 * Login menyimpan:
 *   - cookie `authjs.session-token` (httpOnly) = token sesi DB (divalidasi `auth()`)
 *   - cookie `cw_role` = jobseeker | freelancer | company | admin (untuk routing)
 *
 * Middleware hanya cek keberadaan cookie sesi + role untuk routing cepat (tanpa
 * DB). Validasi sebenarnya dilakukan `auth()` + query ber-scope user di server.
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
    pathname.startsWith("/learn") ||
    pathname.startsWith("/applications")
  )
    return "jobseeker";
  if (pathname.startsWith("/guides") || pathname.startsWith("/interview"))
    return "auth";
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/profile")
  )
    return "shared";
  return null;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoggedIn = !!request.cookies.get("authjs.session-token")?.value;
  const role = resolveRole(request.cookies.get("cw_role")?.value);
  // "0" = user baru yang belum menyelesaikan onboarding. Cookie hilang
  // dianggap sudah onboarding (fail-open) agar sesi lama tidak terganggu.
  const needsOnboarding =
    request.cookies.get("cw_onboarded")?.value === "0" &&
    (role === "jobseeker" || role === "freelancer");

  // Sudah login tapi membuka /login → lempar ke home sesuai role.
  if (pathname === "/login") {
    // `stale=1` dikirim requireUser() saat cookie ada tapi sesi tidak valid.
    // Bersihkan cookie dan biarkan halaman login tampil, jangan dipantulkan.
    if (request.nextUrl.searchParams.has("stale")) {
      const response = NextResponse.next();
      response.cookies.delete("authjs.session-token");
      response.cookies.delete("cw_role");
      response.cookies.delete("cw_onboarded");
      return response;
    }
    if (!isLoggedIn) return NextResponse.next();
    return NextResponse.redirect(
      new URL(needsOnboarding ? "/onboarding" : homeForRole(role), request.url),
    );
  }

  const required = requiredRoleFor(pathname);
  if (!required) return NextResponse.next();

  // Belum login → semua route terproteksi diarahkan ke /login.
  if (!isLoggedIn) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Login pertama: kunci ke alur onboarding sampai selesai, supaya user baru
  // tidak mendarat di dashboard yang masih kosong.
  if (needsOnboarding && !pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
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
    "/profile/:path*",
    "/skills/:path*",
    "/roadmap/:path*",
    "/jobs/:path*",
    "/applications/:path*",
    "/learn/:path*",
    "/projects/:path*",
    "/proposals/:path*",
    "/company/:path*",
    "/guides/:path*",
    "/interview/:path*",
    "/admin/:path*",
  ],
};
