-- DeBarrio — Programar liberación de cupos vencidos cada 5 min.
-- pg_cron viene disponible en Supabase (habilitar extensión).

create extension if not exists pg_cron;

-- Evita duplicar el job si se re-ejecuta la migración
select cron.unschedule('liberar-cupos-vencidos')
where exists (select 1 from cron.job where jobname = 'liberar-cupos-vencidos');

select cron.schedule(
  'liberar-cupos-vencidos',
  '*/5 * * * *',
  $$ select liberar_cupos_vencidos(); $$
);

-- Recordatorios push antes del deadline → Fase 4 (Edge Function + Web Push),
-- requiere frontend (suscripción push) y se implementa cuando haya Node.
