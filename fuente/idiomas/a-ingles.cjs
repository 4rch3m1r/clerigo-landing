/**
 * La versión inglesa: se hace SUSTITUYENDO TEXTO sobre la española, sin tocar
 * ni una etiqueta.
 *
 *   node fuente/idiomas/a-ingles.cjs
 *
 * POR QUÉ ASÍ Y NO ESCRIBIENDO OTRA PÁGINA. Dos páginas escritas a mano se
 * separan: se arregla un dato en una y no en la otra, se añade una sección
 * aquí y allí no, y nadie se entera hasta que lo ve un cliente. Haciendo la
 * inglesa POR SUSTITUCIÓN, la estructura no puede divergir — y, mejor aún, se
 * puede COMPROBAR: quitando el texto de las dos, tienen que ser el mismo
 * fichero. Eso es lo que hace `validar.cjs` de esta carpeta.
 *
 * DÓNDE VA CADA COSA. El inglés es el idioma por omisión, así que ocupa la
 * raíz —clerigo.io/— y el castellano baja a /es/.
 */
const fs = require("node:fs");
const path = require("node:path");
const { segmentos, ZONAS_DE_CODIGO, COMENTARIOS, trozosDeLosGuiones } = require("./segmentos.cjs");
const { PAGINAS } = require("./reunir.cjs");

const RAIZ = path.join(__dirname, "..", "..");
const DIR_ES = path.join(RAIZ, "es");

/* index tiene además su gemela oscura. */
const TODAS = [...PAGINAS, "oscuro"];

/**
 * CÓMO SE LLAMA CADA PÁGINA EN CADA IDIOMA.
 *
 * Tres no se llaman igual: `marcos` se sirve como `frameworks.html`,
 * `confianza` como `trustcenter.html` y `contacto` como `contact.html`.
 *
 * El mapa NO se escribe aquí: se lee de `seo/posicionar.cjs`, que es donde ya
 * estaba y de donde salen también el sitemap y las canónicas. Tenerlo dos
 * veces es tenerlo mal una de las dos, y de eso va justamente el fallo que
 * arregla: este guion escribía el inglés en `marcos.html` mientras la página
 * servida era `frameworks.html`, así que la traducción caía en un fichero
 * redirigido y la de verdad se mantenía a mano.
 *
 * `oscuro` no está en esa lista —no se indexa, es la portada con otra piel— y
 * por eso se cae al nombre de siempre.
 */
function ficheroDe(slug, idioma) {
  const { PAGINAS: DEL_SEO } = require("../seo/posicionar.cjs");
  const p = DEL_SEO.find((x) => x.slug === slug);
  return (p && p.disco && p.disco[idioma]) || slug + ".html";
}

/**
 * La marca con la que se tapan las zonas que no se traducen.
 *
 * Lleva arrobas y una palabra a propósito. La primera versión usaba «espacio,
 * número, espacio», y al devolver las zonas a su sitio pisaba cualquier número
 * suelto de la página — que esta página tiene a docenas. Es el mismo cuidado
 * que ya hizo falta en `paginas/palabras.cjs`.
 */
const MARCA = (i) => "@@ZONA" + i + "@@";
const MARCA_PUESTA = /@@ZONA(\d+)@@/g;

function diccionario() {
  const base = JSON.parse(fs.readFileSync(path.join(__dirname, "base.json"), "utf8"));
  const hechas = fs.existsSync(path.join(__dirname, "en.json"))
    ? JSON.parse(fs.readFileSync(path.join(__dirname, "en.json"), "utf8"))
    : {};
  /* Lo traducido manda sobre el diccionario de la plataforma: si alguien
     revisó un texto a mano, ése es el bueno. */
  return Object.assign({}, base, hechas);
}

/**
 * EL TEXTO QUE VIVE DENTRO DE UN <script>, TRADUCIDO.
 *
 * No recorre el guion por su cuenta: le pide las posiciones a
 * `trozosDeLosGuiones`, que es la misma pieza que decide qué se ofrece para
 * traducir. Lo que aquélla SACA, ésta lo PONE, en el mismo hueco exacto.
 *
 * ESO NO ES UN DETALLE DE ESTILO. La primera versión recorría el guion aquí
 * con su propia expresión regular, «igual» que el extractor. No era igual: una
 * plantilla puede llevar otra dentro, la comilla invertida de la de dentro
 * cerraba la de fuera antes de tiempo, y al reescribirla dejaba
 * `${cardSelected ?}` donde había `${cardSelected ? \`…\`}`. Con el
 * diccionario VACÍO ya rompía la página. Dos recorridos parecidos que hay que
 * mantener a mano acaban siendo dos recorridos distintos.
 *
 * Se sustituye de ATRÁS HACIA DELANTE para que las posiciones de los trozos
 * que quedan sigan valiendo.
 *
 * Y SE ESCAPA. Media traducción inglesa lleva apóstrofo dentro («Doesn't»,
 * «Manager's») y el literal de origen suele ir entre comillas simples. Meterla
 * a pelo cierra el literal donde no toca y deja la página sin guion, que es un
 * fallo que no se ve hasta que alguien pulsa algo.
 */
function traduceLosGuiones(html, dic) {
  /* SE ORDENA POR POSICIÓN, y no vale el orden en que vienen.
     `trozosDeLosGuiones` los devuelve en orden de RECORRIDO: primero los textos
     de un literal y luego lo que hay dentro de sus interpolaciones, que está
     ANTES en el fichero. Recorrer el array del final al principio no es, por
     tanto, recorrer el texto del final al principio: una sustitución temprana
     movía las posiciones de las siguientes y el reemplazo caía desplazado.
     Dejó `<div class="mod-price-label">Precio</dPriceiv>` en la página. */
  const trozos = [...trozosDeLosGuiones(html)].sort((a, b) => a.ini - b.ini);
  let salida = html;
  for (let k = trozos.length - 1; k >= 0; k--) {
    const t = trozos[k];
    const en = dic[t.texto];
    if (en === undefined || en === t.texto) continue;
    /* Y antes de escribir, que el hueco sea el que se cree. Un desajuste de
       posiciones no da error: deja la página torcida y sigue. */
    if (salida.slice(t.ini, t.fin) !== t.texto) {
      throw new Error("el hueco no coincide: esperaba " + JSON.stringify(t.texto).slice(0, 60) +
        " y hay " + JSON.stringify(salida.slice(t.ini, t.fin)).slice(0, 60));
    }
    /* Se escapa la comilla que delimita el literal, y NADA MÁS.
       En concreto, los `${…}` NO se escapan: son el sitio donde el programa
       mete el número, viajan dentro de la clave a propósito —«${val} usuarios»
       se traduce entero a «${val} users»— y escaparlos los convierte en texto.
       La página inglesa llegó a enseñar «${usuariosCuenta} users included» tal
       cual, con las llaves a la vista, por escaparlos «por seguridad». */
    const puesto = en.split("\\").join("\\\\").split(t.comilla).join("\\" + t.comilla);
    salida = salida.slice(0, t.ini) + puesto + salida.slice(t.fin);
  }
  return salida;
}

/**
 * Sustituye el texto de una página y deja el marcado donde estaba.
 *
 * Se trabaja por TROZOS y no con un `replace` sobre el fichero entero: eso
 * cambiaría también lo que hay dentro de un <script>, de un comentario o de un
 * nombre de clase que por casualidad coincidiera con una palabra. Aquí sólo se
 * toca lo que el extractor reconoció como texto de persona.
 */
function traduce(html, dic) {
  if (html.includes("@@ZONA")) throw new Error("la marca @@ZONA ya está en la página: hay que elegir otra");

  const tapado = [];
  const conHuecos = html
    .replace(ZONAS_DE_CODIGO, (m) => { tapado.push(m); return MARCA(tapado.length - 1); })
    .replace(COMENTARIOS, (m) => { tapado.push(m); return MARCA(tapado.length - 1); });

  let salida = conHuecos;

  /* 1. El texto entre etiquetas. Los espacios de los extremos se conservan:
        hay sitios donde separan dos palabras que van en etiquetas distintas. */
  salida = salida.replace(/>([^<>]+)</g, (todo, dentro) => {
    const t = dentro.trim();
    if (!t) return todo;
    const en = dic[t];
    if (en === undefined) return todo;
    const izq = dentro.match(/^\s*/)[0];
    const der = dentro.match(/\s*$/)[0];
    return ">" + izq + en + der + "<";
  });

  /* 2. Los atributos que se leen en voz alta o salen en un globo. */
  salida = salida.replace(/\b(alt|title|placeholder|aria-label)="([^"]+)"/g, (todo, attr, valor) => {
    const en = dic[valor.trim()];
    return en === undefined ? todo : attr + '="' + en + '"';
  });

  /* 3. El título de la pestaña. */
  salida = salida.replace(/<title>([^<]+)<\/title>/, (todo, t) => {
    const en = dic[t.trim()];
    return en === undefined ? todo : "<title>" + en + "</title>";
  });

  /* 4. Las etiquetas de la tarjeta de enlace. */
  salida = salida.replace(
    /(<meta[^>]*\b(?:name|property)="(?:description|og:title|og:description|og:image:alt|og:site_name|twitter:title|twitter:description|twitter:image:alt)"[^>]*\bcontent=")([^"]+)(")/gi,
    (todo, antes, valor, despues) => {
      const en = dic[valor.trim()];
      return en === undefined ? todo : antes + en + despues;
    },
  );

  /* Las zonas tapadas, de vuelta a su sitio. */
  salida = salida.replace(MARCA_PUESTA, (_, i) => tapado[Number(i)]);
  if (salida.includes("@@ZONA")) throw new Error("quedó una marca sin devolver");

  /* Y una segunda pasada por los atributos, ahora SÍ sobre el documento entero.
     Hay marcado que lo pinta un guion: el formulario de partners se arma desde
     JavaScript, así que sus `placeholder` viven dentro de un <script>. El
     extractor los encontraba —busca atributos en todo el fichero— y esta
     función no podía tocarlos, porque trabajaba sobre el texto con las zonas de
     código tapadas. Resultado: tres campos del formulario se quedaban en
     castellano en la página inglesa.
     Se limita a los cuatro atributos que se leen y sólo cambia lo que está en
     el diccionario, así que no puede tocar código por accidente. */
  salida = salida.replace(/\b(alt|title|placeholder|aria-label)="([^"]+)"/g, (todo, attr, valor) => {
    const en = dic[valor.trim()];
    return en === undefined ? todo : attr + '="' + en + '"';
  });

  /* Y EL TEXTO QUE VIVE DENTRO DE LOS <script>.
     Va aquí, con las zonas ya devueltas a su sitio, porque justamente es la
     zona que antes se tapaba entera. La calculadora de planes pinta sus doce
     módulos desde un array de JavaScript: nombre, descripción y cinco
     prestaciones cada uno. Eso no lo veía el traductor y por eso la página
     inglesa servía el catálogo entero en castellano. */
  salida = traduceLosGuiones(salida, dic);

  /* QUÉ SE QUEDÓ SIN TRADUCIR.
     No vale mirar los trozos de la salida y ya: el extractor no sabe distinguir
     castellano de inglés —«Modules» le parece tan lenguaje como «Módulos»— así
     que contaría también lo ya traducido. La primera versión decía «0%
     traducido» con la página medio traducida delante.
     Lo que se compara son los trozos del ORIGEN: los que siguen apareciendo en
     la salida son, exactamente, los que no se tradujeron. */
  const enLaSalida = new Set(segmentos(salida).map((s) => s.texto));
  const sinTraducir = segmentos(html)
    .map((s) => s.texto)
    .filter((t) => enLaSalida.has(t))
    /* Que siga ahí no quiere decir que falte: hay textos que en inglés se
       escriben IGUAL —«Certified», «Innovation Award 2026», «CYBERSECURITY
       FRAMEWORK»— y su traducción es él mismo. Contarlos como pendientes daba
       222 falsos, todos ellos ya resueltos. Falta el que no tiene entrada, o
       el que tiene una distinta y aun así sigue en castellano. */
    .filter((t) => dic[t] === undefined || dic[t] !== t);

  return { html: salida, sinTraducir };
}

/** El idioma declarado de la página. */
function ponIdioma(html, idioma) {
  return html.replace(/<html lang="[a-z-]+"/, '<html lang="' + idioma + '"');
}

if (require.main === module) {
  const { ponSelector, ponAlternativas, subeUnNivelLosRecursos, bajaUnNivelLosRecursos } = require("./selector.cjs");
  const { ponDeteccion } = require("./deteccion.cjs");
  const { CASTELLANO, INGLES } = require("../donde.cjs");
  const SITIO = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "sitio.json"), "utf8"));
  const dic = diccionario();
  console.log("  diccionario: " + Object.keys(dic).length + " entradas\n");

  let quedan = 0;

  for (const p of TODAS) {
    /* Se LEE del castellano y se ESCRIBE en la raíz. Nunca al revés: así se
       puede correr las veces que haga falta sin que la segunda pise la fuente.
       La primera versión leía y escribía en la raíz, y correrla dos veces
       copiaba el inglés encima del castellano sin que saltara nada. */
    const origen = path.join(CASTELLANO, p + ".html");
    if (!fs.existsSync(origen)) { console.log("  " + p.padEnd(12) + " no está en es/, se salta"); continue; }
    const partida = fs.readFileSync(origen, "utf8");

    /* Para el SELECTOR, cada página necesita su propio nombre de fichero: desde
       `oscuro.html` se salta a `oscuro.html` del otro idioma, no a `index`. */
    /* CADA IDIOMA TIENE SU NOMBRE DE FICHERO, Y NO SIEMPRE ES EL MISMO.
       Tres páginas cambian de nombre al pasar a inglés: `marcos` se sirve como
       `frameworks.html`, `confianza` como `trustcenter.html` y `contacto` como
       `contact.html`. Eso lo sabía `posicionar.cjs` —de ahí sale el mapa— y lo
       sabía el validador bilingüe; el único que no lo sabía era este guion.

       Escribía el inglés en `marcos.html`, que está redirigido a `/frameworks`
       con un 301: la traducción caía en un fichero que no sirve nadie, y la
       página que sí se sirve se mantenía A MANO, fuera de la cadena. Por eso
       las dos se separaron, y por eso el validador llevaba meses diciendo que
       la estructura de `marcos` no cuadraba. */
    const ficheroEn = ficheroDe(p, "en");
    const ficheroEs = ficheroDe(p, "es");

    /* Para la CANÓNICA es al revés. `oscuro.html` no es una página distinta:
       es la misma portada con el tema oscuro, y declararla como dirección
       propia la pondría a competir con la portada en el buscador. Comparte la
       canónica de la portada, que es la raíz. */
    const canonica = p === "index" || p === "oscuro" ? "" : p + ".html";

    /* El castellano se vuelve a escribir con su selector y su canónica: el
       selector es lo único que se le añade, y tiene que estar en los dos. */
    let es = ponIdioma(partida, "es");
    es = ponSelector(es, "es", ficheroEn, ficheroEs);
    es = ponAlternativas(es, "es", canonica, SITIO.base);
    es = ponDeteccion(es);
    /* Las capturas y el icono viven en la raiz y la castellana esta un nivel
       mas adentro: sin esto, la ventana del carrusel sale vacia. */
    es = subeUnNivelLosRecursos(es);
    fs.writeFileSync(origen, es);

    /* Y el inglés, en la raíz. */
    let en = ponIdioma(partida, "en");
    en = ponSelector(en, "en", ficheroEn, ficheroEs);
    en = ponAlternativas(en, "en", canonica, SITIO.base);
    en = ponDeteccion(en);
    /* La inglesa vive en la RAÍZ, al lado de las capturas: sin prefijo.
       Se quita lo lleve o no. Lo que se lee de `es/` puede traerlo puesto
       —esta misma vuelta lo escribe ahí— y entonces la portada inglesa salía
       con las quince capturas rotas a partir de la segunda pasada. */
    en = bajaUnNivelLosRecursos(en);
    const traducida = traduce(en, dic);
    fs.writeFileSync(path.join(INGLES, ficheroEn), traducida.html);
    quedan += traducida.sinTraducir.length;
    console.log("  " + p.padEnd(12)
      + (traducida.sinTraducir.length
        ? String(traducida.sinTraducir.length).padStart(4) + " sin traducir"
        : "   traducida entera"));
  }

  console.log("\n  es/  el castellano, la fuente");
  console.log("  /    el inglés, lo que se sirve por omisión");
  if (quedan) console.log("\n  QUEDAN " + quedan + " trozos en castellano en la versión inglesa.");
}

module.exports = { traduce, diccionario, ponIdioma, TODAS };
