/**
 * CÓMO SE DIBUJA LA SECCIÓN DE SEGURIDAD. El texto está en `contenido.cjs`.
 *
 * ── LO QUE TIENE QUE TRANSMITIR ───────────────────────────────────────────
 *
 * Que la seguridad es parte de la arquitectura desde el diseño, no una capa
 * añadida después. Por eso no hay una fila de iconos: hay un solo dibujo, seis
 * placas apiladas —defensa en profundidad— atravesadas por un eje que no se
 * corta —protección continua—, y seis pilares numerados como esas placas.
 * Cada placa lleva un trazo mínimo de lo que protege: celdas separadas para el
 * aislamiento entre tenants, filtros para la capa de aplicación, dos nodos
 * unidos para la réplica… Nada que haya que leer.
 *
 * Al pasar por un pilar se enciende su placa. Cada pilar lleva además seis
 * rayas con la suya en rojo: dice en qué capa está sin repetir el dibujo.
 *
 * ── SIN UN COLOR SUELTO ───────────────────────────────────────────────────
 *
 * Todo sale de las variables del sitio (`--dark`, `--text-3`, `--red`…), también
 * dentro del SVG, que se pinta con clases y no con atributos `fill`. Así el
 * modo oscuro no tiene nada que adivinar: cambian las variables y el dibujo
 * cambia con ellas.
 */

const M_SEGURIDAD = {
  seccion: ["<!-- ══ SEGURIDAD ══ -->", "<!-- ══ FIN DE SEGURIDAD ══ -->"],
  /* Lo que había antes en ese sitio: la franja de cinco pastillas. */
  franja: "<!-- ══════════ SECURITY TRUST STRIP ══════════ -->",
};

/* ── Las medidas del dibujo ──────────────────────────────────────────────
   Placas aplanadas (media altura 44 sobre media anchura 150) y separadas 70:
   así asoma la mitad delantera de cada una y se ven sus trazos. Con placas
   más altas o más juntas, cada una tapaba casi entera a la de debajo. */
const CX = 196, HW = 150, HH = 44, CANTO = 8, PASO = 70, Y0 = 56;
const Y_FIN = Y0 + 5 * PASO + HH + CANTO + 18;

const CSS_SEGURIDAD = `
/* ── LA SEGURIDAD ── */
#seguridad {
  padding: 120px 0; background: var(--dark-2); overflow: hidden;
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
}
/* Una retícula de plano, que se desvanece hacia los bordes. */
#seguridad::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 48px 48px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, #000 15%, transparent 78%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, #000 15%, transparent 78%);
}
#seguridad .container { position: relative; }
.seg-cuerpo {
  display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: 64px; align-items: center;
}
.seg-dibujo { margin: 0; }
.seg-dibujo svg { display: block; width: 100%; height: auto; max-width: 440px; margin: 0 auto; }

.seg-cara { fill: var(--dark); stroke: var(--text-3); stroke-width: 1; transition: stroke .25s; }
.seg-canto { fill: var(--dark-3); stroke: var(--text-3); stroke-width: 1; }
.seg-trazo { fill: none; stroke: var(--text-3); stroke-width: 1; opacity: .6; transition: stroke .25s, opacity .25s; }
.seg-guia { stroke: var(--text-3); stroke-width: 1; opacity: .5; }
.seg-rotulo {
  font-family: 'Source Code Pro', monospace; font-size: 12px; font-weight: 600;
  letter-spacing: 1px; fill: var(--text-3); transition: fill .25s;
}
.seg-eje { stroke: var(--red); stroke-width: 1; stroke-dasharray: 3 5; opacity: .6; }
.seg-nodo { fill: var(--red); }
/* Un punto que baja por el eje sin detenerse: la protección no es por turnos. */
.seg-pulso { fill: var(--red); animation: seg-baja 5s cubic-bezier(.45, 0, .25, 1) infinite; }
@keyframes seg-baja {
  0% { transform: translateY(0); opacity: 0; }
  12% { opacity: 1; }
  88% { opacity: 1; }
  100% { transform: translateY(${Y_FIN - 10}px); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) { .seg-pulso { animation: none; opacity: 0; } }

.seg-pilares {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px; background: var(--border);
  border: 1px solid var(--border); border-radius: 14px; overflow: hidden;
}
.seg-pilar { background: var(--dark); padding: 26px 24px 24px; transition: background .2s; }
.seg-pilar:hover { background: var(--dark-3); }
.seg-pilar-cab { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.seg-num {
  font-family: 'Source Code Pro', monospace; font-size: 12px; font-weight: 600;
  letter-spacing: 1.6px; color: var(--red);
}
.seg-capas { display: flex; flex-direction: column; gap: 3px; width: 26px; }
.seg-capas i { display: block; height: 2px; border-radius: 2px; background: var(--border-light); }
.seg-capas i.on { background: var(--red); }
.seg-pilar-nombre { font-size: 18px; font-weight: 800; letter-spacing: -0.3px; line-height: 1.3; margin: 0 0 8px; color: var(--text); }
.seg-pilar-texto { font-size: 14px; line-height: 1.6; color: var(--text-2); margin: 0; }

.seg-cierre {
  margin-top: 64px; display: flex; flex-wrap: wrap; justify-content: center; align-items: center;
  gap: 12px 22px; text-align: center;
  font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: var(--text);
}
/* El separador es un rombo: la misma placa del dibujo, vista desde arriba. */
.seg-cierre .seg-sep { width: 6px; height: 6px; background: var(--red); transform: rotate(45deg); }

@media (max-width: 1024px) {
  .seg-cuerpo { grid-template-columns: 1fr; gap: 48px; }
  .seg-dibujo svg { max-width: 360px; }
}
/* Las tres frases caben en una línea desde 900 px; por debajo se apilan, o el
   rombo se queda colgando al final de la primera. */
@media (max-width: 900px) {
  .seg-cierre { flex-direction: column; gap: 8px; }
  .seg-cierre .seg-sep { display: none; }
}
@media (max-width: 640px) {
  #seguridad { padding: 88px 0; }
  .seg-pilares { grid-template-columns: 1fr; }
  .seg-cierre { font-size: 19px; }
}
`;

/* Al pasar por un pilar, su placa se enciende. Seis reglas, una por capa. */
const CSS_ENCENDIDO = [1, 2, 3, 4, 5, 6].map((n) =>
  `.seg-cuerpo:has(.seg-pilar[data-capa="${n}"]:hover) .seg-capa-${n} .seg-cara { stroke: var(--red); stroke-width: 1.5; }\n` +
  `.seg-cuerpo:has(.seg-pilar[data-capa="${n}"]:hover) .seg-capa-${n} .seg-trazo { stroke: var(--red); opacity: 1; }\n` +
  `.seg-cuerpo:has(.seg-pilar[data-capa="${n}"]:hover) .seg-capa-${n} .seg-rotulo { fill: var(--red); }`
).join("\n");

/* ── El dibujo: seis placas isométricas apiladas ─────────────────────────── */
const r = (n) => Math.round(n * 10) / 10;

function rombo(cx, cy, hw, hh) {
  return `${r(cx)},${r(cy - hh)} ${r(cx + hw)},${r(cy)} ${r(cx)},${r(cy + hh)} ${r(cx - hw)},${r(cy)}`;
}

/* Lo que se dibuja sobre cada placa, en coordenadas de la placa. */
function trazos(capa, cy) {
  const t = [];
  const linea = (x1, y1, x2, y2, extra = "") => t.push(`<line class="seg-trazo"${extra} x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}"/>`);
  const romboT = (cx, y, hw, hh, extra = "") => t.push(`<polygon class="seg-trazo"${extra} points="${rombo(cx, y, hw, hh)}"/>`);
  switch (capa) {
    case 1: /* Identidad: el perímetro se verifica dos veces. */
      romboT(CX, cy, HW * 0.66, HH * 0.66, ' stroke-dasharray="4 4"');
      romboT(CX, cy, HW * 0.33, HH * 0.33);
      break;
    case 2: /* Datos: celdas separadas, una por tenant. */
      for (const k of [-0.5, 0, 0.5]) romboT(CX + HW * k, cy, HW * 0.2, HH * 0.2);
      break;
    case 3: /* Aplicación: filtros que todo tiene que atravesar. */
      for (const k of [-0.44, -0.22, 0, 0.22, 0.44]) {
        const x = CX + HW * k, y = cy + HH * k;
        linea(x - HW * 0.24, y + HH * 0.24, x + HW * 0.24, y - HH * 0.24);
      }
      break;
    case 4: /* Infraestructura: dos nodos, el mismo dato en los dos. */
      romboT(CX - HW * 0.45, cy, HW * 0.18, HH * 0.18);
      romboT(CX + HW * 0.45, cy, HW * 0.18, HH * 0.18);
      linea(CX - HW * 0.27, cy, CX + HW * 0.27, cy, ' stroke-dasharray="3 3"');
      break;
    case 5: /* Inteligencia: señales que llegan de fuera al centro. */
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) linea(CX + dx * HW * 0.7, cy + dy * HH * 0.7, CX + dx * HW * 0.15, cy + dy * HH * 0.15);
      romboT(CX, cy, HW * 0.08, HH * 0.08);
      break;
    case 6: /* Desarrollo: una cadena de pasos hasta producción. */
      for (const k of [-0.55, -0.2, 0.15]) {
        const x = CX + HW * k;
        t.push(`<polyline class="seg-trazo" points="${r(x)},${r(cy - HH * 0.12)} ${r(x + HW * 0.16)},${r(cy)} ${r(x)},${r(cy + HH * 0.12)}"/>`);
      }
      linea(CX + HW * 0.4, cy - HH * 0.12, CX + HW * 0.4, cy + HH * 0.12);
      break;
  }
  return t.join("");
}

function dibujo() {
  const capas = [];
  /* De abajo arriba: cada placa tapa a la de debajo, como en un plano real. */
  for (let i = 5; i >= 0; i--) {
    const n = i + 1, cy = Y0 + i * PASO;
    capas.push(`<g class="seg-capa seg-capa-${n}">` +
      `<polygon class="seg-canto" points="${r(CX - HW)},${r(cy)} ${r(CX)},${r(cy + HH)} ${r(CX)},${r(cy + HH + CANTO)} ${r(CX - HW)},${r(cy + CANTO)}"/>` +
      `<polygon class="seg-canto" points="${r(CX)},${r(cy + HH)} ${r(CX + HW)},${r(cy)} ${r(CX + HW)},${r(cy + CANTO)} ${r(CX)},${r(cy + HH + CANTO)}"/>` +
      `<polygon class="seg-cara" points="${rombo(CX, cy, HW, HH)}"/>` +
      trazos(n, cy) +
      `<line class="seg-guia" x1="${CX + HW + 6}" y1="${cy}" x2="${CX + HW + 26}" y2="${cy}"/>` +
      `<text class="seg-rotulo" x="${CX + HW + 32}" y="${cy + 4}">0${n}</text>` +
      `</g>`);
  }
  const yFin = Y_FIN;
  const nodos = [0, 1, 2, 3, 4, 5].map((i) => `<circle class="seg-nodo" cx="${CX}" cy="${Y0 + i * PASO}" r="2.2"/>`).join("");
  return `<svg viewBox="0 0 400 ${yFin + 6}" xmlns="http://www.w3.org/2000/svg" focusable="false">` +
    capas.join("") +
    `<line class="seg-eje" x1="${CX}" y1="8" x2="${CX}" y2="${yFin}"/>` +
    nodos +
    `<circle class="seg-pulso" cx="${CX}" cy="10" r="3.2"/>` +
    `</svg>`;
}

/* ── La sección ─────────────────────────────────────────────────────────── */
function seccionSeguridad(t) {
  const s = t.seguridad;
  const pilares = s.pilares.map((p, i) => `      <article class="seg-pilar reveal" data-capa="${i + 1}">
        <div class="seg-pilar-cab">
          <span class="seg-num">${p.num}</span>
          <span class="seg-capas" aria-hidden="true">${[1, 2, 3, 4, 5, 6].map((k) => k === i + 1 ? '<i class="on"></i>' : "<i></i>").join("")}</span>
        </div>
        <h3 class="seg-pilar-nombre">${p.nombre}</h3>
        <p class="seg-pilar-texto">${p.texto}</p>
      </article>`).join("\n");
  const cierre = s.cierre.map((c) => `<span>${c}</span>`).join('<span class="seg-sep" aria-hidden="true"></span>');
  return `<section id="seguridad">
  <div class="container">
    <div class="solution-header">
      <div class="label-chip reveal">${s.chip}</div>
      <h2 class="section-title-center reveal reveal-2">${s.titulo}</h2>
      <p class="section-subtitle reveal reveal-3">${s.subtitulo}</p>
    </div>
    <div class="seg-cuerpo">
      <figure class="seg-dibujo reveal" aria-hidden="true">${dibujo()}</figure>
      <div class="seg-pilares">
${pilares}
      </div>
    </div>
    <div class="seg-cierre reveal reveal-2">${cierre}</div>
  </div>
</section>`;
}

module.exports = { M_SEGURIDAD, CSS_SEGURIDAD: CSS_SEGURIDAD + CSS_ENCENDIDO + "\n", seccionSeguridad };
