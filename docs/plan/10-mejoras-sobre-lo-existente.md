# 10 · Llevar lo existente y mejorarlo (más allá de corregir defectos)

Regla C-7: **se lleva** (`01-inventario-reuso.md`) **y se mejora**. Esta lista es lo que se añade encima de cada módulo; los defectos ya están en `01` §F.

| Módulo que se lleva | Mejoras concretas |
|---|---|
| **Plan del mes** (`EstrategiaPanel`, `director.py`) | 2–3 **alternativas** de plan para elegir; objetivos → KPIs medibles; «¿y si cambio el presupuesto?»; informe mensual automático; plan que **aprende** de lo que funcionó (muestra mínima); eventos de la marca (producto, promo) como disparadores |
| **Calendario** (`CalendarioMes`) | **Arrastrar y soltar** para reprogramar; vista por red; conflictos y huecos; **aprobación en lote**; mejores horarios con datos propios (solo con muestra suficiente); vista previa «como se verá» |
| **Detalle de pieza** (`DetallePieza`) | Variantes lado a lado; historial de versiones; «por qué esta pieza» (fuente, skill, hook elegido); comentarios internos; reintento para toda pieza |
| **Redacción + skills** (`redaccion.py`, 9 skills) | **Biblioteca de skills ≥100** combinando las 9 propias, paquetes MIT revisados y el conocimiento del sistema (§ Skills abajo); **aprender la voz** del cliente; validador de cifras |
| **Hooks** (`hooks.md`: 15 fórmulas, puntuación 1–5) | Fórmulas por vertical; pruebas A/B de hooks con resultado medido; el mejor hook de cada marca se guarda |
| **Vectorial** (`lib/vectorial`) | Plantillas por vertical; **Brand Kit aplicado automático**; generador de **variantes** (3 titulares × formatos); exportar los tamaños de **cada red**; carrusel con plantillas; biblioteca de piezas por marca |
| **Publicador** (`post-pro/*`) | Multi-red con adaptadores (`08`); modo directo/asistido; **vista de cola** con estado por plataforma y reintento manual; recordatorios en modo asistido |
| **AdsBoom** (`adsboom*`, `anuncios-meta.md`) | **Por chat**; matriz de pruebas (ángulos × hooks); **autopiloto con límites**; «impulsar lo orgánico que funciona»; guardarraíles de categoría especial (vivienda); informe «qué cambié y por qué» |
| **Ads Manager** (`ads-manager`) | Multi-cuenta; alertas de ritmo de gasto, rechazo y saldo; filtros guardados; comparar periodos |
| **Resultados** (`marketing-resultados`) | Nivel **pieza por pieza**; patrones por gancho/tema/formato/hora; atribución a leads/ventas; competencia con origen; **Ad Library** (`08` §5) |
| **Agente WhatsApp** (`api/agente/*`) | Audio de entrada y salida; herramientas de AiUDA; plantillas de preguntas; confirmación de gasto; resumen diario/semanal por WhatsApp |
| **Webhooks y respuesta** (`321-inmo-webhooks-redes`) | Clasificación de intención/riesgo; respuesta privada a comentarios; escalamiento con nota; modo sugerir/automático; **supervisor IA** (otro proveedor) antes de enviar |
| **Seguimiento** (`seguimiento v5/v6`) | Secuencias con ventana de 24 h, plantillas y «Supervisor IA» → se reutilizan para leads capturados en el Inbox |
| **Glosario y lecturas** | Contenido nuevo para AiUDA; ayuda **contextual** (aparece según el cliente); lecturas que enlazan al dato de origen |
| **Landings / animaciones** (fase D) | Dominio propio por cliente; métricas de conversión; plantillas por vertical |

## Skills: combinar con el conocimiento del sistema
**Hoy:** 9 archivos `.md` (voz-y-reglas, hooks, caption, carrusel, reel, historia, anuncios-meta, segmentacion-meta, diseno-piezas) que se inyectan en el prompt según el tipo de pieza.
**Meta:** una **biblioteca de ≥100 skills** donde cada una declara **qué conocimiento del sistema usa** y **qué devuelve**:
```
---
id: gancho-precio-zona
categoria: ganchos
redes: [instagram, tiktok, facebook]
entradas: [ficha.productos, ficha.precios, ficha.ubicacion, memoria.top_hooks, competencia.patrones]
salida: esquema_hook_v1
validaciones: [frases_prohibidas, cifras_con_fuente, max_palabras:10]
nivel_modelo: redaccion
---
(cuerpo de la skill en Markdown)
```
- **Categorías y metas:** ganchos 15, guiones 12, carruseles 10, historias 8, captions 8, adaptación por red 4 (Instagram, Facebook, TikTok, YouTube), anuncios 24 (Meta 12, TikTok 6, Google/YouTube 6: ángulos, copy, segmentación, pruebas, diagnóstico), respuestas (comentarios, mensajes, objeciones, escalamiento) 12, análisis (métricas, competencia, Ad Library) 10, estrategia (plan, calendario, lanzamiento, evento) 8, SEO local 4. Total ≈ 115.
- **Fuentes:** las skills propias de postpro-321; paquetes **MIT** ya evaluados (coreyhaines31/marketingskills, Jakeschincariol/instagram-agent-skill, sergebulaev/instagram-skills, social-media-skills/skills) **con atribución y reescritas**; el conocimiento vertical de 321. **No** se incluye literal el material de pago de SYK.
- **Combinación con el sistema:** una skill no escribe «desde cero»: recibe la **ficha**, la **memoria** de la marca, los **patrones de la competencia**, los **resultados propios** y las **reglas** (frases prohibidas, diseño, políticas de anuncios).
- **Por organización:** cada cliente puede **editar o desactivar** skills (con versión y vuelta atrás); hay un conjunto base global.
- **Evaluación:** cada skill entra con casos de prueba (`03` §9).
