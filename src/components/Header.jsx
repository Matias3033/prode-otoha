export default function Header({ view, setView, isAdmin }) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <button
          onClick={() => setView('ranking')}
          className="group flex items-center gap-3 text-left"
        >
          <span className="font-display text-2xl font-bold text-wine">音葉</span>
          <div className="leading-tight">
            <p className="font-display text-base font-bold text-ink sm:text-lg">
              Prode Mundial 2026
            </p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink/50">
              Otoha · Grupo J
            </p>
          </div>
        </button>

        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink active={view === 'ranking'} onClick={() => setView('ranking')}>
            Tabla
          </NavLink>
          <NavLink
            active={view === 'predicciones'}
            onClick={() => setView('predicciones')}
          >
            Predicciones
          </NavLink>
          <NavLink active={view === 'admin'} onClick={() => setView('admin')}>
            {isAdmin ? 'Panel' : 'Admin'}
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

function NavLink({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition sm:px-4 ${
        active
          ? 'bg-wine text-cream-soft shadow-soft'
          : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
