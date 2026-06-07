import React, { useState, useEffect } from 'react'
import Icon from './Icon.jsx'
import { avatarColor, initials, repTier, STATE_META, playerById, CLP } from '../data/mock.js'
// ui.jsx — bloques reutilizables (portado del prototipo Claude Design)

/* ---------- Avatar ---------- */
export function Avatar({ player, size = 36, ring }) {
  const color = player ? avatarColor(player.id) : "var(--linea-fuerte)"
  return (
    <div className="av" style={{
      width: size, height: size, background: color,
      fontSize: Math.round(size * 0.4),
      boxShadow: ring ? "0 0 0 2px #fff, 0 0 0 4px " + color : "none",
    }} aria-hidden="true">
      {player ? initials(player.name.replace("Tú (", "").replace(")", "")) : "?"}
    </div>
  )
}

/* ---------- Badge de reputación ---------- */
export function RepBadge({ score, small, showScore = true }) {
  const t = repTier(score)
  return (
    <span className={"rep" + (small ? " rep-sm" : "")} title={t.label + " · " + score + "/100"}>
      <span className="rep-dot" style={{ background: t.color }}>
        <Icon name={t.icon} size={small ? 11 : 13} stroke={2.4} />
      </span>
      <span>{t.label}{showScore && <span className="muted-2 num" style={{ fontWeight: 600 }}> · {score}</span>}</span>
    </span>
  )
}

/* ---------- Barra de progreso "X de Y pagados" ---------- */
export function ProgressBar({ spots, total, showLegend = true }) {
  const pagados = spots.filter(s => s.state === "pagado").length
  const pend = spots.filter(s => s.state === "pendiente").length
  const pct = Math.round((pagados / total) * 100)
  return (
    <div className="prog">
      <div className="prog-head">
        <div className="prog-count num"><b>{pagados}</b> de {total} pagados</div>
        <div className="prog-pct num">{pct}%</div>
      </div>
      <div className="prog-track" role="img" aria-label={pagados + " pagados, " + pend + " pendientes, de " + total}>
        <span className="prog-seg-pago" style={{ width: (pagados / total * 100) + "%" }} />
        <span className="prog-seg-pend" style={{ width: (pend / total * 100) + "%" }} />
      </div>
      {showLegend && (
        <div className="prog-legend num">
          <span><i style={{ background: "var(--verde-600)" }} />{pagados} pagados</span>
          <span><i style={{ background: "var(--st-pend-solid)" }} />{pend} pendientes</span>
          <span><i style={{ background: "var(--lienzo-2)", border: "1px solid var(--linea)" }} />{total - pagados - pend} libres</span>
        </div>
      )}
    </div>
  )
}

/* ---------- Barra de caja del partido (plata recaudada vs meta) ---------- */
export function CajaBar({ spots, total, cuota }) {
  const pagados = spots.filter(s => s.state === "pagado").length
  const recaudado = pagados * cuota
  const meta = total * cuota
  const pct = meta > 0 ? Math.round((recaudado / meta) * 100) : 0
  const faltan = total - pagados
  const cubierta = pct >= 100
  return (
    <div className="caja">
      <div className="caja-top">
        <span className="row" style={{ gap: 8, fontWeight: 750 }}>
          <Icon name="cash" size={18} style={{ color: cubierta ? "var(--verde-600)" : "var(--naranjo-500)" }} />
          Caja del partido
        </span>
        <span className="num" style={{ fontWeight: 800, color: cubierta ? "var(--verde-700)" : "var(--tinta)" }}>{pct}%</span>
      </div>
      <div className="caja-track" role="img" aria-label={"Cancha cubierta al " + pct + " por ciento"}>
        <span className="caja-fill" style={{ width: Math.min(pct, 100) + "%" }} />
      </div>
      <div className="caja-foot">
        <span className="num"><b>{CLP(recaudado)}</b> <span className="muted-2">de {CLP(meta)}</span></span>
        <span className={cubierta ? "tag tag-verde" : "muted-2 num"} style={{ fontSize: "var(--fs-sm)" }}>
          {cubierta ? "¡Cancha cubierta!" : faltan + (faltan === 1 ? " cupo por pagar" : " cupos por pagar")}
        </span>
      </div>
    </div>
  )
}

/* ---------- Leyenda de estados ---------- */
export function StateLegend() {
  return (
    <div className="legend">
      {["libre", "pendiente", "pagado", "liberado"].map(k => {
        const m = STATE_META[k]
        return (
          <div className="legend-item" key={k}>
            <span className={"legend-swatch s-" + k}><Icon name={m.icon} size={14} stroke={2.4} /></span>
            <span><b style={{ color: "var(--tinta)" }}>{m.label}</b> · {m.desc}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Tile de cupo ---------- */
export function Spot({ spot, onTap, isStatic }) {
  const m = STATE_META[spot.state]
  const player = spot.pid ? playerById(spot.pid) : null
  const mine = player && player.me
  const cls = ["spot", "s-" + spot.state, mine ? "s-mine" : "", isStatic ? "is-static" : ""].join(" ")
  const label =
    spot.state === "libre" ? "Cupo " + spot.n + " libre, tomar" :
    spot.state === "liberado" ? "Cupo " + spot.n + " liberado, tomar" :
    "Cupo " + spot.n + ", " + m.label + (player ? ", " + player.name : "")
  return (
    <button className={cls} onClick={() => onTap && onTap(spot)}
      aria-label={label} tabIndex={isStatic ? -1 : 0}>
      <Icon className="spot-ico" name={m.icon} size={14} stroke={2.6} />
      <span className="spot-num num">{String(spot.n).padStart(2, "0")}</span>
      {(spot.state === "libre") && <span className="spot-lbl">Libre</span>}
      {(spot.state === "liberado") && <span className="spot-lbl">Libre*</span>}
      {(spot.state === "pendiente" || spot.state === "pagado") && player && (
        <span className="spot-who">{player.me ? "Tú" : player.name.split(" ")[0]}</span>
      )}
    </button>
  )
}

/* ---------- Lista de cupos (grilla) ---------- */
export function SpotGrid({ spots, onTapSpot, isStatic }) {
  return (
    <div className="spot-grid" role="list">
      {spots.map(s => <Spot key={s.n} spot={s} onTap={onTapSpot} isStatic={isStatic} />)}
    </div>
  )
}

/* ---------- Card de partido ---------- */
export function MatchCard({ match, onOpen, active }) {
  const [dnum, dmon] = (() => {
    const parts = match.dia.split(" ") // "Jue 12 jun"
    return [parts[1], parts[2]]
  })()
  const pagados = match.spots.filter(s => s.state === "pagado").length
  return (
    <button className="match-card" onClick={() => onOpen(match)} aria-current={active ? "true" : undefined}>
      <div className="mc-top">
        <div className="mc-date">
          <div className="d num">{dnum}</div>
          <div className="m">{dmon}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="mc-title">{match.titulo}</div>
          <div className="mc-sub">
            <Icon name="clock" size={14} /> {match.hora}
            <span aria-hidden="true">·</span>
            <Icon name="pin" size={14} /> {match.comuna}
          </div>
        </div>
        {match.miOrg && <span className="tag tag-naranjo only-desktop"><Icon name="shirt" size={12} /> Organizas</span>}
      </div>
      <div className="mc-body">
        <div className="mc-meta">
          <span><Icon name="ball" size={15} /> {match.formato}</span>
          <span><b className="num">{CLP(match.precio)}</b> / cupo</span>
        </div>
        <ProgressBar spots={match.spots} total={match.total} showLegend={false} />
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="muted-2" style={{ fontSize: "var(--fs-sm)" }}>
            {match.total - pagados} cupos por pagar
          </span>
          <span className="tag tag-verde">Ver lista <Icon name="chevR" size={13} /></span>
        </div>
      </div>
    </button>
  )
}

/* ---------- Copy row (datos transferencia) ---------- */
export function CopyRow({ k, v, mono }) {
  const [done, setDone] = useState(false)
  const copy = () => {
    try { navigator.clipboard && navigator.clipboard.writeText(String(v)) } catch (e) {}
    setDone(true); setTimeout(() => setDone(false), 1400)
  }
  return (
    <div className="copy-row">
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="k">{k}</div>
        <div className={"v" + (mono ? " num" : "")} style={{ wordBreak: "break-word" }}>{v}</div>
      </div>
      <button className="btn btn-soft" style={{ minHeight: 40, padding: "0 14px" }} onClick={copy} aria-label={"Copiar " + k}>
        <Icon name={done ? "check" : "copy"} size={16} /> {done ? "Listo" : "Copiar"}
      </button>
    </div>
  )
}

/* ---------- Banner ---------- */
export function Banner({ kind = "info", icon, children }) {
  const ic = icon || (kind === "warn" ? "alert" : kind === "ok" ? "checkCircle" : "bell")
  return (
    <div className={"banner banner-" + kind}>
      <Icon name={ic} size={18} stroke={2.2} style={{ flex: "0 0 auto", marginTop: 1 }} />
      <div>{children}</div>
    </div>
  )
}

/* ---------- Sheet (modal inferior móvil / centrado desktop) ---------- */
export function Sheet({ open, onClose, children, labelledby }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="scrim" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby={labelledby}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-grab" />
        {children}
      </div>
    </div>
  )
}
