import { z } from "zod";

export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  OPEN: ["IN_PROGRESS", "ON_HOLD", "CLOSED"],
  IN_PROGRESS: ["DIAGNOSING", "ON_HOLD", "RESOLVED"],
  DIAGNOSING: ["REPAIRING", "ON_HOLD"],
  REPAIRING: ["WAITING_PARTS", "READY", "ON_HOLD"],
  WAITING_PARTS: ["REPAIRING"],
  READY: ["RESOLVED"],
  ON_HOLD: ["IN_PROGRESS", "RESOLVED"],
  RESOLVED: ["CLOSED", "OPEN"],
  CLOSED: [],
};

export const CreateTicketSchema = z.object({
  title: z.string().min(3, "El titulo debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripcion debe tener al menos 10 caracteres"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  categoryId: z.string().optional(),
});

export const UpdateTicketSchema = z.object({
  status: z.string().optional(),
  assignedToId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  paymentStatus: z.enum(["NONE", "PENDING", "PROCESSING", "APPROVED", "FAILED"]).optional(),
  paymentAmount: z.number().int().optional(),
  paymentReference: z.string().optional(),
  slaExpiresAt: z.string().optional(),
});

export const CreateCommentSchema = z.object({
  content: z.string().min(1, "El comentario no puede estar vacio"),
});

export const CreateEvaluationSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});
