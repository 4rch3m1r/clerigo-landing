/**
 * Rompe la versión inglesa a propósito y comprueba que el validador bilingüe
 * lo ve.
 *
 *   node fuente/idiomas/mutar.cjs
 *
 * La garantía que se prueba aquí es la que sostiene todo el bilingüe: si la
 * inglesa y la castellana se separan, tiene que saltar. Una guarda que sólo
 * vive en un comentario no sirve, y la única forma de saber si ésta ve algo es
 * romperla y mirar.
 */
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const AQUI = __dirname;
const RAIZ = path.join(AQUI, "..", "..");
const INGLESA = path.join(RAIZ, "index.html");
const bueno = fs.readFileSync(INGLESA);

function pasa() {
  try { execFileSync("node", ["validar.cjs"], { cwd: AQUI, encoding: "utf8" }); return { ok: true, salida: "" }; }
  catch (e) { return { ok: false, salida: e.stdout || "" }; }
}

/* Antes de romper nada, tiene que estar en verde.
   Sin esto la prueba miente: si el validador ya venía fallando, todas las
   mutaciones salen «detectadas» sin que nadie las haya mirado, y encima el
   motivo que se imprime es el fallo de antes. */
const limpio = pasa();
if (!limpio.ok) {
  console.error("\n  El bilingüe no está en verde: romperlo no demostraría nada.");
  console.error("  Déjalo en TODO PASA y vuelve.\n");
  console.error((limpio.salida.match(/^  MAL .*/gm) || []).join("\n"));
  process.exit(1);
}

const MUTANTES = [
  /* 1. La estructura se separa. Es LO que este validador existe para ver: una
        sección que se quita de un idioma y se queda en el otro. */
  ["quitar una seccion de la inglesa", (s) => s.replace('<section id="how"', '<div id="how"')],
  ["quitar un enlace de la inglesa", (s) => s.replace('<a href="marcos.html"', '<span href="marcos.html"')],
  ["cambiar una clase en la inglesa", (s) => s.replace('class="nav-links"', 'class="nav-linkss"')],

  /* 2. Se queda texto sin traducir. La estructura cuadra perfectamente y la
        página está a medias: es el fallo que NO se ve comparando esqueletos. */
  ["dejar un trozo en castellano", (s) => s.replace(/(<div class="number-label">)[^<]+(<)/, "$1Módulos integrados$2")],

  /* 2b. EL MISMO FALLO, DONDE LA PRIMERA GUARDA NO PUEDE MIRAR.
   *
   *  La comprobación de arriba trabaja con los trozos que el extractor saca de
   *  la CASTELLANA y busca cuáles siguen igual en la inglesa. De ahí sale su
   *  límite: sólo ve castellano que también esté en la página castellana. Un
   *  texto en castellano que no salga de allí —escrito a mano, heredado de una
   *  versión anterior, pegado de otro sitio— le es invisible.
   *
   *  Esto es lo que pasó de verdad, por el otro lado del mismo agujero: el
   *  extractor no consideraba «lenguaje» una palabra suelta en minúscula y sin
   *  tilde, así que «complicada» no era un trozo, no estaba en la lista, y el
   *  titular de la portada en inglés dijo «Managing GRC doesn't have to be
   *  complicada» mientras el validador daba TODO PASA.
   *
   *  La frase de aquí abajo NO existe en la castellana. La primera guarda no
   *  puede verla; la segunda sí, porque lee la página inglesa en crudo y busca
   *  tildes y palabras de enlace. Si alguien quitara la segunda, aquí saldría
   *  SE LE ESCAPA. */
  ["colar castellano que no sale de la pagina castellana",
    (s) => s.replace(/(<span class="word-simple">)[^<]+(<)/, "$1está sin traducir$2")],

  /* 2c. Las imágenes, con el prefijo de la OTRA página.
   *
   *  Éste no es un fallo inventado: es el que hubo. El paso al inglés lee de
   *  `es/` y de camino reescribe el castellano con el `../` puesto, así que a
   *  partir de la segunda pasada la inglesa lo heredaba y las quince capturas
   *  del carrusel apuntaban a `/../sistema/…`. La portada salía con el hueco
   *  blanco y el texto alternativo encima, y ni la comparación de esqueletos
   *  ni la de textos lo veían: las etiquetas eran las mismas y las palabras
   *  también. Sólo cambiaba una ruta. */
  ["poner a la inglesa las rutas de la castellana",
    (s) => s.replace(/(\s(?:src|href)=")(sistema\/|favicon\.png)/g, "$1../$2")],

  /* 3. El idioma declarado. Con el `lang` mal, el navegador ofrece traducir
        una página que ya está en su idioma, y el buscador la clasifica mal. */
  ["decir que la inglesa esta en castellano", (s) => s.replace('<html lang="en"', '<html lang="es"')],

  /* 4. El selector deja de llevar al otro idioma: la página en inglés se
        convierte en un callejón sin salida. */
  ["romper el enlace del selector", (s) => s.replace('href="es/index.html" class="idioma"', 'href="index.html" class="idioma"')],

  /* 5. El guion que mira el idioma del navegador. Quitarlo no rompe nada
        visible —la página carga igual— y quien llega con el navegador en
        castellano se queda en inglés sin enterarse de que hay otra versión. */
  ["quitar la deteccion de idioma",
    (s) => s.replace("/* El idioma del navegador decide", "/* quitado a proposito")],
];

let visto = 0;
for (const [nombre, romper] of MUTANTES) {
  fs.writeFileSync(INGLESA, romper(bueno.toString("utf8")));
  const r = pasa();
  const motivos = (r.salida.match(/^  MAL (.*?)(?:  ·.*)?$/gm) || [])
    .map((l) => l.replace(/^  MAL /, "").trim()).slice(0, 2).join(" / ");
  if (!r.ok) { visto++; console.log("  LO VE  " + nombre + "  →  " + motivos.slice(0, 110)); }
  else console.log("  SE LE ESCAPA  " + nombre);
}

fs.writeFileSync(INGLESA, bueno);
console.log(`\n${visto}/${MUTANTES.length} mutaciones detectadas · fichero restaurado`);
process.exitCode = visto === MUTANTES.length ? 0 : 1;
