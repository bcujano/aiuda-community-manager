-- 002 · Cola de publicaciones (reemplaza la cola única de crm-321 corrigiendo su auditoría §11).
-- Mejoras: org_id + RLS, CHECK de estados, una fila por plataforma con clave de idempotencia,
-- lease para recuperar piezas colgadas, y aprobación atómica.

create table if not exists piezas (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizaciones(id) on delete cascade,
  marca_id      uuid not null references marcas(id) on delete cascade,
  plan_id       uuid,
  origen        text not null default 'ia' check (origen in ('ia','manual','regla','lanzamiento')),
  tipo          text not null check (tipo in ('post','carrusel','reel','story','video')),
  estado        text not null default 'por_generar' check (estado in
                  ('propuesta','por_generar','generando','por_aprobar','aprobada','cancelada','error_generacion')),
  caption       text,
  media_urls    text[] not null default '{}',     -- URLs en Storage (con límites y limpieza)
  parametros    jsonb not null default '{}'::jsonb,
  generacion    jsonb not null default '{}'::jsonb, -- modelos, costo real por pieza (para margen)
  costo_usd     numeric(10,4),
  requiere_aprobacion boolean not null default true,
  aprobado_por  uuid references auth.users(id),
  aprobado_en   timestamptz,
  programada_para timestamptz,
  intentos_generacion int not null default 0,
  creada_en     timestamptz not null default now()
);
create index if not exists piezas_org_estado_idx on piezas(org_id, estado);

-- Una fila por plataforma: evita duplicados IG+FB y permite reintentar solo lo fallido.
create table if not exists publicaciones (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references organizaciones(id) on delete cascade,
  pieza_id          uuid not null references piezas(id) on delete cascade,
  conexion_id       uuid not null references conexiones(id) on delete restrict,
  plataforma        text not null,
  estado            text not null default 'pendiente' check (estado in
                      ('pendiente','publicando','publicada','error','cancelada')),
  programada_para   timestamptz not null,
  clave_idempotencia text not null unique,        -- org_id:pieza_id:plataforma
  creation_id       text,                         -- id del contenedor (Meta) para reanudar sin recrear
  bloqueado_hasta   timestamptz,                  -- lease: si vence, otro worker la recupera
  intentos          int not null default 0,
  id_externo        text,
  error             text,
  publicada_en      timestamptz
);
create index if not exists publicaciones_cola_idx on publicaciones(estado, programada_para);
create index if not exists publicaciones_org_idx on publicaciones(org_id);

-- Toma atómica de trabajo (SKIP LOCKED): sin dobles tomas entre workers.
create or replace function tomar_publicaciones(p_limite int, p_lease_seg int default 300)
returns setof publicaciones language plpgsql security definer set search_path = public as $$
begin
  return query
  with candidatas as (
    select p.id from publicaciones p
    join organizaciones o on o.id = p.org_id and o.kill_switch = false
    where p.programada_para <= now()
      and (p.estado = 'pendiente' or (p.estado = 'publicando' and p.bloqueado_hasta < now()))
      and p.intentos < 3
    order by p.programada_para
    limit p_limite
    for update of p skip locked
  )
  update publicaciones p
     set estado = 'publicando',
         bloqueado_hasta = now() + make_interval(secs => p_lease_seg),
         intentos = p.intentos + 1
    from candidatas c where p.id = c.id
  returning p.*;
end $$;
revoke all on function tomar_publicaciones(int,int) from public, anon, authenticated;

-- Aprobación atómica (compare-and-set): un doble clic no duplica nada.
create or replace function aprobar_pieza(p_pieza uuid) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_org uuid; v_n int;
begin
  select org_id into v_org from piezas where id = p_pieza;
  if v_org is null or not tiene_rol(v_org, array['owner','aprobador']) then
    raise exception 'sin permiso';
  end if;
  update piezas set estado='aprobada', aprobado_por=auth.uid(), aprobado_en=now()
   where id = p_pieza and estado = 'por_aprobar';
  get diagnostics v_n = row_count;
  if v_n = 1 then
    insert into auditoria(org_id, actor, accion, detalle)
    values (v_org, auth.uid()::text, 'aprobar_pieza', jsonb_build_object('pieza', p_pieza));
  end if;
  return v_n = 1;
end $$;

alter table piezas        enable row level security;
alter table publicaciones enable row level security;

drop policy if exists piezas_leer on piezas;
create policy piezas_leer on piezas for select using (es_miembro(org_id));
drop policy if exists piezas_escribir on piezas;
create policy piezas_escribir on piezas for insert with check (tiene_rol(org_id, array['owner','editor']));
drop policy if exists piezas_editar on piezas;
create policy piezas_editar on piezas for update
  using (tiene_rol(org_id, array['owner','editor'])) with check (tiene_rol(org_id, array['owner','editor']));
drop policy if exists publicaciones_leer on publicaciones;
create policy publicaciones_leer on publicaciones for select using (es_miembro(org_id));
-- Escritura de publicaciones: solo servidor (service role).
