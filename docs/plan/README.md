# Planificación AiUDA — índice

> Modo actual: **solo planificación**. La construcción la hará otra sesión que arranca cuando este paquete esté completo y exacto.
> Lo que ya está en el repo (login, empresa, negocio, ficha, conexión de Instagram, SQL en el esquema `aiuda_cm`) es la base de esa construcción, no el producto.

| # | Documento | Contenido |
|---|---|---|
| 01 | [`01-inventario-reuso.md`](01-inventario-reuso.md) | Qué existe en crm-321 y postpro-321, archivo por archivo, y qué se hace con cada uno |
| 02 | [`02-competencia-saleads.md`](02-competencia-saleads.md) | Análisis de SaleADS.ai y qué implica para AiUDA |
| 03 | [`03-motor-ia.md`](03-motor-ia.md) | Cadena Anthropic → OpenAI → Gemini, ledger de costos, evaluación |
| 04 | [`04-diseno.md`](04-diseno.md) | Cómo entra `design.md` sin limitar la funcionalidad y qué falta recibir |
| 05 | [`05-backlog-construccion.md`](05-backlog-construccion.md) | Épicas con alcance, orígenes a portar, tablas, criterios de aceptación y orden |
| 06 | [`06-decisiones-y-riesgos.md`](06-decisiones-y-riesgos.md) | Decisiones cerradas, abiertas y riesgos que bloquean o encarecen |
| 07 | [`07-superar-saleads.md`](07-superar-saleads.md) | Cada promesa de SaleADS → qué cumplimos → cómo la superamos; promesas públicas de AiUDA |
| 08 | [`08-redes-y-fuentes.md`](08-redes-y-fuentes.md) | Instagram, Facebook, TikTok y YouTube con sus anuncios, Ad Library: acceso real, modo directo/asistido |
| 09 | [`09-gratis-hasta-5-clientes.md`](09-gratis-hasta-5-clientes.md) | Plan de costo cero hasta lanzar y llegar a 5 clientes; gatillos de pago |
| 11 | [`11-precios-y-comercializacion.md`](11-precios-y-comercializacion.md) | Escalera de precios (aprobada), programa fundador, cobro por transferencia o link, métodos de venta |
| 12 | [`12-psicologia-de-ventas-y-regalo-de-valor.md`](12-psicologia-de-ventas-y-regalo-de-valor.md) | Psicología de ventas con evidencia, ética, y el «Regalo de valor» |
| 14 | [`14-prueba-acida.md`](14-prueba-acida.md) | Prueba ácida: 14 hallazgos, correcciones y veredicto |
| 13 | [`13-handoff-construccion.md`](13-handoff-construccion.md) | **Paquete final para la sesión de construcción** |
| 10 | [`10-mejoras-sobre-lo-existente.md`](10-mejoras-sobre-lo-existente.md) | Qué se mejora de cada módulo que se lleva; biblioteca de skills |

## Reglas de esta planificación
1. **No se repite nada de lo que ya funciona en crm-321/postpro-321:** se porta, se parametriza por cliente y se corrigen los defectos de su auditoría. Nada de reescribir por gusto.
2. Repos ajenos = solo lectura (se copia a este repo adaptado).
3. Cada épica de `05` dice **qué archivo origen se porta**, **qué cambia**, **qué tablas**, **cómo se prueba** y **cuándo está terminada**.
4. Todo valor de 321 escrito en el código origen (voz de Byron, WhatsApp, IDs de Instagram, Soul/avatar, colores) pasa a datos por cliente.

## Estado de completitud de la planificación
| Parte | Estado |
|---|---|
| Inventario de reuso | ✅ hecho (crm-321 + postpro-321 leídos) |
| Competencia | ✅ hecho (página pública + fuentes públicas; ver límites en 02) |
| Motor de IA (proveedores) | ✅ diseñado; IDs de modelos a verificar el día de construir |
| Backlog por épicas | ✅ primera versión completa |
| Diseño | ✅ receta Refero con vuelta atrás; `design.md` se genera al construir |
| Decisiones | ✅ cerradas (`06`, `11`); verificaciones técnicas en `13` §8 |
| Precios | ✅ aprobados; se ajustan con el costo real por pieza (Fase A) |
| Prueba ácida | ✅ `14-prueba-acida.md` (14 hallazgos corregidos) |
| **Paquete final para construir** | ✅ `13-handoff-construccion.md` — **falta el visto bueno de Byron** |
