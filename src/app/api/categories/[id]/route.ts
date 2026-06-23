import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/prisma";
import { getAuthFromHeaders } from "@/lib/auth-helpers";

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json(
        { error: "forbidden", message: "Solo administradores pueden modificar categorias" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation_error", message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findFirst({
      where: { id: params.id, organizationId: auth.orgId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "not_found", message: "Categoria no encontrada" },
        { status: 404 }
      );
    }

    const data = parsed.data;

    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.category.findFirst({
        where: { slug: data.slug, organizationId: auth.orgId, id: { not: params.id } },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "conflict", message: "Ya existe una categoria con ese slug" },
          { status: 409 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(category);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al actualizar categoria" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json(
        { error: "forbidden", message: "Solo administradores pueden eliminar categorias" },
        { status: 403 }
      );
    }

    const existing = await prisma.category.findFirst({
      where: { id: params.id, organizationId: auth.orgId },
      include: { _count: { select: { tickets: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "not_found", message: "Categoria no encontrada" },
        { status: 404 }
      );
    }

    if (existing._count.tickets > 0) {
      return NextResponse.json(
        { error: "conflict", message: "No se puede eliminar una categoria con tickets asociados" },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Categoria eliminada" });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al eliminar categoria" },
      { status: 500 }
    );
  }
}
