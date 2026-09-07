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
  const enLaFicha = producto.offers?.price;
  /* Lo que la página publica, en letra que se ve. */
  const enLaPagina = (precios.match(/\$(\d+)\s*USD\s*\/\s*usuario/) || [])[1];
  comprueba("el precio de la ficha es el que la página publica",
    enLaFicha === enLaPagina,
    `ficha «${enLaFicha}» vs página «${enLaPagina}»`);
}

console.log("\n────────────────────────────────────────────────────────────────");
console.log(fallos.length === 0 ? `TODO PASA  ·  ${cuantas} comprobaciones` : `FALLAN ${fallos.length} de ${cuantas}:`);
fallos.forEach((f) => console.log("  · " + f));
process.exitCode = fallos.length ? 1 : 0;
