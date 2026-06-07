import { useState, useEffect } from 'react'
import { hasSupabase } from '../services/supabase.js'
import { getSession, onAuthChange } from '../services/auth.js'

// Sesión de Supabase. En modo demo (sin credenciales) queda inactivo y
// la app usa un "entrar" local (ver App).
export function useSession() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(!hasSupabase)
  useEffect(() => {
    if (!hasSupabase) return
    let active = true
    getSession().then((s) => { if (active) { setSession(s); setReady(true) } })
    const sub = onAuthChange((s) => setSession(s))
    return () => { active = false; sub.unsubscribe() }
  }, [])
  return { session, ready, live: hasSupabase }
}
