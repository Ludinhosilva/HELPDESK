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
  Chip,
  Tooltip,
} from "@nextui-org/react";
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconPhone,
  IconMail,
} from "@tabler/icons-react";
import { apiClient } from "@/core/api-client";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  createdAt: string;
  _count: { devices: number; tickets: number };
}

interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
}

export default function CustomersPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    phone: "",
    email: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient<{
        customers: Customer[];
        total: number;
      }>(`/customers?search=${encodeURIComponent(search)}`);
      setCustomers(res.customers);
      setTotal(res.total);
    } catch {
      setError("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  function openCreate() {
    setEditingId(null);
    setFormData({ name: "", phone: "", email: "" });
    setError("");
    onOpen();
  }

  function openEdit(customer: Customer) {
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
    });
    setError("");
    onOpen();
  }

  async function handleSubmit() {
    setError("");
    setSubmitting(true);

    try {
      if (editingId) {
        await apiClient(`/customers/${editingId}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        await apiClient("/customers", {
          method: "POST",
          body: formData,
        });
      }
      onClose();
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminar este cliente?")) return;
    try {
      await apiClient(`/customers/${id}`, { method: "DELETE" });
      await loadCustomers();
    } catch {
      setError("Error al eliminar");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-default-400 text-sm">
            {total} clientes registrados
          </p>
        </div>
        <Button
          color="primary"
          startContent={<IconPlus size={18} />}
          onPress={openCreate}
        >
          Nuevo Cliente
        </Button>
      </div>

      <Input
        placeholder="Buscar por nombre o telefono..."
        startContent={<IconSearch size={18} className="text-default-400" />}
        value={search}
        onValueChange={setSearch}
        className="max-w-md"
      />

      <Table aria-label="Clientes" removeWrapper>
        <TableHeader>
          <TableColumn>NOMBRE</TableColumn>
          <TableColumn>CONTACTO</TableColumn>
          <TableColumn>EQUIPOS</TableColumn>
          <TableColumn>TICKETS</TableColumn>
          <TableColumn>ACCIONES</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={loading}
          loadingContent="Cargando..."
          emptyContent="No hay clientes registrados"
          items={customers}
        >
          {(customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <span className="font-medium">{customer.name}</span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 text-sm">
                  <span className="flex items-center gap-1 text-default-600">
                    <IconPhone size={14} />
                    {customer.phone}
                  </span>
                  {customer.email && (
                    <span className="flex items-center gap-1 text-default-400">
                      <IconMail size={14} />
                      {customer.email}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Chip variant="flat" size="sm">
                  {customer._count.devices}
                </Chip>
              </TableCell>
              <TableCell>
                <Chip variant="flat" size="sm">
                  {customer._count.tickets}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Tooltip content="Editar">
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onPress={() => openEdit(customer)}
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
                      onPress={() => handleDelete(customer.id)}
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
            {editingId ? "Editar Cliente" : "Nuevo Cliente"}
          </ModalHeader>
          <ModalBody className="gap-4">
            <Input
              label="Nombre"
              placeholder="Nombre completo"
              value={formData.name}
              onValueChange={(v) => setFormData({ ...formData, name: v })}
              isRequired
              autoFocus
            />
            <Input
              label="Telefono"
              placeholder="999888777"
              value={formData.phone}
              onValueChange={(v) => setFormData({ ...formData, phone: v })}
              isRequired
            />
            <Input
              type="email"
              label="Email"
              placeholder="cliente@correo.com"
              value={formData.email}
              onValueChange={(v) => setFormData({ ...formData, email: v })}
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
