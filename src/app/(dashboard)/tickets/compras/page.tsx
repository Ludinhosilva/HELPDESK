import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/core/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Zap } from "lucide-react";
import { getSLAInfo, getSLAStatusColor, getSLAStatusLabel } from "@/lib/sla";

export const dynamic = "force-dynamic";

const paymentLabels: Record<string, string> = {
  APPROVED: "Aprobado",
  FAILED: "Rechazado",
  PROCESSING: "Procesando",
  PENDING: "Pendiente",
};

const paymentColors: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700 border-green-200",
  FAILED: "bg-red-100 text-red-700 border-red-200",
  PROCESSING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  PENDING: "bg-gray-100 text-gray-700 border-gray-200",
};

export default async function ComprasPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  const payload = await verifyToken(token);
  if (!payload) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { role: true },
  });
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const tickets = await prisma.ticket.findMany({
    where: {
      organizationId: payload.orgId,
      paymentStatus: { not: "NONE" },
    },
    include: {
      createdBy: { select: { name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/tickets" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" /> Volver a Tickets
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Compras Ticket Exprés</h1>
        <p className="text-muted-foreground text-sm">
          Historial de compras de Ticket Exprés realizadas por usuarios finales
        </p>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No hay compras registradas</p>
            <p className="text-sm">Los usuarios finales pueden comprar Ticket Exprés desde sus tickets.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              {tickets.length} compra{tickets.length !== 1 ? "s" : ""} registrada{tickets.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ticket</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Usuario</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Monto</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vencimiento</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">SLA</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => {
                    const sla = t.slaExpiresAt ? getSLAInfo(t.slaExpiresAt) : null;
                    return (
                      <tr key={t.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/tickets/${t.id}`} className="font-mono font-medium text-primary hover:underline">
                            TK-{t.ticketNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{t.createdBy.name}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={paymentColors[t.paymentStatus]}>
                            {paymentLabels[t.paymentStatus] || t.paymentStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {t.paymentAmount ? `S/ ${(t.paymentAmount / 100).toFixed(2)}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {t.slaExpiresAt
                            ? new Date(t.slaExpiresAt).toLocaleDateString("es-PE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {sla ? (
                            <Badge variant="outline" className={getSLAStatusColor(sla.remainingMinutes)}>
                              {getSLAStatusLabel(sla.remainingMinutes)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
