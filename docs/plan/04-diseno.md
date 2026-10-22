# 04 · Diseño: cómo entra `design.md`

**Decisión de Byron (2026-10-22):** se usa la **receta Refero** (§5) como tema y página de inicio, **pero tiene que ser fácil volver atrás si no le gusta** (§6). Si entrega su propio código de diseño, entra como **tercer tema** y puede ganar. Es **netamente estético**: la funcionalidad total manda, el diseño no puede limitar la utilidad.

## 1. Qué falta recibir (checklist) — ahora **opcional** si se usa la receta Refero
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

## 5. Opciones de Refero Styles (revisión del 2026-10-22)
Fuente: [styles.refero.design](https://styles.refero.design/) — biblioteca beta de estilos de sitios reales (≈2.000 según la página); cada estilo trae colores, tipografía, espaciado, componentes y un `DESIGN.md` que Claude Code puede leer; ofrece conexión por MCP. La portada solo muestra 20 estilos; **revisé a fondo 4** (Intercom, Notion, Ramp, Raycast) y los demás por su descripción de una línea.

### Criterios para AiUDA
1) pantallas de trabajo **densas** (calendario, bandeja, anuncios, tablas); 2) **confianza y control de dinero** (topes, aprobaciones); 3) cálido y simple para dueños de pymes; 4) claro **y** oscuro; 5) accesible (AA); 6) landing que persuade.

### Lo que encontré en los 4 revisados
| Estilo | Carácter | Lo mejor para nosotros | Límites |
|---|---|---|---|
| **Notion** | Lienzo cálido `#f6f5f4`, tarjetas blancas con borde fino (sin sombra), **un solo azul** `#0075de` para la acción principal, radios 4/8/12, tarjeta de tarea tipo kanban, pastillas, jerarquía de texto por opacidad | Es lo más cercano a un **producto de trabajo**: tarjetas de piezas, calendario, flujos de aprobación; un solo CTA por pantalla | Solo modo claro; no define tablas ni campos de formulario |
| **Intercom** | «Revista en papel crema» `#faf9f6`, tipografía ligera y editorial, **radio 4 px, sin sombras**, violeta `#0007cb` usado 1–2 veces por pantalla | Ideal para la **landing** y el **Inbox** (es un producto de mensajería); calidez y calma | Texto gris claro (`#888`, `#a0a0a0`) **no pasa AA** sobre crema → hay que oscurecerlo; solo claro; fuentes propietarias (Saans, Serrif) |
| **Ramp** | «Editorial financiero»: blanco/hueso, un único acento chartreuse `#e4f222` reservado para **acción y dinero**, bordes finos, solo peso 400, radios 6/10/12/16 | Transmite **control y seriedad con el dinero** → pantallas de **Ads, topes y gasto**; jerarquía por tamaño | Texto blanco sobre el amarillo falla AA (usa texto oscuro); sin tablas ni gráficos definidos; solo claro; fuente propietaria |
| **Raycast** | Oscuro total `#040506`, acento coral `#ff6363`, botones neutros, bordes e insets en vez de sombras, tarjetas «tecla», barra de comandos | **Modo oscuro** y el **Asistente / paleta de comandos** (chat, atajos) | Sin CTA cromático claro; no hay modo claro |

### De los 20 visibles, por ajuste
| Ajuste | Estilos | Por qué |
|---|---|---|
| **Alto** | **Notion**, **Intercom**, **Ramp** | Los tres que cubren app, landing/inbox y control de gasto |
| **Alto para modo oscuro/Asistente** | **Raycast** | Cabina de comandos |
| **Medio (landing o detalles)** | **ElevenLabs** (crema editorial cálido), **Perplexity AI** (pergamino limpio, producto de IA), **Cursor** (taller cálido, producto de IA), **Wise** (verde musgo + lima: confianza y cercanía), **Brex** y **Mercury** (finanzas sobrias, confianza), **Figma** (galería blanca: útil para la galería de piezas) | Buenos para la sensación de «producto de IA confiable» |
| **Bajo** | OpenAI («cuaderno de laboratorio»), Apple iPhone Duo / iPhone 18 Pro, Auros, ORYZO AI, Integrated Biosciences, teenage engineering, Dala, Ui | Demasiado de nicho, de hardware, oscuros/atmosféricos o poco útiles para pantallas densas |
También sirven los **filtros** de la página: «Analytics dashboard», «Warm indie SaaS», «Like Notion», «Like Vercel».

### Recomendación (receta combinada, a confirmar con tu diseño)
1. **Base de la app: Notion** (lienzo cálido, tarjetas con borde fino, un acento por pantalla, radios 8/12, pastillas de estado).
2. **Pantallas de dinero (Ads, topes, costos): Ramp** (jerarquía por tamaño, acento reservado a la acción y al dinero, números grandes y claros).
3. **Landing e Inbox: Intercom** (crema editorial, calma), con **texto más oscuro** para cumplir AA.
4. **Modo oscuro y Asistente: Raycast** (lienzo casi negro, bordes finos, barra de comandos).
Colores de marca: salen de **tu código de diseño**; si no lo entregas, se propone un acento propio de AiUDA (no se copia el de ninguna de estas marcas).

### Advertencias
- Son estilos **derivados de marcas reales**: se toma la **estructura** (jerarquía, radios, espaciado, uso del color), **no** la identidad (logos, tipografías propietarias como Saans, Lausanne o NotionInter; usar Inter u otra con licencia).
- **Ninguno define** tablas densas, calendario, gráficos, estados de formulario ni modo oscuro completo (salvo Raycast). Esas piezas las definimos nosotros en `design.md`, con las reglas de la §2.
- Si entregas tu **código de diseño**, **ese manda**; Refero sirve para complementar lo que falte (p. ej. el modo oscuro) o como plantilla de formato del `DESIGN.md`.

## 6. Reversibilidad: volver atrás debe costar una línea
1. **Punto de retorno:** antes de aplicar nada se etiqueta el estado actual (`diseno-base-v0`) en `main`.
2. **Tokens en tres capas:** primitivos (colores, tamaños) → **semánticos** (`--fondo`, `--superficie`, `--borde`, `--texto`, `--texto-suave`, `--accion`, `--peligro`, `--exito`, `--radio-*`, `--fuente-*`) → componentes. **Los componentes solo usan tokens semánticos, nunca colores directos.**
3. **Registro de temas:** `data-tema="base" | "refero" | "propio"` en `<html>`; los temas viven en archivos CSS separados (`tema-base.css`, `tema-refero.css`, `tema-propio.css`). El tema activo sale de **una variable** (`NEXT_PUBLIC_TEMA`) o, más adelante, de un ajuste por organización. **Volver atrás = cambiar esa variable y redesplegar** (o `git revert` de un solo commit).
4. **Solo piel:** la estructura de pantallas y componentes es **la misma** en todos los temas (sin bifurcar componentes), de modo que cambiar de tema nunca rompe funciones.
5. **Tipografías** por variable (`--fuente-titulo`, `--fuente-cuerpo`, `--fuente-mono`) con alternativas con licencia (Inter y similares).
6. **Compuerta de aprobación:** antes de dejar Refero como tema por defecto, Byron revisa capturas de **6 pantallas clave** (inicio, ficha, calendario, bandeja, anuncios, landing) en claro/oscuro y móvil/escritorio, con **ambos temas lado a lado**. Si no le gusta, el tema por defecto sigue siendo `base`.
7. **Pruebas:** capturas de regresión visual en CI para cada tema; prueba de que cambiar `NEXT_PUBLIC_TEMA` deja todas las pantallas operativas.
8. **Etiqueta de entrega:** `diseno-refero-v1` al terminar, para poder volver a ella o a `diseno-base-v0`.

## 7. `docs/design.md` (formato)
Se escribe con el formato de `DESIGN.md` que usa Refero (paleta, tipografía, espaciado, radios, componentes, principios, **excepciones** y **correcciones de accesibilidad**), con una sección por tema. La receta combina: Notion (app), Ramp (pantallas de dinero), Intercom (landing e Inbox) y Raycast (modo oscuro y Asistente). ⚠️ Verificar en la construcción si los `DESIGN.md` de esos cuatro estilos se pueden descargar sin cuenta.
