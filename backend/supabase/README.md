# DeBarrio — Supabase

Backend: Auth + Postgres + RLS + Storage + Edge Functions. Sin servidor propio.

## Aplicar migraciones

En el **SQL Editor** del proyecto Supabase, ejecutar en orden:

1. `migrations/0001_init.sql` — tablas, enums, RLS, RPCs, vistas, trigger de perfil.
2. `migrations/0002_storage.sql` — bucket privado `comprobantes` + policies.

(O con CLI: `supabase db push`.)

## Modelo de datos

- `profiles` — extiende `auth.users` (trigger crea el perfil al registrarse).
- `grupos` — comunidad recurrente; guarda los datos de transferencia del organizador.
- `miembros` — usuario ↔ grupo, rol `organizador` | `jugador`.
- `partidos` — cancha, fecha, `costo_total`, `num_cupos`, `cuota` (columna generada = costo/cupos), `deadline_pago`.
- `cupos` — un slot por número; estado `libre` → `reservado_pendiente` → `pagado` | `liberado`.
- `pagos` — historial; monto, comprobante (Storage), estado.

## Lógica de negocio = RPCs (no escritura directa a cupos/pagos)

| RPC | Quién | Qué hace |
|---|---|---|
| `crear_partido(...)` | organizador | crea partido + genera N cupos libres |
| `tomar_cupo(cupo_id)` | miembro | reserva cupo (pendiente) + crea pago pendiente; expira en 2 h o en el deadline |
| `adjuntar_comprobante(pago_id, path)` | jugador | adjunta ruta del comprobante a su pago |
| `confirmar_pago(pago_id)` | organizador | marca pago confirmado → cupo `pagado` |
| `liberar_cupos_vencidos()` | cron / Edge Function | libera cupos vencidos y rechaza sus pagos |

## Vistas

- `v_progreso_partido` — cupos pagados/total, recaudado vs. costo.
- `v_ranking` — por jugador y grupo: pagos ok / fallidos.
- `v_deudores` — quién reservó y no pagó.

Todas con `security_invoker = on` → respetan RLS del que consulta.

## Seguridad

- RLS activo en todas las tablas. `cupos` y `pagos` solo se mutan vía RPC.
- Helpers `es_miembro()` / `es_organizador()` son `SECURITY DEFINER` (evitan recursión RLS).
- Bucket `comprobantes` privado: el jugador solo accede a su carpeta; el organizador lo ve vía signed URL emitida por RPC (Fase 3).
- Programar `liberar_cupos_vencidos()` con pg_cron o Edge Function scheduled (Fase 4).
