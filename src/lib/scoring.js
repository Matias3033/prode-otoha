import { MATCHES, POINTS, TIEBREAKERS } from './matches'

// Devuelve 'home' | 'away' | 'draw' según un marcador
function outcome(homeGoals, awayGoals) {
  if (homeGoals == null || awayGoals == null) return null
  if (homeGoals > awayGoals) return 'home'
  if (homeGoals < awayGoals) return 'away'
  return 'draw'
}

// Normaliza texto para comparar respuestas de desempate
function norm(value) {
  if (value == null) return ''
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

// Calcula los puntos de UNA predicción de un partido contra el resultado real.
// Devuelve { points, exact, outcomeHit }
export function scoreMatch(prediction, result) {
  if (
    !result ||
    result.home_goals == null ||
    result.away_goals == null ||
    !prediction ||
    prediction.home_goals == null ||
    prediction.away_goals == null
  ) {
    return { points: 0, exact: false, outcomeHit: false }
  }

  const predOutcome = outcome(prediction.home_goals, prediction.away_goals)
  const realOutcome = outcome(result.home_goals, result.away_goals)

  const exact =
    prediction.home_goals === result.home_goals &&
    prediction.away_goals === result.away_goals

  if (exact) {
    return { points: POINTS.EXACT_SCORE, exact: true, outcomeHit: true }
  }
  if (predOutcome === realOutcome) {
    return { points: POINTS.OUTCOME_ONLY, exact: false, outcomeHit: true }
  }
  return { points: 0, exact: false, outcomeHit: false }
}

// Cuenta cuántos desempates acertó un participante
export function countTiebreakers(participant, official) {
  if (!official) return 0
  let hits = 0
  for (const tb of TIEBREAKERS) {
    const answer = participant.tiebreakers?.[tb.id]
    const correct = official[tb.id]
    if (!correct) continue
    if (norm(answer) && norm(answer) === norm(correct)) hits += 1
  }
  return hits
}

// Construye la tabla de posiciones completa.
// participants: [{ id, name, predictions: {matchId: {home_goals, away_goals}}, tiebreakers: {...} }]
// results: {matchId: {home_goals, away_goals}}
// official: {goleador, mejor_jugador, posicion}  (respuestas correctas de desempate)
export function buildLeaderboard(participants, results, official) {
  const rows = participants.map((p) => {
    let total = 0
    let exactHits = 0
    const perMatch = {}

    for (const match of MATCHES) {
      const pred = p.predictions?.[match.id]
      const res = results?.[match.id]
      const s = scoreMatch(pred, res)
      perMatch[match.id] = s
      total += s.points
      if (s.exact) exactHits += 1
    }

    const playedMatches = MATCHES.filter(
      (m) => results?.[m.id]?.home_goals != null && results?.[m.id]?.away_goals != null
    ).length

    const tiebreakerHits = countTiebreakers(p, official)

    return {
      ...p,
      total,
      exactHits,
      playedMatches,
      perMatch,
      tiebreakerHits,
      // "Acertó todo" = acertó el marcador exacto de los 3 partidos
      perfect: exactHits === MATCHES.length,
    }
  })

  // Orden: puntos desc, luego cantidad de desempates acertados desc, luego nombre
  rows.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total
    if (b.tiebreakerHits !== a.tiebreakerHits)
      return b.tiebreakerHits - a.tiebreakerHits
    return a.name.localeCompare(b.name, 'es')
  })

  // Asignar posición, marcando empates reales (mismo puntaje y mismos desempates)
  let lastKey = null
  let lastRank = 0
  rows.forEach((row, i) => {
    const key = `${row.total}-${row.tiebreakerHits}`
    if (key === lastKey) {
      row.rank = lastRank
      row.tied = true
    } else {
      row.rank = i + 1
      lastRank = i + 1
      lastKey = key
    }
  })
  // marcar como tied también al primero de un grupo empatado
  rows.forEach((row) => {
    const sameRank = rows.filter((r) => r.rank === row.rank)
    row.tied = sameRank.length > 1
  })

  return rows
}

// Determina los ganadores de premios.
// Premio 1: mes de clase gratis -> quien acertó TODOS los marcadores exactos.
// Premio 2: caja secreta -> el 1ro que NO acertó todo.
export function getPrizeWinners(leaderboard) {
  const freeMonthWinners = leaderboard.filter((r) => r.perfect)

  // El primero del ranking que no es "perfect"
  const secretBoxWinner =
    leaderboard.find((r) => !r.perfect) || null

  return { freeMonthWinners, secretBoxWinner }
}
