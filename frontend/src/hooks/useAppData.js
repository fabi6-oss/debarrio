import { useState, useEffect, useCallback } from 'react'
import { hasSupabase } from '../services/supabase.js'
import * as db from '../services/db.js'
import { setPeople } from '../data/mock.js'

// Orquesta la carga de datos reales (perfil, grupos, partidos, ranking) y expone
// acciones. Alimenta el registro de personas para que playerById() resuelva uuids.
export function useAppData(enabled) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)
  const [groups, setGroups] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [matches, setMatches] = useState([])
  const [players, setPlayers] = useState([])
  const [deudores, setDeudores] = useState([])

  const activeGroup = groups.find((g) => g.id === activeId) || groups[0] || null

  const buildPlayers = useCallback((members, ranking, deudoresRows, myId) => {
    const rk = {}
    for (const r of ranking) rk[r.usuario_id] = r
    const debe = {}
    for (const d of deudoresRows) debe[d.jugador_id] = (debe[d.jugador_id] || 0) + (d.monto_adeudado || 0)
    return members.map((m) => {
      const r = rk[m.id] || {}
      const ok = r.pagos_ok || 0
      const fail = r.pagos_fallidos || 0
      const tot = ok + fail
      const rep = tot > 0 ? Math.round((ok / tot) * 100) : 80
      return { id: m.id, name: m.nombre, rep, jugados: tot, pagados: ok, debe: debe[m.id] || 0, me: m.id === myId }
    })
  }, [])

  const load = useCallback(async () => {
    if (!enabled) { setReady(true); return }
    setError('')
    try {
      const [prof, grps] = await Promise.all([db.getMyProfile(), db.getMyGroups()])
      setProfile(prof)
      setGroups(grps)
      const active = grps.find((g) => g.id === activeId) || grps[0] || null
      if (!active) { setMatches([]); setPlayers([]); setDeudores([]); setReady(true); return }
      setActiveId(active.id)
      const [ms, members, ranking, deudoresRows] = await Promise.all([
        db.listMatches(active.id),
        db.getMembers(active.id),
        db.getRanking(active.id),
        db.getDeudores(active.id),
      ])
      const myId = prof?.id
      const ppl = buildPlayers(members, ranking, deudoresRows, myId)
      const me = ppl.find((p) => p.me) || { id: myId, name: prof?.nombre || 'Tú', rep: 80, jugados: 0, pagados: 0, debe: 0, me: true }
      if (!ppl.some((p) => p.me)) ppl.push(me)
      setPeople(ppl, me)
      setPlayers(ppl)
      setDeudores(deudoresRows.map((d) => ({ ...d, name: ppl.find((p) => p.id === d.jugador_id)?.name || d.nombre })))
      setMatches(ms)
      setReady(true)
    } catch (e) {
      setError(e.message || 'No pude cargar tus datos')
      setReady(true)
    }
  }, [enabled, activeId, buildPlayers])

  useEffect(() => { if (enabled) load() }, [enabled]) // eslint-disable-line

  // ---- acciones ----
  const crearGrupo = useCallback(async (form) => { await db.createGroup(form); await load() }, [load])
  const unirse = useCallback(async (code) => { const gid = await db.unirseAGrupo(code); setActiveId(gid); await load(); return gid }, [load])
  const verComprobante = useCallback((path) => db.urlComprobante(path), [])
  const actualizarNombre = useCallback(async (nombre) => { await db.updateMyNombre(nombre); await load() }, [load])
  const actualizarPosicion = useCallback(async (posicion) => { await db.updateMiPosicion(posicion); await load() }, [load])
  const crearPartido = useCallback(async (form) => {
    if (!activeGroup) throw new Error('Primero crea o entra a un grupo')
    await db.crearPartido({ ...form, grupo: activeGroup.id }); await load()
  }, [activeGroup, load])
  const tomarCupo = useCallback(async (cupoId) => { const pagoId = await db.tomarCupo(cupoId); await load(); return pagoId }, [load])
  const confirmarPago = useCallback(async (pagoId) => { await db.confirmarPago(pagoId); await load() }, [load])
  const liberarCupo = useCallback(async (cupoId) => { await db.liberarCupo(cupoId); await load() }, [load])
  const pagar = useCallback(async (pagoId, file) => {
    const path = await db.subirComprobante(file, pagoId)
    await db.adjuntarComprobante(pagoId, path)
    await load()
  }, [load])

  return {
    live: hasSupabase && enabled, ready, error, profile,
    groups, activeGroup, setActiveId, matches, players, deudores,
    reload: load,
    actions: { crearGrupo, unirse, crearPartido, tomarCupo, confirmarPago, liberarCupo, pagar, verComprobante, actualizarNombre, actualizarPosicion },
  }
}
