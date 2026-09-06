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
/* El castellano es la FUENTE y vive en su carpeta; el validador lo mira ahí.
   Mutando el fichero de la raíz —que ahora es la versión INGLESA— el validador
   no veía ni una: daba 0 de 15, que parece un agujero enorme y en realidad era
   que se estaba rompiendo un fichero que nadie miraba. Ver `fuente/donde.cjs`. */
const { CASTELLANO } = require("../donde.cjs");
const FICHERO = path.join(CASTELLANO, SLUG + ".html");

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

/* Cuatro de las mutaciones sólo tienen sentido si hay un original contra el
   que comparar. En una página escrita de cero no se le escapan a la guarda:
   es que no hay nada que comparar. Decirlo es la diferencia entre un hueco
   real y un hueco imaginario. */
const PAGINAS = require("./paginas.cjs");
const SIN_ORIGINAL = (PAGINAS.find((x) => x.slug === SLUG) || {}).sinOriginal === true;
const PIDEN_ORIGINAL = new Set([
  "cambiar una palabra que se lee",
  "quitar un párrafo entero",
  "colar un rótulo que nadie pidió",
  "cambiar una palabra de dentro del guion",
  "renombrar un identificador",
]);

/* Y otras cuatro sólo aplican a una página que TENGA afirmaciones declaradas:
   son las que cambian lo que la página promete. En las demás no hay nada que
   romper, y contarlas como escapadas sería inventarse un hueco. */
const AFIRMACIONES = JSON.parse(fs.readFileSync(path.join(AQUI, "afirmaciones.json"), "utf8"));
const TIENE_AFIRMACIONES = Boolean(AFIRMACIONES[SLUG]);
const PIDEN_AFIRMACIONES = new Set([
  "decir que la ISO ya está obtenida",
  "prometer cifrado en reposo",
  "borrar el nombre del auditor",
  "llamar certificación al informe SOC 2",
]);

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
  /* Las afirmaciones de una página escrita de cero. Sólo se le pueden aplicar
     a la que las tiene declaradas; en las demás no hay nada que romper. */
  ["decir que la ISO ya está obtenida", (s) => s.replace("certificación está en curso", "certificación está obtenida")],
  ["prometer cifrado en reposo", (s) =>
    s.replace('<main class="pagina">', '<main class="pagina">\n<p>Cifrado en reposo.</p>')],
  ["borrar el nombre del auditor", (s) => s.replace("We2Sec", "un tercero")],
  ["llamar certificación al informe SOC 2", (s) => s.replace("informe SOC 2 Tipo II se entrega", "certificación SOC 2 se entrega")],
  ["sacar el cuerpo de su sitio", (s) =>
    s.replace('<main class="pagina">', '<div class="pagina">').replace(/<\/main>(?![\s\S]*<\/main>)/, "</div>")],
];

let visto = 0;
let rotas = 0;
let noAplican = 0;
for (const [nombre, romper] of MUTANTES) {
  if (SIN_ORIGINAL && PIDEN_ORIGINAL.has(nombre)) {
    noAplican++;
    console.log("  NO APLICA     " + nombre + "  ·  esta página no sale de ningún original");
    continue;
  }
  if (!TIENE_AFIRMACIONES && PIDEN_AFIRMACIONES.has(nombre)) {
    noAplican++;
    console.log("  NO APLICA     " + nombre + "  ·  esta página no declara afirmaciones propias");
    continue;
  }
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

const cuentan = MUTANTES.length - noAplican;
console.log(`\n${visto}/${cuentan} mutaciones detectadas sobre ${SLUG}.html · fichero restaurado`);
if (noAplican) console.log(`${noAplican} no aplican: esta página no sale de ningún original.`);
if (rotas) console.log(`${rotas} mutaciones no encontraron dónde morder: eso NO cuenta como aprobado.`);
process.exitCode = visto === cuentan ? 0 : 1;
