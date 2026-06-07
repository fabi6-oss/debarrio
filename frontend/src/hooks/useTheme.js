import { useState, useEffect, useCallback } from 'react'

// Tema claro/oscuro/auto. Persiste la preferencia y aplica data-theme en <html>.
// 'system' sigue prefers-color-scheme en vivo.
const KEY = 'debarrio_theme'
const getStored = () => {
  try { return localStorage.getItem(KEY) || 'system' } catch { return 'system' }
}

export function useTheme() {
  const [theme, setThemeState] = useState(getStored)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const resolved = theme === 'system' ? (mq.matches ? 'dark' : 'light') : theme
      document.documentElement.setAttribute('data-theme', resolved)
    }
    apply()
    if (theme === 'system') {
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [theme])

  const setTheme = useCallback((t) => {
    setThemeState(t)
    try { localStorage.setItem(KEY, t) } catch { /* ignore */ }
  }, [])

  return { theme, setTheme }
}
