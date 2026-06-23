import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/prisma";
import { CreateCommentSchema } from "@/modules/tickets/types/ticket.types";

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
      select: { id: true, ticketNumber: true },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "not_found", message: "Ticket not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = CreateCommentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "validation_error",
          message: parsed.error.errors[0]?.message || "Invalid data",
        },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        ticketId: id,
        authorId: userId,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    await prisma.ticketHistory.create({
      data: {
        ticketId: id,
        action: "COMMENT",
        description: `Comment added on TK-${ticket.ticketNumber}`,
        userId,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error adding comment" },
      { status: 500 }
    );
  }
}
