import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "servidesk-secret-2026";
  return new TextEncoder().encode(secret);
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

    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.sub as string);
    response.headers.set("x-user-role", payload.role as string);
    response.headers.set("x-org-id", payload.orgId as string);
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
    "/api/:path*",
  ],
};
