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

/**
 * PARECE CASTELLANO, que es más estricto que «parece lenguaje».
 *
 * Son las mismas señales de `PARECE_LENGUAJE` MENOS LA CUARTA —«una palabra de
 * cuatro letras o más con alguna minúscula»—, que es la que se traga los
 * identificadores del código: `annual`, `active`, `click`, `card`, `filter`.
 *
 * Se usa sólo para los literales sueltos de un guion, y el motivo es que ahí
 * equivocarse no deja una palabra sin traducir: deja la página muda. `annual`
 * es lo que compara `billing === 'annual'`; traducirlo a `annual` en inglés no
 * haría nada, pero el día que alguien meta una pareja distinta en el
 * diccionario, la calculadora deja de calcular y ningún validador lo ve.
 *
 * El texto que va ENTRE ETIQUETAS dentro de un literal no pasa por aquí, y es
 * a propósito: eso es contenido por construcción, no puede ser un
 * identificador, y con la regla estricta se quedaban fuera cosas como
 * «${val} usuarios».
 */
const PARECE_CASTELLANO = new RegExp([
  "[áéíóúñüÁÉÍÓÚÑÜ]",
  "[A-Za-zÀ-ÿ]{2,}\\s+[A-Za-zÀ-ÿ]{2,}",
  "^[A-ZÁÉÍÓÚÑ][a-zà-ÿ]{3,}",
  "(^|\\s)(y|o|u|e|con|sin|de|del|la|el|los|las|un|una|en|al|para|por|que|se|su|sus|más)(\\s|$)",
].join("|"));

/* Un literal de JavaScript, de las tres clases. */
const LITERAL_DE_GUION = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;

/**
 * Un nombre del código escrito como una palabra sola y con mayúscula dentro:
 * `IntersectionObserver`, `MutationObserver`, `DOMContentLoaded`.
 *
 * La 3ª señal —«empieza por mayúscula y sigue en minúsculas»— está pensada
 * para «Riesgos» o «Auditoría», y se tragaba éstos. `IntersectionObserver`
 * entraba como trozo a traducir en dos páginas y la guarda las daba por
 * incompletas para siempre, que es como una guarda se vuelve ruido.
 *
 * Una palabra del castellano no lleva una mayúscula en medio. Una compuesta
 * del código, sí; y si lleva un espacio, ya no es un nombre del código.
 */
const NOMBRE_DEL_CODIGO = /^\S*[a-zà-ÿ][A-ZÀ-Þ]\S*$/;

/**
 * Siglas y versiones: «SWIFT CSCF v2024», «PCI-DSS v4.0», «SOC 2 Type II».
 *
 * Se mira si, quitando los `v2024` y los números, queda alguna minúscula. Un
 * nombre de marco normativo no la tiene; una frase, sí. `NO_SE_TRADUCE` ya
 * traía una lista de siglas, pero pedía que el trozo fuera SÓLO la sigla, y
 * «SWIFT CSCF v2024» son dos y un año.
 */
const SOLO_SIGLAS = (t) => !/[a-zà-ÿ]/.test(t.replace(/\bv\d[\d.]*/gi, " "));

/**
 * Palabras que las escribe el NAVEGADOR, no nosotros.
 *
 * `e.key === 'Escape'` lleva un literal que empieza por mayúscula y sigue en
 * minúsculas, exactamente como «Riesgos» o «Gratis». Distinguirlos por su
 * forma no se puede: hace falta saber cuál es de quién. Traducir «Escape» deja
 * el teclado sin cerrar los diálogos y ninguna prueba lo ve.
 *
 * Es lista cerrada a propósito: los valores de `KeyboardEvent.key` son un
 * estándar y no crecen con el sitio, así que no es de las que envejecen solas.
 * «Control» está aquí por la tecla, y es el único que además es palabra
 * nuestra: dentro del catálogo va como «Control Interno», con su apellido, y
 * ése sí entra.
 */
const PALABRAS_DEL_NAVEGADOR = new Set([
  "Escape", "Enter", "Tab", "Shift", "Alt", "Control", "Meta", "CapsLock",
  "Backspace", "Delete", "Insert", "Home", "End", "PageUp", "PageDown",
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "Spacebar",
]);

/**
 * Quita lo interpolado —`${…}`, con sus llaves anidadas— para JUZGAR si un
 * trozo es castellano. La clave que sale sigue llevándolo: «${val} usuarios»
 * se traduce entero a «${val} users», y así el inglés puede cambiar el orden
 * de las palabras sin que nada se rompa.
 */
function sinInterpolar(s) {
  let sale = "";
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "$" && s[i + 1] === "{") {
      let prof = 1; i += 2;
      while (i < s.length && prof > 0) {
        if (s[i] === "{") prof++; else if (s[i] === "}") prof--;
        i++;
      }
      i--; sale += " "; continue;
    }
    sale += s[i];
  }
  return sale;
}

/**
 * EL TEXTO QUE VIVE DENTRO DE UN <script>.
 *
 * Hasta aquí, todo lo que había dentro de un `<script>` era código y no se
 * miraba. Es cierto para casi todo el sitio y falso justo donde más se nota:
 * la calculadora de planes pinta sus doce módulos —nombre, descripción y cinco
 * prestaciones cada uno— desde un array de JavaScript. Ese texto no lo veía
 * NADIE: ni el traductor, que por eso no lo tradujo, ni las dos guardas, que
 * por eso no se quejaron. La página inglesa estuvo sirviéndose con el catálogo
 * entero en castellano y con `og:locale="en_US"` en la cabecera.
 *
 * De cada literal:
 *   · si lleva marcado dentro, se le sacan los textos entre etiquetas, igual
 *     que se le sacan a la página, y valen las cinco señales;
 *   · si no, cuenta el literal entero, y se le pide la regla estricta y tres
 *     letras como mínimo. Con dos entraba «en», que es el código de idioma del
 *     selector, no la preposición.
 *
 * Los comentarios del guion se quitan antes: ahí hay prosa que no lee nadie.
 */
/** Lo que hay dentro de cada `${…}` de una plantilla, con sus llaves anidadas. */
function interpolaciones(s) {
  const fuera = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== "$" || s[i + 1] !== "{") continue;
    let prof = 1, j = i + 2;
    while (j < s.length && prof > 0) {
      if (s[j] === "{") prof++; else if (s[j] === "}") prof--;
      j++;
    }
    fuera.push(s.slice(i + 2, j - 1));
    i = j - 1;
  }
  return fuera;
}

/**
 * Los literales de un trozo de código, ENTRANDO en las interpolaciones.
 *
 * La recursión no es un adorno. Un literal de plantilla se come las comillas
 * que lleva dentro, así que `'Incluido'` de aquí:
 *
 *     `<div>${auto ? 'Incluido' : 'Facturación anual'}</div>`
 *
 * no lo veía el barrido de literales —se lo había tragado la plantilla— y
 * tampoco el de texto entre etiquetas, porque entre `>` y `<` lo que hay es la
 * expresión entera, que es código. Dos rótulos que se enseñan en pantalla y
 * ninguna de las dos vías los alcanzaba.
 */
function literalesDe(js, fuera) {
  for (const m of js.matchAll(LITERAL_DE_GUION)) {
    const dentro = m[1] ?? m[2] ?? m[3] ?? "";
    if (/<[a-zA-Z/]/.test(dentro)) {
      for (const t of dentro.matchAll(/>([^<>]*)</g)) {
        /* Se JUZGA sin lo interpolado y se DEVUELVE con ello: dentro de un
           `${…}` hay código, y colarlo en el juicio hace que un trozo pase por
           texto cuando no lo es. */
        if (esTraducible(sinInterpolar(t[1]).trim())) fuera.push(t[1].trim());
      }
    } else {
      const t = dentro.trim();
      if (t.length >= 3 && PARECE_CASTELLANO.test(t) && esTraducible(t)
        && !NOMBRE_DEL_CODIGO.test(t) && !SOLO_SIGLAS(t) && !PALABRAS_DEL_NAVEGADOR.has(t)) fuera.push(t);
    }
    for (const trozo of interpolaciones(dentro)) literalesDe(trozo, fuera);
  }
}

function textosDeLosGuiones(html) {
  const fuera = [];
  for (const zona of html.match(ZONAS_DE_CODIGO) || []) {
    if (!/^<script/i.test(zona)) continue;
    const cierreEtiqueta = zona.indexOf(">");
    const atributos = zona.slice(0, cierreEtiqueta);
    /* La ficha de datos va en un <script> y es JSON, no guion. */
    if (/type\s*=\s*["'](?!text\/javascript|module)/i.test(atributos)) continue;
    if (/\bsrc=/i.test(atributos)) continue;

    const cuerpo = zona.slice(cierreEtiqueta + 1, zona.lastIndexOf("</"))
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/^[ \t]*\/\/.*$/gm, " ");

    literalesDe(cuerpo, fuera);
  }
  return fuera;
}

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

  /* 5. El texto que vive dentro de un <script>. Ya viene juzgado de
        `textosDeLosGuiones`, que sabe cuál de las dos reglas le toca a cada
        trozo; aquí sólo se quitan los repetidos. */
  for (const t of textosDeLosGuiones(html)) {
    if (vistos.has(t)) continue;
    vistos.add(t);
    fuera.push({ tipo: "guion", texto: t });
  }

  return fuera;
}

module.exports = {
  segmentos, esTraducible, textosDeLosGuiones, sinInterpolar,
  ZONAS_DE_CODIGO, COMENTARIOS, ATRIBUTOS_LEIBLES, META_QUE_SE_LEE,
  PARECE_CASTELLANO, LITERAL_DE_GUION,
};
