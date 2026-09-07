/**
 * Rompe el posicionamiento a propósito y comprueba que el validador lo ve.
 *
 *   node fuente/seo/mutar.cjs
 *
 * Aquí hace más falta que en ningún otro sitio del proyecto. Las otras guardas
 * vigilan cosas que además se ven: si la portada se rompe, se nota al abrirla.
 * Ésta vigila lo que sólo lee una máquina. Una comprobación de datos
 * estructurados que no salte nunca es indistinguible de una que funciona, y
 * puede pasarse un año así.
 *
 * Se toca `index.html` y `sitemap.xml`, y se dejan como estaban.
 */
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const AQUI = __dirname;
const RAIZ = path.join(AQUI, "..", "..");
const PORTADA = path.join(RAIZ, "index.html");
const MAPA = path.join(RAIZ, "sitemap.xml");
const ROBOTS = path.join(RAIZ, "robots.txt");

const guardados = {
  [PORTADA]: fs.readFileSync(PORTADA),
  [MAPA]: fs.readFileSync(MAPA),
  [ROBOTS]: fs.readFileSync(ROBOTS),
};
const restaura = () => { for (const [f, b] of Object.entries(guardados)) fs.writeFileSync(f, b); };

function pasa() {
  try { execFileSync("node", ["validar.cjs"], { cwd: AQUI, encoding: "utf8" }); return { ok: true, salida: "" }; }
  catch (e) { return { ok: false, salida: e.stdout || "" }; }
}

/* En verde antes de romper nada. Si el validador ya venía fallando, todas las
   mutaciones salen «detectadas» sin que nadie las haya mirado. */
const limpio = pasa();
if (!limpio.ok) {
  console.error("\n  El posicionamiento no está en verde: romperlo no demostraría nada.");
  console.error((limpio.salida.match(/^  MAL .*/gm) || []).join("\n") + "\n");
  process.exit(1);
}

const MUTANTES = [
  /* ── Lo que se le dice al buscador que haga con la página ────────────── */
  ["sacar la portada del indice", PORTADA,
    (s) => s.replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="noindex, nofollow">')],
  ["quitar la foto grande del resultado", PORTADA,
    (s) => s.replace(/, max-image-preview:large/, "")],
  ["borrar las palabras clave", PORTADA,
    (s) => s.replace(/<meta name="keywords" content="[^"]*">/, "")],

  /* ── El idioma. Es el fallo que estaba de verdad: `es_ES` en la inglesa ─ */
  ["decir que la inglesa es española", PORTADA,
    (s) => s.replace('<meta property="og:locale" content="en_US">',
      '<meta property="og:locale" content="es_ES">')],

  /* ── La ficha de datos ────────────────────────────────────────────────── */
  ["romper la ficha por una coma", PORTADA,
    (s) => s.replace('{"@context"', '{,"@context"')],
  ["que la ficha diga que está en castellano", PORTADA,
    (s) => s.replace('"inLanguage":"en","isPartOf"', '"inLanguage":"es","isPartOf"')],
  ["que la ficha apunte a otra página", PORTADA,
    (s) => s.replace(/("@type":"WebPage"[^}]*?"url":")([^"]*)(")/, "$1https://otro-sitio.example/$3")],
  ["quitar por dónde se navega", PORTADA,
    (s) => s.split('{"@type":"SiteNavigationElement"').join('{"@type":"NadaDeEsto"')],

  /* ── Y lo que no puede estar. Éstas son las dos que importan de verdad:
        no vigilan que algo esté, vigilan que no se INVENTE nada. ────────── */
  ["inventarse cuatro estrellas y 128 reseñas", PORTADA,
    (s) => s.replace('"@type":"WebSite"',
      '"aggregateRating":{"@type":"AggregateRating","ratingValue":"4.8","reviewCount":"128"},"@type":"WebSite"')],
  ["prometer un buscador que no existe", PORTADA,
    (s) => s.replace('"@type":"WebSite"',
      '"potentialAction":{"@type":"SearchAction","target":"https://clerigo.io/?q={q}"},"@type":"WebSite"')],

  /* ── El mapa del sitio ────────────────────────────────────────────────── */
  ["meter la portada oscura en el mapa", MAPA,
    (s) => s.replace("</urlset>",
      "  <url>\n    <loc>https://4rch3m1r.github.io/clerigo-landing/oscuro.html</loc>\n  </url>\n</urlset>")],
  ["quitarle a una entrada sus idiomas", MAPA,
    (s) => s.replace(/[ \t]*<xhtml:link rel="alternate" hreflang="es"[^\n]*\n/, "")],
  ["prometer una página que no existe", MAPA,
    (s) => s.replace(/<loc>([^<]*)legal\.html<\/loc>/, "<loc>$1inexistente.html</loc>")],

  /* ── La carta a los rastreadores ──────────────────────────────────────── */
  ["cerrarle el sitio entero al buscador", ROBOTS,
    (s) => s.replace("Allow: /", "Disallow: /")],
  ["prohibir la página que lleva su propio noindex", ROBOTS,
    (s) => s.replace("Allow: /", "Allow: /\nDisallow: /oscuro.html")],
  ["quitar el mapa del robots", ROBOTS,
    (s) => s.replace(/Sitemap: .*/, "")],
];

let visto = 0;
for (const [nombre, fichero, romper] of MUTANTES) {
  fs.writeFileSync(fichero, romper(guardados[fichero].toString("utf8")));
  const r = pasa();
  const motivos = (r.salida.match(/^  MAL (.*?)(?:  ·.*)?$/gm) || [])
    .map((l) => l.replace(/^  MAL /, "").trim()).slice(0, 1).join("");
  if (!r.ok) { visto++; console.log("  LO VE  " + nombre.padEnd(46) + " →  " + motivos.slice(0, 70)); }
  else console.log("  SE LE ESCAPA  " + nombre);
  restaura();
}

restaura();
console.log(`\n${visto}/${MUTANTES.length} mutaciones detectadas · ficheros restaurados`);
process.exitCode = visto === MUTANTES.length ? 0 : 1;
