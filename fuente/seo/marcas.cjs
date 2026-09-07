/**
 * QUITAR DE UNA PÁGINA TODO LO QUE PUSO EL PASO DE POSICIONAMIENTO.
 *
 * Los tres validadores del sitio comparan páginas entre sí —la portada contra
 * el original de Archemir, la oscura contra la clara, la inglesa contra la
 * castellana— y todos necesitan lo mismo: mirar la página COMO SI el paso de
 * posicionamiento no hubiera pasado.
 *
 * Está en un fichero y no en tres porque tres copias de esta lista se separan
 * solas. El día que `posicionar.cjs` añada una etiqueta más y sólo se acuerde
 * uno de los tres, ese validador empieza a dar rojo por algo que está bien —y
 * lo que pasa entonces es que alguien lo apaga—.
 *
 * Lo que se quita, y por qué cada cosa:
 *
 *   · `keywords`  — su contenido está traducido, así que cambia entre idiomas.
 *   · `robots`    — cambia entre la portada clara y la oscura: la oscura lleva
 *                   `noindex` porque es la misma página con otra piel.
 *   · `og:locale` y `og:locale:alternate` — cambian entre idiomas por
 *                   definición: son el idioma.
 *   · la ficha de datos estructurados — se reescribe entera, en el idioma de
 *                   la página y con su dirección dentro. Se sustituye por una
 *                   marca del mismo tamaño para todos, no se borra: borrarla
 *                   descuadraría la cuenta de `<script>` que vigila aparte
 *                   que no se cuele un guion nuevo.
 */

/** La página sin nada de lo que puso el posicionamiento. */
function sinPosicionamiento(html) {
  return html
    .replace(/[ \t]*<meta name="keywords" content="[^"]*">\n?/g, "")
    .replace(/[ \t]*<meta name="robots" content="[^"]*">\n?/g, "")
    .replace(/[ \t]*<meta property="og:locale:alternate" content="[^"]*">\n?/g, "")
    .replace(/<meta property="og:locale" content="[^"]*">/g,
      '<meta property="og:locale" content="·">')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
      '<script type="application/ld+json">·</script>');
}

module.exports = { sinPosicionamiento };
