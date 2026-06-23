import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/prisma";
import { CreateTicketSchema } from "@/modules/tickets/types/ticket.types";

export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get("x-org-id");
    if (!orgId) {
      return NextResponse.json(
        { error: "unauthorized", message: "Organization not found" },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const search = searchParams.get("search") || undefined;

    const where: Record<string, unknown> = { organizationId: orgId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { ticketNumber: { equals: parseInt(search) || -1 } },
      ];
    }

    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          createdBy: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true } },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    return NextResponse.json({
      tickets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error fetching tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const orgId = request.headers.get("x-org-id");
    const userId = request.headers.get("x-user-id");

    if (!orgId || !userId) {
      return NextResponse.json(
        { error: "unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = CreateTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "validation_error",
          message: parsed.error.errors[0]?.message || "Invalid data",
        },
        { status: 400 }
      );
    }

    const lastTicket = await prisma.ticket.findFirst({
      where: { organizationId: orgId },
      orderBy: { ticketNumber: "desc" },
      select: { ticketNumber: true },
    });

    const ticketNumber = (lastTicket?.ticketNumber || 0) + 1;

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        title: parsed.data.title,
        description: parsed.data.description,
        priority: parsed.data.priority,
        categoryId: parsed.data.categoryId || null,
        createdById: userId,
        organizationId: orgId,
        history: {
          create: {
            action: "CREATED",
            description: `Ticket TK-${ticketNumber} created`,
            userId,
          },
        },
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error creating ticket" },
      { status: 500 }
    );
  }
}
