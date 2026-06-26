"use client";

import { useState } from "react";
import { CardPayment } from "@/components/ui/card-payment";
import { YapePlinPayment } from "@/components/ui/yape-plin-payment";
import { CreditCard, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethodsProps {
  amount: number;
  currency?: string;
  title?: string;
  apiEndpoint: string;
  apiBody: Record<string, unknown>;
  onComplete: () => void;
  onCancel: () => void;
}

type PaymentMethod = "card" | "yape" | "plin";

const tabs: Array<{ id: PaymentMethod; label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = [
  { id: "card", label: "Tarjeta", icon: CreditCard, color: "border-blue-500 text-blue-500" },
  { id: "yape", label: "YAPE", icon: Smartphone, color: "border-purple-500 text-purple-500" },
  { id: "plin", label: "PLIN", icon: Smartphone, color: "border-blue-600 text-blue-600" },
];

export function PaymentMethods({
  amount,
  currency,
  title,
  apiEndpoint,
  apiBody,
  onComplete,
  onCancel,
}: PaymentMethodsProps) {
  const [method, setMethod] = useState<PaymentMethod>("card");

  return (
    <div className="space-y-4">
      {/* Tabs de método */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMethod(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all",
              method === tab.id
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenido según método */}
      {method === "card" && (
        <CardPayment
          amount={amount}
          currency={currency}
          title={title}
          apiEndpoint={apiEndpoint}
          apiBody={apiBody}
          onComplete={onComplete}
          onCancel={onCancel}
        />
      )}

      {(method === "yape" || method === "plin") && (
        <div>
          <input type="hidden" name="paymentMethod" value={method} />
          <YapePlinPayment
            amount={amount}
            currency={currency}
            onComplete={() => {
              // Simular pago: llamar al endpoint igual que tarjeta
              fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...apiBody, paymentMethod: method }),
              }).finally(() => {
                onComplete();
              });
            }}
            onCancel={onCancel}
          />
        </div>
      )}
    </div>
  );
}
