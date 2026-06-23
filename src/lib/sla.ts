export const SLA_PREMIUM_PRICE = 2000;
export const SLA_PREMIUM_HOURS = 2;

export interface SLAInfo {
  isPremium: boolean;
  expiresAt: Date | null;
  remainingMinutes: number;
  isExpired: boolean;
}

export function getSLAInfo(slaExpiresAt: Date | null): SLAInfo {
  if (!slaExpiresAt) {
    return { isPremium: false, expiresAt: null, remainingMinutes: 0, isExpired: false };
  }
  const now = new Date();
  const remaining = Math.max(0, Math.floor((slaExpiresAt.getTime() - now.getTime()) / 60000));
  return {
    isPremium: remaining > 0,
    expiresAt: slaExpiresAt,
    remainingMinutes: remaining,
    isExpired: remaining <= 0,
  };
}

export function calculateSLAExpiry(): Date {
  return new Date(Date.now() + SLA_PREMIUM_HOURS * 60 * 60 * 1000);
}

export function checkSLAViolation(createdAt: Date, slaExpiresAt: Date | null): boolean {
  if (!slaExpiresAt) return false;
  return new Date() > slaExpiresAt;
}

export function getSLAStatusColor(remainingMinutes: number): string {
  if (remainingMinutes <= 0) return "bg-red-100 text-red-700 border-red-200";
  if (remainingMinutes <= 30) return "bg-orange-100 text-orange-700 border-orange-200";
  if (remainingMinutes <= 60) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-green-100 text-green-700 border-green-200";
}

export function getSLAStatusLabel(remainingMinutes: number): string {
  if (remainingMinutes <= 0) return "Vencido";
  if (remainingMinutes <= 30) return `Restan ${remainingMinutes} min`;
  if (remainingMinutes <= 60) return `${remainingMinutes} min restantes`;
  return `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m restantes`;
}
