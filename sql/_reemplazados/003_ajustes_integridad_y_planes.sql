-- 003 · Ajustes de la prueba ácida (2026-10-22). Byron lo pega después de 001 y 002. Es idempotente.
-- 1) Integridad entre organizaciones: una pieza/conexión/publicación NO puede apuntar a una marca,
--    pieza o conexión de OTRA organización (antes bastaba con que el id existiera).
-- 2) 'youtube' como plataforma (faltaba) y nombres de planes reales de AiUDA.
-- 3) «Negocio» puede ser marca o proyecto (desarrolladoras); condición de precio (fundador).

-- Claves únicas compuestas para poder referenciar (id, org_id). Idempotente: no se borran si ya existen.
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'marcas_id_org_uk') then
    alter table marcas add constraint marcas_id_org_uk unique (id, org_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'conexiones_id_org_uk') then
    alter table conexiones add constraint conexiones_id_org_uk unique (id, org_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'piezas_id_org_uk') then
    alter table piezas add constraint piezas_id_org_uk unique (id, org_id);
  end if;
end $$;

-- Claves foráneas compuestas (misma organización obligatoria)
alter table conexiones   drop constraint if exists conexiones_marca_id_fkey;
alter table conexiones   drop constraint if exists conexiones_marca_org_fk;
alter table conexiones   add  constraint conexiones_marca_org_fk
  foreign key (marca_id, org_id) references marcas(id, org_id) on delete cascade;

alter table piezas       drop constraint if exists piezas_marca_id_fkey;
alter table piezas       drop constraint if exists piezas_marca_org_fk;
alter table piezas       add  constraint piezas_marca_org_fk
  foreign key (marca_id, org_id) references marcas(id, org_id) on delete cascade;

alter table publicaciones drop constraint if exists publicaciones_pieza_id_fkey;
alter table publicaciones drop constraint if exists publicaciones_pieza_org_fk;
alter table publicaciones add  constraint publicaciones_pieza_org_fk
  foreign key (pieza_id, org_id) references piezas(id, org_id) on delete cascade;

alter table publicaciones drop constraint if exists publicaciones_conexion_id_fkey;
alter table publicaciones drop constraint if exists publicaciones_conexion_org_fk;
alter table publicaciones add  constraint publicaciones_conexion_org_fk
  foreign key (conexion_id, org_id) references conexiones(id, org_id) on delete restrict;

-- Plataformas: solo las decididas (IG, FB, TikTok, YouTube y sus anuncios)
alter table conexiones drop constraint if exists conexiones_plataforma_check;
alter table conexiones add  constraint conexiones_plataforma_check check (plataforma in
  ('instagram','facebook','tiktok','youtube','meta_ads','tiktok_ads','google_ads','whatsapp'));

-- Planes reales + condición de precio
alter table organizaciones drop constraint if exists organizaciones_plan_check;
alter table organizaciones add  constraint organizaciones_plan_check check (plan in
  ('prueba','arranque','crecimiento','agencia'));
alter table organizaciones add column if not exists condicion_precio text
  check (condicion_precio is null or condicion_precio in ('fundador'));
alter table organizaciones add column if not exists pais_facturacion text;

-- Negocio = marca o proyecto
alter table marcas add column if not exists tipo text not null default 'negocio'
  check (tipo in ('negocio','proyecto'));

-- Límite de organizaciones por usuario (evita abuso de crear_organizacion)
create or replace function crear_organizacion(p_nombre text, p_slug text, p_pais text default null)
returns uuid language plpgsql security definer set search_path = public as $$
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
