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
 * Se pide UNA de cuatro señales: una letra con tilde o eñe, dos palabras
 * seguidas, una palabra de cuatro letras o más que empiece por mayúscula, o
 * —la cuarta— una palabra de cuatro letras o más que lleve alguna minúscula.
 * Con menos que eso entraban «5.1», «px», «ISO 27001» y «—», que no son texto
 * que traducir y ensucian la lista hasta hacerla inservible.
 *
 * LA CUARTA SEÑAL SE AÑADIÓ PORQUE FALTABA, Y SE NOTÓ EN EL PEOR SITIO.
 *
 * Con sólo las tres primeras, una palabra suelta en minúscula y sin tilde no
 * era «lenguaje» para esto, y por tanto no se traducía nunca. Lo que quedó en
 * inglés por ese hueco:
 *
 *     <h1>Managing GRC doesn't have to be <span>complicada</span></h1>
 *     <p>A single <strong>inteligente y automatizado</strong> environment…</p>
 *
 * El titular de la portada y su bajada, que son las dos líneas que más pesan
 * de todo el sitio, con una palabra en castellano dentro. Y nada avisó: el
 * aviso de «esto se quedó sin traducir» sólo mira los trozos que ENTRARON en
 * la lista, así que un trozo que nunca entra tampoco se echa de menos.
 *
 * («inteligente y automatizado» falla también la segunda señal, que pide dos
 * palabras seguidas de dos letras o más: entre medias hay una «y».)
 *
 * Se pide alguna MINÚSCULA a propósito. Sin ese detalle entraban de golpe las
 * siglas —GDPR, HIPAA, COBIT, SIPEN, IDECOOP— que no se traducen y habría que
 * ir listando una por una según fueran apareciendo, que es una lista que
 * envejece sola. Una sigla va toda en mayúsculas; una palabra, no.
 */
const PARECE_LENGUAJE = new RegExp([
  /* 1. una letra con tilde o eñe */
  "[áéíóúñüÁÉÍÓÚÑÜ]",
  /* 2. dos palabras seguidas de dos letras o más */
  "[A-Za-zÀ-ÿ]{2,}\\s+[A-Za-zÀ-ÿ]{2,}",
  /* 3. una palabra de cuatro letras o más que empiece por mayúscula */
  "^[A-ZÁÉÍÓÚÑ][a-zà-ÿ]{3,}",
  /* 4. una palabra de cuatro letras o más con alguna minúscula */
  "(?<![A-Za-zÀ-ÿ])(?=[A-Za-zÀ-ÿ]{4})[A-Za-zÀ-ÿ]*[a-zà-ÿ]",
  /* 5. una palabra de enlace del castellano, entera y suelta */
  "(^|\\s)(y|o|u|e|con|sin|de|del|la|el|los|las|un|una|en|al|para|por|que|se|su|sus|más)(\\s|$)",
].join("|"));

/* Cosas que parecen lenguaje y no lo son: no se traducen nunca. */
const NO_SE_TRADUCE = [
  /^[\s\d.,%+·—–-]*$/,                    /* sólo números y signos */
  /* La sigla SOLA, con su número de versión o su año si lo lleva. NO lo que
     empiece por ella.
     Con `^ISO\b` se caía por el desagüe una frase entera —«ISO, SWIFT,
     REGLAMENTOS CIBERSEGURIDAD SIMV, BCRD, NORTIC, PCI-DSS, SOC 2, NIST,
     HIPAA, GDPR y más»— sólo por empezar nombrando una norma: no llegaba a
     ser un trozo traducible y se quedó en castellano dentro de la portada en
     inglés, con «REGLAMENTOS CIBERSEGURIDAD» y «y más» a la vista. */
  /^(?:ISO|NIST|SOC|PCI|GDPR|NORTIC|BCRD|SIMV|COBIT|COSO|ITIL|SWIFT|CIS)[\s\d.,:/&-]*$/,
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
  /* Vacío no, pero UNA letra sí: «y» entre dos etiquetas es una palabra que
     hay que traducir —«BCP y DRP» se quedaba así en la página inglesa— y con
     el corte en dos no llegaba nunca. Lo que no es lenguaje ya lo descarta
     `PARECE_LENGUAJE`: una letra suelta sólo pasa si es palabra de enlace. */
  if (t.length < 1) return false;
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
