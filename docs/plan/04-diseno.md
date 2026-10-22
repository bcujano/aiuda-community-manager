# 04 · Diseño: cómo entra `design.md`

**Pedido de Byron:** entregará el código de diseño; se guarda en `docs/design.md` y se usa **como tema y como página de inicio**. Es **netamente estético**: la funcionalidad total manda, el diseño no puede limitar la utilidad.

## 1. Qué falta recibir (checklist)
| # | Qué | Para qué |
|---|---|---|
| 1 | **El código** (HTML/CSS/JS, Tailwind, React o lo que sea) de la landing y, si existe, de pantallas de ejemplo | Fuente de verdad visual → `docs/design.md` (se guarda tal cual) |
| 2 | **Tokens:** paleta (claro y oscuro), tipografías, radios, sombras, espaciados, breakpoints | Se extraen a variables CSS (`src/styles/tokens.css`) |
| 3 | **Fuentes:** nombre, archivos y **licencia** (uso web/comercial) | Evitar problemas legales; autoalojar |
| 4 | **Logo** (SVG), favicon, imagen para compartir (OG) | Marca y SEO |
| 5 | **Imágenes/video/ilustraciones** con licencia | Landing |
| 6 | **Animaciones:** librería usada (GSAP, Framer Motion, CSS…) y dónde | Rendimiento y accesibilidad |
| 7 | **Secciones de la landing** y su texto, o permiso para que yo lo redacte (ver orden persuasivo en `02` §4) | Contenido |
| 8 | **¿Modo claro, oscuro o ambos?** | Hoy la app respeta `prefers-color-scheme` |
| 9 | **Librería de componentes** preferida (shadcn/ui, otra) | El stack objetivo dice shadcn; hoy el sitio usa CSS propio |
| 10 | **Referencias** que le gustan (capturas o enlaces) | Criterio de gusto |

## 2. Reglas de integración (la funcionalidad no cede)
1. **Prioridad:** utilidad y funcionalidad > estética. Si un efecto estorba una tarea, se cambia el efecto.
2. **Accesibilidad:** contraste AA (≥4,5:1 texto normal), foco visible, navegación por teclado, `prefers-reduced-motion`, objetivos táctiles ≥44 px.
3. **Densidad:** las pantallas de trabajo (calendario, tablas, bandeja, anuncios) necesitan **modo denso**; el diseño de la landing no se impone a la app.
4. **Estados completos:** cargando, vacío (con siguiente paso), error (qué pasó y qué hacer), éxito y deshabilitado, en **cada** componente.
5. **Texto largo y otros idiomas:** nada de anchos fijos que rompan con textos más largos (es → en/pt).
6. **Rendimiento:** presupuesto de la landing (LCP < 2,5 s en móvil, sin video autoplay pesado); la app prioriza componentes de servidor.
7. **Reglas de producto dentro del diseño:** el icono «?» de ayuda (Regla A) y el bloque «Lecturas» plegable (Regla B) son componentes del sistema de diseño, no añadidos.
8. **Lista de excepciones** en `design.md` (§ Excepciones): cualquier elemento del diseño que se descarte por funcionalidad se anota con el motivo.

## 3. Pasos para la sesión de construcción (E13)
1. Guardar `docs/design.md` tal cual lo entregue Byron.
2. Extraer tokens → `src/styles/tokens.css`; mapear a Tailwind/shadcn (migración pendiente: hoy es CSS propio).
3. Construir la **landing en `/`** con el diseño (reemplaza la portada actual) y el orden persuasivo de `02` §4, con FAQ **completa**.
4. Aplicar el tema al **shell de la app** (menú lateral, tarjetas, formularios, tablas, calendario).
5. Biblioteca de componentes con todos sus estados + `<Ayuda>` y `<Lecturas>`.
6. Pruebas: capturas de regresión visual (claro/oscuro, móvil/escritorio), auditoría de accesibilidad, Lighthouse.

## 4. Estado actual del sitio (para referencia)
Portada mínima, `/login`, `/app` con menú lateral y ficha del negocio, páginas legales. CSS propio con variables y modo oscuro automático; **sin** Tailwind/shadcn todavía.
