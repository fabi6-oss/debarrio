-- DeBarrio — Limita el cambio de nombre de perfil a 1 vez cada 30 días.
-- Se implementa con un trigger BEFORE UPDATE (no RPC) para que el límite se
-- respete aunque el cliente haga UPDATE directo vía la policy profiles_update.
-- nombre_changed_at se setea solo cuando el nombre realmente cambia.

alter table profiles add column if not exists nombre_changed_at timestamptz;

create or replace function check_nombre_rate_limit()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.nombre is distinct from old.nombre then
    if old.nombre_changed_at is not null and old.nombre_changed_at > now() - interval '30 days' then
      raise exception 'Solo puedes cambiar tu nombre una vez al mes. Podrás cambiarlo de nuevo el %',
        to_char((old.nombre_changed_at + interval '30 days') at time zone 'America/Santiago', 'DD-MM-YYYY');
    end if;
    new.nombre_changed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_nombre_rate_limit on profiles;
create trigger trg_nombre_rate_limit before update on profiles
  for each row execute function check_nombre_rate_limit();
