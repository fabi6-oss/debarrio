# DeBarrio — Contexto

**Descripción**: PWA para organizar partidos de fútbol de barrio. Cupo se reserva solo con pago confirmado (transferencia manual). Mecanismo todospor.cl sin rifa-premio ni comisión.

**Stack**:
- Frontend: React + Vite + TypeScript (PWA mobile-first)
- Backend/DB: Supabase (Auth + Postgres + RLS + Storage + Edge Functions)
- Deploy: Vercel (frontend) + Supabase (datos) — free tier
- Avisos: Web Push + compartir WhatsApp

**Owner**: Fabián
**Status**: ✅ EN PRODUCCIÓN — https://debarrio.vercel.app

## Restricciones (confirmadas por usuario)
- 100% gratis, sin comisiones → sin pasarela de pago.
- Solo transferencia bancaria manual + confirmación.
- Escalable + cuentas de usuario (cada persona se registra).
- MVP incluye historial y ranking (pagador puntual, deudores, asistencia).

## Decisión central de diseño
Cupo = pago. Sin transferencia confirmada, no hay reserva. Traslada la presión del organizador al jugador.

## Fases
- [x] Fase 0 — Setup (estructura ✓, Memory Palace ✓; frontend Vite implementado a mano).
- [x] Fase 0.5 — Diseño visual ✓. Marca FINAL verde #1b7a3d + naranjo #f2641a, fuente Figtree, español chileno.
- [x] Frontend implementado ✓ — `frontend/` React+Vite, 6 pantallas + shell responsive (sidebar desktop / bottom-nav móvil), datos mock. Cablear a Supabase real pendiente.
- [x] Fase 1 — Datos: esquema SQL + RLS + RPCs + vistas + trigger perfil ✓ (backend/supabase/migrations/0001-0012).
- [~] Fase 2 — Backend listo (RPCs crear_partido, tomar_cupo). UI conectada a Supabase real pendiente.
- [~] Fase 3 — Backend listo (adjuntar_comprobante, confirmar_pago, bucket comprobantes). UI + signed-URL RPC pendiente.
- [~] Fase 4 — liberar_cupos_vencidos() + pg_cron cada 5 min ✓. Recordatorios push pendientes.
- [ ] Fase 5 — Historial/ranking (vistas SQL, score de pago, deudores)
- [x] Fase 6 — Deploy ✓ COMPLETO (ver sección Deploy)

## Próximos pasos
- Conectar pantallas React a Supabase real (reemplazar mock data).
- Cablear Auth UI (login/registro ya en AuthScreen.jsx, falta validar con Supabase).
- Google OAuth: agregar https://debarrio.vercel.app a Authorized JavaScript origins en Google Cloud Console.
- Signed URL RPC para que organizador vea comprobantes.

## Deploy (completado 2026-06-07)
- **URL producción**: https://debarrio.vercel.app ✅ (HTTP 200 verificado)
- **GitHub**: https://github.com/fabi6-oss/debarrio (repo público, rama main)
- **Vercel**: proyecto `debarrio` en team `fabianzccs-7161s-projects`
  - Root directory: `frontend/`
  - Env vars: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` en production/preview/development
  - vercel.json con SPA rewrite (todos los paths → index.html)
- **Supabase Auth URLs**:
  - Site URL: `https://debarrio.vercel.app`
  - Redirect URLs: `https://debarrio.vercel.app,https://debarrio.vercel.app/**`
- **PWA**: manifest.webmanifest servido con `application/manifest+json` ✅
- **Tokens**: GitHub `ghp_*`, Vercel `vcp_*`, Supabase `sbp_*` — revocar en dashboards.

## Reutilización
Patrón Supabase + Vercel ya validado en `Proyectos/Rifa_columna`. Mecánica "elegir slot → marcar pagado → confirmar" reusable; esquema de datos distinto (dominio fútbol).
