/**
 * LA GARANTÍA BILINGÜE: quitando el texto, la inglesa y la castellana son el
 * MISMO fichero.
 *
 *   node fuente/idiomas/validar.cjs
 *
 * Por qué esto y no leerlas a ojo. Dos versiones de una página se separan
 * despacio y en silencio: se corrige un dato en una, se añade una sección en
 * la otra, se cambia un enlace aquí y allí no. Cuando alguien lo nota, ya hay
 * clientes que han visto la mala. Comparar la ESTRUCTURA —todo menos el
 * texto— convierte eso en un fallo que salta al generar.
 *
 * Lo que SÍ puede cambiar entre las dos, y está declarado aquí:
 *   · el texto, que es de lo que va todo esto;
 *   · el `lang` del documento;
 *   · los dos enlaces del selector de idioma, que apuntan al otro lado;
 *   · la canónica y las alternativas de la cabecera.
 * Cualquier otra diferencia es un fallo.
 */
const fs = require("node:fs");
const path = require("node:path");
const { segmentos, ZONAS_DE_CODIGO, COMENTARIOS } = require("./segmentos.cjs");
const { TODAS } = require("./a-ingles.cjs");
const { CASTELLANO } = require("../donde.cjs");
const { diccionario } = require("./a-ingles.cjs");

/* El diccionario, para saber qué textos se escriben igual en los dos idiomas. */
const DIC = diccionario();

const RAIZ = path.join(__dirname, "..", "..");

const fallos = [];
function comprueba(punto, condicion, detalle) {
  const ok = !!condicion;
  if (!ok) fallos.push(punto + (detalle ? " — " + detalle : ""));
  console.log((ok ? "  OK  " : "  MAL ") + punto + (detalle && !ok ? "  ·  " + detalle : ""));
}

/**
 * La página SIN texto: sólo su esqueleto.
 *
 * Se sustituye cada trozo de texto por una marca del mismo tipo, no se borra:
 * borrarlo dejaría `<p></p>` y dos párrafos vacíos seguidos parecerían uno.
 * Con la marca, un párrafo que se pierda se ve.
 */
function esqueleto(html) {
  const tapado = [];
  let s = html
    .replace(ZONAS_DE_CODIGO, (m) => { tapado.push(m); return "@@Z" + (tapado.length - 1) + "@@"; })
    .replace(COMENTARIOS, (m) => { tapado.push(m); return "@@Z" + (tapado.length - 1) + "@@"; });

  s = s.replace(/>([^<>]+)</g, (todo, dentro) => (dentro.trim() ? ">·<" : todo));
  s = s.replace(/\b(alt|title|placeholder|aria-label)="([^"]+)"/g, '$1="·"');
  s = s.replace(/<title>[^<]+<\/title>/, "<title>·</title>");
  s = s.replace(
    /(<meta[^>]*\b(?:name|property)="(?:description|og:title|og:description|og:image:alt|og:site_name|twitter:title|twitter:description|twitter:image:alt)"[^>]*\bcontent=")([^"]+)(")/gi,
    "$1·$3",
  );

  /* Las cuatro diferencias declaradas se normalizan a la misma cosa. */
  s = s
    .replace(/<html lang="[a-z-]+"/, '<html lang="·"')
    .replace(/<a href="[^"]*" class="idioma" data-idioma="(en|es)" hreflang="\1">/g, '<a class="idioma" data-idioma="$1">')
    /* Las capturas y el icono viven en la RAÍZ y son las mismas en los dos
       idiomas; la castellana está un nivel más adentro y por eso los cita con
       `../`. Se normalizan las dos formas a la misma para poder comparar. */
    .replace(/(\s(?:src|href)=")\.\.\/((?:sistema\/[a-z0-9-]+|favicon)\.png)"/g, '$1$2"')
    .replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="·">')
    /* `og:url` va con la canónica: cada versión declara SU dirección, y la de
       la castellana lleva /es/. Si sólo se normalizara la canónica, esta línea
       saltaría como diferencia de estructura cuando en realidad es la misma
       declaración en dos idiomas. */
    .replace(/<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="·">')
    .replace(/<link rel="alternate" hreflang="[a-z-]+" href="[^"]*">/g, '<link rel="alternate" href="·">');

  return s.replace(/@@Z(\d+)@@/g, (_, i) => tapado[Number(i)]);
}

/* El script del carrusel lleva un rótulo dentro del propio guion, así que se
   compara también: dos versiones no pueden tener guiones distintos. */

console.log("── Las dos versiones son la misma página ──────────────────────");
for (const p of TODAS) {
  const rEn = path.join(RAIZ, p + ".html");
  const rEs = path.join(CASTELLANO, p + ".html");
  if (!fs.existsSync(rEn) || !fs.existsSync(rEs)) {
    comprueba(`${p}: existen las dos versiones`, false,
      (fs.existsSync(rEn) ? "" : "falta la inglesa ") + (fs.existsSync(rEs) ? "" : "falta la castellana"));
    continue;
  }
  const en = fs.readFileSync(rEn, "utf8").split("\r\n").join("\n");
  const es = fs.readFileSync(rEs, "utf8").split("\r\n").join("\n");

  const eEn = esqueleto(en).split("\n");
  const eEs = esqueleto(es).split("\n");
  let primera = -1;
  for (let i = 0; i < Math.max(eEn.length, eEs.length); i++) {
    if (eEn[i] !== eEs[i]) { primera = i; break; }
  }
  comprueba(`${p}: misma estructura quitando el texto`, primera < 0,
    primera < 0 ? "" : `línea ${primera + 1}\n        en: ${(eEn[primera] || "(no hay)").trim().slice(0, 100)}\n        es: ${(eEs[primera] || "(no hay)").trim().slice(0, 100)}`);

  comprueba(`${p}: el idioma declarado es el que toca`,
    /<html lang="en"/.test(en) && /<html lang="es"/.test(es));

  /* Ni una palabra en castellano en la inglesa. Es la otra mitad: la
     estructura puede cuadrar y la página seguir a medio traducir.
     No vale con mirar los trozos de la inglesa: el extractor no sabe distinguir
     idiomas —«Modules» le parece tan lenguaje como «Módulos»— y contaría la
     página entera. Lo que se mira son los trozos de la CASTELLANA que siguen
     apareciendo en la inglesa; y de esos se descuentan los que se escriben
     igual en los dos idiomas, que los hay: «Certified», «Innovation Award
     2026», «CYBERSECURITY FRAMEWORK». */
  const enLaInglesa = new Set(segmentos(en).map((s) => s.texto));
  const restos = segmentos(es)
    .map((s) => s.texto)
    .filter((t) => enLaInglesa.has(t))
    .filter((t) => DIC[t] === undefined || DIC[t] !== t);
  comprueba(`${p}: no queda castellano en la inglesa`, restos.length === 0,
    restos.length ? `${restos.length} trozos, p.ej. «${restos[0].slice(0, 60)}»` : "");

  /* Y la detección de idioma, en las DOS.
     Quitarla no rompe nada que se vea —la página carga igual de bien— y a quien
     llega con el navegador en castellano se le queda el inglés delante sin
     enterarse de que hay otra versión. Va en la cabecera, antes de que se pinte
     nada; si alguien la moviera al final del cuerpo, se vería la página en un
     idioma y saltaría al otro delante de quien la lee. Por eso se comprueba
     también DÓNDE está. */
  for (const [cual, h] of [["inglesa", en], ["castellana", es]]) {
    const i = h.indexOf("/* El idioma del navegador decide");
    comprueba(`${p}: la ${cual} mira el idioma del navegador`, i > 0 && i < h.indexOf("</head>"),
      i < 0 ? "no está" : "está fuera de la cabecera");
  }

  /* Y el selector lleva al mismo sitio desde las dos. */
  const fichero = p === "index" ? "index.html" : p + ".html";
  comprueba(`${p}: el selector de idioma lleva al otro lado`,
    en.includes(`<a href="es/${fichero}" class="idioma" data-idioma="es"`)
    && es.includes(`<a href="../${fichero}" class="idioma" data-idioma="en"`));
}

console.log("\n────────────────────────────────────────────────────────────────");
console.log(fallos.length === 0 ? "TODO PASA" : `FALLAN ${fallos.length}:`);
fallos.forEach((f) => console.log("  · " + f));
process.exitCode = fallos.length ? 1 : 0;
