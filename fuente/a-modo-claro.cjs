/**
 * Aplica al landing rebrandeado los cambios de color acordados y escribe la
 * versión clara.
 *
 * Dos garantías, y las dos se comprueban aquí mismo:
 *
 *  1. Cada cambio trae la línea original ENTERA. Si no coincide carácter a
 *     carácter con lo que hay en el fichero, el cambio se descarta y se avisa.
 *     Así ninguna línea inventada entra.
 *
 *  2. Al final, se quitan TODOS los valores de color de las dos versiones y se
 *     comparan. Si no salen idénticas, es que se cambió algo que no era color
 *     —un tamaño, un texto, una clase— y el guion falla. Es la prueba de que la
 *     estructura, la composición y las funcionalidades quedaron intactas.
 */
const RAIZ = require("node:path").join(__dirname, "..");
const fs = require("fs");
const { pelado, restosDeTemaOscuro, EXCEPCIONES } = require("./tema.cjs");

const OSCURO = require("node:path").join(RAIZ, "oscuro.html");
const CLARO = require("node:path").join(RAIZ, "index.html");
const CAMBIOS = process.argv[2] || __dirname + "/cambios-de-color.json";

const CRUDO = fs.readFileSync(OSCURO, "utf8");
const ERA_CRLF = CRUDO.includes("\r\n");
const li = CRUDO.split("\r\n").join("\n").split("\n");

/* ── 1. Las fichas del tema claro ───────────────────────────────────────────
   Se escriben aquí, no las deciden los agentes: una sola escala para toda la
   página. Mantienen los mismos escalones que el tema oscuro, pero al revés —
   sobre blanco, una superficie «levantada» es más gris, no más clara. */
const FICHAS_CLARAS = [
  "  --red: #EB1000;",
  "  --red-ink: #C10D00;",
  "  --red-dim: rgba(235,16,0,0.10);",
  "  --dark: #FFFFFF;",
  "  --dark-2: #F7F8F9;",
  "  --dark-3: #EFF1F3;",
  "  --dark-4: #E5E8EB;",
  "  --border: rgba(14,14,14,0.10);",
  "  --border-light: rgba(14,14,14,0.16);",
  "  --text: #16181C;",
  "  --text-2: rgba(22,24,28,0.68);",
  "  --text-3: rgba(22,24,28,0.48);",
  "  --accent: #0257BF;",
  "  --success: #0F6B4E;",
  "  --warning: #B45309;",
  "  --danger: #C0252D;",
  "  --purple: #6B27A8;",
  "  --teal: #0A7373;",
];

/* Se localiza el bloque por su contenido, no por número de línea, para que no
   se descoloque si el fichero se regenera. */
const iRoot = li.findIndex((l) => l.trim() === ":root {");
if (iRoot < 0) throw new Error("no encuentro el bloque :root");
const iLogo = li.findIndex((l, k) => k > iRoot && l.includes("--logo:"));
if (iLogo < 0) throw new Error("no encuentro la ficha --logo");
const PRIMERA_FICHA = iRoot + 1;
const ULTIMA_FICHA = iLogo - 1;   // la de --logo se queda tal cual

const antesRoot = li.slice(PRIMERA_FICHA, ULTIMA_FICHA + 1);
if (antesRoot.length !== FICHAS_CLARAS.length - 1) {
  throw new Error(`el bloque :root tiene ${antesRoot.length} fichas y esperaba ${FICHAS_CLARAS.length - 1}`);
}
li.splice(PRIMERA_FICHA, antesRoot.length, ...FICHAS_CLARAS);
/* El bloque creció en una línea (--red-ink). Todo lo de abajo se corre uno. */
const CORRIMIENTO = FICHAS_CLARAS.length - antesRoot.length;
const DESDE = ULTIMA_FICHA + 1;

/* ── 2. Los cambios acordados ───────────────────────────────────────────── */

/* ── Correcciones a mano, después de revisar lo que rechazó el guardián ──────
   Son las tres cosas que los agentes hicieron mal o dejaron a medias. Van
   escritas aquí, con su porqué, y no en el JSON, para que se vean. */
const CORRECCIONES = [
  {
    /* El icono de la tarjeta tiene cuatro trazos del mismo verde. Tres se
       pasaron al verde hondo que se lee sobre blanco y el cuarto se quedó
       atrás porque el agente copió mal la línea original. Con #10b981 sobre
       blanco el contraste es 2,24:1 y el trazo desaparece. */
    linea: 2073,
    antes: '            <path d="M15.5 14l1 1 2-2" stroke="#10b981" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
    despues: '            <path d="M15.5 14l1 1 2-2" stroke="#059669" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
    rol: "corrección",
    motivo: "el cuarto trazo del icono se quedó en el verde claro; los otros tres ya son #059669",
  },
  {
    /* Mismo caso: el cambio era bueno pero el agente puso un espacio de más
       antes de la barra de cierre y no coincidía. El carril del anillo en
       blanco al 6% sobre un panel claro no se ve. */
    linea: 2422,
    antes: '                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="12"/>',
    despues: '                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(14,14,14,0.09)" stroke-width="12"/>',
    rol: "corrección",
    motivo: "carril del anillo del marcador: blanco al 6% sobre panel claro es invisible",
  },
];

/* ── Reversiones: los agentes tocaron cosas que no eran color ───────────────
   Encogieron el desenfoque de tres sombras. Se les dijo expresamente que
   desplazamientos y desenfoque quedaban intactos: se devuelven al original y
   se les deja sólo el cambio de color. */
/* Se guardan el valor ROTO y el bueno, no un patrón: si sólo se busca
   «0 4px <lo que sea>px», la segunda reversión encuentra la línea que acaba de
   arreglar la primera y la vuelve a estropear. Ya pasó. */
const REVERSIONES = [
  { encogido: "0 4px 14px", original: "0 4px 20px" },
  { encogido: "0 8px 24px", original: "0 8px 32px" },
  { encogido: "0 4px 12px", original: "0 4px 16px" },
];

const cambios = JSON.parse(fs.readFileSync(CAMBIOS, "utf8")).concat(CORRECCIONES);
const aplicados = [];
const fallidos = [];
const dentroDeRoot = [];
const yaHechos = new Map();

/**
 * Encuentra la línea de un cambio POR SU CONTENIDO, no por su número.
 *
 * Los números de línea vienen de cuando los agentes leyeron el fichero, y
 * cualquier arreglo posterior que añada o quite una línea los descoloca todos
 * de golpe. Buscando el texto exacto eso deja de importar. El número sólo se
 * usa para desempatar cuando la misma línea aparece varias veces.
 */
function dondeEsta(texto, pista) {
  const donde = [];
  for (let i = 0; i < li.length; i++) if (li[i] === texto) donde.push(i);
  if (donde.length === 0) return -1;
  if (donde.length === 1) return donde[0];
  let mejor = donde[0];
  for (const i of donde) if (Math.abs(i - (pista - 1)) < Math.abs(mejor - (pista - 1))) mejor = i;
  return mejor;
}

for (const c of cambios) {
  /* Lo que decidí yo sobre las fichas manda sobre lo que proponga un agente. */
  if (c.linea > iRoot && c.linea <= ULTIMA_FICHA + 1) { dentroDeRoot.push(c.linea); continue; }

  let idx = dondeEsta(c.antes, c.linea);

  /* Si no aparece, puede que otro cambio ya haya tocado esa misma línea: se
     mira si lo que hay es justo lo que dejó el anterior. */
  if (idx < 0) {
    const yaPuesto = dondeEsta(c.despues, c.linea);
    if (yaPuesto >= 0 && yaHechos.has(yaPuesto)) { aplicados.push(c); continue; }
    fallidos.push({
      l: c.linea,
      por: "no encuentro esa línea en el fichero",
      esperaba: c.antes.slice(0, 90),
      hay: String(li[c.linea - 1]).slice(0, 90),
    });
    continue;
  }

  li[idx] = c.despues;
  yaHechos.set(idx, c.despues);
  aplicados.push(c);
}

/* ── Retoques: cambios de color por trozo, no por línea entera ──────────────
   Cuando una línea se edita después por otro motivo —meterle un SVG, por
   ejemplo—, su cambio de color se cae porque el «antes» ya no coincide. Estos
   van por substring, así que sobreviven a eso. Se exige una única aparición:
   si sale dos veces o ninguna, falla en vez de acertar por casualidad. */
const RETOQUES = [
  {
    /* Texto destacado del aviso de cookies. Se perdió al meter el SVG de la
       flecha en esa misma línea; sobre el panel claro quedaba casi blanco. */
    linea: 3103,
    buscar: "color:rgba(240,240,240,0.8)",
    poner: "color:rgba(22,24,28,0.85)",
    motivo: "texto destacado del aviso de cookies: casi blanco sobre panel claro",
  },
  /* La barra de arriba va en oscuro también en la versión clara. El guion de
     desplazamiento le pone el fondo EN LÍNEA, y un estilo en línea gana a la
     hoja: si estos dos no se devuelven al oscuro, la barra se pone blanca en
     cuanto se baja la página. */
  {
    linea: 0,
    buscar: "nav.style.background = 'rgba(255,255,255,0.97)'",
    poner: "nav.style.background = 'rgba(14,14,14,0.97)'",
    motivo: "barra al desplazar: se queda oscura",
  },
  {
    linea: 0,
    buscar: "nav.style.background = 'rgba(255,255,255,0.85)'",
    poner: "nav.style.background = 'rgba(14,14,14,0.85)'",
    motivo: "barra en reposo: se queda oscura",
  },
];
const retocadas = [];
for (const r of RETOQUES) {
  const idx = li.findIndex((l) => l.includes(r.buscar));
  const veces = idx < 0 ? 0 : String(li[idx]).split(r.buscar).length - 1;
  if (veces !== 1) {
    fallidos.push({ l: r.linea, por: `el retoque «${r.buscar}» aparece ${veces} veces, esperaba 1` });
    continue;
  }
  li[idx] = li[idx].split(r.buscar).join(r.poner);
  retocadas.push(r.linea);
}

/* Se devuelve el desenfoque original a las sombras que lo perdieron. */
const revertidas = [];
for (const r of REVERSIONES) {
  const donde = [];
  for (let i = 0; i < li.length; i++) {
    if (li[i].includes("box-shadow") && li[i].includes(r.encogido)) donde.push(i);
  }
  if (donde.length !== 1) {
    fallidos.push({ l: 0, por: `la sombra encogida «${r.encogido}» aparece ${donde.length} veces, esperaba 1` });
    continue;
  }
  li[donde[0]] = li[donde[0]].split(r.encogido).join(r.original);
  revertidas.push(donde[0] + 1);
}

/* ── 3. La prueba: sólo pueden haber cambiado colores ───────────────────── */

/* `pelado` vive en _tema.cjs, compartido con el validador: si cada guion
   tuviera el suyo, uno acabaría dando por bueno lo que el otro rechaza. */
const antesPelado = pelado(CRUDO.split("\r\n").join("\n")).split("\n").filter((l) => l.trim() !== "");
const salida = li.join("\n");
const despuesPelado = pelado(salida).split("\n").filter((l) => l.trim() !== "");

const desvios = [];
const n = Math.max(antesPelado.length, despuesPelado.length);
for (let i = 0; i < n; i++) {
  if (antesPelado[i] !== despuesPelado[i]) {
    desvios.push({ i, antes: String(antesPelado[i]).trim().slice(0, 120), despues: String(despuesPelado[i]).trim().slice(0, 120) });
    if (desvios.length > 12) break;
  }
}

console.log("fichas del tema claro escritas:", FICHAS_CLARAS.length);
console.log("cambios propuestos:", cambios.length);
console.log("  aplicados:", aplicados.length);
console.log("  descartados por no coincidir:", fallidos.length);
console.log("  ignorados por caer en :root:", dentroDeRoot.length);
if (fallidos.length) {
  console.log("\n-- los descartados --");
  for (const f of fallidos.slice(0, 25)) {
    console.log(`  L${f.l}: ${f.por}`);
    if (f.esperaba !== undefined) {
      console.log(`     esperaba: ${JSON.stringify(f.esperaba)}`);
      console.log(`     hay:      ${JSON.stringify(f.hay)}`);
    }
  }
  if (fallidos.length > 25) console.log(`  ... y ${fallidos.length - 25} más`);
}

console.log("\nPRUEBA · quitando todos los colores, ¿son el mismo fichero?");
if (desvios.length) {
  console.log("  NO. Se cambió algo que no era color:");
  for (const d of desvios) {
    console.log(`  linea ~${d.i + 1}`);
    console.log(`    antes:   ${d.antes}`);
    console.log(`    despues: ${d.despues}`);
  }
  process.exitCode = 1;
} else {
  console.log("  SÍ. Sólo cambiaron colores: estructura, textos y comportamiento intactos.");
}

/* ── 4. ¿Queda algo en tema oscuro? ─────────────────────────────────────────
   Qué blanco es legítimo y cuál es un resto lo decide _tema.cjs, el mismo
   módulo que usa el validador. */
const { restos, excepcionadas, huerfanas } = restosDeTemaOscuro(li);
console.log("\nrastros de tema oscuro sin justificar:", restos.length);
for (const x of restos.slice(0, 25)) console.log("  L" + x.n + ": " + x.l);
for (const e of excepcionadas) console.log("  (excepción justificada L" + e.n + ": " + e.porque + ")");
for (const m of huerfanas) console.log("  AVISO: la excepción de «" + m + "» ya no hace falta — revísala");
if (restos.length) process.exitCode = 1;
if (revertidas.length) console.log("\ndesenfoques devueltos al original: lineas " + revertidas.join(", "));

fs.writeFileSync(CLARO, ERA_CRLF ? salida.split("\n").join("\r\n") : salida);
console.log("\nescrito:", CLARO, "|", salida.length, "bytes |", li.length, "lineas");
