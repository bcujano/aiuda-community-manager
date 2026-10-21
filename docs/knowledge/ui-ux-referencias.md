# UI/UX de vanguardia — referencias y reglas

> Fuentes: roundups 2026 (DEV, Medium, TheFrontKit, AdminLTE). **Verificar estrellas/licencias en GitHub antes de adoptar.** Estado: investigación inicial; pendiente revisar en detalle los repos listados.

## Base técnica recomendada
- **shadcn/ui** (copiar componentes al proyecto, se es dueño del código; Radix + Tailwind).
- **Tremor** (KPI/gráficas sobre Tailwind/Radix) o recharts (ya usado en crm-321).
- Plantillas para estudiar (solo lectura): Shadcn Admin (dashboard con tablas y analítica), Next Forge (base SaaS: auth, facturación, i18n).
- Tema claro/oscuro con tokens de color; tipografía legible; modo móvil primero.

## Principios
1. **Menos es más:** una acción principal por pantalla; el resto en menús.
2. **Estados siempre cubiertos:** cargando (skeleton), vacío (con siguiente paso), error (qué pasó + qué hacer), éxito.
3. **Onboarding guiado con valor temprano:** barra de progreso, pasos de 1 pregunta, autocompletado desde la web del cliente, vista previa en vivo del resultado («tu primer post»).
4. **Aprobación en bandeja:** tarjetas con vista previa real de la pieza (como se verá en IG/TikTok), atajos de teclado (aprobar/editar/rechazar), acciones por lote.
5. **Calendario visual** con arrastrar y soltar, colores por estado y por red.
6. **Lecturas plegables** (Regla B) y **ayuda en cada término** (Regla A) con popover corto.
7. **IA transparente:** mostrar de dónde sale cada dato y la confianza; botón «por qué»; deshacer siempre disponible.
8. **Confirmaciones proporcionales:** gasto/publicación = confirmación clara con cifras; tareas triviales sin fricción.
9. **Accesibilidad:** contraste AA, foco visible, navegación por teclado, textos alternativos, `prefers-reduced-motion`.
10. **Rendimiento:** componentes de servidor por defecto, listas virtualizadas, imágenes optimizadas, sin sobrecargar la base gratuita.
11. **Multi-idioma** desde el día 1 (es primero, en/pt/fr después). Formato de moneda, fecha y zona horaria por cliente.
12. **Modo agencia:** selector de marca arriba, vista consolidada, permisos por rol.

## Patrones de pantalla
Inicio (tarjeta «qué hacer hoy» + KPIs + alertas) · Plan del mes (calendario + lista) · Bandeja de aprobación · Bandeja de mensajes (3 paneles: lista, conversación, ficha del lead) · Anuncios (resumen, plan, reglas, informe) · Insights (con Lecturas) · Configuración (conexiones, marca, reglas, aprobaciones, topes).

## Pendiente de investigar
Repos concretos de inbox social, calendarios editoriales y constructores de onboarding; comparar UX de Buffer, Metricool, Later, Sprout, ManyChat, Madgicx, Revealbot (solo observación de producto público).
