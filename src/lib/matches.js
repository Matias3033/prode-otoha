// Partidos de Argentina en la fase de grupos del Mundial 2026 (Grupo J).
// Estos IDs deben coincidir con los de la tabla "matches" en Supabase.
export const MATCHES = [
  {
    id: 'fra-mar',
    home: 'Francia',
    away: 'Marruecos',
    homeFlag: 'fr',
    awayFlag: 'ma',
    date: '2026-07-09',
    time: '17:00',
    venue: 'Gillette Stadium (Foxborough)',
    matchday: 'Fecha 1',
  },
  {
    id: 'esp-bel',
    home: 'España',
    away: 'Belgica',
    homeFlag: 'es',
    awayFlag: 'be',
    date: '2026-07-10',
    time: '16:00',
    venue: 'SoFi Stadium (Los Angeles)',
    matchday: 'Fecha 2',
  },
  {
    id: 'nor-ing',
    home: 'Noruega',
    away: 'Inglaterra',
    homeFlag: 'no',
    awayFlag: 'uk',
    date: '2026-07-11',
    time: '18:00',
    venue: 'Hard Rock Stadium (Miami)',
    matchday: 'Fecha 3',
  },
  {
    id: 'arg-sui',
    home: 'Argentina',
    away: 'Suiza',
    homeFlag: 'ar',
    awayFlag: 'ch',
    date: '2026-07-11',
    time: '22:00',
    venue: 'Arrowhead Stadium (Kansas City)',
    matchday: 'Fecha 4',
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
    label: 'Goleador de Argentina',
    placeholder: 'Ej: Julián Álvarez',
    type: 'text',
  },
  {
    id: 'mejor_jugador',
    label: 'Mejor jugador de Argentina',
    placeholder: 'Ej: Lautaro Martinez',
    type: 'text',
  },
  {
    id: 'posicion',
    label: 'Posición',
    type: 'select',
    options: ['1ro', '2do'],
  },
]
