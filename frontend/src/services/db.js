import { supabase, hasSupabase } from './supabase.js'

// Capa de datos: mapea las RPCs/tablas/vistas del backend Supabase al shape que usan
// las pantallas (mismo formato que data/mock.js para reutilizar los componentes).

const STATE_DB_TO_UI = {
  libre: 'libre',
  reservado_pendiente: 'pendiente',
  pagado: 'pagado',
  liberado: 'liberado',
}

const dtf = new Intl.DateTimeFormat('es-CL', { weekday: 'short', day: '2-digit', month: 'short' })
const ttf = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })
const fmtDia = (iso) => dtf.format(new Date(iso)).replace('.', '')
const fmtHora = (iso) => ttf.format(new Date(iso))

// ---- Identidad ----
export async function getUserId() {
  if (!hasSupabase) return null
  const { data } = await supabase.auth.getUser()
  return data?.user?.id || null
}

export async function getMyProfile() {
  if (!hasSupabase) return null
  const { data: u } = await supabase.auth.getUser()
  if (!u?.user) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', u.user.id).single()
  return { ...data, email: u.user.email }
}

// Editar el nombre del propio perfil. La policy profiles_update (id = auth.uid())
// permite este UPDATE directo; no afecta el login (que es por email en auth.users).
export async function updateMyNombre(nombre) {
  const { data: u } = await supabase.auth.getUser()
  const { error } = await supabase.from('profiles').update({ nombre }).eq('id', u.user.id)
  if (error) throw error
}

// Posición preferida (arquero/defensa/…). No tiene límite; update directo permitido por la policy.
export async function updateMiPosicion(posicion) {
  const { data: u } = await supabase.auth.getUser()
  const { error } = await supabase.from('profiles').update({ posicion }).eq('id', u.user.id)
  if (error) throw error
}

// ---- Grupos ----
export async function getMyGroups() {
  if (!hasSupabase) return []
  const { data, error } = await supabase
    .from('miembros')
    .select('rol, grupos:grupo_id ( id, nombre, organizador_id, invite_code, transfer_titular, transfer_banco, transfer_tipo, transfer_numero, transfer_rut, transfer_email )')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map((m) => ({ ...m.grupos, rol: m.rol }))
}

export async function createGroup(form) {
  const { data: grupoId, error } = await supabase.rpc('crear_grupo', {
    p_nombre: form.nombre,
    p_transfer_titular: form.titular || null,
    p_transfer_banco: form.banco || null,
    p_transfer_tipo: form.tipo || null,
    p_transfer_numero: form.numero || null,
    p_transfer_rut: form.rut || null,
    p_transfer_email: form.email || null,
  })
  if (error) throw error
  const { data: grupo, error: e2 } = await supabase
    .from('grupos').select('*').eq('id', grupoId).single()
  if (e2) throw e2
  return grupo
}

export async function unirseAGrupo(code) {
  const { data, error } = await supabase.rpc('unirse_a_grupo', { p_code: code })
  if (error) throw error
  return data // grupo_id
}

export async function getMembers(grupoId) {
  if (!hasSupabase || !grupoId) return []
  const { data, error } = await supabase
    .from('miembros')
    .select('rol, profiles:usuario_id ( id, nombre )')
    .eq('grupo_id', grupoId)
  if (error) throw error
  return (data || []).map((m) => ({ id: m.profiles.id, nombre: m.profiles.nombre, rol: m.rol }))
}

// ---- Partidos (con cupos + pagos) ----
export async function listMatches(grupoId) {
  if (!hasSupabase) return []
  const me = await getUserId()
  let q = supabase
    .from('partidos')
    .select(`
      id, cancha, fecha, costo_total, num_cupos, cuota, deadline_pago, estado, nota,
      titulo, formato, comuna, dur,
      grupos:grupo_id ( id, organizador_id,
        transfer_titular, transfer_banco, transfer_tipo, transfer_numero, transfer_rut, transfer_email ),
      cupos ( id, numero, jugador_id, estado, reservado_at,
        pagos ( id, estado, comprobante_path ) )
    `)
    .order('fecha', { ascending: true })
  if (grupoId) q = q.eq('grupo_id', grupoId)
  const { data, error } = await q
  if (error) throw error
  return (data || []).map((p) => mapMatch(p, me))
}

function mapMatch(p, myId) {
  const total = p.num_cupos
  const byNum = {}
  for (const c of p.cupos || []) byNum[c.numero] = c
  const spots = []
  for (let n = 1; n <= total; n++) {
    const c = byNum[n]
    const pendiente = (c?.pagos || []).find((pg) => pg.estado === 'pendiente')
    spots.push({
      n,
      state: c ? (STATE_DB_TO_UI[c.estado] || 'libre') : 'libre',
      pid: c?.jugador_id || null,
      cupoId: c?.id || null,
      pagoId: pendiente?.id || null,
      comprobante: pendiente?.comprobante_path || null,
      when: c?.reservado_at ? fmtHora(c.reservado_at) : null,
    })
  }
  const g = p.grupos || {}
  return {
    id: p.id,
    grupoId: g.id,
    titulo: p.titulo || 'Pichanga',
    formato: p.formato || '',
    cancha: p.cancha,
    comuna: p.comuna || '',
    dia: fmtDia(p.fecha),
    hora: fmtHora(p.fecha),
    dur: p.dur || '',
    precio: p.cuota,
    organizador: g.organizador_id || null,
    total,
    spots,
    nota: p.nota || '',
    miOrg: g.organizador_id === myId,
    transfer: {
      nombre: g.transfer_titular, rut: g.transfer_rut, banco: g.transfer_banco,
      tipo: g.transfer_tipo, cuenta: g.transfer_numero, email: g.transfer_email,
    },
  }
}

// ---- RPCs de negocio ----
export async function tomarCupo(cupoId) {
  const { data, error } = await supabase.rpc('tomar_cupo', { p_cupo: cupoId })
  if (error) throw error
  return data // id del pago creado
}
export async function adjuntarComprobante(pagoId, path) {
  const { error } = await supabase.rpc('adjuntar_comprobante', { p_pago: pagoId, p_path: path })
  if (error) throw error
}
export async function confirmarPago(pagoId) {
  const { error } = await supabase.rpc('confirmar_pago', { p_pago: pagoId })
  if (error) throw error
}
export async function liberarCupo(cupoId) {
  const { error } = await supabase.rpc('liberar_cupo', { p_cupo: cupoId })
  if (error) throw error
}
export async function crearPartido({ grupo, cancha, fecha, costo, numCupos, deadline, titulo, formato, comuna, dur, nota }) {
  const { data, error } = await supabase.rpc('crear_partido', {
    p_grupo: grupo, p_cancha: cancha, p_fecha: fecha,
    p_costo: costo, p_num_cupos: numCupos, p_deadline: deadline,
    p_titulo: titulo, p_formato: formato, p_comuna: comuna, p_dur: dur, p_nota: nota,
  })
  if (error) throw error
  return data
}

// ---- Comprobante en Storage (bucket privado) ----
export async function subirComprobante(file, pagoId) {
  const { data: u } = await supabase.auth.getUser()
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${u.user.id}/${pagoId}.${ext}`
  const { error } = await supabase.storage.from('comprobantes').upload(path, file, { upsert: true })
  if (error) throw error
  return path
}

// Signed URL temporal para que el organizador vea un comprobante (bucket privado).
export async function urlComprobante(path) {
  if (!hasSupabase || !path) return null
  const { data, error } = await supabase.storage.from('comprobantes').createSignedUrl(path, 120)
  if (error) throw error
  return data?.signedUrl || null
}

// ---- Vistas: ranking / deudores ----
export async function getRanking(grupoId) {
  if (!hasSupabase || !grupoId) return []
  const { data, error } = await supabase.from('v_ranking').select('*').eq('grupo_id', grupoId)
  if (error) throw error
  return data || []
}
export async function getDeudores(grupoId) {
  if (!hasSupabase || !grupoId) return []
  const { data, error } = await supabase.from('v_deudores').select('*').eq('grupo_id', grupoId)
  if (error) throw error
  return data || []
}
