import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.SESSION_SECRET || "";
const key = new TextEncoder().encode(SECRET_KEY);

export async function middleware(request: NextRequest) {
  // 1. Define Paths
  const { pathname } = request.nextUrl;

  const publicPaths = ["/login", "/register/admin", "/unauthorized"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // 2. Read Session
  const cookie = request.cookies.get("schola_session");
  const sessionToken = cookie?.value;

  // 3. Decrypt & Validate Session
  let sessionPayload = null;

  if (sessionToken) {
    try {
      const { payload } = await jwtVerify(sessionToken, key, {
        algorithms: ["HS256"],
      });
      // Check expiration if not automatically handled by jwtVerify (it usually is)
      sessionPayload = payload as { userId: string; role: string; exp: number };
    } catch (e) {
      // Invalid session
      sessionPayload = null;
    }
  }

  // 4. Auth Logic

  // If user is not logged in and tries to access protected route -> Redirect to Login
  if (!sessionPayload && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is logged in and tries to access login/register -> Redirect to Dashboard
  if (sessionPayload && isPublicPath && pathname !== "/unauthorized") {
    // Redirect based on role
    switch (sessionPayload.role) {
      case "ADMIN":
        return NextResponse.redirect(new URL("/dashboard", request.url));
      case "TEACHER":
        return NextResponse.redirect(new URL("/dashboard", request.url));
      case "STUDENT":
        return NextResponse.redirect(new URL("/dashboard", request.url));
      case "PARENT":
        return NextResponse.redirect(new URL("/dashboard", request.url));
      default:
        return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 5. RBAC Protection
  if (sessionPayload) {
    const role = sessionPayload.role;

    // Admin Routes
    const adminRoutes = [
      "/admin",
      "/teachers/create",
      "/students/create",
      "/finance",
      "/settings",
    ];
    if (
      adminRoutes.some((path) => pathname.startsWith(path)) &&
      role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Teacher Routes
    const teacherRoutes = ["/teacher", "/attendance"];
    // Note: /results is shared, so checking strictly teacher/attendance here
    if (
      teacherRoutes.some((path) => pathname.startsWith(path)) &&
      role !== "TEACHER"
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Student Routes
    const studentRoutes = ["/student", "/fees"];
    if (
      studentRoutes.some((path) => pathname.startsWith(path)) &&
      role !== "STUDENT"
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Shared Routes Check (Example: /results)
    if (pathname.startsWith("/results")) {
      if (role !== "TEACHER" && role !== "STUDENT") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc) if any
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
