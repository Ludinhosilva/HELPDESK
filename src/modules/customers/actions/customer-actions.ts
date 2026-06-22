import { prisma } from "@/core/prisma";
import { CustomerSchema, CustomerUpdateSchema } from "../types/customer.types";

export async function getCustomers(page = 1, limit = 20, search = "") {
  const skip = (page - 1) * limit;
  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { devices: true, tickets: true } } },
    }),
    prisma.customer.count({ where }),
  ]);

  return { customers, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      devices: true,
      tickets: { orderBy: { createdAt: "desc" }, take: 5 },
      _count: { select: { tickets: true } },
    },
  });

  if (!customer) return { error: "Cliente no encontrado", status: 404 as const };
  return customer;
}

export async function createCustomer(data: {
  name: string;
  phone: string;
  email?: string;
}) {
  const parsed = CustomerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || "Datos invalidos",
      status: 400 as const,
    };
  }

  const customer = await prisma.customer.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
    },
  });

  return customer;
}

export async function updateCustomer(
  id: string,
  data: { name?: string; phone?: string; email?: string }
) {
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) return { error: "Cliente no encontrado", status: 404 as const };

  const parsed = CustomerUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || "Datos invalidos",
      status: 400 as const,
    };
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: parsed.data,
  });

  return customer;
}

export async function deleteCustomer(id: string) {
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) return { error: "Cliente no encontrado", status: 404 as const };

  await prisma.customer.delete({ where: { id } });
  return { success: true };
}
