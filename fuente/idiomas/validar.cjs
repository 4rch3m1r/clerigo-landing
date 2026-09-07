/**
 * LA GARANTÍA BILINGÜE: quitando el texto, la inglesa y la castellana son el
 * MISMO fichero.
 *
 *   node fuente/idiomas/validar.cjs
 *
 * Por qué esto y no leerlas a ojo. Dos versiones de una página se separan
 * despacio y en silencio: se corrige un dato en una, se añade una sección en
 * la otra, se cambia un enlace aquí y allí no. Cuando alguien lo nota, ya hay
 * clientes que han visto la mala. Comparar la ESTRUCTURA —todo menos el
 * texto— convierte eso en un fallo que salta al generar.
 *
 * Lo que SÍ puede cambiar entre las dos, y está declarado aquí:
 *   · el texto, que es de lo que va todo esto;
 *   · el `lang` del documento;
 *   · los dos enlaces del selector de idioma, que apuntan al otro lado;
 *   · la canónica y las alternativas de la cabecera.
 * Cualquier otra diferencia es un fallo.
 */
const fs = require("node:fs");
const path = require("node:path");
const { segmentos, ZONAS_DE_CODIGO, COMENTARIOS, LITERAL_DE_GUION } = require("./segmentos.cjs");
const { TODAS } = require("./a-ingles.cjs");
const { CASTELLANO } = require("../donde.cjs");
const { diccionario } = require("./a-ingles.cjs");
const { sinPosicionamiento } = require("../seo/marcas.cjs");

/* El diccionario, para saber qué textos se escriben igual en los dos idiomas. */
const DIC = diccionario();

const RAIZ = path.join(__dirname, "..", "..");

const fallos = [];
function comprueba(punto, condicion, detalle) {
  const ok = !!condicion;
  if (!ok) fallos.push(punto + (detalle ? " — " + detalle : ""));
  console.log((ok ? "  OK  " : "  MAL ") + punto + (detalle && !ok ? "  ·  " + detalle : ""));
}

/**
 * La página SIN texto: sólo su esqueleto.
 *
 * Se sustituye cada trozo de texto por una marca del mismo tipo, no se borra:
 * borrarlo dejaría `<p></p>` y dos párrafos vacíos seguidos parecerían uno.
 * Con la marca, un párrafo que se pierda se ve.
 */
function esqueleto(html) {
  const tapado = [];
  /* Lo del posicionamiento, fuera: las palabras clave están TRADUCIDAS —para
     eso son palabras— y el idioma de la tarjeta es, por definición, distinto
     en cada versión. Comparar eso sería exigir que la inglesa lleve las
     palabras castellanas. */
  let s = sinPosicionamiento(html)
    .replace(ZONAS_DE_CODIGO, (m) => { tapado.push(m); return "@@Z" + (tapado.length - 1) + "@@"; })
    .replace(COMENTARIOS, (m) => { tapado.push(m); return "@@Z" + (tapado.length - 1) + "@@"; });

  s = s.replace(/>([^<>]+)</g, (todo, dentro) => (dentro.trim() ? ">·<" : todo));
  s = s.replace(/\b(alt|title|placeholder|aria-label)="([^"]+)"/g, '$1="·"');
  s = s.replace(/<title>[^<]+<\/title>/, "<title>·</title>");
  s = s.replace(
    /(<meta[^>]*\b(?:name|property)="(?:description|og:title|og:description|og:image:alt|og:site_name|twitter:title|twitter:description|twitter:image:alt)"[^>]*\bcontent=")([^"]+)(")/gi,
    "$1·$3",
  );

  /* Las cuatro diferencias declaradas se normalizan a la misma cosa. */
  s = s
    .replace(/<html lang="[a-z-]+"/, '<html lang="·"')
    .replace(/<a href="[^"]*" class="idioma" data-idioma="(en|es)" hreflang="\1">/g, '<a class="idioma" data-idioma="$1">')
    /* Las capturas y el icono viven en la RAÍZ y son las mismas en los dos
       idiomas; la castellana está un nivel más adentro y por eso los cita con
       `../`. Se normalizan las dos formas a la misma para poder comparar. */
    .replace(/(\s(?:src|href)=")\.\.\/((?:sistema\/[a-z0-9-]+|favicon)\.png)"/g, '$1$2"')
    .replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="·">')
    /* `og:url` va con la canónica: cada versión declara SU dirección, y la de
       la castellana lleva /es/. Si sólo se normalizara la canónica, esta línea
       saltaría como diferencia de estructura cuando en realidad es la misma
       declaración en dos idiomas. */
    .replace(/<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="·">')
    .replace(/<link rel="alternate" hreflang="[a-z-]+" href="[^"]*">/g, '<link rel="alternate" href="·">');

  return s.replace(/@@Z(\d+)@@/g, (_, i) => tapado[Number(i)]);
}

/* El script del carrusel lleva un rótulo dentro del propio guion, así que se
   compara también: dos versiones no pueden tener guiones distintos. */

/* ── TRES PÁGINAS CAMBIARON DE NOMBRE AL PASAR A INGLÉS ───────────────────
 *
 * `marcos` → `frameworks`, `confianza` → `trustcenter`, `contacto` → `contact`.
 * En la raíz, con el nombre castellano, ya no hay una página: hay una PUERTA de
 * redirección de 900 bytes que manda a `/es/marcos` o a `/frameworks` según el
 * idioma de quien llega. Eso existe porque el castellano vive en `/es/`, y
 * tener la misma página en `/marcos` y en `/es/marcos` era contenido duplicado.
 *
 * Una puerta no es la traducción de nada, así que compararla contra la
 * castellana daba seis fallos que no describían ningún problema. Se comparan
 * contra su verdadera pareja inglesa.
 */
const PAREJA_INGLESA = { marcos: "frameworks", confianza: "trustcenter", contacto: "contact" };

console.log("── Las dos versiones son la misma página ──────────────────────");
for (const p of TODAS) {
  const rEn = path.join(RAIZ, (PAREJA_INGLESA[p] || p) + ".html");
  const rEs = path.join(CASTELLANO, p + ".html");
  if (!fs.existsSync(rEn) || !fs.existsSync(rEs)) {
    comprueba(`${p}: existen las dos versiones`, false,
      (fs.existsSync(rEn) ? "" : "falta la inglesa ") + (fs.existsSync(rEs) ? "" : "falta la castellana"));
    continue;
  }
  const en = fs.readFileSync(rEn, "utf8").split("\r\n").join("\n");
  const es = fs.readFileSync(rEs, "utf8").split("\r\n").join("\n");

  const eEn = esqueleto(en).split("\n");
  const eEs = esqueleto(es).split("\n");
  let primera = -1;
  for (let i = 0; i < Math.max(eEn.length, eEs.length); i++) {
    if (eEn[i] !== eEs[i]) { primera = i; break; }
  }
  comprueba(`${p}: misma estructura quitando el texto`, primera < 0,
    primera < 0 ? "" : `línea ${primera + 1}\n        en: ${(eEn[primera] || "(no hay)").trim().slice(0, 100)}\n        es: ${(eEs[primera] || "(no hay)").trim().slice(0, 100)}`);

  comprueba(`${p}: el idioma declarado es el que toca`,
    /<html lang="en"/.test(en) && /<html lang="es"/.test(es));

  /* Ni una palabra en castellano en la inglesa. Es la otra mitad: la
     estructura puede cuadrar y la página seguir a medio traducir.
     No vale con mirar los trozos de la inglesa: el extractor no sabe distinguir
     idiomas —«Modules» le parece tan lenguaje como «Módulos»— y contaría la
     página entera. Lo que se mira son los trozos de la CASTELLANA que siguen
     apareciendo en la inglesa; y de esos se descuentan los que se escriben
     igual en los dos idiomas, que los hay: «Certified», «Innovation Award
     2026», «CYBERSECURITY FRAMEWORK». */
  const enLaInglesa = new Set(segmentos(en).map((s) => s.texto));
  const restos = segmentos(es)
    .map((s) => s.texto)
    .filter((t) => enLaInglesa.has(t))
    .filter((t) => DIC[t] === undefined || DIC[t] !== t);
  comprueba(`${p}: no queda castellano en la inglesa`, restos.length === 0,
    restos.length ? `${restos.length} trozos, p.ej. «${restos[0].slice(0, 60)}»` : "");

  /* LA MISMA PREGUNTA, POR OTRO CAMINO, Y POR UN MOTIVO.
   *
   * La comprobación de arriba mira los trozos que el extractor SACA de la
   * castellana. Todo lo que el extractor no ve, ella tampoco: si un texto no
   * llega a ser un «segmento», no está en la lista, no se compara y no falta.
   * Una guarda que hereda la ceguera de la pieza que le da los datos no es una
   * segunda opinión, es la misma opinión escrita dos veces.
   *
   * Y pasó. `PARECE_LENGUAJE` no aceptaba una palabra suelta en minúscula sin
   * tilde, así que «complicada» no era un segmento. El titular de la portada
   * en inglés decía «Managing GRC doesn't have to be complicada», y esta línea
   * de aquí arriba daba OK. Un mes así.
   *
   * Ésta no pregunta a nadie: lee la página inglesa en crudo, le quita las
   * etiquetas y busca castellano en lo que queda. Las señales son dos —una
   * letra con tilde o eñe, o una palabra de las que sólo existen en
   * castellano— y las excepciones van escritas una a una aquí abajo, que son
   * nombres propios y por tanto una lista corta y estable. */
  /* Se quitan del texto ANTES de juzgarlo, en vez de exigir que el trozo entero
     sea uno de ellos. Un nombre propio casi nunca va solo: va dentro de una
     frase —«…the Tribunales de Primera Instancia del Distrito Nacional of
     Santo Domingo»— y con la comparación entera esa frase quedaba marcada
     para siempre, que es como una guarda se vuelve ruido y acaba apagada. */
  const NOMBRES_PROPIOS = [
    "Instituto Dominicano de las Telecomunicaciones",
    "Tribunales de Primera Instancia del Distrito Nacional",
    "Superintendencia del Mercado de Valores", "Superintendencia de Valores",
    "Superintendencia de Bancos", "Bolsa de Valores", "Mercado de Valores",
    "Banco Central", "Banco del Norte", "Grupo Financiero Andino",
    "Laura González", "Carlos Ramos", "Alejandro Mora", "María García",
    "Grace Anderson", "Joseph Walker", "Michael Collins",
    "García", "González", "Santo Domingo",
    /* Un logotipo parte el nombre en dos líneas y cada mitad es su propio
       nodo de texto: dentro del SVG del sello, «Bolsa» va en una y
       «de Valores» en la siguiente. */
    "de Valores",
  ];
  /* Palabras que en inglés no existen. Se piden ENTERAS: sin eso, «no» dentro
     de «not» y «de» dentro de «under» encendían la alarma en cada frase. */
  const SOLO_CASTELLANO = /(^|[\s>(¿¡"'—·])(de|del|la|el|los|las|un|una|unos|unas|con|para|por|que|se|su|sus|y|en|al|más|sin|sobre|entre|desde|hasta|cada|todo|toda|todos|todas|nuestro|nuestra|nuestros|nuestras|son|está|están|este|esta|estos|estas|ni|pero|ya|hay|ser|tiene|puede|debe|hace|cuando|donde|quién|porque|así|aquí|también|sólo|solo)([\s<.,;:)!?"'—·]|$)/;
  const CON_TILDE = /[áéíóúñ¿¡]/;

  const enCrudo = en
    .replace(ZONAS_DE_CODIGO, " ")
    .replace(COMENTARIOS, " ");
  const sospechosos = [];
  for (const m of enCrudo.matchAll(/>([^<>]+)</g)) {
    let t = m[1].replace(/&[a-z]+;|&#\d+;/gi, " ").replace(/\s+/g, " ").trim();
    if (!t || t.length < 3) continue;
    for (const n of NOMBRES_PROPIOS) t = t.split(n).join(" ");
    if (CON_TILDE.test(t) || SOLO_CASTELLANO.test(t)) sospechosos.push(m[1].replace(/\s+/g, " ").trim().slice(0, 70));
  }
  comprueba(`${p}: la inglesa no lleva castellano suelto`, sospechosos.length === 0,
    sospechosos.length ? `${sospechosos.length}, p.ej. «${sospechosos[0]}»` : "");

  /* Y LO MISMO DENTRO DEL <script>, QUE ES DONDE ESTA GUARDA ERA CIEGA.
   *
   * Aquí arriba se dice que ésta no hereda la ceguera del extractor. Heredaba
   * una: `enCrudo` empieza tapando `ZONAS_DE_CODIGO`, así que las DOS
   * comprobaciones —la de los trozos y ésta, la que iba a ser la segunda
   * opinión— dejaban de mirar en el mismo sitio exacto.
   *
   * Y ahí había mucho. La calculadora de planes pinta sus doce módulos
   * —nombre, descripción y cinco prestaciones cada uno— desde un array de
   * JavaScript. La página inglesa se sirvió con el catálogo entero en
   * castellano, con `og:locale="en_US"` en la cabecera, y las dos guardas
   * dando OK.
   *
   * Esto NO le pregunta a `textosDeLosGuiones`, a propósito: si le preguntara,
   * volvería a ser la misma opinión escrita dos veces. Coge todos los
   * literales en crudo y les pasa las dos señales de castellano de arriba. */
  const enElGuion = [];
  for (const zona of en.match(ZONAS_DE_CODIGO) || []) {
    if (!/^<script/i.test(zona)) continue;
    const cuerpo = zona.slice(zona.indexOf(">") + 1, zona.lastIndexOf("</"))
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/^[ \t]*\/\/.*$/gm, " ");
    for (const m of cuerpo.matchAll(new RegExp(LITERAL_DE_GUION.source, "g"))) {
      let t = (m[1] ?? m[2] ?? m[3] ?? "").replace(/&[a-z]+;|&#\d+;/gi, " ").replace(/\s+/g, " ").trim();
      if (t.length < 3) continue;
      for (const n of NOMBRES_PROPIOS) t = t.split(n).join(" ");
      if (CON_TILDE.test(t) || SOLO_CASTELLANO.test(t)) enElGuion.push(t.slice(0, 70));
    }
  }
  comprueba(`${p}: la inglesa no lleva castellano dentro del guion`, enElGuion.length === 0,
    enElGuion.length ? `${enElGuion.length}, p.ej. «${enElGuion[0]}»` : "");

  /* Y la detección de idioma, en las DOS.
     Quitarla no rompe nada que se vea —la página carga igual de bien— y a quien
     llega con el navegador en castellano se le queda el inglés delante sin
     enterarse de que hay otra versión. Va en la cabecera, antes de que se pinte
     nada; si alguien la moviera al final del cuerpo, se vería la página en un
     idioma y saltaría al otro delante de quien la lee. Por eso se comprueba
     también DÓNDE está. */
  for (const [cual, h] of [["inglesa", en], ["castellana", es]]) {
    const i = h.indexOf("/* El idioma del navegador decide");
    comprueba(`${p}: la ${cual} mira el idioma del navegador`, i > 0 && i < h.indexOf("</head>"),
      i < 0 ? "no está" : "está fuera de la cabecera");
  }

  /* ── Y QUE LAS IMÁGENES ESTÉN DONDE LA PÁGINA DICE ────────────────────
   *
   * Las capturas y el icono viven en la raíz y son los mismos para los dos
   * idiomas. La castellana está un nivel más adentro, así que los cita con
   * `../`; la inglesa, sin prefijo. Dos rutas distintas para el mismo fichero.
   *
   * Esto está aquí porque falló. El paso al inglés lee de `es/` y de camino
   * vuelve a escribir el castellano CON el `../` puesto; la segunda vez que se
   * corría, la inglesa heredaba ese prefijo y salía con las quince capturas
   * apuntando a `/../sistema/…`. El carrusel entero de la portada, en blanco,
   * y ninguna comprobación lo veía: la estructura cuadraba —las dos páginas
   * tienen las mismas etiquetas— y el texto también.
   *
   * No se compara el prefijo: se RESUELVE la ruta desde donde vive la página y
   * se mira si el fichero está. Es la única forma que no se puede engañar. */
  for (const [cual, h, base] of [["inglesa", en, RAIZ], ["castellana", es, CASTELLANO]]) {
    const citados = [...h.matchAll(/\s(?:src|href)="((?!https?:|\/\/|#|mailto:|data:)[^"]*\.(?:png|jpg|jpeg|svg|webp|ico))"/g)]
      .map((m) => m[1]);
    const rotos = [...new Set(citados)].filter((r) => !fs.existsSync(path.resolve(base, r)));
    comprueba(`${p}: las imágenes que cita la ${cual} existen desde donde ella vive`,
      citados.length > 0 && rotos.length === 0,
      citados.length === 0 ? "no cita ninguna" : `${rotos.length} de ${citados.length}: ${rotos.slice(0, 2).join(" ")}`);
  }

  /* Y el selector lleva al mismo sitio desde las dos. */
  const fichero = p === "index" ? "index.html" : p + ".html";
  comprueba(`${p}: el selector de idioma lleva al otro lado`,
    en.includes(`<a href="es/${fichero}" class="idioma" data-idioma="es"`)
    && es.includes(`<a href="../${fichero}" class="idioma" data-idioma="en"`));
}

console.log("\n────────────────────────────────────────────────────────────────");
console.log(fallos.length === 0 ? "TODO PASA" : `FALLAN ${fallos.length}:`);
fallos.forEach((f) => console.log("  · " + f));
process.exitCode = fallos.length ? 1 : 0;
