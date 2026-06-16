import { useEffect, useState, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { MATCHES } from './lib/matches'
import { buildLeaderboard } from './lib/scoring'
import Header from './components/Header'
import Leaderboard from './components/Leaderboard'
import Predictions from './components/Predictions'
import AdminPanel from './components/AdminPanel'

export default function App() {
  const [view, setView] = useState('ranking')
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const [participants, setParticipants] = useState([])
  const [results, setResults] = useState({})
  const [official, setOfficial] = useState(null)

  // Sesión de admin
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s)
    )
    return () => sub.subscription.unsubscribe()
  }, [])

  // Carga de todos los datos
  const loadData = useCallback(async () => {
    setLoading(true)

    const [pRes, predRes, resRes, offRes] = await Promise.all([
      supabase.from('participants').select('*').order('created_at'),
      supabase.from('predictions').select('*'),
      supabase.from('results').select('*'),
      supabase.from('official_answers').select('*').eq('id', 1).maybeSingle(),
    ])

    // Armar participantes con sus predicciones y desempates
    const predsByParticipant = {}
    ;(predRes.data || []).forEach((row) => {
      predsByParticipant[row.participant_id] ??= {}
      predsByParticipant[row.participant_id][row.match_id] = {
        home_goals: row.home_goals,
        away_goals: row.away_goals,
      }
    })

    const parts = (pRes.data || []).map((p) => ({
      id: p.id,
      name: p.name,
      predictions: predsByParticipant[p.id] || {},
      tiebreakers: {
        goleador: p.tb_goleador,
        mejor_jugador: p.tb_mejor_jugador,
        posicion: p.tb_posicion,
      },
    }))
    setParticipants(parts)

    // Resultados como diccionario por match_id
    const resMap = {}
    ;(resRes.data || []).forEach((r) => {
      resMap[r.match_id] = { home_goals: r.home_goals, away_goals: r.away_goals }
    })
    setResults(resMap)

    // Respuestas oficiales
    const off = offRes.data
    const hasOfficial =
      off && (off.goleador || off.mejor_jugador || off.posicion)
    setOfficial(
      hasOfficial
        ? {
            goleador: off.goleador,
            mejor_jugador: off.mejor_jugador,
            posicion: off.posicion,
          }
        : null
    )

    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const leaderboard = buildLeaderboard(participants, results, official)

  return (
    <div className="min-h-screen">
      <Header view={view} setView={setView} isAdmin={!!session} />

      <Hero />

      <main className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        {loading ? (
          <LoadingState />
        ) : view === 'ranking' ? (
          <Leaderboard
            leaderboard={leaderboard}
            results={results}
            official={official}
          />
        ) : view === 'predicciones' ? (
          <Predictions participants={participants} />
        ) : (
          <AdminPanel
            session={session}
            participants={participants}
            results={results}
            official={official}
            onDataChange={loadData}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}

function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-8 pt-10 sm:px-6 sm:pt-14">
      <p className="eyebrow">Mundial 2026 · Fase de grupos</p>
      <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight text-ink sm:text-4xl">
        El prode de Argentina,{' '}
        <span className="text-wine">en una sola tabla</span>.
      </h1>
      <p className="mt-3 max-w-xl text-ink/60">
        Tres partidos del Grupo J, marcadores, desempates y dos premios en
        juego. Cargá las predicciones de cada participante y dejá que la tabla
        haga el resto.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {MATCHES.map((m) => (
          <span
            key={m.id}
            className="rounded-full border border-ink/10 bg-cream-soft px-3 py-1.5 text-xs font-medium text-ink/70"
          >
            {m.homeFlag} {m.home === 'Argentina' ? 'ARG' : m.home} vs{' '}
            {m.away === 'Argentina' ? 'ARG' : m.away} {m.awayFlag}
          </span>
        ))}
      </div>
    </section>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center py-20 text-ink/40">
      <span className="font-display text-3xl text-wine/30">音</span>
      <p className="mt-3 text-sm">Cargando…</p>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-cream/60">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-8 text-center text-sm text-ink/50 sm:px-6">
        <span className="font-display text-lg text-wine">音葉</span>
        <p>Prode Mundial 2026 · Otoha Academia de Música</p>
        <p className="text-xs text-ink/40">
          2 pts por marcador exacto · 1 pt por acertar gana/empata/pierde
        </p>
      </div>
    </footer>
  )
}
