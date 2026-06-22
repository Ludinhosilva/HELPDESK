"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Navbar,

  NavbarContent,
  NavbarItem,
  Button,
  User as UserUI,
} from "@nextui-org/react";
import {
  IconLayoutDashboard,
  IconTicket,
  IconUsers,
  IconDeviceLaptop,
  IconTool,
  IconLogout,
  IconMenu2,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/core/api-client";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: IconLayoutDashboard,
  },
  {
    label: "Tickets",
    href: "/dashboard/tickets",
    icon: IconTicket,
  },
  {
    label: "Clientes",
    href: "/dashboard/customers",
    icon: IconUsers,
  },
  {
    label: "Equipos",
    href: "/dashboard/devices",
    icon: IconDeviceLaptop,
  },
  {
    label: "Tecnicos",
    href: "/dashboard/technicians",
    icon: IconTool,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <div className="flex h-screen">
      <aside
        className={cn(
          "flex flex-col border-r border-divider bg-background transition-all",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className="flex items-center gap-2 p-4 h-16">
          <IconTool size={24} className="text-primary shrink-0" />
          {!collapsed && (
            <span className="font-bold text-sm">PC Repair</span>
          )}
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "solid" : "light"}
              color={pathname === item.href ? "primary" : "default"}
              startContent={<item.icon size={20} />}
              className={cn(
                "justify-start",
                collapsed && "min-w-0 px-0 justify-center"
              )}
              onPress={() => (window.location.href = item.href)}
            >
              {!collapsed && item.label}
            </Button>
          ))}
        </nav>

        <div className="p-2 border-t border-divider">
          <Button
            variant="light"
            color="danger"
            startContent={<IconLogout size={20} />}
            className={cn(
              "justify-start w-full",
              collapsed && "min-w-0 px-0 justify-center"
            )}
            onPress={handleLogout}
          >
            {!collapsed && "Salir"}
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar maxWidth="full" className="border-b border-divider">
          <NavbarContent>
            <NavbarItem>
              <Button
                isIconOnly
                variant="light"
                onPress={() => setCollapsed(!collapsed)}
              >
                <IconMenu2 size={20} />
              </Button>
            </NavbarItem>
          </NavbarContent>
          <NavbarContent justify="end">
            <NavbarItem>
              <UserUI
                name="Tecnico"
                description="En sesion"
                avatarProps={{
                  size: "sm",
                  radius: "full",
                }}
              />
            </NavbarItem>
          </NavbarContent>
        </Navbar>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
