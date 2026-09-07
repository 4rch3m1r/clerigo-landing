/**
 * EL LANDING Y LA APLICACIÓN DICEN LO MISMO EN LO LEGAL.
 *
 *   node fuente/legal/validar.cjs
 *
 * Se separaron una vez y nadie se enteró: el landing decía que el contrato se
 * rige por las leyes de la República Dominicana y la aplicación decía Delaware;
 * el landing publicaba el domicilio en Santo Domingo y la aplicación en Estados
 * Unidos; el landing hablaba de cookies no esenciales con consentimiento y la
 * aplicación decía que todas son estrictamente necesarias. Treinta apartados,
 * treinta distintos. Nadie firma dos contratos a la vez, así que uno de los dos
 * estaba mintiendo y no había forma de saber cuál sin leerlos en paralelo.
 *
 * Esto lo convierte en un fallo que salta.
 *
 * DOS COMPROBACIONES, Y HACEN FALTA LAS DOS:
 *
 *   1. La página contra la COPIA (`documentos.json`). Corre siempre, también en
 *      un despliegue donde `app-saas` no existe.
 *
 *   2. La copia contra la APLICACIÓN. Sólo si `app-saas` está al lado. Sin
 *      ésta, una copia vieja pasaría la primera tan campante: la página sería
 *      fiel a un texto que ya nadie usa.
 *
 * Se compara el TEXTO, no el marcado: el landing tiene su propia línea gráfica
 * y eso es correcto. Lo que no puede diferir es lo que dice.
 */
const fs = require("node:fs");
const path = require("node:path");

const AQUI = __dirname;
const RAIZ = path.join(AQUI, "..", "..");
const COPIA = path.join(AQUI, "documentos.json");
const PAGINA = path.join(RAIZ, "es", "legal.html");

const fallos = [];
let total = 0;
function comprueba(punto, condicion, detalle) {
  total++;
  const ok = !!condicion;
  if (!ok) fallos.push(punto + (detalle ? " — " + detalle : ""));
  console.log((ok ? "  OK  " : "  MAL ") + punto + (detalle && !ok ? "  ·  " + detalle : ""));
}

/**
 * El texto de un trozo de HTML, sin etiquetas.
 *
 * El espacio que deja una etiqueta al desaparecer se come si va justo antes de
 * un signo de puntuación: `<a>correo@x</a>.` tiene que dar `correo@x.` y no
 * `correo@x .`, que es una diferencia del marcado y no del contrato.
 */
const limpia = (t) => String(t)
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/\s+/g, " ")
  .replace(/\s+([.,;:)])/g, "$1")
  .trim();

/* «20 de agosto de 2026» a un número ordenable, para saber cuál es la más
   nueva. Comparando las cadenas, «21 de abril» iría por delante de «20 de
   agosto». Es la misma cuenta que hace `aplicar.cjs` al escribir la cabecera;
   aquí se rehace a propósito, para no comprobar con la misma pieza que escribe. */
const MESES_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
function comoNumeroSuelto(fecha) {
  const m = /^(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})$/i.exec(String(fecha).trim());
  if (!m) return 0;
  return Number(m[3]) * 10000 + (MESES_ES.indexOf(m[2].toLowerCase()) + 1) * 100 + Number(m[1]);
}

/** Todo el texto de una sección de la copia, en orden. */
function textoDeLaCopia(sec) {
  const p = [];
  for (const b of sec.bloques) {
    if (b.t === "p" || b.t === "aviso") p.push(limpia(b.texto));
    else if (b.t === "lista") b.items.forEach((i) => p.push(limpia((i.fuerte ? i.fuerte + " " : "") + i.texto)));
    else if (b.t === "tabla") { p.push(b.cols.map(limpia).join(" ")); b.filas.forEach((f) => p.push(f.map(limpia).join(" "))); }
  }
  return p.join(" ");
}

/** Lo que hay entre un <h3> numerado y el siguiente, por apartado. */
function apartadosDeLaPagina(html) {
  const fuera = new Map();
  const re = /<h3><span class="num">(\d+)<\/span>\s*([^<]+)<\/h3>([\s\S]*?)(?=<h3><span class="num">|<\/section>|<section )/g;
  let m;
  while ((m = re.exec(html))) {
    const clave = m[1] + "|" + limpia(m[2]);
    if (!fuera.has(clave)) fuera.set(clave, limpia(m[3]));
  }
  return fuera;
}

const copia = JSON.parse(fs.readFileSync(COPIA, "utf8"));
const html = fs.readFileSync(PAGINA, "utf8");
const enLaPagina = apartadosDeLaPagina(html);

console.log("── La página castellana dice lo que dice la copia ──────────────");
let cuantos = 0;
for (const d of copia.documentos) {
  for (const s of d.secciones) {
    cuantos++;
    const clave = s.n + "|" + limpia(s.titulo);
    const dePagina = enLaPagina.get(clave);
    const deCopia = textoDeLaCopia(s);
    if (dePagina === undefined) {
      comprueba(`${d.id} ${s.n}: el apartado está en la página`, false, "no aparece «" + s.titulo + "»");
      continue;
    }
    let corte = -1;
    const a = deCopia.split(" "), b = dePagina.split(" ");
    for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) { corte = i; break; }
    comprueba(`${d.id} ${s.n} ${s.titulo}`, corte === -1,
      corte === -1 ? "" : "en la palabra " + (corte + 1) + ": la app dice «" +
        a.slice(corte, corte + 8).join(" ") + "» y la página «" + b.slice(corte, corte + 8).join(" ") + "»");
  }
  /* Y la fecha, que también obliga: un documento con fecha vieja delante hace
     dudar de todo lo que hay debajo. */
  const seccion = { terminos: "section-terms", privacidad: "section-privacy", cookies: "section-cookies" }[d.id];
  const i = html.indexOf('id="' + seccion + '"');
  const trozo = i < 0 ? "" : html.slice(i, html.indexOf("</section>", i));
  const fecha = (trozo.match(/Última actualización:\s*<strong>([^<]*)<\/strong>/) || [])[1];
  comprueba(`${d.id}: la fecha de actualización es la de la aplicación`, fecha === d.actualizado,
    "la página dice «" + fecha + "» y la aplicación «" + d.actualizado + "»");
}
comprueba("están los " + cuantos + " apartados y ni uno de más", enLaPagina.size === cuantos,
  "la página tiene " + enLaPagina.size);

/* ── LA CABECERA NO PUEDE CONTRADECIR AL CONTRATO ───────────────────────
 *
 * La cabecera resume el contrato en cuatro datos. Decía «Versión 2.1» con la
 * aplicación en la 2.4, «Última revisión: 11 de marzo» con los documentos de
 * agosto, y «Jurisdicción: República Dominicana» mientras el apartado 12 decía
 * Delaware. Un resumen que contradice a lo resumido es peor que no resumir.
 *
 * La jurisdicción no sale de un campo de la aplicación —no lo tiene—, así que
 * se declara en `aplicar.cjs`. Lo que se comprueba aquí es que esa frase
 * APAREZCA DE VERDAD en el apartado de ley aplicable: declarada, no inventada. */
const { JURISDICCION } = require("./aplicar.cjs");
const enCabecera = (rotulo) => (html.match(
  new RegExp("<span><strong>" + rotulo + ":</strong>([^<]*)</span>")) || [])[1];

comprueba("la cabecera dice la versión de la aplicación",
  (enCabecera("Versión") || "").trim() === copia.version,
  "la cabecera dice «" + (enCabecera("Versión") || "").trim() + "» y la aplicación va por la " + copia.version);

const masReciente = copia.documentos.map((d) => d.actualizado)
  .reduce((a, b) => (comoNumeroSuelto(b) > comoNumeroSuelto(a) ? b : a));
comprueba("la cabecera dice la última revisión de verdad",
  (enCabecera("Última revisión") || "").trim() === masReciente,
  "la cabecera dice «" + (enCabecera("Última revisión") || "").trim() + "» y el documento más nuevo es de " + masReciente);

const leyAplicable = copia.documentos.find((d) => d.id === "terminos")
  .secciones.find((s) => /Ley Aplicable/i.test(s.titulo));
const textoLey = leyAplicable ? textoDeLaCopia(leyAplicable) : "";
comprueba("la jurisdicción de la cabecera es la que dice el apartado de ley aplicable",
  (enCabecera("Jurisdicción") || "").trim() === JURISDICCION.rotulo &&
  textoLey.includes(JURISDICCION.enElTexto),
  "la cabecera dice «" + (enCabecera("Jurisdicción") || "").trim() + "» y el contrato " +
  (textoLey.includes(JURISDICCION.enElTexto) ? "sí" : "NO") + " dice «" + JURISDICCION.enElTexto + "»");

console.log("\n── La copia está al día respecto a la aplicación ───────────────");
let importar;
try { importar = require("./traer-de-la-app.cjs"); } catch { importar = null; }
let deLaApp = null;
try { deLaApp = importar && importar.documentosDeLaApp(); } catch (e) { deLaApp = null; }

if (!deLaApp) {
  console.log("  ..  app-saas no está al lado: esta mitad no se puede comprobar aquí.");
  console.log("      Es lo normal en un despliegue. Con el repositorio delante, correr:");
  console.log("      node fuente/legal/traer-de-la-app.cjs && node fuente/legal/aplicar.cjs");
} else {
  comprueba("la versión de la copia es la de la aplicación",
    copia.version === deLaApp.VERSION, "copia " + copia.version + ", aplicación " + deLaApp.VERSION);
  for (const dApp of deLaApp.DOCUMENTOS) {
    const dCopia = copia.documentos.find((x) => x.id === dApp.id);
    if (!dCopia) { comprueba(`la copia trae ${dApp.id}`, false); continue; }
    comprueba(`${dApp.id}: la copia dice lo mismo que la aplicación, palabra por palabra`,
      JSON.stringify(dCopia) === JSON.stringify(dApp),
      "han cambiado el texto en la aplicación: hay que refrescar la copia");
  }
}

console.log("\n  " + (total - fallos.length) + " de " + total + " comprobaciones");
if (fallos.length) {
  console.log("\n  " + fallos.length + " MAL:");
  fallos.forEach((f) => console.log("    · " + f));
  process.exitCode = 1;
}
