/**
 * Vuelve a pasar `plantilla.html` por las cinco páginas.
 *
 * Las cinco comparten cabecera, tokens, hoja de estilo, barra y pie, y el
 * validador lo exige letra a letra. Sin esto, cambiar una línea de la plantilla
 * obligaba a repetir el mismo retoque cinco veces a mano, que es exactamente
 * como se separan dos copias del mismo fichero.
 *
 * Lo de cada página —su CSS, su cuerpo y su guion— se respeta tal cual: se
 * recorta por las marcas que la propia plantilla deja puestas y se vuelve a
 * montar alrededor.
 *
 *   node fuente/paginas/sincronizar.cjs
 */
const path = require("node:path");
const fs = require("node:fs");

const AQUI = __dirname;
const RAIZ = path.join(AQUI, "..", "..");
/* El castellano es la FUENTE y vive en su carpeta; el ingles ocupa la raiz.
   Ver `fuente/donde.cjs`, que es donde esta escrito el porque. */
const { CASTELLANO } = require("../donde.cjs");
require("fs").mkdirSync(CASTELLANO, { recursive: true });
const lee = (p) => fs.readFileSync(p, "utf8").split("\r\n").join("\n");

const PLANTILLA = lee(path.join(AQUI, "plantilla.html"));
/* Dónde vive el sitio. Una sola línea, en fuente/sitio.json, y de ahí salen
   todas las direcciones absolutas de las seis páginas. */
const SITIO = JSON.parse(fs.readFileSync(path.join(AQUI, "..", "sitio.json"), "utf8"));
const PAGINAS = require("./paginas.cjs");

/* Las marcas por las que se corta. Están en la plantilla y por tanto en las
   cinco páginas: son el borde entre lo compartido y lo de cada una. */
const M_ESTILO = "/* ── LO DE LA PÁGINA";
const M_OSCURO = "/* ── BARRA Y PIE SIEMPRE EN OSCURO ──";
const M_MAIN = '<main class="pagina">';
const M_FIN_MAIN = "</main>";
/* El guion propio de la página empieza justo después del guion de aparición
   que trae la plantilla, y ése es el primer </script> que hay tras </main>.
   Se busca así, por posición, y no copiando su última línea: la última línea
   cambia cada vez que se toca la plantilla y entonces esto dejaba de encontrar
   nada y se llevaba por delante el guion de la página. */
const M_FIN_REVELADO = "</script>\n";

const iEstilo = PLANTILLA.indexOf("{{ESTILO}}");
const iCuerpo = PLANTILLA.indexOf("{{CUERPO}}");
const iGuion = PLANTILLA.indexOf("{{GUION}}");
const CABECERA = PLANTILLA.slice(0, iEstilo);
const CIERRE = PLANTILLA.slice(iEstilo + "{{ESTILO}}".length, iCuerpo);
const PIE = PLANTILLA.slice(iCuerpo + "{{CUERPO}}".length, iGuion);
const CIERRE_SIN_BARRA = CIERRE.replace(/<!-- ══════════ BARRA ══════════ -->[\s\S]*?<\/nav>\n/, "");
const PIE_SIN_PIE = PIE.replace(/<!-- ══════════ PIE ══════════ -->[\s\S]*?<\/footer>\n/, "");

/** Saca de la página lo que es SUYO y no de la plantilla. */
function despieza(html) {
  const finCabecera = html.indexOf("\n", html.indexOf(M_ESTILO)) + 1;
  const iOscuro = html.indexOf(M_OSCURO);
  const iMain = html.indexOf(M_MAIN);
  const iFinMain = html.lastIndexOf(M_FIN_MAIN);
  const iGuionPropio = html.indexOf(M_FIN_REVELADO, iFinMain);
  for (const [que, donde] of [["el CSS", finCabecera], ["el bloque oscuro", iOscuro],
    ["el <main>", iMain], ["el cierre de <main>", iFinMain], ["el guion", iGuionPropio]]) {
    if (donde < 0) throw new Error(`no encuentro ${que}: la página no sale de esta plantilla`);
  }
  return {
    estilo: html.slice(finCabecera, iOscuro),
    cuerpo: html.slice(iMain + M_MAIN.length, iFinMain),
    guion: html.slice(iGuionPropio + M_FIN_REVELADO.length),
  };
}

let tocadas = 0;
for (const { slug, chrome } of PAGINAS) {
  const f = path.join(CASTELLANO, slug + ".html");
  if (!fs.existsSync(f)) { console.log(`  ·  ${slug}.html todavía no existe`); continue; }
  const antes = lee(f);

  const titulo = (antes.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  const desc = (antes.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
  /* La canónica y la tarjeta salen de sitio.json y del nombre de la página, no
     de lo que la página diga de sí misma: si se leyeran de ahí, un valor malo
     se copiaría a sí mismo para siempre. Pasó con og.png, que las cinco
     heredaron de la primera versión. */
  const donde = SITIO.paginas[slug];
  if (!donde) throw new Error(`sitio.json no dice dónde vive ${slug}`);
  const canonica = SITIO.base + "/" + donde.fichero;
  const imagen = SITIO.base + "/" + donde.imagen;

  const { estilo, cuerpo, guion } = despieza(antes);
  const despues = CABECERA
    .split("{{TITULO}}").join(titulo)
    .split("{{DESCRIPCION}}").join(desc)
    .split("{{CANONICA}}").join(canonica)
    .split("{{IMAGEN}}").join(imagen)
    .split("{{BASE}}").join(SITIO.base)
    + estilo
    + (chrome ? CIERRE : CIERRE_SIN_BARRA)
    + cuerpo
    + (chrome ? PIE : PIE_SIN_PIE)
    + guion;

  if (despues === antes) { console.log(`  ·  ${slug}.html ya estaba al día`); continue; }
  fs.writeFileSync(f, despues);
  tocadas++;
  console.log(`  hecha  ${slug}.html  ·  ${canonica}`);
}
console.log(`\n${tocadas} de ${PAGINAS.length} páginas rehechas desde la plantilla.`);
