"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

interface CategoryStat { category: string; count: number }
interface StatusStat { status: string; count: number }
interface TimeStat { date: string; count: number }

interface Stats {
  byCategory: CategoryStat[];
  byStatus: StatusStat[];
  byTime: TimeStat[];
}

export default function Charts({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5" />
            Tickets por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.byCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No hay datos disponibles</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0088FE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PieChartIcon className="h-5 w-5" />
            Distribucion por Estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.byStatus.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No hay datos disponibles</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.byStatus} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884D8" dataKey="count" nameKey="status">
                  {stats.byStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5" />
            Tickets en los Ultimos 30 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.byTime.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No hay datos disponibles</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.byTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}`; }} />
                <YAxis />
                <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                <Legend />
                <Line type="monotone" dataKey="count" name="Tickets" stroke="#0088FE" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}