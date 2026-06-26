"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ThumbsUp,
  Ticket,
  Pencil,
  Eye,
  Trash2,
} from "lucide-react";
import { apiClient } from "@/core/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: string;
  viewCount: number;
  helpfulCount: number;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  createdAt: string;
}

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  viewCount: number;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");

  const loadArticle = useCallback(async () => {
    try {
      const res = await apiClient<Article>(`/knowledge/${params.id}`);
      setArticle(res);

      const allRes = await apiClient<{ articles: Article[] }>("/knowledge");
      const relatedArticles = allRes.articles
        .filter((a) => a.id !== params.id && a.categoryId === res.categoryId)
        .slice(0, 5);
      setRelated(relatedArticles);
    } catch {
      router.push("/knowledge");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    loadArticle();
    const role = document.cookie
      .split("; ")
      .find((c) => c.startsWith("role="))
      ?.split("=")[1];
    if (role) setUserRole(role);
  }, [loadArticle]);

  async function handleMarkHelpful() {
    try {
      await apiClient(`/knowledge/${params.id}`, {
        method: "PATCH",
        body: { helpfulCount: (article?.helpfulCount || 0) + 1 },
      });
      setArticle((prev) =>
        prev ? { ...prev, helpfulCount: prev.helpfulCount + 1 } : prev
      );
    } catch {
      /* ignore */
    }
  }

  async function handleDelete() {
    if (!confirm("Eliminar este articulo?")) return;
    try {
      await apiClient(`/knowledge/${params.id}`, { method: "DELETE" });
      router.push("/knowledge");
    } catch {
      /* ignore */
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-96" /><div className="grid gap-6 lg:grid-cols-[1fr_300px]"><div className="space-y-4"><Skeleton className="h-40 rounded-lg" /><Skeleton className="h-24 rounded-lg" /></div><Skeleton className="h-48 rounded-lg" /></div></div>;
  }

  if (!article) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{article.title}</h1>
            <Badge variant={article.status === "PUBLISHED" ? "default" : "secondary"}>
              {article.status === "PUBLISHED" ? "Publicado" : "Borrador"}
            </Badge>
          </div>
          {article.category && (
            <Badge variant="outline" className="mt-1">
              {article.category.name}
            </Badge>
          )}
        </div>
        {userRole === "ADMIN" && (
          <div className="flex flex-wrap gap-2">
            <Link href={`/knowledge/${article.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {article.viewCount} vistas
        </span>
        <span className="flex items-center gap-1">
          <ThumbsUp className="h-4 w-4" />
          {article.helpfulCount} utiles
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {article.content}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleMarkHelpful}>
              <ThumbsUp className="mr-2 h-4 w-4" />
              Esto resolvio mi problema
            </Button>
            <Link href="/tickets">
              <Button variant="outline">
                <Ticket className="mr-2 h-4 w-4" />
                Crear ticket
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Articulos relacionados</CardTitle>
            </CardHeader>
            <CardContent>
              {related.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay articulos relacionados
                </p>
              ) : (
                <div className="space-y-3">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={`/knowledge/${r.id}`}
                      className="block text-sm hover:underline"
                    >
                      {r.title}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
