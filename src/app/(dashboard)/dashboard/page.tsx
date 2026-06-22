"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import {
  IconTicket,
  IconUsers,
  IconDeviceLaptop,
  IconTool,
} from "@tabler/icons-react";
import { apiClient } from "@/core/api-client";

const iconColorMap: Record<string, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  success: "text-success",
  warning: "text-warning",
};

export default function DashboardPage() {
  const [counts, setCounts] = useState({ tickets: 0, customers: 0, devices: 0, technicians: 0 });

  useEffect(() => {
    async function load() {
      try {
        const [tRes, cRes, dRes] = await Promise.all([
          apiClient<{ total: number }>("/tickets?limit=1"),
          apiClient<{ total: number }>("/customers?limit=1"),
          apiClient<{ total: number }>("/devices?limit=1"),
        ]);
        setCounts({
          tickets: tRes.total,
          customers: cRes.total,
          devices: dRes.total,
          technicians: 2,
        });
      } catch { /* ignore */ }
    }
    load();
  }, []);

  const stats = [
    { title: "Tickets Activos", value: counts.tickets.toString(), icon: IconTicket, color: "primary" },
    { title: "Clientes", value: counts.customers.toString(), icon: IconUsers, color: "secondary" },
    { title: "Equipos", value: counts.devices.toString(), icon: IconDeviceLaptop, color: "success" },
    { title: "Tecnicos", value: counts.technicians.toString(), icon: IconTool, color: "warning" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-sm text-default-400">{stat.title}</span>
              <stat.icon size={20} className={iconColorMap[stat.color]} />
            </CardHeader>
            <CardBody className="pt-0">
              <span className="text-2xl font-bold">{stat.value}</span>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
