import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/prisma";
import { getAuthFromHeaders } from "@/lib/auth-helpers";

const updateArticleSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  categoryId: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth) {
      return NextResponse.json(
        { error: "unauthorized", message: "No autorizado" },
        { status: 401 }
      );
    }

    const article = await prisma.knowledgeArticle.findFirst({
      where: { id: params.id, organizationId: auth.orgId },
      include: { category: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: "not_found", message: "Articulo no encontrado" },
        { status: 404 }
      );
    }

    await prisma.knowledgeArticle.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(article);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al obtener articulo" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json(
        { error: "forbidden", message: "Solo administradores pueden editar articulos" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateArticleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation_error", message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const existing = await prisma.knowledgeArticle.findFirst({
      where: { id: params.id, organizationId: auth.orgId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "not_found", message: "Articulo no encontrado" },
        { status: 404 }
      );
    }

    const data = parsed.data;

    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.knowledgeArticle.findFirst({
        where: { slug: data.slug, organizationId: auth.orgId, id: { not: params.id } },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "conflict", message: "Ya existe un articulo con ese slug" },
          { status: 409 }
        );
      }
    }

    const article = await prisma.knowledgeArticle.update({
      where: { id: params.id },
      data,
      include: { category: true },
    });

    return NextResponse.json(article);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al actualizar articulo" },
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
        { error: "forbidden", message: "Solo administradores pueden eliminar articulos" },
        { status: 403 }
      );
    }

    const existing = await prisma.knowledgeArticle.findFirst({
      where: { id: params.id, organizationId: auth.orgId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "not_found", message: "Articulo no encontrado" },
        { status: 404 }
      );
    }

    await prisma.knowledgeArticle.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Articulo eliminado" });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al eliminar articulo" },
      { status: 500 }
    );
  }
}
