# Prode Mundial 2026 · Otoha

Sitio web sencillo para administrar un prode de los partidos de Argentina en la
fase de grupos del Mundial 2026 (Grupo J). Hecho con **React + Vite + Tailwind +
Supabase**, pensado para subir a GitHub y desplegar en Vercel.

## Qué hace

- Muestra una **tabla de posiciones** que se calcula sola.
- Muestra todas las **predicciones** cargadas (vista pública).
- Tiene un **panel de admin** (con login) donde vos:
  - cargás a mano las predicciones de cada participante,
  - cargás los resultados reales de los partidos,
  - cargás las respuestas oficiales de los desempates.
- Determina automáticamente los **dos premios**.

### Reglas de puntaje

- **2 puntos**: acertar el marcador exacto (que implica también acertar si gana,
  empata o pierde).
- **1 punto**: acertar solo si Argentina gana, empata o pierde.

### Desempates (en este orden)

1. Goleador de Argentina en la fase de grupos.
2. Mejor jugador de Argentina en la fase de grupos.
3. Si Argentina termina 1ro o 2do en el grupo.

### Premios

- **1 mes de clase gratis**: para quien acierte el marcador exacto de los 3
  partidos.
- **Caja secreta**: para quien quede 1ro sin haber acertado todos los marcadores.

### Los partidos (Grupo J)

| Fecha | Partido | Día | Hora (ARG) |
|------|---------|-----|-----------|
| 1 | Argentina vs Argelia | 16/06 | 22:00 |
| 2 | Argentina vs Austria | 22/06 | 14:00 |
| 3 | Jordania vs Argentina | 27/06 | 23:00 |

---

## Puesta en marcha (paso a paso)

### 1. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto gratis.
2. En el menú lateral, abrí **SQL Editor** → **New query**.
3. Pegá todo el contenido de `supabase/schema.sql` y ejecutalo (botón **Run**).
   Esto crea las tablas y los permisos.

### 2. Crear tu usuario de admin

1. En Supabase, andá a **Authentication** → **Users** → **Add user** →
   **Create new user**.
2. Poné tu email y una contraseña. **Marcá "Auto Confirm User"** para no tener
   que confirmar por mail.
3. Ese email y contraseña son los que vas a usar para entrar al panel.

### 3. Obtener las credenciales

En Supabase, andá a **Project Settings** → **API** y copiá:

- **Project URL** → va en `VITE_SUPABASE_URL`
- **anon public** key → va en `VITE_SUPABASE_ANON_KEY`

### 4. Correr el proyecto local

```bash
npm install
cp .env.example .env   # y completá tus credenciales dentro de .env
npm run dev
```

Abrí http://localhost:5173

### 5. Subir a GitHub y desplegar en Vercel

1. Subí el proyecto a un repo de GitHub (el `.gitignore` ya excluye `.env` y
   `node_modules`).
2. En [vercel.com](https://vercel.com), importá el repo.
3. Framework preset: **Vite** (lo detecta solo).
4. En **Environment Variables** agregá las dos variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Listo.

---

## Cómo usarlo

1. Entrá a la pestaña **Admin** y logueate con tu usuario de Supabase.
2. En **Agregar participante**, cargá nombre, los 3 marcadores que predijo y sus
   3 respuestas de desempate. Repetí por cada persona.
3. A medida que se juegan los partidos, cargá los resultados reales en
   **Resultados reales**. La tabla se recalcula automáticamente.
4. Cuando termine la fase de grupos, cargá las respuestas correctas en
   **Desempates oficiales** para resolver empates.
5. La pestaña **Tabla** muestra el ranking y los ganadores de los premios.

> Las pestañas **Tabla** y **Predicciones** son públicas (cualquiera con el link
> las ve). Solo **Admin** pide login.

---

## Notas técnicas

- Los IDs de los partidos (`arg-arg`, `arg-aut`, `arg-jor`) están en
  `src/lib/matches.js` y deben coincidir con los de la base. Si querés cambiar
  partidos o reglas, ese archivo y `src/lib/scoring.js` es donde tocar.
- El cálculo de puntos y el ranking viven en `src/lib/scoring.js`.
- Los desempates comparan ignorando mayúsculas y tildes (`Julián` = `julian`).
- La seguridad usa Row Level Security: lectura pública, escritura solo para tu
  usuario autenticado.
