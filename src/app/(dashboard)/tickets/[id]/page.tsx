import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/core/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import TicketDetailClient from "./ticket-detail-client";
import CommentSection from "./comment-section";
import { ArrowLeft, User, Tag, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { SLASection } from "./sla-section";
import RunbookButton from "@/components/tickets/RunbookButton";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  OPEN: "Abierto",
  IN_PROGRESS: "En Progreso",
  ON_HOLD: "En Espera",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado",
};

const priorityLabels: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
};

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  IN_PROGRESS: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  ON_HOLD: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  RESOLVED: "bg-green-500/10 text-green-400 border-green-500/20",
  CLOSED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  MEDIUM: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  HIGH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  URGENT: "bg-red-500/10 text-red-400 border-red-500/20",
};

function formatDate(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-PE", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  const payload = await verifyToken(token);
  if (!payload) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, role: true },
  });
  if (!user) redirect("/login");

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      category: { select: { name: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      comments: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
      history: {
        orderBy: { timestamp: "desc" },
      },
      evaluation: true,
    },
  });

  if (!ticket || ticket.organizationId !== payload.orgId) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    where: { organizationId: payload.orgId },
    select: { id: true, name: true },
  });

  const technicians = await prisma.user.findMany({
    where: { organizationId: payload.orgId, role: "TECHNICIAN" },
    select: { id: true, name: true },
  });

  const canChangeStatus = user.role === "ADMIN" || user.role === "TECHNICIAN";
  const canAssign = user.role === "ADMIN";
  const showEvaluation =
    user.role === "END_USER" &&
    (ticket.status === "RESOLVED" || ticket.status === "CLOSED") &&
    !ticket.evaluation;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tickets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">
              TK-{ticket.ticketNumber}
            </h1>
            <Badge variant="outline" className={statusColors[ticket.status]}>
              {statusLabels[ticket.status] || ticket.status}
            </Badge>
            <Badge variant="outline" className={priorityColors[ticket.priority]}>
{priorityLabels[ticket.priority] || ticket.priority}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{ticket.title}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comentarios ({ticket.comments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <CommentSection
                ticketId={ticket.id}
                comments={ticket.comments.map((c) => ({
                  id: c.id,
                  content: c.content,
                  authorName: c.author.name,
                  authorId: c.author.id,
                  createdAt: c.createdAt.toISOString(),
                  isOwn: c.authorId === payload.sub,
                }))}
                currentUserId={payload.sub}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ticket.history.map((h) => (
                  <div
                    key={h.id}
                    className="flex gap-3 text-sm border-l-2 border-border pl-3"
                  >
                    <span className="text-muted-foreground text-xs whitespace-nowrap mt-0.5">
                      {formatDate(h.timestamp)}
                    </span>
                    <div>
                      <span className="font-medium">{h.action}</span>
                      <p className="text-muted-foreground">{h.description}</p>
                    </div>
                  </div>
                ))}
                {ticket.history.length === 0 && (
                  <p className="text-muted-foreground text-sm">Sin historial aún</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <TicketDetailClient
            ticketId={ticket.id}
            currentStatus={ticket.status}
            currentPriority={ticket.priority}
            assignedToId={ticket.assignedTo?.id ?? null}
            canChangeStatus={canChangeStatus}
            canAssign={canAssign}
            categories={categories}
            technicians={technicians}
            currentCategoryId={ticket.categoryId}
            aiSuggestion={ticket.aiCategorySuggested}
          />

          <SLASection
            ticketId={ticket.id}
            ticketNumber={ticket.ticketNumber}
            paymentStatus={ticket.paymentStatus}
            slaExpiresAt={ticket.slaExpiresAt?.toISOString() ?? null}
            userRole={user.role}
          />

          <RunbookButton
            ticketId={ticket.id}
            ticketNumber={ticket.ticketNumber}
            currentStatus={ticket.status}
            onComplete={() => {}}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Creado por</p>
                  <p className="font-medium">{ticket.createdBy.name}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Asignado a</p>
                  <p className="font-medium">{ticket.assignedTo?.name ?? "Sin Asignar"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Categoría</p>
                  <p className="font-medium">{ticket.category?.name ?? "—"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Creado</p>
                  <p className="font-medium">{formatDate(ticket.createdAt)}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Resuelto</p>
                  <p className="font-medium">{formatDate(ticket.resolvedAt)}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Cerrado</p>
                  <p className="font-medium">{formatDate(ticket.closedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {showEvaluation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Calificar este Servicio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <form key={star} action={`/api/tickets/${ticket.id}/evaluate`} method="POST">
                      <input type="hidden" name="rating" value={star} />
                      <button
                        type="submit"
                        className="text-2xl text-muted-foreground hover:text-yellow-400 transition-colors"
                      >
                        ★
                      </button>
                    </form>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Haz clic en una estrella para calificar</p>
              </CardContent>
            </Card>
          )}

          {ticket.evaluation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Evaluación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${star <= ticket.evaluation!.rating ? "text-yellow-400" : "text-muted-foreground"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                {ticket.evaluation.comment && (
                  <p className="text-sm text-muted-foreground">
                    {ticket.evaluation.comment}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
