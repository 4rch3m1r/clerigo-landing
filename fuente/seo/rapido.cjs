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

function acelera(html) {
  return String(html)
    .replace(FUENTE, (_, url) =>
      `<link rel="preload" href="${url}" as="style" onload="this.onload=null;this.rel='stylesheet'" data-fuente-diferida>`
      + `<noscript><link href="${url}" rel="stylesheet"></noscript>`)
    .replace(/<img(?![^>]*\sloading=)(?=[^>]*\ssrc="(?:\.\.\/)?public\/)/g, "<img" + PEREZA);
}

function sinAcelerar(html) {
  return String(html)
    .replace(FUENTE_DIFERIDA, (_, url) => `<link href="${url}" rel="stylesheet">`)
    .split(PEREZA).join("");
}

module.exports = { acelera, sinAcelerar };
