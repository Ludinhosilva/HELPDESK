import { prisma } from "@/core/prisma";
import { DeviceSchema, DeviceUpdateSchema } from "../types/device.types";

export async function getDevices(page = 1, limit = 20, search = "") {
  const skip = (page - 1) * limit;
  const where = search
    ? {
        OR: [
          { brand: { contains: search } },
          { model: { contains: search } },
          { serial: { contains: search } },
        ],
      }
    : {};

  const [devices, total] = await Promise.all([
    prisma.device.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        _count: { select: { tickets: true } },
      },
    }),
    prisma.device.count({ where }),
  ]);

  return { devices, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getDeviceById(id: string) {
  const device = await prisma.device.findUnique({
    where: { id },
    include: {
      customer: true,
      tickets: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!device) return { error: "Equipo no encontrado", status: 404 as const };
  return device;
}

export async function createDevice(data: {
  brand: string;
  model: string;
  serial: string;
  type: string;
  accessories?: string;
  customerId: string;
}) {
  const parsed = DeviceSchema.safeParse(data);
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

  const existingSerial = await prisma.device.findUnique({
    where: { serial: parsed.data.serial },
  });
  if (existingSerial)
    return { error: "El serial ya esta registrado", status: 409 as const };

  const device = await prisma.device.create({
    data: {
      brand: parsed.data.brand,
      model: parsed.data.model,
      serial: parsed.data.serial,
      type: parsed.data.type,
      accessories: parsed.data.accessories || null,
      customerId: parsed.data.customerId,
    },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
    },
  });

  return device;
}

export async function updateDevice(
  id: string,
  data: {
    brand?: string;
    model?: string;
    serial?: string;
    type?: string;
    accessories?: string;
    customerId?: string;
  }
) {
  const existing = await prisma.device.findUnique({ where: { id } });
  if (!existing) return { error: "Equipo no encontrado", status: 404 as const };

  const parsed = DeviceUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || "Datos invalidos",
      status: 400 as const,
    };
  }

  if (parsed.data.customerId) {
    const customer = await prisma.customer.findUnique({
      where: { id: parsed.data.customerId },
    });
    if (!customer)
      return { error: "El cliente no existe", status: 404 as const };
  }

  if (parsed.data.serial && parsed.data.serial !== existing.serial) {
    const existingSerial = await prisma.device.findUnique({
      where: { serial: parsed.data.serial },
    });
    if (existingSerial)
      return { error: "El serial ya esta registrado", status: 409 as const };
  }

  const device = await prisma.device.update({
    where: { id },
    data: parsed.data,
    include: {
      customer: { select: { id: true, name: true, phone: true } },
    },
  });

  return device;
}

export async function deleteDevice(id: string) {
  const existing = await prisma.device.findUnique({ where: { id } });
  if (!existing) return { error: "Equipo no encontrado", status: 404 as const };

  await prisma.device.delete({ where: { id } });
  return { success: true };
}
