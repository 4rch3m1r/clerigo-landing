/**
 * Los TROZOS DE TEXTO de una página, en orden y con su sitio.
 *
 * Es la pieza de la que cuelga todo el bilingüe: la versión inglesa se hace
 * sustituyendo estos trozos uno a uno, sin tocar ni una etiqueta. De ahí sale
 * la garantía que vigila `fuente/idiomas/validar.cjs`: quitando el texto, la
 * página en inglés y la española tienen que ser el MISMO fichero.
 *
 * No usa un analizador de HTML de verdad, y es a propósito: los ficheros los
 * escribe esta casa, siempre igual, y meter una dependencia para esto
 * significaría que regenerar la página deja de funcionar el día que esa
 * dependencia cambie. A cambio, hay que ser explícito con qué se mira y qué
 * no, que es lo que hay debajo.
 *
 * QUÉ SE TRADUCE
 *   · el texto que va entre etiquetas;
 *   · los atributos que se leen en voz alta o salen en un globo: `alt`,
 *     `title`, `placeholder`, `aria-label`;
 *   · el `<title>` de la pestaña y el `content` de las etiquetas de la
 *     tarjeta de enlace (description, og:title, og:description, twitter:*).
 *
 * QUÉ NO
 *   · lo que hay dentro de <script> y <style>: es código. La única excepción
 *     son los rótulos del carrusel, que viven en el marcado, no en el guion.
 *   · los comentarios de HTML: no se ven, y traducirlos sólo añade sitios
 *     donde equivocarse.
 *   · lo que no parece lenguaje: un código, una medida, una referencia.
 */

/* Dentro de estas dos no hay texto de persona, hay código. */
const ZONAS_DE_CODIGO = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi;
const COMENTARIOS = /<!--[\s\S]*?-->/g;

/* Los atributos que alguien LEE. `content` va aparte porque sólo cuenta en
   unas cuantas etiquetas de la cabecera; en las demás es una fecha o un
   número. */
const ATRIBUTOS_LEIBLES = /\b(alt|title|placeholder|aria-label)="([^"]+)"/g;
const META_QUE_SE_LEE = /<meta[^>]*\b(?:name|property)="(description|og:title|og:description|og:image:alt|og:site_name|twitter:title|twitter:description|twitter:image:alt)"[^>]*\bcontent="([^"]+)"/gi;

/**
 * ¿Esto es lenguaje, o es un código, una medida o una referencia?
 *
 * Se pide UNA de tres señales: una letra con tilde o eñe, dos palabras
 * seguidas, o una palabra de cuatro letras o más que empiece por mayúscula.
 * Con menos que eso entraban «5.1», «px», «ISO 27001» y «—», que no son texto
 * que traducir y ensucian la lista hasta hacerla inservible.
 */
const PARECE_LENGUAJE = /[áéíóúñüÁÉÍÓÚÑÜ]|[A-Za-zÀ-ÿ]{2,}\s+[A-Za-zÀ-ÿ]{2,}|^[A-ZÁÉÍÓÚÑ][a-zà-ÿ]{3,}/;

/* Cosas que parecen lenguaje y no lo son: no se traducen nunca. */
const NO_SE_TRADUCE = [
  /^[\s\d.,%+·—–-]*$/,                    /* sólo números y signos */
  /^(?:ISO|NIST|SOC|PCI|GDPR|NORTIC|BCRD|SIMV|COBIT|COSO|ITIL|SWIFT|CIS)\b/,
  /^https?:\/\//,
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+$/i,        /* direcciones de correo */
  /* La marca SOLA, no lo que empiece por ella.
     Con `^Clèrigo\b` quedaban fuera frases enteras —«Clèrigo — Gobernanza,
     Riesgo y Cumplimiento sin complicaciones», que es el título de la pestaña y
     el `og:title` de la portada— y la versión inglesa se compartía con el
     título en castellano. La marca no se traduce; una frase que la nombra, sí. */
  /^Clèrigo$/,
  /^Clèrigo\.?$/,
  /^XGRC$/,
];

function esTraducible(s) {
  const t = s.trim();
  if (t.length < 2) return false;
  if (!PARECE_LENGUAJE.test(t)) return false;
  return !NO_SE_TRADUCE.some((re) => re.test(t));
}

/**
 * Todos los trozos traducibles de una página, sin repetir y en orden de
 * aparición.
 *
 * Se devuelven SIN REPETIR a propósito: el mismo texto sale muchas veces —«Ver
 * más», «Cumplimiento Regulatorio»— y traducirlo una vez y aplicarlo en todas
 * es lo que mantiene la página coherente consigo misma. Traducir cada
 * aparición por separado es como se acaba con dos nombres para lo mismo en la
 * misma pantalla.
 */
function segmentos(html) {
  /* Se tapan las zonas de código y los comentarios con espacios del mismo
     largo: así no se lee lo que hay dentro y las posiciones no se mueven. */
  const limpio = html
    .replace(ZONAS_DE_CODIGO, (m) => " ".repeat(m.length))
    .replace(COMENTARIOS, (m) => " ".repeat(m.length));

  const vistos = new Set();
  const fuera = [];
  const guarda = (texto, tipo) => {
    const t = texto.trim();
    if (!esTraducible(t)) return;
    if (vistos.has(t)) return;
    vistos.add(t);
    fuera.push({ tipo, texto: t });
  };

  /* 1. El texto entre etiquetas. */
  for (const m of limpio.matchAll(/>([^<>]+)</g)) guarda(m[1], "texto");

  /* 2. Los atributos que se leen. Se buscan sobre el HTML ENTERO y no sobre el
        tapado: un `alt` dentro de un <script> no existe, pero uno dentro de un
        SVG sí, y el SVG no es zona de código. */
  for (const m of html.matchAll(ATRIBUTOS_LEIBLES)) guarda(m[2], "atributo");

  /* 3. El título de la pestaña. */
  const titulo = html.match(/<title>([^<]+)<\/title>/);
  if (titulo) guarda(titulo[1], "titulo");

  /* 4. Las etiquetas de la tarjeta de enlace. */
  for (const m of html.matchAll(META_QUE_SE_LEE)) guarda(m[2], "meta");

  return fuera;
}

module.exports = { segmentos, esTraducible, ZONAS_DE_CODIGO, COMENTARIOS, ATRIBUTOS_LEIBLES, META_QUE_SE_LEE };
