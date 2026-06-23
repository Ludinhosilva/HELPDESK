<div align="center">

# ⚡ Flix Support

### Plataforma de HelpDesk con IA Predictiva

**Sistema moderno de gestión de tickets de soporte técnico con inteligencia artificial, base de conocimiento, y pagos integrados para tickets exprés.**

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)

<br>

[**🚀 Ver Demo en Vivo**](https://helpdesklu-five.vercel.app) · [**📋 Documentación API**](#-api-endpoints) · [**📐 Esquema de BD**](#-base-de-datos)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Base de Datos](#-base-de-datos)
- [API Endpoints](#-api-endpoints)
- [Roles y Permisos](#-roles-y-permisos)
- [Planes de Suscripción](#-planes-de-suscripción)
- [Instalación](#-instalación)
- [Variables de Entorno](#-variables-de-entorno)
- [Estructura del Proyecto](#-estructura-del-proyecto)

---

## ✨ Características

### 🎫 Gestión de Tickets
- Creación, asignación y seguimiento de tickets con numeración automática
- Estados: `OPEN → IN_PROGRESS → RESOLVED → CLOSED` + flujo de reparación
- Prioridades: Baja, Media, Alta, Urgente
- Vista Kanban con drag & drop para gestión visual
- Comentarios y historial de auditoría por ticket
- Evaluación post-resolución con sistema de estrellas (1-5)

### 🤖 IA Predictiva
- **Triaje Automático**: Clasifica tickets por categoría automáticamente
- **Análisis de Sentimiento**: Detecta urgencia y tono del usuario
- **Sugerencia de Soluciones**: Copilot que recomienda soluciones basadas en tickets similares
- **Búsqueda de Similares**: Encuentra tickets resueltos con problemas similares
- **Predicción de Volumen**: Pronóstico de tendencias a 7 días basado en datos de 90 días

### 📚 Base de Conocimiento
- Artículos y guías con categorías
- Estados: Borrador / Publicado
- Contador de vistas y votos útiles
- Búsqueda por texto y categoría

### 💳 Ticket Exprés
- Prioridad urgente con garantía de respuesta en < 2 horas
- Sistema de pago integrado (simulación Culqi)
- Historial de compras y pagos

### 📊 Analíticas en Tiempo Real
- Dashboard con métricas clave
- Gráficos de tickets por categoría, estado y tendencia diaria
- Rendimiento de técnicos
- Predicción de volumen de tickets

### 🔐 Seguridad y Multi-tenancy
- JWT con httpOnly cookies
- Aislamiento completo por organización
- 4 roles: `SUPER_ADMIN`, `ADMIN`, `TECHNICIAN`, `END_USER`
- Registro de super-admin con clave secreta

### 📧 Notificaciones
- Sistema de notificaciones en tiempo real vía Server-Sent Events (SSE)
- Registro de emails enviados
- Toast notifications con Sonner

---

## 🏗 Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND                            │
│  Next.js 14 App Router + React 18 + Tailwind CSS        │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │   Landing    │ │   Dashboard  │ │   Super Admin    │  │
│  │   Page       │ │   (Auth)     │ │   (Protected)    │  │
│  └─────────────┘ └──────────────┘ └──────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │ API Routes
┌─────────────────────▼───────────────────────────────────┐
│                     BACKEND                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │   Auth   │ │  Tickets │ │    AI    │ │   Admin    │  │
│  │  (JWT)   │ │   CRUD   │ │  Engine  │ │  Panel     │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │ Prisma ORM
┌─────────────────────▼───────────────────────────────────┐
│                    DATABASE                             │
│              PostgreSQL (Neon Serverless)                │
│  ┌─────────────┐ ┌──────────┐ ┌──────────────────────┐  │
│  │ Organizations│ │  Tickets │ │ Knowledge Articles   │  │
│  │    Users     │ │ Comments │ │ Subscriptions        │  │
│  └─────────────┘ └──────────┘ └──────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠 Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Framework** | Next.js (App Router) | 14.2.35 |
| **Lenguaje** | TypeScript | 5.x |
| **UI Library** | React | 18 |
| **Estilos** | Tailwind CSS | 3.4 |
| **Componentes** | Radix UI + shadcn/ui | - |
| **ORM** | Prisma | 5.14 |
| **Base de Datos** | PostgreSQL (Neon) | - |
| **Autenticación** | JWT (jose) + bcryptjs | - |
| **Gráficos** | Recharts | 3.8 |
| **Animaciones** | Framer Motion | 11 |
| **Drag & Drop** | @dnd-kit | 6.3 |
| **Formularios** | Zod | 3.23 |
| **PDF** | jsPDF | 4.2 |
| **Toast** | Sonner | 2.0 |
| **Deploy** | Vercel | - |

---

## 🗄 Base de Datos

### Modelos Principales

```
┌─────────────────┐     ┌─────────────────┐
│  Organization   │────<│      User       │
│─────────────────│     │─────────────────│
│ id              │     │ id              │
│ name            │     │ email           │
│ slug            │     │ name            │
│ planStatus      │     │ role            │
│ aiUsageCount    │     │ isActive        │
└────────┬────────┘     └─────────────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
┌────────▼────────┐     ┌─────────────────────▼───┐
│    Category     │────<│       Ticket            │
│─────────────────│     │─────────────────────────│
│ id              │     │ id                      │
│ name            │     │ ticketNumber (auto)     │
│ slug            │     │ title                   │
└─────────────────┘     │ status                  │
                        │ priority                │
                        │ aiCategorySuggested     │
                        │ aiSentiment             │
                        │ slaExpiresAt            │
                        │ paymentStatus           │
                        └────────────┬────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
          ┌────────▼──────┐ ┌───────▼───────┐ ┌─────▼──────────┐
          │    Comment    │ │TicketHistory  │ │  Evaluation    │
          │───────────────│ │───────────────│ │────────────────│
          │ content       │ │ action        │ │ rating (1-5)   │
          │ ticketId      │ │ description   │ │ comment        │
          │ authorId      │ │ userId        │ │ userId         │
          └───────────────┘ └───────────────┘ └────────────────┘

┌──────────────────┐     ┌──────────────────┐
│KnowledgeArticle  │     │ SubscriptionPlan │
│──────────────────│     │──────────────────│
│ title            │     │ name             │
│ content          │     │ price            │
│ status           │     │ features         │
│ viewCount        │     │ isPopular        │
│ helpfulCount     │     └──────────────────┘
└──────────────────┘
```

### Estados de Ticket

| Estado | Descripción |
|--------|------------|
| `OPEN` | Ticket creado, esperando asignación |
| `IN_PROGRESS` | En progreso por un técnico |
| `RECEIVED` | Recibido en taller |
| `DIAGNOSING` | En diagnóstico |
| `REPAIRING` | En reparación |
| `WAITING_PARTS` | Esperando repuestos |
| `READY` | Listo para entregar |
| `DELIVERED` | Entregado al cliente |
| `RESOLVED` | Resuelto |
| `CLOSECerrado` | Cerrado definitivamente |

---

## 📡 API Endpoints

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Iniciar sesión |
| `POST` | `/api/auth/register` | Registrar usuario + organización |
| `POST` | `/api/auth/logout` | Cerrar sesión |
| `POST` | `/api/auth/register-super-admin` | Registrar super admin |

### Tickets

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/tickets` | Listar tickets (paginado, filtrable) |
| `POST` | `/api/tickets` | Crear ticket |
| `GET` | `/api/tickets/[id]` | Detalle de ticket |
| `PATCH` | `/api/tickets/[id]` | Actualizar ticket |
| `POST` | `/api/tickets/[id]/comments` | Agregar comentario |
| `POST` | `/api/tickets/[id]/evaluate` | Evaluar ticket |
| `GET` | `/api/tickets/stats` | Estadísticas |
| `GET` | `/api/tickets/predict` | Predicción de volumen |

### Inteligencia Artificial

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/ai/triage` | Triaje automático de tickets |
| `POST` | `/api/ai/copilot` | Sugerencia de soluciones |
| `POST` | `/api/ai/sentiment` | Análisis de sentimiento |
| `POST` | `/api/ai/search-similar` | Buscar tickets similares |

### Conocimiento

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/knowledge` | Listar artículos |
| `POST` | `/api/knowledge` | Crear artículo |
| `GET` | `/api/knowledge/[id]` | Detalle de artículo |
| `PATCH` | `/api/knowledge/[id]` | Actualizar artículo |
| `DELETE` | `/api/knowledge/[id]` | Eliminar artículo |

### Usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/users` | Listar usuarios |
| `POST` | `/api/users` | Invitar usuario |
| `PATCH` | `/api/users/[id]` | Actualizar usuario |

### Otros

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/categories` | Categorías |
| `POST` | `/api/categories` | Crear categoría |
| `GET` | `/api/emails` | Logs de email |
| `GET` | `/api/notifications` | SSE notificaciones |
| `GET/PATCH` | `/api/profile` | Perfil de usuario |
| `POST` | `/api/payments` | Pago Ticket Exprés |
| `GET/POST` | `/api/subscriptions` | Suscripciones |
| `GET` | `/api/subscription-plans` | Planes disponibles |
| `GET` | `/api/admin/stats` | Estadísticas globales |
| `GET` | `/api/admin/organizations` | Organizaciones |

---

## 👥 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **SUPER_ADMIN** | Acceso total a todas las organizaciones, estadísticas globales |
| **ADMIN** | Gestionar usuarios, categorías, suscripciones, ver analíticas |
| **TECHNICIAN** | Ver tickets asignados, actualizar estados, agregar comentarios |
| **END_USER** | Crear tickets, ver tickets propios, evaluar resoluciones |

---

## 💰 Planes de Suscripción

| Plan | Precio | Tickets/mes | IA | Características |
|------|--------|-------------|-----|-----------------|
| **Gratis** | S/0 | 50 | 1 chat gratis | Dashboard básico, Knowledge Base |
| **Básico** | S/29 | Ilimitado | Ilimitado | Analytics, Email notifications |
| **Pro** | S/79 | Ilimitado | Ilimitado | IA auto-clasificación, Soporte prioritario |

---

## 🚀 Instalación

### Prerequisitos

- Node.js 18+
- npm o yarn
- PostgreSQL (o usar Neon Serverless)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/flix-support.git
cd flix-support

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de base de datos

# 4. Generar cliente de Prisma
npx prisma generate

# 5. Ejecutar migraciones
npx prisma migrate deploy

# 6. Sembrar datos iniciales
npx tsx prisma/seed.ts

# 7. Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

### Credenciales por Defecto (tras seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Super Admin | `super@flixsupport.com` | `admin123` |
| Admin | `admin@techcorp.com` | `admin123` |
| Técnico | `tecnico@techcorp.com` | `admin123` |
| Usuario | `usuario@techcorp.com` | `admin123` |

---

## 🔧 Variables de Entorno

```env
# Base de datos
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="flix-support-secret-2026"

# Super Admin
SUPER_ADMIN_KEY="flix-super-2026"

# App
NEXT_PUBLIC_APP_URL="https://helpdesklu-five.vercel.app"
```

---

## 📁 Estructura del Proyecto

```
pc-repair-helpdesk/
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   ├── seed.ts                # Datos iniciales
│   └── migrations/            # Migraciones de BD
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Rutas autenticadas
│   │   │   ├── dashboard/     # Panel principal
│   │   │   ├── tickets/       # Gestión de tickets
│   │   │   │   ├── [id]/      # Detalle de ticket
│   │   │   │   ├── kanban/    # Vista Kanban
│   │   │   │   ├── new/       # Crear ticket
│   │   │   │   └── compras/   # Ticket Exprés
│   │   │   ├── knowledge/     # Base de conocimiento
│   │   │   ├── analytics/     # Analíticas
│   │   │   ├── users/         # Gestión de usuarios
│   │   │   ├── categories/    # Categorías
│   │   │   ├── emails/        # Logs de email
│   │   │   ├── subscriptions/ # Suscripciones
│   │   │   ├── settings/      # Configuración
│   │   │   └── profile/       # Perfil
│   │   ├── (super-admin)/     # Rutas super admin
│   │   │   └── super-admin/
│   │   ├── api/               # API Routes
│   │   │   ├── ai/            # Motor de IA
│   │   │   ├── auth/          # Autenticación
│   │   │   ├── tickets/       # CRUD tickets
│   │   │   ├── knowledge/     # Base conocimiento
│   │   │   └── ...
│   │   ├── login/             # Login
│   │   ├── register/          # Registro
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # Componentes base (shadcn/ui)
│   │   ├── ai-triage.tsx      # Widget de IA
│   │   ├── comment-section.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── auth.ts            # Helpers de autenticación
│   │   ├── ai-usage.ts        # Control de uso de IA
│   │   └── utils.ts           # Utilidades generales
│   └── core/
│       └── api-client.ts      # Cliente API
├── public/                    # Archivos estáticos
├── .env                       # Variables de entorno
├── tailwind.config.ts         # Configuración Tailwind
├── next.config.js             # Configuración Next.js
└── package.json               # Dependencias
```

---

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests E2E con Playwright
npx playwright test

# Linting
npm run lint
```

---

## 📄 Licencia

Proyecto académico - UNAP 2026

---

<div align="center">

**Desarrollado con ❤️ por el equipo de Flix Support**

[![Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TU_USUARIO/flix-support)

</div>
