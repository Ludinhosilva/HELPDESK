import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Formato de email invalido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const RegisterSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Formato de email invalido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña es demasiado larga"),
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre es demasiado largo"),
  role: z.enum(["ADMIN", "TECHNICIAN"]).default("TECHNICIAN"),
  specialty: z.string().max(100).default(""),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    specialty: string;
  };
  token: string;
}
