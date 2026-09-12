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
 *   · las CUATRO etiquetas de la TARJETA de enlace —`og:image`,
 *                   `og:image:secure_url`, `twitter:image` y el `image_src`,
 *                   que va como `<link ... href>` y no como `<meta ...
 *                   content>` y por eso se me pasó— por lo mismo: cada
 *                   idioma tiene la suya, con su titular dentro. Antes había
 *                   una sola para los dos y NUEVE de las dieciocho páginas
 *                   servían la tarjeta en el idioma equivocado: seis inglesas
 *                   una en castellano, y tres castellanas una en inglés,
 *                   entre ellas la portada.
 *                   Se sustituyen por una marca, no se borran. Y APARTE hay
 *                   una guarda con nombre propio —«cada página lleva la
 *                   tarjeta de su idioma», en `fuente/seo/validar.cjs`—
 *                   que comprueba que cada una lleve la que le toca.
 *                   Neutralizar sin comprobar aparte es quedarse sin
 *                   comprobación, que es exactamente cómo se coló el fallo.
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
      '<script type="application/ld+json">·</script>')
    /* La dirección de la tarjeta, a una marca. La etiqueta se deja puesta para
       que siga contando como etiqueta: borrarla descuadraría la comparación de
       estructura, que es justo lo que esto viene a permitir. */
    .replace(/(<meta property="og:image(?::secure_url)?" content=")[^"]*(">)/g, "$1·$2")
    .replace(/(<meta name="twitter:image" content=")[^"]*(">)/g, "$1·$2")
    /* La cuarta, que es un `<link ... href>`. Metida en la lista de arriba no
       casaba y no se enteraba nadie: es el atributo el que cambia, no sólo el
       nombre de la etiqueta. */
    .replace(/(<link rel="image_src" href=")[^"]*(">)/g, "$1·$2");
}

module.exports = { sinPosicionamiento };
