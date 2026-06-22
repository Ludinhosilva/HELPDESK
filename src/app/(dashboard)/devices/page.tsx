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
  Tooltip,
} from "@nextui-org/react";
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconDeviceLaptop,
} from "@tabler/icons-react";
import { apiClient } from "@/core/api-client";

const deviceTypes = [
  { key: "LAPTOP", label: "Laptop" },
  { key: "DESKTOP", label: "Desktop" },
  { key: "ALL_IN_ONE", label: "All in One" },
  { key: "TABLET", label: "Tablet" },
  { key: "OTHER", label: "Otro" },
];

interface Device {
  id: string;
  brand: string;
  model: string;
  serial: string;
  type: string;
  accessories: string | null;
  customerId: string;
  customer: { id: string; name: string; phone: string };
  _count: { tickets: number };
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
}

interface DeviceFormData {
  brand: string;
  model: string;
  serial: string;
  type: string;
  accessories: string;
  customerId: string;
}

export default function DevicesPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [devices, setDevices] = useState<Device[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DeviceFormData>({
    brand: "",
    model: "",
    serial: "",
    type: "LAPTOP",
    accessories: "",
    customerId: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadDevices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient<{
        devices: Device[];
        total: number;
      }>(`/devices?search=${encodeURIComponent(search)}`);
      setDevices(res.devices);
      setTotal(res.total);
    } catch {
      setError("Error al cargar equipos");
    } finally {
      setLoading(false);
    }
  }, [search]);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await apiClient<{ customers: Customer[] }>(
        "/customers?limit=100"
      );
      setCustomers(res.customers);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  function openCreate() {
    setEditingId(null);
    setFormData({
      brand: "",
      model: "",
      serial: "",
      type: "LAPTOP",
      accessories: "",
      customerId: "",
    });
    setError("");
    onOpen();
  }

  function openEdit(device: Device) {
    setEditingId(device.id);
    setFormData({
      brand: device.brand,
      model: device.model,
      serial: device.serial,
      type: device.type,
      accessories: device.accessories || "",
      customerId: device.customerId,
    });
    setError("");
    onOpen();
  }

  async function handleSubmit() {
    setError("");
    setSubmitting(true);

    try {
      if (editingId) {
        await apiClient(`/devices/${editingId}`, {
          method: "PUT",
          body: { ...formData, accessories: formData.accessories || undefined },
        });
      } else {
        await apiClient("/devices", {
          method: "POST",
          body: { ...formData, accessories: formData.accessories || undefined },
        });
      }
      onClose();
      await loadDevices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminar este equipo?")) return;
    try {
      await apiClient(`/devices/${id}`, { method: "DELETE" });
      await loadDevices();
    } catch {
      setError("Error al eliminar");
    }
  }

  function getTypeLabel(type: string) {
    return deviceTypes.find((d) => d.key === type)?.label || type;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Equipos</h1>
          <p className="text-default-400 text-sm">
            {total} equipos registrados
          </p>
        </div>
        <Button
          color="primary"
          startContent={<IconPlus size={18} />}
          onPress={openCreate}
        >
          Nuevo Equipo
        </Button>
      </div>

      <Input
        placeholder="Buscar por marca, modelo o serial..."
        startContent={<IconSearch size={18} className="text-default-400" />}
        value={search}
        onValueChange={setSearch}
        className="max-w-md"
      />

      <Table aria-label="Equipos" removeWrapper>
        <TableHeader>
          <TableColumn>EQUIPO</TableColumn>
          <TableColumn>SERIAL</TableColumn>
          <TableColumn>CLIENTE</TableColumn>
          <TableColumn>TIPO</TableColumn>
          <TableColumn>TICKETS</TableColumn>
          <TableColumn>ACCIONES</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={loading}
          loadingContent="Cargando..."
          emptyContent="No hay equipos registrados"
          items={devices}
        >
          {(device) => (
            <TableRow key={device.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <IconDeviceLaptop size={18} className="text-default-400" />
                  <div>
                    <span className="font-medium">{device.brand}</span>
                    <span className="text-default-400 text-sm ml-1">
                      {device.model}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <code className="text-xs bg-default-100 px-2 py-1 rounded">
                  {device.serial}
                </code>
              </TableCell>
              <TableCell className="text-sm">
                {device.customer.name}
              </TableCell>
              <TableCell>
                <Chip variant="flat" size="sm">
                  {getTypeLabel(device.type)}
                </Chip>
              </TableCell>
              <TableCell>
                <Chip variant="flat" size="sm">
                  {device._count.tickets}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Tooltip content="Editar">
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onPress={() => openEdit(device)}
                    >
                      <IconEdit size={16} />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Eliminar" color="danger">
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      color="danger"
                      onPress={() => handleDelete(device.id)}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>
            {editingId ? "Editar Equipo" : "Nuevo Equipo"}
          </ModalHeader>
          <ModalBody className="gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Marca"
                placeholder="Dell"
                value={formData.brand}
                onValueChange={(v) => setFormData({ ...formData, brand: v })}
                isRequired
                autoFocus
              />
              <Input
                label="Modelo"
                placeholder="Latitude 5520"
                value={formData.model}
                onValueChange={(v) => setFormData({ ...formData, model: v })}
                isRequired
              />
            </div>
            <Input
              label="Numero de Serie"
              placeholder="SN-001234"
              value={formData.serial}
              onValueChange={(v) => setFormData({ ...formData, serial: v })}
              isRequired
            />
            <Select
              label="Tipo"
              selectedKeys={[formData.type]}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0]?.toString();
                if (v) setFormData({ ...formData, type: v });
              }}
            >
              {deviceTypes.map((dt) => (
                <SelectItem key={dt.key}>{dt.label}</SelectItem>
              ))}
            </Select>
            <Select
              label="Cliente"
              selectedKeys={formData.customerId ? [formData.customerId] : []}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0]?.toString() || "";
                setFormData({ ...formData, customerId: v });
              }}
              isRequired
            >
              {customers.map((c) => (
                <SelectItem key={c.id}>{c.name}</SelectItem>
              ))}
            </Select>
            <Input
              label="Accesorios"
              placeholder="Cargador, mochila..."
              value={formData.accessories}
              onValueChange={(v) =>
                setFormData({ ...formData, accessories: v })
              }
            />
            {error && <p className="text-danger text-sm">{error}</p>}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancelar
            </Button>
            <Button
              color="primary"
              isLoading={submitting}
              onPress={handleSubmit}
            >
              {editingId ? "Guardar" : "Crear"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
