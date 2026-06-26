import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "flix-support-secret-2026";
  return new TextEncoder().encode(secret);
}

const roleRouteRestrictions: Record<string, string[]> = {
  "/users": ["SUPER_ADMIN", "ADMIN"],
  "/categories": ["SUPER_ADMIN", "ADMIN"],
  "/analytics": ["SUPER_ADMIN", "ADMIN"],
  "/emails": ["SUPER_ADMIN", "ADMIN"],
  "/settings": ["SUPER_ADMIN", "ADMIN"],
  "/subscriptions": ["SUPER_ADMIN", "ADMIN", "END_USER"],
  "/tickets/kanban": ["SUPER_ADMIN", "ADMIN", "TECHNICIAN"],
  "/tickets/compras": ["SUPER_ADMIN", "ADMIN"],
  "/tickets/new": ["SUPER_ADMIN", "ADMIN", "END_USER"],
  "/super-admin": ["SUPER_ADMIN"],
};

function getRequiredRoles(pathname: string): string[] | null {
  const sortedKeys = Object.keys(roleRouteRestrictions).sort((a, b) => b.length - a.length);
  for (const prefix of sortedKeys) {
    if (pathname === prefix || pathname.startsWith(prefix + "/") || pathname.startsWith(prefix + "?")) {
      return roleRouteRestrictions[prefix];
    }
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/api/auth/");

  if (isPublic) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "unauthorized", message: "Token no proporcionado" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const role = payload.role as string;

    const requiredRoles = getRequiredRoles(pathname);
    if (requiredRoles && !requiredRoles.includes(role)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "forbidden", message: "No tienes permiso para acceder a este recurso" },
          { status: 403 }
        );
      }
      const dashboardUrl = new URL(role === "SUPER_ADMIN" ? "/super-admin" : "/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.sub as string);
    response.headers.set("x-user-role", role);
    response.headers.set("x-org-id", (payload.orgId as string) || "");
    return response;
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "unauthorized", message: "Token invalido o expirado" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tickets/:path*",
    "/knowledge/:path*",
    "/users/:path*",
    "/categories/:path*",
    "/analytics/:path*",
    "/subscriptions/:path*",
    "/emails/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/notifications/:path*",
    "/kiosk",
    "/super-admin/:path*",
    "/api/:path*",
  ],
};
