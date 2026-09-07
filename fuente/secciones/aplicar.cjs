/**
 * METE LAS SECCIONES DEL AGENTE Y DE LA ARQUITECTURA EN LAS CUATRO PORTADAS.
 *
 *   node fuente/secciones/aplicar.cjs
 *
 * Las cuatro son: `index.html` y `oscuro.html` en la raíz (inglés) y las dos
 * mismas dentro de `es/` (castellano).
 *
 * ── POR QUÉ EDITA LAS PÁGINAS Y NO PASA POR `rebrandear.cjs` ──────────────
 *
 * Porque la portada ya no es salida limpia de esa tubería. Se editó por fuera
 * —distintivos de premio, nombres de los testimonios, el selector escondido en
 * el móvil— y volver a generarla desde el original de Archemir borraría todo
 * eso. Medido: el validador de la portada cuenta 42 transiciones donde el
 * original tiene 27, y 10 consultas de medios donde hay 4.
 *
 * Así que esto hace lo que hace falta y sólo eso: mete tres trozos entre
 * marcas de corte propias, sin tocar una línea de alrededor.
 *
 * ── SE PUEDE CORRER LAS VECES QUE HAGA FALTA ──────────────────────────────
 *
 * Todo lo que inserta va entre comentarios que lo delimitan, y lo que hace es
 * REEMPLAZAR lo que hay entre ellos. Sin eso, la segunda pasada dejaría dos
 * copias de cada sección — que es exactamente como quedó el selector de idioma
 * la primera vez que se montó, con tres seguidos.
 *
 * ── QUÉ SUSTITUYE ────────────────────────────────────────────────────────
 *
 * La rejilla de quince tarjetas de módulo —27 KB de lista— por cinco dominios.
 * La lista larga no dice nada: quien la lee no sabe si eso es mucho o poco.
 * Cinco dominios sí dicen de qué va la plataforma.
 */
const fs = require("node:fs");
const path = require("node:path");
const { ES, EN } = require("./contenido.cjs");
const { M, CSS, seccionesNuevas, dominios } = require("./marcado.cjs");
const CIFRAS = require("./cifras.cjs");

const RAIZ = path.join(__dirname, "..", "..");
const PAGINAS = [
  { f: "index.html", t: EN }, { f: "oscuro.html", t: EN },
  { f: "es/index.html", t: ES }, { f: "es/oscuro.html", t: ES },
];

/** Pone `dentro` entre las dos marcas. Si ya estaban, reemplaza lo de en medio. */
function entreMarcas(html, [abre, cierra], dentro, donde) {
  const bloque = `${abre}\n${dentro}\n${cierra}`;
  const i = html.indexOf(abre), j = html.indexOf(cierra);
  if (i >= 0 && j > i) return html.slice(0, i) + bloque + html.slice(j + cierra.length);
  if (i >= 0 || j >= 0) throw new Error("hay una marca sin su pareja: " + abre);
  const k = html.indexOf(donde);
  if (k < 0) throw new Error("no encuentro dónde ponerlo: " + donde.slice(0, 50));
  return html.slice(0, k) + bloque + "\n\n" + html.slice(k);
}

let tocadas = 0;
console.log("");
for (const { f, t } of PAGINAS) {
  const ruta = path.join(RAIZ, f);
  if (!fs.existsSync(ruta)) { console.log(`  ·  ${f} no existe`); continue; }
  const antes = fs.readFileSync(ruta, "utf8");
  let h = antes;

  /* 1. El estilo, al final de la hoja que la página ya tiene. */
  const finEstilo = "</style>";
  const iEstilo = h.lastIndexOf(finEstilo);
  if (iEstilo < 0) throw new Error(f + ": no encuentro el cierre de la hoja de estilo");
  h = entreMarcas(h, M.css, CSS.trim(), h.slice(iEstilo, iEstilo + finEstilo.length));

  /* 2. Las dos secciones nuevas, ANTES de la de la solución: primero se dice
        qué hace el agente y cómo se trabaja con él, y sólo después con qué
        piezas. Al revés, la lista de módulos se lee sin saber para qué. */
  h = entreMarcas(h, M.secciones, seccionesNuevas(t).trim(), '<section id="solution">');

  /* 3. La rejilla de quince módulos, sustituida por los cinco dominios. */
  const iRejilla = h.indexOf('<div class="modules-grid">');
  if (iRejilla >= 0 && h.indexOf(M.dominios[0]) < 0) {
    /* Se recorta contando llaves de <div> desde la rejilla hasta su cierre: la
       rejilla tiene quince tarjetas anidadas y buscar «el siguiente </div>»
       cortaría dentro de la primera. */
    let prof = 0, i = iRejilla, fin = -1;
    const re = /<div\b|<\/div>/g;
    re.lastIndex = iRejilla;
    let m;
    while ((m = re.exec(h))) {
      prof += m[0] === "</div>" ? -1 : 1;
      if (prof === 0) { fin = m.index + m[0].length; break; }
    }
    if (fin < 0) throw new Error(f + ": no encuentro el cierre de la rejilla de módulos");
    const quitado = fin - iRejilla;
    h = h.slice(0, iRejilla) + `${M.dominios[0]}\n    ${dominios(t)}\n    ${M.dominios[1]}` + h.slice(fin);
    console.log(`  ${f.padEnd(16)} rejilla de módulos fuera (${Math.round(quitado / 1024)} KB)`);
  } else if (h.indexOf(M.dominios[0]) >= 0) {
    /* Ya estaba puesta: se reemplaza sólo lo de en medio. */
    h = entreMarcas(h, M.dominios, `    ${dominios(t)}\n    `, "");
  }

  /* 4. Y la cabecera de esa sección, que hablaba de «Doce módulos» sobre una
        rejilla de quince tarjetas —el número ya no cuadraba ni antes— y ahora
        encabeza cinco dominios.
        Se busca DENTRO de la sección, no en toda la página: el mismo trío de
        clases lo usan las demás secciones y el reemplazo se llevaría la
        primera que encontrara. */
  const q = t.arquitectura;
  const iSol = h.indexOf('<section id="solution">');
  if (iSol < 0) throw new Error(f + ": no encuentro la sección de la solución");
  const finSol = h.indexOf("</section>", iSol);
  const cabecera = h.slice(iSol, finSol);
  const RE_CABECERA = /(<div class="label-chip reveal">)[^<]*(<\/div>[\s\S]*?<h2 class="section-title-center reveal reveal-2">)[\s\S]*?(<\/h2>[\s\S]*?<p class="section-subtitle reveal reveal-3">)[\s\S]*?(<\/p>)/;
  if (RE_CABECERA.test(cabecera)) {
    const nueva = cabecera.replace(RE_CABECERA,
      (_, a, b, c, d) => `${a}${q.chip}${b}\n        ${q.titulo}\n      ${c}\n        ${q.subtitulo}\n      ${d}`);
    h = h.slice(0, iSol) + nueva + h.slice(finSol);
  }

  /* 5. Las dos cifras de la fila de arriba, que decían «15+» las dos sin
        salir de ningún sitio. Se sustituye la tarjeta ENTERA —valor, rótulo y
        descripción— buscando por su rótulo viejo, que es lo único estable:
        el valor cambia y la descripción también. */
  const c = t === ES ? CIFRAS.es : CIFRAS.en;
  for (const [rotuloViejo, dato] of [
    [t === ES ? "Módulos integrados" : "Integrated modules", c.modulos],
    [t === ES ? "Marcos regulatorios" : "Regulatory frameworks", c.marcos],
    [t === ES ? "Reducción de trabajo manual" : "Reduction in manual work", c.manual],
  ]) {
    const re = new RegExp(
      `(<div class="number-val">)[^<]*(<span>)[^<]*(</span></div>\\s*<div class="number-label">)`
      + rotuloViejo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      + `(</div>\\s*<div class="number-desc">)[^<]*(</div>)`);
    if (!re.test(h)) continue;
    h = h.replace(re, (_, a, b, d, e, g) =>
      `${a}${dato.valor}${b}${dato.sufijo}${d}${dato.rotulo}${e}${dato.desc}${g}`);
  }

  if (h === antes) { console.log(`  ${f.padEnd(16)} ya estaba al día`); continue; }
  fs.writeFileSync(ruta, h);
  tocadas++;
  console.log(`  ${f.padEnd(16)} hecha  (${Math.round(antes.length / 1024)} KB → ${Math.round(h.length / 1024)} KB)`);
}

console.log(`\n  ${tocadas} de ${PAGINAS.length} portadas.\n`);
