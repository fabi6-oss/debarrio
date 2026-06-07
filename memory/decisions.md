# DeBarrio — Decisiones (ADR)

## ADR-001 — Cupo se reserva solo con pago confirmado
**Contexto**: dolor central = gente no paga la cancha, organizador persigue cobros.
**Decisión**: el cupo pasa a `reservado_pendiente` al tomarlo, pero solo cuenta como reservado real cuando el pago está `pagado` (confirmado). Si no paga antes del deadline, se libera.
**Razón**: traslada la presión del organizador al jugador. Quien quiere jugar, paga primero.
**Estado**: aceptada.

## ADR-002 — Sin pasarela de pago, solo transferencia manual
**Contexto**: usuario exige 100% gratis, sin comisiones.
**Decisión**: jugador transfiere por fuera, sube comprobante (foto) a Storage, organizador confirma manualmente. Sin Payku/Flow/Mercado Pago.
**Razón**: las pasarelas cobran ~4%. El usuario no quiere costo.
**Trade-off**: confirmación manual (1 tap del organizador). Aceptable para barrio.
**Estado**: aceptada.

## ADR-003 — Supabase como backend único (sin FastAPI)
**Decisión**: Auth + Postgres + RLS + Storage + Edge Functions. Sin servidor propio.
**Razón**: cuentas de usuario y escalabilidad listas; RLS cubre seguridad; Edge Functions cron cubren tareas server-side (liberar cupos, recordatorios). Menos que mantener, free tier.
**Estado**: aceptada.

## ADR-004 — React + Vite PWA (no Next.js)
**Decisión**: web app PWA mobile-first con Vite.
**Razón**: vecinos en celular; instalable sin App Store; más liviano que Next. No se necesita SSR/SEO en MVP.
**Estado**: aceptada.

## ADR-005 — Diseño visual primero (Claude Design)
**Decisión**: generar sistema de diseño + mockups (skill ckm-design/ui-ux-pro-max) antes de cablear lógica. Exportar tokens compatibles con Tailwind.
**Razón**: usuario quiere montar lo visual con Claude Design. Se entregó tokens.css + mockups.html + design-system.md + PROMPT-claude-design.md (para que el usuario lo rehaga en Claude Design).
**Estado**: aceptada.

## ADR-006 — Mutaciones de cupos/pagos solo vía RPC (no escritura directa)
**Decisión**: `cupos` y `pagos` tienen RLS solo de SELECT; toda mutación pasa por funciones SECURITY DEFINER (tomar_cupo, confirmar_pago, etc.).
**Razón**: la lógica (expiración, validar organizador, crear pago atómico) no se puede expresar segura en policies de UPDATE. RPC centraliza reglas y evita estados inválidos.
**Estado**: aceptada.

## ADR-007 — Liberar cupos con pg_cron (no Edge Function en MVP)
**Decisión**: `liberar_cupos_vencidos()` agendada con pg_cron cada 5 min.
**Razón**: pura SQL, sin Node ni deploy de función. Más simple para el MVP.
**Estado**: aceptada.

## ADR-008 — Comprobantes en bucket privado + signed URL para organizador
**Decisión**: bucket `comprobantes` privado; jugador accede a su carpeta (path = uid). El organizador NO lee el bucket directo: pide signed URL vía RPC que valida es_organizador().
**Razón**: no exponer comprobantes (datos personales) ni dar acceso amplio al organizador sobre el bucket.
**Estado**: aceptada (RPC de signed URL queda para Fase 3 con frontend).
