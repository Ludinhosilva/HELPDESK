"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreditCard, Check } from "lucide-react";
import { PaymentMethods } from "@/components/ui/payment-methods";
import Image from "next/image";

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

export function SubscriptionCheckoutModal({ open, onOpenChange, plan, isUpgrade }: SubscriptionCheckoutModalProps) {
  let features: string[] = [];
  try {
    features = JSON.parse(plan.features);
  } catch {
    features = [plan.features];
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90dvh] overflow-hidden flex flex-col p-4 sm:p-6">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <DialogTitle>
              {isUpgrade ? "Cambiar a " : "Suscribirse a "}
              {plan.name}
            </DialogTitle>
          </div>
          <DialogDescription>
            Activa tu suscripción al plan {plan.name} y desbloquea todas las funcionalidades.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 min-h-0 mt-3 space-y-3">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Plan {plan.name}</span>
              <span className="text-lg font-bold">
                {plan.price > 0 ? `S/ ${(plan.price / 100).toFixed(2)}/mes` : "Gratis"}
              </span>
            </div>
            <ul className="space-y-1">
              {features.slice(0, 5).map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {plan.price > 0 ? (
            <>
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
                amount={plan.price}
                title={`Plan ${plan.name}`}
                apiEndpoint="/api/subscriptions"
                apiBody={{ planId: plan.id }}
                onComplete={() => {
                  setTimeout(() => {
                    onOpenChange(false);
                    window.location.reload();
                  }, 2000);
                }}
                onCancel={() => onOpenChange(false)}
              />
            </>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const res = await fetch("/api/subscriptions", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ planId: plan.id }),
                });
                if (res.ok) {
                  onOpenChange(false);
                  window.location.reload();
                }
              }}
            >
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
              >
                Activar plan {plan.name}
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
