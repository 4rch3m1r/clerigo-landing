/**
 * LOS ENLACES INTERNOS, A LA DIRECCIÓN DEFINITIVA. Va después de mapa.cjs y
 * antes del tema oscuro.
 *
 *   node fuente/seo/enlaces.cjs
 *
 * ── POR QUÉ ───────────────────────────────────────────────────────────────
 *
 * Las páginas se enlazaban entre sí por su nombre de FICHERO: la barra de la
 * portada inglesa llevaba a `precios.html`, `contacto.html`, `confianza.html`…
 * Ninguno de esos es la dirección de la página. Medido en clerigo.io:
 *
 *   /precios.html      → 301 → /pricing
 *   /contacto.html     → 301 → /contact
 *   /confianza.html    → 301 → /trustcenter
 *   /es/precios.html   → 307 → /es/precios      (temporal)
 *
 * Así que cada enlace de la barra y del pie pasaba por una redirección, y las
 * de /es/ encima temporales. Para Google eso es un sitio cuyas páginas
 * principales no se enlazan directamente entre sí, y es justo de esos enlaces
 * —barra, pie, portada— de donde saca los enlaces que pone debajo del
 * resultado (Precios, Contacto, Centro de Confianza…). Por eso salía
 * «clerigo.io › precios» con la dirección vieja.
 *
 * Ahora cada enlace interno lleva a la dirección canónica, la misma que la
 * etiqueta `canonical` y el mapa del sitio: `/pricing`, `/es/precios`, `/`,
 * `/es/`. Sin redirección de por medio.
 *
 * ── CÓMO SE DESHACE ───────────────────────────────────────────────────────
 *
 * El enlace original se guarda al lado, en `data-enlace="precios.html"`. Los
 * pasos anteriores de la tubería —el traductor, los validadores que comparan
 * con el original— leen las páginas con `sinEnlaces()`, que lo devuelve a su
 * sitio, y así no ven ninguna diferencia. Correr esto dos veces deja la página
 * igual.
 */
const fs = require("node:fs");
const path = require("node:path");

const MARCA = / data-enlace="([^"]*)"/;
const CON_MARCA = /href="[^"]*" data-enlace="([^"]*)"/g;

function sinEnlaces(html) {
  return String(html).replace(CON_MARCA, (_, original) => `href="${original}"`);
}

/* Fichero (visto desde la raíz del sitio) → dirección canónica. */
function tablaDeRutas(PAGINAS) {
  const t = new Map();
  for (const p of PAGINAS) {
    if (p.slug === "login") continue;
    const en = p.ruta.en ? "/" + p.ruta.en : "/";
    const es = p.ruta.es ? "/es/" + p.ruta.es : "/es/";
    /* En la raíz se enlaza tanto por el nombre inglés como por el castellano:
       la barra inglesa heredó los nombres castellanos. Los dos son la página
       inglesa. */
    t.set(p.disco.en, en);
    t.set(p.disco.es, en);
    t.set("es/" + p.disco.es, es);
    t.set("es/" + p.disco.en, es);
  }
  return t;
}

function enlacesLimpios(html, idioma, tabla) {
  return sinEnlaces(html).replace(/href="((?!https?:|\/|#|mailto:|tel:|data:)[^"#]+\.html)(#[^"]*)?"/g, (todo, fichero, fragmento = "") => {
    let desdeRaiz = fichero;
    if (idioma === "es") desdeRaiz = fichero.startsWith("../") ? fichero.slice(3) : "es/" + fichero;
    const ruta = tabla.get(desdeRaiz);
    if (!ruta) return todo;
    return `href="${ruta}${fragmento}" data-enlace="${fichero}${fragmento}"`;
  });
}

function aplicarATodas() {
  const { PAGINAS } = require("./posicionar.cjs");
  const { CASTELLANO, INGLES } = require("../donde.cjs");
  const tabla = tablaDeRutas(PAGINAS);
  let total = 0, tocadas = 0;
  for (const [carpeta, idioma] of [[CASTELLANO, "es"], [INGLES, "en"]]) {
    for (const p of PAGINAS) {
      if (p.slug === "login") continue;
      const f = path.join(carpeta, p.disco[idioma]);
      if (!fs.existsSync(f)) continue;
      const antes = fs.readFileSync(f, "utf8");
      const despues = enlacesLimpios(antes, idioma, tabla);
      total += (despues.match(/ data-enlace="/g) || []).length;
      if (despues !== antes) { fs.writeFileSync(f, despues); tocadas++; }
    }
  }
  console.log(`\n  ${total} enlaces internos a su dirección canónica, en ${tocadas} páginas cambiadas.\n`);
}

if (require.main === module) aplicarATodas();

module.exports = { sinEnlaces, enlacesLimpios, tablaDeRutas, MARCA };
