// Regla B: cada pantalla con datos explica qué decisión sale de ellos y con qué cruzarlos.
export function Lecturas({ items }: { items: { decision: string; cruzar: string }[] }) {
  return (
    <details className="lecturas">
      <summary>Lecturas</summary>
      <ul>{items.map((i) => <li key={i.decision}><b>{i.decision}</b> — cruza con: {i.cruzar}</li>)}</ul>
    </details>
  )
}
