# DeBarrio — Activar Supabase (pasar de demo a vivo)

La app corre hoy en **modo demo** (datos mock, sin login real). Para activar el backend real:

## 1. Crear proyecto Supabase
- supabase.com → New project (free tier). Anota la **Project URL** y la **anon key** (Settings → API).

## 2. Aplicar migraciones
En el SQL Editor del proyecto, ejecutar en orden:
1. `backend/supabase/migrations/0001_init.sql`
2. `backend/supabase/migrations/0002_storage.sql`
3. `backend/supabase/migrations/0003_cron.sql`
4. `backend/supabase/migrations/0004_match_meta.sql`

## 3. Configurar login con Google
- Google Cloud Console → crear **OAuth Client ID** (tipo Web). Redirect URI: `https://<tu-proyecto>.supabase.co/auth/v1/callback`.
- Supabase → Authentication → Providers → Google → pegar Client ID + Secret → activar.
- (El login por correo/contraseña ya funciona sin config extra.)

## 4. Conectar el frontend
Crear `frontend/.env.local`:
```
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```
Reiniciar `npm run dev`. Con esas variables presentes, `hasSupabase=true` y:
- El login pasa a ser real (correo + Google).
- La capa `src/services/db.js` queda lista para leer/escribir contra el proyecto.

## Estado del cableado

| Pieza | Estado |
|---|---|
| Cliente Supabase (`services/supabase.js`) | ✅ |
| Auth correo + Google (`services/auth.js`, `useSession`) | ✅ real cuando hay credenciales |
| Capa de datos (`services/db.js`: RPCs, vistas, Storage) | ✅ escrita, **pendiente de validar contra proyecto real** |
| Pantallas leyendo de `db.js` en vez de `mock.js` | ⏳ siguiente (requiere proyecto + UI de "crear partido" + mapeo de perfiles) |

## Siguiente paso de desarrollo
Con el proyecto conectado: construir la UI de **crear grupo / crear partido** (RPC `crear_partido` ya existe) y cambiar `PartidosView`/`PerfilScreen` para consumir `db.js`. El modelo mock (12 jugadores, ranking) es demo; los datos reales aparecen cuando jugadores se registran y se crean partidos.
