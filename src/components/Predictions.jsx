import { MATCHES, TIEBREAKERS } from '../lib/matches'

export default function Predictions({ participants }) {
  if (participants.length === 0) {
    return (
      <div className="card flex flex-col items-center px-6 py-16 text-center">
        <span className="font-display text-4xl text-wine/30">音</span>
        <h3 className="mt-4 text-lg font-bold text-ink">
          No hay predicciones todavía
        </h3>
        <p className="mt-1 max-w-sm text-sm text-ink/55">
          Las predicciones que cargues desde el panel aparecen acá para que todos
          las puedan ver.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {MATCHES.map((m) => (
          <div key={m.id} className="card p-4">
            <p className="eyebrow">{m.matchday}</p>
            <p className="mt-1 font-display font-bold text-ink">
              {m.homeFlag} {m.home} <span className="text-ink/40">vs</span>{' '}
              {m.away} {m.awayFlag}
            </p>
            <p className="mt-1 text-xs text-ink/50">
              {formatDate(m.date)} · {m.time}
            </p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-ink/60">
                <th className="px-4 py-3 font-semibold">Participante</th>
                {MATCHES.map((m) => (
                  <th key={m.id} className="px-3 py-3 text-center font-semibold">
                    {m.home === 'Argentina' ? 'ARG' : abbr(m.home)}–
                    {m.away === 'Argentina' ? 'ARG' : abbr(m.away)}
                  </th>
                ))}
                {TIEBREAKERS.map((tb) => (
                  <th key={tb.id} className="px-3 py-3 font-semibold">
                    {shortTb(tb.id)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-ink/5 hover:bg-gold/5"
                >
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  {MATCHES.map((m) => {
                    const pred = p.predictions?.[m.id]
                    return (
                      <td key={m.id} className="px-3 py-3 text-center">
                        {pred ? (
                          <span className="font-display font-bold text-ink">
                            {pred.home_goals}–{pred.away_goals}
                          </span>
                        ) : (
                          <span className="text-ink/25">·</span>
                        )}
                      </td>
                    )
                  })}
                  {TIEBREAKERS.map((tb) => (
                    <td key={tb.id} className="px-3 py-3 text-ink/70">
                      {p.tiebreakers?.[tb.id] || (
                        <span className="text-ink/25">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function abbr(name) {
  return name.slice(0, 3).toUpperCase()
}
function shortTb(id) {
  if (id === 'goleador') return 'Goleador'
  if (id === 'mejor_jugador') return 'Mejor jug.'
  return 'Posición'
}
function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
}
