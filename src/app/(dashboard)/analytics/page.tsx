"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { apiClient } from "@/core/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

const Charts = dynamic(() => import("./charts"), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-[372px] rounded-lg" />
      <Skeleton className="h-[372px] rounded-lg" />
      <Skeleton className="h-[372px] rounded-lg lg:col-span-2" />
    </div>
  ),
});

interface Stats {
  byCategory: { category: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byTime: { date: string; count: number }[];
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const res = await apiClient<Stats>("/tickets/stats");
      setStats(res);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Skeleton className="h-[372px] rounded-lg" /><Skeleton className="h-[372px] rounded-lg" /><Skeleton className="h-[372px] rounded-lg lg:col-span-2" /></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" /> Volver al Dashboard
        </Link>
        <h1 className="text-2xl font-bold">Analiticas</h1>
        <p className="text-muted-foreground text-sm">Estadisticas y metricas de tu helpdesk</p>
      </div>
      {stats ? <Charts stats={stats} /> : (
        <div className="text-center py-12 text-muted-foreground">Error al cargar datos</div>
      )}
    </div>
  );
}
