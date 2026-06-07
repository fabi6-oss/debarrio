# DeBarrio — Sistema de Diseño

Visual de la PWA. Tono: comunitario, deportivo, confiable. Mobile-first, modo claro, low-tech friendly (botones grandes, alto contraste, estados con color **+ ícono + texto**).

Archivos:
- `tokens.css` → tokens listos para importar (CSS vars, compatibles con Tailwind `theme.extend`).
- `mockups.html` → abrir en navegador, 6 pantallas. Fuente visual de verdad.

## Paleta

| Rol | Color | Hex |
|---|---|---|
| Marca (cancha) | verde | `#16A34A` |
| Marca oscuro | verde 600 | `#15803D` |
| Acento (modo organizador, CTA secundario) | naranjo | `#F97316` |
| Fondo app | slate 50 | `#F8FAFC` |
| Superficie / card | blanco | `#FFFFFF` |
| Texto | slate 900 | `#0F172A` |
| Texto suave | slate 500 | `#64748B` |

### Estados de cupo (núcleo del producto)

Nunca distinguidos solo por color — siempre con ícono + texto (accesibilidad).

| Estado | bg / borde / texto | Ícono | Significado |
|---|---|---|---|
| `libre` | slate 100 / dashed slate 300 / slate 500 | ◻ | disponible para tomar |
| `reservado_pendiente` | amber 100 / amber 500 / amber 700 | ⏳ | tomado, esperando pago |
| `pagado` | green 100 / green 500 / green 700 | ✓ | pago confirmado, cupo asegurado |
| `liberado` | red 100 / red 500 / red 700 | ✕ | no pagó a tiempo, volvió a estar libre |

## Tipografía

- Familia: **Inter** (fallback system-ui). Cargar desde Google Fonts o `@fontsource/inter`.
- Body mínimo **16px** (legible en celular para todas las edades).
- Escala: 12 / 14 / 16 / 18 / 22 / 28 / 36. Pesos 400 / 500 / 700.

## Espaciado y forma

- Escala 4px (4/8/12/16/20/24/32).
- Radios: 8 (sm), 12 (md), 16 (lg), full (pills/avatares).
- Sombras suaves (`--shadow-card`) para cards; `--shadow-pop` para modales.
- **Touch target mínimo 48px** en todo botón/input.

## Componentes clave

1. **Card de partido** — fecha+hora, cancha, pill estado (Abierto/Completo), cuota, barra de progreso "X/Y cupos pagados", CTA "Ver cupos".
2. **Grilla de cupos** ★ — grid 4 columnas, celda cuadrada por cupo, color+ícono+texto del estado. Tap en `libre` → tomar.
3. **Botón tomar cupo** — `btn-accent` (naranjo), full-width, 48px.
4. **Pago / comprobante** — caja de datos de transferencia con botón copiar (⧉) por campo, dropzone para foto, CTA "Ya transferí".
5. **Fila confirmar pago** (organizador) — thumbnail comprobante + nombre + badge reputación + botón "Confirmar".
6. **Badge de reputación de pago** — `rep-good` (✓ pagador puntual), `rep-mid` (~), `rep-bad` (⚠ moroso / debe $).
7. **Tabla ranking/deudores** — #, jugador, % asistencia, estado de pago.
8. **Barra de progreso** — verde sobre slate; % = cupos pagados / total = cancha cubierta.
9. **Tab bar** — Partidos / Crear / Ranking / Perfil.

## Modo organizador

Mismo sistema, statusbar/appbar en **naranjo acento** para diferenciar visualmente del modo jugador (verde). Acceso a panel de caja y confirmación de pagos.

## Pantallas (ver mockups.html)

1. Login / registro
2. Lista de partidos
3. Detalle con grilla de cupos ★
4. Pago / subir comprobante
5. Panel organizador (caja + confirmar)
6. Perfil + ranking / deudores

## Implementación (Fase 1+)

- Importar `tokens.css` en el entry (`main.tsx`) o mapear a `tailwind.config` vía `theme.extend.colors`.
- Construir componentes con shadcn/ui + Tailwind (ver skill `ui-styling`).
- PWA: instalable, ícono ⚽, splash con marca verde.
