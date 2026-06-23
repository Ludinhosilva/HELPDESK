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

  if (!userId || !role || !orgId) return null;

  return { userId, role, orgId };
}

export async function getAuthFromCookies(): Promise<AuthContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return { userId: payload.sub, role: payload.role, orgId: payload.orgId };
}

export function requireAdmin(auth: AuthContext | null): boolean {
  return auth?.role === "ADMIN";
}
