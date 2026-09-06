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
const AQUI = __dirname;

const { palabras, aplicaMarca, comportamiento, PICTOGRAMAS } = require("./palabras.cjs");
const { restosDeTemaOscuro } = require("../tema.cjs");

const MARCA = JSON.parse(fs.readFileSync(path.join(AQUI, "marca.json"), "utf8"));
const PLANTILLA = lee(path.join(AQUI, "plantilla.html"));

/** Las cinco. `chrome:false` es la única que no lleva barra ni pie: es una
 *  pantalla de acceso a plena página, y colgarle la barra de un sitio de
 *  marketing encima le cambiaría la composición, que no es lo que se pidió. */
const PAGINAS = [
  { slug: "legal", chrome: true },
  { slug: "precios", chrome: true },
  { slug: "marcos", chrome: true },
  { slug: "contacto", chrome: true },
  { slug: "partners", chrome: false },
];

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

for (const { slug, chrome } of aRevisar) {
  const fOrigen = path.join(AQUI, "..", "paginas-originales", slug + ".html");
  const fSalida = path.join(RAIZ, slug + ".html");

  console.log(`\n── ${slug}.html ${"─".repeat(Math.max(0, 56 - slug.length))}`);

  if (!fs.existsSync(fOrigen)) {
    comprueba(`el original de ${slug} está en fuente/paginas-originales/`, false);
    continue;
  }
  if (!fs.existsSync(fSalida)) {
    comprueba(`existe ${slug}.html`, false, "todavía no se ha escrito");
    continue;
  }

  const org = lee(fOrigen);
  const sal = lee(fSalida);

  /* ── 1. LAS PALABRAS ──────────────────────────────────────────────── */
  const dePagina = sinLetrasDeLogotipo(palabras(sal, { abre: `<main class="pagina">`, cierra: "</main>" }) || []);
  const deOrigen = sinLetrasDeLogotipo(palabras(aplicaMarca(soloElCuerpo(org), MARCA)));

  if (!sal.includes(`<main class="pagina">`)) {
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
  const ruta = (sal.match(/<link rel="canonical" href="https:\/\/clerigo\.io\/([^"]*)"/) || [])[1] || "";
  const imagen = (sal.match(/<meta property="og:image" content="https:\/\/clerigo\.io\/([^"]*)"/) || [])[1] || "";
  const cabeceraEsperada = CABECERA
    .split("{{TITULO}}").join(titulo)
    .split("{{DESCRIPCION}}").join(desc)
    .split("{{RUTA}}").join(ruta)
    .split("{{IMAGEN}}").join(imagen);
  comprueba(`${slug}: la cabecera, los tokens y la hoja compartida salen de la plantilla`,
    sal.startsWith(cabeceraEsperada));
  comprueba(`${slug}: tiene título, descripción y canónica propias`,
    titulo.includes("Clèrigo") && desc.length > 40 && ruta.length > 0,
    `título «${titulo}», ruta «${ruta}», descripción de ${desc.length} letras`);

  /* ── La tarjeta que sale al pegar el enlace ───────────────────────────
     Esto no se puede dar por bueno mirando la etiqueta: la etiqueta llevaba
     meses apuntando a og.png y el fichero NO existía. Se comprueba que el
     fichero está, que pesa lo que puede tragar WhatsApp y que mide lo que
     piden las tarjetas grandes. */
  const fImagen = path.join(RAIZ, imagen);
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
  comprueba(`${slug}: ${chrome ? "la barra y el pie son" : "el cierre de la hoja es"} el de la plantilla`,
    sal.includes(chrome ? CIERRE : CIERRE_SIN_BARRA) && sal.includes(chrome ? PIE : PIE_SIN_PIE));

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
  const rotos = internos.filter((f) => !fs.existsSync(path.join(RAIZ, f)));
  comprueba(`${slug}: todos los enlaces internos llevan a un fichero que existe`,
    rotos.length === 0, rotos.join(", "));
}

/* ── Y la comprobación que vigila a las demás ───────────────────────────── */
if (!soloUna) {
  console.log("\n── La línea gráfica es UNA ─────────────────────────────────────");
  const conChrome = PAGINAS.filter((p) => p.chrome).map((p) => path.join(RAIZ, p.slug + ".html"))
    .filter((f) => fs.existsSync(f)).map(lee);
  comprueba("las cuatro páginas con barra y pie llevan EL MISMO trozo compartido",
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
