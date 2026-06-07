import { supabase, hasSupabase } from './supabase.js'

// Wrapper de autenticación. En modo demo (sin Supabase) simula sesión local.

export async function getSession() {
  if (!hasSupabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthChange(cb) {
  if (!hasSupabase) return { unsubscribe() {} }
  const { data } = supabase.auth.onAuthStateChange((_e, session) => cb(session))
  return data.subscription
}

export async function signInWithEmail(email, password) {
  if (!hasSupabase) return { error: null }
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithEmail({ email, password, nombre }) {
  if (!hasSupabase) return { error: null }
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre } },
  })
}

export async function signInWithGoogle() {
  if (!hasSupabase) return { error: null }
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
}

export async function signOut() {
  if (!hasSupabase) return
  await supabase.auth.signOut()
}
