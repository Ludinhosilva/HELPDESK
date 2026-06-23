"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, Shield } from "lucide-react";
import { SLA_PREMIUM_PRICE } from "@/lib/sla";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  ticketNumber: number;
}

type PaymentStep = "FORM" | "PROCESSING" | "APPROVED" | "FAILED";

const processingMessages = [
  "Validando tarjeta...",
  "Comunicando con el banco...",
  "Procesando pago...",
  "Pago aprobado con éxito",
];

export function PaymentModal({ open, onOpenChange, ticketId, ticketNumber }: PaymentModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<PaymentStep>("FORM");
  const [processingMsg, setProcessingMsg] = useState(0);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardNumber || !cardName || !expiry || !cvv) return;

    setStep("PROCESSING");
    setProcessingMsg(0);

    const msgInterval = setInterval(() => {
      setProcessingMsg((prev) => Math.min(prev + 1, 3));
    }, 800);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });

      clearInterval(msgInterval);
      setProcessingMsg(3);

      const data = await res.json();

      if (data.status === "APPROVED") {
        setStep("APPROVED");
        setTimeout(() => {
          onOpenChange(false);
          router.refresh();
        }, 2500);
      } else {
        setStep("FAILED");
      }
    } catch {
      clearInterval(msgInterval);
      setStep("FAILED");
    }
  }, [cardNumber, cardName, expiry, cvv, ticketId, onOpenChange, router]);

  function handleClose() {
    setStep("FORM");
    setCardNumber("");
    setCardName("");
    setExpiry("");
    setCvv("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        {step === "FORM" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <DialogTitle>Pago Seguro - Ticket Exprés</DialogTitle>
              </div>
              <DialogDescription>
                Activa Ticket Exprés para el ticket <span className="font-mono font-semibold">TK-{ticketNumber}</span> y recibe respuesta garantizada en menos de 2 horas.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg bg-muted p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ticket Exprés - Respuesta &lt; 2h</span>
                <span className="text-lg font-bold">S/ {(SLA_PREMIUM_PRICE / 100).toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Prioridad Urgente + tiempo de respuesta garantizado</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-number">Numero de tarjeta</Label>
                <Input
                  id="card-number"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  required
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-name">Titular de la tarjeta</Label>
                <Input
                  id="card-name"
                  placeholder="Como aparece en la tarjeta"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Vencimiento</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/AA"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    required
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    maxLength={4}
                    required
                    className="font-mono"
                    type="password"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                Pago simulado 100% seguro - Solo con fines demostrativos
              </div>

              <Button type="submit" className="w-full" disabled={!cardNumber || !cardName || !expiry || !cvv}>
                Pagar S/ {(SLA_PREMIUM_PRICE / 100).toFixed(2)}
              </Button>
            </form>
          </>
        )}

        {step === "PROCESSING" && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-semibold mb-2">Procesando pago</p>
            <p className="text-sm text-muted-foreground animate-pulse">
              {processingMessages[Math.min(processingMsg, 3)]}
            </p>
          </div>
        )}

        {step === "APPROVED" && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-lg font-semibold mb-2">Pago aprobado</p>
            <p className="text-sm text-muted-foreground">
              Ticket Exprés activado para TK-{ticketNumber}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Redirigiendo...
            </p>
          </div>
        )}

        {step === "FAILED" && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-lg font-semibold mb-2">Pago rechazado</p>
            <p className="text-sm text-muted-foreground mb-6">
              Fondos insuficientes. Verifica los datos e intenta nuevamente.
            </p>
            <Button onClick={() => setStep("FORM")} className="w-full">
              Intentar de nuevo
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
