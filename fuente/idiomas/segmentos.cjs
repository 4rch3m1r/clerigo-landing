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
/**
 * Esto es una declaración de estilo, no una frase.
 *
 * Hace falta por una rama concreta: las plantillas SIN marcado pero CON huecos.
 * Ahí viven dos rótulos que se ven en pantalla —«${usuariosCuenta} usuarios
 * incluidos»— y también esto:
 *
 *     `border-left: 3px solid ${m.color}55;`
 *     `linear-gradient(to right,var(--red) ${pct}%,rgba(14,14,14,0.12) ${pct}%)`
 *
 * Las dos cosas tienen la misma forma para las señales de castellano: «3px
 * solid» y «to right» son dos palabras seguidas igual que «usuarios incluidos».
 * Lo que las separa es el vocabulario del CSS: una propiedad con su unidad, una
 * función de color, una variable, un color en hexadecimal.
 *
 * LO QUE ESTO SE LLEVA POR DELANTE, y hay que saberlo: una frase de verdad que
 * lleve dos puntos y una unidad —«Duración: 30 s»— también se descarta. No hay
 * ninguna en el sitio; si algún día la hay, se quedará sin traducir y la guarda
 * en crudo del validador la cantará, que para eso mira sin heurísticas.
 */
/* La unidad va PEGADA A UN NÚMERO —`3px`, `100%`, `1.5rem`—, y eso no es un
   detalle: la lista incluía `s` de «segundos» suelta, y entonces cualquier
   plural del castellano delante de una coma la disparaba. Con eso, la
   respuesta entera del bloque de dudas —«…actives: 2 administradores, 5
   licencias de gestor…»— dejaba de ser texto traducible y se quedó en
   castellano dentro de la página inglesa. La cazó la guarda en crudo del
   validador, que mira sin heurísticas; por eso está. */
const PARECE_ESTILO = /(?:^|[\s;])[-a-z]+\s*:\s*[^;]*\d(?:px|%|rem|em|vh|vw|deg|fr|s)\b|var\(--|rgba?\(|linear-gradient\(|#[0-9a-fA-F]{3,8}\b|\(prefers-[a-z-]+\s*:|cubic-bezier\(|\bsteps\(\d|\d\.\d+s\b/;

/**
 * Dos palabras de tres letras o más, con lo que sea en medio.
 *
 * En la rama de las plantillas sin marcado, la 2ª señal de castellano pide que
 * las dos palabras estén separadas por ESPACIO, y eso deja fuera
 * «${usuariosCuenta} usuarios (${extra} adicionales)» —un rótulo que se ve en
 * pantalla— porque entre medias hay un paréntesis.
 *
 * Un identificador del código no la cumple: `card-${id}`, `price-${id}` y
 * `faq${i}` tienen una sola palabra. Y lo que sí la cumple y no es texto —el
 * CSS— ya lo descarta `PARECE_ESTILO`.
 */
const DOS_PALABRAS = /[A-Za-zÀ-ÿ]{3,}[^A-Za-zÀ-ÿ]*\s[^A-Za-zÀ-ÿ]*[A-Za-zÀ-ÿ]{3,}/;

/* Un selector de CSS. Con la separación por guion valía «clerigo-idioma» y
   «cookie-banner»; pidiendo un ESPACIO en medio caen esos, pero seguía
   entrando «.preview-bar-fill, .module-bar-fill», que lleva coma y espacio. */
const ES_SELECTOR = /^\s*[.#[]/;

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
/**
 * UN RECORRIDO DE VERDAD POR EL CÓDIGO, EN VEZ DE UNA EXPRESIÓN REGULAR.
 *
 * Con una expresión regular no se puede, y no es una cuestión de afinarla: una
 * plantilla puede llevar otra dentro, y la comilla invertida de la de dentro
 * cierra la de fuera antes de tiempo. En esta misma página:
 *
 *     `<div class="mod-card ${sel ? `border-color:${m.color}40` : ''}">`
 *
 * la expresión regular cortaba en la segunda comilla invertida, se quedaba con
 * medio literal y al reescribirlo devolvía basura. Con el diccionario VACÍO ya
 * dejaba la página sin guion: `${cardSelected ?}` en vez de `${cardSelected ?`.
 *
 * `escanea` devuelve los trozos del PRIMER nivel con sus posiciones exactas, y
 * de cada plantilla, dónde empieza y acaba cada `${…}` para poder entrar. Los
 * comentarios salen marcados para poder saltárselos: un apóstrofo suelto en un
 * comentario —«l'année»— emparejaría con la comilla siguiente, que ya es
 * código.
 *
 * LO QUE NO MIRA. Las expresiones regulares del propio código: `/['"]/ ` lleva
 * comillas dentro y aquí se leerían como el principio de una cadena.
 * Distinguir una división de una expresión regular pide un analizador entero.
 * A cambio, `comprueba` de más abajo lo detecta y avisa, y quien llame a esto
 * tiene que parsear el resultado antes de escribirlo.
 */
function escanea(js) {
  const fuera = [];
  let i = 0;
  while (i < js.length) {
    const c = js[i];
    if (c === "/" && js[i + 1] === "/") {
      const j = js.indexOf("\n", i);
      const fin = j < 0 ? js.length : j;
      fuera.push({ tipo: "comentario", ini: i, fin });
      i = fin; continue;
    }
    if (c === "/" && js[i + 1] === "*") {
      const j = js.indexOf("*/", i + 2);
      const fin = j < 0 ? js.length : j + 2;
      fuera.push({ tipo: "comentario", ini: i, fin });
      i = fin; continue;
    }
    if (c === "'" || c === '"') {
      const fin = finDeCadena(js, i, c);
      fuera.push({ tipo: "cadena", comilla: c, ini: i, fin });
      i = fin; continue;
    }
    if (c === "`") {
      const p = finDePlantilla(js, i);
      fuera.push({ tipo: "plantilla", comilla: "`", ini: i, fin: p.fin, expresiones: p.expresiones });
      i = p.fin; continue;
    }
    i++;
  }
  return fuera;
}

/** Dónde acaba una cadena de comillas rectas, contando los escapes. */
function finDeCadena(js, i, comilla) {
  let j = i + 1;
  while (j < js.length) {
    if (js[j] === "\\") { j += 2; continue; }
    if (js[j] === comilla) return j + 1;
    if (js[j] === "\n") return j;      /* sin cerrar: no se pasa de línea */
    j++;
  }
  return js.length;
}

/** Dónde acaba una plantilla, y dónde está cada `${…}` de dentro. */
function finDePlantilla(js, i) {
  const expresiones = [];
  let j = i + 1;
  while (j < js.length) {
    const c = js[j];
    if (c === "\\") { j += 2; continue; }
    if (c === "`") return { fin: j + 1, expresiones };
    if (c === "$" && js[j + 1] === "{") {
      const ini = j + 2;
      let prof = 1, k = ini;
      while (k < js.length && prof > 0) {
        const d = js[k];
        /* Dentro de la expresión puede haber cadenas y MÁS plantillas, y sus
           llaves no cuentan. Ésta es la parte que la expresión regular no
           podía hacer. */
        if (d === "'" || d === '"') { k = finDeCadena(js, k, d); continue; }
        if (d === "`") { k = finDePlantilla(js, k).fin; continue; }
        if (d === "{") prof++;
        else if (d === "}") prof--;
        k++;
      }
      expresiones.push({ ini, fin: k - 1 });
      j = k; continue;
    }
    j++;
  }
  return { fin: js.length, expresiones };
}

/**
 * LOS TROZOS TRADUCIBLES DE UN GUION, CON SU SITIO EXACTO.
 *
 * Devuelve `{texto, ini, fin, comilla}` con posiciones ABSOLUTAS dentro del
 * html que se le pasa. Que lleven posición no es un adorno: el sustituidor de
 * `a-ingles.cjs` reemplaza JUSTO en ese hueco, así que lo que se ofrece para
 * traducir y lo que se sustituye no son dos recorridos parecidos que hay que
 * mantener a mano — son el mismo. Cuando eran dos, había trozos que salían en
 * la lista de pendientes y no se sustituían nunca, y el aviso de «quedan N sin
 * traducir» no bajaba de N hiciera uno lo que hiciera.
 *
 * De cada literal:
 *   · si lleva marcado dentro, el texto entre etiquetas, con sus `${…}`
 *     incluidos: «${val} usuarios» se traduce entero a «${val} users», y así
 *     el inglés puede cambiar el orden de las palabras. Se JUZGA sin ellos,
 *     porque dentro hay código;
 *   · si no, el literal entero, con la regla estricta y tres letras como
 *     mínimo. Con dos entraba «en», que es el código de idioma del selector.
 * Y en las dos, se entra en las interpolaciones: `${auto ? 'Incluido' : …}` es
 * un rótulo que se enseña y que ninguna de las dos vías alcanza.
 */
/**
 * El contenido de una plantilla con las CADENAS de sus `${…}` tapadas.
 *
 * Tapadas con espacios, del mismo largo, para que las posiciones sigan
 * valiendo: lo que se busca encima es texto entre etiquetas, y luego se lee del
 * original. Lo que hay fuera de las expresiones no se toca, y por eso
 * «${val} usuarios» —que cruza una expresión— se sigue viendo entero.
 */
function tapaLasCadenasDeLasExpresiones(dentro, expresiones, desplazamiento) {
  let sale = dentro;
  for (const e of expresiones || []) {
    const ini = e.ini - desplazamiento;
    const fin = e.fin - desplazamiento;
    if (ini < 0 || fin > dentro.length) continue;
    const trozo = dentro.slice(ini, fin);
    let tapado = trozo;
    for (const t of escanea(trozo)) {
      if (t.tipo === "comentario") continue;
      tapado = tapado.slice(0, t.ini) + " ".repeat(t.fin - t.ini) + tapado.slice(t.fin);
    }
    /* Y los `<` y `>` que queden, que son de código —`extra > 1`— y parten el
       texto en dos. Sin esto, «${ADMINS} administradores, … ${extra > 1 ? …}»
       no llegaba a ser un trozo: el `>` de `extra >` cortaba el barrido de
       texto entre etiquetas por la mitad y la línea se quedaba en castellano. */
    tapado = tapado.replace(/[<>]/g, " ");
    sale = sale.slice(0, ini) + tapado + sale.slice(fin);
  }
  return sale;
}

function trozosDeLosGuiones(html) {
  const fuera = [];

  const deCodigo = (js, base) => {
    for (const t of escanea(js)) {
      if (t.tipo === "comentario") continue;
      const dentro = js.slice(t.ini + 1, Math.max(t.fin - 1, t.ini + 1));
      const desdeDentro = base + t.ini + 1;

      if (/<[a-zA-Z/]/.test(dentro)) {
        /* EN UNA PLANTILLA, LAS CADENAS DE DENTRO DE UN ${…} SE TAPAN ANTES.
           Si no, un `>Gratis<` que vive en una cadena anidada sale DOS veces
           —una por este barrido, que ve el contenido entero, y otra al entrar
           en la expresión— con dos huecos que se solapan. Al sustituir de atrás
           hacia delante, la segunda pisaba a la primera y dejaba
           «It's freefree» en la página.
           Se tapa con espacios para que las posiciones no se muevan, y el texto
           se lee del original, no de la máscara. */
        const donde = t.tipo === "plantilla"
          ? tapaLasCadenasDeLasExpresiones(dentro, t.expresiones, t.ini + 1)
          : dentro;
        /* El cierre puede ser el `<` siguiente O EL FINAL DEL LITERAL. Sin el
           `|$`, el texto que va detrás de la última etiqueta se perdía:
           «`<svg …></svg> Continuar con ${…}`» es el rótulo de un botón y se
           quedaba en castellano en la página inglesa. */
        for (const m of donde.matchAll(/>([^<>]*)(?=<|$)/g)) {
          const crudo = dentro.slice(m.index + 1, m.index + 1 + m[1].length);
          /* SI EL TROZO CRUDO TRAE MARCADO DENTRO, NO ES TEXTO.
             El texto se lee del original, no de la máscara, así que un trozo
             que empieza fuera y acaba pasada una zona tapada se trae lo tapado
             de vuelta: el `>` de `discount > 0` y el `<` del siguiente `<div`
             se emparejaban a través de la plantilla anidada y devolvían el
             código entero como si fuera texto.
             Se busca MARCADO —un `<` seguido de letra o barra—, no un `>` a
             secas: «${ADMINS} administradores, … ${extra > 1 ? 'es' : ''}»
             lleva un `>` que es una comparación, y ése SÍ es texto. Igual que
             «Resumen del pedido · Ciclo ${billing === 'annual' ? …}»: entero y
             con su expresión, para que el inglés pueda reordenarlo. */
          if (/<[a-zA-Z/!]/.test(crudo)) continue;
          const texto = crudo.trim();
          if (!texto || !esTraducible(sinInterpolar(crudo).trim())) continue;
          const ini = desdeDentro + m.index + 1 + crudo.indexOf(texto);
          fuera.push({ texto, ini, fin: ini + texto.length, comilla: t.comilla });
        }
      } else {
        /* Sin marcado. Se JUZGA sin los huecos —dentro hay código— y se DEVUELVE
           con ellos: «${usuariosCuenta} usuarios incluidos» se traduce entero,
           y así el inglés puede poner el número donde le toque. */
        const texto = dentro.trim();
        const juzgar = sinInterpolar(dentro).trim();
        if (texto.length >= 3 && juzgar.length >= 3
          && (PARECE_CASTELLANO.test(juzgar) || DOS_PALABRAS.test(juzgar)) && esTraducible(juzgar)
          && !NOMBRE_DEL_CODIGO.test(juzgar) && !SOLO_SIGLAS(juzgar)
          && !PALABRAS_DEL_NAVEGADOR.has(juzgar) && !PARECE_ESTILO.test(texto)
          && !ES_SELECTOR.test(texto)) {
          const ini = desdeDentro + dentro.indexOf(texto);
          fuera.push({ texto, ini, fin: ini + texto.length, comilla: t.comilla });
        }
      }

      /* No se entra en una expresión que ya vive DENTRO de un trozo emitido:
         saldría dos veces y con huecos solapados, y al sustituir de atrás hacia
         delante la segunda pisa a la primera. */
      for (const e of t.expresiones || []) {
        const dentroDeUnTrozo = fuera.some((x) => base + e.ini >= x.ini && base + e.fin <= x.fin);
        if (dentroDeUnTrozo) continue;
        deCodigo(js.slice(e.ini, e.fin), base + e.ini);
      }
    }
  };

  for (const m of html.matchAll(new RegExp(ZONAS_DE_CODIGO.source, "gi"))) {
    const zona = m[0];
    if (!/^<script/i.test(zona)) continue;
    const cierre = zona.indexOf(">");
    const attrs = zona.slice(0, cierre);
    /* La ficha de datos va en un <script> y es JSON, no guion. */
    if (/type\s*=\s*["'](?!text\/javascript|module)/i.test(attrs)) continue;
    if (/\bsrc=/i.test(attrs)) continue;
    const fin = zona.lastIndexOf("</");
    deCodigo(zona.slice(cierre + 1, fin), m.index + cierre + 1);
  }
  return fuera;
}

/** Sólo los textos, para quien no necesite saber dónde estaban. */
function textosDeLosGuiones(html) {
  return trozosDeLosGuiones(html).map((t) => t.texto);
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
  trozosDeLosGuiones, escanea,
  segmentos, esTraducible, textosDeLosGuiones, sinInterpolar,
  ZONAS_DE_CODIGO, COMENTARIOS, ATRIBUTOS_LEIBLES, META_QUE_SE_LEE,
  PARECE_CASTELLANO, LITERAL_DE_GUION,
};
