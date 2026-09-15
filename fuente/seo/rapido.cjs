/**
 * LO QUE HACE QUE LA PÁGINA PINTE ANTES EN UN TELÉFONO. Lo aplica
 * `posicionar.cjs` al final de cada página, y `sinAcelerar()` lo deshace para
 * los validadores que comparan con el original (vía `sinPosicionamiento`).
 *
 * ── POR QUÉ ───────────────────────────────────────────────────────────────
 *
 * PageSpeed en móvil, medido el 2026-09-15 con Lighthouse 12: rendimiento 76,
 * primera pintura a 3,4 s y el mayor elemento a 4,1 s —el rótulo de la barra,
 * o sea, el tiempo que tarda en pintarse NADA—. De eso:
 *
 *   · 1,2 s: la hoja de Google Fonts es una hoja de estilos normal en la
 *     cabecera y el navegador no pinta hasta tenerla. Con `display=swap` ya
 *     estaba dicho que se podía pintar con la letra de reserva mientras llega;
 *     sólo faltaba no esperarla. Se pide como `preload` y se convierte en hoja
 *     al llegar. Sin JavaScript, la de siempre dentro de `<noscript>`.
 *
 *   · Los logotipos de marcos y reguladores de `public/` están a miles de
 *     píxeles de la primera pantalla y se bajaban todos al abrir. Van con
 *     `loading="lazy"`: se piden al acercarse.
 *
 * Se marcan con `data-fuente-diferida` y `data-diferida` para poder
 * deshacerlo exacto, y aplicarlo dos veces deja la página igual.
 */
const FUENTE = /<link href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)" rel="stylesheet">/g;
const FUENTE_DIFERIDA = /<link rel="preload" href="([^"]+)" as="style" onload="this\.onload=null;this\.rel='stylesheet'" data-fuente-diferida><noscript><link href="[^"]+" rel="stylesheet"><\/noscript>/g;
const PEREZA = ' loading="lazy" decoding="async" data-diferida';

/* ── LA PORTADA NO SE MAQUETA ENTERA ANTES DE PINTAR ──────────────────────
 *
 * Medido en la traza de Lighthouse: antes de la primera pintura el navegador
 * maquetaba toda la portada —unos 1.500 objetos, catorce secciones, el pie—
 * y eso eran 0,8–1,2 s de CPU de teléfono. `content-visibility: auto` deja
 * sin maquetar lo que está fuera de pantalla hasta que se acerca: la primera
 * pintura real pasó de 2,0–2,7 s a 1,0–1,3 s y el bloqueo total a 0.
 *
 * `contain-intrinsic-size: auto 900px` reserva un alto aproximado mientras
 * no se ha pintado, y `auto` hace que el navegador recuerde el de verdad en
 * cuanto la ve una vez: la barra de desplazamiento no baila al volver.
 * Sólo en la portada: es la única página hecha de secciones sueltas.
 *
 * PERO LOS ENLACES A SECCIONES ATERRIZABAN MAL. Medido en Chrome sin ventana
 * a 390 y a 1280 px: «#platform», «#solution»… quedaban hasta 1.700 px por
 * debajo o 1.100 por encima, porque el desplazamiento suave calcula el destino
 * con los altos reservados y las secciones cambian de alto al pintarse por el
 * camino. Así que en cuanto alguien pulsa un enlace con «#» —o la página se
 * abre con uno, llegando desde otra página a /#platform— se quita la
 * visibilidad diferida (`html.sin-cv`) ANTES del salto: el navegador maqueta
 * todo en ese momento y el destino sale exacto. La carga sigue siendo rápida;
 * lo que se paga, se paga al pulsar. */
const VISIBILIDAD = '<style data-rapido>html:not(.sin-cv) body>section:not(#hero),html:not(.sin-cv) body>footer{content-visibility:auto;contain-intrinsic-size:auto 900px}</style>'
  + '<script data-rapido>(function(){var d=document.documentElement;function q(){d.classList.add("sin-cv")}'
  + 'if(location.hash)q();document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href*=\'#\']");if(a)q()},true);'
  + 'addEventListener("hashchange",q)})()</script>';

function acelera(html) {
  let h = String(html)
    .replace(FUENTE, (_, url) =>
      `<link rel="preload" href="${url}" as="style" onload="this.onload=null;this.rel='stylesheet'" data-fuente-diferida>`
      + `<noscript><link href="${url}" rel="stylesheet"></noscript>`)
    .replace(/<img(?![^>]*\sloading=)(?=[^>]*\ssrc="(?:\.\.\/)?public\/)/g, "<img" + PEREZA);
  if (h.includes('<section id="hero">') && !h.includes(VISIBILIDAD)) h = h.replace("</head>", VISIBILIDAD + "\n</head>");
  return h;
}

function sinAcelerar(html) {
  return String(html)
    .replace(FUENTE_DIFERIDA, (_, url) => `<link href="${url}" rel="stylesheet">`)
    .split(PEREZA).join("")
    .split(VISIBILIDAD + "\n").join("")
    .split(VISIBILIDAD).join("");
}

module.exports = { acelera, sinAcelerar };
