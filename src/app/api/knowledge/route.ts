import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/prisma";
import { getAuthFromHeaders } from "@/lib/auth-helpers";

const createArticleSchema = z.object({
  title: z.string().min(1, "El titulo es requerido"),
  content: z.string().min(1, "El contenido es requerido"),
  slug: z.string().min(1, "El slug es requerido"),
  categoryId: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
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

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const status = searchParams.get("status") || "PUBLISHED";

    const where: Record<string, unknown> = {
      organizationId: auth.orgId,
      status,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const articles = await prisma.knowledgeArticle.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al obtener articulos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json(
        { error: "forbidden", message: "Solo administradores pueden crear articulos" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createArticleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation_error", message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await prisma.knowledgeArticle.findFirst({
      where: { slug: data.slug, organizationId: auth.orgId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "conflict", message: "Ya existe un articulo con ese slug" },
        { status: 409 }
      );
    }

    const article = await prisma.knowledgeArticle.create({
      data: {
        title: data.title,
        content: data.content,
        slug: data.slug,
        status: data.status,
        categoryId: data.categoryId || null,
        organizationId: auth.orgId,
      },
      include: { category: true },
    });

    return NextResponse.json(article, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al crear articulo" },
      { status: 500 }
    );
  }
}
