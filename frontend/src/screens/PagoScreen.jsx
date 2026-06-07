import React, { useState, useRef } from 'react'
import Icon from '../components/Icon.jsx'
import { CopyRow, Banner } from '../components/ui.jsx'
import { TRANSFER, CLP, playerById } from '../data/mock.js'
// PagoScreen — transferencia + subir comprobante. Subida real a Supabase Storage en fase posterior.

export default function PagoScreen({ match, spot, onBack, onSent }) {
  const [file, setFile] = useState(null)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const enviar = async () => {
    setError('')
    if (onSent) {
      setBusy(true)
      try { await onSent(file) } catch (e) { setError(e.message || 'No pude enviar el comprobante'); setBusy(false); return }
      setBusy(false)
    }
    setSent(true)
  }

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    setFile({ name: f.name, url, isImg: f.type.startsWith("image/") })
  }

  if (sent) {
    return (
      <div className="section" style={{ maxWidth: 560, margin: "0 auto", alignItems: "center", textAlign: "center", paddingTop: "var(--s-7)" }}>
        <div style={{ width: 92, height: 92, borderRadius: "50%", background: "var(--st-pend-bg)", color: "var(--st-pend-fg)", display: "grid", placeItems: "center", marginBottom: 4 }}>
          <Icon name="clock" size={46} stroke={2.2} />
        </div>
        <h1 className="h-xl">¡Comprobante enviado!</h1>
        <p className="muted" style={{ maxWidth: 380 }}>
          Tu cupo <b className="num">{String(spot.n).padStart(2, "0")}</b> queda <b>pendiente</b> hasta que {playerById(match.organizador).name.split(" ")[0]} confirme.
          Te avisamos apenas pase a <b style={{ color: "var(--verde-700)" }}>pagado</b>.
        </p>
        <div className="card card-pad" style={{ width: "100%", textAlign: "left" }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="row" style={{ gap: 10, fontWeight: 700 }}>
              <span className="legend-swatch s-pendiente" style={{ width: 34, height: 34 }}><Icon name="clock" size={17} /></span>
              Cupo {String(spot.n).padStart(2, "0")} · Pendiente
            </span>
            <span className="num" style={{ fontWeight: 800 }}>{CLP(match.precio)}</span>
          </div>
        </div>
        <button className="btn btn-primary btn-lg btn-block" style={{ maxWidth: 360 }} onClick={onBack}>Volver al partido</button>
      </div>
    )
  }

  return (
    <div className="section" style={{ maxWidth: 620, margin: "0 auto" }}>
      <button className="btn btn-quiet" style={{ alignSelf: "flex-start", paddingLeft: 8 }} onClick={onBack}><Icon name="chevL" size={18} /> Volver</button>

      <div>
        <div className="eyebrow">Reserva tu cupo</div>
        <h1 className="h-xl">Paga por transferencia</h1>
        <p className="muted" style={{ marginTop: 4 }}>Transfiere el monto exacto y sube tu comprobante. Tu cupo queda guardado mientras tanto.</p>
      </div>

      {/* resumen + monto */}
      <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
          <div className="row" style={{ gap: 12 }}>
            <span className="legend-swatch s-pendiente" style={{ width: 44, height: 44, fontSize: 16 }}>
              <span className="num" style={{ fontWeight: 800 }}>{String(spot.n).padStart(2, "0")}</span>
            </span>
            <div>
              <div style={{ fontWeight: 750 }}>{match.titulo}</div>
              <div className="muted-2" style={{ fontSize: 13 }}>{match.dia} · {match.hora} · {match.comuna}</div>
            </div>
          </div>
        </div>
        <hr className="divider" />
        <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
          <span className="lbl">Monto a transferir</span>
          <span className="num" style={{ fontSize: "var(--fs-2xl)", fontWeight: 800, color: "var(--verde-700)", letterSpacing: "-.02em" }}>{CLP(match.precio)}</span>
        </div>
      </div>

      {/* datos transferencia */}
      <div className="section" style={{ gap: 10 }}>
        <h2 className="h-sm"><Icon name="bank" size={18} style={{ verticalAlign: "-3px", color: "var(--verde-600)" }} /> Datos para transferir</h2>
        {(() => {
          const t = match.transfer && match.transfer.nombre ? match.transfer : TRANSFER
          return (
            <>
              <CopyRow k="Nombre" v={t.nombre} />
              <div className="grid-2" style={{ gap: 10 }}>
                <CopyRow k="RUT" v={t.rut} mono />
                <CopyRow k="Cuenta" v={t.cuenta} mono />
              </div>
              <CopyRow k="Banco" v={(t.banco || '') + (t.tipo ? " · " + t.tipo : '')} />
              {t.email && <CopyRow k="Correo" v={t.email} />}
            </>
          )
        })()}
      </div>

      {/* subir comprobante */}
      <div className="section" style={{ gap: 10 }}>
        <h2 className="h-sm"><Icon name="receipt" size={18} style={{ verticalAlign: "-3px", color: "var(--verde-600)" }} /> Sube tu comprobante</h2>
        <input ref={inputRef} type="file" accept="image/*,application/pdf" onChange={onFile} style={{ display: "none" }} />
        <div className={"dropzone" + (file ? " has-file" : "")} onClick={() => inputRef.current && inputRef.current.click()} role="button" tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") inputRef.current.click() }}>
          {file ? (
            <>
              {file.isImg
                ? <div className="thumb"><img src={file.url} alt="Comprobante" style={{ width: "100%", display: "block" }} /></div>
                : <div className="legend-swatch s-pagado" style={{ width: 48, height: 48 }}><Icon name="receipt" size={24} /></div>}
              <div className="row" style={{ gap: 8, color: "var(--verde-700)", fontWeight: 750 }}><Icon name="checkCircle" size={18} /> {file.name}</div>
              <span className="muted-2" style={{ fontSize: 13 }}>Toca para cambiar</span>
            </>
          ) : (
            <>
              <div className="legend-swatch" style={{ width: 52, height: 52, borderStyle: "dashed" }}><Icon name="camera" size={26} /></div>
              <div style={{ fontWeight: 750 }}>Toca para subir foto o PDF</div>
              <span className="muted-2" style={{ fontSize: 13 }}>Pantallazo de la transferencia o el comprobante del banco</span>
            </>
          )}
        </div>
      </div>

      <Banner kind="warn" icon="alert">
        Transfiere el <b>monto exacto</b> y deja tu apodo en el mensaje si puedes. Así el organizador te encuentra al tiro.
      </Banner>

      {error && <div className="banner banner-warn" role="alert"><Icon name="alert" size={18} stroke={2.2} style={{ flex: '0 0 auto' }} /><div>{error}</div></div>}

      <button className="btn btn-accent btn-lg btn-block" disabled={!file || busy} onClick={enviar}>
        <Icon name="check" size={20} /> {busy ? 'Enviando…' : 'Ya transferí — enviar comprobante'}
      </button>
    </div>
  )
}
