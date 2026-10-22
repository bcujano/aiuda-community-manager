-- 002 · Ledger de IA y plan del mes (esquema aiuda_cm). Byron lo pega en Supabase → SQL Editor. Idempotente.
set search_path = aiuda_cm, public;

-- Ledger: una fila por llamada a un modelo. Solo escribe el servidor (service role); los miembros leen el de su organización.
create table if not exists ia_llamadas (
  id          bigint generated always as identity primary key,
  org_id      uuid not null references organizaciones(id) on delete cascade,
  marca_id    uuid,
  pieza_id    uuid,
  tarea       text not null,
  proveedor   text not null check (proveedor in ('anthropic','openai','gemini')),
  modelo      text not null,
  tokens_in   int not null default 0,
  tokens_out  int not null default 0,
  costo_usd   numeric(12,6) not null default 0,
  latencia_ms int not null default 0,
  estado      text not null check (estado in ('ok','error','invalida')),
  fallback_de text check (fallback_de is null or fallback_de in ('anthropic','openai','gemini')),
  error_codigo text,
  creado_en   timestamptz not null default now(),
  foreign key (marca_id, org_id) references marcas(id, org_id) on delete cascade,
  foreign key (pieza_id, org_id) references piezas(id, org_id) on delete cascade
);
create index if not exists ia_llamadas_org_fecha_idx on ia_llamadas(org_id, creado_en desc);
create index if not exists ia_llamadas_fecha_idx on ia_llamadas(creado_en);

-- Gasto del mes en curso (UTC). org nula = global (tope de US$50/mes de todo el sistema).
create or replace function gasto_ia_mes(p_org uuid default null) returns numeric
language sql stable security definer set search_path = aiuda_cm, public as $$
  select coalesce(sum(costo_usd), 0) from ia_llamadas
   where creado_en >= date_trunc('month', now()) and (p_org is null or org_id = p_org);
$$;
revoke all on function gasto_ia_mes(uuid) from public, anon, authenticated;
grant execute on function gasto_ia_mes(uuid) to service_role;

-- Plan del mes: estados con salida (nada queda atascado en «generando»).
create table if not exists planes_mes (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizaciones(id) on delete cascade,
  marca_id   uuid not null,
  mes        date not null,                       -- primer día del mes
  estado     text not null default 'generando' check (estado in ('generando','por_aprobar','aprobado','descartado','error')),
  contenido  jsonb not null default '{}'::jsonb,
  error      text,
  aprobado_por uuid references auth.users(id),
  aprobado_en  timestamptz,
  creado_en  timestamptz not null default now(),
  unique (id, org_id),
  foreign key (marca_id, org_id) references marcas(id, org_id) on delete cascade
);
create index if not exists planes_mes_org_idx on planes_mes(org_id, mes);

alter table ia_llamadas enable row level security;
alter table planes_mes  enable row level security;

drop policy if exists ia_llamadas_leer on ia_llamadas;
create policy ia_llamadas_leer on ia_llamadas for select using (tiene_rol(org_id, array['owner','aprobador']));
drop policy if exists planes_leer on planes_mes;
create policy planes_leer on planes_mes for select using (es_miembro(org_id));
drop policy if exists planes_escribir on planes_mes;
create policy planes_escribir on planes_mes for all
  using (tiene_rol(org_id, array['owner','editor'])) with check (tiene_rol(org_id, array['owner','editor']));

-- piezas.plan_id debía apuntar a un plan de la misma organización.
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'piezas_plan_fk') then
    alter table piezas add constraint piezas_plan_fk foreign key (plan_id, org_id) references planes_mes(id, org_id) on delete set null (plan_id);
  end if;
end $$;

-- Aprobar plan: atómico (compare-and-set). Un doble clic no repite nada.
create or replace function aprobar_plan(p_plan uuid) returns boolean
language plpgsql security definer set search_path = aiuda_cm, public as $$
declare v_org uuid; v_n int;
begin
  select org_id into v_org from planes_mes where id = p_plan;
  if v_org is null or not tiene_rol(v_org, array['owner','aprobador']) then raise exception 'sin permiso'; end if;
  update planes_mes set estado = 'aprobado', aprobado_por = auth.uid(), aprobado_en = now()
   where id = p_plan and estado = 'por_aprobar';
  get diagnostics v_n = row_count;
  if v_n = 1 then
    insert into auditoria(org_id, actor, accion, detalle) values (v_org, auth.uid()::text, 'aprobar_plan', jsonb_build_object('plan', p_plan));
  end if;
  return v_n = 1;
end $$;
revoke all on function aprobar_plan(uuid) from public, anon;
grant execute on function aprobar_plan(uuid) to authenticated, service_role;

grant select, insert, update, delete on ia_llamadas, planes_mes to authenticated;
grant all on ia_llamadas, planes_mes to service_role;
grant usage, select on all sequences in schema aiuda_cm to authenticated, service_role;
reset search_path;
