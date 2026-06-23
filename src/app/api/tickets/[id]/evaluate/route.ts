import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/prisma";
import { CreateEvaluationSchema } from "@/modules/tickets/types/ticket.types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = request.headers.get("x-org-id");
    const userId = request.headers.get("x-user-id");

    if (!orgId || !userId) {
      return NextResponse.json(
        { error: "unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const ticket = await prisma.ticket.findFirst({
      where: { id, organizationId: orgId },
      select: { id: true, status: true, ticketNumber: true },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "not_found", message: "Ticket not found" },
        { status: 404 }
      );
    }

    if (ticket.status !== "RESOLVED" && ticket.status !== "CLOSED") {
      return NextResponse.json(
        {
          error: "invalid_status",
          message: "Ticket must be resolved or closed before evaluation",
        },
        { status: 400 }
      );
    }

    const existingEvaluation = await prisma.evaluation.findFirst({
      where: { ticketId: id, userId },
    });

    if (existingEvaluation) {
      return NextResponse.json(
        {
          error: "already_evaluated",
          message: "You have already evaluated this ticket",
        },
        { status: 409 }
      );
    }

    const body = await request.json();
    const parsed = CreateEvaluationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "validation_error",
          message: parsed.error.errors[0]?.message || "Invalid data",
        },
        { status: 400 }
      );
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        rating: parsed.data.rating,
        comment: parsed.data.comment || null,
        ticketId: id,
        userId,
      },
    });

    await prisma.ticketHistory.create({
      data: {
        ticketId: id,
        action: "EVALUATION",
        description: `Ticket evaluated with rating ${parsed.data.rating}/5`,
        userId,
      },
    });

    return NextResponse.json(evaluation, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error evaluating ticket" },
      { status: 500 }
    );
  }
}
