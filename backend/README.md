# DeBarrio — Backend

El backend es **Supabase** (Auth + Postgres + RLS + Storage + Edge Functions). No hay servidor propio (sin FastAPI/Express): la lógica vive en RPCs de Postgres y la seguridad en RLS.

- `supabase/migrations/` — esquema SQL: tablas, enums, RLS, RPCs, vistas, trigger de perfil, bucket de comprobantes y cron.
- `supabase/functions/` — Edge Functions (recordatorios push, Fase 4 con frontend).

Ver `supabase/README.md` para el detalle de migraciones, RPCs y políticas de seguridad.

## Aplicar

En el SQL Editor del proyecto Supabase, ejecutar en orden `supabase/migrations/0001` → `0002` → `0003`. O con CLI desde esta carpeta: `supabase db push`.
