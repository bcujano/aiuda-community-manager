// Regla A: todo término lleva su ayuda (qué es · de dónde sale · cómo afecta · ejemplo).
export function Ayuda({ que, afecta, ejemplo, origen = 'Lo escribes tú en esta ficha.' }: { que: string; afecta: string; ejemplo: string; origen?: string }) {
  return (
    <details className="ayuda">
      <summary aria-label="Ayuda">?</summary>
      <div className="ayuda-caja">
        <p><b>Qué es:</b> {que}</p>
        <p><b>De dónde sale:</b> {origen}</p>
        <p><b>Cómo afecta:</b> {afecta}</p>
        <p><b>Ejemplo:</b> {ejemplo}</p>
      </div>
    </details>
  )
}
