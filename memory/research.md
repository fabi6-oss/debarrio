# DeBarrio — Research

## Modelo todospor.cl
Plataforma chilena de rifas/colectas. Flujo: compartir link → participante elige número → paga (Payku: 3.99%+IVA transferencia, 4.99%+IVA tarjeta) → registro inmutable (blockchain) → sorteo con algoritmo verificable.

**Lo que copiamos**: el flujo "elegir slot → pagar → registro transparente".
**Lo que NO copiamos**: rifa con premio, pasarela con comisión, blockchain.

Fuente: https://todospor.cl

## Mejoras propuestas sobre el modelo (para fútbol de barrio)
1. Cupo = pago (sin pago no hay reserva).
2. Cuota dinámica (costo/cupos; baja si entran más jugadores).
3. Lista de espera automática (cupo no pagado se libera al siguiente).
4. Score de confiabilidad de pago por jugador (visible al organizador).
5. Recordatorios automáticos antes del deadline (web push).
6. Partidos recurrentes (plantilla "todos los martes 20:00").
7. Saldo a favor / fondo común (descuento por fecha, menos transferencias).
8. Historial y ranking (asistencia, pagador puntual, deudores).
9. Armado de equipos balanceado (fase 2).
10. Transparencia de caja (cuánto se juntó vs. costo cancha).

## Pendiente de investigar
- Web Push en PWA iOS (Safari) — limitaciones de notificaciones.
- Supabase Storage: bucket privado para comprobantes + signed URLs.
- Edge Functions con cron (pg_cron / scheduled functions) para liberar cupos.
