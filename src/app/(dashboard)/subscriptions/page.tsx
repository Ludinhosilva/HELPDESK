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
import { Check, Star, Loader2, ArrowLeft } from "lucide-react";
import { apiClient } from "@/core/api-client";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
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

interface Subscription {
  id: string;
  status: string;
  planId: string;
  nextBillingDate: string | null;
  plan: Plan;
}

export default function SubscriptionsPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

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

  async function handleSubscribe(planId: string) {
    setSubscribing(planId);
    try {
      await apiClient("/subscriptions", { method: "POST", body: { planId } });
      await loadData();
    } catch (err) {
      toast({ type: "error", title: "Error", description: err instanceof Error ? err.message : "Error al procesar" });
    } finally {
      setSubscribing(null);
    }
  }

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-48" /><div className="grid gap-6 md:grid-cols-3"><Skeleton className="h-64 rounded-lg" /><Skeleton className="h-64 rounded-lg" /><Skeleton className="h-64 rounded-lg" /></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" /> Volver al Dashboard
        </Link>
        <h1 className="text-2xl font-bold">Suscripcion</h1>
        <p className="text-muted-foreground text-sm">
          Elige el plan que mejor se adapte a tu negocio
        </p>
      </div>

      {subscription && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Plan Actual: {subscription.plan.name}</CardTitle>
              <Badge variant="default">Activo</Badge>
            </div>
              <CardDescription>
                S/ {(subscription.plan.price / 100).toFixed(2)}/mes
              {subscription.nextBillingDate && (
                <> - Proximo cobro: {new Date(subscription.nextBillingDate).toLocaleDateString()}</>
              )}
            </CardDescription>
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
              className={`relative hover:shadow-md transition-shadow ${plan.isPopular ? "border-primary shadow-lg" : ""} ${isCurrent ? "ring-2 ring-primary" : ""}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">
                    <Star className="mr-1 h-3 w-3" />
                    Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pt-8">
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">S/ {(plan.price / 100).toFixed(2)}</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
                <CardDescription>
                  {plan.ticketLimit
                    ? `${plan.ticketLimit} tickets/mes`
                    : "Tickets ilimitados"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={isCurrent ? "outline" : plan.isPopular ? "default" : "outline"}
                  disabled={isCurrent || subscribing === plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {subscribing === plan.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isCurrent ? "Plan Actual" : subscription ? "Cambiar Plan" : "Suscribirse"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
