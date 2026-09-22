/**
 * EL MAPA DEL SITIO Y LA CARTA A LOS RASTREADORES.
 *
 *   node fuente/seo/mapa.cjs
 *
 * Escribe `sitemap.xml` y `robots.txt` en la raíz. No existían: hasta hoy, un
 * buscador que llegara a clerigo.io tenía que adivinar qué páginas hay
 * siguiendo enlaces, y las dos versiones de idioma le llegaban como dos sitios
 * que se parecen mucho, que es justo lo que penaliza por contenido duplicado.
 *
 * ── LO QUE HACE EL `xhtml:link` DE CADA ENTRADA ───────────────────────────
 *
 * Cada dirección se declara CON SUS DOS VERSIONES dentro, y las dos se
 * apuntan la una a la otra. Eso es lo que le dice a Google «esto no son dos
 * páginas parecidas, es la misma en dos idiomas»: entonces indexa las dos, no
 * las hace competir entre sí, y a quien busca en castellano le enseña la
 * castellana. Sin eso, se elige una y la otra desaparece.
 *
 * El `hreflang="x-default"` apunta al inglés porque el inglés es lo que se
 * sirve en la raíz.
 *
 * ── UNA ADVERTENCIA SOBRE DÓNDE VIVE ESTO HOY ─────────────────────────────
 *
 * `robots.txt` sólo lo lee el buscador si está en la RAÍZ DEL DOMINIO. Hoy el
 * sitio se sirve desde `4rch3m1r.github.io/clerigo-landing/`, así que el
 * fichero acaba en `…/clerigo-landing/robots.txt`, que nadie mira: el que
 * manda es `4rch3m1r.github.io/robots.txt`, y ése no es nuestro. El sitemap sí
 * funciona igual, porque se entrega a mano en Search Console.
 *
 * En cuanto clerigo.io sirva estas páginas —hoy sirve una copia vieja—, se
 * cambia «base» en fuente/sitio.json, se vuelve a correr esto, y las dos cosas
 * caen en su sitio y funcionan.
 */
const fs = require("node:fs");
const path = require("node:path");
const { PAGINAS, NO_INDEXAR, FUERA_DEL_MAPA, BASE } = require("./posicionar.cjs");
const { CASTELLANO, INGLES } = require("../donde.cjs");

const RAIZ = path.join(__dirname, "..", "..");

/* LA FECHA EN QUE CAMBIÓ EL CONTENIDO, no la de hoy ni la del fichero.
   Poner hoy en todas las páginas cada vez que se genera es decirle al buscador
   que todo el sitio cambió, todos los días. Deja de creerse las fechas, y con
   ellas deja de creerse la que sí importa el día que algo cambie de verdad.

   La fecha del fichero en disco —lo que se usaba— tampoco sirve: el pipeline
   REESCRIBE las catorce páginas en cada pasada aunque salgan idénticas, y un
   `git checkout` también la mueve. El 2026-09-21 se cambió sólo la página
   legal y el sitemap salió con las catorce direcciones fechadas ese día.

   Así que se le pregunta a git, que sabe cuándo cambió de verdad cada cosa:
     · si la página difiere de lo confirmado, es que cambia AHORA → hoy;
     · si no, la fecha del último commit que la tocó.
   Sin git a mano —un despliegue que copie los ficheros sin el historial—, se
   conserva la fecha que ya traía el sitemap para esa dirección; y sólo si no
   hay ninguna, la de hoy. */
const hoy = () => new Date().toISOString().slice(0, 10);
const { execFileSync } = require("node:child_process");
const FECHAS_PREVIAS = (() => {
  try {
    const previo = fs.readFileSync(path.join(RAIZ, "sitemap.xml"), "utf8");
    return Object.fromEntries([...previo.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)].map((m) => [m[1], m[2]]));
  } catch { return {}; }
})();

function cuandoCambió(f, url) {
  const rel = path.relative(RAIZ, f).split(path.sep).join("/");
  const git = (args) => execFileSync("git", ["-C", RAIZ, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  try {
    /* `diff --quiet` sale con 1 si hay diferencias y con 0 si no. Cualquier
       otra cosa es que git no está o esto no es un repositorio. */
    try { execFileSync("git", ["-C", RAIZ, "diff", "--quiet", "HEAD", "--", rel], { stdio: "ignore" }); }
    catch (e) { if (e.status === 1) return hoy(); throw e; }
    const fecha = git(["log", "-1", "--format=%cs", "--", rel]);
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
  } catch { /* sin git: abajo */ }
  return FECHAS_PREVIAS[url] || hoy();
}

const entradas = [];
for (const p of PAGINAS) {
  if (NO_INDEXAR.includes(p.slug) || FUERA_DEL_MAPA.includes(p.slug)) continue;
  /* La ruta pública va sin extensión —Cloudflare sirve /marcos y redirige
     desde /marcos.html—, pero para leer la FECHA hay que abrir el fichero de
     verdad, que sí la tiene. Son dos cosas distintas y por eso van separadas. */
  /* Dos nombres, uno por idioma: tres páginas cambiaron de nombre al pasar a
     inglés y aquí se usaba el castellano para las dos. */
  const enIngles = BASE + "/" + p.ruta.en;
  const enCastellano = BASE + "/es/" + p.ruta.es;
  const alternativas = [
    `    <xhtml:link rel="alternate" hreflang="en" href="${enIngles}"/>`,
    `    <xhtml:link rel="alternate" hreflang="es" href="${enCastellano}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${enIngles}"/>`,
  ].join("\n");

  for (const [url, carpeta, idi] of [[enIngles, INGLES, "en"], [enCastellano, CASTELLANO, "es"]]) {
    entradas.push([
      "  <url>",
      `    <loc>${url}</loc>`,
      `    <lastmod>${cuandoCambió(path.join(carpeta, p.disco[idi]), url)}</lastmod>`,
      `    <changefreq>${p.slug === "index" ? "weekly" : "monthly"}</changefreq>`,
      `    <priority>${p.prioridad}</priority>`,
      alternativas,
      "  </url>",
    ].join("\n"));
  }
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
  '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...entradas,
  "</urlset>",
  "",
].join("\n");

/* Ojo con lo que NO se prohíbe.
   `oscuro.html` es la misma portada con otra piel y no debe indexarse, pero se
   deja pasar al rastreador A PROPÓSITO: la orden de no indexar va dentro de la
   página, y si aquí se le prohibiera entrar, no llegaría a leerla y la
   indexaría igual por los enlaces que le llegan. Prohibir e impedir que lea la
   prohibición es el error clásico. */
const robots = [
  "# Clèrigo — " + BASE,
  "#",
  "# La portada oscura no se prohíbe aquí a propósito: lleva «noindex» dentro,",
  "# y para leerlo hay que dejar entrar. Prohibir el paso haría que no llegara",
  "# a leer la prohibición y la indexara igual.",
  "",
  "User-agent: *",
  "Allow: /",
  "",
  "Sitemap: " + BASE + "/sitemap.xml",
  "",
].join("\n");

fs.writeFileSync(path.join(RAIZ, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(RAIZ, "robots.txt"), robots);

console.log(`\n  sitemap.xml  ${entradas.length} direcciones (${entradas.length / 2} páginas × 2 idiomas)`);
console.log(`  robots.txt   apunta al sitemap`);
console.log(`  base:        ${BASE}\n`);
