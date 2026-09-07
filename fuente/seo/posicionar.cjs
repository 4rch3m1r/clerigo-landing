/**
 * EL PASO DE POSICIONAMIENTO. Va el ÚLTIMO, sobre las dieciséis páginas ya
 * hechas —las ocho en castellano y las ocho en inglés—.
 *
 *   node fuente/seo/posicionar.cjs
 *
 * ── QUÉ HACE Y QUÉ NO ─────────────────────────────────────────────────────
 *
 * Lo que se pidió fue «que salga de primera opción». Eso no lo pone nadie en
 * una etiqueta: el orden lo decide el buscador con cosas que no están en el
 * HTML —cuánta gente enlaza el sitio, cuánto tarda en cargar, si quien entra
 * se queda—. Y los enlaces que salen debajo del resultado (los de Microsoft:
 * «Trust Center», «Products and services») tampoco se declaran: Google los
 * elige mirando la navegación del sitio.
 *
 * Lo que SÍ se puede hacer, y es lo que hay aquí, es quitar de en medio todo
 * lo que hoy impide que nos entiendan:
 *
 *   1. UN SITIO QUE NADIE HA INVITADO A ENTRAR. No había robots.txt ni
 *      sitemap.xml. Sin sitemap, el buscador tiene que adivinar qué páginas
 *      existen siguiendo enlaces; con él, se le entrega la lista.
 *   2. LA FICHA DE DATOS, EN EL IDIOMA EQUIVOCADO. La página inglesa llevaba
 *      su ficha escrita en castellano —«Cómo protege Clèrigo los datos de tu
 *      organización»— y `og:locale` decía `es_ES` en las dieciséis. O sea: a
 *      Google se le estaba diciendo que la versión inglesa es española.
 *   3. UNA FICHA QUE NO DICE QUÉ ES ESTO. Decía «WebPage» y poco más. Ahora
 *      dice que hay una organización, un sitio, una aplicación de negocio con
 *      sus módulos y su precio, y por dónde se navega.
 *   4. LAS MIGAS. Son las que hacen que en el resultado salga
 *      «clerigo.io › Trust Center» en vez de la dirección pelada.
 *
 * ── LO QUE NO SE PONE, Y POR QUÉ ──────────────────────────────────────────
 *
 *   · `aggregateRating` y `review`. Marcar como reseñas los testimonios de la
 *     portada sería inventarlas: son nombres de ejemplo. Google lo persigue y
 *     penaliza el sitio entero, y además sería mentir.
 *   · `SearchAction` (la caja de búsqueda bajo el resultado). Exige que el
 *     sitio TENGA un buscador propio, y no lo tiene.
 *   · `sameAs` con perfiles de redes. En el pie hay rótulos de LinkedIn, X e
 *     Instagram, pero no llevan dirección: no hay perfiles que declarar.
 *   · Teléfono y dirección postal. No están en ninguna página.
 */
const fs = require("node:fs");
const path = require("node:path");
const { PALABRAS, MODULOS_ES, MODULOS_EN, NORMAS,
  CATEGORIA_ES, CATEGORIA_EN, REGION_ES, REGION_EN } = require("./vocabulario.cjs");
const { CASTELLANO, INGLES } = require("../donde.cjs");

const AQUI = __dirname;
const SITIO = JSON.parse(fs.readFileSync(path.join(AQUI, "..", "sitio.json"), "utf8"));
const BASE = SITIO.base.replace(/\/$/, "");

/* Las páginas, con su fichero y el nombre que se les da en cada idioma. Ese
   nombre es el de la miga y el del elemento de navegación: tiene que ser el
   MISMO que se ve en la barra, o Google lo trata como dato que no cuadra. */
/* ── LA INGLESA Y LA CASTELLANA NO SE LLAMAN IGUAL ────────────────────────
 *
 * Y durante un tiempo aquí se dio por hecho que sí. Tres páginas cambiaron de
 * nombre al pasar a inglés —marcos→frameworks, confianza→trustcenter,
 * contacto→contact— y esta lista seguía usando el nombre castellano para las
 * dos. Consecuencia medida sobre el sitio publicado: el mapa del sitio listaba
 * `/marcos` —que es una puerta de redirección— y NO listaba `/frameworks`, que
 * es la página que hay que indexar.
 *
 * Por eso cada entrada lleva ahora los dos nombres. `ruta` es la dirección
 * pública, sin extensión; `disco` es el fichero que hay que abrir.
 */
const PAGINAS = [
  { slug: "index", ruta: { en: "", es: "" }, disco: { en: "index.html", es: "index.html" },
    es: "Inicio", en: "Home", prioridad: "1.0", nav: false },
  { slug: "marcos", ruta: { en: "frameworks", es: "marcos" }, disco: { en: "frameworks.html", es: "marcos.html" },
    es: "Marcos", en: "Frameworks", prioridad: "0.9", nav: true },
  { slug: "confianza", ruta: { en: "trustcenter", es: "confianza" }, disco: { en: "trustcenter.html", es: "confianza.html" },
    es: "Centro de Confianza", en: "Trust Center", prioridad: "0.9", nav: true },
  { slug: "precios", ruta: { en: "precios", es: "precios" }, disco: { en: "precios.html", es: "precios.html" },
    es: "Planes", en: "Plans", prioridad: "0.9", nav: true },
  { slug: "contacto", ruta: { en: "contact", es: "contacto" }, disco: { en: "contact.html", es: "contacto.html" },
    es: "Contacto", en: "Contact", prioridad: "0.8", nav: true },
  { slug: "partners", ruta: { en: "partners", es: "partners" }, disco: { en: "partners.html", es: "partners.html" },
    es: "Partner Portal", en: "Partner Portal", prioridad: "0.5", nav: false },
  { slug: "legal", ruta: { en: "legal", es: "legal" }, disco: { en: "legal.html", es: "legal.html" },
    es: "Legal", en: "Legal", prioridad: "0.3", nav: false },
];
/* `oscuro.html` no entra: es la MISMA portada con otra piel. Meterla en el
   sitemap sería pedirle al buscador que indexe dos veces el mismo texto, que
   es contenido duplicado y se paga. Lleva `noindex` por eso mismo. */
const NO_INDEXAR = ["oscuro"];

const lee = (f) => fs.readFileSync(f, "utf8");

/* ── La ficha de la organización ────────────────────────────────────────── */
function organizacion(idioma) {
  return {
    "@type": "Organization",
    "@id": BASE + "/#organizacion",
    name: "Clèrigo",
    alternateName: "Clèrigo XGRC",
    url: BASE + "/",
    logo: { "@type": "ImageObject", url: BASE + "/favicon.png", width: 160, height: 160 },
    /* La tarjeta buena, la misma que declara la portada. Apuntaba a `/og.png`,
       que es una copia suelta en la raíz del repositorio que nadie mantiene:
       la ficha de la organización enseñaba la tarjeta vieja mientras la
       portada enseñaba la nueva. */
    image: BASE + "/public/og/clerigo-og.png",
    email: "hello@clerigo.io",
    description: idioma === "es"
      ? "Plataforma de Gobernanza, Riesgo y Cumplimiento que unifica riesgos, cumplimiento normativo, auditoría interna, control interno, ciberseguridad y privacidad."
      : "Governance, Risk and Compliance platform that unifies risk, regulatory compliance, internal audit, internal control, cybersecurity and privacy.",
    /* De qué sabe esta casa. Es el sitio donde las palabras clave cuentan de
       verdad: aquí las lee una máquina que las usa para clasificar, no una
       etiqueta que Google ignora desde 2009. */
    knowsAbout: idioma === "es"
      ? [...CATEGORIA_ES, ...MODULOS_ES, ...NORMAS]
      : [...CATEGORIA_EN, ...MODULOS_EN, ...NORMAS],
    areaServed: idioma === "es" ? REGION_ES.slice(0, 2) : REGION_EN.slice(0, 2),
  };
}

/* ── La ficha del producto ──────────────────────────────────────────────── */
function aplicacion(idioma) {
  return {
    "@type": "SoftwareApplication",
    "@id": BASE + "/#producto",
    name: "Clèrigo XGRC",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: idioma === "es" ? "Software GRC" : "GRC Software",
    operatingSystem: idioma === "es" ? "Navegador web" : "Web browser",
    url: BASE + "/",
    publisher: { "@id": BASE + "/#organizacion" },
    inLanguage: ["es", "en", "fr", "pt"],
    description: idioma === "es"
      ? "Software GRC que unifica riesgos, cumplimiento normativo, auditoría interna, control interno, ciberseguridad y privacidad en una sola plataforma."
      : "GRC software that unifies risk, regulatory compliance, internal audit, internal control, cybersecurity and privacy in a single platform.",
    featureList: idioma === "es" ? MODULOS_ES : MODULOS_EN,
    /* El precio que la propia página de planes publica. Si algún día cambia
       ahí, cambia aquí: un precio en la ficha que no case con el de la página
       es motivo de aviso en Search Console. */
    offers: {
      "@type": "Offer",
      price: "20",
      priceCurrency: "USD",
      url: BASE + "/precios",
      availability: "https://schema.org/InStock",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "20", priceCurrency: "USD",
        unitText: idioma === "es" ? "usuario / mes" : "user / month",
      },
    },
  };
}

/* ── Los sitios a los que se puede ir desde la barra ────────────────────── */
function navegacion(idioma, esIngles) {
  return PAGINAS.filter((p) => p.nav).map((p) => ({
    "@type": "SiteNavigationElement",
    name: idioma === "es" ? p.es : p.en,
    url: (esIngles ? BASE + "/" : BASE + "/es/") + p.ruta[idioma],
  }));
}

/* ── La ficha entera de una página ──────────────────────────────────────── */
function ficha(pagina, idioma, esIngles, titulo, descripcion, imagen, canonica) {
  const raiz = esIngles ? BASE + "/" : BASE + "/es/";
  /* La dirección que la ficha declara es LA CANÓNICA de la página, no la suya.
     No es lo mismo en un caso: la portada oscura vive en `oscuro.html` y su
     canónica es la portada, porque es la misma página con otra piel. Con su
     propia dirección dentro, la ficha estaba diciendo «este contenido es de
     oscuro.html» justo mientras la canónica decía lo contrario. Dos señales
     que se contradicen valen menos que ninguna: el buscador elige él. */
  const url = canonica || raiz + (pagina.ruta ? pagina.ruta[idioma] : "");
  const grafo = [
    organizacion(idioma),
    {
      "@type": "WebSite",
      "@id": BASE + "/#sitio",
      name: "Clèrigo",
      url: BASE + "/",
      inLanguage: idioma,
      publisher: { "@id": BASE + "/#organizacion" },
    },
    {
      "@type": "WebPage",
      "@id": url + "#pagina",
      name: titulo,
      description: descripcion,
      url,
      inLanguage: idioma,
      isPartOf: { "@id": BASE + "/#sitio" },
      about: { "@id": BASE + "/#producto" },
      primaryImageOfPage: { "@type": "ImageObject", url: imagen },
      breadcrumb: { "@id": url + "#migas" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": url + "#migas",
      itemListElement: pagina.slug === "index"
        ? [{ "@type": "ListItem", position: 1, name: idioma === "es" ? "Inicio" : "Home", item: raiz }]
        : [
          { "@type": "ListItem", position: 1, name: idioma === "es" ? "Inicio" : "Home", item: raiz },
          { "@type": "ListItem", position: 2, name: idioma === "es" ? pagina.es : pagina.en, item: url },
        ],
    },
    ...navegacion(idioma, esIngles),
  ];
  /* La ficha del producto sólo en las dos páginas que hablan de él. Repetirla
     en las siete no añade nada y multiplica los sitios donde el precio puede
     quedarse viejo. */
  if (pagina.slug === "index" || pagina.slug === "precios") grafo.splice(2, 0, aplicacion(idioma));
  return { "@context": "https://schema.org", "@graph": grafo };
}

/* ── Las etiquetas de la cabecera ───────────────────────────────────────── */

/** Pone o reemplaza una etiqueta `<meta>`. Reemplaza, NO añade: llamarlo dos
 *  veces tiene que dejar el fichero igual que llamarlo una.
 *
 *  VA AL FINAL DE LA CABECERA, JUSTO ANTES DE `</head>`, Y NO ARRIBA.
 *
 *  La primera versión las metía delante del `<title>`, que parece el sitio
 *  natural. Lo que pasó: la lista de palabras clave ocupa cerca de un kilobyte
 *  y empujó `og:image` hasta el byte 2.223. WhatsApp sólo lee el principio del
 *  documento para pintar la tarjeta del enlace; pasado ese punto, deja de
 *  verla. O sea, por poner unas palabras que no posicionan se habría roto la
 *  tarjeta que sí funciona. Hay una comprobación que lo vigila y saltó. */
function meta(html, clave, atributo, valor) {
  const re = new RegExp(`<meta ${atributo}="${clave.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}" content="[^"]*">\n?`);
  const nueva = `<meta ${atributo}="${clave}" content="${valor.replace(/"/g, "&quot;")}">`;
  if (re.test(html)) return html.replace(re, nueva + "\n");
  return html.replace("</head>", nueva + "\n</head>");
}

/* ── Y esto SÓLO cuando se ejecuta a mano ────────────────────────────────
 *
 * Sin esta guarda, `require("./posicionar.cjs")` —que lo hacen el validador y
 * el generador del mapa, para leer la lista de páginas— reescribía las
 * dieciséis páginas de camino. Se vio en las mutaciones: diez de dieciséis
 * salían «SE LE ESCAPA», y no era que el validador no viera el destrozo, es
 * que al arrancar lo deshacía él mismo y luego miraba una página intacta.
 *
 * Es el peor tipo de fallo que puede tener una prueba: en vez de dar rojo, da
 * verde. */
function aplicar() {
let hechas = 0;
const filas = [];

for (const carpeta of [CASTELLANO, INGLES]) {
  const esIngles = carpeta === INGLES;
  const idioma = esIngles ? "en" : "es";

  for (const p of [...PAGINAS, { slug: "oscuro", ruta: { en: "oscuro", es: "oscuro" }, disco: { en: "oscuro.html", es: "oscuro.html" }, es: "", en: "", nav: false }]) {
    const nombre = p.disco[idioma];
    const f = path.join(carpeta, nombre);
    if (!fs.existsSync(f)) { console.log(`  ·  ${idioma}/${nombre} no existe`); continue; }
    const antes = lee(f);
    let h = antes;

    const titulo = (h.match(/<title>([^<]*)<\/title>/) || [, ""])[1];
    const descripcion = (h.match(/<meta name="description" content="([^"]*)"/) || [, ""])[1];
    const imagen = (h.match(/<meta property="og:image" content="([^"]*)"/) || [, BASE + "/og.png"])[1];

    /* 1. Las palabras clave. No posicionan —está dicho arriba— pero es donde
          queda por escrito de qué va cada página, y algún buscador menor las
          lee. */
    const clave = (PALABRAS[p.slug] || PALABRAS.index)[idioma] || [];
    if (clave.length) h = meta(h, "keywords", "name", clave.join(", "));

    /* 2. Qué puede hacer el buscador con la página.
          `max-image-preview:large` es el que hace que salga la foto grande en
          el resultado en vez de una miniatura; sin él, Google se queda con la
          pequeña. La portada oscura va con `noindex`: es la misma página con
          otra piel y sale duplicada. */
    h = meta(h, "robots", "name",
      NO_INDEXAR.includes(p.slug)
        ? "noindex, follow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

    /* 3. El idioma de la tarjeta, que estaba mal en las dieciséis. */
    h = h.replace(/<meta property="og:locale" content="[^"]*">/,
      `<meta property="og:locale" content="${esIngles ? "en_US" : "es_ES"}">`);
    h = h.replace(/<meta property="og:locale:alternate" content="[^"]*">\n?/g, "");
    h = h.replace(/(<meta property="og:locale" content="[^"]*">)/,
      `$1\n<meta property="og:locale:alternate" content="${esIngles ? "es_ES" : "en_US"}">`);

    /* 4. La ficha de datos, entera y en el idioma de la página. */
    const canonica = (h.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
    const json = JSON.stringify(ficha(p, idioma, esIngles, titulo, descripcion, imagen, canonica));
    const reFicha = /<script type="application\/ld\+json">[\s\S]*?<\/script>/;
    h = reFicha.test(h)
      ? h.replace(reFicha, `<script type="application/ld+json">${json}</script>`)
      : h.replace("</head>", `<script type="application/ld+json">${json}</script>\n</head>`);

    if (h !== antes) { fs.writeFileSync(f, h); hechas++; }
    filas.push(`  ${(idioma + "/" + nombre).padEnd(24)} ${String(clave.length).padStart(3)} palabras · ${(json.length / 1024).toFixed(1)} KB de ficha`);
  }
}

filas.forEach((l) => console.log(l));
console.log(`\n  ${hechas} de ${filas.length} páginas tocadas.`);
console.log(`  base: ${BASE}\n`);
}

if (require.main === module) aplicar();

module.exports = { PAGINAS, NO_INDEXAR, BASE, aplicar };
