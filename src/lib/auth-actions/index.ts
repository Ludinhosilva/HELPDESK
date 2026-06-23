import { z } from "zod";
import { prisma } from "@/core/prisma";
import { hashPassword, comparePassword, generateToken } from "@/lib/auth";

export const LoginSchema = z.object({
  email: z.string().email("Formato de email invalido"),
  password: z.string().min(1, "La contrasena es requerida"),
});

export const RegisterSchema = z.object({
  orgName: z.string().min(2, "El nombre de la organizacion es requerido"),
  name: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Formato de email invalido"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
});

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface LoginResult {
  user?: { id: string; name: string; email: string; role: string; orgId: string };
  token?: string;
  error?: string;
  status?: number;
}

export interface RegisterResult {
  message?: string;
  error?: string;
  status: number;
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  const parsed = LoginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Datos invalidos", status: 400 };
  }

  const user = await prisma.user.findFirst({
    where: { email },
    include: { organization: true },
  });

  if (!user) {
    return { error: "Credenciales invalidas", status: 401 };
  }

  const validPassword = await comparePassword(password, user.password);
  if (!validPassword) {
    return { error: "Credenciales invalidas", status: 401 };
  }

  const token = await generateToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    orgId: user.organizationId || "",
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      orgId: user.organizationId || "",
    },
    token,
  };
}

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  orgName: string;
}): Promise<RegisterResult> {
  const parsed = RegisterSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Datos invalidos", status: 400 };
  }

  const { orgName, name, email, password } = parsed.data;
  const slug = slugify(orgName);

  const existingOrg = await prisma.organization.findUnique({ where: { slug } });

  if (existingOrg) {
    const existingUser = await prisma.user.findFirst({
      where: { email, organizationId: existingOrg.id },
    });
    if (existingUser) {
      return { error: "El email ya existe en esta organizacion", status: 409 };
    }
  }

  const hashedPassword = await hashPassword(password);

  await prisma.organization.create({
    data: {
      name: orgName,
      slug,
      users: {
        create: { email, password: hashedPassword, name, role: "ADMIN" },
      },
    },
    include: { users: true },
  });

  return { message: "Organizacion y usuario administrador creados correctamente", status: 201 };
}
