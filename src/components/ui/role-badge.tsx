import { Badge } from "@/components/ui/badge";
import { getRoleTheme, ROLE_LABELS } from "@/lib/theme";
import { Shield, Building2, Wrench, User } from "lucide-react";

const ROLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  SUPER_ADMIN: Shield,
  ADMIN: Building2,
  TECHNICIAN: Wrench,
  END_USER: User,
};

interface RoleBadgeProps {
  role: string;
  showIcon?: boolean;
  className?: string;
}

export function RoleBadge({ role, showIcon = true, className = "" }: RoleBadgeProps) {
  const theme = getRoleTheme(role);
  const Icon = ROLE_ICONS[role];
  const label = ROLE_LABELS[role] || role;

  return (
    <Badge variant="outline" className={`${theme.badge} gap-1 ${className}`}>
      {showIcon && Icon && <Icon className="h-3 w-3" />}
      {label}
    </Badge>
  );
}
