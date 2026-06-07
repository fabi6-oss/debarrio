import React from 'react'
import Icon from '../components/Icon.jsx'
import { Avatar, RepBadge, ProgressBar, CajaBar, SpotGrid, StateLegend } from '../components/ui.jsx'
import { playerById, STATE_META, CLP } from '../data/mock.js'
// MatchDetail — panel de detalle reutilizable (móvil pantalla completa / embedded en split desktop)

export default function MatchDetail({ match, onTapSpot, onTakeNext, onBack, onPay, onOrganize, embedded }) {
  const org = playerById(match.organizador)
  const mine = match.spots.find(s => s.pid && playerById(s.pid) && playerById(s.pid).me)
  const libres = match.spots.filter(s => s.state === "libre" || s.state === "liberado").length
  return (
    <div className="section" style={{ gap: "var(--s-5)" }}>
      {!embedded && (
        <button className="btn btn-quiet only-mobile" style={{ alignSelf: "flex-start", paddingLeft: 8 }} onClick={onBack}>
          <Icon name="chevL" size={18} /> Partidos
        </button>
      )}

      {/* encabezado */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{
          padding: "var(--s-5)", color: "#fff", position: "relative",
          background: "linear-gradient(155deg, var(--verde-600), var(--verde-700))",
        }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: .12, background: "repeating-linear-gradient(125deg,#fff 0 2px,transparent 2px 52px)" }} />
          <div style={{ position: "relative" }}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <span className="tag" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}><Icon name="ball" size={12} /> {match.formato}</span>
              {match.miOrg && <span className="tag tag-naranjo"><Icon name="shirt" size={12} /> Organizas tú</span>}
            </div>
            <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-.02em", margin: "12px 0 10px", lineHeight: 1.08 }}>{match.titulo}</h1>
            <div className="row row-wrap" style={{ gap: "var(--s-4)", fontSize: "var(--fs-sm)", color: "rgba(255,255,255,.92)", fontWeight: 600 }}>
              <span className="row" style={{ gap: 6 }}><Icon name="calendar" size={15} /> {match.dia}</span>
              <span className="row" style={{ gap: 6 }}><Icon name="clock" size={15} /> {match.hora} · {match.dur}</span>
              <span className="row" style={{ gap: 6 }}><Icon name="pin" size={15} /> {match.cancha}, {match.comuna}</span>
            </div>
          </div>
        </div>
        <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: "var(--s-4)" }}>
          <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div className="row" style={{ gap: 10 }}>
              <Avatar player={org} size={42} />
              <div>
                <div style={{ fontSize: 12, color: "var(--tinta-50)", fontWeight: 600 }}>Organiza</div>
                <div style={{ fontWeight: 750 }}>{org.name}</div>
              </div>
            </div>
            <RepBadge score={org.rep} small />
          </div>
          <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--tinta-50)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".03em" }}>Valor por cupo</div>
              <div className="num" style={{ fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-.02em", color: "var(--verde-700)" }}>{CLP(match.precio)}</div>
            </div>
            <button className="btn btn-ghost" onClick={() => alert("Abriría WhatsApp del organizador")}>
              <Icon name="whatsapp" size={18} /> Contactar
            </button>
          </div>
        </div>
      </div>

      {/* AVISO DEL ORGANIZADOR — notificación importante, bien visible y arriba */}
      {match.nota && (
        <div role="status" style={{
          display: "flex", gap: "var(--s-3)", padding: "var(--s-4)", borderRadius: "var(--r-lg)",
          background: "var(--naranjo-50)", border: "1.5px solid var(--naranjo-200)",
          boxShadow: "var(--sh-sm)", alignItems: "flex-start",
        }}>
          <span style={{ width: 40, height: 40, borderRadius: 11, background: "var(--naranjo-500)", color: "#fff", display: "grid", placeItems: "center", flex: "0 0 auto", boxShadow: "0 4px 10px rgba(242,100,26,.35)" }}>
            <Icon name="bell" size={21} stroke={2.3} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 3 }}>Aviso del organizador</div>
            <div style={{ fontWeight: 600, color: "var(--tinta)", lineHeight: 1.45, fontSize: "var(--fs-md)" }}>{match.nota}</div>
          </div>
        </div>
      )}

      {/* caja del partido — cuánto se ha juntado para cubrir la cancha */}
      <div className="card card-pad">
        <CajaBar spots={match.spots} total={match.total} cuota={match.precio} />
      </div>

      {/* progreso de cupos */}
      <div className="card card-pad">
        <ProgressBar spots={match.spots} total={match.total} />
      </div>

      {/* lista de cupos */}
      <div className="card card-pad grid-wrap">
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <h2 className="h-lg"><Icon name="ball" size={20} style={{ verticalAlign: "-3px", color: "var(--verde-600)" }} /> Lista de cupos</h2>
          <span className="tag tag-muted num">{libres} libres</span>
        </div>
        <SpotGrid spots={match.spots} onTapSpot={(spot) => onTapSpot(match, spot)} />
        <hr className="divider" />
        <StateLegend />
      </div>

      {/* acciones */}
      <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 12, position: embedded ? "static" : "sticky", bottom: 0 }}>
        {mine ? (
          <>
            <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <span className="row" style={{ gap: 8, fontWeight: 700 }}>
                <span className={"legend-swatch s-" + mine.state} style={{ width: 30, height: 30 }}><Icon name={STATE_META[mine.state].icon} size={15} /></span>
                Tienes el cupo {String(mine.n).padStart(2, "0")} · {STATE_META[mine.state].label}
              </span>
            </div>
            {mine.state === "pendiente"
              ? <button className="btn btn-accent btn-lg btn-block" onClick={() => onPay(match, mine)}><Icon name="upload" size={19} /> Subir comprobante de pago</button>
              : <button className="btn btn-soft btn-lg btn-block" disabled><Icon name="checkCircle" size={19} /> Cupo confirmado — ¡nos vemos en la cancha!</button>}
          </>
        ) : (
          <button className="btn btn-primary btn-lg btn-block" onClick={() => onTakeNext(match)} disabled={libres === 0}>
            <Icon name="plus" size={20} /> {libres === 0 ? "No quedan cupos" : "Tomar mi cupo · " + CLP(match.precio)}
          </button>
        )}
        {match.miOrg && (
          <button className="btn btn-ghost btn-block" onClick={() => onOrganize(match)}>
            <Icon name="shirt" size={18} /> Abrir panel de organizador
          </button>
        )}
      </div>
    </div>
  )
}
