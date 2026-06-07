# DeBarrio — Frontend

React + Vite, PWA mobile-first y **responsive desktop**. Implementación del diseño de **Claude Design** (handoff bundle): tono comunitario chileno, verde cancha `#1b7a3d` + naranjo organizador `#f2641a`, fuente Figtree, estados de cupo por **color + ícono + texto**.

Actualmente corre con **datos mock** (`src/data/mock.js`). El cableado a Supabase (Auth con Google + RPCs + Storage) es la fase siguiente.

## Correr

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # producción → dist/
```

> Requiere Node.js (LTS). Aún no instalado en este equipo.

## Estructura

```
src/
├── main.jsx              Entry: monta App, importa estilos
├── App.jsx              Shell responsive: sidebar (desktop) / bottom-nav (móvil), routing, sheets
├── styles/
│   ├── tokens.css       Sistema de diseño (marca, estados, tipografía, espaciado)
│   └── components.css   Clases de componentes + reglas responsive (@media 1024px)
├── components/
│   ├── Icon.jsx         Set de íconos SVG (stroke currentColor)
│   └── ui.jsx           Avatar, RepBadge, ProgressBar, StateLegend, Spot, SpotGrid,
│                        MatchCard, CopyRow, Banner, Sheet
├── hooks/useMediaQuery.js
├── data/mock.js         Datos de ejemplo (jugadores, partidos, transferencia)
└── screens/
    ├── AuthScreen.jsx       Login / registro
    ├── PartidosView.jsx     Lista (móvil) + split lista/detalle (desktop)
    ├── MatchDetail.jsx      Detalle con la LISTA DE CUPOS ★ (4 estados)
    ├── PagoScreen.jsx       Transferencia + subir comprobante
    ├── OrganizarScreen.jsx  Caja + confirmar/liberar pagos
    └── PerfilScreen.jsx     Reputación + ranking / deudores
```

## Notas de portabilidad (prototipo → producción)

- El prototipo de Claude Design usaba Babel-in-browser + globals + un panel de **Tweaks** (exploración de variantes). Se portó a ESM real y se **descartó el panel Tweaks**; los defaults elegidos quedan fijos como atributos `data-*` en el root de `App.jsx` (`grid=rounded`, `density=regular`, `card=solid`, `nav=labels`).
- Mismos componentes y tokens en móvil y desktop; solo cambia la disposición vía `@media (min-width:1024px)`.
- `DeBarrio (celular).html` del bundle era solo la *vista* móvil de esta misma app responsive — queda cubierta.

## Próximo (integración Supabase)

- `src/services/` → cliente Supabase + llamadas a RPCs (`tomar_cupo`, `confirmar_pago`, `adjuntar_comprobante`).
- Auth real: correo/contraseña + `signInWithOAuth({ provider: 'google' })`.
- Reemplazar `mock.js` por queries a las tablas/vistas (`v_progreso_partido`, `v_ranking`, `v_deudores`).
- Subida de comprobante real a Storage (bucket `comprobantes`).

## Variables de entorno

Copiar `.env.example` → `.env.local`:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
