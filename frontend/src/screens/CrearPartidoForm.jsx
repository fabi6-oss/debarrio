import React, { useState } from 'react'
import Icon from '../components/Icon.jsx'
// CrearPartidoForm — formulario (va dentro de un Sheet) para armar una pichanga.
// El formato define cuántos cupos se generan: jugadores por equipo × 2.

const FORMATOS = [
  { id: '5', nombre: 'Baby 5v5', porLado: 5 },
  { id: '6', nombre: 'Fútbol 6', porLado: 6 },
  { id: '7', nombre: 'Fútbol 7', porLado: 7 },
  { id: '8', nombre: 'Fútbol 8', porLado: 8 },
  { id: '9', nombre: 'Fútbol 9', porLado: 9 },
  { id: '11', nombre: 'Fútbol 11', porLado: 11 },
  { id: 'custom', nombre: 'Personalizado', porLado: null },
]

export default function CrearPartidoForm({ onCrear, onClose }) {
  const [form, setForm] = useState({
    titulo: '', formatoId: '7', customPorLado: '6', cancha: '', comuna: '',
    fecha: '', dur: '60 min', costo: '', deadline: '', nota: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  // mínimo seleccionable = ahora (sin segundos), para no permitir fechas pasadas
  const ahoraLocal = () => {
    const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    return d.toISOString().slice(0, 16)
  }
  const minFecha = ahoraLocal()
  // al elegir la fecha del partido, si el plazo de pago está vacío lo igualamos
  const setFecha = (e) => {
    const v = e.target.value
    setForm((f) => ({ ...f, fecha: v, deadline: f.deadline || v }))
  }

  const fmt = FORMATOS.find((f) => f.id === form.formatoId)
  const esCustom = form.formatoId === 'custom'
  const porLado = esCustom ? (parseInt(form.customPorLado, 10) || 0) : fmt.porLado
  const numCupos = porLado * 2
  const formatoLabel = esCustom ? `Personalizado · ${porLado} vs ${porLado}` : `${fmt.nombre} · ${porLado} vs ${porLado}`
  const cuota = form.costo && numCupos > 0 ? Math.ceil(parseInt(form.costo, 10) / numCupos) : 0

  const submit = async (e) => {
    e.preventDefault()
    if (!form.titulo.trim() || !form.cancha.trim() || !form.fecha || !form.costo) {
      setError('Completa título, cancha, fecha y costo'); return
    }
    if (!numCupos || numCupos < 2) { setError('El formato debe tener al menos 1 jugador por equipo'); return }
    const fechaDate = new Date(form.fecha)
    if (fechaDate.getTime() < Date.now()) { setError('La fecha del partido no puede ser en el pasado'); return }
    const deadlineDate = form.deadline ? new Date(form.deadline) : fechaDate
    if (deadlineDate.getTime() > fechaDate.getTime()) { setError('El plazo de pago debe ser antes (o igual) a la hora del partido'); return }
    setBusy(true); setError('')
    try {
      await onCrear({
        titulo: form.titulo, formato: formatoLabel, cancha: form.cancha, comuna: form.comuna,
        fecha: fechaDate.toISOString(), deadline: deadlineDate.toISOString(), dur: form.dur,
        costo: parseInt(form.costo, 10), numCupos,
        nota: form.nota.trim(),
      })
    } catch (err) { setError(err.message || 'No pude crear el partido'); setBusy(false) }
  }

  return (
    <form className="section" onSubmit={submit}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2 className="h-lg" style={{ margin: 0 }}>Armar pichanga</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar"><Icon name="x" size={18} /></button>
      </div>

      <div className="field">
        <label htmlFor="p-titulo">Nombre del partido</label>
        <input id="p-titulo" className="input" placeholder="Ej: Pichanga del Jueves" value={form.titulo} onChange={set('titulo')} />
      </div>

      <div className="field">
        <label>Formato</label>
        <div className="chip-row" role="group" aria-label="Formato del partido" style={{ flexWrap: 'wrap' }}>
          {FORMATOS.map((f) => (
            <button key={f.id} type="button" className="chip" aria-pressed={form.formatoId === f.id}
              onClick={() => setForm((s) => ({ ...s, formatoId: f.id }))}>{f.nombre}</button>
          ))}
        </div>
      </div>

      {esCustom && (
        <div className="field">
          <label htmlFor="p-porlado">Jugadores por equipo</label>
          <input id="p-porlado" className="input num" inputMode="numeric" placeholder="Ej: 6"
            value={form.customPorLado} onChange={set('customPorLado')} />
        </div>
      )}

      {numCupos > 0 && (
        <div className="banner banner-info"><Icon name="users" size={18} stroke={2.2} style={{ flex: '0 0 auto' }} />
          <div>Se generarán <b className="num">{numCupos}</b> cupos ({porLado} por equipo).</div></div>
      )}

      <div className="grid-2" style={{ gap: 10 }}>
        <div className="field">
          <label htmlFor="p-cancha">Cancha</label>
          <input id="p-cancha" className="input" placeholder="Complejo..." value={form.cancha} onChange={set('cancha')} />
        </div>
        <div className="field">
          <label htmlFor="p-comuna">Comuna</label>
          <input id="p-comuna" className="input" placeholder="Ñuñoa" value={form.comuna} onChange={set('comuna')} />
        </div>
      </div>
      <div className="grid-2" style={{ gap: 10 }}>
        <div className="field">
          <label htmlFor="p-fecha">Fecha y hora del partido</label>
          <input id="p-fecha" className="input" type="datetime-local" min={minFecha} value={form.fecha} onChange={setFecha} />
        </div>
        <div className="field">
          <label htmlFor="p-dur">Duración</label>
          <input id="p-dur" className="input" value={form.dur} onChange={set('dur')} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="p-deadline">Plazo para pagar</label>
        <input id="p-deadline" className="input" type="datetime-local" min={minFecha} max={form.fecha || undefined}
          value={form.deadline} onChange={set('deadline')} />
        <span className="muted-2" style={{ fontSize: 12.5 }}>Hasta cuándo pueden transferir. Los cupos sin pagar se liberan al vencer. Por defecto, la hora del partido.</span>
      </div>
      <div className="field">
        <label htmlFor="p-costo">Costo total cancha (CLP)</label>
        <input id="p-costo" className="input num" inputMode="numeric" placeholder="49000" value={form.costo} onChange={set('costo')} />
      </div>
      <div className="field">
        <label htmlFor="p-nota">Aviso para los jugadores (opcional)</label>
        <textarea id="p-nota" className="input" rows={2} style={{ height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'vertical' }}
          placeholder="Ej: Lleven peto claro y oscuro. Estaciono por la parte de atrás." value={form.nota} onChange={set('nota')} />
      </div>

      {cuota > 0 && (
        <div className="banner banner-ok"><Icon name="cash" size={18} stroke={2.2} style={{ flex: '0 0 auto' }} /><div>Cada jugador paga <b className="num">${cuota.toLocaleString('es-CL')}</b> por cupo.</div></div>
      )}
      {error && <div className="banner banner-warn" role="alert"><Icon name="alert" size={18} stroke={2.2} style={{ flex: '0 0 auto' }} /><div>{error}</div></div>}

      <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
        {busy ? 'Creando…' : 'Crear y abrir la lista de cupos'} <Icon name="arrowR" size={19} />
      </button>
    </form>
  )
}
