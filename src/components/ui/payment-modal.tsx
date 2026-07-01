"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Shield } from "lucide-react";
import { SLA_PREMIUM_PRICE } from "@/lib/sla";
import { PaymentMethods } from "@/components/ui/payment-methods";
import Image from "next/image";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  ticketNumber: number;
}

export function PaymentModal({ open, onOpenChange, ticketId, ticketNumber }: PaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90dvh] overflow-hidden flex flex-col p-4 sm:p-6">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <DialogTitle>Pago Premium - Ticket Exprés</DialogTitle>
          </div>
          <DialogDescription>
            Activa Ticket Exprés para el ticket <span className="font-mono font-semibold">TK-{ticketNumber}</span> y recibe respuesta garantizada en menos de 2 horas.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 min-h-0 mt-3 space-y-3">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ticket Exprés - Respuesta &lt; 2h</span>
              <span className="text-lg font-bold">S/ {(SLA_PREMIUM_PRICE / 100).toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Prioridad Urgente + tiempo de respuesta garantizado</p>
          </div>

          <div className="flex items-center justify-center gap-3 py-1">
            <div className="flex items-center gap-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 px-2.5 py-1.5">
              <Image src="/yape-logo.png" alt="YAPE" width={44} height={18} className="object-contain" />
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 px-2.5 py-1.5">
              <Image src="/plin-logo.png" alt="PLIN" width={44} height={18} className="object-contain" />
            </div>
            <span className="rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-bold text-white tracking-wider">VISA</span>
            <span className="rounded-lg bg-gray-800 dark:bg-white dark:text-gray-900 px-2 py-1 text-[10px] font-bold text-white tracking-wider">MC</span>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
