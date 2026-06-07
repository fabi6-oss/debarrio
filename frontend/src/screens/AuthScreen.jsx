import React, { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../services/auth.js'
// AuthScreen — login / registro. Auth real con Supabase (correo + Google) cuando `live`;
// en modo demo solo llama onEnter.

export default function AuthScreen({ onEnter, live }) {
  const [mode, setMode] = useState("login")
  const reg = mode === "registro"
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const submit = async (e) => {
    e && e.preventDefault()
    if (!live) { onEnter && onEnter(); return }
    setBusy(true); setError("")
    try {
      const { error } = reg
        ? await signUpWithEmail({ email, password, nombre })
        : await signInWithEmail(email, password)
      if (error) setError(traducir(error.message))
      // si OK, el listener de sesión (App) cambia a la app automáticamente
    } catch (err) {
      setError(err.message || "Algo salió mal")
    } finally { setBusy(false) }
  }

  const google = async () => {
    if (!live) { onEnter && onEnter(); return }
    setBusy(true); setError("")
    const { error } = await signInWithGoogle()
    if (error) { setError(traducir(error.message)); setBusy(false) }
    // OAuth redirige; al volver, el listener toma la sesión
  }

  return (
    <div style={{ minHeight: "100dvh", display: "flex" }}>
      {/* panel marca (desktop) */}
      <div className="only-desktop" style={{
        flex: "1 1 0", color: "#fff", padding: "56px 56px", position: "relative", overflow: "hidden",
        background: "linear-gradient(160deg, var(--verde-700), var(--verde-600) 60%, var(--verde-800))",
        display: "flex", flexDirection: "column",
      }}>
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, opacity: .14,
          background: "repeating-linear-gradient(115deg, #fff 0 2px, transparent 2px 64px)",
        }} />
        <div className="brand" style={{ padding: 0, position: "relative" }}>
          <div className="brand-mark" style={{ background: "rgba(255,255,255,.16)" }}><Icon name="ball" size={22} /></div>
          <span className="brand-name" style={{ color: "#fff" }}>De<b style={{ color: "var(--naranjo-400)" }}>Barrio</b></span>
        </div>
        <div style={{ marginTop: "auto", position: "relative", maxWidth: 460 }}>
          <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.05, margin: "0 0 18px" }}>
            La pichanga se arma sola cuando todos pagan su cupo.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.5, color: "rgba(255,255,255,.9)", margin: 0 }}>
            Reservas tu cupo pagando por transferencia. Sin pago, no hay cupo —
            y el organizador deja de andar persiguiendo la plata.
          </p>
          <div className="row" style={{ marginTop: 28, gap: 24, flexWrap: "wrap" }}>
            {[["shield", "Pagos al día"], ["users", "Tu barrio"], ["trophy", "Reputación de pago"]].map(([i, t]) => (
              <div className="row" key={t} style={{ gap: 8 }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,.16)", display: "grid", placeItems: "center" }}><Icon name={i} size={17} /></span>
                <span style={{ fontWeight: 650, fontSize: 14 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* formulario */}
      <div style={{ flex: "1 1 0", display: "flex", flexDirection: "column", justifyContent: "center", padding: "28px 20px", background: "var(--lienzo)" }}>
        <form style={{ width: "100%", maxWidth: 400, margin: "0 auto" }} onSubmit={submit}>
          <div className="brand only-mobile" style={{ justifyContent: "center", marginBottom: 8 }}>
            <div className="brand-mark"><Icon name="ball" size={22} /></div>
            <span className="brand-name">De<b>Barrio</b></span>
          </div>
          <h2 className="h-xl" style={{ marginBottom: 6, textAlign: "center" }}>{reg ? "Crea tu cuenta" : "Hola de nuevo 👋"}</h2>
          <p className="muted" style={{ textAlign: "center", margin: "0 0 24px" }}>
            {reg ? "Te toma 30 segundos. Pura buena onda." : "Entra y mira en qué quedó la pichanga."}
          </p>

          <div className="section" style={{ gap: 14 }}>
            {reg && (
              <div className="field">
                <label htmlFor="nm">Nombre y apodo</label>
                <input id="nm" className="input" placeholder="Ej: Nico Soto (nico)" value={nombre} onChange={e => setNombre(e.target.value)} />
              </div>
            )}
            <div className="field">
              <label htmlFor="em">Correo electrónico</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--tinta-50)", display: "flex" }}><Icon name="mail" size={18} /></span>
                <input id="em" className="input" type="email" style={{ paddingLeft: 44 }} placeholder="tucorreo@mail.com" inputMode="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="pw">Contraseña</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--tinta-50)", display: "flex" }}><Icon name="lock" size={18} /></span>
                <input id="pw" className="input" type="password" style={{ paddingLeft: 44 }} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete={reg ? "new-password" : "current-password"} />
              </div>
              {!reg && <a className="hint" style={{ color: "var(--verde-700)", fontWeight: 650, textDecoration: "none", alignSelf: "flex-end" }} href="#">¿Se te olvidó?</a>}
            </div>

            {error && <div className="banner banner-warn" role="alert"><Icon name="alert" size={18} stroke={2.2} style={{ flex: "0 0 auto", marginTop: 1 }} /><div>{error}</div></div>}

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy} style={{ marginTop: 4 }}>
              {busy ? "Un momento…" : (reg ? "Crear cuenta y entrar" : "Entrar")} <Icon name="arrowR" size={19} />
            </button>

            <div className="row" style={{ gap: 12, margin: "4px 0" }}>
              <hr className="divider" style={{ flex: 1 }} />
              <span className="muted-2" style={{ fontSize: 13 }}>o</span>
              <hr className="divider" style={{ flex: 1 }} />
            </div>
            <button type="button" className="btn btn-ghost btn-lg btn-block" onClick={google} disabled={busy}>
              <Icon name="user" size={19} /> Entrar con Google
            </button>
          </div>

          <p style={{ textAlign: "center", marginTop: 22, fontSize: 14 }} className="muted">
            {reg ? "¿Ya tienes cuenta? " : "¿Primera vez por acá? "}
            <button type="button" className="btn-quiet" style={{ background: "none", border: 0, color: "var(--verde-700)", fontWeight: 750, cursor: "pointer", fontSize: 14, padding: 0 }}
              onClick={() => { setError(""); setMode(reg ? "login" : "registro") }}>
              {reg ? "Entra aquí" : "Crea una gratis"}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

function traducir(msg) {
  if (/Invalid login credentials/i.test(msg)) return "Correo o contraseña incorrectos."
  if (/already registered/i.test(msg)) return "Ese correo ya tiene cuenta. Entra mejor."
  if (/Password should be/i.test(msg)) return "La contraseña debe tener al menos 6 caracteres."
  return msg
}
