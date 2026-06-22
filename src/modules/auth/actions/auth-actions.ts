import { prisma } from "@/core/prisma";
import { RegisterSchema } from "../types/auth.types";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "pc-repair-secret-key-change-in-production";
  return new TextEncoder().encode(secret);
}

async function generateToken(user: {
  id: string;
  email: string;
  role: string;
}): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJwtSecret());
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { error: "Credenciales invalidas", status: 401 as const };
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return { error: "Credenciales invalidas", status: 401 as const };
  }

  const token = await generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      specialty: user.specialty,
    },
    token,
  };
}

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  role: string;
  specialty: string;
}) {
  const parsed = RegisterSchema.safeParse(data);

  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message || "Datos invalidos";
    return { error: message, status: 400 as const };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return { error: "El email ya esta registrado", status: 409 as const };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      password: hashedPassword,
      name: parsed.data.name,
      role: parsed.data.role,
    },
  });

  const token = await generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      specialty: user.specialty,
    },
    token,
  };
}
