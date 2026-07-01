"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, CreditCard, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PasswordInput } from "@/components/ui/password-input";

interface CardPaymentProps {
  amount: number;
  currency?: string;
  onComplete: () => void;
  onCancel: () => void;
  apiEndpoint: string;
  apiBody: Record<string, unknown>;
  title?: string;
}

const brandColors: Record<string, string> = {
  visa: "from-blue-700 via-blue-600 to-indigo-800",
  mastercard: "from-orange-600 via-red-600 to-orange-700",
  default: "from-slate-700 via-slate-600 to-slate-800",
};

const brandLogos: Record<string, string> = {
  visa: "VISA",
  mastercard: "Mastercard",
  default: "",
};

function detectBrand(number: string): string {
  const clean = number.replace(/\s/g, "");
  if (clean.startsWith("4")) return "visa";
  if (clean.startsWith("5")) return "mastercard";
  return "default";
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  const groups = digits.match(/.{1,4}/g) || [];
  return groups.join(" ");
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

export function CardPayment({
  amount,
  currency = "PEN",
  onComplete,
  onCancel,
  apiEndpoint,
  apiBody,
  title = "Pago Premium",
}: CardPaymentProps) {
  const [step, setStep] = useState<"form" | "processing" | "done" | "failed">("form");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processingStep, setProcessingStep] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const brand = detectBrand(cardNumber);
  const gradient = brandColors[brand];
  const brandName = brandLogos[brand];

  const processingMessages = [
    "Validando tarjeta...",
    "Comunicando con el banco...",
    "Procesando pago...",
    "Pago aprobado con éxito",
  ];

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCardNumber(formatCardNumber(e.target.value));
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCardName(e.target.value.toUpperCase());
  }

  function handleExpiryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setExpiry(formatExpiry(e.target.value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, "").length < 16 || !cardName || expiry.length < 5 || cvv.length < 3) return;

    setStep("processing");
    setProcessingStep(0);

    for (let i = 0; i < processingMessages.length; i++) {
      await new Promise((r) => setTimeout(r, 800));
      setProcessingStep(i + 1);
    }

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiBody),
      });

      if (res.ok) {
        setStep("done");
        setTimeout(() => onComplete(), 2000);
      } else {
        setStep("failed");
      }
    } catch {
      setStep("failed");
    }
  }

  const displayNumber = cardNumber || "•••• •••• •••• ••••";
  const displayName = cardName || "TITULAR DE LA TARJETA";
  const displayExpiry = expiry || "MM/AA";

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Pago simulado &mdash; Solo con fines demostrativos
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tarjeta de crédito visual */}
        <div
          ref={cardRef}
          className={cn(
            "relative w-full h-36 rounded-xl p-4 text-white shadow-xl transition-all duration-500",
            "bg-gradient-to-br",
            gradient
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <CreditCard className="h-4 w-4 opacity-70" />
            <span className="text-sm font-bold tracking-widest italic opacity-90">
              {brandName}
            </span>
          </div>

          <div className="text-lg font-mono tracking-[0.25em] mb-4 drop-shadow-sm">
            {displayNumber}
          </div>

          <div className="flex justify-between text-[10px]">
            <div className="min-w-0 flex-1 mr-2">
              <p className="opacity-60 mb-0.5">TITULAR</p>
              <p className="font-mono tracking-wider text-xs truncate max-w-[140px]">
                {displayName}
              </p>
            </div>
            <div>
              <p className="opacity-60 mb-0.5">VENCE</p>
              <p className="font-mono tracking-wider text-xs">{displayExpiry}</p>
            </div>
          </div>

          {/* Chip dorado */}
          <div className="absolute top-4 left-4 h-7 w-10 rounded bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-80 shadow-inner border border-yellow-600/30" />
        </div>

        {/* Formulario */}
        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Número de tarjeta</label>
              <div className="relative">
                <Input
                  value={cardNumber}
                  onChange={handleNumberChange}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  className="font-mono text-base tracking-widest pl-9 h-10"
                  autoComplete="cc-number"
                />
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                {brandName && (
                  <Badge variant="outline" className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0 h-5">
                    {brandName}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Titular de la tarjeta</label>
              <Input
                value={cardName}
                onChange={handleNameChange}
                placeholder="LUDWING SILVA"
                className="font-mono tracking-wider h-10"
                autoComplete="cc-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Vencimiento</label>
                <Input
                  value={expiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/AA"
                  maxLength={5}
                  className="font-mono h-10"
                  autoComplete="cc-exp"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">CVV</label>
                <PasswordInput
                  value={cvv}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setCvv(digits);
                  }}
                  placeholder="•••"
                  className="font-mono h-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-0.5">
              <Lock className="h-3 w-3 shrink-0" />
              <span>Pago 100% seguro — Solo con fines demostrativos</span>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1 h-10" onClick={onCancel}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/25"
                disabled={cardNumber.replace(/\s/g, "").length < 16 || !cardName || expiry.length < 5 || cvv.length < 3}
              >
                <Lock className="mr-1.5 h-3.5 w-3.5" />
                Pagar S/{(amount / 100).toFixed(2)}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Procesando */}
      {step === "processing" && (
        <div className="text-center py-8 space-y-4">
          <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-muted animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent animate-spin" />
          </div>
          <div className="space-y-1">
            {processingMessages.map((msg, i) => (
              <p
                key={msg}
                className={cn(
                  "text-sm transition-all duration-300",
                  i < processingStep ? "text-foreground" : "text-muted-foreground/30",
                  i === processingStep - 1 && "font-medium"
                )}
              >
                {i < processingStep && <CheckCircle2 className="inline h-3.5 w-3.5 mr-1.5 text-green-500" />}
                {msg}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Éxito */}
      {step === "done" && (
        <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">¡Pago aprobado!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Se ha cobrado S/{(amount / 100).toFixed(2)} {currency} de tu tarjeta {brandName || ""}
            </p>
          </div>
        </div>
      )}

      {/* Fallo */}
      {step === "failed" && (
        <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">Pago rechazado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Fondos insuficientes o tarjeta inválida. Intenta con otra tarjeta.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setStep("form");
                setCvv("");
              }}
            >
              Intentar de nuevo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
