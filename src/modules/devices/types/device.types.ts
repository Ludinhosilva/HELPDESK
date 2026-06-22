import { z } from "zod";

export const DeviceSchema = z.object({
  brand: z.string().min(1, "La marca es requerida").max(50),
  model: z.string().min(1, "El modelo es requerido").max(50),
  serial: z.string().min(1, "El serial es requerido").max(50),
  type: z.enum(["LAPTOP", "DESKTOP", "ALL_IN_ONE", "TABLET", "OTHER"]),
  accessories: z.string().max(200).optional().or(z.literal("")),
  customerId: z.string().min(1, "El cliente es requerido"),
});

export const DeviceUpdateSchema = DeviceSchema.partial();

export type DeviceInput = z.infer<typeof DeviceSchema>;
export type DeviceUpdate = z.infer<typeof DeviceUpdateSchema>;
