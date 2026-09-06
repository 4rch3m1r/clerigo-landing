/**
 * Rompe una página a propósito, catorce veces, y comprueba que la guarda lo ve.
 *
 * Una guarda que nunca ha fallado no se sabe si mira. Y hay una manera muy
 * fácil de escribir una que no mira nada: que ya esté fallando por otro motivo
 * y todo le parezca roto. Por eso lo primero que hace esto es exigir que la
 * página esté VERDE antes de tocarla; si no lo está, no dice nada y se para.
 *
 *   node fuente/paginas/mutar.cjs           sobre contacto.html
 *   node fuente/paginas/mutar.cjs marcos    sobre otra
 */
const path = require("node:path");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");

const AQUI = __dirname;
const RAIZ = path.join(AQUI, "..", "..");
const SLUG = process.argv[2] || "contacto";
const FICHERO = path.join(RAIZ, SLUG + ".html");

function guarda() {
  try {
    return { codigo: 0, salida: execFileSync("node", ["validar.cjs", SLUG], { cwd: AQUI, encoding: "utf8" }) };
  } catch (e) {
    return { codigo: e.status || 1, salida: e.stdout || "" };
  }
}

if (!fs.existsSync(FICHERO)) {
  console.error(`No existe ${SLUG}.html. Primero se escribe la página, luego se rompe.`);
  process.exit(1);
}

const bueno = fs.readFileSync(FICHERO, "utf8");
const limpio = guarda();
if (limpio.codigo !== 0) {
  console.error(`\n  ${SLUG}.html no está en verde: romperlo no demostraría nada.`);
  console.error("  Deja la guarda en TODO PASA y vuelve.\n");
  console.error((limpio.salida.match(/^ {2}MAL .*/gm) || []).join("\n"));
  process.exit(1);
}

/** Cada mutación devuelve el texto roto, o null si no encontró dónde morder. */
const MUTANTES = [
  ["cambiar una palabra que se lee", (s) => {
    const m = s.slice(s.indexOf('<main class="pagina">')).match(/>([^<>]*\b[a-záéíóúñ]{7,}\b[^<>]*)</);
    if (!m) return null;
    return s.replace(m[0], m[0].replace(/([a-záéíóúñ]{7,})/, (p) => p + "z"));
  }],
  ["quitar un párrafo entero", (s) => {
    const m = s.slice(s.indexOf('<main class="pagina">')).match(/<p\b[^>]*>[\s\S]{60,}?<\/p>/);
    return m ? s.replace(m[0], "") : null;
  }],
  ["colar un rótulo que nadie pidió", (s) =>
    s.replace('<main class="pagina">', '<main class="pagina">\n<div>Novedad</div>')],
  ["cambiar una palabra de dentro del guion", (s) => {
    const guiones = [...s.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)];
    for (const g of guiones) {
      const m = g[1].match(/'([^'\n]*[a-záéíóúñ]{5,}\s+[a-záéíóúñ]{4,}[^'\n]*)'/);
      if (m) return s.replace(m[0], m[0].replace(/([a-záéíóúñ]{5,})/, (p) => p + "z"));
    }
    return null;
  }],
  ["quitar un campo del formulario", (s) => {
    const m = s.match(/<input\b[^>]*>/);
    return m ? s.replace(m[0], "") : null;
  }],
  ["desconectar un botón", (s) => {
    const m = s.match(/\sonclick="[^"]*"/);
    return m ? s.replace(m[0], "") : null;
  }],
  ["renombrar un identificador", (s) => {
    const trozo = s.slice(s.indexOf('<main class="pagina">'));
    const m = trozo.match(/\bid="([^"]+)"/);
    return m ? s.replace(m[0], `id="${m[1]}Z"`) : null;
  }],
  ["tocar la barra de la plantilla", (s) =>
    s.includes('<span class="nav-logo-text">Clèrigo <small>XGRC</small></span>')
      ? s.replace('<span class="nav-logo-text">Clèrigo <small>XGRC</small></span>',
        '<span class="nav-logo-text">Clèrigo <small>GRC</small></span>')
      : s.replace(".nav-logo-text small {", ".nav-logo-text  small {")],
  ["dejarse un fondo del tema oscuro", (s) =>
    s.replace("/* ── LO DE LA PÁGINA", ".zzz { background: #0E0E0E; }\n/* ── LO DE LA PÁGINA")],
  ["dejarse una tinta del tema oscuro", (s) =>
    s.replace("/* ── LO DE LA PÁGINA", ".zzz { color: rgba(240,240,240,0.65); }\n/* ── LO DE LA PÁGINA")],
  /* El pictograma se escribe por su número y no como carácter: el proyecto los
     tiene prohibidos también en el código, y aquí hace falta uno de verdad
     para que la comprobación tenga a qué morder. */
  ["colar un emoji", (s) =>
    s.replace('<main class="pagina">',
      '<main class="pagina">\n<div>' + String.fromCodePoint(0x1F3E6) + "</div>")],
  ["colar otra tipografía", (s) =>
    s.replace("/* ── LO DE LA PÁGINA", ".zzz { font-family: 'DM Serif Display', serif; }\n/* ── LO DE LA PÁGINA")],
  ["enlazar a una página que no existe", (s) =>
    s.replace('<main class="pagina">', '<main class="pagina">\n<a href="inexistente.html"></a>')],
  ["dejarse la marca vieja", (s) =>
    s.replace("</main>", "<!-- viene de Archemir -->\n</main>")],
  ["sacar el cuerpo de su sitio", (s) =>
    s.replace('<main class="pagina">', '<div class="pagina">').replace(/<\/main>(?![\s\S]*<\/main>)/, "</div>")],
];

let visto = 0;
let rotas = 0;
for (const [nombre, romper] of MUTANTES) {
  const malo = romper(bueno);
  if (malo === null || malo === bueno) {
    rotas++;
    console.log("  NO MUERDE     " + nombre + "  ·  la mutación no encontró dónde aplicarse");
    continue;
  }
  fs.writeFileSync(FICHERO, malo);
  const { codigo, salida } = guarda();
  const lo = codigo !== 0;
  if (lo) visto++;
  const cual = (salida.match(/^ {2}MAL .*/gm) || []).map((l) => l.slice(6).split("  ·")[0]);
  console.log((lo ? "  LO VE         " : "  SE LE ESCAPA  ") + nombre
    + (lo ? "  →  " + cual.join(" / ").slice(0, 80) : ""));
}
fs.writeFileSync(FICHERO, bueno);

console.log(`\n${visto}/${MUTANTES.length} mutaciones detectadas sobre ${SLUG}.html · fichero restaurado`);
if (rotas) console.log(`${rotas} mutaciones no encontraron dónde morder: eso NO cuenta como aprobado.`);
process.exitCode = visto === MUTANTES.length ? 0 : 1;
