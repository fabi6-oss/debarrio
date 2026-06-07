import React, { useState, useEffect } from 'react'
import Icon from './components/Icon.jsx'
import { Avatar, RepBadge, Banner, Sheet } from './components/ui.jsx'
import AuthScreen from './screens/AuthScreen.jsx'
import PartidosView from './screens/PartidosView.jsx'
import PagoScreen from './screens/PagoScreen.jsx'
import OrganizarScreen from './screens/OrganizarScreen.jsx'
import PerfilScreen from './screens/PerfilScreen.jsx'
import OnboardingScreen from './screens/OnboardingScreen.jsx'
import CrearPartidoForm from './screens/CrearPartidoForm.jsx'
import { MATCHES, ME, playerById, STATE_META, CLP } from './data/mock.js'
import { useSession } from './hooks/useSession.js'
import { useAppData } from './hooks/useAppData.js'
import { useTheme } from './hooks/useTheme.js'
import { signOut } from './services/auth.js'

const ROOT_ATTRS = {
  'data-app': '', 'data-grid': 'rounded', 'data-density': 'regular',
  'data-card': 'solid', 'data-nav': 'labels', 'data-type': 'normal',
}

export default function App() {
  const { session, ready: sessionReady, live } = useSession()
  const { theme, setTheme } = useTheme()
  const [devAuthed, setDevAuthed] = useState(false)
  const authed = live ? !!session : devAuthed
  const data = useAppData(live && !!session)

  const [nav, setNav] = useState("partidos")
  const [selectedId, setSelectedId] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [demoMatches, setDemoMatches] = useState(() => MATCHES.map(m => ({ ...m, spots: m.spots.map(s => ({ ...s })) })))
  const [pago, setPago] = useState(null)        // {matchId, spotN, pagoId}
  const [organizeId, setOrganizeId] = useState(null)
  const [take, setTake] = useState(null)         // {matchId, spotN, cupoId}
  const [inspect, setInspect] = useState(null)   // {matchId, spotN, org}
  const [crearOpen, setCrearOpen] = useState(false)
  const [actionErr, setActionErr] = useState("")
  const [toast, setToast] = useState("")
  // código de invitación: viene en ?join= y se guarda para sobrevivir el login
  const [joinCode, setJoinCode] = useState(() => {
    if (typeof window === "undefined") return null
    const c = new URL(window.location.href).searchParams.get("join") || localStorage.getItem("debarrio_join")
    if (c) localStorage.setItem("debarrio_join", c)
    return c
  })

  const matches = live ? data.matches : demoMatches
  const getMatch = (id) => matches.find(m => m.id === id)
  const findSpot = (matchId, n) => { const m = getMatch(matchId); return m && m.spots.find(s => s.n === n) }

  const updateSpot = (matchId, spotN, patch) => {
    setDemoMatches(ms => ms.map(m => m.id !== matchId ? m : ({
      ...m, spots: m.spots.map(s => s.n !== spotN ? s : ({ ...s, ...patch }))
    })))
  }

  const goDetail = (m) => { setSelectedId(m.id); setDetailOpen(true); window.scrollTo(0, 0) }
  const backToList = () => setDetailOpen(false)

  const takeNext = (m) => {
    const spot = m.spots.find(s => s.state === "libre" || s.state === "liberado")
    if (!spot) return
    setTake({ matchId: m.id, spotN: spot.n, cupoId: spot.cupoId })
  }
  const handleTapSpot = (m, spot) => {
    const player = spot.pid ? playerById(spot.pid) : null
    if (spot.state === "libre" || spot.state === "liberado") { setTake({ matchId: m.id, spotN: spot.n, cupoId: spot.cupoId }); return }
    if (player && player.me && spot.state === "pendiente") { setPago({ matchId: m.id, spotN: spot.n, pagoId: spot.pagoId }); return }
    setInspect({ matchId: m.id, spotN: spot.n, org: false })
  }
  const confirmTake = async () => {
    const { matchId, spotN, cupoId } = take
    setActionErr("")
    try { navigator.vibrate?.(30) } catch { /* no soportado */ }
    if (live) {
      try {
        const pagoId = await data.actions.tomarCupo(cupoId)
        setSelectedId(matchId)
        setTake(null)
        setPago({ matchId, spotN, pagoId })
      } catch (e) { setActionErr(e.message || "No pude tomar el cupo"); setTake(null) }
    } else {
      updateSpot(matchId, spotN, { state: "pendiente", pid: ME.id, when: "recién" })
      setSelectedId(matchId)
      setPago({ matchId, spotN })
      setTake(null)
    }
  }

  const orgConfirm = async (matchId, spotN) => {
    if (live) { const s = findSpot(matchId, spotN); if (s?.pagoId) { try { await data.actions.confirmarPago(s.pagoId) } catch (e) { setActionErr(e.message) } } }
    else updateSpot(matchId, spotN, { state: "pagado", when: "hoy" })
  }
  const orgRelease = async (matchId, spotN) => {
    if (live) { const s = findSpot(matchId, spotN); if (s?.cupoId) { try { await data.actions.liberarCupo(s.cupoId) } catch (e) { setActionErr(e.message) } } }
    else updateSpot(matchId, spotN, { state: "liberado", pid: null, when: "se liberó recién" })
  }
  const handleOrgTap = (m, spot) => {
    if (spot.state === "pendiente" || spot.state === "pagado") setInspect({ matchId: m.id, spotN: spot.n, org: true })
  }
  const openOrganize = (m) => { setOrganizeId(m.id); setNav("organizar"); window.scrollTo(0, 0) }
  const openCrear = () => {
    if (!live) { alert("Armar nuevo partido"); return }
    if (data.groups.length === 0) { setNav("organizar"); return } // sin barrio → crear en Organizar
    setCrearOpen(true)
  }

  // Unirse al barrio cuando hay código pendiente + sesión + datos listos
  useEffect(() => {
    if (!joinCode || !live || !session || !data.ready) return
    let cancelled = false
    ;(async () => {
      try {
        await data.actions.unirse(joinCode)
        if (!cancelled) setToast("¡Te uniste al barrio! 🎉")
      } catch (e) {
        if (!cancelled) setActionErr(e.message || "No pude unirte al barrio")
      } finally {
        localStorage.removeItem("debarrio_join")
        if (!cancelled) setJoinCode(null)
        const u = new URL(window.location.href)
        u.searchParams.delete("join")
        window.history.replaceState({}, "", u.pathname + u.search)
      }
    })()
    return () => { cancelled = true }
  }, [joinCode, live, session, data.ready]) // eslint-disable-line

  const invitar = async () => {
    const g = live ? data.activeGroup : null
    const code = g?.invite_code
    if (!code) { setToast("Crea tu barrio primero para invitar"); return }
    const link = `${window.location.origin}?join=${code}`
    const msg = `Te invito a "${g.nombre}" en DeBarrio. Entra y toma tu cupo:`
    try {
      if (navigator.share) await navigator.share({ title: "DeBarrio", text: msg, url: link })
      else { await navigator.clipboard.writeText(link); setToast("Link de invitación copiado ✓") }
    } catch { /* usuario canceló el share */ }
  }

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(""), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const verComprobante = async (path) => {
    try { const url = await data.actions.verComprobante(path); if (url) window.open(url, "_blank", "noopener") }
    catch (e) { setActionErr(e.message || "No pude abrir el comprobante") }
  }

  const recordarAlBarrio = async (texto) => {
    try {
      if (navigator.share) await navigator.share({ title: "DeBarrio", text: texto })
      else { await navigator.clipboard.writeText(texto); setToast("Recordatorio copiado ✓ — pégalo en el grupo") }
    } catch { /* usuario canceló el share */ }
  }

  // ---- gating ----
  if (live && !sessionReady) return <div className="app" {...ROOT_ATTRS}><Loader /></div>

  if (!authed) {
    return <div className="app" {...ROOT_ATTRS}><AuthScreen onEnter={() => setDevAuthed(true)} live={live} /></div>
  }

  if (live && !data.ready) return <div className="app" {...ROOT_ATTRS}><Loader /></div>

  // Uniéndose por link (transitorio): loader mientras se procesa el ?join=
  if (live && joinCode && data.groups.length === 0) {
    return <div className="app" {...ROOT_ATTRS}><Loader text="Uniéndote al barrio…" /></div>
  }

  const NAV = [
    { key: "partidos", label: "Partidos", icon: "ball" },
    { key: "organizar", label: "Organizar", icon: "shirt" },
    { key: "perfil", label: "Perfil", icon: "user" },
  ]
  const titleFor = { partidos: "Partidos", organizar: "Organizar", perfil: "Mi perfil" }

  const meObj = live ? (data.players.find(p => p.me) || { id: data.profile?.id, name: data.profile?.nombre || "Tú", rep: 80 }) : ME
  const meName = live ? (meObj.name || "Tú") : "Nico Soto"
  const sinBarrio = live && data.groups.length === 0
  const organizeMatch = live ? (matches.find(m => m.id === organizeId && m.miOrg) || matches.find(m => m.miOrg) || null) : getMatch(organizeId || MATCHES.find(m => m.miOrg).id)

  // Partidos sin barrio → bienvenida (unirse inline; crear redirige a Organizar)
  // key distinta de la de Organizar para que React NO reuse el estado interno (mode).
  const onboardingPartidos = (
    <OnboardingScreen key="ob-partidos" start="landing" nombre={meName}
      onUnirse={async (code) => { await data.actions.unirse(code) }}
      onElegirCrear={() => setNav("organizar")} />
  )
  // Organizar sin barrio → creación del grupo (formulario puro)
  const onboardingOrganizar = (
    <OnboardingScreen key="ob-organizar" start="crear" lockCrear nombre={meName}
      onCrear={async (form) => { await data.actions.crearGrupo(form) }} />
  )

  let main
  if (pago) {
    const m = getMatch(pago.matchId); const spot = m && m.spots.find(s => s.n === pago.spotN)
    main = m && spot ? <PagoScreen match={m} spot={spot} onBack={() => setPago(null)}
      onSent={live ? ((file) => data.actions.pagar(pago.pagoId, file)) : undefined} /> : null
  } else if (sinBarrio && nav === "organizar") {
    main = onboardingOrganizar
  } else if (sinBarrio && nav === "partidos") {
    main = onboardingPartidos
  } else if (nav === "partidos") {
    main = <PartidosView matches={matches} selectedId={selectedId} detailOpen={detailOpen}
      onSelect={goDetail} onBack={backToList} onArmar={openCrear} onInvitar={live ? invitar : undefined}
      onTapSpot={handleTapSpot} onTakeNext={takeNext}
      onPay={(m, s) => setPago({ matchId: m.id, spotN: s.n, pagoId: s.pagoId })} onOrganize={openOrganize} />
  } else if (nav === "organizar") {
    main = organizeMatch
      ? <OrganizarScreen match={organizeMatch} onConfirm={orgConfirm} onRelease={orgRelease} onTapSpot={handleOrgTap} />
      : <div className="section" style={{ alignItems: "center", textAlign: "center", paddingTop: 32 }}>
          <div className="brand-mark" style={{ width: 52, height: 52, borderRadius: 15 }}><Icon name="shirt" size={26} /></div>
          <h2 className="h-lg">Aún no organizas partidos</h2>
          <p className="muted">Crea una pichanga y administra la caja desde aquí.</p>
          <button className="btn btn-accent btn-lg" onClick={openCrear}><Icon name="plus" size={19} /> Armar partido</button>
        </div>
  } else {
    main = <PerfilScreen live={live} players={data.players} me={meObj}
      groupName={live ? data.activeGroup?.nombre : "Los del barrio"}
      theme={theme} onTheme={setTheme}
      email={live ? data.profile?.email : null}
      posicion={live ? data.profile?.posicion : null}
      onSavePosicion={live ? (async (pos) => { await data.actions.actualizarPosicion(pos); setToast("Posición guardada ✓") }) : undefined}
      onRecordar={recordarAlBarrio}
      onSaveName={live ? (async (nombre) => { await data.actions.actualizarNombre(nombre); setToast("Nombre actualizado ✓") }) : undefined}
      onLogout={() => { if (live) signOut(); else setDevAuthed(false); setNav("partidos"); setDetailOpen(false) }} />
  }

  const navClick = (k) => { setPago(null); setDetailOpen(false); setNav(k); window.scrollTo(0, 0) }

  return (
    <div className="app" {...ROOT_ATTRS}>
      {actionErr && (
        <div role="alert" style={{ position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 80, maxWidth: 420, width: "92%" }}>
          <div className="banner banner-warn" style={{ boxShadow: "var(--sh-lg)" }} onClick={() => setActionErr("")}>
            <Icon name="alert" size={18} stroke={2.2} style={{ flex: "0 0 auto" }} /><div>{actionErr}</div>
          </div>
        </div>
      )}
      {toast && (
        <div role="status" style={{ position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 80, maxWidth: 420, width: "92%" }}>
          <div className="banner banner-ok" style={{ boxShadow: "var(--sh-lg)" }} onClick={() => setToast("")}>
            <Icon name="checkCircle" size={18} stroke={2.2} style={{ flex: "0 0 auto" }} /><div>{toast}</div>
          </div>
        </div>
      )}
      <div className="shell">
        {/* Sidebar desktop */}
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark"><Icon name="ball" size={22} /></div>
            <span className="brand-name">De<b>Barrio</b></span>
          </div>
          {NAV.map(n => (
            <button key={n.key} className="side-link" aria-current={nav === n.key && !pago ? "page" : undefined} onClick={() => navClick(n.key)}>
              <Icon name={n.icon} size={21} /> {n.label}
            </button>
          ))}
          <div className="side-foot">
            <hr className="divider" />
            <button className="side-link" onClick={openCrear}><Icon name="plus" size={21} /> Armar partido</button>
            {live && <button className="side-link" onClick={invitar}><Icon name="share" size={21} /> Invitar al barrio</button>}
            <div className="row" style={{ gap: 10, padding: "10px 14px" }}>
              <Avatar player={meObj} size={36} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 750, fontSize: 14 }}>{meName}</div>
                <RepBadge score={meObj.rep} small showScore />
              </div>
            </div>
          </div>
        </aside>

        <div className="content">
          <header className="topbar mobile-only only-mobile">
            <div className="brand">
              <div className="brand-mark" style={{ width: 32, height: 32, borderRadius: 9 }}><Icon name="ball" size={18} /></div>
              <span className="brand-name" style={{ fontSize: 17 }}>De<b>Barrio</b></span>
            </div>
            <div className="topbar-spacer" />
            <button className="icon-btn" aria-label="Notificaciones"><Icon name="bell" size={20} /></button>
          </header>

          <div className="deskbar">
            <h2 className="h-lg" style={{ margin: 0 }}>{pago ? "Pagar cupo" : titleFor[nav]}</h2>
          </div>

          <main className="content-pad with-bottomnav">{main}</main>
        </div>
      </div>

      {!pago && (
        <nav className="bottomnav only-mobile" aria-label="Navegación principal">
          {NAV.map(n => (
            <button key={n.key} className="nav-item" aria-current={nav === n.key ? "page" : undefined} onClick={() => navClick(n.key)}>
              <span className="nav-dot"><Icon name={n.icon} size={22} /></span>
              <span className="lbl">{n.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Sheet: crear partido (live) */}
      <Sheet open={crearOpen} onClose={() => setCrearOpen(false)} labelledby="crear-t">
        <CrearPartidoForm onClose={() => setCrearOpen(false)}
          onCrear={async (form) => { await data.actions.crearPartido(form); setCrearOpen(false); setNav("partidos") }} />
      </Sheet>

      {/* Sheet: tomar cupo */}
      <Sheet open={!!take} onClose={() => setTake(null)} labelledby="take-t">
        {take && (() => {
          const m = getMatch(take.matchId)
          if (!m) return null
          return (
            <div className="section">
              <div className="row" style={{ gap: 14 }}>
                <span className="legend-swatch" style={{ width: 56, height: 56, borderColor: "var(--verde-500)", color: "var(--verde-700)" }}>
                  <span className="num" style={{ fontSize: 22, fontWeight: 800 }}>{String(take.spotN).padStart(2, "0")}</span>
                </span>
                <div>
                  <h2 id="take-t" className="h-lg" style={{ margin: 0 }}>Tomar el cupo {String(take.spotN).padStart(2, "0")}</h2>
                  <p className="muted" style={{ margin: "2px 0 0" }}>{m.titulo} · {m.dia} {m.hora}</p>
                </div>
              </div>
              <Banner kind="info" icon="clock">Reservamos este cupo a tu nombre. Quedará <b>pendiente</b> hasta que pagues por transferencia y el organizador confirme.</Banner>
              <div className="row" style={{ justifyContent: "space-between", padding: "0 4px" }}>
                <span className="lbl">Total a pagar</span>
                <span className="num" style={{ fontWeight: 800, fontSize: "var(--fs-xl)", color: "var(--verde-700)" }}>{CLP(m.precio)}</span>
              </div>
              <button className="btn btn-primary btn-lg btn-block" onClick={confirmTake}><Icon name="check" size={20} /> Reservar y pagar</button>
              <button className="btn btn-quiet btn-block" onClick={() => setTake(null)}>Mejor no</button>
            </div>
          )
        })()}
      </Sheet>

      {/* Sheet: inspeccionar cupo */}
      <Sheet open={!!inspect} onClose={() => setInspect(null)} labelledby="insp-t">
        {inspect && (() => {
          const m = getMatch(inspect.matchId); const s = m && m.spots.find(x => x.n === inspect.spotN)
          if (!s) return null
          const p = s.pid ? playerById(s.pid) : null; const meta = STATE_META[s.state]
          return (
            <div className="section">
              <div className="row" style={{ gap: 14 }}>
                {p ? <Avatar player={p} size={56} /> : <span className={"legend-swatch s-" + s.state} style={{ width: 56, height: 56 }}><Icon name={meta.icon} size={26} /></span>}
                <div style={{ flex: 1 }}>
                  <h2 id="insp-t" className="h-lg" style={{ margin: 0 }}>Cupo {String(s.n).padStart(2, "0")} · {p ? p.name : meta.label}</h2>
                  <div className="row" style={{ gap: 8, marginTop: 4 }}>
                    <span className={"tag tag-" + (s.state === "pagado" ? "verde" : s.state === "pendiente" ? "warn" : "info")}><Icon name={meta.icon} size={12} /> {meta.label}</span>
                    {s.when && <span className="muted-2" style={{ fontSize: 13 }}>{s.when}</span>}
                  </div>
                </div>
              </div>
              {p && <div className="card card-pad row" style={{ justifyContent: "space-between" }}><span className="muted">Reputación de pago</span><RepBadge score={p.rep} small /></div>}
              {inspect.org ? (
                s.state === "pendiente" ? (
                  <>
                    {live && (s.comprobante
                      ? <button className="btn btn-soft btn-block" onClick={() => verComprobante(s.comprobante)}><Icon name="receipt" size={18} /> Ver comprobante</button>
                      : <div className="banner banner-info"><Icon name="clock" size={18} stroke={2.2} style={{ flex: "0 0 auto" }} /><div>El jugador aún no sube el comprobante.</div></div>)}
                    <button className="btn btn-primary btn-lg btn-block" onClick={() => { orgConfirm(m.id, s.n); setInspect(null) }}><Icon name="check" size={20} /> Confirmar pago</button>
                    <button className="btn btn-ghost btn-block" onClick={() => { orgRelease(m.id, s.n); setInspect(null) }}><Icon name="undo" size={18} /> Liberar cupo</button>
                  </>
                ) : (
                  <button className="btn btn-ghost btn-block" onClick={() => { orgRelease(m.id, s.n); setInspect(null) }}><Icon name="undo" size={18} /> Liberar cupo</button>
                )
              ) : (
                <button className="btn btn-quiet btn-block" onClick={() => setInspect(null)}>Cerrar</button>
              )}
            </div>
          )
        })()}
      </Sheet>
    </div>
  )
}

function Loader({ text }) {
  // Con texto → loader simple (transiciones cortas, p.ej. uniéndose por link).
  if (text) return <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", color: "var(--tinta-50)" }}>{text}</div>
  // Sin texto → skeleton de la pantalla principal.
  return (
    <div className="content"><main className="content-pad with-bottomnav">
      <div className="section">
        <div className="sk sk-line" style={{ width: "55%", height: 26 }} />
        <div className="sk sk-line" style={{ width: "35%" }} />
        <div className="row" style={{ gap: 8, marginTop: 4 }}>
          <div className="sk" style={{ width: 92, height: 34, borderRadius: 999 }} />
          <div className="sk" style={{ width: 92, height: 34, borderRadius: 999 }} />
          <div className="sk" style={{ width: 92, height: 34, borderRadius: 999 }} />
        </div>
        <div className="sk sk-card" />
        <div className="sk sk-card" />
        <div className="sk sk-card" />
      </div>
    </main></div>
  )
}
