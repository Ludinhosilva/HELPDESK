# Design Tokens — PC Repair Help Desk

## Paleta de Colores

### Brand
| Token | Hex | Uso |
|-------|-----|-----|
| `--color-primary` | `#006FEE` | Botones principales, links, navbar activo |
| `--color-primary-foreground` | `#FFFFFF` | Texto sobre primary |

### Secundario
| Token | Hex | Uso |
|-------|-----|-----|
| `--color-secondary` | `#7828C8` | Badge "En diagnostico", acentos secundarios |
| `--color-secondary-foreground` | `#FFFFFF` | Texto sobre secondary |

### Semanticos (Estados)
| Token | Hex | Significado | Uso en Tickets |
|-------|-----|------------|----------------|
| `--color-success` | `#17C964` | Exito / Completado | READY, DELIVERED |
| `--color-warning` | `#F5A524` | Atencion / Pausa | WAITING_PARTS, HIGH priority |
| `--color-danger` | `#F31260` | Error / Critico | CRITICAL priority, actions destructivas |
| `--color-info` | `#0072F5` | Informativo | RECEIVED, DIAGNOSING |

### Superficies
| Token | Hex | Uso |
|-------|-----|-----|
| `--color-background` | `#18181B` | Fondo dark del dashboard |
| `--color-foreground` | `#ECEDEE` | Texto principal sobre fondo dark |
| `--color-surface` | `#27272A` | Cards, modales, tablas |
| `--color-border` | `#3F3F46` | Bordes sutiles |

---

## Tipografia

### Familia
- **Primaria**: `Inter`, sans-serif (UI general, formularios, tablas)
- **Codigo**: `JetBrains Mono`, monospace (numeros de ticket, seriales, codigos)

### Escala tipografica
| Nivel | Size | Line Height | Peso | Uso |
|-------|------|-------------|------|-----|
| `h1` | `2rem` (32px) | `1.2` | 700 | Titulo de pagina |
| `h2` | `1.5rem` (24px) | `1.3` | 600 | Titulo de seccion |
| `h3` | `1.25rem` (20px) | `1.4` | 600 | Titulo de card |
| `body` | `0.875rem` (14px) | `1.5` | 400 | Texto general |
| `small` | `0.75rem` (12px) | `1.5` | 400 | Texto secundario, timestamps |
| `code` | `0.8125rem` (13px) | `1.5` | 500 | Seriales, TK-XXX |

---

## Espaciado (base 4px)

| Token | Valor | Uso |
|-------|-------|-----|
| `--space-1` | `4px` | Gap minimo entre iconos |
| `--space-2` | `8px` | Padding interno de badges, gap en inline |
| `--space-3` | `12px` | Padding de inputs compactos |
| `--space-4` | `16px` | Padding estandar de cards y modales |
| `--space-6` | `24px` | Separacion entre secciones |
| `--space-8` | `32px` | Margen de pagina |

---

## Bordes y Sombras

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-sm` | `6px` | Inputs, badges, chips de estado |
| `--radius-md` | `8px` | Botones, cards, modales (aspecto semi-cuadrado industrial) |
| `--radius-lg` | `12px` | Cards grandes, dropdowns |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.3)` | Elevacion minima (cards) |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.4)` | Modales, dropdowns |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.5)` | Solo para elementos criticos |

---

## Mapeo de Estados a Colores

### Ticket Status
| Estado | Color | Icono (Tabler) |
|--------|-------|---------------|
| RECEIVED | `info` (#0072F5) | IconInbox |
| DIAGNOSING | `secondary` (#7828C8) | IconSearch |
| REPAIRING | `warning` (#F5A524) | IconTool |
| WAITING_PARTS | `warning` (#F5A524) | IconPackage |
| READY | `success` (#17C964) | IconCircleCheck |
| DELIVERED | `default` (#3F3F46) | IconTruckDelivery |

### Prioridad
| Prioridad | Color |
|-----------|-------|
| LOW | `default` |
| MEDIUM | `info` |
| HIGH | `warning` |
| CRITICAL | `danger` |

---

## Convenciones de Iconos (Tabler Icons - @tabler/icons-react)

| Contexto | Icono |
|----------|-------|
| Nuevo ticket | `IconFilePlus` |
| Buscar | `IconSearch` |
| Asignar tecnico | `IconUserCheck` |
| Cambiar estado | `IconArrowsExchange` |
| Notas tecnicas | `IconNotes` |
| Cliente | `IconUser` |
| Equipo | `IconDeviceLaptop` |
| Dashboard | `IconLayoutDashboard` |
| Tickets | `IconTicket` |
| Historial | `IconHistory` |
