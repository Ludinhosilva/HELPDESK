<div align="center">

<img src="https://img.shields.io/badge/Flix-Support-6366f1?style=for-the-badge&logo=zap&logoColor=white" alt="Flix Support"/>

<br>

# <img src="https://img.shields.io/badge/⚡-Flix%20Support-6366f1?style=flat-square" alt="Logo"/>

### Sistema Inteligente de Soporte Técnico

![Next.js](https://img.shields.io/badge/Next.js-14-000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2d3748?style=for-the-badge&logo=prisma&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06b6d4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169e1?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000?style=for-the-badge&logo=vercel&logoColor=white)

<br>

![License](https://img.shields.io/badge/Licencia-Académica-blue?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.0-green?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-125%20Passed-brightgreen?style=flat-square)
![API](https://img.shields.io/badge/API-37%20Endpoints-orange?style=flat-square)

<br>

<a href="https://helpdesklu-five.vercel.app" target="_blank">
  <img src="https://img.shields.io/badge/🚀_Ver_Demo-6366f1?style=for-the-badge&logo=vercel&logoColor=white" alt="Demo"/>
</a>
<a href="#-instalación">
  <img src="https://img.shields.io/badge/📦_Instalar-10b981?style=for-the-badge&logo=npm&logoColor=white" alt="Install"/>
</a>
<a href="#-api-endpoints">
  <img src="https://img.shields.io/badge/📡_API_Docs-f59e0b?style=for-the-badge&logo=openapi-initiative&logoColor=white" alt="API"/>
</a>

</div>

---

## 📌 ¿Qué es Flix Support?

<table>
<tr>
<td width="100%">

**Flix Support** es una plataforma completa de **gestión de soporte técnico** construida con las últimas tecnologías web. Incluye:

| Característica | Descripción |
|----------------|-------------|
| 🎫 **Sistema de Tickets** | Creación, asignación, seguimiento y resolución con flujo completo |
| 🤖 **IA Predictiva** | Clasificación automática, análisis de sentimiento y sugerencia de soluciones |
| 📚 **Base de Conocimiento** | Artículos, guías y documentación searchable |
| 💳 **Ticket Exprés** | Compra de prioridad urgente con pago integrado |
| 📊 **Analytics** | Dashboard con gráficos en tiempo real y predicciones |
| 🔐 **Multi-tenant** | Aislamiento completo por organización con 4 roles |
| 📧 **Notificaciones** | SSE en tiempo real + logs de email |
| 🎨 **UI Moderna** | Glassmorphism, animaciones, modo oscuro, 100% responsive |

</td>
</tr>
</table>

---

## 🎯 Lo Que Contiene El Proyecto

<table>
<tr>
<td width="50%" valign="top">

### 🖥️ Frontend (15 páginas)

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page profesional con pricing |
| `/login` | Login con glassmorphism |
| `/register` | Registro de organización |
| `/dashboard` | Panel principal con métricas |
| `/tickets` | Lista de tickets con filtros |
| `/tickets/new` | Crear ticket con IA |
| `/tickets/[id]` | Detalle completo del ticket |
| `/tickets/kanban` | Vista Kanban drag & drop |
| `/tickets/compras` | Compras Ticket Exprés |
| `/knowledge` | Base de conocimiento |
| `/knowledge/[id]` | Artículo de conocimiento |
| `/analytics` | Gráficos y predicciones |
| `/users` | Gestión de usuarios |
| `/subscriptions` | Planes y pagos |
| `/profile` | Perfil de usuario |

</td>
<td width="50%" valign="top">

### ⚙️ Backend (37 endpoints API)

| Módulo | Endpoints |
|--------|-----------|
| **Auth** | Login, Register, Logout, Super Admin |
| **Tickets** | CRUD, Comentarios, Evaluación, Stats, Predicción |
| **AI** | Triage, Copilot, Sentiment, Similar |
| **Knowledge** | CRUD Artículos |
| **Users** | CRUD Usuarios |
| **Categories** | CRUD Categorías |
| **Payments** | Pago Ticket Exprés |
| **Subscriptions** | Planes y Suscripciones |
| **Notifications** | SSE Tiempo Real |
| **Admin** | Stats Globales, Organizaciones |

</td>
</tr>
</table>

---

## 🏗️ Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           🌐 FRONTEND                                   │
│                                                                        │
│   ┌─────────────┐    ┌──────────────┐    ┌────────────────────────┐    │
│   │   Landing    │    │   Dashboard  │    │     Super Admin        │    │
│   │   ────────   │    │   ────────   │    │     ────────────       │    │
│   │ • Hero       │    │ • Métricas   │    │ • Gestión Orgs         │    │
│   │ • Features   │    │ • Tickets    │    │ • Estadísticas         │    │
│   │ • Pricing    │    │ • Charts     │    │ • Control Total        │    │
│   │ • CTA        │    │ • IA Chat    │    │                        │    │
│   └─────────────┘    └──────────────┘    └────────────────────────┘    │
│                                                                        │
│   Stack: Next.js 14 + React 18 + TypeScript + Tailwind CSS             │
│   UI: Radix UI + shadcn/ui + Framer Motion + Recharts                  │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           ⚡ API ROUTES                                  │
│                                                                        │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│   │   Auth   │  │  Tickets │  │    AI    │  │  Admin   │              │
│   │  ──────  │  │  ──────  │  │  ──────  │  │  ──────  │              │
│   │ • JWT    │  │ • CRUD   │  │ • Triage │  │ • Stats  │              │
│   │ • Roles  │  │ • Search │  │ • NLP    │  │ • Orgs   │              │
│   │ • Guard  │  │ • Stats  │  │ • ML     │  │ • Control│              │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘              │
│                                                                        │
│   Middleware: Auth + Role Validation + Rate Limiting                    │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           🗄️ DATABASE                                   │
│                                                                        │
│   PostgreSQL (Neon Serverless) + Prisma ORM                             │
│                                                                        │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │
│   │ Organization│──│    User     │──│   Ticket    │                   │
│   │    (Org)    │  │   (4 Roles) │  │  (10 States)│                   │
│   └─────────────┘  └─────────────┘  └──────┬──────┘                   │
│                                            │                           │
│                        ┌───────────────────┼───────────────────┐       │
│                        │                   │                   │       │
│                   ┌────▼────┐         ┌────▼────┐         ┌───▼───┐   │
│                   │ Comment │         │ History │         │ Eval  │   │
│                   └─────────┘         └─────────┘         └───────┘   │
│                                                                        │
│   + Category + KnowledgeArticle + SubscriptionPlan + Payment          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico Completo

<table>
<tr>
<td width="33%" valign="top">

**Frontend**
| Tecnología | Uso |
|-----------|-----|
| Next.js 14 | Framework principal |
| React 18 | UI Library |
| TypeScript 5 | Tipado estático |
| Tailwind CSS 3 | Estilos utility-first |
| Framer Motion 11 | Animaciones fluidas |
| Recharts 3.8 | Gráficos interactivos |
| @dnd-kit | Drag & Drop Kanban |
| Sonner | Toast notifications |

</td>
<td width="33%" valign="top">

**Backend**
| Tecnología | Uso |
|-----------|-----|
| API Routes | REST API endpoints |
| Prisma 5 | ORM + Migrations |
| jose 5 | JWT tokens |
| bcryptjs | Hash de contraseñas |
| Zod 3.23 | Validación de datos |
| jsPDF 4.2 | Generación de PDFs |
| SSE | Notificaciones real-time |
| date-fns 4 | Manejo de fechas |

</td>
<td width="33%" valign="top">

**UI Components**
| Componente | Origen |
|-----------|--------|
| Button, Input | shadcn/ui |
| Dialog, Sheet | Radix UI |
| Select, Tabs | Radix UI |
| Dropdown, Popover | Radix UI |
| Toast, Tooltip | Radix UI |
| Switch, Avatar | Radix UI |
| Progress, Label | Radix UI |
| Command (cmdk) | Paleta comandos |

</td>
</tr>
</table>

---

## 🗃️ Base de Datos - Modelos

<table>
<tr>
<td width="50%">

### Modelos Principales

```
Organization ──< User
     │
     ├──< Category ──< Ticket
     │                  │
     │         ┌────────┼────────┐
     │         │        │        │
     │    Comment  History  Evaluation
     │
     ├──< KnowledgeArticle
     ├──< Subscription ──< Payment
     └──< EmailLog
```

</td>
<td width="50%">

### Estados de Ticket (10)

| Icono | Estado | Descripción |
|-------|--------|-------------|
| 🟢 | `OPEN` | Creado, esperando |
| 🔵 | `IN_PROGRESS` | En progreso |
| 📥 | `RECEIVED` | Recibido en taller |
| 🔍 | `DIAGNOSING` | Diagnosticando |
| 🔧 | `REPAIRING` | Reparando |
| ⏳ | `WAITING_PARTS` | Sin repuestos |
| ✅ | `READY` | Listo para entregar |
| 📦 | `DELIVERED` | Entregado |
| ✔️ | `RESOLVED` | Resuelto |
| ❌ | `CLOSED` | Cerrado |

</td>
</tr>
</table>

### Roles de Usuario (4)

| Rol | Icono | Permisos |
|-----|-------|----------|
| `SUPER_ADMIN` | 👑 | Acceso total a todas las organizaciones |
| `ADMIN` | ⚙️ | Gestionar usuarios, categorías, suscripciones |
| `TECHNICIAN` | 🔧 | Ver tickets asignados, actualizar estados |
| `END_USER` | 👤 | Crear tickets, ver los propios |

---

## 📡 API Endpoints - Documentación Completa

<details>
<summary><b>🔑 Autenticación (4 endpoints)</b></summary>

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Iniciar sesión con email/password |
| `POST` | `/api/auth/register` | Registrar usuario + organización |
| `POST` | `/api/auth/logout` | Cerrar sesión (limpiar cookie) |
| `POST` | `/api/auth/register-super-admin` | Registrar super admin (requiere clave) |

</details>

<details>
<summary><b>🎫 Tickets (8 endpoints)</b></summary>

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/tickets` | Listar tickets (paginado, filtrable) |
| `POST` | `/api/tickets` | Crear ticket (numeración automática) |
| `GET` | `/api/tickets/[id]` | Detalle completo con comentarios |
| `PATCH` | `/api/tickets/[id]` | Actualizar estado/asignación |
| `POST` | `/api/tickets/[id]/comments` | Agregar comentario |
| `POST` | `/api/tickets/[id]/evaluate` | Evaluar resolución (1-5 estrellas) |
| `GET` | `/api/tickets/stats` | Estadísticas por categoría/estado |
| `GET` | `/api/tickets/predict` | Predicción de volumen a 7 días |

</details>

<details>
<summary><b>🤖 Inteligencia Artificial (4 endpoints)</b></summary>

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/ai/triage` | Clasificación automática de tickets |
| `POST` | `/api/ai/copilot` | Sugerencia de soluciones |
| `POST` | `/api/ai/sentiment` | Análisis de sentimiento |
| `POST` | `/api/ai/search-similar` | Buscar tickets similares resueltos |

</details>

<details>
<summary><b>📚 Base de Conocimiento (5 endpoints)</b></summary>

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/knowledge` | Listar artículos (searchable) |
| `POST` | `/api/knowledge` | Crear artículo (solo admin) |
| `GET` | `/api/knowledge/[id]` | Detalle (incrementa vistas) |
| `PATCH` | `/api/knowledge/[id]` | Actualizar artículo |
| `DELETE` | `/api/knowledge/[id]` | Eliminar artículo |

</details>

<details>
<summary><b>👥 Usuarios y Otros (16 endpoints)</b></summary>

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET/POST` | `/api/users` | Listar/Invitar usuarios |
| `PATCH` | `/api/users/[id]` | Actualizar usuario |
| `GET/POST` | `/api/categories` | CRUD Categorías |
| `GET` | `/api/emails` | Logs de email |
| `GET` | `/api/notifications` | SSE notificaciones |
| `GET/PATCH` | `/api/profile` | Perfil de usuario |
| `POST` | `/api/payments` | Pago Ticket Exprés |
| `GET/POST` | `/api/subscriptions` | Suscripciones |
| `GET` | `/api/subscription-plans` | Planes disponibles |
| `GET` | `/api/admin/stats` | Estadísticas globales |
| `GET` | `/api/admin/organizations` | Todas las organizaciones |

</details>

---

## 💰 Planes de Suscripción

<table>
<tr>
<td width="33%" align="center">

**🟢 Gratis**
# S/ 0
/mes

| Feature | Límite |
|---------|--------|
| Tickets | 50/mes |
| IA | 1 chat gratis |
| Dashboard | ✅ Básico |
| Knowledge | ✅ |
| Analytics | ❌ |
| Email | ❌ |

</td>
<td width="33%" align="center" style="border: 2px solid #6366f1; border-radius: 12px;">

**⭐ Básico** (Popular)
# S/ 29
/mes

| Feature | Límite |
|---------|--------|
| Tickets | ♾️ Ilimitado |
| IA | ♾️ Ilimitado |
| Dashboard | ✅ |
| Knowledge | ✅ |
| Analytics | ✅ Básico |
| Email | ✅ |

</td>
<td width="33%" align="center">

**💎 Pro**
# S/ 79
/mes

| Feature | Límite |
|---------|--------|
| Tickets | ♾️ Ilimitado |
| IA | ♾️ Ilimitado |
| Dashboard | ✅ |
| Knowledge | ✅ |
| Analytics | ✅ Avanzado |
| Soporte | ✅ Prioritario |

</td>
</tr>
</table>

---

## 🚀 Instalación Rápida

### Prerrequisitos
- **Node.js** 18+ 
- **npm** o yarn
- **PostgreSQL** (recomendado: Neon Serverless)

### Pasos

```bash
# 1️⃣ Clonar repositorio
git clone https://github.com/Ludinhosilva/HELPDESK.git
cd HELPDESK

# 2️⃣ Instalar dependencias
npm install

# 3️⃣ Configurar entorno
cp .env.example .env
# Editar .env con tus variables

# 4️⃣ Preparar base de datos
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed.ts

# 5️⃣ Iniciar desarrollo
npm run dev
```

### 🔑 Credenciales por Defecto

| Rol | Email | Contraseña |
|-----|-------|------------|
| 👑 Super Admin | `super@flixsupport.com` | `admin123` |
| ⚙️ Admin | `admin@techcorp.com` | `admin123` |
| 🔧 Técnico | `tecnico@techcorp.com` | `admin123` |
| 👤 Usuario | `usuario@techcorp.com` | `admin123` |

---

## 📁 Estructura del Proyecto

```
flix-support/
│
├── 📂 prisma/
│   ├── schema.prisma        # 🗃️ Modelo de datos (11 tablas)
│   ├── seed.ts              # 🌱 Datos iniciales
│   └── 📂 migrations/       # 🔄 Migraciones de BD
│
├── 📂 src/
│   ├── 📂 app/
│   │   ├── 📂 (dashboard)/  # 🔐 Rutas autenticadas
│   │   │   ├── dashboard/   # 📊 Panel principal
│   │   │   ├── tickets/     # 🎫 Gestión de tickets
│   │   │   │   ├── [id]/    # 👁️ Detalle ticket
│   │   │   │   ├── kanban/  # 📋 Vista Kanban
│   │   │   │   ├── new/     # ➕ Crear ticket
│   │   │   │   └── compras/ # 💳 Ticket Exprés
│   │   │   ├── knowledge/   # 📚 Base conocimiento
│   │   │   ├── analytics/   # 📈 Analíticas
│   │   │   ├── users/       # 👥 Usuarios
│   │   │   ├── categories/  # 🏷️ Categorías
│   │   │   ├── emails/      # 📧 Logs email
│   │   │   ├── subscriptions/ # 💰 Suscripciones
│   │   │   ├── settings/    # ⚙️ Configuración
│   │   │   └── profile/     # 👤 Perfil
│   │   │
│   │   ├── 📂 (super-admin)/ # 👑 Rutas super admin
│   │   │   └── super-admin/
│   │   │
│   │   ├── 📂 api/          # ⚡ API Routes (37 endpoints)
│   │   │   ├── ai/          # 🤖 Motor IA
│   │   │   ├── auth/        # 🔑 Autenticación
│   │   │   ├── tickets/     # 🎫 CRUD Tickets
│   │   │   ├── knowledge/   # 📚 Base Conocimiento
│   │   │   └── ...
│   │   │
│   │   ├── login/           # 🚪 Login
│   │   ├── register/        # 📝 Registro
│   │   └── page.tsx         # 🏠 Landing page
│   │
│   ├── 📂 components/
│   │   ├── 📂 ui/           # 🎨 Componentes base (shadcn/ui)
│   │   ├── ai-triage.tsx    # 🤖 Widget IA
│   │   ├── comment-section.tsx
│   │   └── ...
│   │
│   ├── 📂 lib/
│   │   ├── auth.ts          # 🔐 Helpers autenticación
│   │   ├── ai-usage.ts      # 🤖 Control uso IA
│   │   └── utils.ts         # 🔧 Utilidades
│   │
│   └── 📂 core/
│       └── api-client.ts    # 📡 Cliente API
│
├── 📂 public/               # 🖼️ Archivos estáticos
├── .env                     # 🔑 Variables de entorno
├── tailwind.config.ts       # 🎨 Configuración Tailwind
├── next.config.js           # ⚙️ Configuración Next.js
└── package.json             # 📦 Dependencias
```

---

## 🧪 Testing

<table>
<tr>
<td align="center">

**Unit Tests**
<br>
<img src="https://img.shields.io/badge/Vitest-125 Passed-brightgreen?style=for-the-badge" alt="Tests"/>

```bash
npm run test
```

</td>
<td align="center">

**E2E Tests**
<br>
<img src="https://img.shields.io/badge/Playwright-E2E-blue?style=for-the-badge" alt="E2E"/>

```bash
npx playwright test
```

</td>
<td align="center">

**Linting**
<br>
<img src="https://img.shields.io/badge/ESLint-Passing-green?style=for-the-badge" alt="Lint"/>

```bash
npm run lint
```

</td>
</tr>
</table>

---

## 📄 Licencia

<table>
<tr>
<td>

**Proyecto Académico**
<br>
Universidad Nacional de la Amazonía Peruana (UNAP)
<br>
Ingeniería de Sistemas - 2026

</td>
<td align="right">

**Autor**
<br>
Ludwing Silva
<br>

<a href="https://github.com/Ludinhosilva" target="_blank">
<img src="https://img.shields.io/badge/GitHub-Ludinhosilva-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
</a>

</td>
</tr>
</table>

---

<div align="center">

### ⚡ Construido con las mejores tecnologías

<img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
<img src="https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma"/>
<img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>

<br>
<br>

**¿Te gusta? ¡Dale una ⭐ en GitHub!**

</div>
