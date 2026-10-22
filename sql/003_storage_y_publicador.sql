-- 003 · Bucket de imágenes de piezas. Byron lo pega en Supabase → SQL Editor. Idempotente. No toca el esquema public.
-- Público de lectura porque Instagram/Facebook descargan la imagen por URL HTTPS pública (docs/knowledge). Rutas con uuid: no se pueden adivinar.
-- Solo el servidor (service role) escribe. Límite de 5 MB por archivo y solo PNG/JPEG para cuidar el plan gratuito.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('piezas', 'piezas', true, 5242880, array['image/png','image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/png','image/jpeg'];

-- Marca de seguridad del publicador: se escribe ANTES de llamar a media_publish. Si el proceso muere después de enviarla,
-- la recuperación no repite la publicación (podría duplicarse): queda en error para verificar a mano.
set search_path = aiuda_cm, public;
alter table publicaciones add column if not exists fase text check (fase is null or fase in ('contenedor_creado','publish_enviado'));
reset search_path;
