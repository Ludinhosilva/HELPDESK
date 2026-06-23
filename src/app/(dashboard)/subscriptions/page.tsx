"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, ArrowLeft, CreditCard, Calendar, FileText } from "lucide-react";
import { apiClient } from "@/core/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { SubscriptionCheckoutModal } from "@/components/ui/subscription-checkout-modal";
import Link from "next/link";

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  ticketLimit: number | null;
  features: string;
  isPopular: boolean;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reference: string | null;
  createdAt: string;
}

interface Subscription {
  id: string;
  status: string;
  planId: string;
  nextBillingDate: string | null;
  plan: Plan;
  payments: Payment[];
}

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        apiClient<{ plans: Plan[] }>("/subscription-plans").catch(() => ({ plans: [] as Plan[] })),
        apiClient<{ subscription: Subscription | null }>("/subscriptions"),
      ]);
      setPlans(plansRes.plans);
      setSubscription(subRes.subscription);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-48" /><div className="grid gap-6 md:grid-cols-3"><Skeleton className="h-64 rounded-lg" /><Skeleton className="h-64 rounded-lg" /><Skeleton className="h-64 rounded-lg" /></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" /> Volver al Dashboard
        </Link>
        <h1 className="text-2xl font-bold">Suscripción</h1>
        <p className="text-muted-foreground text-sm">
          Elige el plan que mejor se adapte a tu negocio
        </p>
      </div>

      {subscription && (
        <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Plan Actual: {subscription.plan.name}</CardTitle>
                  <CardDescription>
                    S/ {(subscription.plan.price / 100).toFixed(2)}/mes
                  </CardDescription>
                </div>
              </div>
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">Activo</Badge>
            </div>
            {subscription.nextBillingDate && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                <Calendar className="h-3.5 w-3.5" />
                Próximo cobro: {new Date(subscription.nextBillingDate).toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}
              </div>
            )}
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = subscription?.planId === plan.id;
          const features: string[] = plan.features
            ? JSON.parse(plan.features)
            : [];

          return (
            <Card
              key={plan.id}
              className={`relative hover:shadow-lg transition-all hover:-translate-y-0.5 duration-300 ${plan.isPopular ? "border-primary shadow-lg shadow-primary/10" : ""} ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg px-3 py-0.5">
                    <Star className="mr-1 h-3 w-3 fill-white" />
                    Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">S/ {(plan.price / 100).toFixed(2)}</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
                <CardDescription>
                  {plan.ticketLimit
                    ? `${plan.ticketLimit} tickets/mes`
                    : "Tickets ilimitados"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className={`h-4 w-4 shrink-0 ${plan.isPopular ? "text-blue-500" : "text-green-500"}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={isCurrent ? "outline" : plan.isPopular ? "default" : "outline"}
                  disabled={isCurrent}
                  onClick={() => setCheckoutPlan(plan)}
                >
                  {isCurrent ? "Plan Actual" : subscription ? "Cambiar Plan" : "Suscribirse"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {subscription && subscription.payments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Historial de pagos</CardTitle>
            </div>
            <CardDescription>Últimos pagos registrados en tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscription.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {new Date(payment.createdAt).toLocaleDateString("es-PE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {payment.reference || "---"}
                    </TableCell>
                    <TableCell>
                      S/ {(payment.amount / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          payment.status === "SUCCESS"
                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                        }
                      >
                        {payment.status === "SUCCESS" ? "Pagado" : "Rechazado"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {checkoutPlan && (
        <SubscriptionCheckoutModal
          open={!!checkoutPlan}
          onOpenChange={(o) => { if (!o) setCheckoutPlan(null); }}
          plan={checkoutPlan}
          isUpgrade={!!subscription}
        />
      )}
    </div>
  );
}
