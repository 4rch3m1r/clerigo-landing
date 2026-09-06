/**
 * Dónde vive cada idioma. Una sola línea, y de ella cuelgan los siete guiones.
 *
 * EL CASTELLANO ES LA FUENTE. Se genera desde el original de Archemir, se
 * comprueba entero —estructura, color, palabras, afirmaciones— y de ahí sale
 * el inglés por sustitución de texto. Por eso vive en su carpeta y no en la
 * raíz: si el castellano se generara en la raíz y el inglés lo pisara después,
 * volver a correr la cadena copiaría el inglés encima del castellano y no
 * saltaría nada. Pasó al escribir esto.
 *
 * EL INGLÉS OCUPA LA RAÍZ porque es el idioma por omisión: quien entra en
 * clerigo.io lo recibe sin pedir nada.
 *
 *     clerigo.io/            inglés      <- raíz
 *     clerigo.io/es/         castellano  <- fuente
 *
 * Lo que NO se duplica: las imágenes, las tarjetas de vista previa y el
 * favicon. Son las mismas en los dos idiomas y viven en la raíz; las páginas
 * castellanas las citan por su dirección absoluta.
 */
const path = require("node:path");

const RAIZ = path.join(__dirname, "..");

/** La carpeta del castellano, que es de donde sale todo. */
const CASTELLANO = path.join(RAIZ, "es");

/** La del inglés: la raíz del sitio. */
const INGLES = RAIZ;

/** El fichero de una página en un idioma. */
const enCastellano = (slug) => path.join(CASTELLANO, slug + ".html");
const enIngles = (slug) => path.join(INGLES, slug + ".html");

module.exports = { RAIZ, CASTELLANO, INGLES, enCastellano, enIngles };
