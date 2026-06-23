"use client";

import { useState } from "react";
import { PaymentModal } from "@/components/ui/payment-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Download } from "lucide-react";
import { SLA_PREMIUM_PRICE, getSLAInfo, getSLAStatusColor, getSLAStatusLabel } from "@/lib/sla";

interface SLASectionProps {
  ticketId: string;
  ticketNumber: number;
  paymentStatus: string;
  slaExpiresAt: string | null;
}

export function SLASection({ ticketId, ticketNumber, paymentStatus, slaExpiresAt }: SLASectionProps) {
  const [showPayment, setShowPayment] = useState(false);

  const sla = getSLAInfo(slaExpiresAt ? new Date(slaExpiresAt) : null);
  const isPaid = paymentStatus === "APPROVED";

  async function handleDownloadInvoice() {
    const { default: jsPDF } = await import("jspdf");

    const doc = new jsPDF({ format: "a5" });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("ServiDesk", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Boleta de Pago - Ticket Exprés", pageWidth / 2, 28, { align: "center" });

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 32, pageWidth - 14, 32);

    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const lines = [
      { label: "Ticket:", value: `TK-${ticketNumber}` },
      { label: "Servicio:", value: "Ticket Exprés - Respuesta < 2h" },
      { label: "Monto:", value: `S/ ${(SLA_PREMIUM_PRICE / 100).toFixed(2)}` },
      { label: "Estado:", value: "APROBADO" },
      { label: "Fecha:", value: new Date().toLocaleDateString("es-PE") },
      { label: "Vence:", value: slaExpiresAt ? new Date(slaExpiresAt).toLocaleDateString("es-PE") : "—" },
    ];

    let y = 40;
    lines.forEach((line) => {
      doc.text(line.label, 18, y);
      doc.text(line.value, pageWidth / 2 + 10, y);
      y += 7;
    });

    doc.setDrawColor(200, 200, 200);
    doc.line(14, y + 2, pageWidth - 14, y + 2);

    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("Documento generado electronicamente - Proyecto academico UNAP 2026", pageWidth / 2, y + 10, { align: "center" });

    doc.save(`boleta-Ticket-Expres-TK-${ticketNumber}.pdf`);
  }

  return (
    <>
      <Card className={isPaid ? "border-green-300 dark:border-green-700" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Ticket Exprés
            </CardTitle>
            {isPaid && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <Zap className="h-3 w-3 mr-1" /> Activo
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isPaid && sla ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tiempo restante</span>
                <Badge variant="outline" className={getSLAStatusColor(sla.remainingMinutes)}>
                  {getSLAStatusLabel(sla.remainingMinutes)}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Prioridad</span>
                <Badge className="bg-red-100 text-red-700 border-red-200">Urgente</Badge>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${Math.min(100, (sla.remainingMinutes / 120) * 100)}%` }}
                />
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={handleDownloadInvoice}>
                <Download className="h-3 w-3 mr-2" />
                Descargar Boleta
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Activa Ticket Exprés para recibir respuesta en menos de <strong>2 horas</strong> y prioridad <strong>Urgente</strong>.
              </p>
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Ticket Exprés</span>
                  <span className="font-bold">S/ {(SLA_PREMIUM_PRICE / 100).toFixed(2)}</span>
                </div>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  <li>• Respuesta garantizada &lt; 2 horas</li>
                  <li>• Prioridad Urgente automatica</li>
                  <li>• Soporte prioritario</li>
                </ul>
              </div>
              <Button className="w-full" onClick={() => setShowPayment(true)} disabled={paymentStatus === "PROCESSING"}>
                <Zap className="h-4 w-4 mr-2" />
                {paymentStatus === "PROCESSING" ? "Procesando..." : "Subir a Ticket Exprés - S/ 20.00"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <PaymentModal
        open={showPayment}
        onOpenChange={setShowPayment}
        ticketId={ticketId}
        ticketNumber={ticketNumber}
      />
    </>
  );
}
