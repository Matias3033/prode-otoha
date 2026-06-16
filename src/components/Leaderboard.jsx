import { MATCHES, TIEBREAKERS } from '../lib/matches'
import { getPrizeWinners } from '../lib/scoring'

export default function Leaderboard({ leaderboard, results, official }) {
  const anyResult = MATCHES.some(
    (m) => results?.[m.id]?.home_goals != null
  )
  const { freeMonthWinners, secretBoxWinner } = getPrizeWinners(leaderboard)

  if (leaderboard.length === 0) {
    return (
      <Empty
        title="Todavía no hay predicciones cargadas"
        body="Cuando cargues las predicciones de los participantes desde el panel, la tabla aparece acá."
      />
    )
  }

  return (
    <div className="space-y-8">
      <PrizesBanner
        anyResult={anyResult}
        freeMonthWinners={freeMonthWinners}
        secretBoxWinner={secretBoxWinner}
      />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-ink/60">
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Participante</th>
                {MATCHES.map((m) => (
                  <th
                    key={m.id}
                    className="px-3 py-3 text-center font-semibold"
                    title={`${m.home} vs ${m.away}`}
                  >
                    {m.matchday.replace('Fecha ', 'F')}
                  </th>
                ))}
                <th className="px-3 py-3 text-center font-semibold">Desemp.</th>
                <th className="px-4 py-3 text-right font-semibold">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-ink/5 transition hover:bg-gold/5 ${
                    row.rank === 1 && anyResult ? 'bg-gold/10' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <RankBadge rank={row.rank} show={anyResult} />
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <span className="flex items-center gap-2">
                      {row.name}
                      {row.perfect && anyResult && (
                        <span title="Acertó todos los marcadores">🎯</span>
                      )}
                    </span>
                  </td>
                  {MATCHES.map((m) => (
                    <td key={m.id} className="px-3 py-3 text-center">
                      <MatchCell s={row.perMatch[m.id]} />
                    </td>
                  ))}
                  <td className="px-3 py-3 text-center text-ink/70">
                    {official ? `${row.tiebreakerHits}/${TIEBREAKERS.length}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-display text-lg font-bold text-wine">
                      {row.total}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Legend />
    </div>
  )
}

function PrizesBanner({ anyResult, freeMonthWinners, secretBoxWinner }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="card p-5">
        <p className="eyebrow">Premio 1</p>
        <h3 className="mt-1 text-lg font-bold text-ink">1 mes de clase gratis</h3>
        <p className="mt-1 text-sm text-ink/60">
          Para quien acierte el marcador exacto de los 3 partidos.
        </p>
        <div className="mt-3 text-sm">
          {!anyResult ? (
            <span className="text-ink/40">A definir con los resultados</span>
          ) : freeMonthWinners.length > 0 ? (
            <span className="font-semibold text-moss">
              🎯 {freeMonthWinners.map((w) => w.name).join(', ')}
            </span>
          ) : (
            <span className="text-ink/50">Nadie acertó todo (aún)</span>
          )}
        </div>
      </div>

      <div className="card p-5">
        <p className="eyebrow">Premio 2</p>
        <h3 className="mt-1 text-lg font-bold text-ink">Caja secreta 🎁</h3>
        <p className="mt-1 text-sm text-ink/60">
          Para quien quede 1ro sin haber acertado todos los marcadores.
        </p>
        <div className="mt-3 text-sm">
          {!anyResult ? (
            <span className="text-ink/40">A definir con los resultados</span>
          ) : secretBoxWinner ? (
            <span className="font-semibold text-wine">
              🏆 {secretBoxWinner.name}{' '}
              <span className="font-normal text-ink/50">
                ({secretBoxWinner.total} pts)
              </span>
            </span>
          ) : (
            <span className="text-ink/50">Sin ganador todavía</span>
          )}
        </div>
      </div>
    </div>
  )
}

function RankBadge({ rank, show }) {
  if (!show) return <span className="text-ink/40">—</span>
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null
  return (
    <span className="inline-flex items-center gap-1 font-display font-bold text-ink/80">
      {medal || rank}
    </span>
  )
}

function MatchCell({ s }) {
  if (!s || (s.points === 0 && !s.outcomeHit)) {
    return <span className="text-ink/25">·</span>
  }
  const color = s.exact
    ? 'bg-moss/15 text-moss'
    : s.outcomeHit
      ? 'bg-gold/20 text-gold'
      : 'text-ink/25'
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${color}`}
      title={s.exact ? 'Marcador exacto (+2)' : 'Resultado acertado (+1)'}
    >
      {s.points}
    </span>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-1 text-xs text-ink/55">
      <span className="flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-moss/15 text-[10px] font-bold text-moss">
          2
        </span>
        Marcador exacto
      </span>
      <span className="flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-[10px] font-bold text-gold">
          1
        </span>
        Acertó gana/empata/pierde
      </span>
      <span className="flex items-center gap-2">
        <span>🎯</span> Acertó todos los marcadores
      </span>
    </div>
  )
}

function Empty({ title, body }) {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      <span className="font-display text-4xl text-wine/30">音</span>
      <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink/55">{body}</p>
    </div>
  )
}
