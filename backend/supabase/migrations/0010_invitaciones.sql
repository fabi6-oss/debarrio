-- DeBarrio — Invitar/unirse a un grupo por link.
-- Cada grupo tiene un invite_code corto; el organizador comparte el link
-- {origin}?join={code} y cualquier usuario autenticado se une como jugador.

alter table grupos add column invite_code text;
update grupos set invite_code = encode(gen_random_bytes(6), 'hex') where invite_code is null;
alter table grupos alter column invite_code set default encode(gen_random_bytes(6), 'hex');
alter table grupos alter column invite_code set not null;
create unique index grupos_invite_code_key on grupos (invite_code);

-- Unirse con el código. SECURITY DEFINER: el usuario aún no es miembro, así que
-- necesita saltarse la RLS de SELECT en grupos para encontrarlo por código.
-- on conflict do nothing → idempotente (re-abrir el link no duplica ni falla).
create or replace function unirse_a_grupo(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_grupo uuid;
begin
  select id into v_grupo from grupos where invite_code = p_code;
  if v_grupo is null then
    raise exception 'Código de invitación inválido';
  end if;
  insert into miembros (grupo_id, usuario_id, rol)
  values (v_grupo, auth.uid(), 'jugador')
  on conflict (grupo_id, usuario_id) do nothing;
  return v_grupo;
end;
$$;

revoke all on function public.unirse_a_grupo(text) from public, anon;
grant execute on function public.unirse_a_grupo(text) to authenticated, service_role;
