-- DeBarrio — RPC crear_grupo: inserta grupo + miembro organizador atómicamente.
-- Por qué: el INSERT directo en grupos + .select() fallaba con RLS porque la
-- policy grupos_select exige es_miembro(id), y el usuario todavía NO es miembro
-- en ese instante (se agrega justo después). Atomizar en una RPC SECURITY DEFINER
-- evita la carrera y el RETURNING bloqueado.

create or replace function crear_grupo(
  p_nombre          text,
  p_transfer_titular text default null,
  p_transfer_banco   text default null,
  p_transfer_tipo    text default null,
  p_transfer_numero  text default null,
  p_transfer_rut     text default null,
  p_transfer_email   text default null
) returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_grupo uuid;
begin
  insert into grupos (nombre, organizador_id,
    transfer_titular, transfer_banco, transfer_tipo,
    transfer_numero, transfer_rut, transfer_email)
  values (p_nombre, auth.uid(),
    p_transfer_titular, p_transfer_banco, p_transfer_tipo,
    p_transfer_numero, p_transfer_rut, p_transfer_email)
  returning id into v_grupo;

  insert into miembros (grupo_id, usuario_id, rol)
  values (v_grupo, auth.uid(), 'organizador');

  return v_grupo;
end;
$$;

revoke execute on function crear_grupo(text,text,text,text,text,text,text) from public;
revoke execute on function crear_grupo(text,text,text,text,text,text,text) from anon;
grant  execute on function crear_grupo(text,text,text,text,text,text,text) to authenticated, service_role;
