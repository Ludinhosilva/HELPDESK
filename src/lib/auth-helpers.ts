import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export interface AuthContext {
  userId: string;
  role: string;
  orgId: string;
}

export function getAuthFromHeaders(request: NextRequest): AuthContext | null {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");
  const orgId = request.headers.get("x-org-id");

  if (!userId || !role) return null;

  return { userId, role, orgId: orgId || "" };
}

export async function getAuthFromCookies(): Promise<AuthContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return { userId: payload.sub, role: payload.role, orgId: payload.orgId || "" };
}

export function requireAdmin(auth: AuthContext | null): boolean {
  return auth?.role === "ADMIN" || auth?.role === "SUPER_ADMIN";
}

export function requireRole(...roles: string[]) {
  return (auth: AuthContext | null): boolean => {
    return auth !== null && roles.includes(auth.role);
  };
}

export function isSuperAdmin(auth: AuthContext | null): boolean {
  return auth?.role === "SUPER_ADMIN";
}

export function getOrgFilter(auth: AuthContext): object {
  if (auth.role === "SUPER_ADMIN") return {};
  return { organizationId: auth.orgId };
}
