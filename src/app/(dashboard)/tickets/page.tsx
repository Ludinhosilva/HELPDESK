"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Chip,
} from "@nextui-org/react";
import {
  IconPlus,
  IconSearch,
  IconEye,
  IconUserCheck,
} from "@tabler/icons-react";
import { apiClient } from "@/core/api-client";

interface Ticket {
  id: string;
  ticketNumber: number;
  description: string;
  status: string;
  priority: string;
  cost: number;
  notes: string | null;
  createdAt: string;
  customer: { id: string; name: string; phone: string };
  device: { id: string; brand: string; model: string; serial: string; type: string };
  technician: { id: string; name: string } | null;
  history?: { id: string; action: string; description: string; timestamp: string }[];
}

interface Customer { id: string; name: string; }
interface Device { id: string; brand: string; model: string; serial: string; customerId: string; }

const statusColorMap: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  RECEIVED: "primary",
  DIAGNOSING: "secondary",
  REPAIRING: "warning",
  WAITING_PARTS: "warning",
  READY: "success",
  DELIVERED: "default",
};

const priorityColorMap: Record<string, "default" | "success" | "warning" | "danger"> = {
  LOW: "default",
  MEDIUM: "success",
  HIGH: "warning",
  CRITICAL: "danger",
};

const statusLabels: Record<string, string> = {
  RECEIVED: "Recibido",
  DIAGNOSING: "Diagnosticando",
  REPAIRING: "Reparando",
  WAITING_PARTS: "Esperando repuestos",
  READY: "Listo",
  DELIVERED: "Entregado",
};

const statusOptions = [
  { key: "", label: "Todos" },
  ...Object.entries(statusLabels).map(([key, label]) => ({ key, label })),
];

export default function TicketsPage() {
  const createModal = useDisclosure();
  const detailModal = useDisclosure();
  const assignModal = useDisclosure();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [technicians, setTechnicians] = useState<{ id: string; name: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [formData, setFormData] = useState({
    customerId: "",
    deviceId: "",
    description: "",
    priority: "MEDIUM",
    cost: 0,
    notes: "",
  });

  const [assignTechId, setAssignTechId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const res = await apiClient<{ tickets: Ticket[]; total: number }>(
        `/tickets?${params}`
      );
      setTickets(res.tickets);
      setTotal(res.total);
    } catch { setError("Error al cargar tickets"); }
    finally { setLoading(false); }
  }, [search, status]);

  const loadFormData = useCallback(async () => {
    try {
      const [cRes, dRes] = await Promise.all([
        apiClient<{ customers: Customer[] }>("/customers?limit=100"),
        apiClient<{ devices: Device[] }>("/devices?limit=100"),
      ]);
      setCustomers(cRes.customers);
      setDevices(dRes.devices);
    } catch { /* ignore */ }
  }, []);

  const loadTechnicians = useCallback(async () => {
    try {
      const res = await apiClient<{ users: { id: string; name: string }[] }>("/users");
      setTechnicians(res.users || []);
    } catch {}
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);
  useEffect(() => { loadFormData(); }, [loadFormData]);

  function openCreate() {
    loadFormData();
    setFormData({ customerId: "", deviceId: "", description: "", priority: "MEDIUM", cost: 0, notes: "" });
    setError("");
    createModal.onOpen();
  }

  async function openDetail(ticket: Ticket) {
    try {
      const full = await apiClient<Ticket & { history?: { id: string; action: string; description: string; timestamp: string }[] }>(`/tickets/${ticket.id}`);
      setSelectedTicket(full as Ticket);
    } catch {
      setSelectedTicket(ticket);
    }
    detailModal.onOpen();
  }

  function openAssign(ticket: Ticket) {
    setSelectedTicket(ticket);
    setAssignTechId("");
    loadTechnicians();
    assignModal.onOpen();
  }

  async function handleCreate() {
    setError("");
    setSubmitting(true);
    try {
      await apiClient("/tickets", { method: "POST", body: { ...formData, cost: Number(formData.cost) * 100 } });
      createModal.onClose();
      await loadTickets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear");
    } finally { setSubmitting(false); }
  }

  async function handleAssign() {
    setError("");
    setSubmitting(true);
    try {
      await apiClient(`/tickets/${selectedTicket!.id}`, {
        method: "PATCH",
        body: { technicianId: assignTechId },
      });
      assignModal.onClose();
      await loadTickets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al asignar");
    } finally { setSubmitting(false); }
  }

  async function handleStatusChange(ticketId: string, newStatus: string) {
    try {
      await apiClient(`/tickets/${ticketId}`, {
        method: "PUT",
        body: { status: newStatus },
      });
      await loadTickets();
    } catch { setError("Error al cambiar estado"); }
  }

  function getFilteredDevices() {
    if (!formData.customerId) return [];
    return devices.filter((d) => d.customerId === formData.customerId);
  }

  function getNextStatuses(current: string) {
    const transitions: Record<string, string[]> = {
      RECEIVED: ["DIAGNOSING"],
      DIAGNOSING: ["REPAIRING", "WAITING_PARTS"],
      REPAIRING: ["WAITING_PARTS", "READY"],
      WAITING_PARTS: ["REPAIRING", "READY"],
      READY: ["DELIVERED"],
      DELIVERED: [],
    };
    return transitions[current] || [];
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tickets</h1>
          <p className="text-default-400 text-sm">{total} tickets</p>
        </div>
        <Button color="primary" startContent={<IconPlus size={18} />} onPress={openCreate}>
          Nuevo Ticket
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Buscar..."
          startContent={<IconSearch size={18} className="text-default-400" />}
          value={search}
          onValueChange={setSearch}
          className="max-w-xs"
        />
        <Select
          label="Estado"
          selectedKeys={status ? [status] : []}
          onSelectionChange={(keys) => setStatus(Array.from(keys)[0]?.toString() || "")}
          className="max-w-xs"
        >
          {statusOptions.map((o) => (
            <SelectItem key={o.key}>{o.label}</SelectItem>
          ))}
        </Select>
      </div>

      <Table aria-label="Tickets" removeWrapper>
        <TableHeader>
          <TableColumn>#</TableColumn>
          <TableColumn>DESCRIPCION</TableColumn>
          <TableColumn>CLIENTE / EQUIPO</TableColumn>
          <TableColumn>ESTADO</TableColumn>
          <TableColumn>PRIORIDAD</TableColumn>
          <TableColumn>COSTO</TableColumn>
          <TableColumn>TECNICO</TableColumn>
          <TableColumn>ACCIONES</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={loading}
          loadingContent="Cargando..."
          emptyContent="No hay tickets"
          items={tickets}
        >
          {(ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>
                <code className="text-xs bg-default-100 px-2 py-1 rounded font-bold">
                  TK-{ticket.ticketNumber}
                </code>
              </TableCell>
              <TableCell>
                <p className="max-w-xs truncate">{ticket.description}</p>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p className="font-medium">{ticket.customer.name}</p>
                  <p className="text-default-400">{ticket.device.brand} {ticket.device.model}</p>
                </div>
              </TableCell>
              <TableCell>
                <Chip color={statusColorMap[ticket.status]} variant="flat" size="sm">
                  {statusLabels[ticket.status]}
                </Chip>
              </TableCell>
              <TableCell>
                <Chip color={priorityColorMap[ticket.priority]} variant="dot" size="sm">
                  {ticket.priority}
                </Chip>
              </TableCell>
              <TableCell>S/ {(ticket.cost / 100).toFixed(2)}</TableCell>
              <TableCell>{ticket.technician?.name || "—"}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button isIconOnly variant="light" size="sm" onPress={() => openDetail(ticket)}>
                    <IconEye size={16} />
                  </Button>
                  <Button isIconOnly variant="light" size="sm" onPress={() => openAssign(ticket)}>
                    <IconUserCheck size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={createModal.isOpen} onClose={createModal.onClose} size="lg">
        <ModalContent>
          <ModalHeader>Nuevo Ticket</ModalHeader>
          <ModalBody className="gap-4">
            <Select
              label="Cliente"
              selectedKeys={formData.customerId ? [formData.customerId] : []}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0]?.toString() || "";
                setFormData({ ...formData, customerId: v, deviceId: "" });
              }}
              isRequired
            >
              {customers.map((c) => <SelectItem key={c.id}>{c.name}</SelectItem>)}
            </Select>
            <Select
              label="Equipo"
              selectedKeys={formData.deviceId ? [formData.deviceId] : []}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0]?.toString() || "";
                setFormData({ ...formData, deviceId: v });
              }}
              isRequired
              isDisabled={!formData.customerId}
            >
              {getFilteredDevices().map((d) => (
                <SelectItem key={d.id}>{d.brand} {d.model} ({d.serial})</SelectItem>
              ))}
            </Select>
            <Input
              label="Descripcion del problema"
              placeholder="Describe el problema..."
              value={formData.description}
              onValueChange={(v) => setFormData({ ...formData, description: v })}
              isRequired
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Prioridad"
                selectedKeys={[formData.priority]}
                onSelectionChange={(keys) => {
                  const v = Array.from(keys)[0]?.toString();
                  if (v) setFormData({ ...formData, priority: v });
                }}
              >
                <SelectItem key="LOW">Baja</SelectItem>
                <SelectItem key="MEDIUM">Media</SelectItem>
                <SelectItem key="HIGH">Alta</SelectItem>
                <SelectItem key="CRITICAL">Critica</SelectItem>
              </Select>
              <Input
                type="number"
                label="Costo (S/.)"
                placeholder="0.00"
                value={formData.cost.toString()}
                onValueChange={(v) => setFormData({ ...formData, cost: Number(v) || 0 })}
                startContent={<span className="text-default-400">S/</span>}
              />
            </div>
            <Input
              label="Notas internas"
              placeholder="Notas adicionales..."
              value={formData.notes}
              onValueChange={(v) => setFormData({ ...formData, notes: v })}
            />
            {error && <p className="text-danger text-sm">{error}</p>}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={createModal.onClose}>Cancelar</Button>
            <Button color="primary" isLoading={submitting} onPress={handleCreate}>Crear Ticket</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={detailModal.isOpen} onClose={detailModal.onClose} size="lg">
        <ModalContent>
          <ModalHeader>
            Ticket TK-{selectedTicket?.ticketNumber}
          </ModalHeader>
          <ModalBody className="gap-4">
            {selectedTicket && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Chip color={statusColorMap[selectedTicket.status]} variant="flat">
                    {statusLabels[selectedTicket.status]}
                  </Chip>
                  <Chip color={priorityColorMap[selectedTicket.priority]} variant="dot">
                    {selectedTicket.priority}
                  </Chip>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-default-400">Cliente</p>
                    <p className="font-medium">{selectedTicket.customer.name}</p>
                    <p>{selectedTicket.customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-default-400">Equipo</p>
                    <p>{selectedTicket.device.brand} {selectedTicket.device.model}</p>
                    <p className="text-xs">{selectedTicket.device.serial}</p>
                  </div>
                  <div>
                    <p className="text-default-400">Tecnico</p>
                    <p>{selectedTicket.technician?.name || "Sin asignar"}</p>
                  </div>
                  <div>
                    <p className="text-default-400">Costo</p>
                    <p className="font-medium">S/ {(selectedTicket.cost / 100).toFixed(2)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-default-400 text-sm">Descripcion</p>
                  <p>{selectedTicket.description}</p>
                </div>
                {selectedTicket.notes && (
                  <div>
                    <p className="text-default-400 text-sm">Notas</p>
                    <p className="text-sm bg-default-100 p-2 rounded">{selectedTicket.notes}</p>
                  </div>
                )}
                {selectedTicket.history && selectedTicket.history.length > 0 && (
                  <div>
                    <p className="text-default-400 text-sm mb-2">Historial</p>
                    <div className="space-y-2 max-h-48 overflow-auto">
                      {selectedTicket.history.map((h) => (
                        <div key={h.id} className="flex gap-3 text-sm border-l-2 border-default-200 pl-3">
                          <span className="text-default-400 text-xs whitespace-nowrap mt-0.5">
                            {new Date(h.timestamp).toLocaleString()}
                          </span>
                          <span>{h.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {getNextStatuses(selectedTicket.status).length > 0 && (
                  <div>
                    <p className="text-default-400 text-sm mb-1">Cambiar estado</p>
                    <div className="flex gap-2 flex-wrap">
                      {getNextStatuses(selectedTicket.status).map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant="flat"
                          onPress={() => {
                            handleStatusChange(selectedTicket.id, s);
                            detailModal.onClose();
                          }}
                        >
                          {statusLabels[s]}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={detailModal.onClose}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={assignModal.isOpen} onClose={assignModal.onClose}>
        <ModalContent>
          <ModalHeader>Asignar Tecnico</ModalHeader>
          <ModalBody className="gap-4">
            <Select
              label="Tecnico"
              selectedKeys={assignTechId ? [assignTechId] : []}
              onSelectionChange={(keys) => setAssignTechId(Array.from(keys)[0]?.toString() || "")}
              isRequired
            >
              {technicians.map((t) => <SelectItem key={t.id}>{t.name}</SelectItem>)}
            </Select>
            {error && <p className="text-danger text-sm">{error}</p>}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={assignModal.onClose}>Cancelar</Button>
            <Button color="primary" isLoading={submitting} onPress={handleAssign}>Asignar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
