/**
 * Lo que comparten el aplicador y el validador: qué cuenta como «sólo color» y
 * qué blanco es legítimo en la versión clara.
 *
 * Vive aquí y no copiado en los dos guiones porque si las dos definiciones se
 * separan, uno de los dos empieza a dar por bueno lo que el otro rechaza — y
 * entonces la comprobación deja de comprobar nada.
 */

const COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\bwhite\b|\bblack\b/g;

/**
 * Deja el fichero sin nada que sea color, para poder comparar dos versiones y
 * ver si cambió algo MÁS que el color.
 *
 * Se dan por buenas tres adaptaciones que no son un valor de color pero sí son
 * tema, y ninguna toca la composición:
 *   · `color-scheme: light`, para que la barra de desplazamiento y los
 *     controles nativos del navegador dejen de pintarse en oscuro;
 *   · la opacidad de una forma decorativa de SVG, que es la alfa de su relleno
 *     con otro nombre: un 25% que era sutil sobre negro mancha sobre blanco;
 *   · cambiar un color escrito a mano por la ficha equivalente (--red-ink).
 *
 * También se aplana el interior de cada bloque `{ … }` a una sola línea. Así la
 * comparación mira las DECLARACIONES y no dónde cae cada salto de línea: al
 * quitar el `clip-path` del logotipo, una regla pasó de seis líneas a cuatro
 * sin que cambiara ni una propiedad.
 */
function pelado(s) {
  return s
    .replace(/url\("data:image\/png;base64,[A-Za-z0-9+/=]+"\)/g, "LOGO")
    .replace(/data:image\/png;base64,[A-Za-z0-9+/=]+/g, "LOGO")
    .replace(/\s*color-scheme:\s*light;/g, "")
    .replace(/opacity="[\d.]+"/g, 'opacity="O"')
    .replace(/var\(--red-ink\)/g, "C")
    .replace(COLOR, "C")
    .replace(/^\s*--red-ink: C;\s*$/gm, "")
    .replace(/\{([^{}]*)\}/g, (_, dentro) => "{" + dentro.replace(/\s+/g, " ").trim() + "}");
}

/**
 * En qué casos el blanco de la versión clara NO es un resto del tema oscuro.
 *
 *   a) La barra de navegación. Su fondo translúcido ES blanco ahora; una alfa
 *      alta sobre un `background` es el valor claro correcto. Sólo las alfas
 *      bajas delatan una capa que venía del tema oscuro.
 *   b) Los sellos de los marcos regulatorios (PCI-DSS, HIPAA, COBIT, NORTIC,
 *      BCRD, SIMV, BVRD…). Cada uno lleva dentro del SVG su propio rectángulo
 *      de color saturado, así que su texto blanco va sobre azul marino, no
 *      sobre la página. Son ilustración, no tema.
 *   c) Los brillos de las dos medallas: el `inset` del canto del metal y la
 *      sombra del texto sobre la cinta. También ilustración.
 */
const VALE_EL_BLANCO = [
  /background\s*[:=]\s*['"]?rgba\(255,\s*255,\s*255,\s*0\.[7-9]/,
  /<(text|rect|path|circle|line|polygon)[^>]*rgba\(255,\s*255,\s*255/,
  /(inset|text-shadow)[^;]*rgba\(255,\s*255,\s*255/,
  /*  d) La barrita que separa los iconos sociales del pie de las condiciones
   *     legales. Va DENTRO del pie, que es oscuro a propósito, así que su raya
   *     blanca al 10% es la del original y es la correcta. Se convirtió a negro
   *     al pasar la página a claro, cuando el pie todavía era claro; al volver
   *     el pie a oscuro se quedó negro sobre negro y desapareció. */
  /height:14px;background:rgba\(255,\s*255,\s*255/,
  /border-top:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.2[0-9]?\)/,
];

/**
 * El bloque que pone la barra de arriba y el pie en oscuro A PROPÓSITO, también
 * en la versión clara. Todo lo que hay entre esas dos marcas lleva valores del
 * tema oscuro porque así se pidió, no porque se quedara sin convertir.
 */
const TRAMO_OSCURO_QUERIDO = {
  abre: "── BARRA Y PIE SIEMPRE EN OSCURO ──",
  /* Se cierra con un rótulo propio y no con la última regla del bloque. Cuando
     cerraba en «footer { background: #0E0E0E; }», añadir una regla detrás la
     dejaba fuera del tramo y la comprobación la cantaba como resto del tema
     oscuro aunque fuera igual de querida que las de arriba. */
  cierra: "── FIN DE LA BARRA Y EL PIE EN OSCURO ──",
};

/**
 * La única excepción que no se puede reconocer mirando la línea sola: hay que
 * ver de qué cuelga.
 *
 * Se identifica por su CONTENIDO y no por su número de línea. Atarla a un
 * número la volvía mentirosa en cuanto el fichero crecía por cualquier otro
 * lado: la excepción se quedaba señalando a una línea inocente y la de verdad
 * saltaba como fallo.
 */
const EXCEPCIONES = [
  {
    marca: "IPEXPERT · 2025",
    porque: "el subtítulo «IPEXPERT · 2025» va sobre la cinta azul de la medalla "
      + "(degradado #1a3a6b/#2d5fc4 tres líneas más arriba); su hermano de la línea "
      + "de al lado lleva color:#fff sobre esa misma cinta",
  },
];

/**
 * Qué delata que una línea sigue pintando en oscuro.
 *
 * Las cuatro primeras son la escala de superficies del tema oscuro. Las dos
 * últimas son su TINTA —`--text` era #F0F0F0 y `--text-2/3` salían de
 * rgba(240,240,240,…)— y faltaban: sin ellas, un texto casi blanco que se
 * quedara sin convertir pasaba la comprobación y luego era ilegible sobre el
 * papel claro. Pasó de verdad en el banner de cookies.
 */
const HUELE_A_OSCURO = /#0[eE]0[eE]0[eE]\b|#141414\b|#1[bB]1[bB]1[bB]\b|#222222\b|rgba\(255\s*,\s*255\s*,\s*255|rgba\(240\s*,\s*240\s*,\s*240|#[fF]0[fF]0[fF]0\b/;

/** Devuelve las líneas de la versión clara que siguen pintando en oscuro. */
function restosDeTemaOscuro(lineas) {
  const restos = [];
  const excepcionadas = [];
  const usadas = new Set();
  let enTramoQuerido = false;
  let vioElTramo = false;
  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i];
    if (l.includes(TRAMO_OSCURO_QUERIDO.abre)) { enTramoQuerido = true; vioElTramo = true; continue; }
    if (enTramoQuerido) { if (l.includes(TRAMO_OSCURO_QUERIDO.cierra)) enTramoQuerido = false; continue; }
    /* El guion también pinta la barra en oscuro, y también a propósito. */
    if (/nav\.style\.background = 'rgba\(14,14,14/.test(l)) continue;
    /* `theme-color` no pinta nada de la página: tiñe la barra del navegador
       del teléfono. Va en oscuro a propósito, para que continúe la barra de
       arriba, que también va en oscuro. */
    if (/<meta name="theme-color"/.test(l)) continue;
    if (l.includes("base64")) continue;
    if (!HUELE_A_OSCURO.test(l)) continue;
    if (VALE_EL_BLANCO.some((re) => re.test(l))) continue;
    const e = EXCEPCIONES.find((x) => l.includes(x.marca));
    if (e) { excepcionadas.push({ n: i + 1, porque: e.porque }); usadas.add(e.marca); continue; }
    restos.push({ n: i + 1, l: l.trim().slice(0, 120) });
  }
  /* Una excepción que ya no hace falta es tan mala como una que falta: quiere
     decir que el motivo por el que se escribió ha dejado de ser cierto. */
  const huerfanas = EXCEPCIONES.filter((x) => !usadas.has(x.marca)).map((x) => x.marca);
  /* Si el tramo querido desapareciera, este saltador dejaría de saltar y nadie
     se enteraría: por eso se avisa cuando NO se encuentra. */
  if (!vioElTramo) huerfanas.push("el bloque «BARRA Y PIE SIEMPRE EN OSCURO» ya no está");
  return { restos, excepcionadas, huerfanas };
}

/**
 * Quita el panel de certificaciones de un texto, si lo tiene.
 *
 * Lo usa el validador sobre el ORIGINAL, para poder comparar el resto de la
 * página con las versiones publicadas, de las que el panel ya salió.
 *
 * Cuenta etiquetas en vez de buscar un `</div>`: el panel tiene divs dentro y
 * cualquier atajo se queda a la mitad o se lleva de más el cierre del bloque
 * que lo envuelve. Las dos cosas pasaron antes de escribir esto.
 */
function sinBloqueDiv(texto, marca, comentarioDeArriba) {
  const li = texto.split("\n");
  const ini = li.findIndex((l) => l.includes(marca));
  if (ini < 0) return texto;

  let prof = 0;
  let fin = -1;
  for (let i = ini; i < li.length; i++) {
    prof += (li[i].match(/<div\b/g) || []).length;
    prof -= (li[i].match(/<\/div>/g) || []).length;
    if (prof === 0) { fin = i; break; }
  }
  if (fin < 0) return texto;

  const desde = comentarioDeArriba && li[ini - 1] && li[ini - 1].includes(comentarioDeArriba)
    ? ini - 1 : ini;
  li.splice(desde, fin - desde + 1);
  return li.join("\n");
}

function sinPanelDeCertificaciones(texto) {
  return sinBloqueDiv(texto, '<div class="cert-panel', "CERT LOGOS PANEL");
}

/**
 * Quita las dos maquetas del producto que traía el original: la ventanita del
 * encabezado y el panel grande de la sección Plataforma, 248 líneas de CSS
 * dibujando un panel que no existía. En su sitio va una foto del sistema de
 * verdad, y aquí se recortan del ORIGINAL para poder seguir comparando el
 * resto de la página línea por línea.
 */
/**
 * Quita la tira de logotipos de integraciones. El camino de integraciones lo
 * fijó el dueño y ya no es el del original: salió ServiceNow y entraron siete.
 * Se recorta de los tres ficheros para poder seguir comparando el resto.
 */
function sinLaTiraDeIntegraciones(texto) {
  return sinBloqueDiv(texto, '<div class="integrations-logos">');
}

function sinLasMaquetas(texto) {
  return sinBloqueDiv(sinBloqueDiv(texto, '<div class="preview-body">'), '<div class="platform-body">');
}

module.exports = { COLOR, pelado, VALE_EL_BLANCO, EXCEPCIONES, restosDeTemaOscuro, sinPanelDeCertificaciones, sinBloqueDiv, sinLasMaquetas, sinLaTiraDeIntegraciones };
