import React, { useState } from 'react'
import Icon from '../components/Icon.jsx'
// OnboardingScreen — alta de barrio.
//  · Partidos (sin barrio): start="landing" → bienvenida; crear redirige a Organizar (onElegirCrear), unirse inline.
//  · Organizar (sin barrio): start="crear" lockCrear → formulario de creación del grupo, puro.

export default function OnboardingScreen({ onCrear, onUnirse, nombre, start, lockCrear, onElegirCrear }) {
  const [mode, setMode] = useState(start || (onUnirse ? 'landing' : 'crear')) // 'landing' | 'crear' | 'unirse'
  const [form, setForm] = useState({ nombre: '', titular: '', banco: '', tipo: 'Cuenta RUT', numero: '', rut: '', email: '' })
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const saludo = nombre && nombre !== 'Tú' ? `Hola, ${nombre} 👋` : 'Hola 👋'

  const submit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('Ponle nombre a tu barrio'); return }
    setBusy(true); setError('')
    try { await onCrear(form) } catch (err) { setError(err.message || 'No pude crear el grupo'); setBusy(false) }
  }

  const submitUnirse = async (e) => {
    e.preventDefault()
    const c = code.trim()
    if (!c) { setError('Pega el código que te pasaron'); return }
    setBusy(true); setError('')
    try { await onUnirse(c) } catch (err) { setError(err.message || 'Código inválido'); setBusy(false) }
  }

  // --- Bienvenida (pestaña Partidos, sin barrio) ---
  if (mode === 'landing') {
    return (
      <div className="section" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <div className="brand-mark" style={{ width: 64, height: 64, borderRadius: 18, margin: '8px auto 4px' }}><Icon name="ball" size={32} /></div>
        <h1 className="h-xl" style={{ margin: 0 }}>{saludo}</h1>
        <p className="muted" style={{ margin: '0 0 8px' }}>Todavía no estás en ningún barrio. Entra a uno con el código que te pasaron, o crea el tuyo desde Organizar.</p>

        {onUnirse && (
          <button className="btn btn-primary btn-lg btn-block" onClick={() => { setMode('unirse'); setError('') }}>
            <Icon name="arrowR" size={20} /> Tengo un código
          </button>
        )}
        <button className="btn btn-soft btn-lg btn-block" onClick={() => { if (onElegirCrear) onElegirCrear(); else { setMode('crear'); setError('') } }}>
          <Icon name="users" size={20} /> Crear mi barrio
        </button>

        <p className="muted-2" style={{ fontSize: 13, marginTop: 8 }}>
          Un barrio es tu grupo de jugadores. Puedes mirar la app y unirte o crearlo cuando quieras.
        </p>
      </div>
    )
  }

  const puedeVolver = !lockCrear && (onUnirse || onElegirCrear)
  const verTabs = onCrear && onUnirse && !lockCrear

  return (
    <div className="section" style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        {puedeVolver && (
          <button className="btn btn-quiet" style={{ alignSelf: 'flex-start', marginBottom: 6 }} onClick={() => { setMode('landing'); setError('') }}>
            <Icon name="chevL" size={18} /> Volver
          </button>
        )}
        <div className="brand-mark" style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px' }}><Icon name="users" size={28} /></div>
        <h1 className="h-xl">{mode === 'crear' ? 'Arma tu barrio' : 'Únete a un barrio'}</h1>
        <p className="muted">{mode === 'crear'
          ? 'Crea tu grupo y deja tus datos de transferencia. Los jugadores pagarán su cupo a esta cuenta.'
          : 'Pega el código o link que te compartió el organizador para entrar a su barrio.'}</p>
      </div>

      {verTabs && (
        <div className="chip-row" role="tablist" style={{ justifyContent: 'center' }}>
          <button className="chip" aria-pressed={mode === 'crear'} role="tab" onClick={() => { setMode('crear'); setError('') }}>Crear barrio</button>
          <button className="chip" aria-pressed={mode === 'unirse'} role="tab" onClick={() => { setMode('unirse'); setError('') }}>Tengo un código</button>
        </div>
      )}

      {mode === 'unirse' && onUnirse && (
        <form className="card card-pad section" style={{ gap: 14 }} onSubmit={submitUnirse}>
          <div className="field">
            <label htmlFor="g-code">Código o link de invitación</label>
            <input id="g-code" className="input" placeholder="Ej: a3f9c2b1e4d0 o pega el link" value={code}
              onChange={(e) => {
                const v = e.target.value
                const m = v.match(/[?&]join=([^&\s]+)/)
                setCode(m ? m[1] : v)
              }} />
          </div>
          {error && <div className="banner banner-warn" role="alert"><Icon name="alert" size={18} stroke={2.2} style={{ flex: '0 0 auto', marginTop: 1 }} /><div>{error}</div></div>}
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar al barrio'} <Icon name="arrowR" size={19} />
          </button>
        </form>
      )}

      {mode === 'crear' && (
        <form className="card card-pad section" style={{ gap: 14 }} onSubmit={submit}>
          <div className="field">
            <label htmlFor="g-nombre">Nombre del grupo / barrio</label>
            <input id="g-nombre" className="input" placeholder="Ej: Los Cracks de Ñuñoa" value={form.nombre} onChange={set('nombre')} />
          </div>

          <div className="eyebrow" style={{ marginTop: 6 }}>Datos para que te transfieran</div>
          <div className="field">
            <label htmlFor="g-titular">Titular de la cuenta</label>
            <input id="g-titular" className="input" placeholder="Tu nombre completo" value={form.titular} onChange={set('titular')} />
          </div>
          <div className="grid-2" style={{ gap: 10 }}>
            <div className="field">
              <label htmlFor="g-rut">RUT</label>
              <input id="g-rut" className="input num" placeholder="12.345.678-9" value={form.rut} onChange={set('rut')} />
            </div>
            <div className="field">
              <label htmlFor="g-num">N° de cuenta</label>
              <input id="g-num" className="input num" placeholder="00012345678" value={form.numero} onChange={set('numero')} />
            </div>
          </div>
          <div className="grid-2" style={{ gap: 10 }}>
            <div className="field">
              <label htmlFor="g-banco">Banco</label>
              <input id="g-banco" className="input" placeholder="Banco Estado" value={form.banco} onChange={set('banco')} />
            </div>
            <div className="field">
              <label htmlFor="g-tipo">Tipo de cuenta</label>
              <input id="g-tipo" className="input" placeholder="Cuenta RUT" value={form.tipo} onChange={set('tipo')} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="g-email">Correo (opcional)</label>
            <input id="g-email" className="input" type="email" placeholder="tucorreo@mail.com" value={form.email} onChange={set('email')} />
          </div>

          {error && <div className="banner banner-warn" role="alert"><Icon name="alert" size={18} stroke={2.2} style={{ flex: '0 0 auto', marginTop: 1 }} /><div>{error}</div></div>}

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
            {busy ? 'Creando…' : 'Crear mi barrio'} <Icon name="arrowR" size={19} />
          </button>
        </form>
      )}
    </div>
  )
}
