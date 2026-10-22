set search_path = aiuda_cm, public;
-- Datos base como superusuario
insert into auth.users(id,email) values
 ('a0000000-0000-0000-0000-00000000000a','dueno_a@x'),('b0000000-0000-0000-0000-00000000000b','dueno_b@x'),
 ('c0000000-0000-0000-0000-00000000000c','lector_a@x'),('d0000000-0000-0000-0000-00000000000d','editor_a@x');
insert into organizaciones(id,nombre,slug) values ('aaaaaaaa-0000-0000-0000-000000000001','A','a'),('bbbbbbbb-0000-0000-0000-000000000002','B','b');
insert into miembros(org_id,user_id,rol) values
 ('aaaaaaaa-0000-0000-0000-000000000001','a0000000-0000-0000-0000-00000000000a','owner'),
 ('aaaaaaaa-0000-0000-0000-000000000001','c0000000-0000-0000-0000-00000000000c','lector'),
 ('aaaaaaaa-0000-0000-0000-000000000001','d0000000-0000-0000-0000-00000000000d','editor'),
 ('bbbbbbbb-0000-0000-0000-000000000002','b0000000-0000-0000-0000-00000000000b','owner');
insert into marcas(id,org_id,nombre) values ('a1111111-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Marca A'),
 ('b1111111-0000-0000-0000-000000000002','bbbbbbbb-0000-0000-0000-000000000002','Marca B');
insert into piezas(id,org_id,marca_id,tipo,estado) values ('a2222222-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','a1111111-0000-0000-0000-000000000001','post','por_aprobar'),
 ('b2222222-0000-0000-0000-000000000002','bbbbbbbb-0000-0000-0000-000000000002','b1111111-0000-0000-0000-000000000002','post','por_aprobar');
insert into conexiones(org_id,marca_id,plataforma,cuenta_externa_id,token_cifrado) values ('aaaaaaaa-0000-0000-0000-000000000001','a1111111-0000-0000-0000-000000000001','instagram','ig1','SECRETO');
insert into ia_llamadas(org_id,tarea,proveedor,modelo,estado,costo_usd) values ('aaaaaaaa-0000-0000-0000-000000000001','plan_mes','openai','m','ok',1.5);
insert into planes_mes(id,org_id,marca_id,mes,estado) values ('a3333333-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','a1111111-0000-0000-0000-000000000001','2026-11-01','por_aprobar');

create or replace function pg_temp.como(u text) returns void language plpgsql as $$
begin perform set_config('request.jwt.claim.sub', u, false); execute 'set role authenticated'; end $$;

-- Cada ataque debe NO ver / fallar. `falla(sql)` exige un error; `cuenta(sql)` devuelve filas visibles.
create or replace function pg_temp.falla(q text, nombre text) returns void language plpgsql as $$
declare r int;
begin
  begin
    execute q; get diagnostics r = row_count;
    if r > 0 then raise exception 'ATAQUE EXITOSO: % (% filas)', nombre, r; end if;   -- RLS filtra update/delete sin error
  exception when others then
    if sqlerrm like 'ATAQUE EXITOSO%' then raise; end if;
  end;
end $$;
create or replace function pg_temp.cuenta(q text) returns int language plpgsql as $$
declare n int; begin execute 'select count(*) from (' || q || ') x' into n; return n; end $$;

\set A '\'a0000000-0000-0000-0000-00000000000a\''
\set B '\'b0000000-0000-0000-0000-00000000000b\''
\set L '\'c0000000-0000-0000-0000-00000000000c\''
\set E '\'d0000000-0000-0000-0000-00000000000d\''

-- 1) El dueño de B no ve nada de A
select pg_temp.como(:B);
do $$ begin
  assert pg_temp.cuenta('select 1 from marcas where nombre=''Marca A''') = 0, 'B ve marcas de A';
  assert pg_temp.cuenta('select 1 from piezas where marca_id=''a1111111-0000-0000-0000-000000000001''') = 0, 'B ve piezas de A';
  assert pg_temp.cuenta('select 1 from planes_mes') = 0, 'B ve planes de A';
  assert pg_temp.cuenta('select 1 from ia_llamadas') = 0, 'B ve ledger de A';
  assert pg_temp.cuenta('select 1 from conexiones') = 0, 'B ve conexiones de A';
  assert pg_temp.cuenta('select 1 from organizaciones') = 1, 'B debe ver solo su organización';
  assert pg_temp.cuenta('select 1 from miembros') = 1, 'B ve miembros ajenos';
  assert pg_temp.cuenta('select 1 from auditoria') = 0, 'B ve auditoría de A';
end $$;
reset role;

-- 2) B no puede escribir en A
select pg_temp.como(:B);
do $$ begin
  perform pg_temp.falla('update piezas set caption=''hack'' where marca_id=''a1111111-0000-0000-0000-000000000001''', 'B edita pieza de A');
  perform pg_temp.falla('delete from marcas where nombre=''Marca A''', 'B borra marca de A');
  perform pg_temp.falla('insert into piezas(org_id,marca_id,tipo) values (''aaaaaaaa-0000-0000-0000-000000000001'',''a1111111-0000-0000-0000-000000000001'',''post'')', 'B inserta pieza en A');
  perform pg_temp.falla('insert into miembros(org_id,user_id,rol) values (''aaaaaaaa-0000-0000-0000-000000000001'',''b0000000-0000-0000-0000-00000000000b'',''owner'')', 'B se autoasigna owner en A');
  perform pg_temp.falla('update organizaciones set kill_switch=true where slug=''a''', 'B toca la organización A');
end $$;
reset role;

-- 3) Referencias cruzadas: una pieza de B no puede colgar de una marca de A
select pg_temp.como(:B);
do $$ begin
  begin
    insert into piezas(org_id,marca_id,tipo) values ('bbbbbbbb-0000-0000-0000-000000000002','a1111111-0000-0000-0000-000000000001','post');
    raise exception 'ATAQUE EXITOSO: pieza de B con marca de A';
  exception when foreign_key_violation then null; end;
end $$;
reset role;

-- 4) Roles dentro de A
select pg_temp.como(:L);
do $$ begin
  assert pg_temp.cuenta('select 1 from piezas') = 1, 'lector debe leer piezas';
  perform pg_temp.falla('update piezas set caption=''x''', 'lector edita pieza');
  perform pg_temp.falla('insert into marcas(org_id,nombre) values (''aaaaaaaa-0000-0000-0000-000000000001'',''Z'')', 'lector crea marca');
  assert pg_temp.cuenta('select 1 from conexiones') = 0, 'lector ve conexiones';
  assert pg_temp.cuenta('select 1 from ia_llamadas') = 0, 'lector ve ledger';
end $$;
reset role;

select pg_temp.como(:E);
do $$ begin
  update piezas set caption='borrador' where marca_id='a1111111-0000-0000-0000-000000000001';
  assert (select caption from piezas where id='a2222222-0000-0000-0000-000000000001') = 'borrador', 'editor debe poder editar';
  begin perform aprobar_pieza('a2222222-0000-0000-0000-000000000001'); raise exception 'ATAQUE EXITOSO: editor aprueba pieza';
  exception when others then if sqlerrm like 'ATAQUE%' then raise; end if; end;
  begin perform aprobar_plan('a3333333-0000-0000-0000-000000000001'); raise exception 'ATAQUE EXITOSO: editor aprueba plan';
  exception when others then if sqlerrm like 'ATAQUE%' then raise; end if; end;
  begin insert into publicaciones(org_id,pieza_id,conexion_id,plataforma,programada_para,clave_idempotencia)
    values ('aaaaaaaa-0000-0000-0000-000000000001','a2222222-0000-0000-0000-000000000001',gen_random_uuid(),'instagram',now(),'k');
    raise exception 'ATAQUE EXITOSO: editor escribe publicaciones';
  exception when others then if sqlerrm like 'ATAQUE%' then raise; end if; end;
end $$;
reset role;

-- 5) B no aprueba lo de A; el owner de A aprueba una sola vez
select pg_temp.como(:B);
do $$ begin
  begin perform aprobar_pieza('a2222222-0000-0000-0000-000000000001'); raise exception 'ATAQUE EXITOSO: B aprueba pieza de A';
  exception when others then if sqlerrm like 'ATAQUE%' then raise; end if; end;
end $$;
reset role;
select pg_temp.como(:A);
do $$ begin
  assert aprobar_pieza('a2222222-0000-0000-0000-000000000001') = true, 'owner aprueba';
  assert aprobar_pieza('a2222222-0000-0000-0000-000000000001') = false, 'doble clic no repite';
  assert aprobar_plan('a3333333-0000-0000-0000-000000000001') = true, 'owner aprueba plan';
  assert aprobar_plan('a3333333-0000-0000-0000-000000000001') = false, 'doble clic plan';
  assert (select count(*) from auditoria where accion in ('aprobar_pieza','aprobar_plan')) = 2, 'auditoría una vez por aprobación';
  begin perform token_cifrado from conexiones; raise exception 'ATAQUE EXITOSO: lee token cifrado';
  exception when insufficient_privilege then null; end;
  perform pg_temp.falla('delete from auditoria', 'borra auditoría');
  perform pg_temp.falla('update auditoria set accion=''x''', 'edita auditoría');
  begin insert into ia_llamadas(org_id,tarea,proveedor,modelo,estado) values ('aaaaaaaa-0000-0000-0000-000000000001','t','openai','m','ok'); raise exception 'ATAQUE EXITOSO: usuario escribe ledger';
  exception when others then if sqlerrm like 'ATAQUE%' then raise; end if; end;
  begin perform gasto_ia_mes(null); raise exception 'ATAQUE EXITOSO: usuario llama gasto_ia_mes';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- 6) Cola: dos tomas seguidas no entregan la misma publicación; el kill switch la detiene
insert into conexiones(id,org_id,marca_id,plataforma,cuenta_externa_id,token_cifrado) values ('c4444444-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','a1111111-0000-0000-0000-000000000001','facebook','fb1','x');
insert into publicaciones(org_id,pieza_id,conexion_id,plataforma,programada_para,clave_idempotencia)
 values ('aaaaaaaa-0000-0000-0000-000000000001','a2222222-0000-0000-0000-000000000001','c4444444-0000-0000-0000-000000000001','facebook',now()-interval '1 min','k1');
do $$ begin
  assert (select count(*) from tomar_publicaciones(5)) = 1, 'primera toma';
  assert (select count(*) from tomar_publicaciones(5)) = 0, 'segunda toma no duplica';
  update organizaciones set kill_switch = true where slug='a';
  update publicaciones set bloqueado_hasta = now() - interval '1 min';
  assert (select count(*) from tomar_publicaciones(5)) = 0, 'kill_switch detiene la cola';
end $$;
