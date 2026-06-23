import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? "servidesk-default-secret-key-change-in-production";
  return new TextEncoder().encode(secret);
}

export async function generateToken(payload: {
  sub: string;
  email: string;
  role: string;
  orgId: string;
}): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyToken(
  token: string
): Promise<{ sub: string; email: string; role: string; orgId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as {
      sub: string;
      email: string;
      role: string;
      orgId: string;
    };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
