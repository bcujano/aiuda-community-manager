-- 001 · Núcleo multicliente: organizaciones, miembros, marcas, conexiones, auditoría.
-- Byron pega este archivo en el SQL Editor de Supabase. No se ejecuta solo.
-- Toda tabla lleva org_id y RLS. Nada de Storage/binarios aquí (plan gratuito).

create extension if not exists pgcrypto;

create table if not exists organizaciones (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  slug          text not null unique,
  pais          text,
  idioma        text not null default 'es',
  zona_horaria  text not null default 'America/Guayaquil',
  plan          text not null default 'prueba'
                check (plan in ('prueba','starter','pro','agency')),
  kill_switch   boolean not null default false,   -- pausa global de publicar/responder/anuncios
  creada_en     timestamptz not null default now()
);

create table if not exists miembros (
  org_id     uuid not null references organizaciones(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  rol        text not null check (rol in ('owner','editor','aprobador','lector')),
  creado_en  timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index if not exists miembros_user_idx on miembros(user_id);

-- Marca = un negocio atendido (una agencia tiene varias dentro de una organización).
create table if not exists marcas (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizaciones(id) on delete cascade,
  nombre      text not null,
  sector      text,
  perfil      jsonb not null default '{}'::jsonb,   -- ficha del negocio (onboarding-diagnostico.md)
  brand_kit   jsonb not null default '{}'::jsonb,   -- logo, colores, tono, frases prohibidas
  aprobaciones jsonb not null default '{"idea":true,"pieza":true,"plan":true,"gasto_ads":true}'::jsonb,
  tope_gasto_diario_usd numeric(10,2) not null default 0 check (tope_gasto_diario_usd >= 0),
  tope_gasto_mensual_usd numeric(10,2) not null default 0 check (tope_gasto_mensual_usd >= 0),
  creada_en   timestamptz not null default now()
);
create index if not exists marcas_org_idx on marcas(org_id);

-- Conexiones OAuth. El token va CIFRADO por la app (APP_ENCRYPTION_KEY); nunca en claro.
create table if not exists conexiones (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references organizaciones(id) on delete cascade,
  marca_id         uuid not null references marcas(id) on delete cascade,
  plataforma       text not null check (plataforma in
                     ('instagram','facebook','tiktok','google_ads','google_business','whatsapp','linkedin','meta_ads','tiktok_ads')),
  cuenta_externa_id text not null,
  nombre_cuenta    text,
  token_cifrado    text not null,
  vence_en         timestamptz,
  estado           text not null default 'activa' check (estado in ('activa','reconectar','revocada')),
  permisos         text[] not null default '{}',
  creada_en        timestamptz not null default now(),
  unique (marca_id, plataforma, cuenta_externa_id)
);
create index if not exists conexiones_org_idx on conexiones(org_id);

-- Auditoría append-only: sin políticas de update ni delete.
create table if not exists auditoria (
  id        bigint generated always as identity primary key,
  org_id    uuid not null references organizaciones(id) on delete cascade,
  actor     text not null,                 -- user_id, 'agente:<nombre>' o 'sistema'
  accion    text not null,
  detalle   jsonb not null default '{}'::jsonb,
  creado_en timestamptz not null default now()
);
create index if not exists auditoria_org_fecha_idx on auditoria(org_id, creado_en desc);

-- Ayudas de RLS (security definer para no recursar sobre miembros).
create or replace function es_miembro(o uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from miembros where org_id = o and user_id = auth.uid());
$$;

create or replace function tiene_rol(o uuid, roles text[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from miembros where org_id = o and user_id = auth.uid() and rol = any(roles));
$$;

-- Alta de organización: crea la org y deja al usuario como owner (única vía de insertar).
create or replace function crear_organizacion(p_nombre text, p_slug text, p_pais text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'sin sesión'; end if;
  insert into organizaciones(nombre, slug, pais) values (p_nombre, p_slug, p_pais) returning id into v_id;
  insert into miembros(org_id, user_id, rol) values (v_id, auth.uid(), 'owner');
  insert into auditoria(org_id, actor, accion) values (v_id, auth.uid()::text, 'crear_organizacion');
  return v_id;
end $$;

alter table organizaciones enable row level security;
alter table miembros       enable row level security;
alter table marcas         enable row level security;
alter table conexiones     enable row level security;
alter table auditoria      enable row level security;

drop policy if exists org_leer on organizaciones;
create policy org_leer on organizaciones for select using (es_miembro(id));
drop policy if exists org_editar on organizaciones;
create policy org_editar on organizaciones for update using (tiene_rol(id, array['owner'])) with check (tiene_rol(id, array['owner']));

drop policy if exists miembros_leer on miembros;
create policy miembros_leer on miembros for select using (es_miembro(org_id));
drop policy if exists miembros_admin on miembros;
create policy miembros_admin on miembros for all using (tiene_rol(org_id, array['owner'])) with check (tiene_rol(org_id, array['owner']));

drop policy if exists marcas_leer on marcas;
create policy marcas_leer on marcas for select using (es_miembro(org_id));
drop policy if exists marcas_escribir on marcas;
create policy marcas_escribir on marcas for all
  using (tiene_rol(org_id, array['owner','editor'])) with check (tiene_rol(org_id, array['owner','editor']));

-- Los tokens solo los toca el servidor (service role). Aquí solo se ve que existe la conexión.
drop policy if exists conexiones_leer on conexiones;
create policy conexiones_leer on conexiones for select using (tiene_rol(org_id, array['owner','editor']));

drop policy if exists auditoria_leer on auditoria;
create policy auditoria_leer on auditoria for select using (tiene_rol(org_id, array['owner','aprobador']));

-- El token cifrado no se expone ni a usuarios autenticados: solo el servidor (service role) lo lee.
revoke select on conexiones from anon, authenticated;
grant select (id, org_id, marca_id, plataforma, cuenta_externa_id, nombre_cuenta, vence_en, estado, permisos, creada_en)
  on conexiones to authenticated;
