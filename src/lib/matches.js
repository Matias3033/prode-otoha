// Partidos de Argentina en la fase de grupos del Mundial 2026 (Grupo J).
// Estos IDs deben coincidir con los de la tabla "matches" en Supabase.
export const MATCHES = [
  {
    id: 'arg-arg',
    home: 'Argentina',
    away: 'Argelia',
    homeFlag: '🇦🇷',
    awayFlag: '🇩🇿',
    date: '2026-06-16',
    time: '22:00',
    venue: 'Arrowhead Stadium · Kansas City',
    matchday: 'Fecha 1',
  },
  {
    id: 'arg-aut',
    home: 'Argentina',
    away: 'Austria',
    homeFlag: '🇦🇷',
    awayFlag: '🇦🇹',
    date: '2026-06-22',
    time: '14:00',
    venue: 'AT&T Stadium · Dallas',
    matchday: 'Fecha 2',
  },
  {
    id: 'arg-jor',
    home: 'Jordania',
    away: 'Argentina',
    homeFlag: '🇯🇴',
    awayFlag: '🇦🇷',
    date: '2026-06-27',
    time: '23:00',
    venue: 'AT&T Stadium · Dallas',
    matchday: 'Fecha 3',
  },
]

// Reglas de puntaje del prode
export const POINTS = {
  EXACT_SCORE: 2, // acierta resultado (gana/pierde/empata) + marcador exacto
  OUTCOME_ONLY: 1, // acierta solo el resultado (gana/pierde/empata)
}

// Preguntas de desempate (en orden de prioridad para resolver empates)
export const TIEBREAKERS = [
  {
    id: 'goleador',
    label: 'Goleador de Argentina en la fase de grupos',
    placeholder: 'Ej: Julián Álvarez',
    type: 'text',
  },
  {
    id: 'mejor_jugador',
    label: 'Mejor jugador de Argentina en la fase de grupos',
    placeholder: 'Ej: Lionel Messi',
    type: 'text',
  },
  {
    id: 'posicion',
    label: '¿Argentina termina 1ro o 2do en el grupo?',
    type: 'select',
    options: ['1ro', '2do'],
  },
]
