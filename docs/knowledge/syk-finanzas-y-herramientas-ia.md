# SYK: finanzas y herramientas de IA (resumen propio)

## Las 4 métricas financieras (negocio de servicios digitales)
Medir solo la **facturación** es una métrica de vanidad: no paga el sueldo del equipo ni se traduce linealmente en lo que queda en el bolsillo (muchos clientes pagan en cuotas y la primera cuota no garantiza el plan completo; pocos pagan PIF, "Paid In Full").
1. **Facturación** (tope del embudo).
2. **Cash Collected:** dinero que realmente entró por todas las plataformas y pasarelas.
3. **Cash Collected Neto:** Cash Collected menos comisiones de pasarelas (puede superar el 5% del cash collected).
4. **Beneficio Neto:** Cash Collected Neto menos equipo, software, marketing, impuestos y otros gastos operativos. Es lo que genera cash flow.
- **Margen de rentabilidad = Beneficio Neto / Cash Collected.** Regla general: un negocio de coaching o consultoría sano debería estar **por encima del 50%**.
- Útil para este proyecto: si se construye un tablero, mostrar las 4 métricas y no solo facturación.

## Stack de IA para producir contenido ("Chau editores")
- **Edición de reels:** Captions (subtítulos y silencios), Descript (editar por texto, clonar voz), CapCut Pro (subtítulos, fondos, plantillas), Runway ML (efectos avanzados), Opus Clip (corta videos largos en clips).
- **Imágenes de carrusel:** Midjourney o Leonardo AI (fondos/personajes), Canva con IA (maquetación), Adobe Firefly, Gemini (generación de imágenes).
- **Flujo de reel:** grabar en crudo -> Descript/Captions (cortes y subtítulos) -> CapCut/Runway (música, efectos) -> Opus Clip (clips cortos) -> publicar.
- **Flujo de carrusel (7 slides):** prompt a Claude (copy de cada slide) -> Midjourney/Leonardo (fondos) -> Canva (diseño final). Con este sistema una idea puede pasar a pieza publicable en menos de 10 minutos.
- **Dos formas de usarlo:** (1) Claude como asistente en cada paso, sin configuración; empezar por aquí. (2) Claude + Make/n8n como agente automatizado una vez entendido el proceso.

## Reglas para prompts de imágenes de carrusel
Antes de generar, preguntar 3 cosas: estilo visual, paleta/estética y público. Luego, para cada slide: el fondo nunca compite con el texto; legible en celular; **un elemento visual dominante por slide**; estilo consistente (misma paleta, tipografía y tratamiento); nivel profesional, no de banco de imágenes. Pedir el texto de cada slide de a uno.

## Prompts como "mega-prompts" (patrón de diseño)
- Todos siguen el mismo patrón: **preguntar primero, esperar, luego entregar**; usar palabras clave ("LISTO", "SIGUIENTE") para avanzar; formato exacto de salida; frases de cierre fijas; reglas globales (no asumir datos, no CTAs vagos).
- Salida en texto plano, sin introducciones ni cierres de cortesía, sin descargos.
- Para este asistente: guardar estos prompts como archivos propios (no incrustados en código) en un repo **privado** si se quiere conservarlos literales.

## Herramientas de IA de la biblioteca (solo títulos)
GPTs "by Rama" (guiones, historias, calendario de contenido, calendario de historias, bio), Maestro de Manychat, Open-Claw (guía en PDF), "Prospectar con Claude" (ver `syk-dm-prospeccion-objeciones.md`) y "Analizador de perfil" (ver `syk-content-playbook.md`). Los GPTs son enlaces externos que **no se abrieron**.
