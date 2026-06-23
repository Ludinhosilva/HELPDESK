import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/core/prisma";
import { KanbanBoard } from "@/components/ui/kanban-board";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function KanbanPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  const payload = await verifyToken(token);
  if (!payload) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { role: true },
  });
  if (!user) redirect("/login");

  const tickets = await prisma.ticket.findMany({
    where: { organizationId: payload.orgId },
    include: {
      category: { select: { name: true } },
      createdBy: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <Link href="/tickets" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" /> Volver a Tickets
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Tablero Kanban</h1>
        <p className="text-muted-foreground text-sm">
          Arrastra las tarjetas para cambiar el estado del ticket
        </p>
      </div>
      <KanbanBoard tickets={tickets} />
    </div>
  );
}
