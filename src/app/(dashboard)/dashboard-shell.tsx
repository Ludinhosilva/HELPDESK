"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  BookOpen,
  User,
  Users,
  Tags,
  BarChart3,
  CreditCard,
  Mail,
  Settings,
  Menu,
  LogOut,
  Wrench,
  Columns3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import { NotificationsBell } from "@/components/notifications";

interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
  organization: { name: string };
}

const allNavItems = [
  { label: "Panel Principal", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "TECHNICIAN", "END_USER"] },
  { label: "Tickets", href: "/tickets", icon: Ticket, roles: ["ADMIN", "TECHNICIAN", "END_USER"] },
  { label: "Tablero Kanban", href: "/tickets/kanban", icon: Columns3, roles: ["ADMIN", "TECHNICIAN"] },
  { label: "Base de Conocimiento", href: "/knowledge", icon: BookOpen, roles: ["ADMIN", "TECHNICIAN", "END_USER"] },
  { label: "Perfil", href: "/profile", icon: User, roles: ["ADMIN", "TECHNICIAN", "END_USER"] },
  { label: "Usuarios", href: "/users", icon: Users, roles: ["ADMIN"] },
  { label: "Categorías", href: "/categories", icon: Tags, roles: ["ADMIN"] },
  { label: "Analíticas", href: "/analytics", icon: BarChart3, roles: ["ADMIN"] },
  { label: "Suscripciones", href: "/subscriptions", icon: CreditCard, roles: ["ADMIN"] },
  { label: "Logs de Email", href: "/emails", icon: Mail, roles: ["ADMIN"] },
  { label: "Configuración", href: "/settings", icon: Settings, roles: ["ADMIN"] },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserPayload;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navItems = allNavItems.filter((item) => item.roles.includes(user.role));

  function handleLogout() {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  }

  function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden lg:flex lg:flex-col w-[260px] border-r border-border bg-card/80 backdrop-blur-xl">
        <div className="flex items-center gap-2 px-5 h-16 border-b border-border shrink-0">
          <Wrench className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg">ServiDesk</span>
        </div>
        <SidebarNav />
        <div className="p-3 border-t border-border shrink-0">
          <p className="text-xs text-muted-foreground px-3 truncate">
            {user.organization.name}
          </p>
        </div>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center h-16 border-b border-border px-4 lg:px-6 shrink-0 bg-card/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="lg:hidden mr-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] p-0">
                <SheetHeader className="px-5 h-16 border-b border-border flex flex-row items-center">
                  <Wrench className="h-5 w-5 text-primary mr-2" />
                  <SheetTitle>ServiDesk</SheetTitle>
                </SheetHeader>
                <SidebarNav onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-1">
            <DarkModeToggle />
            <NotificationsBell />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 gap-2 px-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline-flex text-sm font-medium">
                  {user.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role.replace("_", " ").toLowerCase()}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              {user.role === "ADMIN" && (
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
