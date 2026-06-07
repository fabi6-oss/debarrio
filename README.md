# DeBarrio

PWA para organizar partidos de fútbol de barrio. Resuelve el dolor de cobrar la cancha: **el cupo solo se reserva con el pago confirmado**. Sin transferencia, no hay cupo. El organizador deja de perseguir cobros.

Inspirado en el mecanismo de [todospor.cl](https://todospor.cl) (elegir cupo → pagar → registro), **sin rifa con premio, sin comisión, solo transferencia**.

## Stack

- **Frontend**: React + Vite + TypeScript (PWA mobile-first)
- **Backend/DB**: Supabase (Auth + Postgres + RLS + Storage + Edge Functions)
- **Deploy**: Vercel (frontend) + Supabase (datos) — ambos free tier
- **Avisos**: Web Push + compartir a WhatsApp

## Setup

```bash
# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173

# Backend (Supabase): aplicar migraciones desde backend/supabase/migrations/
```

## Estructura

```
├── frontend/                 React + Vite PWA
│   └── src/
│       ├── components/       UI reutilizable
│       ├── pages/            Vistas/rutas
│       ├── hooks/            Lógica reutilizable
│       ├── services/         Cliente Supabase + queries
│       └── types/            TypeScript interfaces
├── backend/                  Backend = Supabase (sin servidor propio)
│   └── supabase/
│       ├── migrations/       Esquema SQL (tablas + RLS + RPCs + vistas)
│       └── functions/        Edge Functions (recordatorios push)
├── docs/design/              Sistema visual (tokens, mockups)
└── memory/                   Memory Palace del proyecto
```

## Variables de Entorno

```bash
# frontend/.env.local
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Flujo principal

1. Organizador crea partido (costo total, nº cupos → cuota = costo/cupos).
2. Comparte link en WhatsApp.
3. Jugador toma cupo → `reservado_pendiente` (expira en 2 h).
4. App muestra datos de transferencia del organizador + monto.
5. Jugador transfiere, sube comprobante, marca "pagué".
6. Organizador confirma con 1 tap → cupo `pagado`.
7. Cupo no pagado a tiempo → se libera (Edge Function) → lista de espera.

## Estado

Fase 0 (setup). Ver `memory/context.md`.
