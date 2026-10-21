# Eliminación de datos — AiUDA

> BORRADOR. Esta página debe existir pública en `/eliminacion-de-datos` (Meta la exige para dar de alta la app).

## Opción 1 · Desde AiUDA
Configuración → Conexiones → **Desconectar** la cuenta. Se revocan y eliminan los tokens y se detienen publicaciones y respuestas. Configuración → Organización → **Eliminar cuenta y datos**.

## Opción 2 · Desde Instagram / Facebook
Configuración → Seguridad y permisos → Apps y sitios web → quita **AiUDA**. Al hacerlo, Meta nos avisa y eliminamos los datos asociados a esa cuenta.

## Opción 3 · Por correo
Escribe a [correo] desde el correo de tu cuenta, indicando tu usuario. Respondemos en un máximo de [7] días y completamos la eliminación en un máximo de [30] días. Recibirás confirmación.

## Qué se elimina
Tokens, conversaciones, comentarios y métricas almacenados, contenido generado y perfil del negocio. Se conservan solo registros que la ley nos obliga a guardar (p. ej. facturación).

## Endpoint técnico (para Meta)
`POST /api/meta/eliminacion` recibe la solicitud firmada de Meta, borra los datos del usuario y devuelve un código de confirmación y una URL de estado. *(Se implementa en la Fase 1.)*
