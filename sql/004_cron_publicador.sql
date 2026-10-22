-- 004 · Programador del publicador: pg_cron + pg_net llaman cada minuto a /api/cron/publicar.
-- PLANTILLA: antes de pegarla en Supabase → SQL Editor, reemplaza SOLO estos dos textos EN EL EDITOR (no en el repo ni en el chat):
--   __URL_DE_LA_APP__   →  https://TU-DOMINIO  (sin barra final)
--   __CRON_SECRET__     →  el mismo valor de la variable CRON_SECRET de Vercel
-- Antes: Supabase → Database → Extensions → activar «pg_cron» y «pg_net».
-- El secreto queda en Vault (cifrado), nunca en la URL ni en el código.

select vault.create_secret('__CRON_SECRET__', 'cron_secret')
 where not exists (select 1 from vault.secrets where name = 'cron_secret');

select cron.unschedule('aiuda_publicador') where exists (select 1 from cron.job where jobname = 'aiuda_publicador');
select cron.schedule('aiuda_publicador', '* * * * *', $job$
  select net.http_post(
    url     := '__URL_DE_LA_APP__/api/cron/publicar',
    headers := jsonb_build_object('Content-Type', 'application/json',
               'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')),
    body    := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
$job$);
