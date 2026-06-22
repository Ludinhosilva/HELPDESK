# ADR 001: Arquitectura Monolito con Next.js 14

## Estado
Aceptado

## Fecha
2026-05-25

## Contexto

Necesitamos un sistema de Help Desk para taller de reparacion de computadoras. El proyecto sera desarrollado por un ingeniero en etapa de aprendizaje aplicando SDD (Spec-Driven Development), testing de caja blanca/negra, y principios SOLID. El entorno de desarrollo usa exclusivamente herramientas gratuitas (OpenCode + DeepSeek).

## Decision

Usaremos Next.js 14 como **monolito full-stack** (App Router para frontend + API Routes para backend), con Prisma ORM sobre SQLite.

## Alternativas Consideradas

| Opcion | Pros | Contras | Verdict |
|--------|------|---------|---------|
| **Next.js monolito (elegida)** | Un solo proyecto, menor friccion, API Routes tipadas, mismo lenguaje front/back | Menor separacion de responsabilidades, no es microservicios | Elegida |
| NestJS + Vite/React separados | Backend robusto, arquitectura hexagonal, mas profesional | Dos proyectos, mas configuracion, mas contexto para IA | Descartada por complejidad |
| Express + React | Simple, clasico | Sin tipado fuerte, sin convenciones, boilerplate manual | Descartada por falta de estructura |

## Stack Final

| Componente | Tecnologia | Justificacion |
|-----------|-----------|---------------|
| Framework | Next.js 14 (App Router) | SSR opcional, API Routes, TypeScript nativo |
| UI | NextUI + Tailwind CSS | Componentes accesibles, ya conocido por el equipo |
| ORM | Prisma 5 | Tipado generado, migraciones, SQLite soporte |
| DB | SQLite | Cero configuracion, archivo unico, ideal para desarrollo |
| Auth | JWT + bcryptjs | Stateless, sin sesiones en servidor |

## Consecuencias

- **Positivo**: Desarrollo rapido, un solo `npm run dev`, mismo lenguaje front/back
- **Positivo**: Prisma genera tipos que se comparten entre API Routes y frontend
- **Positivo**: Menor carga cognitiva para el desarrollador y los agentes IA
- **Negativo**: No escala horizontalmente como microservicios
- **Negativo**: SQLite no soporta concurrent writes pesados (suficiente para MVP)
