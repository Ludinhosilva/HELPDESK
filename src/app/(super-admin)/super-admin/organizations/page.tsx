import { prisma } from "@/core/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, Ticket, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuperAdminOrganizations() {
  const orgs = await prisma.organization.findMany({
    include: {
      _count: { select: { users: true, tickets: true } },
      subscription: { select: { status: true, plan: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organizaciones</h1>
        <p className="text-muted-foreground text-sm">
          {orgs.length} empresa{orgs.length !== 1 ? "s" : ""} registrada{orgs.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-4">
        {orgs.map((org) => (
          <Card key={org.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-50">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{org.name}</h3>
                    <p className="text-sm text-muted-foreground">@{org.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">
                    {org.subscription?.plan?.name || "Sin plan"}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/super-admin/organizations/${org.id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {org._count.users} usuarios
                </div>
                <div className="flex items-center gap-1">
                  <Ticket className="h-4 w-4" />
                  {org._count.tickets} tickets
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {orgs.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No hay organizaciones registradas
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
