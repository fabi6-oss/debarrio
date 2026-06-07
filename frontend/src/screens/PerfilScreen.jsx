import React, { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { Avatar, RepBadge, Banner } from '../components/ui.jsx'
import { PLAYERS, ME, repTier, CLP } from '../data/mock.js'
// PerfilScreen — reputación + ranking / deudores. En live usa datos reales (props); si no, mock.

const POSICIONES = ['Arquero', 'Defensa', 'Mediocampo', 'Delantero']

export default function PerfilScreen({ onLogout, live, players, me: meProp, onSaveName, onRecordar, groupName, theme, onTheme, email, posicion, onSavePosicion }) {
  const [tab, setTab] = useState("ranking")
  const [editing, setEditing] = useState(false)
  const [nameDraft, setNameDraft] = useState("")
  const [savingName, setSavingName] = useState(false)
  const [nameErr, setNameErr] = useState("")
  const allPlayers = live ? (players || []) : PLAYERS
  const me = live ? (meProp || { name: 'Tú', rep: 80, jugados: 0, pagados: 0, debe: 0 }) : ME
  const t = repTier(me.rep)
  const ranking = [...allPlayers].sort((a, b) => b.rep - a.rep)
  const deudores = allPlayers.filter(p => p.debe > 0).sort((a, b) => b.debe - a.debe)
  const totalDeuda = deudores.reduce((s, p) => s + p.debe, 0)
  const meName = live ? (me.name || 'Tú') : 'Nico Soto'
  const meSub = live ? (email || '') : '@nico · Ñuñoa'

  const armarRecordatorio = () => {
    const lineas = deudores.map((p) => `• ${p.name} — ${CLP(p.debe)}`).join('\n')
    const titulo = groupName ? `del barrio "${groupName}"` : 'del barrio'
    const texto = `💸 Recordatorio ${titulo}\n\nFaltan estos pagos para cubrir la cancha:\n${lineas}\n\nTotal pendiente: ${CLP(totalDeuda)}\n¡Transfieran y suban el comprobante en DeBarrio! 🙌`
    onRecordar(texto)
  }

  const startEdit = () => { setNameDraft(meName); setNameErr(""); setEditing(true) }
  const saveName = async () => {
    const n = nameDraft.trim()
    if (!n) { setEditing(false); return }
    if (n === meName) { setEditing(false); return }
    setSavingName(true); setNameErr("")
    try { await onSaveName(n); setEditing(false) }
    catch (e) { setNameErr(e.message || "No pude cambiar el nombre") }
    finally { setSavingName(false) }
  }

  return (
    <div className="section">
      {/* tarjeta perfil */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "var(--s-5)", color: "#fff", position: "relative", background: "linear-gradient(155deg, var(--verde-600), var(--verde-700))" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: .12, background: "repeating-linear-gradient(125deg,#fff 0 2px,transparent 2px 52px)" }} />
          <div className="row" style={{ gap: 16, position: "relative", flexWrap: "wrap" }}>
            <Avatar player={me.id != null ? me : ME} size={68} ring />
            <div style={{ flex: 1, minWidth: 160 }}>
              {editing ? (
                <div style={{ display: "grid", gap: 6 }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <input className="input" value={nameDraft} autoFocus maxLength={40}
                      onChange={(e) => setNameDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditing(false) }}
                      style={{ flex: 1, minWidth: 140, color: "var(--tinta-90)" }} />
                    <button className="btn btn-soft" style={{ minHeight: 40 }} onClick={saveName} disabled={savingName}>
                      <Icon name="check" size={17} /> {savingName ? "…" : "Guardar"}
                    </button>
                    <button className="icon-btn" aria-label="Cancelar" onClick={() => setEditing(false)} style={{ color: "#fff" }}><Icon name="x" size={18} /></button>
                  </div>
                  {nameErr
                    ? <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "rgba(0,0,0,.22)", borderRadius: 8, padding: "6px 10px" }}>{nameErr}</div>
                    : <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.85)" }}>Ojo: tu nombre solo se puede cambiar una vez al mes.</div>}
                </div>
              ) : (
                <div className="row" style={{ gap: 8 }}>
                  <h1 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, margin: 0 }}>{meName}</h1>
                  {live && onSaveName && (
                    <button className="icon-btn" aria-label="Editar nombre" onClick={startEdit} style={{ color: "#fff" }}><Icon name="pencil" size={18} /></button>
                  )}
                </div>
              )}
              {meSub && <div style={{ color: "rgba(255,255,255,.85)", fontWeight: 600 }}>{meSub}</div>}
            </div>
            <span className="rep" style={{ background: "rgba(255,255,255,.16)", color: "#fff" }}>
              <span className="rep-dot" style={{ background: t.color }}><Icon name={t.icon} size={13} /></span>
              {t.label} · <span className="num">{me.rep}</span>
            </span>
          </div>
        </div>
        <div className="grid-3" style={{ gap: 0 }}>
          {[[me.jugados, "Partidos"], [me.pagados, "Pagados al día"], [live ? (me.jugados - me.pagados) : "7", live ? "Por pagar" : "Racha 🔥"]].map(([v, k], i) => (
            <div key={k} style={{ padding: "var(--s-4)", textAlign: "center", borderLeft: i ? "1px solid var(--linea)" : 0 }}>
              <div className="num" style={{ fontSize: "var(--fs-xl)", fontWeight: 800 }}>{v}</div>
              <div className="muted-2" style={{ fontSize: 12, fontWeight: 600 }}>{k}</div>
            </div>
          ))}
        </div>
      </div>

      <Banner kind="ok" icon="shield">
        <b>Tu reputación de pago es {me.rep}/100.</b> Mientras más pagas a tiempo, más sube — y los organizadores te dan cupo sin dudarlo.
      </Banner>

      {/* tabs */}
      <div className="chip-row" role="tablist">
        {[["ranking", "Ranking del barrio"], ["deudores", "Deudores (" + deudores.length + ")"]].map(([k, l]) => (
          <button key={k} className="chip" aria-pressed={tab === k} role="tab" onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === "ranking" ? (
        <div className="card" style={{ overflow: "hidden" }}>
          {ranking.length === 0 ? (
            <div className="card-pad muted">Aún no hay ranking. Juega y paga tus cupos para aparecer.</div>
          ) : (
          <table className="rank">
            <thead><tr><th className="pos">#</th><th>Jugador</th><th className="num" style={{ textAlign: "right" }}>Pagados</th><th className="num rep-col" style={{ textAlign: "right" }}>Reputación</th></tr></thead>
            <tbody>
              {ranking.map((p, i) => (
                <tr key={p.id} className={p.me ? "me" : ""}>
                  <td className="pos num">{i + 1}</td>
                  <td><div className="who"><Avatar player={p} size={32} /><span className="who-name">{p.me ? "Tú" : p.name}</span>{i === 0 && <span className="tag tag-naranjo"><Icon name="trophy" size={12} /> Líder</span>}</div></td>
                  <td className="num" style={{ textAlign: "right" }}>{p.pagados}/{p.jugados}</td>
                  <td className="rep-col" style={{ textAlign: "right" }}>
                    <span className="rep-score" title={repTier(p.rep).label + " · " + p.rep + "/100"}>
                      <span className="rep-dot" style={{ background: repTier(p.rep).color, width: 18, height: 18 }}><Icon name={repTier(p.rep).icon} size={11} stroke={2.4} /></span>
                      <span className="num">{p.rep}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      ) : (
        <div className="section" style={{ gap: 10 }}>
          {deudores.length === 0 ? (
            <Banner kind="ok" icon="checkCircle"><b>¡Al día!</b> Nadie debe plata a la caja.</Banner>
          ) : (<>
            <Banner kind="warn" icon="cash">Se le debe <b className="num">{CLP(totalDeuda)}</b> a la caja del barrio entre {deudores.length} jugadores.</Banner>
            {onRecordar && (
              <button className="btn btn-primary btn-block" onClick={armarRecordatorio}>
                <Icon name="whatsapp" size={18} /> Recordar al barrio
              </button>
            )}
          </>)}
          {deudores.map(p => (
            <div className="pay-row" key={p.id}>
              <Avatar player={p} size={42} />
              <div className="grow">
                <div className="pay-name"><span className="pay-name-text">{p.name}</span> <RepBadge score={p.rep} small showScore={false} /></div>
                <div className="pay-meta">{p.jugados - p.pagados} cupos sin pagar</div>
              </div>
              <span className="num" style={{ fontWeight: 800, color: "var(--danger)" }}>{CLP(p.debe)}</span>
            </div>
          ))}
        </div>
      )}

      {onSavePosicion && (
        <div className="card card-pad section" style={{ gap: 10 }}>
          <span className="row" style={{ gap: 8, fontWeight: 650 }}><Icon name="shirt" size={18} /> Posición preferida</span>
          <div className="chip-row" role="group" aria-label="Posición preferida" style={{ margin: 0, flexWrap: "wrap" }}>
            {POSICIONES.map((p) => (
              <button key={p} className="chip" aria-pressed={posicion === p} onClick={() => onSavePosicion(posicion === p ? null : p)}>{p}</button>
            ))}
          </div>
        </div>
      )}

      {onTheme && (
        <div className="card card-pad" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span className="row" style={{ gap: 8, fontWeight: 650 }}><Icon name="moon" size={18} /> Tema</span>
          <div className="chip-row" role="group" aria-label="Tema de la app" style={{ margin: 0 }}>
            {[["light", "Claro"], ["dark", "Oscuro"], ["system", "Auto"]].map(([k, l]) => (
              <button key={k} className="chip" aria-pressed={theme === k} onClick={() => onTheme(k)}>{l}</button>
            ))}
          </div>
        </div>
      )}

      <button className="btn btn-quiet" style={{ alignSelf: "center", marginTop: 8 }} onClick={onLogout}><Icon name="logout" size={17} /> Cerrar sesión</button>
    </div>
  )
}
