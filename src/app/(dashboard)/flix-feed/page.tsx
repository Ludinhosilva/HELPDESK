import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/core/prisma";
import FlixFeedGrid from "@/components/flix-feed/FlixFeedGrid";

export const dynamic = "force-dynamic";

export default async function FlixFeedPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  const payload = await verifyToken(token);
  if (!payload) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { organizationId: true },
  });

  if (!user) redirect("/login");

  const orgId = user.organizationId ?? "";

  const tickets = await prisma.ticket.findMany({
    where: {
      organizationId: orgId,
      status: { notIn: ["RESOLVED", "CLOSED"] },
    },
    include: {
      category: { select: { name: true } },
      createdBy: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serializar fechas Date → string para el componente cliente
  const serialized = JSON.parse(JSON.stringify(tickets));

  return <FlixFeedGrid initialTickets={serialized} />;
}
