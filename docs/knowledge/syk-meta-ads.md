# SYK: Meta Ads, 3 campañas TOFU / MOFU / BOFU (resumen propio)

## Setup obligatorio antes de tocar el Ads Manager
1. Cuenta en **Meta Business Manager** (business.facebook.com); nunca correr anuncios con el botón azul "Promocionar" de Instagram (menos opciones de optimización; "desperdicia plata").
2. **Pixel de Meta** instalado (Administrador de eventos -> Agregar fuente -> Pixel).
3. **Evento de conversión "Agendar llamada"**: por ejemplo un evento de URL en la página de confirmación (`/gracias`).
4. Cuenta de Instagram conectada al Business Manager.
5. Base de clientes en **CSV** (emails/teléfonos) para el lookalike: con 100+ contactos funciona, con 500+ muy bien.
6. Cuenta publicitaria activa con método de pago. Y **perfil optimizado** antes de mandar tráfico (ver `syk-content-playbook.md`).

## Reparto de presupuesto
TOFU **70%** / MOFU **20%** / BOFU **10%**.
Ejemplos por día: $10 -> 7/2/1; $30 -> 21/6/3; $50 -> 35/10/5; $100 -> 70/20/10.

## TOFU: gente nueva (objetivo Tráfico -> perfil de Instagram)
- Nombre sugerido "TOFU | [mes]". **3 conjuntos** (uno por audiencia), presupuesto a nivel de conjunto, sin fecha de fin:
  - **Broad:** solo países y edad, sin intereses.
  - **Segmentado:** + intereses del nicho.
  - **Lookalike:** desde el CSV de clientes (la de mayor calidad).
- Arrancar los 3 el mismo día y **no tocar nada durante 7 días** (cada edición reinicia el aprendizaje).
- Creativos: **reels que ya funcionaron orgánicamente** (más alcance, DMs o comentarios), sin editar; hook en los primeros 2 s (polémico, contraintuitivo o que nombre un dolor específico); sin look de anuncio (sin logos grandes ni música corporativa).
- Optimización: semanas 1-2 solo mirar CPM (si pasa de ~$15, la audiencia puede ser chica); semana 3 elegir ganador por **menor costo por seguidor**, duplicar su presupuesto y pausar los que cuestan $2+ más; desde el mes 2 rotar creativos cada **10-14 días** (fatiga) con 2-3 reels de reserva.

## MOFU: seguidores a llamadas agendadas
- Audiencia personalizada: Instagram -> "Personas que siguen tu cuenta" (ej. "Seguidores IG - MOFU"). Objetivo Clientes potenciales, o Conversiones si el pixel ya tiene el evento de agenda. Sin segmentación adicional; ubicaciones solo Instagram (feed, stories, reels).
- Si hay **menos de 500 seguidores**, la audiencia es demasiado chica: invertir todo en TOFU hasta superarlos.
- Es la campaña más eficiente en costo (mejor CPL).
- 4 ángulos: **Problema, Objeción, Resultado** (antes/después con números reales), **Autoridad**. CTA directa ("Agendá tu llamada gratuita" con link al calendario); cada paso extra pierde ~30% de conversiones.
- Ejemplo de la fuente (ilustrativo, no un benchmark verificado): 3.000 seguidores, 18 llamadas en el primer mes a $4,20 cada una.

## BOFU: leads calientes (objetivo Conversiones -> evento Agenda)
- Audiencias combinadas en un solo conjunto: agendó y no compró; mandó DM en los últimos **14 días**; visitó la landing de agenda **2+ veces** (30 días); agendó y no se presentó.
- **Excluir clientes actuales** (también en MOFU).
- Mejor creativo: **testimonios en video** de clientes reales; si no hay, capturas de conversaciones o de resultados (reales).

## Escala
- Nunca subir presupuesto antes de **7 días** desde el último cambio y **máximo +20%** por vez ($30 -> $36). Escalar solo cuando el costo por resultado cumple el KPI **5+ días seguidos**. Para TOFU: duplicar el conjunto ganador, subir el duplicado y pausar el original.
- Dar al sistema **30 días** antes de sacar conclusiones.

## Errores que queman plata
Anunciar desde el botón de Instagram; tocar la campaña antes de 7 días; mezclar audiencias frías y calientes en un conjunto (un conjunto por audiencia); no excluir clientes actuales; escalar de golpe ($10 -> $100); mandar tráfico a un perfil sin optimizar.

## Notas para este proyecto
- Las cifras de resultados de la fuente son ejemplos del autor, no garantías. No usarlas como promesa a clientes.
- Cualquier creación o cambio de campaña mediante las herramientas `ads_*` o la Marketing API es una escritura con gasto de dinero: confirmar con el usuario cuenta, presupuesto y fechas antes de aplicar (ver `agent-safety-rules.md`).
- "FM Ads" (Follow Me Ads) y las campañas de $250K/mes están enlazadas en la biblioteca pero no se leyeron.
