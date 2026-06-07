-- DeBarrio — Endurece confirmar_pago contra confirmaciones inválidas.
-- Antes: confirmar un pago no validaba su estado ni el del cupo. Un pago viejo
-- (rechazado por el cron al vencer) podía marcar 'pagado' un cupo ya liberado
-- o tomado por otro jugador, sobreescribiendo al ocupante real.
-- Ahora: exige pago 'pendiente' + cupo 'reservado_pendiente' (con FOR UPDATE).

create or replace function confirmar_pago(p_pago uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_cupo uuid; v_grupo uuid; v_estado_pago estado_pago; v_estado_cupo estado_cupo;
begin
  select pg.cupo_id, grupo_de_partido(pg.partido_id), pg.estado
    into v_cupo, v_grupo, v_estado_pago
  from pagos pg where pg.id = p_pago;

  if v_cupo is null then
    raise exception 'Pago no encontrado';
  end if;
  if not es_organizador(v_grupo) then
    raise exception 'Solo el organizador confirma pagos';
  end if;
  if v_estado_pago <> 'pendiente' then
    raise exception 'Este pago ya no está pendiente';
  end if;

  select estado into v_estado_cupo from cupos where id = v_cupo for update;
  if v_estado_cupo <> 'reservado_pendiente' then
    raise exception 'El cupo ya no está reservado (se liberó o venció)';
  end if;

  update pagos set estado = 'confirmado', confirmado_por = auth.uid(), confirmado_at = now()
  where id = p_pago;
  update cupos set estado = 'pagado' where id = v_cupo;
end;
$$;
