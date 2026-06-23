"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Eye,
  ThumbsUp,
  BookOpen,
} from "lucide-react";
import { apiClient } from "@/core/api-client";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: string;
  viewCount: number;
  helpfulCount: number;
  categoryId: string | null;
  category: Category | null;
  createdAt: string;
}

export default function KnowledgePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [loading, setLoading] = useState(false);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryId && categoryId !== "all") params.set("categoryId", categoryId);
      const res = await apiClient<{ articles: Article[] }>(`/knowledge?${params}`);
      setArticles(res.articles);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [search, categoryId]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await apiClient<{ categories: Category[] }>("/categories");
      setCategories(res.categories);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Base de Conocimiento</h1>
          <p className="text-muted-foreground text-sm">
            Articulos y guias para resolver problemas
          </p>
        </div>
        <Link href="/knowledge/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Articulo
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar articulos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas las categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-5 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No se encontraron articulos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article, index) => (
            <Link key={article.id} href={`/knowledge/${article.id}`}>
              <Card className="group hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-lg border bg-card" style={{ animationDelay: `${index * 50}ms` }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <Badge variant={article.status === "PUBLISHED" ? "default" : "secondary"}>
                      {article.status === "PUBLISHED" ? "Publicado" : "Borrador"}
                    </Badge>
                  </div>
                  {article.category && (
                    <Badge variant="outline">{article.category.name}</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-3">
                    {article.content.substring(0, 150)}...
                  </CardDescription>
                </CardContent>
                <CardFooter className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {article.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {article.helpfulCount}
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
