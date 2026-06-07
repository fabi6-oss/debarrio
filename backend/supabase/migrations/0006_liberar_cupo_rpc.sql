-- DeBarrio — RPC: el organizador libera manualmente un cupo pendiente (lo usa la UI).
-- (liberar_cupos_vencidos sigue corriendo por cron para los vencidos.)

create or replace function liberar_cupo(p_cupo uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_grupo uuid;
begin
  select grupo_de_partido(partido_id) into v_grupo from cupos where id = p_cupo;
  if v_grupo is null then raise exception 'Cupo no existe'; end if;
  if not es_organizador(v_grupo) then raise exception 'Solo el organizador libera cupos'; end if;
  update pagos set estado = 'rechazado' where cupo_id = p_cupo and estado = 'pendiente';
  update cupos set estado = 'libre', jugador_id = null, reservado_at = null, expira_at = null
  where id = p_cupo;
end;
$$;

revoke all on function public.liberar_cupo(uuid) from public, anon;
grant execute on function public.liberar_cupo(uuid) to authenticated, service_role;
