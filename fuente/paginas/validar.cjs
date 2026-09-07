/**
 * Las cinco páginas interiores, comprobadas contra su original.
 *
 * El encargo tenía una frase corta y dos permisos: «no cambies las palabras,
 * pero puedes tocar el tipo de letra y el estilo visual». Esto es esa frase
 * convertida en guarda:
 *
 *   · las PALABRAS de cada página tienen que ser las mismas del original,
 *     en el mismo orden, salvo la tabla de marca de `marca.json`;
 *   · lo que la página HACE —controles, manejadores, funciones— tiene que
 *     seguir estando;
 *   · y la barra, el pie, los tokens y la hoja compartida tienen que salir
 *     de `plantilla.html` sin una coma de diferencia, que de eso va lo de
 *     «la misma línea gráfica».
 *
 *   node fuente/paginas/validar.cjs           las cinco
 *   node fuente/paginas/validar.cjs precios   una sola
 */
const path = require("node:path");
const fs = require("node:fs");
const RAIZ = path.join(__dirname, "..", "..");
/* El castellano es la FUENTE y vive en su carpeta; el ingles ocupa la raiz.
   Ver `fuente/donde.cjs`, que es donde esta escrito el porque. */
const { CASTELLANO } = require("../donde.cjs");
const { sinPosicionamiento } = require("../seo/marcas.cjs");
const AQUI = __dirname;

const { palabras, aplicaMarca, comportamiento, PICTOGRAMAS } = require("./palabras.cjs");
const { restosDeTemaOscuro } = require("../tema.cjs");

const MARCA = JSON.parse(fs.readFileSync(path.join(AQUI, "marca.json"), "utf8"));
const SITIO = JSON.parse(fs.readFileSync(path.join(AQUI, "..", "sitio.json"), "utf8"));
/* Lo que una página escrita de cero TIENE y NO PUEDE decir. */
const AFIRMACIONES = JSON.parse(fs.readFileSync(path.join(AQUI, "afirmaciones.json"), "utf8"));
const PLANTILLA = lee(path.join(AQUI, "plantilla.html"));

const PAGINAS = require("./paginas.cjs");

function lee(p) {
  return fs.readFileSync(p, "utf8").split("\r\n").join("\n");
}

const fallos = [];
let total = 0;
function comprueba(punto, condicion, detalle) {
  total++;
  const ok = !!condicion;
  if (!ok) fallos.push(punto + (detalle ? " — " + detalle : ""));
  console.log((ok ? "  OK  " : "  MAL ") + punto + (detalle && !ok ? "  ·  " + detalle : ""));
}

/* ── Los trozos fijos de la plantilla ──────────────────────────────────── */
const iEstilo = PLANTILLA.indexOf("{{ESTILO}}");
const iCuerpo = PLANTILLA.indexOf("{{CUERPO}}");
const iGuion = PLANTILLA.indexOf("{{GUION}}");
const CABECERA = PLANTILLA.slice(0, iEstilo);
const CIERRE = PLANTILLA.slice(iEstilo + "{{ESTILO}}".length, iCuerpo);
const PIE = PLANTILLA.slice(iCuerpo + "{{CUERPO}}".length, iGuion);
/* Sin la barra ni el pie: lo que le toca a la página de acceso. */
/* El selector de idioma se recorta antes de comparar el trozo compartido:
   son dos enlaces y una hoja de estilo que la plantilla no trae, y sus dos
   enlaces cambian de una pagina a otra a proposito —desde legal.html se salta
   a legal.html del otro idioma—. Exigir que fueran iguales seria exigir que
   el selector no funcionara. */
const sinSelector = (h) => h.replace(/\n?<script>\n\/\* El idioma del navegador decide[\s\S]*?<\/script>\n/, "")
  .replace(/<div class="idiomas">[\s\S]*?<\/div>\n?[ \t]*/, "").replace(/\/\* ── EL SELECTOR DE IDIOMA ──[\s\S]*?── FIN DEL SELECTOR DE IDIOMA ── \*\/\n/, "");

const CIERRE_SIN_BARRA = CIERRE.replace(/<!-- ══════════ BARRA ══════════ -->[\s\S]*?<\/nav>\n/, "");
const PIE_SIN_PIE = PIE.replace(/<!-- ══════════ PIE ══════════ -->[\s\S]*?<\/footer>\n/, "");

/**
 * Del original, lo que de verdad se compara: su cuerpo sin la barra ni el pie.
 *
 * La cabecera se va porque el título y la descripción los pone la plantilla y
 * se comprueban aparte; si se quedara, «Términos, Privacidad y Cookies» del
 * `<title>` saldría como palabra que falta en la página.
 * La barra y el pie se van porque también los pone la plantilla.
 */
function soloElCuerpo(html) {
  const i = html.indexOf("<body");
  return (i < 0 ? html : html.slice(i))
    .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, " ");
}

/** Las letras que hacían de logotipo no cuentan como palabras. */
const sinLetrasDeLogotipo = (lista) =>
  lista.filter((p) => !MARCA.letras_de_logotipo.includes(p));

const soloUna = process.argv[2];
const aRevisar = soloUna ? PAGINAS.filter((p) => p.slug === soloUna) : PAGINAS;
if (soloUna && aRevisar.length === 0) {
  console.error(`No hay ninguna página que se llame «${soloUna}».`);
  process.exit(1);
}

for (const { slug, chrome, sinOriginal } of aRevisar) {
  const fOrigen = path.join(AQUI, "..", "paginas-originales", slug + ".html");
  const fSalida = path.join(CASTELLANO, slug + ".html");

  console.log(`\n── ${slug}.html ${"─".repeat(Math.max(0, 56 - slug.length))}`);

  if (!sinOriginal && !fs.existsSync(fOrigen)) {
    comprueba(`el original de ${slug} está en fuente/paginas-originales/`, false);
    continue;
  }
  /* Y si dice que no tiene original, que de verdad no lo tenga: una página con
     original marcada como «sin original» se saltaría la comprobación de las
     palabras sin que se notara. */
  if (sinOriginal) {
    comprueba(`${slug}: escrita de cero, no hay original contra el que comparar`,
      !fs.existsSync(fOrigen), "hay un original y entonces SÍ habría que compararla");
  }
  if (!fs.existsSync(fSalida)) {
    comprueba(`existe ${slug}.html`, false, "todavía no se ha escrito");
    continue;
  }

  const org = sinOriginal ? "" : lee(fOrigen);
  const sal = lee(fSalida);

  /* ── 1. LAS PALABRAS ──────────────────────────────────────────────── */
  /* Sin el selector de idioma: sus dos rótulos son «EN» y «ES», y en las
     páginas que lo llevan DENTRO del cuerpo —partners, que tiene cabecera
     propia— se colaban en la lista de palabras. El original no los tiene, así
     que la comparación cantaba una diferencia en la palabra 4 de 366. No es
     texto de la página: es un mando. */
  const dePagina = sinLetrasDeLogotipo(palabras(sinSelector(sal), { abre: `<main class="pagina">`, cierra: "</main>" }) || []);
  const deOrigen = sinOriginal ? null : sinLetrasDeLogotipo(palabras(aplicaMarca(soloElCuerpo(org), MARCA)));

  if (sinOriginal) {
    /* Sin original no hay palabras que comparar, pero sí hay algo que exigir:
       que el cuerpo esté donde toca y que tenga contenido de verdad. */
    comprueba(`${slug}: el cuerpo va dentro de <main class="pagina">`,
      sal.includes(`<main class="pagina">`));
    comprueba(`${slug}: tiene texto, no es una plantilla vacía`,
      dePagina.length > 150, dePagina.length + " palabras");

    /* Y sus AFIRMACIONES, que es lo que de verdad hay que vigilar aquí: una
       página de confianza sin original es una página donde nadie se entera si
       «en proceso» pasa a «certificado». */
    const af = AFIRMACIONES[slug];
    if (af) {
      const faltan = (af.deben_estar || []).filter((x) => !sal.includes(x));
      comprueba(`${slug}: dice todo lo que prometió decir`, faltan.length === 0,
        "falta: " + faltan.join(" · "));

      const iso = (af.iso_en_proceso || []).filter((x) => !sal.includes(x));
      comprueba(`${slug}: la ISO 27001 sigue dicha como EN CURSO, no como obtenida`,
        iso.length === 0, "falta: " + iso.join(" · "));

      const coladas = [];
      for (const [patron, motivo] of af.no_pueden_estar || []) {
        const m = sal.match(new RegExp(patron, "i"));
        if (m) coladas.push(`«${m[0]}» — ${motivo}`);
      }
      comprueba(`${slug}: no promete nada que el código no sostenga`,
        coladas.length === 0, coladas.slice(0, 3).join(" | "));
    }
  } else if (!sal.includes(`<main class="pagina">`)) {
    comprueba(`${slug}: el cuerpo va dentro de <main class="pagina">`, false);
  } else {
    let corte = -1;
    const hasta = Math.max(dePagina.length, deOrigen.length);
    for (let i = 0; i < hasta; i++) {
      if (dePagina[i] !== deOrigen[i]) { corte = i; break; }
    }
    comprueba(
      `${slug}: las mismas palabras que el original, en el mismo orden`,
      corte === -1,
      corte === -1 ? "" :
        `en la palabra ${corte + 1} de ${deOrigen.length}: el original dice «` +
        (deOrigen.slice(Math.max(0, corte - 4), corte + 4).join(" ") || "(se acabó)") +
        `» y la página dice «` +
        (dePagina.slice(Math.max(0, corte - 4), corte + 4).join(" ") || "(se acabó)") + "»",
    );
  }

  /* ── 2. LO QUE LA PÁGINA HACE ─────────────────────────────────────── */
  const hOrg = comportamiento(soloElCuerpo(org));
  const hSal = comportamiento(
    sal.slice(sal.indexOf('<main class="pagina">'), sal.lastIndexOf("</main>")) +
    /* El guion de la página va después de `</main>`; sin él no se ven ni las
       funciones ni los manejadores que se escriben desde el código. */
    sal.slice(sal.lastIndexOf("</main>")),
  );
  for (const clave of ["identificadores", "manejadores", "funciones"]) {
    const faltan = hOrg[clave].filter((x) => !hSal[clave].includes(x));
    comprueba(`${slug}: no se ha perdido ningún ${clave.slice(0, -2)}or`.replace("ionor", "ion"),
      faltan.length === 0, "faltan: " + faltan.join(", "));
  }
  for (const clave of ["entradas", "listas", "opciones", "areas", "botones"]) {
    comprueba(`${slug}: los mismos controles (${clave})`, hSal[clave] >= hOrg[clave],
      `el original tiene ${hOrg[clave]} y la página ${hSal[clave]}`);
  }

  /* ── 3. LA LÍNEA GRÁFICA, LETRA A LETRA ───────────────────────────── */
  const titulo = (sal.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  const desc = (sal.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
  /* La canónica y la tarjeta NO se leen de la página: se calculan de
     fuente/sitio.json igual que las calcula el sincronizador, y se exige que la
     página diga exactamente eso. Leerlas de la página sería preguntarle al
     examinado por la respuesta. */
  const donde = SITIO.paginas[slug] || {};
  /* La canónica de la CASTELLANA lleva /es/: es la dirección donde vive de
     verdad. La imagen de la tarjeta NO, porque es la misma en los dos idiomas
     y está en la raíz. */
  const canonica = SITIO.base + "/es/" + donde.fichero;
  const imagen = SITIO.base + "/" + donde.imagen;
  const cabeceraEsperada = CABECERA
    .split("{{TITULO}}").join(titulo)
    .split("{{DESCRIPCION}}").join(desc)
    .split("{{CANONICA}}").join(canonica)
    .split("{{IMAGEN}}").join(imagen)
    .split("{{BASE}}").join(SITIO.base);
  /* De la página se quitan las tres etiquetas de idioma alternativo antes de
     comparar: las pone el paso bilingüe, no la plantilla, y son idénticas en
     las siete páginas salvo por su propia dirección. */
  /* Y el `../` del icono: la castellana está un nivel más adentro que la raíz,
     donde vive el fichero, y la plantilla lo cita sin prefijo porque no sabe en
     qué idioma se va a usar. */
  /* Y lo que pone el paso de posicionamiento, que corre DESPUÉS de que la
     plantilla se estampe: palabras clave, orden al buscador, idioma de la
     tarjeta y la ficha de datos entera. La plantilla no las trae, así que
     compararlas contra ella sería comparar contra algo que no existe. */
  const salSinAlternativas = sinPosicionamiento(sal)
    .replace(/[ \t]*<link rel="alternate" hreflang="[a-z-]+" href="[^"]*">\n/g, "")
    .replace(/(\s(?:src|href)=")\.\.\/((?:sistema\/[a-z0-9-]+|favicon)\.png)"/g, '$1$2"');
  /* La plantilla se normaliza IGUAL que la página. `sinPosicionamiento` no
     borra el `og:locale`, lo pone a un valor fijo —cambia entre idiomas y
     tiene que dejar de contar, pero la etiqueta debe seguir estando—, así que
     aplicarlo sólo a un lado dejaba «·» contra «es_ES» y ninguna página
     empezaba por su plantilla. */
  comprueba(`${slug}: la cabecera, los tokens y la hoja compartida salen de la plantilla`,
    salSinAlternativas.startsWith(sinPosicionamiento(cabeceraEsperada)));
  comprueba(`${slug}: la canónica y la tarjeta son las que dice sitio.json`,
    sal.includes(`<link rel="canonical" href="${canonica}">`)
    && sal.includes(`<meta property="og:image" content="${imagen}">`),
    canonica);
  /* Y que las tres alternativas estén: sin ellas, el buscador trata las dos
     versiones como páginas distintas que dicen casi lo mismo y elige una por
     su cuenta. */
  comprueba(`${slug}: declara sus dos idiomas y cuál se sirve por omisión`,
    sal.includes(`hreflang="en" href="${SITIO.base}/${donde.fichero}"`)
    && sal.includes(`hreflang="es" href="${SITIO.base}/es/${donde.fichero}"`)
    && sal.includes(`hreflang="x-default" href="${SITIO.base}/${donde.fichero}"`));
  comprueba(`${slug}: tiene título y descripción propios`,
    titulo.includes("Clèrigo") && desc.length > 40,
    `título «${titulo}», descripción de ${desc.length} letras`);

  /* ── La tarjeta que sale al pegar el enlace ───────────────────────────
     Esto no se puede dar por bueno mirando la etiqueta: la etiqueta llevaba
     meses apuntando a og.png y el fichero NO existía. Se comprueba que el
     fichero está, que pesa lo que puede tragar WhatsApp y que mide lo que
     piden las tarjetas grandes. */
  /* De la dirección al fichero de al lado: la tarjeta tiene que estar aquí. */
  const fImagen = path.join(RAIZ, imagen.slice(SITIO.base.length + 1));
  const hayImagen = imagen !== "" && fs.existsSync(fImagen);
  comprueba(`${slug}: la imagen de la vista previa existe de verdad`, hayImagen, imagen || "no declara ninguna");
  if (hayImagen) {
    const kb = Math.round(fs.statSync(fImagen).size / 1024);
    /* Las medidas van en la cabecera del PNG: bytes 16-23 tras la firma. */
    const cab = Buffer.alloc(24);
    const fd = fs.openSync(fImagen, "r");
    fs.readSync(fd, cab, 0, 24, 0);
    fs.closeSync(fd);
    const ancho = cab.readUInt32BE(16);
    const alto = cab.readUInt32BE(20);
    comprueba(`${slug}: la imagen mide 1200 × 630 y pesa menos de 300 KB`,
      ancho === 1200 && alto === 630 && kb < 300, `${ancho} × ${alto}, ${kb} KB`);
  }
  comprueba(`${slug}: las etiquetas que piden WhatsApp, LinkedIn y X están completas`,
    /og:image:width" content="1200"/.test(sal)
    && /og:image:height" content="630"/.test(sal)
    && /og:image:type" content="image\/png"/.test(sal)
    && /og:image:alt"/.test(sal)
    && /twitter:card" content="summary_large_image"/.test(sal)
    && /twitter:image:alt"/.test(sal)
    && /application\/ld\+json/.test(sal));
  /* Y que estén ARRIBA: el rastreador de WhatsApp se lleva los primeros
     kilobytes de la página y si las etiquetas caen más abajo no las ve. */
  comprueba(`${slug}: y están en el primer kilobyte y medio de la página`,
    sal.indexOf('property="og:image"') > 0 && sal.indexOf('property="og:image"') < 1536,
    "og:image aparece en el byte " + sal.indexOf('property="og:image"'));
  /* El trozo compartido se compara SIN el selector de idioma: sus dos enlaces
     llevan a la MISMA pagina en el otro idioma, asi que cambian de una a otra.
     Eso es lo correcto —desde legal.html se salta a legal.html— y por eso se
     recorta antes de comparar, en vez de exigir que sean iguales. */
  /* También sin lo del posicionamiento: `keywords` y `robots` se ponen justo
     antes de `</head>`, y ese cierre cae DENTRO del tramo compartido que se
     compara aquí. */
  const salSinSelector = sinPosicionamiento(sinSelector(sal));
  comprueba(`${slug}: ${chrome ? "la barra y el pie son" : "el cierre de la hoja es"} el de la plantilla`,
    salSinSelector.includes(chrome ? CIERRE : CIERRE_SIN_BARRA)
    && salSinSelector.includes(chrome ? PIE : PIE_SIN_PIE));

  /* ── 4. NADA DE LA MARCA VIEJA ────────────────────────────────────── */
  let sinLosIntactos = sal;
  for (const v of MARCA.intactos) sinLosIntactos = sinLosIntactos.split(v).join(" ");
  /* También «arquemir» y «axioma»: el original traía las dos mal escritas —una
     con q y otra como app.axioma.com— y una comprobación que sólo buscara la
     grafía correcta las habría dado por buenas. Lo dieron por bueno, de hecho,
     hasta que alguien las leyó. */
  const VIEJO = /archemir|arquemir|axioma/i;
  comprueba(`${slug}: sin rastro de la marca vieja, ni mal escrita`,
    !VIEJO.test(sinLosIntactos),
    (sinLosIntactos.match(new RegExp(VIEJO, "gi")) || []).join(", "));
  comprueba(`${slug}: la marca es «Clèrigo»`, /Clèrigo/.test(sal));

  /* ── 5. NI UN PICTOGRAMA ──────────────────────────────────────────── */
  const sinDatos = sal
    .replace(/data:image\/svg\+xml,[^"')]+/g, "")
    .replace(/data:image\/png;base64,[A-Za-z0-9+/=]+/g, "");
  const pict = [...new Set(sinDatos.match(PICTOGRAMAS) || [])];
  comprueba(`${slug}: sin emojis ni estrellas ni flechas de texto`, pict.length === 0, pict.join(" "));

  /* ── 6. NI UN RESTO DEL TEMA OSCURO ───────────────────────────────── */
  /* Una página puede tener un tramo oscuro A PROPÓSITO —la de acceso lleva su
     panel de marca en negro, como el de la aplicación—, pero tiene que estar
     rotulado y todo su color tiene que vivir dentro del rótulo. Fuera de ahí,
     un valor del tema oscuro es un descuido. */
  const ABRE_OSCURO = "── OSCURO A PROPÓSITO ──";
  const CIERRA_OSCURO = "── FIN DEL OSCURO A PROPÓSITO ──";
  const declaraOscuro = sal.includes(ABRE_OSCURO);
  comprueba(`${slug}: sólo declara un tramo oscuro si le hace falta`,
    declaraOscuro === !chrome,
    declaraOscuro ? "lo declara y no lo necesita" : "lo necesita y no lo declara");
  if (declaraOscuro) {
    comprueba(`${slug}: el tramo oscuro está cerrado`, sal.includes(CIERRA_OSCURO));
  }
  const sinElTramo = declaraOscuro
    ? sal.slice(0, sal.indexOf(ABRE_OSCURO)) + sal.slice(sal.indexOf(CIERRA_OSCURO))
    : sal;
  const { restos } = restosDeTemaOscuro(sinElTramo.split("\n"));
  comprueba(`${slug}: nada sigue pintando en oscuro fuera de la barra y el pie`,
    restos.length === 0,
    restos.slice(0, 3).map((r) => "línea " + r.n + ": " + r.l).join(" | "));

  /* ── 7. LA LETRA ──────────────────────────────────────────────────── */
  const familias = [...new Set([...sal.matchAll(/font-family:\s*([^;}"]+)/g)].map((m) => m[1].trim()))];
  /* `inherit` vale: es lo que se le pone a los controles de formulario para
     que dejen de caer en la letra del navegador, y lo que heredan es la de la
     portada. */
  const raras = familias.filter((f) =>
    !/^'Source Sans 3', sans-serif$|^'Source Code Pro', monospace$|^inherit$/.test(f));
  comprueba(`${slug}: sólo la letra de la portada`, raras.length === 0, raras.join(" | "));

  /* ── 8. LOS ENLACES LLEVAN A ALGÚN SITIO ──────────────────────────── */
  const internos = [...new Set([...sal.matchAll(/href="([a-z0-9-]+\.html)(?:#[^"]*)?"/g)].map((m) => m[1]))];
  const rotos = internos.filter((f) => !fs.existsSync(path.join(CASTELLANO, f)));
  comprueba(`${slug}: todos los enlaces internos llevan a un fichero que existe`,
    rotos.length === 0, rotos.join(", "));
}

/* ── Y la comprobación que vigila a las demás ───────────────────────────── */
if (!soloUna) {
  console.log("\n── La línea gráfica es UNA ─────────────────────────────────────");
  const conChrome = PAGINAS.filter((p) => p.chrome).map((p) => path.join(CASTELLANO, p.slug + ".html"))
    .filter((f) => fs.existsSync(f)).map(lee)
    /* Sin el selector ni lo del posicionamiento, por lo mismo de arriba: las
       palabras clave son distintas en cada página a propósito —para eso están—
       y si se comparan, las cinco dejan de parecerse. */
    .map((h) => sinPosicionamiento(sinSelector(h)));
  comprueba("las páginas con barra y pie llevan EL MISMO trozo compartido",
    conChrome.length > 1 && conChrome.every((h) => h.includes(CIERRE) && h.includes(PIE)),
    conChrome.length + " páginas encontradas");
}

console.log("\n" + "─".repeat(64));
if (fallos.length === 0) {
  console.log(`TODO PASA  ·  ${total} comprobaciones`);
} else {
  console.log(`${fallos.length} FALLOS de ${total} comprobaciones\n`);
  fallos.forEach((f) => console.log("  · " + f));
  process.exitCode = 1;
}
