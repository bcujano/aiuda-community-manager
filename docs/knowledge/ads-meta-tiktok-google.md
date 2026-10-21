# Anuncios: Meta, TikTok y Google (AiUDA Ads)

> ✅ = visto en producción en crm-321 / fuentes consultadas · ⚠️ = conocimiento general, verificar. El sistema debe **leer la documentación oficial vigente** de cada plataforma cuando llegue a esa fase; las APIs cambian.

## Ciclo automático de AiUDA Ads
Diagnóstico del negocio → objetivo y presupuesto → **plan** (estructura de campañas, audiencias, creativos, pruebas) → aprobación → creación **en pausa** → activación confirmada → monitoreo diario → reglas (pausar/bajar) → informe semanal → propuesta de optimización → aprobación. Cada paso registra datos y fuente (Regla C).

## Meta Ads ✅
- Jerarquía: Campaña (objetivo, a veces presupuesto CBO) → Conjunto (audiencia, ubicaciones, presupuesto ABO, optimización) → Anuncio (creativo + CTA).
- Objetivos útiles para pymes: mensajes (WhatsApp/DM), clientes potenciales (formulario), tráfico, ventas, reconocimiento.
- Advantage+ audience/placements: dejar a Meta optimizar con creativos variados; restricciones de edad (ver notas v22 en `instagram-api-rules.md`).
- Fase de aprendizaje: no editar demasiado; ~50 resultados por conjunto en 7 días ⚠️.
- Categorías especiales (vivienda, crédito, empleo, política): restricciones de segmentación ⚠️ — crítico para inmobiliarias.
- Medición: píxel/Conversions API ⚠️; sin seguimiento no hay optimización fiable.
- Creativo: 3–5 variantes por conjunto, gancho distinto, formatos 9:16 y 1:1/4:5.

## TikTok Ads ⚠️
- Estructura análoga (campaña → grupo de anuncios → anuncio). Creativo nativo vertical es lo que más pesa; Spark Ads (impulsar publicaciones orgánicas).
- Marketing API: la app pasa **revisión de alcances** antes de que anunciantes la autoricen; puede tardar semanas (fuente tercera, jul-2026).
- Píxel/Events API para conversión.

## Google Ads ⚠️ (sin verificar nada en esta sesión)
- Tipos: Búsqueda (intención alta), Performance Max, Display, YouTube, Local.
- Google Ads API exige **developer token** con nivel de acceso aprobado; investigar niveles y tiempos antes de prometer.
- Clave: palabras clave, negativas, calidad del anuncio, página de destino, conversiones bien medidas.

## Planes ganadores: método
1. Objetivo único por campaña y KPI de negocio (costo por lead/venta), no vanidad.
2. Presupuesto mínimo viable para salir de aprendizaje.
3. 1 audiencia amplia + 1 de retargeting + 1 de lookalike/intereses, no más al inicio.
4. 3–5 creativos × 2 mensajes. Matar perdedores con regla y muestra mínima.
5. Escalar +20 % cada 3–4 días solo con CPA estable; nunca duplicar de golpe.
6. Aprender de cuentas propias; benchmarks públicos con enlace, nunca inventados.

## Reglas automáticas permitidas (con topes)
Pausar anuncio con gasto > N × CPA objetivo sin conversiones · bajar presupuesto con CPA > X % del objetivo · alertar caída de entrega, rechazo de anuncio, saldo bajo. **Subir presupuesto = aprobación humana.**

## Datos que necesita del cliente (de `onboarding-diagnostico.md`)
Oferta, margen, ticket, ciclo de venta, geografía, público, competidores, historial de anuncios, píxel/CAPI, página de destino, canal de cierre (WhatsApp/web/tienda), presupuesto, capacidad de atención.
