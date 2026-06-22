# ADR 002: Estrategia de Autenticacion y Autorizacion

## Estado
Aceptado

## Fecha
2026-05-25

## Contexto

El sistema requiere que solo usuarios autenticados (ADMIN o TECHNICIAN) accedan al dashboard y endpoints de la API. Ademas, ciertas operaciones deben estar restringidas por rol.

## Decision

Usaremos **JWT (JSON Web Tokens)** almacenados en **cookies httpOnly** para autenticacion, y middleware de Next.js para proteccion de rutas.

## Detalles

### Autenticacion

- **POST /api/auth/register**: crear usuario con email, password (hash bcrypt), name, role
- **POST /api/auth/login**: validar credenciales, generar JWT, setear cookie `token`
- **POST /api/auth/logout**: limpiar cookie `token`
- La cookie es `httpOnly`, `sameSite: "lax"`, `path: "/"`
- El JWT expira en 24 horas

### Autorizacion

- **Middleware de Next.js**: protege rutas `/dashboard/*` y `/api/*` (excepto `/api/auth/*`)
- **Roles**:
  - `ADMIN`: acceso total a todas las rutas y endpoints
  - `TECHNICIAN`: acceso a dashboard, tickets propios, clientes, dispositivos. Sin acceso a gestion de usuarios.

### Estructura del JWT Payload

```json
{
  "sub": "uuid-del-usuario",
  "email": "tecnico@taller.com",
  "role": "TECHNICIAN",
  "iat": 1748198400,
  "exp": 1748284800
}
```

## Alternativas Consideradas

| Opcion | Pros | Contras | Verdict |
|--------|------|---------|---------|
| **JWT en cookie httpOnly (elegida)** | Seguro contra XSS, stateless, simple | Requiere middleware manual | Elegida |
| NextAuth.js | Completo, OAuth, sesiones | Complejidad innecesaria para MVP | Descartada |
| Sesiones en servidor | Revocables | Stateful, requiere DB extra | Descartada |

## Consecuencias

- **Positivo**: Sin estado en el servidor, cada request lleva su propia autorizacion
- **Positivo**: Cookie httpOnly previene robo de token via XSS
- **Negativo**: No se puede revocar un JWT antes de que expire (aceptable para MVP)
- **Negativo**: El middleware de Next.js corre en Edge Runtime, no puede usar Prisma directamente (se usara jose o jsonwebtoken para verificar)
