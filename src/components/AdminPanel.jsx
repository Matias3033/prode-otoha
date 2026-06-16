import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { MATCHES, TIEBREAKERS } from '../lib/matches'

export default function AdminPanel({
  session,
  participants,
  results,
  official,
  onDataChange,
}) {
  if (!session) {
    return <Login />
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Panel de administración</p>
          <h2 className="text-2xl font-bold text-ink">Gestión del prode</h2>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="btn-ghost text-sm"
        >
          Cerrar sesión
        </button>
      </div>

      <AddParticipant onDone={onDataChange} />
      <ResultsForm results={results} onDone={onDataChange} />
      <OfficialForm official={official} onDone={onDataChange} />
      <ParticipantsList participants={participants} onDone={onDataChange} />
    </div>
  )
}

/* ----------------------------- LOGIN ----------------------------- */
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('No pudimos iniciar sesión. Revisá el email y la contraseña.')
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="card p-6">
        <p className="eyebrow">Acceso privado</p>
        <h2 className="mt-1 text-xl font-bold text-ink">Entrar al panel</h2>
        <p className="mt-1 text-sm text-ink/55">
          Solo el organizador del prode puede cargar datos.
        </p>
        <div className="mt-5 space-y-3">
          <input
            className="field"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="field"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          {error && <p className="text-sm text-wine">{error}</p>}
          <button
            className="btn-primary w-full"
            onClick={handleLogin}
            disabled={loading || !email || !password}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ----------------------- ALTA DE PARTICIPANTE ----------------------- */
function emptyPrediction() {
  const preds = {}
  MATCHES.forEach((m) => {
    preds[m.id] = { home: '', away: '' }
  })
  return preds
}

function AddParticipant({ onDone }) {
  const [name, setName] = useState('')
  const [preds, setPreds] = useState(emptyPrediction)
  const [tb, setTb] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  function reset() {
    setName('')
    setPreds(emptyPrediction())
    setTb({})
  }

  async function save() {
    if (!name.trim()) return
    setSaving(true)
    setMsg('')

    const { data: participant, error: pErr } = await supabase
      .from('participants')
      .insert({
        name: name.trim(),
        tb_goleador: tb.goleador || null,
        tb_mejor_jugador: tb.mejor_jugador || null,
        tb_posicion: tb.posicion || null,
      })
      .select()
      .single()

    if (pErr) {
      setMsg('Error al guardar el participante.')
      setSaving(false)
      return
    }

    const rows = MATCHES.filter(
      (m) => preds[m.id].home !== '' && preds[m.id].away !== ''
    ).map((m) => ({
      participant_id: participant.id,
      match_id: m.id,
      home_goals: Number(preds[m.id].home),
      away_goals: Number(preds[m.id].away),
    }))

    if (rows.length > 0) {
      const { error: prErr } = await supabase.from('predictions').insert(rows)
      if (prErr) {
        setMsg('El participante se guardó pero hubo un error con las predicciones.')
        setSaving(false)
        onDone()
        return
      }
    }

    setMsg(`✓ ${participant.name} cargado correctamente.`)
    reset()
    setSaving(false)
    onDone()
  }

  return (
    <section className="card p-6">
      <h3 className="text-lg font-bold text-ink">Agregar participante</h3>
      <p className="mt-1 text-sm text-ink/55">
        Cargá las predicciones que te mandó cada persona.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/70">
            Nombre
          </label>
          <input
            className="field max-w-xs"
            placeholder="Nombre del participante"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {MATCHES.map((m) => (
            <div key={m.id} className="rounded-xl border border-ink/10 p-3">
              <p className="text-xs font-semibold text-ink/60">{m.matchday}</p>
              <p className="mt-0.5 text-sm font-medium text-ink">
                {m.homeFlag} {m.home}
              </p>
              <p className="text-sm font-medium text-ink">
                {m.awayFlag} {m.away}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  className="field w-14 text-center"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={preds[m.id].home}
                  onChange={(e) =>
                    setPreds((p) => ({
                      ...p,
                      [m.id]: { ...p[m.id], home: e.target.value },
                    }))
                  }
                />
                <span className="text-ink/40">–</span>
                <input
                  className="field w-14 text-center"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={preds[m.id].away}
                  onChange={(e) =>
                    setPreds((p) => ({
                      ...p,
                      [m.id]: { ...p[m.id], away: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {TIEBREAKERS.map((t) => (
            <div key={t.id}>
              <label className="mb-1 block text-xs font-medium text-ink/60">
                {t.label}
              </label>
              {t.type === 'select' ? (
                <select
                  className="field"
                  value={tb[t.id] || ''}
                  onChange={(e) =>
                    setTb((s) => ({ ...s, [t.id]: e.target.value }))
                  }
                >
                  <option value="">—</option>
                  {t.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="field"
                  placeholder={t.placeholder}
                  value={tb[t.id] || ''}
                  onChange={(e) =>
                    setTb((s) => ({ ...s, [t.id]: e.target.value }))
                  }
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            className="btn-primary"
            onClick={save}
            disabled={saving || !name.trim()}
          >
            {saving ? 'Guardando…' : 'Guardar participante'}
          </button>
          {msg && <span className="text-sm text-moss">{msg}</span>}
        </div>
      </div>
    </section>
  )
}

/* ----------------------- RESULTADOS REALES ----------------------- */
function ResultsForm({ results, onDone }) {
  const [local, setLocal] = useState(() => {
    const init = {}
    MATCHES.forEach((m) => {
      init[m.id] = {
        home: results?.[m.id]?.home_goals ?? '',
        away: results?.[m.id]?.away_goals ?? '',
      }
    })
    return init
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function saveMatch(m) {
    const v = local[m.id]
    if (v.home === '' || v.away === '') return
    setSaving(true)
    setMsg('')
    const { error } = await supabase.from('results').upsert({
      match_id: m.id,
      home_goals: Number(v.home),
      away_goals: Number(v.away),
      updated_at: new Date().toISOString(),
    })
    setMsg(error ? 'Error al guardar.' : `✓ Resultado de ${m.matchday} guardado.`)
    setSaving(false)
    if (!error) onDone()
  }

  return (
    <section className="card p-6">
      <h3 className="text-lg font-bold text-ink">Resultados reales</h3>
      <p className="mt-1 text-sm text-ink/55">
        Cargá el marcador final de cada partido. La tabla se recalcula sola.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {MATCHES.map((m) => (
          <div key={m.id} className="rounded-xl border border-ink/10 p-3">
            <p className="text-xs font-semibold text-ink/60">{m.matchday}</p>
            <p className="mt-0.5 text-sm font-medium text-ink">
              {m.homeFlag} {m.home} – {m.away} {m.awayFlag}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <input
                className="field w-14 text-center"
                type="number"
                min="0"
                value={local[m.id].home}
                onChange={(e) =>
                  setLocal((s) => ({
                    ...s,
                    [m.id]: { ...s[m.id], home: e.target.value },
                  }))
                }
              />
              <span className="text-ink/40">–</span>
              <input
                className="field w-14 text-center"
                type="number"
                min="0"
                value={local[m.id].away}
                onChange={(e) =>
                  setLocal((s) => ({
                    ...s,
                    [m.id]: { ...s[m.id], away: e.target.value },
                  }))
                }
              />
              <button
                className="btn-gold ml-auto text-xs"
                onClick={() => saveMatch(m)}
                disabled={saving}
              >
                Guardar
              </button>
            </div>
          </div>
        ))}
      </div>
      {msg && <p className="mt-3 text-sm text-moss">{msg}</p>}
    </section>
  )
}

/* ----------------- RESPUESTAS OFICIALES DE DESEMPATE ----------------- */
function OfficialForm({ official, onDone }) {
  const [local, setLocal] = useState({
    goleador: official?.goleador || '',
    mejor_jugador: official?.mejor_jugador || '',
    posicion: official?.posicion || '',
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function save() {
    setSaving(true)
    setMsg('')
    const { error } = await supabase.from('official_answers').upsert({
      id: 1,
      goleador: local.goleador || null,
      mejor_jugador: local.mejor_jugador || null,
      posicion: local.posicion || null,
      updated_at: new Date().toISOString(),
    })
    setMsg(error ? 'Error al guardar.' : '✓ Desempates oficiales guardados.')
    setSaving(false)
    if (!error) onDone()
  }

  return (
    <section className="card p-6">
      <h3 className="text-lg font-bold text-ink">Desempates oficiales</h3>
      <p className="mt-1 text-sm text-ink/55">
        Las respuestas correctas para resolver empates en puntos.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {TIEBREAKERS.map((t) => (
          <div key={t.id}>
            <label className="mb-1 block text-xs font-medium text-ink/60">
              {t.label}
            </label>
            {t.type === 'select' ? (
              <select
                className="field"
                value={local[t.id]}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, [t.id]: e.target.value }))
                }
              >
                <option value="">—</option>
                {t.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="field"
                placeholder={t.placeholder}
                value={local[t.id]}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, [t.id]: e.target.value }))
                }
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar desempates'}
        </button>
        {msg && <span className="text-sm text-moss">{msg}</span>}
      </div>
    </section>
  )
}

/* --------------------- LISTA / BORRAR PARTICIPANTES --------------------- */
function ParticipantsList({ participants, onDone }) {
  const [deleting, setDeleting] = useState(null)

  async function remove(id) {
    if (!confirm('¿Borrar este participante y sus predicciones?')) return
    setDeleting(id)
    await supabase.from('participants').delete().eq('id', id)
    setDeleting(null)
    onDone()
  }

  if (participants.length === 0) return null

  return (
    <section className="card p-6">
      <h3 className="text-lg font-bold text-ink">
        Participantes cargados ({participants.length})
      </h3>
      <ul className="mt-3 divide-y divide-ink/5">
        {participants.map((p) => (
          <li key={p.id} className="flex items-center justify-between py-2.5">
            <span className="text-sm font-medium text-ink">{p.name}</span>
            <button
              onClick={() => remove(p.id)}
              disabled={deleting === p.id}
              className="text-xs font-medium text-wine/70 hover:text-wine"
            >
              {deleting === p.id ? 'Borrando…' : 'Borrar'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
