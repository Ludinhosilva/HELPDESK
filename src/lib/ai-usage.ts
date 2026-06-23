import { prisma } from "@/core/prisma";

const UPSELL_MESSAGE =
  "✨ **¿Necesitas más asistencia con IA?**\n\nPara mejorar la experiencia y servicio, le ofrecemos los servicios Premium. Con el plan **Básico (S/29.00/mes)** obtienes **IA ilimitada**, tickets ilimitados y más beneficios.\n\n👉 [Ver planes](/subscriptions)";

export interface AIAccessResult {
  allowed: boolean;
  message?: string;
}

export async function checkAiUsage(orgId: string): Promise<AIAccessResult> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { subscription: { include: { plan: true } } },
  });

  if (!org) {
    return { allowed: false, message: "Organización no encontrada" };
  }

  const planSlug = org.subscription?.plan?.slug || "free";

  if (planSlug === "pro" || planSlug === "basico") {
    return { allowed: true };
  }

  if (org.aiUsageCount >= 1) {
    return { allowed: false, message: UPSELL_MESSAGE };
  }

  await prisma.organization.update({
    where: { id: orgId },
    data: { aiUsageCount: { increment: 1 } },
  });

  return { allowed: true };
}
