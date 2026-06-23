import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/prisma";
import { getAuthFromHeaders } from "@/lib/auth-helpers";

const createCategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  slug: z.string().min(1, "El slug es requerido"),
});

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth) {
      return NextResponse.json(
        { error: "unauthorized", message: "No autorizado" },
        { status: 401 }
      );
    }

    const categories = await prisma.category.findMany({
      where: { organizationId: auth.orgId },
      include: {
        _count: { select: { tickets: true, knowledgeArticles: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al obtener categorias" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json(
        { error: "forbidden", message: "Solo administradores pueden crear categorias" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation_error", message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, slug } = parsed.data;

    const existing = await prisma.category.findFirst({
      where: { slug, organizationId: auth.orgId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "conflict", message: "Ya existe una categoria con ese slug" },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: { name, slug, organizationId: auth.orgId },
    });

    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al crear categoria" },
      { status: 500 }
    );
  }
}
