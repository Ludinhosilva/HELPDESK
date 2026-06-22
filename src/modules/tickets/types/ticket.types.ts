import { z } from "zod";

export const CreateTicketSchema = z.object({
  customerId: z.string().min(1, "El cliente es requerido"),
  deviceId: z.string().min(1, "El equipo es requerido"),
  description: z
    .string()
    .min(1, "La descripcion es requerida")
    .max(500, "Maximo 500 caracteres"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  cost: z.number().int().min(0).default(0),
  notes: z.string().max(1000).optional(),
});

export const UpdateTicketSchema = z.object({
  description: z.string().min(1).max(500).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  cost: z.number().int().min(0).optional(),
  notes: z.string().max(1000).optional(),
  status: z
    .enum([
      "RECEIVED",
      "DIAGNOSING",
      "REPAIRING",
      "WAITING_PARTS",
      "READY",
      "DELIVERED",
    ])
    .optional(),
});

export const AssignTicketSchema = z.object({
  technicianId: z.string().min(1, "El tecnico es requerido"),
});

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>;
export type AssignTicketInput = z.infer<typeof AssignTicketSchema>;

export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  RECEIVED: ["DIAGNOSING"],
  DIAGNOSING: ["REPAIRING", "WAITING_PARTS"],
  REPAIRING: ["WAITING_PARTS", "READY"],
  WAITING_PARTS: ["REPAIRING", "READY"],
  READY: ["DELIVERED"],
  DELIVERED: [],
};
