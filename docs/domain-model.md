# Modelo de Dominio: PC Repair Help Desk

## Entidades

### 1. Usuario (User)
Persona que usa el sistema. Hace login y gestiona tickets.
- Campos: email, password (hash bcrypt), name, role (ADMIN | TECHNICIAN), specialty
- Rol ADMIN: acceso total, dashboard, reportes
- Rol TECHNICIAN: solo ve tickets asignados o por asignar

### 2. Cliente (Customer)
Dueño del equipo que ingresa a reparacion.
- Campos: name (requerido), phone (requerido), email (opcional)
- Un cliente puede tener varios dispositivos registrados
- Un cliente puede tener varios tickets

### 3. Equipo (Device)
Dispositivo fisico ingresado al taller.
- Campos: brand, model, serial (unico), type (enum), accessories (texto libre)
- Pertenece a un Customer
- El campo `accessories` es critico: evita reclamos de "no me devolvieron el cargador"
- Un Device puede tener varios tickets historicos

### 4. Ticket
Orden de servicio. El nucleo del sistema.
- `ticketNumber`: numero autoincremental para referencia humana (TK-1, TK-2...)
- `description`: diagnostico o problema reportado
- `status`: estado actual en el ciclo de vida
- `priority`: LOW | MEDIUM | HIGH | CRITICAL
- `cost`: en centavos (Int) para evitar errores de redondeo de Float
- `notes`: notas tecnicas internas
- Relaciones: Customer, Device, User (technician asignado)

### 5. TicketHistory
Auditoria inmutable. Cada accion sobre un ticket queda registrada.
- `action`: CREATED | STATUS_CHANGE | ASSIGNMENT | NOTE
- `description`: detalle textual de lo ocurrido
- `userId`: quien realizo la accion
- `timestamp`: fecha y hora exacta

---

## Ciclo de Vida del Ticket

```
RECEIVED ──> DIAGNOSING ──> REPAIRING ──> READY ──> DELIVERED
                 │               │
                 └── WAITING_PARTS ──┘
```

| Estado | Significado | Quien lo ejecuta |
|--------|------------|-----------------|
| RECEIVED | Equipo ingresado con accesorios registrados | ADMIN / TECHNICIAN |
| DIAGNOSING | Tecnico evalua la falla real | TECHNICIAN asignado |
| REPAIRING | Ejecutando reparacion (hardware/software) | TECHNICIAN asignado |
| WAITING_PARTS | Pausado por falta de repuestos | TECHNICIAN asignado |
| READY | Reparacion finalizada, probada y funcionando | TECHNICIAN asignado |
| DELIVERED | Entregado al cliente y pagado | ADMIN |

### Reglas de Transicion

- RB-001: Solo el tecnico asignado puede cambiar el estado de REPAIRING a READY
- RB-002: Si el estado es WAITING_PARTS, se debe registrar una nota explicando que repuesto falta
- RB-003: DELIVERED es estado terminal. No se puede reabrir un ticket entregado
- RB-004: Todo cambio de estado genera una entrada en TicketHistory
- RB-005: Al crear un ticket, se genera automaticamente un registro en history con accion CREATED
- RB-006: El costo se registra en centavos. La UI lo muestra en soles (S/. XX.XX)
- RB-007: Un tecnico no puede asignarse un ticket a si mismo si ya tiene 5+ tickets en estado REPAIRING

---

## Diagrama de Relaciones (ER)

```
┌──────────┐       ┌──────────┐       ┌──────────────┐
│ Customer │       │  Device  │       │     User     │
│──────────│       │──────────│       │──────────────│
│ name     │       │ brand    │       │ email        │
│ phone    │       │ model    │       │ name         │
│ email    │       │ serial   │       │ role         │
└────┬─────┘       │ type     │       │ specialty    │
     │             └────┬─────┘       └──────┬───────┘
     │                  │                    │
     │  1:N             │  1:N               │  1:N
     │                  │                    │
     └──────┬───────────┘                    │
            │                                │
     ┌──────▼──────┐                  ┌──────▼───────┐
     │   Ticket    │─────────────────>│    User      │
     │─────────────│  technicianId    │ (technician) │
     │ ticketNumber│                  └──────────────┘
     │ description │
     │ status      │       ┌────────────────┐
     │ priority    │       │ TicketHistory  │
     │ cost        │──────>│────────────────│
     │ notes       │  1:N  │ action         │
     └─────────────┘       │ description    │
                           │ userId         │
                           │ timestamp      │
                           └────────────────┘
```
