-- DeBarrio — Metadatos descriptivos del partido (los usa la UI)
-- titulo/formato/comuna/dur/nota: texto libre que el organizador completa al crear el partido.

alter table partidos
  add column if not exists titulo  text,
  add column if not exists formato text,
  add column if not exists comuna  text,
  add column if not exists dur     text,
  add column if not exists nota    text;

-- crear_partido acepta los nuevos campos (reemplaza la versión de 0001)
create or replace function crear_partido(
  p_grupo uuid, p_cancha text, p_fecha timestamptz,
  p_costo integer, p_num_cupos integer, p_deadline timestamptz,
  p_titulo text default null, p_formato text default null,
  p_comuna text default null, p_dur text default null, p_nota text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_partido uuid; i integer;
begin
  if not es_organizador(p_grupo) then
    raise exception 'Solo el organizador puede crear partidos';
  end if;
  insert into partidos (grupo_id, cancha, fecha, costo_total, num_cupos, deadline_pago, created_by,
                        titulo, formato, comuna, dur, nota)
  values (p_grupo, p_cancha, p_fecha, p_costo, p_num_cupos, p_deadline, auth.uid(),
          p_titulo, p_formato, p_comuna, p_dur, p_nota)
  returning id into v_partido;
  for i in 1..p_num_cupos loop
    insert into cupos (partido_id, numero) values (v_partido, i);
  end loop;
  return v_partido;
end;
$$;
