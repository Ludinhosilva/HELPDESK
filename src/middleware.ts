import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "pc-repair-secret-key-change-in-production";
  return new TextEncoder().encode(secret);
}

const protectedPaths = ["/dashboard", "/api/tickets", "/api/customers", "/api/devices", "/api/users"];
const publicPaths = ["/api/auth/login", "/api/auth/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!isProtected) {
    return NextResponse.next();
  }

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
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
