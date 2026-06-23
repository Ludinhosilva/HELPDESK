"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Mail, ArrowLeft } from "lucide-react";
import { apiClient } from "@/core/api-client";
import { TableSkeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  type: string;
  sentAt: string;
}

const typeLabels: Record<string, string> = {
  TICKET_CREATED: "Ticket Creado",
  TICKET_UPDATED: "Ticket Actualizado",
  TICKET_RESOLVED: "Ticket Resuelto",
  TICKET_ASSIGNED: "Ticket Asignado",
  WELCOME: "Bienvenida",
  PASSWORD_RESET: "Recuperar Contraseña",
  NOTIFICATION: "Notificacion",
};

export default function EmailsPage() {
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEmails = useCallback(async () => {
    try {
      const res = await apiClient<{ emails: EmailLog[] }>("/emails");
      setEmails(res.emails);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" /> Volver al Dashboard
        </Link>
        <h1 className="text-2xl font-bold">Logs de Email</h1>
        <p className="text-muted-foreground text-sm">
          Historial de correos enviados por el sistema
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Para</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-4">
                    <TableSkeleton rows={4} cols={4} />
                  </TableCell>
                </TableRow>
              ) : emails.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No hay emails registrados</p>
                  </TableCell>
                </TableRow>
              ) : (
                emails.map((email) => (
                  <TableRow key={email.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{email.to}</TableCell>
                    <TableCell>{email.subject}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">
                        {typeLabels[email.type] || email.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {new Date(email.sentAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
