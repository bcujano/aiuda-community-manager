# Aprendizajes de construcción (se actualiza al descubrir algo)

Cada entrada: qué pasó → qué se hizo → dónde está. Probado = comprobado ejecutando; sin probar = escrito pero no ejecutado contra el servicio real.

## Motor vectorial (imágenes de piezas)
- **opentype.js falla con Inter** al usar `getPath`/`getAdvanceWidth` con texto: lanza «substitutionType 62 … substFormat 2 is not yet supported» (tabla GSUB). **Solución (probada):** componer glifo a glifo con `charToGlyph` + `getKerningValue` y no usar la sustitución de la fuente. Código: `src/lib/vectorial/render.ts`.
- La fuente (Inter, OFL) se lee de `node_modules/@fontsource/inter/files/*.woff`; en producción hay que declararla en `outputFileTracingIncludes` de `next.config.ts` o la función no la encuentra (**sin probar en Vercel**).
- Texto convertido a trazados: el resultado no depende de fuentes del servidor. Acentos y ñ verificados visualmente.

## Pruebas de seguridad por fila
- Corren en un Postgres local desechable con `auth.uid()` simulado (`pruebas-sql/`); **nunca contra Supabase real**. Verificadas rompiendo una política a propósito: la suite falla como debe.
- En el servidor de GitHub el usuario no es root: `initdb -U postgres` es obligatorio (sin eso, «role postgres does not exist»).
- Las plantillas que usan `pg_cron`/`vault` (`sql/004`) no pueden correr en Postgres común: se omiten por la marca `__CRON_SECRET__`.

## Publicación en Instagram (idempotencia)
- Se escribe `fase='publish_enviado'` **antes** de llamar a `media_publish`. Si el proceso muere después, la recuperación no repite (podría duplicar) y deja `error` para verificar a mano. Si murió antes (`contenedor_creado`), se reanuda con el `creation_id` sin recrear el contenedor. Probado con base simulada en `src/lib/publicador.test.ts`; **sin probar contra Instagram real**.
- POST sin reintento; GET con 3 intentos y espera creciente (`src/lib/instagram.ts`).

## Horas y zonas
- `<input type="datetime-local">` entrega hora sin zona: se interpreta en la zona de la organización (`organizaciones.zona_horaria`) con `src/lib/zona.ts` (probado, incluye horario de verano de Madrid).

## Entorno de la sesión de construcción
- El Git de la sesión no puede subir **etiquetas** (el proxy corta la conexión); las ramas sí. Las etiquetas hay que subirlas desde otro equipo.
- No hay claves de IA ni de Supabase en el entorno de la sesión: todo lo que las requiere queda «sin probar» hasta que Byron lo pruebe en producción.
