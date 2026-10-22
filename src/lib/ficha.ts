// Ficha del negocio (AiUDA Setup). Una sola definición: la pantalla, el guardado y el % de avance salen de aquí.
export type Campo = {
  clave: string
  etiqueta: string
  grupo: string
  tipo: 'texto' | 'largo' | 'opcion' | 'numero'
  opciones?: string[]
  ayuda: { que: string; afecta: string; ejemplo: string }
}

export const GRUPOS = ['Identidad', 'Oferta', 'Cliente ideal', 'Voz de marca', 'Operación', 'Objetivos', 'Reglas'] as const

export const CAMPOS: Campo[] = [
  { clave: 'descripcion', etiqueta: 'Qué hace tu negocio', grupo: 'Identidad', tipo: 'largo',
    ayuda: { que: 'Tu negocio explicado en pocas líneas.', afecta: 'Es la base de todo el contenido y los anuncios.', ejemplo: 'Vendemos departamentos en Quito para familias jóvenes.' } },
  { clave: 'ubicacion', etiqueta: 'Ciudad y país donde operas', grupo: 'Identidad', tipo: 'texto',
    ayuda: { que: 'Dónde está tu público.', afecta: 'Define el idioma, los horarios de publicación y la segmentación de anuncios.', ejemplo: 'Quito, Ecuador' } },
  { clave: 'sitio_web', etiqueta: 'Sitio web', grupo: 'Identidad', tipo: 'texto',
    ayuda: { que: 'La dirección de tu página.', afecta: 'Los anuncios y las publicaciones envían tráfico aquí.', ejemplo: 'https://mi-negocio.com' } },
  { clave: 'productos', etiqueta: 'Productos o servicios principales', grupo: 'Oferta', tipo: 'largo',
    ayuda: { que: 'Lo que vendes, uno por línea.', afecta: 'El plan de contenido se reparte entre estos productos.', ejemplo: 'Departamentos de 2 y 3 dormitorios\nAsesoría de crédito' } },
  { clave: 'precios', etiqueta: 'Rango de precios', grupo: 'Oferta', tipo: 'texto',
    ayuda: { que: 'Cuánto cuesta lo que vendes, en general.', afecta: 'Las respuestas automáticas solo citan precios que escribas aquí; nunca inventan.', ejemplo: 'Desde USD 85.000 hasta USD 140.000' } },
  { clave: 'diferenciales', etiqueta: 'Qué te hace distinto', grupo: 'Oferta', tipo: 'largo',
    ayuda: { que: 'Por qué te eligen a ti y no a otro.', afecta: 'Es el mensaje central de los anuncios.', ejemplo: 'Entrega en fecha garantizada por contrato.' } },
  { clave: 'promociones', etiqueta: 'Promociones y temporadas fuertes', grupo: 'Oferta', tipo: 'largo',
    ayuda: { que: 'Ofertas vigentes y meses de más ventas.', afecta: 'El plan del mes las prioriza.', ejemplo: 'Feria de vivienda en noviembre; 5 % de descuento al contado.' } },
  { clave: 'cliente_ideal', etiqueta: 'Tu cliente ideal', grupo: 'Cliente ideal', tipo: 'largo',
    ayuda: { que: 'Quién compra: edad, situación, qué busca.', afecta: 'Define el tono, los temas y la audiencia de anuncios.', ejemplo: 'Parejas de 28 a 40 años que quieren su primera vivienda.' } },
  { clave: 'dolores', etiqueta: 'Qué problema les resuelves', grupo: 'Cliente ideal', tipo: 'largo',
    ayuda: { que: 'El dolor o deseo que los trae a ti.', afecta: 'Cada pieza parte de un dolor real, no de una frase genérica.', ejemplo: 'Pagan arriendo y no logran juntar la entrada.' } },
  { clave: 'objeciones', etiqueta: 'Dudas u objeciones frecuentes y cómo las respondes', grupo: 'Cliente ideal', tipo: 'largo',
    ayuda: { que: 'Lo que te dicen antes de no comprar, y tu mejor respuesta.', afecta: 'El agente de mensajes responde con tus respuestas, no con las suyas.', ejemplo: '«Es caro» → mostramos el costo mensual con crédito.' } },
  { clave: 'preguntas', etiqueta: 'Preguntas que te hacen siempre', grupo: 'Cliente ideal', tipo: 'largo',
    ayuda: { que: 'Las 5 a 10 preguntas más comunes con su respuesta.', afecta: 'Se responden solas en comentarios y mensajes.', ejemplo: '¿Aceptan crédito del BIESS? Sí, con entrada del 10 %.' } },
  { clave: 'tono', etiqueta: 'Tono de voz', grupo: 'Voz de marca', tipo: 'opcion',
    opciones: ['Cercano y amable', 'Profesional', 'Divertido', 'Técnico', 'Elegante / lujo'],
    ayuda: { que: 'Cómo suena tu marca.', afecta: 'Todos los textos y respuestas usan este tono.', ejemplo: 'Cercano y amable' } },
  { clave: 'frases_prohibidas', etiqueta: 'Palabras o frases que nunca deben usarse', grupo: 'Voz de marca', tipo: 'largo',
    ayuda: { que: 'Lo que tu marca jamás diría.', afecta: 'Un revisor automático bloquea las piezas que las contengan.', ejemplo: '«oferta imperdible», «el mejor del mercado»' } },
  { clave: 'colores', etiqueta: 'Colores de tu marca', grupo: 'Voz de marca', tipo: 'texto',
    ayuda: { que: 'Los colores principales (nombre o código).', afecta: 'Las imágenes generadas los respetan.', ejemplo: 'Azul marino #0B1F3A y dorado #C9A24B' } },
  { clave: 'horarios', etiqueta: 'Horario de atención', grupo: 'Operación', tipo: 'texto',
    ayuda: { que: 'Cuándo atiendes.', afecta: 'Fuera de horario, el agente avisa cuándo responderás.', ejemplo: 'Lunes a viernes 9:00–18:00, sábados 9:00–13:00' } },
  { clave: 'canal_cierre', etiqueta: 'Dónde cierras la venta', grupo: 'Operación', tipo: 'opcion',
    opciones: ['WhatsApp', 'Sitio web', 'Tienda física', 'Llamada', 'Otro'],
    ayuda: { que: 'El lugar donde el cliente termina comprando o agendando.', afecta: 'Todos los llamados a la acción apuntan ahí.', ejemplo: 'WhatsApp' } },
  { clave: 'quien_responde', etiqueta: 'Quién atiende a los interesados', grupo: 'Operación', tipo: 'texto',
    ayuda: { que: 'La persona o equipo que recibe los casos que el agente no resuelve.', afecta: 'A él se le escalan quejas y ventas calientes.', ejemplo: 'María, ventas (WhatsApp 09…)' } },
  { clave: 'objetivo', etiqueta: 'Objetivo principal', grupo: 'Objetivos', tipo: 'opcion',
    opciones: ['Conseguir clientes potenciales', 'Vender', 'Agendar citas', 'Recibir reservas', 'Crecer seguidores', 'Ser más conocido'],
    ayuda: { que: 'Lo único que más te importa lograr.', afecta: 'Define qué tipo de contenido y de anuncios se priorizan.', ejemplo: 'Conseguir clientes potenciales' } },
  { clave: 'meta_90d', etiqueta: 'Meta para los próximos 90 días', grupo: 'Objetivos', tipo: 'texto',
    ayuda: { que: 'Un resultado medible.', afecta: 'Los informes comparan tu avance contra esta meta.', ejemplo: '30 visitas agendadas al mes' } },
  { clave: 'presupuesto_ads', etiqueta: 'Presupuesto mensual para anuncios (USD)', grupo: 'Objetivos', tipo: 'numero',
    ayuda: { que: 'Cuánto puedes invertir al mes en publicidad.', afecta: 'Nunca se gasta más de lo que fijes. Puedes poner 0.', ejemplo: '300' } },
  { clave: 'temas_vetados', etiqueta: 'Temas que no se tocan', grupo: 'Reglas', tipo: 'largo',
    ayuda: { que: 'Asuntos delicados para tu marca.', afecta: 'El agente no opina sobre ellos y avisa a una persona.', ejemplo: 'Política, religión, comparar con competidores por nombre' } },
  { clave: 'regulacion', etiqueta: 'Reglas legales de tu sector', grupo: 'Reglas', tipo: 'largo',
    ayuda: { que: 'Lo que la ley o tu gremio exige o prohíbe decir.', afecta: 'Las piezas y anuncios se revisan contra esto.', ejemplo: 'No prometer rentabilidad garantizada.' } },
]

export type Perfil = Record<string, unknown>

const lleno = (v: unknown) => typeof v === 'string' ? v.trim() !== '' : v != null

// Regla C: el avance es una cuenta sobre lo que hay guardado, no una estimación.
export function completitud(perfil: Perfil | null | undefined) {
  const p = perfil ?? {}
  const hechos = CAMPOS.filter((c) => lleno(p[c.clave])).length
  return { hechos, total: CAMPOS.length, porcentaje: Math.round((hechos / CAMPOS.length) * 100) }
}
