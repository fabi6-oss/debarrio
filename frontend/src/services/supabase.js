import { createClient } from '@supabase/supabase-js'

// Cliente Supabase. Si no hay credenciales en .env.local, hasSupabase=false
// y la app corre en modo demo (datos mock) — útil para desarrollo sin proyecto.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabase = Boolean(url && key)

export const supabase = hasSupabase
  ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null
