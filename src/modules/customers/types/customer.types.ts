import { z } from "zod";

export const CustomerSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  phone: z.string().min(1, "El telefono es requerido").max(20),
  email: z.string().email("Email invalido").optional().or(z.literal("")),
});

export const CustomerUpdateSchema = CustomerSchema.partial();

export type CustomerInput = z.infer<typeof CustomerSchema>;
export type CustomerUpdate = z.infer<typeof CustomerUpdateSchema>;
