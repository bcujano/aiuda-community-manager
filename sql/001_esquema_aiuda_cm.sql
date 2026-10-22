-- 001 · Esquema propio «aiuda_cm» (AiUDA Community Manager).
-- Reemplaza a los antiguos 001–003 (ahora en sql/_reemplazados/). Se pega UNA vez en Supabase → SQL Editor. Es idempotente.
-- Motivo: el proyecto «aiuda-empresas» ya contiene otra app con sus propias tablas en el esquema public
-- (leads, citas, organizaciones...). AiUDA CM vive aparte, en su esquema, para no tocar ni mezclar nada de la otra.
-- Después de pegarlo: Supabase → Project Settings → API (Data API) → «Exposed schemas» → agregar  aiuda_cm

-- ───────── PARTE 0 · Limpieza segura de lo que los scripts anteriores crearon por error en public ─────────
-- Solo borra tablas con NUESTRAS columnas y SIN filas; si alguna tiene datos, se detiene y no borra nada.
do $$
declare t record; v_n bigint;
begin
  if to_regclass('public.organizaciones') is not null then
    execute 'drop policy if exists org_leer on public.organizaciones';     -- políticas nuestras
    execute 'drop policy if exists org_editar on public.organizaciones';   -- sobre la tabla de la otra app
  end if;
  for t in select * from (values
      ('publicaciones','clave_idempotencia'), ('piezas','parametros'), ('conexiones','token_cifrado'),
      ('marcas','brand_kit'), ('auditoria','detalle'), ('miembros','rol')) as x(tabla, marca)
  loop
    if to_regclass('public.' || t.tabla) is null then continue; end if;
    if not exists (select 1 from information_schema.columns
                    where table_schema = 'public' and table_name = t.tabla and column_name = t.marca) then
      raise notice 'public.% NO es nuestra (falta la columna %): no se toca', t.tabla, t.marca;
      continue;
    end if;
    execute format('select count(*) from public.%I', t.tabla) into v_n;
    if v_n > 0 then
      raise exception 'public.% tiene % filas: no se borra nada. Avisa antes de seguir', t.tabla, v_n;
    end if;
    execute format('drop table public.%I cascade', t.tabla);
  end loop;
  drop function if exists public.tomar_publicaciones(int, int);
  drop function if exists public.aprobar_pieza(uuid);
  drop function if exists public.crear_organizacion(text, text, text);
  drop function if exists public.tiene_rol(uuid, text[]);
  drop function if exists public.es_miembro(uuid);
end $$;

-- ───────── PARTE 1 · Esquema y tablas ─────────
create extension if not exists pgcrypto;
create schema if not exists aiuda_cm;
set search_path = aiuda_cm, public;

create table if not exists organizaciones (
  id               uuid primary key default gen_random_uuid(),
  nombre           text not null,
  slug             text not null unique,
  pais             text,
  idioma           text not null default 'es',
  zona_horaria     text not null default 'America/Guayaquil',
  plan             text not null default 'prueba' check (plan in ('prueba','arranque','crecimiento','agencia')),
  condicion_precio text check (condicion_precio is null or condicion_precio in ('fundador')),
  pais_facturacion text,
  kill_switch      boolean not null default false,   -- pausa global de publicar/responder/anuncios
  creada_en        timestamptz not null default now()
);

create table if not exists miembros (
  org_id     uuid not null references organizaciones(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  rol        text not null check (rol in ('owner','editor','aprobador','lector')),
  creado_en  timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index if not exists miembros_user_idx on miembros(user_id);

-- Negocio = marca o proyecto (una agencia o desarrolladora tiene varios dentro de una organización)
create table if not exists marcas (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizaciones(id) on delete cascade,
  nombre      text not null,
  sector      text,
  tipo        text not null default 'negocio' check (tipo in ('negocio','proyecto')),
  perfil      jsonb not null default '{}'::jsonb,
  brand_kit   jsonb not null default '{}'::jsonb,
  aprobaciones jsonb not null default '{"idea":true,"pieza":true,"plan":true,"gasto_ads":true}'::jsonb,
  tope_gasto_diario_usd  numeric(10,2) not null default 0 check (tope_gasto_diario_usd >= 0),
  tope_gasto_mensual_usd numeric(10,2) not null default 0 check (tope_gasto_mensual_usd >= 0),
  creada_en   timestamptz not null default now(),
  unique (id, org_id)
);
create index if not exists marcas_org_idx on marcas(org_id);

-- Conexiones OAuth. El token va CIFRADO por la app (APP_ENCRYPTION_KEY); nunca en claro.
create table if not exists conexiones (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references organizaciones(id) on delete cascade,
  marca_id          uuid not null,
  plataforma        text not null check (plataforma in
                      ('instagram','facebook','tiktok','youtube','meta_ads','tiktok_ads','google_ads','whatsapp')),
  cuenta_externa_id text not null,
  nombre_cuenta     text,
  token_cifrado     text not null,
  vence_en          timestamptz,
  estado            text not null default 'activa' check (estado in ('activa','reconectar','revocada')),
  permisos          text[] not null default '{}',
  creada_en         timestamptz not null default now(),
  unique (marca_id, plataforma, cuenta_externa_id),
  unique (id, org_id),
  foreign key (marca_id, org_id) references marcas(id, org_id) on delete cascade   -- misma organización obligatoria
);
create index if not exists conexiones_org_idx on conexiones(org_id);

-- Auditoría append-only: sin políticas de update ni delete.
create table if not exists auditoria (
  id        bigint generated always as identity primary key,
  org_id    uuid not null references organizaciones(id) on delete cascade,
  actor     text not null,
  accion    text not null,
  detalle   jsonb not null default '{}'::jsonb,
  creado_en timestamptz not null default now()
);
create index if not exists auditoria_org_fecha_idx on auditoria(org_id, creado_en desc);

-- Piezas de contenido
create table if not exists piezas (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizaciones(id) on delete cascade,
  marca_id      uuid not null,
  plan_id       uuid,
  origen        text not null default 'ia' check (origen in ('ia','manual','regla','lanzamiento')),
  tipo          text not null check (tipo in ('post','carrusel','reel','story','video')),
  estado        text not null default 'por_generar' check (estado in
                  ('propuesta','por_generar','generando','por_aprobar','aprobada','cancelada','error_generacion')),
  caption       text,
  media_urls    text[] not null default '{}',
  parametros    jsonb not null default '{}'::jsonb,
  generacion    jsonb not null default '{}'::jsonb,
  costo_usd     numeric(10,4),
  requiere_aprobacion boolean not null default true,
  aprobado_por  uuid references auth.users(id),
  aprobado_en   timestamptz,
  programada_para timestamptz,
  intentos_generacion int not null default 0,
  creada_en     timestamptz not null default now(),
  unique (id, org_id),
  foreign key (marca_id, org_id) references marcas(id, org_id) on delete cascade
);
create index if not exists piezas_org_estado_idx on piezas(org_id, estado);

-- Una fila por plataforma: evita duplicados y permite reintentar solo lo fallido.
create table if not exists publicaciones (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references organizaciones(id) on delete cascade,
  pieza_id           uuid not null,
  conexion_id        uuid not null,
  plataforma         text not null,
  estado             text not null default 'pendiente' check (estado in
                       ('pendiente','publicando','publicada','error','cancelada')),
  programada_para    timestamptz not null,
  clave_idempotencia text not null unique,        -- org_id:pieza_id:plataforma
  creation_id        text,
  bloqueado_hasta    timestamptz,                 -- lease: si vence, otro worker la recupera
  intentos           int not null default 0,
  id_externo         text,
  error              text,
  publicada_en       timestamptz,
  foreign key (pieza_id, org_id)    references piezas(id, org_id)     on delete cascade,
  foreign key (conexion_id, org_id) references conexiones(id, org_id) on delete restrict
);
create index if not exists publicaciones_cola_idx on publicaciones(estado, programada_para);
create index if not exists publicaciones_org_idx on publicaciones(org_id);

-- ───────── PARTE 2 · Funciones ─────────
create or replace function es_miembro(o uuid) returns boolean
language sql stable security definer set search_path = aiuda_cm, public as $$
  select exists (select 1 from miembros where org_id = o and user_id = auth.uid());
$$;

create or replace function tiene_rol(o uuid, roles text[]) returns boolean
language sql stable security definer set search_path = aiuda_cm, public as $$
  select exists (select 1 from miembros where org_id = o and user_id = auth.uid() and rol = any(roles));
$$;

create or replace function crear_organizacion(p_nombre text, p_slug text, p_pais text default null)
returns uuid language plpgsql security definer set search_path = aiuda_cm, public as $$
declare v_id uuid; v_n int;
begin
  if auth.uid() is null then raise exception 'sin sesión'; end if;
  select count(*) into v_n from miembros where user_id = auth.uid() and rol = 'owner';
  if v_n >= 3 then raise exception 'límite de organizaciones por usuario'; end if;
  insert into organizaciones(nombre, slug, pais) values (p_nombre, p_slug, p_pais) returning id into v_id;
  insert into miembros(org_id, user_id, rol) values (v_id, auth.uid(), 'owner');
  insert into auditoria(org_id, actor, accion) values (v_id, auth.uid()::text, 'crear_organizacion');
  return v_id;
end $$;

-- Toma atómica de trabajo (SKIP LOCKED): sin dobles tomas entre workers.
create or replace function tomar_publicaciones(p_limite int, p_lease_seg int default 300)
returns setof publicaciones language plpgsql security definer set search_path = aiuda_cm, public as $$
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

-- Aprobación atómica (compare-and-set): un doble clic no duplica nada.
create or replace function aprobar_pieza(p_pieza uuid) returns boolean
language plpgsql security definer set search_path = aiuda_cm, public as $$
declare v_org uuid; v_n int;
begin
  select org_id into v_org from piezas where id = p_pieza;
  if v_org is null or not tiene_rol(v_org, array['owner','aprobador']) then
    raise exception 'sin permiso';
  end if;
  update piezas set estado = 'aprobada', aprobado_por = auth.uid(), aprobado_en = now()
   where id = p_pieza and estado = 'por_aprobar';
  get diagnostics v_n = row_count;
  if v_n = 1 then
    insert into auditoria(org_id, actor, accion, detalle)
    values (v_org, auth.uid()::text, 'aprobar_pieza', jsonb_build_object('pieza', p_pieza));
  end if;
  return v_n = 1;
end $$;

-- ───────── PARTE 3 · Seguridad por fila ─────────
alter table organizaciones enable row level security;
alter table miembros       enable row level security;
alter table marcas         enable row level security;
alter table conexiones     enable row level security;
alter table auditoria      enable row level security;
alter table piezas         enable row level security;
alter table publicaciones  enable row level security;

drop policy if exists org_leer on organizaciones;
create policy org_leer on organizaciones for select using (es_miembro(id));
drop policy if exists org_editar on organizaciones;
create policy org_editar on organizaciones for update
  using (tiene_rol(id, array['owner'])) with check (tiene_rol(id, array['owner']));

drop policy if exists miembros_leer on miembros;
create policy miembros_leer on miembros for select using (es_miembro(org_id));
drop policy if exists miembros_admin on miembros;
create policy miembros_admin on miembros for all
  using (tiene_rol(org_id, array['owner'])) with check (tiene_rol(org_id, array['owner']));

drop policy if exists marcas_leer on marcas;
create policy marcas_leer on marcas for select using (es_miembro(org_id));
drop policy if exists marcas_escribir on marcas;
create policy marcas_escribir on marcas for all
  using (tiene_rol(org_id, array['owner','editor'])) with check (tiene_rol(org_id, array['owner','editor']));

drop policy if exists conexiones_leer on conexiones;
create policy conexiones_leer on conexiones for select using (tiene_rol(org_id, array['owner','editor']));

drop policy if exists auditoria_leer on auditoria;
create policy auditoria_leer on auditoria for select using (tiene_rol(org_id, array['owner','aprobador']));

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

-- ───────── PARTE 4 · Permisos (la API de Supabase los exige de forma explícita) ─────────
grant usage on schema aiuda_cm to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema aiuda_cm to authenticated;
grant all on all tables in schema aiuda_cm to service_role;
grant usage, select on all sequences in schema aiuda_cm to authenticated, service_role;

-- El token cifrado no se expone a usuarios: solo el servidor (service role) lo lee.
revoke select on conexiones from anon, authenticated;
grant select (id, org_id, marca_id, plataforma, cuenta_externa_id, nombre_cuenta, vence_en, estado, permisos, creada_en)
  on conexiones to authenticated;

revoke all on function tomar_publicaciones(int, int) from public, anon, authenticated;
grant execute on function tomar_publicaciones(int, int) to service_role;
revoke all on function crear_organizacion(text, text, text) from public, anon;
grant execute on function crear_organizacion(text, text, text) to authenticated, service_role;
revoke all on function aprobar_pieza(uuid) from public, anon;
grant execute on function aprobar_pieza(uuid) to authenticated, service_role;
grant execute on function es_miembro(uuid), tiene_rol(uuid, text[]) to authenticated, service_role;

reset search_path;
