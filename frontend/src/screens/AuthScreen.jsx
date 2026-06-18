import React, { useState, useRef, useEffect } from 'react'
import Icon from '../components/Icon.jsx'
import { signInWithEmail, signUpWithEmail } from '../services/auth.js'

const TURNSTILE_SITEKEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

export default function AuthScreen({ onEnter, live }) {
  const [mode, setMode] = useState("login")
  const reg = mode === "registro"
  const [nombre, setNombre] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")
  const widgetRef = useRef(null)
  const widgetIdRef = useRef(null)

  useEffect(() => {
    if (!TURNSTILE_SITEKEY) return
    const renderWidget = () => {
      if (widgetRef.current && widgetIdRef.current == null) {
        widgetIdRef.current = window.turnstile.render(widgetRef.current, {
          sitekey: TURNSTILE_SITEKEY,
          'data-action': 'turnstile-spin-v1',
          callback: setTurnstileToken,
          'error-callback': () => setTurnstileToken(""),
          'expired-callback': () => setTurnstileToken(""),
        })
      }
    }
    if (window.turnstile) { renderWidget() } else {
      const s = document.createElement('script')
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      s.async = true
      s.onload = renderWidget
      document.head.appendChild(s)
    }
    return () => {
      if (widgetIdRef.current != null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (TURNSTILE_SITEKEY && widgetIdRef.current != null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
      setTurnstileToken("")
    }
  }, [mode])

  const submit = async (e) => {
    e && e.preventDefault()
    if (!live) { onEnter && onEnter(); return }
    if (TURNSTILE_SITEKEY && !turnstileToken) {
      setError("Completa la verificaci\u00f3n de seguridad antes de continuar.")
      return
    }
    setBusy(true); setError("")
    try {
      const email = phone + "@debarrio.cl"
      const { error } = reg
        ? await signUpWithEmail({ email, password, nombre, captchaToken: turnstileToken })
        : await signInWithEmail(email, password, turnstileToken)
      if (error) setError(traducir(error.message))
    } catch (err) {
      setError(err.message || "Algo sali\u00f3 mal")
    } finally { setBusy(false) }
  }

  const whatsapp = async () => {
    if (!live) { onEnter && onEnter(); return }
    // TODO: Implement WhatsApp OAuth
    setBusy(true)
    setTimeout(() => setBusy(false), 1000)
  }

  return (
    <div className="auth-stage">
      <video className="auth-stage-bg" autoPlay muted loop playsInline poster="">
        <source src="/auth-video.mp4" type="video/mp4" />
      </video>
      <div className="auth-stage-tint" />

      <div className="auth-topbar">
        <div className="brand" style={{ padding: 0 }}>
          <div className="brand-mark"><Icon name="ball" size={22} /></div>
          <span className="brand-name" style={{ color: "#fff" }}>De<b style={{ color: "var(--naranjo-400)" }}>Barrio</b></span>
        </div>
        <div className="auth-topbar-locale">
          <Icon name="shield" size={14} /> Santiago \u00b7 Chile
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-col">
          <div className="auth-lede">
            <span className="auth-eyebrow">
              <span className="auth-eyebrow-dot" />
              TU BARRIO \u00b7 SANTIAGO
            </span>
            <h1 className="auth-title">
              El partido se arma solo<br />
              cuando <em>todos pagan</em>.
            </h1>
          </div>

          <div className="auth-card">
            <div className="auth-seg" style={{ marginBottom: 20 }}>
              <button
                type="button"
                className={"auth-seg-btn" + (!reg ? " is-on" : "")}
                onClick={() => { setError(""); setMode("login") }}
              >
                Entrar
              </button>
              <button
                type="button"
                className={"auth-seg-btn" + (reg ? " is-on" : "")}
                onClick={() => { setError(""); setMode("registro") }}
              >
                Crear cuenta
              </button>
            </div>

            <p className="auth-card-sub" style={{ marginBottom: 20 }}>
              {reg ? "Te toma 30 segundos. Pura buena onda." : "Entra y mira en qu\u00e9 qued\u00f3 el partido."}
            </p>

            <form onSubmit={submit}>
              <div className="section" style={{ gap: 14 }}>
                {reg && (
                  <div className="field">
                    <label htmlFor="nm">Nombre y apodo</label>
                    <input id="nm" className="input" placeholder="Ej: Nico Soto (nico)" value={nombre} onChange={e => setNombre(e.target.value)} />
                  </div>
                )}
                <div className="field">
                  <label htmlFor="ph">N\u00famero de celular</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--tinta-50)", display: "flex" }}><Icon name="phone" size={18} /></span>
                    <input id="ph" className="input" type="tel" style={{ paddingLeft: 44 }} placeholder="+56 9 ____ ____" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="pw">Contrase\u00f1a</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--tinta-50)", display: "flex" }}><Icon name="lock" size={18} /></span>
                    <input id="pw" className="input" type="password" style={{ paddingLeft: 44 }} placeholder={reg ? "M\u00ednimo 6 caracteres" : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"} value={password} onChange={e => setPassword(e.target.value)} autoComplete={reg ? "new-password" : "current-password"} />
                  </div>
                  {!reg && <a className="hint" style={{ color: "var(--verde-700)", fontWeight: 650, textDecoration: "none", alignSelf: "flex-end", fontSize: 13 }} href="#">\u00bfSe te olvid\u00f3?</a>}
                </div>

                {TURNSTILE_SITEKEY && (
                  <div ref={widgetRef} style={{ minHeight: 65 }} />
                )}

                {error && <div className="banner banner-warn" role="alert"><Icon name="alert" size={18} stroke={2.2} style={{ flex: "0 0 auto", marginTop: 1 }} /><div>{error}</div></div>}

                <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
                  {busy ? "Un momento\u2026" : "Entrar"} <Icon name="arrowR" size={19} />
                </button>

                <div className="row" style={{ gap: 12, margin: "4px 0" }}>
                  <hr className="divider" style={{ flex: 1 }} />
                  <span className="muted-2" style={{ fontSize: 13 }}>o</span>
                  <hr className="divider" style={{ flex: 1 }} />
                </div>
                <button type="button" className="btn btn-ghost btn-lg btn-block" onClick={whatsapp} disabled={busy}>
                  <Icon name="whatsapp" size={19} /> Entrar con WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function traducir(msg) {
  if (/Invalid login credentials/i.test(msg)) return "Correo o contrase\u00f1a incorrectos."
  if (/already registered/i.test(msg)) return "Ese correo ya tiene cuenta. Entra mejor."
  if (/Password should be/i.test(msg)) return "La contrase\u00f1a debe tener al menos 6 caracteres."
  return msg
}
