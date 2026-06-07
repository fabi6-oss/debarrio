# DeBarrio — Contexto

**Descripción**: PWA para organizar partidos de fútbol de barrio. Cupo se reserva solo con pago confirmado (transferencia manual). Mecanismo todospor.cl sin rifa-premio ni comisión.

**Stack**:
- Frontend: React + Vite + TypeScript (PWA mobile-first)
- Backend/DB: Supabase (Auth + Postgres + RLS + Storage + Edge Functions)
- Deploy: Vercel (frontend) + Supabase (datos) — free tier
- Avisos: Web Push + compartir WhatsApp

**Owner**: Fabián
**Status**: Fase 0 — setup

## Restricciones (confirmadas por usuario)
- 100% gratis, sin comisiones → sin pasarela de pago.
- Solo transferencia bancaria manual + confirmación.
- Escalable + cuentas de usuario (cada persona se registra).
- MVP incluye historial y ranking (pagador puntual, deudores, asistencia).

## Decisión central de diseño
Cupo = pago. Sin transferencia confirmada, no hay reserva. Traslada la presión del organizador al jugador.

## Fases
- [x] Fase 0 — Setup (estructura ✓, Memory Palace ✓; frontend Vite implementado a mano — falta solo `npm install`/Node para correr).
- [x] Fase 0.5 — Diseño visual ✓. Dos versiones: v1 propia (docs/design/) y la elegida = **handoff de Claude Design** ya portado al frontend. Marca FINAL verde #1b7a3d + naranjo #f2641a, fuente Figtree, español chileno (modismos), "lista" no "grilla".
- [x] Frontend implementado ✓ — `frontend/` React+Vite, 6 pantallas + shell responsive (sidebar desktop / bottom-nav móvil), datos mock. Portado del bundle de Claude Design; panel Tweaks descartado. PENDIENTE: instalar Node y `npm run dev` para verificar; cablear a Supabase.
- [~] Fase 1 — Datos: esquema SQL + RLS + RPCs + vistas + trigger perfil ✓ (backend/supabase/migrations/0001-0003). Auth UI (login/registro + Google) pendiente → necesita Node.
- [~] Fase 2 — Backend listo (RPCs crear_partido, tomar_cupo). UI pendiente (Node).
- [~] Fase 3 — Backend listo (adjuntar_comprobante, confirmar_pago, bucket comprobantes). UI + signed-URL RPC pendiente.
- [~] Fase 4 — liberar_cupos_vencidos() + pg_cron cada 5 min ✓. Recordatorios push pendientes (Node).
- [ ] Fase 5 — Historial/ranking (vistas SQL, score de pago, deudores)
- [ ] Fase 6 — Deploy + revisión (Revisor + Seguridad)

## Bloqueador actual
Node.js NO instalado en el equipo. Necesario para scaffold y dev del frontend. Pendiente decidir instalación (winget disponible).

## Reutilización
Patrón Supabase + Vercel ya validado en `Proyectos/Rifa_columna`. Mecánica "elegir slot → marcar pagado → confirmar" reusable; esquema de datos distinto (dominio fútbol).
