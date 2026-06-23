"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, Shield, Check, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  ticketLimit: number | null;
  features: string;
  isPopular: boolean;
}

interface SubscriptionCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan;
  isUpgrade?: boolean;
}

type CheckoutStep = "FORM" | "PROCESSING" | "APPROVED" | "FAILED";

const processingMessages = [
  "Validando datos de pago...",
  "Comunicando con el banco...",
  "Procesando suscripción...",
  "Suscripción activada con éxito",
];

export function SubscriptionCheckoutModal({ open, onOpenChange, plan, isUpgrade }: SubscriptionCheckoutModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<CheckoutStep>("FORM");
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

  const cardBrand = cardNumber.startsWith("4") ? "Visa" : cardNumber.startsWith("5") ? "Mastercard" : null;

  const features: string[] = plan.features ? JSON.parse(plan.features) : [];

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardNumber || !cardName || !expiry || !cvv) return;

    setStep("PROCESSING");
    setProcessingMsg(0);

    const msgInterval = setInterval(() => {
      setProcessingMsg((prev) => Math.min(prev + 1, 3));
    }, 900);

    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });

      clearInterval(msgInterval);
      setProcessingMsg(3);

      if (res.ok) {
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
  }, [cardNumber, cardName, expiry, cvv, plan.id, onOpenChange, router]);

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
                <CreditCard className="h-5 w-5 text-primary" />
                <DialogTitle>{isUpgrade ? "Cambiar de plan" : "Confirmar suscripción"}</DialogTitle>
              </div>
              <DialogDescription>
                Completa tus datos para {isUpgrade ? "cambiar al plan" : "suscribirte al plan"} <strong>{plan.name}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className={cn("rounded-xl border bg-card p-4 mb-4", plan.isPopular ? "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20" : "")}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{plan.name}</span>
                <span className="text-xl font-bold">S/ {(plan.price / 100).toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">/mes - Cancela cuando quieras</p>
              <ul className="space-y-1">
                {features.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
                {features.length > 4 && (
                  <li className="text-xs text-muted-foreground">+{features.length - 4} beneficios más</li>
                )}
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-number">Número de tarjeta</Label>
                <div className="relative">
                  <Input
                    id="card-number"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    required
                    className="font-mono pr-10"
                  />
                  {cardBrand && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {cardBrand}
                    </span>
                  )}
                </div>
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
                {isUpgrade ? "Cambiar plan" : "Suscribirse"} - S/ {(plan.price / 100).toFixed(2)}/mes
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-lg font-semibold mb-2">
              {isUpgrade ? "Plan cambiado con éxito" : "Suscripción activada"}
            </p>
            <p className="text-sm text-muted-foreground">
              Ya disfrutas del plan {plan.name}. {isUpgrade ? "Tu nueva tarifa se reflejará en el próximo cobro." : "Bienvenido a Flix Support."}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Redirigiendo...</p>
          </div>
        )}

        {step === "FAILED" && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
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
