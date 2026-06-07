// mock.js — datos de ejemplo (español de Chile)
// Portado del prototipo de Claude Design. Se reemplaza por datos de Supabase
// en la fase de integración (RPCs: tomar_cupo, confirmar_pago, vistas ranking/deudores).

const AVATARS = ["#1b7a3d","#f2641a","#2f5aa0","#9a4bc4","#c43b5e","#0f8f86","#c98a12","#5a6cc4","#b5532a","#2f8f4e"];
// hash estable de cualquier seed (número o uuid string) → color de avatar
export const avatarColor = (seed) => {
  const s = String(seed ?? "")
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return AVATARS[h % AVATARS.length]
}
export const initials = (name) => (name || "?").split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();

// reputación de pago: tier por score 0–100
export function repTier(score){
  if (score >= 90) return { key:"crack",  label:"Crack del pago", color:"var(--verde-600)", icon:"shield" };
  if (score >= 70) return { key:"cumple", label:"Cumplidor",      color:"var(--info)",      icon:"checkCircle" };
  if (score >= 45) return { key:"ahi",    label:"Ahí nomás",      color:"var(--warn)",      icon:"clock" };
  return            { key:"moroso", label:"Moroso",          color:"var(--danger)",    icon:"alert" };
}

export const PLAYERS = [
  { id:1,  name:"Tú (Nico Soto)",  alias:"nico",     rep:96, jugados:38, pagados:38, debe:0,     me:true },
  { id:2,  name:"Pancho Reyes",    alias:"pancho",   rep:99, jugados:51, pagados:51, debe:0 },
  { id:3,  name:"Cata Muñoz",      alias:"cata",     rep:93, jugados:29, pagados:29, debe:0 },
  { id:4,  name:"Feña Tapia",      alias:"feña",     rep:88, jugados:33, pagados:32, debe:0 },
  { id:5,  name:"Manu Vidal",      alias:"manu",     rep:76, jugados:24, pagados:22, debe:0 },
  { id:6,  name:"Checho Lara",     alias:"checho",   rep:71, jugados:19, pagados:17, debe:0 },
  { id:7,  name:"Dani Pizarro",    alias:"dani",     rep:58, jugados:16, pagados:12, debe:3500 },
  { id:8,  name:"Galleta Rojas",   alias:"galleta",  rep:41, jugados:14, pagados:8,  debe:7000 },
  { id:9,  name:"Tincho Bravo",    alias:"tincho",   rep:34, jugados:11, pagados:6,  debe:10500 },
  { id:10, name:"Beto Cáceres",    alias:"beto",     rep:62, jugados:18, pagados:14, debe:3500 },
  { id:11, name:"Lucho Fuentes",   alias:"lucho",    rep:84, jugados:27, pagados:26, debe:0 },
  { id:12, name:"Vicho Salas",     alias:"vicho",    rep:90, jugados:30, pagados:30, debe:0 },
];
export const ME = PLAYERS[0];

// ---- Registro de personas (overridable en modo live) ----
// Las pantallas resuelven jugadores por id vía playerById(). En modo demo usa
// PLAYERS; en modo live, App llama setPeople() con los perfiles reales del grupo.
let _people = PLAYERS;
let _me = ME;
export function setPeople(players, me) {
  _people = players && players.length ? players : PLAYERS;
  _me = me || _people.find(p => p.me) || _people[0];
}
export const playerById = (id) => _people.find(p => p.id === id);
export const getMe = () => _me;
export const getPeople = () => _people;

// genera cupos: estados mezclados. owners = array de {n, pid, state, when}
export function buildSpots(total, fills){
  const spots = [];
  for (let n=1; n<=total; n++){
    const f = fills[n];
    if (f) spots.push({ n, state:f.state, pid:f.pid||null, when:f.when||null });
    else spots.push({ n, state:"libre", pid:null, when:null });
  }
  return spots;
}

// Partido estrella (detalle) — Baby fútbol 7v7 = 14 cupos
const STAR_FILLS = {
  1:{state:"pagado",pid:2,when:"hace 2 d"}, 2:{state:"pagado",pid:3,when:"hace 2 d"},
  3:{state:"pagado",pid:11,when:"ayer"},   4:{state:"pagado",pid:12,when:"ayer"},
  5:{state:"pagado",pid:4,when:"ayer"},    6:{state:"pagado",pid:1,when:"hoy 10:12"},
  7:{state:"pendiente",pid:5,when:"hace 40 min"}, 8:{state:"pendiente",pid:6,when:"hace 12 min"},
  9:{state:"pagado",pid:10,when:"hoy 09:30"},
  10:{state:"liberado",pid:null,when:"se liberó hace 5 min"},
  12:{state:"pendiente",pid:7,when:"hace 3 min"},
  13:{state:"pagado",pid:8,when:"hoy 08:50"},
};

export const MATCHES = [
  {
    id:"m1", titulo:"Pichanga del Jueves", formato:"Baby fútbol · 7 vs 7",
    cancha:"Complejo La Bombonera", comuna:"Ñuñoa", dia:"Jue 12 jun", hora:"20:00", dur:"60 min",
    precio:3500, organizador:2, total:14, destacado:true,
    spots: buildSpots(14, STAR_FILLS),
    nota:"Llevar peto claro y oscuro. Puntualidad: la cancha es justa de tiempo 🙏",
  },
  {
    id:"m2", titulo:"Fútbol 11 Dominical", formato:"Fútbol · 11 vs 11",
    cancha:"Estadio Municipal", comuna:"Maipú", dia:"Dom 15 jun", hora:"10:00", dur:"90 min",
    precio:5000, organizador:11, total:22, destacado:false,
    spots: buildSpots(22, {
      1:{state:"pagado",pid:2},2:{state:"pagado",pid:3},3:{state:"pagado",pid:4},
      4:{state:"pagado",pid:11},5:{state:"pagado",pid:12},6:{state:"pendiente",pid:5},
      7:{state:"pendiente",pid:6},8:{state:"pagado",pid:1},9:{state:"liberado"},
      10:{state:"pagado",pid:10},11:{state:"pendiente",pid:7},
    }),
    nota:"Cancha de pasto natural. Estacionamiento por calle lateral.",
  },
  {
    id:"m3", titulo:"Futbolito de las Minas", formato:"Futbolito · 5 vs 5",
    cancha:"Cancha El Bosque", comuna:"La Florida", dia:"Sáb 14 jun", hora:"18:30", dur:"60 min",
    precio:3000, organizador:3, total:10, destacado:false,
    spots: buildSpots(10, {
      1:{state:"pagado",pid:3},2:{state:"pagado",pid:4},3:{state:"pagado",pid:12},
      4:{state:"pendiente",pid:5},5:{state:"pagado",pid:1},6:{state:"libre"},
    }),
    nota:"Mixto bienvenido. Buena onda siempre 💪",
  },
  {
    id:"m4", titulo:"Pichanga Después de Pega", formato:"Baby fútbol · 7 vs 7",
    cancha:"Domos San Joaquín", comuna:"San Joaquín", dia:"Mié 11 jun", hora:"21:00", dur:"60 min",
    precio:4000, organizador:1, total:14, destacado:false,
    spots: buildSpots(14, {
      1:{state:"pagado",pid:2},2:{state:"pagado",pid:6},3:{state:"pagado",pid:10},
      4:{state:"pagado",pid:11},5:{state:"pagado",pid:12},6:{state:"pagado",pid:4},
      7:{state:"pagado",pid:3},8:{state:"pendiente",pid:5},9:{state:"pendiente",pid:7},
      10:{state:"pagado",pid:1},11:{state:"liberado"},12:{state:"pagado",pid:8},
      13:{state:"pendiente",pid:9},
    }),
    nota:"Yo organizo esta 😎 — caja al día, paguen altiro.",
    miOrg:true,
  },
];

// datos de transferencia del organizador
export const TRANSFER = {
  nombre:"Francisco Reyes M.",
  rut:"16.482.913-7",
  banco:"Banco Estado",
  tipo:"Cuenta RUT",
  cuenta:"16482913",
  email:"pancho.reyes@gmail.com",
  alias:"@pancho_pichanga",
};

export const STATE_META = {
  libre:     { label:"Libre",     icon:"plus",        desc:"Cupo disponible" },
  pendiente: { label:"Pendiente", icon:"clock",       desc:"Reservó, falta confirmar pago" },
  pagado:    { label:"Pagado",    icon:"check",       desc:"Pago confirmado" },
  liberado:  { label:"Liberado",  icon:"undo",        desc:"Se liberó, disponible de nuevo" },
};

export const CLP = (n) => "$" + n.toLocaleString("es-CL");
