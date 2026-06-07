import React, { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { Avatar, RepBadge, ProgressBar, SpotGrid, StateLegend, Banner } from '../components/ui.jsx'
import { playerById, CLP } from '../data/mock.js'
// OrganizarScreen — caja + confirmar/liberar pagos (modo organizador)

export default function OrganizarScreen({ match, onConfirm, onRelease, onTapSpot }) {
  const [tab, setTab] = useState("confirmar")
  if (!match) return null
  const pagados = match.spots.filter(s => s.state === "pagado")
  const pend = match.spots.filter(s => s.state === "pendiente")
  const recaudado = pagados.length * match.precio
  const porCobrar = pend.length * match.precio
  const esperado = match.total * match.precio

  return (
    <div className="section">
      <div className="page-head" style={{ marginBottom: 0 }}>
        <div>
          <div className="eyebrow"><Icon name="shirt" size={13} style={{ verticalAlign: "-2px" }} /> Modo organizador</div>
          <h1 className="h-xl">{match.titulo}</h1>
          <p className="muted" style={{ margin: "2px 0 0" }}>{match.dia} · {match.hora} · {match.cancha}</p>
        </div>
        <button className="btn btn-accent only-desktop" onClick={() => alert("Compartiría link por WhatsApp")}><Icon name="share" size={18} /> Compartir link</button>
      </div>

      {/* caja */}
      <div className="grid-3" style={{ gap: "var(--s-3)" }}>
        <div className="stat" style={{ background: "var(--verde-600)", borderColor: "var(--verde-700)", color: "#fff" }}>
          <div className="v num">{CLP(recaudado)}</div>
          <div className="k" style={{ color: "rgba(255,255,255,.85)" }}>En caja · {pagados.length} pagados</div>
        </div>
        <div className="stat">
          <div className="v num" style={{ color: "var(--st-pend-fg)" }}>{CLP(porCobrar)}</div>
          <div className="k">Por cobrar · {pend.length} pend.</div>
        </div>
        <div className="stat">
          <div className="v num">{CLP(esperado)}</div>
          <div className="k">Total esperado</div>
        </div>
      </div>

      <div className="card card-pad"><ProgressBar spots={match.spots} total={match.total} /></div>

      {/* tabs */}
      <div className="chip-row" role="tablist">
        {[["confirmar", "Por confirmar (" + pend.length + ")"], ["cupos", "Todos los cupos"]].map(([k, l]) => (
          <button key={k} className="chip" aria-pressed={tab === k} role="tab" onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === "confirmar" ? (
        <div className="section" style={{ gap: 10 }}>
          {pend.length === 0 && <Banner kind="ok" icon="checkCircle"><b>¡Al día!</b> No hay pagos pendientes por confirmar.</Banner>}
          {pend.map(s => {
            const p = playerById(s.pid)
            return (
              <div className="pay-row" key={s.n}>
                <Avatar player={p} size={42} />
                <div className="grow">
                  <div className="pay-name">
                    <span className="num" style={{ color: "var(--tinta-50)" }}>#{String(s.n).padStart(2, "0")}</span>
                    <span className="pay-name-text">{p ? p.name : "—"}</span>
                    <RepBadge score={p ? p.rep : 50} small showScore={false} />
                  </div>
                  <div className="pay-meta">Reservó {s.when || "recién"} · {CLP(match.precio)}</div>
                </div>
                <div className="pay-actions">
                  <button className="btn btn-ghost" style={{ minHeight: 42, padding: "0 12px" }} onClick={() => onRelease(match.id, s.n)} aria-label="Liberar cupo">
                    <Icon name="undo" size={17} /><span className="only-desktop">Liberar</span>
                  </button>
                  <button className="btn btn-primary" style={{ minHeight: 42, padding: "0 14px" }} onClick={() => onConfirm(match.id, s.n)}>
                    <Icon name="check" size={18} /> Confirmar
                  </button>
                </div>
              </div>
            )
          })}
          <hr className="divider" />
          <div className="muted-2" style={{ fontSize: 13, fontWeight: 650, textTransform: "uppercase", letterSpacing: ".03em" }}>Ya pagados ({pagados.length})</div>
          {pagados.map(s => {
            const p = playerById(s.pid)
            return (
              <div className="pay-row is-paid" key={s.n}>
                <Avatar player={p} size={36} />
                <div className="grow">
                  <div className="pay-name" style={{ fontSize: "var(--fs-sm)" }}><span className="num" style={{ color: "var(--tinta-50)" }}>#{String(s.n).padStart(2, "0")}</span> <span className="pay-name-text">{p ? p.name : "—"}</span></div>
                </div>
                <span className="tag tag-verde"><Icon name="check" size={13} /> Pagado</span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card card-pad grid-wrap">
          <SpotGrid spots={match.spots} onTapSpot={(spot) => onTapSpot(match, spot)} />
          <hr className="divider" />
          <StateLegend />
          <p className="muted-2" style={{ fontSize: 13, margin: 0 }}>Toca un cupo pendiente para confirmar o liberar.</p>
        </div>
      )}
    </div>
  )
}
