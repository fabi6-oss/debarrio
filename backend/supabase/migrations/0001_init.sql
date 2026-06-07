-- DeBarrio — Migración inicial
-- Esquema + RLS + RPCs + vistas. Ejecutar en Supabase SQL Editor.
-- Modelo central: el cupo se asegura solo con pago confirmado.

-- ============================================================
-- 1. EXTENSIONES Y ENUMS
-- ============================================================
create extension if not exists pgcrypto;

create type rol_miembro    as enum ('organizador', 'jugador');
create type estado_partido as enum ('abierto', 'confirmado', 'jugado', 'cancelado');
create type estado_cupo    as enum ('libre', 'reservado_pendiente', 'pagado', 'liberado');
create type estado_pago    as enum ('pendiente', 'confirmado', 'rechazado');

-- ============================================================
-- 2. TABLAS
-- ============================================================

-- Perfil: extiende auth.users
create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nombre      text not null default 'Jugador',
  telefono    text,
  posicion    text,
  created_at  timestamptz not null default now()
);

-- Grupo / comunidad recurrente. Guarda los datos de transferencia (cuenta del organizador).
create table grupos (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  organizador_id  uuid not null references profiles (id),
  -- datos de transferencia que verán los jugadores al pagar
  transfer_titular   text,
  transfer_banco     text,
  transfer_tipo      text,   -- 'corriente' | 'vista' | 'rut'
  transfer_numero    text,
  transfer_rut       text,
  transfer_email     text,
  created_at      timestamptz not null default now()
);

-- Relación usuario ↔ grupo
create table miembros (
  id         uuid primary key default gen_random_uuid(),
  grupo_id   uuid not null references grupos (id) on delete cascade,
  usuario_id uuid not null references profiles (id) on delete cascade,
  rol        rol_miembro not null default 'jugador',
  created_at timestamptz not null default now(),
  unique (grupo_id, usuario_id)
);

-- Partido
create table partidos (
  id            uuid primary key default gen_random_uuid(),
  grupo_id      uuid not null references grupos (id) on delete cascade,
  cancha        text not null,
  fecha         timestamptz not null,
  costo_total   integer not null check (costo_total >= 0),     -- CLP
  num_cupos     integer not null check (num_cupos > 0),
  -- cuota dinámica = costo_total / num_cupos (redondeo hacia arriba)
  cuota         integer generated always as
                  ((ceil(costo_total::numeric / nullif(num_cupos, 0)))::int) stored,
  deadline_pago timestamptz not null,
  estado        estado_partido not null default 'abierto',
  created_by    uuid not null references profiles (id),
  created_at    timestamptz not null default now()
);

-- Cupo (un registro por slot del partido)
create table cupos (
  id           uuid primary key default gen_random_uuid(),
  partido_id   uuid not null references partidos (id) on delete cascade,
  numero       integer not null,
  jugador_id   uuid references profiles (id),
  estado       estado_cupo not null default 'libre',
  reservado_at timestamptz,
  expira_at    timestamptz,
  unique (partido_id, numero)
);
create index on cupos (partido_id);
create index on cupos (jugador_id);

-- Pago (historial; 1 por intento de reserva)
create table pagos (
  id             uuid primary key default gen_random_uuid(),
  cupo_id        uuid not null references cupos (id) on delete cascade,
  partido_id     uuid not null references partidos (id) on delete cascade,
  jugador_id     uuid not null references profiles (id),
  monto          integer not null,
  comprobante_path text,                      -- ruta en Storage (bucket privado)
  estado         estado_pago not null default 'pendiente',
  confirmado_por uuid references profiles (id),
  confirmado_at  timestamptz,
  created_at     timestamptz not null default now()
);
create index on pagos (partido_id);
create index on pagos (jugador_id);

-- ============================================================
-- 3. TRIGGER: crear perfil al registrarse
-- ============================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', 'Jugador'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- 4. HELPERS (SECURITY DEFINER, evitan recursión en RLS)
-- ============================================================
create or replace function es_miembro(p_grupo uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from miembros
    where grupo_id = p_grupo and usuario_id = auth.uid()
  );
$$;

create or replace function es_organizador(p_grupo uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from miembros
    where grupo_id = p_grupo and usuario_id = auth.uid() and rol = 'organizador'
  );
$$;

create or replace function grupo_de_partido(p_partido uuid)
returns uuid language sql security definer stable set search_path = public as $$
  select grupo_id from partidos where id = p_partido;
$$;

-- ============================================================
-- 5. RLS
-- ============================================================
alter table profiles enable row level security;
alter table grupos   enable row level security;
alter table miembros enable row level security;
alter table partidos enable row level security;
alter table cupos    enable row level security;
alter table pagos    enable row level security;

-- profiles: todos los autenticados ven perfiles (ranking); cada uno edita el suyo
create policy profiles_select on profiles for select to authenticated using (true);
create policy profiles_update on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- grupos: ve quien es miembro; crea cualquier autenticado; edita el organizador
create policy grupos_select on grupos for select to authenticated
  using (es_miembro(id));
create policy grupos_insert on grupos for insert to authenticated
  with check (organizador_id = auth.uid());
create policy grupos_update on grupos for update to authenticated
  using (es_organizador(id)) with check (es_organizador(id));

-- miembros: ve quien comparte grupo; un usuario se une a sí mismo; organizador gestiona
create policy miembros_select on miembros for select to authenticated
  using (es_miembro(grupo_id));
create policy miembros_insert_self on miembros for insert to authenticated
  with check (usuario_id = auth.uid());
create policy miembros_manage on miembros for all to authenticated
  using (es_organizador(grupo_id)) with check (es_organizador(grupo_id));

-- partidos: ven los miembros; crean/editan organizadores
create policy partidos_select on partidos for select to authenticated
  using (es_miembro(grupo_id));
create policy partidos_write on partidos for all to authenticated
  using (es_organizador(grupo_id)) with check (es_organizador(grupo_id));

-- cupos: ven los miembros del grupo. Mutación SOLO vía RPC (no policy de update directo).
create policy cupos_select on cupos for select to authenticated
  using (es_miembro(grupo_de_partido(partido_id)));

-- pagos: jugador ve los suyos; organizador ve los del grupo. Mutación vía RPC.
create policy pagos_select on pagos for select to authenticated
  using (
    jugador_id = auth.uid()
    or es_organizador(grupo_de_partido(partido_id))
  );

-- ============================================================
-- 6. RPCs (lógica de negocio, SECURITY DEFINER)
-- ============================================================

-- Crear partido + generar sus N cupos libres (solo organizador)
create or replace function crear_partido(
  p_grupo uuid, p_cancha text, p_fecha timestamptz,
  p_costo integer, p_num_cupos integer, p_deadline timestamptz
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_partido uuid; i integer;
begin
  if not es_organizador(p_grupo) then
    raise exception 'Solo el organizador puede crear partidos';
  end if;
  insert into partidos (grupo_id, cancha, fecha, costo_total, num_cupos, deadline_pago, created_by)
  values (p_grupo, p_cancha, p_fecha, p_costo, p_num_cupos, p_deadline, auth.uid())
  returning id into v_partido;
  for i in 1..p_num_cupos loop
    insert into cupos (partido_id, numero) values (v_partido, i);
  end loop;
  return v_partido;
end;
$$;

-- Tomar un cupo libre → reservado_pendiente + crea pago pendiente
create or replace function tomar_cupo(p_cupo uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_partido uuid; v_grupo uuid; v_cuota integer; v_deadline timestamptz; v_pago uuid;
begin
  select c.partido_id, p.grupo_id, p.cuota, p.deadline_pago
    into v_partido, v_grupo, v_cuota, v_deadline
  from cupos c join partidos p on p.id = c.partido_id
  where c.id = p_cupo and c.estado = 'libre'
  for update;

  if v_partido is null then
    raise exception 'Cupo no disponible';
  end if;
  if not es_miembro(v_grupo) then
    raise exception 'No eres miembro del grupo';
  end if;

  update cupos
    set estado = 'reservado_pendiente', jugador_id = auth.uid(),
        reservado_at = now(),
        -- expira en 2h o en el deadline del partido, lo que ocurra antes
        expira_at = least(now() + interval '2 hours', v_deadline)
  where id = p_cupo;

  insert into pagos (cupo_id, partido_id, jugador_id, monto)
  values (p_cupo, v_partido, auth.uid(), v_cuota)
  returning id into v_pago;

  return v_pago;
end;
$$;

-- Adjuntar comprobante (jugador, sobre su propio pago pendiente)
create or replace function adjuntar_comprobante(p_pago uuid, p_path text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update pagos set comprobante_path = p_path
  where id = p_pago and jugador_id = auth.uid() and estado = 'pendiente';
  if not found then raise exception 'Pago no encontrado o no editable'; end if;
end;
$$;

-- Confirmar pago (organizador) → cupo pagado
create or replace function confirmar_pago(p_pago uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_cupo uuid; v_grupo uuid;
begin
  select pg.cupo_id, grupo_de_partido(pg.partido_id)
    into v_cupo, v_grupo
  from pagos pg where pg.id = p_pago;

  if not es_organizador(v_grupo) then
    raise exception 'Solo el organizador confirma pagos';
  end if;

  update pagos set estado = 'confirmado', confirmado_por = auth.uid(), confirmado_at = now()
  where id = p_pago;
  update cupos set estado = 'pagado' where id = v_cupo;
end;
$$;

-- Liberar cupos vencidos (llamada por Edge Function / cron). Sin auth.uid().
create or replace function liberar_cupos_vencidos()
returns integer language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  with vencidos as (
    update cupos set estado = 'liberado'
    where estado = 'reservado_pendiente' and expira_at < now()
    returning id
  )
  update pagos set estado = 'rechazado'
  where cupo_id in (select id from vencidos) and estado = 'pendiente';
  get diagnostics v_count = row_count;
  -- los cupos liberados se pueden volver a tomar reseteándolos a libre desde la UI/cron
  update cupos set estado = 'libre', jugador_id = null, reservado_at = null, expira_at = null
  where estado = 'liberado';
  return v_count;
end;
$$;

-- ============================================================
-- 7. VISTAS: progreso, ranking, deudores
-- ============================================================

-- Progreso por partido (cupos pagados / total, recaudado)
create view v_progreso_partido with (security_invoker = on) as
select
  p.id as partido_id,
  p.grupo_id,
  p.num_cupos,
  count(*) filter (where c.estado = 'pagado')        as cupos_pagados,
  count(*) filter (where c.estado = 'reservado_pendiente') as cupos_pendientes,
  p.cuota,
  count(*) filter (where c.estado = 'pagado') * p.cuota as recaudado,
  p.costo_total
from partidos p
join cupos c on c.partido_id = p.id
group by p.id;

-- Ranking por jugador y grupo (pagos confirmados, asistencia aproximada)
create view v_ranking with (security_invoker = on) as
select
  m.grupo_id,
  m.usuario_id,
  pr.nombre,
  count(distinct pg.partido_id) filter (where pg.estado = 'confirmado') as partidos_pagados,
  count(distinct pg.id)         filter (where pg.estado = 'confirmado') as pagos_ok,
  count(distinct pg.id)         filter (where pg.estado = 'rechazado')  as pagos_fallidos
from miembros m
join profiles pr on pr.id = m.usuario_id
left join pagos pg on pg.jugador_id = m.usuario_id
  and grupo_de_partido(pg.partido_id) = m.grupo_id
group by m.grupo_id, m.usuario_id, pr.nombre;

-- Deudores: cupos reservados con pago no confirmado pasada la fecha
create view v_deudores with (security_invoker = on) as
select
  p.grupo_id,
  c.jugador_id,
  pr.nombre,
  p.id as partido_id,
  p.fecha,
  p.cuota as monto_adeudado
from cupos c
join partidos p on p.id = c.partido_id
join profiles pr on pr.id = c.jugador_id
join pagos pg on pg.cupo_id = c.id and pg.estado <> 'confirmado'
where c.estado in ('reservado_pendiente', 'liberado');
