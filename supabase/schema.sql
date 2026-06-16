-- =====================================================================
-- Prode Mundial 2026 · Esquema de base de datos para Supabase
-- Ejecutá este script completo en el SQL Editor de tu proyecto Supabase.
-- =====================================================================

-- Limpieza opcional (descomentá si querés reiniciar desde cero)
-- drop table if exists predictions cascade;
-- drop table if exists participants cascade;
-- drop table if exists results cascade;
-- drop table if exists official_answers cascade;

-- ---------------------------------------------------------------------
-- Participantes (un usuario del prode = una fila)
-- ---------------------------------------------------------------------
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- respuestas a los 3 desempates
  tb_goleador text,
  tb_mejor_jugador text,
  tb_posicion text, -- '1ro' | '2do'
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- Predicciones (una fila por participante y partido)
-- match_id usa los IDs de src/lib/matches.js: 'arg-arg', 'arg-aut', 'arg-jor'
-- ---------------------------------------------------------------------
create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  match_id text not null,
  home_goals int not null check (home_goals >= 0),
  away_goals int not null check (away_goals >= 0),
  unique (participant_id, match_id)
);

-- ---------------------------------------------------------------------
-- Resultados reales de los partidos (los cargás vos como admin)
-- ---------------------------------------------------------------------
create table if not exists results (
  match_id text primary key,
  home_goals int check (home_goals >= 0),
  away_goals int check (away_goals >= 0),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- Respuestas oficiales de los desempates (una sola fila, id = 1)
-- ---------------------------------------------------------------------
create table if not exists official_answers (
  id int primary key default 1,
  goleador text,
  mejor_jugador text,
  posicion text,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

-- Insertar la fila única de respuestas oficiales si no existe
insert into official_answers (id) values (1)
on conflict (id) do nothing;

-- =====================================================================
-- Row Level Security (RLS)
-- Modelo simple: lectura pública para todos; escritura para usuarios
-- "autenticados". Como admin entrás con un usuario de Supabase Auth.
-- =====================================================================
alter table participants enable row level security;
alter table predictions enable row level security;
alter table results enable row level security;
alter table official_answers enable row level security;

-- Lectura pública (cualquiera puede ver el ranking)
create policy "lectura publica participants" on participants
  for select using (true);
create policy "lectura publica predictions" on predictions
  for select using (true);
create policy "lectura publica results" on results
  for select using (true);
create policy "lectura publica official" on official_answers
  for select using (true);

-- Escritura solo para usuarios autenticados (vos, el admin)
create policy "escritura admin participants" on participants
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "escritura admin predictions" on predictions
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "escritura admin results" on results
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "escritura admin official" on official_answers
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
