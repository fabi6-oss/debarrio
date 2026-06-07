# DeBarrio — Code Notes

(Patrones y trampas específicas del proyecto. Vacío al inicio de Fase 0.)

## Pendientes a documentar cuando aparezcan
- Esquema de estados de cupo: `libre` → `reservado_pendiente` → `pagado` | `liberado`.
- Cálculo de cuota dinámica y cómo se recalcula al cambiar nº de cupos.
- Política RLS por grupo (jugador vs organizador).
- Lógica de expiración de cupo (timestamp + Edge Function cron).
