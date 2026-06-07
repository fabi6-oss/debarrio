import { useState, useEffect } from 'react'

export function useMediaQuery(q) {
  const [m, setM] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const mm = window.matchMedia(q)
    const on = () => setM(mm.matches)
    mm.addEventListener ? mm.addEventListener('change', on) : mm.addListener(on)
    return () => (mm.removeEventListener ? mm.removeEventListener('change', on) : mm.removeListener(on))
  }, [q])
  return m
}
