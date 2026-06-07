# Prompt para Claude Design — DeBarrio

Copiar y pegar en Claude Design. Conceptual, sin datos duros.

---

Diseña el sistema visual completo de **DeBarrio**, una web app (PWA) **responsive** para organizar partidos de fútbol de barrio en Chile. Prioriza el celular (mobile-first), pero **debe verse igual de bien en navegador de PC/escritorio**: aprovecha el ancho con un layout adaptativo (no una columna móvil estirada al centro de una pantalla vacía).

**Concepto del producto:** cada jugador reserva su cupo **pagando por transferencia antes de jugar**. Sin pago confirmado, no hay cupo. Así el organizador deja de andar persiguiendo cobros. El elemento visual estrella es una **grilla de cupos** (parecida a una grilla de números de rifa), donde cada cupo muestra su estado de un vistazo.

**Tono y público:** comunitario, cercano, deportivo, confiable — nada corporativo. Usuarios vecinos de todas las edades usando celular o computador. Debe sentirse simple y amistoso.

**Responsive (clave):**
- **Móvil:** una columna, navegación inferior, áreas táctiles grandes.
- **Escritorio (≥1024px):** layout de dos zonas (ej. lista de partidos a la izquierda + detalle/grilla a la derecha), navegación lateral en vez de inferior, contenido con ancho máximo cómodo y centrado, la grilla de cupos con más columnas para aprovechar el espacio.
- Mismos componentes y tokens en ambos; solo cambia la disposición. Breakpoints claros.

**Estilo visual:**
- Modo claro por defecto, alto contraste.
- Botones grandes y áreas táctiles cómodas (low-tech friendly), pero que no se vean toscos en escritorio.
- Color de marca: verde "cancha". Color de acento/energía: naranjo (úsalo para el modo organizador y CTAs secundarios).
- Tipografía legible, con escala que crezca un poco en pantallas grandes.
- Accesible: los estados nunca se distinguen solo por color, también por ícono y texto.

**Estados del cupo** (clave, deben verse distintos a simple vista, en móvil y escritorio):
- Libre (disponible para tomar)
- Pendiente de pago (tomado, esperando transferencia)
- Pagado / confirmado (cupo asegurado)
- Liberado (no pagó a tiempo, volvió a quedar libre)

**Entregables:**
1. Sistema de diseño: paleta (marca + estados semánticos), tipografía responsive, escala de espaciado, radios y sombras, breakpoints. Tokens listos para usar con Tailwind.
2. Componentes (que funcionen en móvil y escritorio): card de partido con barra de progreso "X de Y cupos pagados", grilla de cupos interactiva (columnas adaptativas), botón "tomar cupo", pantalla de pago con datos de transferencia y subida de comprobante, fila de "confirmar pago" para el organizador, badge de reputación de pago del jugador (puntual / moroso), tabla de ranking y deudores, navegación (inferior en móvil / lateral en escritorio).
3. Mockups de cada pantalla **en ambas vistas (móvil y escritorio)**:
   - Login / registro
   - Lista de partidos
   - Detalle del partido con la grilla de cupos
   - Pago: datos de transferencia + subir comprobante
   - Panel del organizador: caja del partido + confirmar pagos
   - Perfil del jugador con ranking / historial / deudores

Entrega cada pantalla como mockup móvil **y** desktop, más el set de tokens y componentes reutilizables.
