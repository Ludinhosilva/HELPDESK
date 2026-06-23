# Modelo de Dominio: ServiDesk

Plataforma SaaS multi-tenant para mesa de ayuda TI. Cada **Organization** aísla completamente sus datos.

---

## 1. Arquitectura Multi-Tenant

```
┌─────────────────────────────────────────────────────────┐
│                    ServiDesk Platform                    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐   ┌─────────────────┐             │
│  │  Org: Tecsup    │   │  Org: USIL      │    ...       │
│  │  slug: tecsup   │   │  slug: usil     │             │
│  │  tickets: 1.2k  │   │  tickets: 3.4k  │             │
│  │  plan: PREMIUM  │   │  plan: FREE     │             │
│  └─────────────────┘   └─────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

- Cada `Organization` tiene su propio slug único y subdominio.
- Todo registro (Ticket, Category, User, KnowledgeArticle, EmailLog) tiene `organizationId`.
- SUPER_ADMIN ve datos de todas las organizaciones; los demas roles solo ven su org.
- El campo `@@unique([email, organizationId])` permite el mismo email en distintas orgs.

---

## 2. Entidades y Relaciones

### Organization
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | String (cuid) | PK |
| name | String | Nombre de la organizacion |
| slug | String (unique) | Identificador URL |
| logoUrl | String? | Logo corporativo |
| planStatus | String (ACTIVE) | Estado del plan |
| culqiCustomerId | String? | Cliente en Culqi |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### User
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | String (cuid) | PK |
| email | String | Correo |
| password | String | Hash bcrypt |
| name | String | Nombre completo |
| role | String | SUPER_ADMIN \| ADMIN \| TECHNICIAN \| END_USER |
| isActive | Boolean | true por defecto |
| organizationId | String? | FK a Organization (null solo para SUPER_ADMIN) |
| createdAt | DateTime | |
| updatedAt | DateTime | |

Relaciones: `createdTickets`, `assignedTickets`, `comments`, `evaluations`.

### Category
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | String (cuid) | PK |
| name | String | Ej: "Hardware", "Software" |
| slug | String | Ej: "hardware" |
| organizationId | String | FK a Organization |
| createdAt | DateTime | |

`@@unique([slug, organizationId])` — las categorias son por organizacion.

### Ticket
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | String (cuid) | PK |
| ticketNumber | Int | Auto-incremental por org (TK-1, TK-2...) |
| title | String | Titulo del ticket |
| description | String | Descripcion del problema |
| status | String | OPEN por defecto |
| priority | String | LOW \| MEDIUM \| HIGH \| URGENT |
| aiCategorySuggested | String? | Categoria sugerida por AI (red/hardware/software/accesos/otros) |
| aiSentiment | String? | Sentimiento detectado |
| slaExpiresAt | DateTime? | Fecha limite SLA |
| paymentStatus | String | NONE \| PENDING \| PROCESSING \| APPROVED \| FAILED |
| paymentAmount | Int? | Monto en centimos |
| paymentReference | String? | Referencia de pago |
| resolvedAt | DateTime? | Momento en que se resolvio |
| closedAt | DateTime? | Momento en que se cerro |
| organizationId | String | FK a Organization |
| categoryId | String? | FK a Category |
| createdById | String | FK a User (creator) |
| assignedToId | String? | FK a User (technician) |

`@@unique([ticketNumber, organizationId])` — el ticketNumber es secuencial por org.

### Comment
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | String (cuid) | PK |
| content | String | Texto del comentario |
| ticketId | String | FK a Ticket |
| authorId | String | FK a User |
| createdAt | DateTime | |

### TicketHistory (Auditoria Inmutable)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | String (cuid) | PK |
| ticketId | String | FK a Ticket |
| action | String | CREATED \| STATUS_CHANGE \| ASSIGNMENT \| COMMENT |
| description | String | Detalle textual |
| userId | String? | Quien ejecuto la accion |
| timestamp | DateTime | Fecha exacta |

### Evaluation
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | String (cuid) | PK |
| rating | Int | 1-5 |
| comment | String? | Comentario opcional |
| ticketId | String (unique) | FK a Ticket (una evaluacion por ticket) |
| userId | String | FK a User |
| createdAt | DateTime | |

### KnowledgeArticle
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | String (cuid) | PK |
| title | String | Titulo del articulo |
| content | String | Contenido markdown |
| slug | String | Identificador URL |
| status | String | DRAFT \| PUBLISHED |
| organizationId | String | FK a Organization |
| categoryId | String? | FK a Category |
| viewCount | Int | Contador de vistas |
| helpfulCount | Int | "Me fue util" |
| createdAt | DateTime | |
| updatedAt | DateTime | |

`@@unique([slug, organizationId])` — slugs por organizacion.

### SubscriptionPlan
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | String (cuid) | PK |
| name | String | Ej: "Free", "Premium", "Enterprise" |
| slug | String | Ej: "free", "premium" |
| price | Int | En centimos (S/ 29.90 = 2990) |
| currency | String | PEN por defecto |
| ticketLimit | Int? | Maximo tickets/mes (null = ilimitado) |
| features | String | JSON con caracteristicas |
| isPopular | Boolean | Marcado como popular |
| createdAt | DateTime | |

### Subscription
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | String (cuid) | PK |
| status | String | ACTIVE \| INACTIVE |
| startDate | DateTime | Inicio del periodo |
| nextBillingDate | DateTime? | Proxima facturacion |
| organizationId | String (unique) | FK a Organization (1:1) |
| planId | String | FK a SubscriptionPlan |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Payment
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | String (cuid) | PK |
| amount | Int | En centimos |
| currency | String | PEN |
| status | String | SUCCESS \| FAILED |
| reference | String? | Codigo de referencia Culqi |
| subscriptionId | String | FK a Subscription |
| createdAt | DateTime | |

### EmailLog
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | String (cuid) | PK |
| to | String | Destinatario |
| subject | String | Asunto |
| body | String | Cuerpo del correo |
| type | String | Tipo de notificacion |
| organizationId | String | FK a Organization |
| ticketId | String? | FK a Ticket (opcional) |
| sentAt | DateTime | |

---

## 3. Diagrama Entidad-Relacion

```
                    ┌───────────────────┐
                    │  Organization     │
                    │───────────────────│
                    │ id, name, slug    │──┐
                    │ planStatus        │  │
                    └─────────┬─────────┘  │
                              │            │
               ┌──────────────┼────────────┼──────────────┐
               │              │            │              │
        ┌──────▼──────┐ ┌────▼────┐ ┌─────▼──────┐ ┌─────▼──────┐
        │    User     │ │ Category│ │Knowledge   │ │ EmailLog   │
        │─────────────│ │─────────│ │Article     │ │────────────│
        │ email, name │ │ name    │ │────────────│ │ to, subject│
        │ role, isAct │ │ slug    │ │ title,cont │ │ type       │
        │ orgId FK ───┤ │ orgId   │ │ status     │ │ orgId      │
        └──┬──────┬───┘ └────┬────┘ │ orgId FK   │ └────────────┘
           │      │          │      └────────────┘
           │      │          │
     ┌─────▼──┐ ┌─▼──────────▼──┐
     │Ticket  │ │   Ticket      │
     │(creator)│ │──────────────│
     └────────┘ │ ticketNumber  │
                │ title, desc   │
           ┌────┤ status,prior. │
           │    │ aiCategory,   │
           │    │ aiSentiment   │
           │    │ slaExpiresAt  │
           │    │ paymentStatus │
           │    │ paymentAmount │
           │    │ resolvedAt    │
           │    │ closedAt      │
           │    │ orgId FK ─────┤
           │    │ categoryId FK─┤
           │    │ createdById   │
           │    │ assignedToId  │
           │    └───┬───┬───┬───┘
           │        │   │   │
           │   ┌────┘   │   └──────┐
           │   │        │          │
     ┌─────▼───▼──┐ ┌──▼────┐ ┌───▼───────────┐
     │  Comment   │ │Ticket │ │  Evaluation    │
     │────────────│ │History│ │────────────────│
     │ content    │ │───────│ │ rating (1-5)   │
     │ ticketId   │ │action │ │ comment        │
     │ authorId   │ │descrip│ │ ticketId (uniq)│
     └────────────┘ │userId │ │ userId         │
                   └───────┘ └────────────────┘

    ┌──────────────────┐      ┌──────────────────┐
    │ SubscriptionPlan │      │   Subscription   │
    │──────────────────│      │──────────────────│
    │ name, slug       │─────>│ status, startDate│
    │ price (cents)    │  1:N │ nextBillingDate  │
    │ currency PEN     │      │ orgId (unique) FK│
    │ ticketLimit,feat │      │ planId FK        │
    │ isPopular        │      └────────┬─────────┘
    └──────────────────┘               │
                                      │
                               ┌──────▼──────┐
                               │   Payment   │
                               │─────────────│
                               │ amount, PEN │
                               │ status      │
                               │ reference   │
                               │ subId FK    │
                               └─────────────┘
```

---

## 4. Ciclo de Vida del Ticket

```
                         ┌─────────────────────────────────────────┐
                         │          VALID_TRANSITIONS              │
                         ├─────────────────────────────────────────┤
                         │  OPEN ──> IN_PROGRESS, ON_HOLD, CLOSED  │
                         │  IN_PROGRESS ──> ON_HOLD, RESOLVED      │
                         │  ON_HOLD ──> IN_PROGRESS, CLOSED        │
                         │  RESOLVED ──> CLOSED, OPEN              │
                         │  CLOSED ──> [] (terminal)               │
                         └─────────────────────────────────────────┘

    OPEN ──────> IN_PROGRESS ──────> RESOLVED ──────> CLOSED
      │              │                                    ▲
      ├──────> ON_HOLD                                    │
      │              │                                    │
      └──────> ON_HOLD ──────> CLOSED                     │
                          └───────────────────────────────┘
```

| Estado | Significado | Quien lo ejecuta |
|--------|-------------|------------------|
| OPEN | Ticket creado, sin asignar | END_USER, ADMIN |
| IN_PROGRESS | Tecnico esta trabajando | TECHNICIAN asignado |
| ON_HOLD | Esperando informacion/repuestos | TECHNICIAN asignado |
| RESOLVED | Solucion aplicada, esperando confirmacion | TECHNICIAN asignado |
| CLOSED | Confirmado por el usuario o cerrado por admin | ADMIN, END_USER |

### Reglas de Transicion

| Codigo | Regla |
|--------|-------|
| RB-001 | OPEN solo puede pasar a IN_PROGRESS si hay un tecnico asignado |
| RB-002 | RESOLVED puede reabrirse a OPEN si el usuario no esta conforme |
| RB-003 | CLOSED es terminal — no se puede reabrir |
| RB-004 | Todo cambio de estado genera un registro en TicketHistory |
| RB-005 | Al crear el ticket se registra automaticamente action=CREATED |
| RB-006 | Solo el tecnico asignado puede mover a IN_PROGRESS o RESOLVED |
| RB-007 | La transicion OPEN→CLOSED es permitida (auto-descarte) |

---

## 5. Control de Acceso por Rol

| Accion | SUPER_ADMIN | ADMIN | TECHNICIAN | END_USER |
|--------|:-----------:|:-----:|:----------:|:--------:|
| Ver todas las organizaciones | SI | NO | NO | NO |
| Gestionar usuarios de su org | SI | SI | NO | NO |
| Ver/Gestionar tickets (su org) | SI | SI | Asignados | Propios |
| Crear tickets | SI | SI | SI | SI |
| Asignar tecnicos | SI | SI | NO | NO |
| Cambiar estado (WORKING) | SI | SI | Solamente asignados | NO |
| Cerrar ticket | SI | SI | NO | Solo propio si RESOLVED |
| Evaluar ticket | SI | SI | NO | Solo propio |
| Gestionar planes/suscripcion | SI | NO | NO | NO |
| Ver reportes y dashboard | SI | Su org | Su desempeno | NO |
| Gestionar base de conocimiento | SI | SI | LEER | LEER |
| Ver historial de pagos | SI | Su org | NO | NO |

Implementacion via `getOrgFilter()` en `auth-helpers.ts:46`:
- SUPER_ADMIN: no tiene filtro de organizacion (`{}`)
- ADMIN/TECHNICIAN/END_USER: filtran por `{ organizationId: auth.orgId }`

---

## 6. Sistema de Triage AI (Heuristico por Keywords)

Clasifica automaticamente tickets entrantes en 5 categorias usando reconocimiento de patrones:

```
                     ┌─────────────┐
                     │ Titulo +    │
                     │ Descripcion │
                     └──────┬──────┘
                            │
                    ┌───────▼────────┐
                    │  classifyTicket│
                    │  (keyword      │
                    │   matching)    │
                    └───────┬────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
   ┌──────────┐      ┌──────────┐      ┌──────────┐
   │ Hardware │      │ Software │      │   Red    │
   │ impresora│      │ windows  │      │ wifi, dns│
   │ monitor  │      │ office   │      │ router   │
   │ disco    │      │ virus    │      │ conexion │
   └──────────┘      └──────────┘      └──────────┘
   ┌──────────┐      ┌──────────┐
   │ Accesos  │      │  Otros   │
   │ correo   │      │ fallback │
   │ password │      │          │
   └──────────┘      └──────────┘
```

**Triage heuristico** (`triage.ts`) determina 3 niveles de complejidad:

| Complejidad | Deteccion | Accion |
|-------------|-----------|--------|
| SIMPLE | Patrones exactos (25 regex) | Solucion automatica, sin costo |
| MEDIUM | Palabras clave de configuracion | Crear ticket gratuito |
| COMPLEX | Palabras de dano fisico | Requiere pago o SLA Premium |

Ademas se genera:
- **aiCategorySuggested**: Categoria predecida guardada en el Ticket
- **aiSentiment**: Analisis de sentimiento del texto
- **searchSimilar**: Busqueda en tickets resueltos por similitud de palabras
- **suggestSolutions**: Sugerencias de solucion predefinidas por categoria
- **generateCopilotResponse**: Respuesta automatizada para el usuario

---

## 7. Sistema SLA / Premium

```
                     ┌─────────────────────────┐
                     │    Organization          │
                     │    planStatus: ACTIVE    │
                     ├─────────────────────────┤
                     │ Ticket con SLA activo?   │
                     │   ┌─────────────────┐    │
                     │   │ slaExpiresAt != │    │
                     │   │ null            │    │
                     │   └────────┬────────┘    │
                     │            ▼             │
                     │  ┌──────────────────┐    │
                     │  │ Prioridad alta    │    │
                     │  │ en cola de tec.   │    │
                     │  │ Notificacion a    │    │
                     │  │ ADMIN si expira   │    │
                     │  └──────────────────┘    │
                     └─────────────────────────┘
```

- `slaExpiresAt` se asigna al crear/actualizar un ticket con SLA activo.
- Los tickets con SLA vencido se marcan con prioridad URGENT automaticamente.
- El triage sugiere "Activar SLA Premium" para tickets COMPLEX.
- El campo `slaExpiresAt` en Ticket permite consultas de tickets vencidos.

---

## 8. Modelo de Suscripcion y Facturacion

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ SubscriptionPlan │ 1:N │   Subscription   │ 1:N │     Payment      │
│──────────────────│────>│──────────────────│────>│──────────────────│
│ name (Free)      │     │ orgId (1:1)      │     │ amount (cents)   │
│ slug (free)      │     │ status           │     │ currency PEN     │
│ price 0          │     │ startDate        │     │ status           │
│ ticketLimit 10   │     │ nextBillingDate  │     │ reference (Culqi)│
│ features JSON    │     │ planId FK        │     │ createdAt        │
│ isPopular false  │     │ payments[]       │     └──────────────────┘
└──────────────────┘     └──────────────────┘
```

- **SubscriptionPlan**: Catalogo de planes (Free, Premium, Enterprise).
- **Subscription**: Relacion 1:1 con Organization. `status: ACTIVE | INACTIVE`.
- **Payment**: Historial de pagos procesados via Culqi.
- `ticketLimit` en el plan controla el maximo de tickets mensuales por organizacion.

---

## 9. Sistema de Notificaciones

```
┌──────────────┐     subscribes()     ┌──────────────────────┐
│   Frontend   │────────────────────>│  NotificationClient   │
│   (SSE)      │                     │──────────────────────│
│              │<────────────────────│ userId, orgId, callback│
└──────┬───────┘     onmessage()     └──────────┬───────────┘
       │                                        │
       │  Event Stream                          │ notify(event, data)
       │                                        │
       │  ┌─────────────────────────────────────▼─────────────┐
       │  │              Servidor (in-memory)                  │
       │  │  notify("ticket.created", data, userId?, orgId?)  │
       │  └───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│   EmailLog (persistente)                                      │
│   type: "TICKET_CREATED" | "STATUS_CHANGE" | "ASSIGNMENT"    │
│   Se envia correo al destinatario segun el tipo              │
└──────────────────────────────────────────────────────────────┘
```

- **En tiempo real**: Notificaciones push via SSE usando `NotificationClient`.
- **Diferidas**: Log de correos en `EmailLog` con tipo de evento y referencia al ticket.
- Los eventos incluyen: creacion de ticket, cambio de estado, asignacion, vencimiento SLA.
