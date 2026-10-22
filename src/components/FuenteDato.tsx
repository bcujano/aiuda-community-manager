// Regla C: toda cifra muestra de dónde sale; sin dato se dice «sin dato».
export function FuenteDato({ valor, origen, unidad = '' }: { valor: number | string | null | undefined; origen: string; unidad?: string }) {
  const hay = valor !== null && valor !== undefined && valor !== ''
  return (
    <span>
      <b>{hay ? `${valor}${unidad}` : 'sin dato'}</b>
      <small className="fuente-dato">{hay ? `Origen: ${origen}` : `Falta: ${origen}`}</small>
    </span>
  )
}
