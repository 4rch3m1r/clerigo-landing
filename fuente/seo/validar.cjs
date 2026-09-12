/**
 * QUE LO QUE SE LE CUENTA AL BUSCADOR SEA VERDAD.
 *
 *   node fuente/seo/validar.cjs
 *
 * Los datos estructurados son el único sitio del proyecto donde se le habla a
 * una máquina que no ve la página. Todo lo demás —un texto mal, un enlace
 * roto— lo nota quien mira; esto no lo nota nadie, y cuando se nota es porque
 * llegó un aviso de Google diciendo que el precio de la ficha no es el de la
 * página. Por eso se comprueba aquí y no se deja a la vista.
 *
 * Lo que más importa de este fichero son las dos últimas comprobaciones: que
 * el precio de la ficha sea el que la página publica, y que no haya reseñas
 * inventadas. Las dos son las que convierten esto en algo que se puede firmar.
 */
const fs = require("node:fs");
const path = require("node:path");
const { PALABRAS } = require("./vocabulario.cjs");
const { PAGINAS, NO_INDEXAR, BASE } = require("./posicionar.cjs");
const { CASTELLANO, INGLES } = require("../donde.cjs");

const RAIZ = path.join(__dirname, "..", "..");
const lee = (f) => fs.readFileSync(f, "utf8");

const fallos = [];
let cuantas = 0;
function comprueba(punto, condicion, detalle) {
  cuantas++;
  const ok = !!condicion;
  if (!ok) fallos.push(punto + (detalle ? " — " + detalle : ""));
  console.log((ok ? "  OK  " : "  MAL ") + punto + (detalle && !ok ? "  ·  " + detalle : ""));
}

/* ── 1. El mapa del sitio ───────────────────────────────────────────────── */
console.log("\n── El mapa del sitio ───────────────────────────────────────────");

const fMapa = path.join(RAIZ, "sitemap.xml");
comprueba("sitemap.xml existe", fs.existsSync(fMapa));
const mapa = fs.existsSync(fMapa) ? lee(fMapa) : "";
const direcciones = [...mapa.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const indexables = PAGINAS.filter((p) => !NO_INDEXAR.includes(p.slug));
comprueba("una entrada por página y por idioma",
  direcciones.length === indexables.length * 2,
  `${direcciones.length} direcciones, esperaba ${indexables.length * 2}`);

comprueba("todas las direcciones salen de la base de sitio.json",
  direcciones.length > 0 && direcciones.every((u) => u.startsWith(BASE + "/")),
  direcciones.filter((u) => !u.startsWith(BASE + "/")).slice(0, 2).join(" "));

/* Que la dirección lleve a un fichero que existe. Un sitemap que promete
   páginas que no están es peor que no tenerlo: cada 404 que entrega gasta
   presupuesto de rastreo y baja la confianza en el resto de la lista. */
const noEstan = direcciones.filter((u) => {
  const resto = u.slice(BASE.length + 1);
  const enEspanol = resto.startsWith("es/");
  const ruta = (enEspanol ? resto.slice(3) : resto);
  /* La ruta pública va SIN extensión —Cloudflare sirve /marcos y redirige
     desde /marcos.html—, pero en el disco el fichero sí la tiene. Se prueban
     las dos formas: lo que se comprueba es que la dirección lleve a algo, no
     cómo se llame el fichero. */
  const nombre = ruta || "index.html";
  const carpeta = enEspanol ? CASTELLANO : INGLES;
  return !fs.existsSync(path.join(carpeta, nombre))
    && !fs.existsSync(path.join(carpeta, nombre + ".html"));
});
comprueba("cada dirección lleva a un fichero que existe", noEstan.length === 0,
  noEstan.slice(0, 3).join(" "));

/* Las alternativas de idioma. Sin ellas las dos versiones compiten entre sí y
   el buscador se queda con una. */
const bloques = mapa.split("<url>").slice(1);
const sinAlternativas = bloques.filter((b) =>
  !(b.includes('hreflang="en"') && b.includes('hreflang="es"') && b.includes('hreflang="x-default"')));
comprueba("cada entrada declara sus dos idiomas y el de por omisión",
  bloques.length > 0 && sinAlternativas.length === 0,
  `${sinAlternativas.length} entradas sin las tres`);

comprueba("la portada oscura NO está en el mapa",
  !direcciones.some((u) => u.endsWith("oscuro.html")),
  "es la misma portada con otra piel: dos veces el mismo texto en el índice");

/* ── 2. La carta a los rastreadores ─────────────────────────────────────── */
console.log("\n── robots.txt ──────────────────────────────────────────────────");

const fRobots = path.join(RAIZ, "robots.txt");
comprueba("robots.txt existe", fs.existsSync(fRobots));
const robots = fs.existsSync(fRobots) ? lee(fRobots) : "";
comprueba("apunta al mapa, con la base de sitio.json",
  robots.includes("Sitemap: " + BASE + "/sitemap.xml"));
comprueba("no prohíbe nada que deba indexarse",
  !/^\s*Disallow:\s*\/\s*$/m.test(robots),
  "un «Disallow: /» a secas saca el sitio entero del buscador");
/* La trampa clásica: prohibir el paso a una página que lleva «noindex» dentro.
   Si no puede entrar, no lee la orden, y la indexa igual por los enlaces que
   le llegan de fuera. */
comprueba("no prohíbe la portada oscura, que lleva su «noindex» dentro",
  !/Disallow:.*oscuro/.test(robots));

/* ── 3. Cada página ─────────────────────────────────────────────────────── */
/* Las páginas, con su fichero POR IDIOMA. Tres cambiaron de nombre al pasar a
   inglés —marcos→frameworks, confianza→trustcenter, contacto→contact— y aquí
   se armaba el nombre del fichero a partir del slug, así que para el inglés se
   abría `marcos.html`. Eso hoy es una puerta de redirección, no una página: el
   validador leía «Redirecting…» y daba seis fallos por página que no existían. */
const TODAS = [
  ...PAGINAS.map((p) => ({ slug: p.slug, disco: p.disco })),
  { slug: "oscuro", disco: { en: "oscuro.html", es: "oscuro.html" } },
];

for (const carpeta of [CASTELLANO, INGLES]) {
  const esIngles = carpeta === INGLES;
  const idioma = esIngles ? "en" : "es";
  console.log(`\n── Las páginas en ${esIngles ? "inglés" : "castellano"} ────────────────────────────────`);

  for (const { slug, disco } of TODAS) {
    const f = path.join(carpeta, disco[idioma]);
    if (!fs.existsSync(f)) continue;
    const h = lee(f);
    const p = `${idioma}/${slug}`;

    /* El título, con el patrón de las grandes. */
    const titulo = (h.match(/<title>([^<]*)<\/title>/) || [, ""])[1];
    comprueba(`${p}: el título nombra la marca y dice de qué va`,
      titulo.includes("Clèrigo") && titulo.includes(" | ") && titulo.length <= 70,
      `«${titulo}» (${titulo.length} letras)`);

    /* La descripción, en la horquilla que el buscador enseña entera. */
    const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [, ""])[1];
    comprueba(`${p}: la descripción cabe en el resultado`,
      desc.length >= 70 && desc.length <= 165, `${desc.length} letras`);

    /* Las palabras clave. */
    const clave = (h.match(/<meta name="keywords" content="([^"]*)"/) || [, ""])[1];
    const esperadas = (PALABRAS[slug] || PALABRAS.index)[idioma] || [];
    comprueba(`${p}: lleva sus palabras clave`,
      clave.split(",").filter(Boolean).length === esperadas.length,
      `${clave.split(",").filter(Boolean).length} de ${esperadas.length}`);

    /* La orden al buscador. */
    const orden = (h.match(/<meta name="robots" content="([^"]*)"/) || [, ""])[1];
    comprueba(`${p}: dice qué puede hacer el buscador con ella`,
      NO_INDEXAR.includes(slug)
        ? /noindex/.test(orden)
        : /index/.test(orden) && !/noindex/.test(orden) && /max-image-preview:large/.test(orden),
      orden);

    /* El idioma de la tarjeta. Estaba mal en las dieciséis: `es_ES` también en
       la inglesa. */
    comprueba(`${p}: el idioma de la tarjeta es el de la página`,
      h.includes(`<meta property="og:locale" content="${esIngles ? "en_US" : "es_ES"}">`)
      && h.includes(`<meta property="og:locale:alternate" content="${esIngles ? "es_ES" : "en_US"}">`));

    /* Y QUE EL TEXTO DE LA TARJETA ESTÉ DE VERDAD EN ESE IDIOMA.
     *
     * Lo de arriba comprueba lo que la página DECLARA. Esto mira lo que dice.
     * La diferencia se vio en el depurador de Meta: la portada inglesa salía
     * con `og:locale` en `en_US`, título en inglés y DESCRIPCIÓN EN CASTELLANO
     * —«Software GRC que unifica riesgos…»—. Se ve en cada enlace que se
     * comparte, que es donde una traducción a medias más se nota.
     *
     * POR QUÉ HACE FALTA AQUÍ SI YA HAY OTRA GUARDA. `idiomas/validar.cjs` lo
     * veía, y lo decía: contaba ese trozo entre los que quedan sin traducir.
     * Pero ahí van más de cien, así que el aviso no distinguía la descripción
     * de la tarjeta —que la ve cualquiera al compartir— de un rótulo escondido
     * en un pliegue de la página. Un número grande que nunca baja acaba siendo
     * un número que nadie mira. Esto le da línea propia: verde o roja por sí
     * sola, pase lo que pase con las demás.
     *
     * LAS EXCEPCIONES SON NOMBRES PROPIOS DE ORGANISMOS DOMINICANOS, y van en
     * la inglesa a propósito: no tienen traducción oficial, igual que
     * «Bundesbank» en una página inglesa. El validador bilingüe ya los tiene
     * declarados; aquí se repiten los que aparecen en las tarjetas. */
    const NO_CUENTAN = ["Clèrigo", "Superintendencia de Bancos", "Superintendencia de Pensiones",
      "Superintendencia del Mercado de Valores", "Banco Central de la República Dominicana",
      "República Dominicana", "SIMV", "BCRD", "NORTIC"];
    /* LAS PALABRAS DE ENLACE, Y «de» ENTRE ELLAS.
       La primera lista llevaba «del» y «de la» pero no «de» a secas, y por ahí
       se colaba un título entero: «Planes y Precios Transparentes de Clèrigo»
       no tiene ni una tilde —al quitar la marca— y pasaba de largo. Lo cazó su
       propia mutación.
       Ninguna de éstas es palabra inglesa suelta, así que no dan falsos
       positivos en una tarjeta en inglés; se comprobó contra las dieciocho. */
    const HUELE_A_CASTELLANO =
      /[áéíóúñ¿¡]|(^|\s)(de|del|la|el|los|las|un|una|y|o|con|para|por|sin|sobre|que|es|al|su|sus|lo|en)(\s|$)/i;
    const textoDeLaTarjeta = ["og:title", "og:description", "og:image:alt",
      "twitter:title", "twitter:description", "twitter:image:alt"]
      .map((et) => (h.match(new RegExp(`(?:name|property)="${et}" content="([^"]*)"`)) || [])[1])
      .filter(Boolean);
    const sospechosos = textoDeLaTarjeta.filter((t) => {
      let limpio = t;
      for (const n of NO_CUENTAN) limpio = limpio.split(n).join(" ");
      return HUELE_A_CASTELLANO.test(limpio);
    });
    /* Sólo se exige en la INGLESA: en la castellana el castellano es lo suyo. */
    comprueba(`${p}: y el texto de la tarjeta también está en ese idioma`,
      !esIngles || sospechosos.length === 0,
      sospechosos.length ? sospechosos.length + " en castellano, p.ej. «" + sospechosos[0].slice(0, 70) + "»" : "");

    /* La ficha. Que se pueda leer, para empezar: una ficha con la coma mal
       puesta no da error en ningún sitio, simplemente no la lee nadie. */
    const bruto = (h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [, ""])[1];
    let ficha = null;
    try { ficha = JSON.parse(bruto); } catch { /* se queda a null */ }
    comprueba(`${p}: la ficha de datos se puede leer`, ficha !== null,
      ficha ? "" : "no es JSON válido");
    if (!ficha) continue;

    const grafo = ficha["@graph"] || [];
    const dime = (t) => grafo.find((x) => x["@type"] === t);
    comprueba(`${p}: la ficha dice qué es la página, quién la publica y por dónde se navega`,
      !!dime("WebPage") && !!dime("Organization") && !!dime("WebSite")
      && grafo.some((x) => x["@type"] === "SiteNavigationElement"));

    comprueba(`${p}: la ficha está en el idioma de la página`,
      dime("WebPage").inLanguage === idioma, dime("WebPage").inLanguage);

    /* Y apunta a sí misma. Una ficha con la dirección de otra página es una
       ficha que atribuye este contenido a otro sitio. */
    const canonica = (h.match(/<link rel="canonical" href="([^"]*)"/) || [, ""])[1];
    comprueba(`${p}: la ficha apunta a esta página y no a otra`,
      dime("WebPage").url === canonica,
      `ficha «${dime("WebPage").url}» vs canónica «${canonica}»`);

    comprueba(`${p}: las migas empiezan en la portada`,
      (dime("BreadcrumbList").itemListElement || [])[0]?.position === 1);

    /* ── LO QUE NO PUEDE ESTAR ───────────────────────────────────────────
       Los testimonios de la portada son nombres de ejemplo. Marcarlos como
       reseñas pondría estrellas en el resultado de búsqueda a cambio de una
       mentira, y Google castiga eso con el sitio entero, no con la página. */
    comprueba(`${p}: no hay reseñas ni valoraciones inventadas`,
      !/aggregateRating|"@type"\s*:\s*"Review"|ratingValue/.test(bruto));
    /* Y la caja de búsqueda bajo el resultado exige que el sitio tenga
       buscador. No lo tiene. */
    comprueba(`${p}: no promete un buscador que no existe`,
      !/SearchAction/.test(bruto));
  }
}

/* ── 4. La comprobación que cruza la ficha con lo que se ve ─────────────── */
console.log("\n── La ficha dice lo mismo que la página ────────────────────────");

const precios = lee(path.join(CASTELLANO, "precios.html"));
const fichaPrecios = JSON.parse(
  (precios.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [, "{}"])[1]);
const producto = (fichaPrecios["@graph"] || []).find((x) => x["@type"] === "SoftwareApplication");
comprueba("la página de planes trae la ficha del producto", !!producto);
if (producto) {
  /* ── LA FICHA NO DECLARA PRECIO, Y ESO ES LO QUE SE VIGILA ─────────────
   *
   * Esta comprobación decía antes lo contrario: que el precio de la ficha
   * fuera el mismo que el de la página. Hoy el precio NO ESTÁ DECIDIDO, así
   * que la ficha no declara ninguno, y lo que hay que impedir es que alguien
   * vuelva a ponerlo sin pensarlo.
   *
   * Un precio en la ficha no es como un precio en una página: Google lo lee
   * como precio en firme y puede enseñarlo debajo del enlace, sin ninguno de
   * los matices. A partir de ahí, toda conversación de venta empieza anclada
   * en esa cifra.
   *
   * Cuando el precio esté decidido, esta comprobación se da la vuelta otra
   * vez: se exigirá que exista Y que case con el de la página de planes. */
  comprueba("la ficha del producto no declara precio mientras no esté decidido",
    producto.offers === undefined,
    producto.offers ? `declara «${JSON.stringify(producto.offers).slice(0, 60)}»` : "");
}

/* ── LAS REDIRECCIONES SE LEEN DE VERDAD ────────────────────────────────
 *
 * `_redirects` empezaba con un BOM —los tres bytes EF BB BF que algunos
 * editores meten al guardar en UTF-8—, y con eso la PRIMERA REGLA del fichero
 * deja de leerse: el servidor ve «﻿/marcos» y eso no es una ruta.
 *
 * El resultado se vio en vivo: `clerigo.io/marcos` no redirigía a `/frameworks`
 * como manda el fichero, sino que servía `marcos.html`, que estaba en
 * castellano y con el título en castellano dentro de la raíz inglesa. Un byte
 * invisible al principio de un fichero, y una página en el idioma equivocado
 * publicada.
 *
 * No hay forma de notarlo leyendo: el fichero se ve perfecto en cualquier
 * editor. Por eso se comprueba en bytes. */
if (fs.existsSync(path.join(RAIZ, "_redirects"))) {
  const crudo = fs.readFileSync(path.join(RAIZ, "_redirects"));
  comprueba("_redirects no empieza con BOM (mataría su primera regla)",
    !(crudo[0] === 0xEF && crudo[1] === 0xBB && crudo[2] === 0xBF),
    "empieza con EF BB BF: la primera regla no se lee");

  /* Y que cada regla tenga la forma que espera el servidor: origen, destino y
     código. Una línea mal escrita tampoco da error: simplemente no redirige. */
  const malas = crudo.toString("utf8").split(/\r?\n/)
    .map((l, i) => [i + 1, l.trim()])
    .filter(([, l]) => l && !l.startsWith("#"))
    .filter(([, l]) => !/^\S+\s+\S+(\s+\d{3})?$/.test(l));
  comprueba("todas las reglas de _redirects tienen forma de regla",
    malas.length === 0, malas.map(([n, l]) => "línea " + n + ": «" + l + "»").join(" · "));
}

console.log("\n────────────────────────────────────────────────────────────────");
console.log(fallos.length === 0 ? `TODO PASA  ·  ${cuantas} comprobaciones` : `FALLAN ${fallos.length} de ${cuantas}:`);
fallos.forEach((f) => console.log("  · " + f));
process.exitCode = fallos.length ? 1 : 0;
