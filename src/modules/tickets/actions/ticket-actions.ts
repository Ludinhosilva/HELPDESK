import { prisma } from "@/core/prisma";
import {
  CreateTicketSchema,
  UpdateTicketSchema,
  AssignTicketSchema,
  VALID_STATUS_TRANSITIONS,
} from "../types/ticket.types";

export async function getTickets(
  page = 1,
  limit = 20,
  search = "",
  status = ""
) {
  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};

  if (status) where.status = status;

  if (search) {
    where.OR = [
      { description: { contains: search } },
      { customer: { name: { contains: search } } },
      { device: { brand: { contains: search } } },
      { device: { model: { contains: search } } },
    ];
  }

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        device: {
          select: { id: true, brand: true, model: true, serial: true, type: true },
        },
        technician: { select: { id: true, name: true } },
        _count: { select: { history: true } },
      },
    }),
    prisma.ticket.count({ where }),
  ]);

  return { tickets, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getTicketById(id: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      customer: true,
      device: true,
      technician: { select: { id: true, name: true, email: true } },
      history: { orderBy: { timestamp: "desc" } },
    },
  });

  if (!ticket) return { error: "Ticket no encontrado", status: 404 as const };
  return ticket;
}

async function getNextTicketNumber(): Promise<number> {
  const last = await prisma.ticket.findFirst({
    orderBy: { ticketNumber: "desc" },
    select: { ticketNumber: true },
  });
  return (last?.ticketNumber || 0) + 1;
}

export async function createTicket(data: {
  customerId: string;
  deviceId: string;
  description: string;
  priority?: string;
  cost?: number;
  notes?: string;
}) {
  const parsed = CreateTicketSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || "Datos invalidos",
      status: 400 as const,
    };
  }

  const customer = await prisma.customer.findUnique({
    where: { id: parsed.data.customerId },
  });
  if (!customer) return { error: "El cliente no existe", status: 404 as const };

  const device = await prisma.device.findUnique({
    where: { id: parsed.data.deviceId },
  });
  if (!device) return { error: "El equipo no existe", status: 404 as const };

  if (device.customerId !== parsed.data.customerId) {
    return {
      error: "El equipo no pertenece al cliente especificado",
      status: 400 as const,
    };
  }

  const ticketNumber = await getNextTicketNumber();

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber,
      description: parsed.data.description,
      priority: parsed.data.priority,
      cost: parsed.data.cost,
      notes: parsed.data.notes || null,
      customerId: parsed.data.customerId,
      deviceId: parsed.data.deviceId,
      history: {
        create: {
          action: "CREATED",
          description: `Ticket TK-${ticketNumber} creado`,
        },
      },
    },
    include: {
      customer: true,
      device: true,
      technician: { select: { id: true, name: true } },
      history: true,
    },
  });

  return ticket;
}

export async function updateTicket(
  id: string,
  data: {
    description?: string;
    priority?: string;
    cost?: number;
    notes?: string;
    status?: string;
  }
) {
  const existing = await prisma.ticket.findUnique({ where: { id } });
  if (!existing) return { error: "Ticket no encontrado", status: 404 as const };

  const parsed = UpdateTicketSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || "Datos invalidos",
      status: 400 as const,
    };
  }

  if (parsed.data.status && parsed.data.status !== existing.status) {
    const allowed = VALID_STATUS_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(parsed.data.status)) {
      return {
        error: `No se puede cambiar de ${existing.status} a ${parsed.data.status}`,
        status: 400 as const,
      };
    }

    const historyDescription = parsed.data.status === "DELIVERED"
      ? `Ticket entregado al cliente. Costo final: S/ ${((parsed.data.cost ?? existing.cost) / 100).toFixed(2)}`
      : `Estado cambiado de ${existing.status} a ${parsed.data.status}`;

    await prisma.ticketHistory.create({
      data: {
        ticketId: id,
        action: "STATUS_CHANGE",
        description: historyDescription,
      },
    });
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data: parsed.data,
    include: {
      customer: true,
      device: true,
      technician: { select: { id: true, name: true } },
      history: { orderBy: { timestamp: "desc" } },
    },
  });

  return ticket;
}

export async function assignTicket(id: string, technicianId: string) {
  const existing = await prisma.ticket.findUnique({ where: { id } });
  if (!existing) return { error: "Ticket no encontrado", status: 404 as const };

  const parsed = AssignTicketSchema.safeParse({ technicianId });
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || "Datos invalidos",
      status: 400 as const,
    };
  }

  const technician = await prisma.user.findUnique({
    where: { id: parsed.data.technicianId },
  });
  if (!technician || technician.role !== "TECHNICIAN") {
    return {
      error: "El tecnico no existe o no tiene rol de tecnico",
      status: 404 as const,
    };
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data: {
      technicianId: parsed.data.technicianId,
      history: {
        create: {
          action: "ASSIGNMENT",
          description: `Asignado a ${technician.name}`,
        },
      },
    },
    include: {
      customer: true,
      device: true,
      technician: { select: { id: true, name: true } },
      history: { orderBy: { timestamp: "desc" } },
    },
  });

  return ticket;
}
