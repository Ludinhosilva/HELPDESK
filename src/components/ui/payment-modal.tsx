"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Shield } from "lucide-react";
import { SLA_PREMIUM_PRICE } from "@/lib/sla";
import { PaymentMethods } from "@/components/ui/payment-methods";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  ticketNumber: number;
}

export function PaymentModal({ open, onOpenChange, ticketId, ticketNumber }: PaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <DialogTitle>Pago Premium - Ticket Exprés</DialogTitle>
          </div>
          <DialogDescription>
            Activa Ticket Exprés para el ticket <span className="font-mono font-semibold">TK-{ticketNumber}</span> y recibe respuesta garantizada en menos de 2 horas.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-muted p-3 mb-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Ticket Exprés - Respuesta &lt; 2h</span>
            <span className="text-lg font-bold">S/ {(SLA_PREMIUM_PRICE / 100).toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Prioridad Urgente + tiempo de respuesta garantizado</p>
        </div>

        <PaymentMethods
          amount={SLA_PREMIUM_PRICE}
          title="Ticket Exprés"
          apiEndpoint="/api/payments"
          apiBody={{ ticketId }}
          onComplete={() => {
            setTimeout(() => {
              onOpenChange(false);
            }, 2000);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
