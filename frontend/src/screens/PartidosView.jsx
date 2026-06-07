import React, { useState } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery.js'
import { MatchCard } from '../components/ui.jsx'
import MatchDetail from './MatchDetail.jsx'
import { playerById } from '../data/mock.js'
import Icon from '../components/Icon.jsx'
// PartidosView — lista (móvil) + split lista/detalle (desktop)

export default function PartidosView({ matches, selectedId, onSelect, detailOpen, onTapSpot, onTakeNext, onBack, onPay, onOrganize, onArmar, onInvitar }) {
  const isDesktop = useMediaQuery("(min-width:1024px)")
  const [filter, setFilter] = useState("todos")
  const selected = matches.find(m => m.id === selectedId) || matches[0]

  const filtered = matches.filter(m => {
    if (filter === "miorg") return m.miOrg
    if (filter === "anotado") return m.spots.some(s => s.pid && playerById(s.pid).me)
    return true
  })

  const List = (
    <div className="section">
      <div className="page-head" style={{ marginBottom: 0 }}>
        <div>
          <div className="eyebrow">Tu barrio · Santiago</div>
          <h1 className="h-xl">Próximas pichangas</h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {onInvitar && <button className="btn btn-soft" onClick={onInvitar}><Icon name="share" size={18} /><span className="only-desktop"> Invitar</span></button>}
          <button className="btn btn-soft only-desktop" onClick={onArmar}><Icon name="plus" size={18} /> Armar partido</button>
        </div>
      </div>
      <div className="chip-row" role="tablist" aria-label="Filtro de partidos">
        {[["todos", "Todas"], ["anotado", "Donde voy"], ["miorg", "Que organizo"]].map(([k, l]) => (
          <button key={k} className="chip" aria-pressed={filter === k} role="tab" onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="card card-pad muted" style={{ textAlign: "center" }}>
          <p style={{ margin: "0 0 12px" }}>Todavía no hay pichangas. ¡Arma la primera!</p>
          {onArmar && <button className="btn btn-primary" onClick={onArmar}><Icon name="plus" size={18} /> Armar partido</button>}
        </div>
      ) : (
        <div className={isDesktop ? "stack" : "list-grid"} style={{ display: "grid", gap: "var(--s-4)" }}>
          {filtered.map(m => (
            <MatchCard key={m.id} match={m} onOpen={onSelect} active={isDesktop && m.id === selected.id} />
          ))}
        </div>
      )}
    </div>
  )

  // Desktop: split list + detail. Mobile: list OR detail.
  if (isDesktop) {
    return (
      <div className="split">
        <div className="split-list">{List}</div>
        {selected && <div><MatchDetail match={selected} embedded onTapSpot={onTapSpot} onTakeNext={onTakeNext} onPay={onPay} onOrganize={onOrganize} /></div>}
      </div>
    )
  }
  if (detailOpen && selected) {
    return <MatchDetail match={selected} onTapSpot={onTapSpot} onTakeNext={onTakeNext} onBack={onBack} onPay={onPay} onOrganize={onOrganize} />
  }
  return List
}
