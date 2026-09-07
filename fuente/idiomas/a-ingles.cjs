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
const { segmentos, ZONAS_DE_CODIGO, COMENTARIOS, LITERAL_DE_GUION } = require("./segmentos.cjs");
const { PAGINAS } = require("./reunir.cjs");

const RAIZ = path.join(__dirname, "..", "..");
const DIR_ES = path.join(RAIZ, "es");

/* index tiene además su gemela oscura. */
const TODAS = [...PAGINAS, "oscuro"];

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

/* Un comentario O un literal, en ese orden: el comentario tiene que ganar para
   que sus comillas no se confundan con las del código. */
const COMENTARIO_O_LITERAL = new RegExp(
  "/\\*[\\s\\S]*?\\*/|//[^\\n]*|" + LITERAL_DE_GUION.source, "g");

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
 * Espejo exacto de `textosDeLosGuiones` de `segmentos.cjs`: lo que aquél SACA,
 * éste lo PONE. Si los dos no recorren el guion igual, hay trozos que se
 * ofrecen para traducir y luego no se sustituyen nunca, y el aviso de «quedan
 * N sin traducir» no baja de N hagas lo que hagas.
 *
 * Sólo cambia lo que tiene entrada EXACTA en el diccionario. Ésa es toda la
 * seguridad que hace falta aquí: `annual` —lo que compara
 * `billing === 'annual'`— no está en el diccionario y por tanto no se toca.
 *
 * LA COMILLA SE ESCAPA. Media traducción inglesa lleva apóstrofo dentro
 * («Doesn't», «Manager's») y el literal de origen suele ir entre comillas
 * simples. Meterla a pelo cierra el literal donde no toca y deja la página sin
 * guion, que es un fallo que no se ve hasta que alguien pulsa algo.
 */
function traduceCodigo(js, dic) {
  return js.replace(COMENTARIO_O_LITERAL, (todo, a, b, c) => {
    /* Los comentarios se saltan enteros. El extractor los quita antes de mirar;
       aquí no se pueden quitar, hay que devolverlos tal cual. Y hay que
       RECONOCERLOS: un apóstrofo suelto en un comentario —«l'année», «d'un»—
       emparejaría con la comilla siguiente, que ya es código, y lo de en medio
       pasaría por literal. */
    if (todo[0] === "/") return todo;
    const comilla = todo[0];
    const escapa = (t) => t.split("\\").join("\\\\").split(comilla).join("\\" + comilla);
    let dentro = a ?? b ?? c ?? "";

    if (/<[a-zA-Z/]/.test(dentro)) {
      /* Lleva marcado: se le traduce el texto entre etiquetas, igual que a la
         página, conservando los espacios de los extremos —ahí sí separan
         palabras que van en etiquetas distintas—. */
      dentro = dentro.replace(/>([^<>]*)</g, (t, x) => {
        const en = dic[x.trim()];
        if (en === undefined) return t;
        return ">" + x.match(/^\s*/)[0] + escapa(en) + x.match(/\s*$/)[0] + "<";
      });
    } else {
      const en = dic[dentro.trim()];
      if (en !== undefined) dentro = escapa(en);
    }

    /* Y dentro de sus interpolaciones hay más literales: `${auto ? 'Incluido'
       : …}` es un rótulo que se enseña y que ninguna de las dos vías de arriba
       alcanza. */
    dentro = conLasInterpolaciones(dentro, (trozo) => traduceCodigo(trozo, dic));
    return comilla + dentro + comilla;
  });
}

/** Reescribe cada `${…}` de una plantilla pasándolo por `hacer`. */
function conLasInterpolaciones(s, hacer) {
  let sale = "";
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== "$" || s[i + 1] !== "{") { sale += s[i]; continue; }
    let prof = 1, j = i + 2;
    while (j < s.length && prof > 0) {
      if (s[j] === "{") prof++; else if (s[j] === "}") prof--;
      j++;
    }
    sale += "${" + hacer(s.slice(i + 2, j - 1)) + "}";
    i = j - 1;
  }
  return sale;
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
  salida = salida.replace(ZONAS_DE_CODIGO, (zona) => {
    if (!/^<script/i.test(zona)) return zona;
    const cierre = zona.indexOf(">");
    const attrs = zona.slice(0, cierre);
    if (/type\s*=\s*["'](?!text\/javascript|module)/i.test(attrs)) return zona;
    if (/\bsrc=/i.test(attrs)) return zona;
    const fin = zona.lastIndexOf("</");
    return zona.slice(0, cierre + 1) + traduceCodigo(zona.slice(cierre + 1, fin), dic) + zona.slice(fin);
  });

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
    const fichero = p === "index" ? "index.html" : p + ".html";

    /* Para la CANÓNICA es al revés. `oscuro.html` no es una página distinta:
       es la misma portada con el tema oscuro, y declararla como dirección
       propia la pondría a competir con la portada en el buscador. Comparte la
       canónica de la portada, que es la raíz. */
    const canonica = p === "index" || p === "oscuro" ? "" : p + ".html";

    /* El castellano se vuelve a escribir con su selector y su canónica: el
       selector es lo único que se le añade, y tiene que estar en los dos. */
    let es = ponIdioma(partida, "es");
    es = ponSelector(es, "es", fichero);
    es = ponAlternativas(es, "es", canonica, SITIO.base);
    es = ponDeteccion(es);
    /* Las capturas y el icono viven en la raiz y la castellana esta un nivel
       mas adentro: sin esto, la ventana del carrusel sale vacia. */
    es = subeUnNivelLosRecursos(es);
    fs.writeFileSync(origen, es);

    /* Y el inglés, en la raíz. */
    let en = ponIdioma(partida, "en");
    en = ponSelector(en, "en", fichero);
    en = ponAlternativas(en, "en", canonica, SITIO.base);
    en = ponDeteccion(en);
    /* La inglesa vive en la RAÍZ, al lado de las capturas: sin prefijo.
       Se quita lo lleve o no. Lo que se lee de `es/` puede traerlo puesto
       —esta misma vuelta lo escribe ahí— y entonces la portada inglesa salía
       con las quince capturas rotas a partir de la segunda pasada. */
    en = bajaUnNivelLosRecursos(en);
    const traducida = traduce(en, dic);
    fs.writeFileSync(path.join(INGLES, p + ".html"), traducida.html);
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
