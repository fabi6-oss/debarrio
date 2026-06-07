-- DeBarrio — Endurecer privilegios de funciones SECURITY DEFINER
-- Responde a los advisors 0028/0029: funciones SECURITY DEFINER no deben ser
-- llamables por anon/público vía /rest/v1/rpc. Se restringen a 'authenticated'
-- (las que la UI usa) y se ocultan las internas (trigger + cron).

-- 1) Quitar el overload viejo de crear_partido (6 args). Queda solo el de 11 args.
drop function if exists public.crear_partido(uuid, text, timestamptz, integer, integer, timestamptz);

-- 2) Internos (trigger de alta + cron): nadie de la API debe llamarlos.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.liberar_cupos_vencidos() from public, anon, authenticated;

-- 3) Helpers de RLS: los necesita 'authenticated' dentro de las policies; fuera de anon/público.
revoke all on function public.es_miembro(uuid) from public, anon;
revoke all on function public.es_organizador(uuid) from public, anon;
revoke all on function public.grupo_de_partido(uuid) from public, anon;
grant execute on function public.es_miembro(uuid) to authenticated, service_role;
grant execute on function public.es_organizador(uuid) to authenticated, service_role;
grant execute on function public.grupo_de_partido(uuid) to authenticated, service_role;

-- 4) RPCs de negocio: solo usuarios autenticados (no anon).
revoke all on function public.tomar_cupo(uuid) from public, anon;
revoke all on function public.adjuntar_comprobante(uuid, text) from public, anon;
revoke all on function public.confirmar_pago(uuid) from public, anon;
revoke all on function public.crear_partido(uuid, text, timestamptz, integer, integer, timestamptz, text, text, text, text, text) from public, anon;
grant execute on function public.tomar_cupo(uuid) to authenticated, service_role;
grant execute on function public.adjuntar_comprobante(uuid, text) to authenticated, service_role;
grant execute on function public.confirmar_pago(uuid) to authenticated, service_role;
grant execute on function public.crear_partido(uuid, text, timestamptz, integer, integer, timestamptz, text, text, text, text, text) to authenticated, service_role;
