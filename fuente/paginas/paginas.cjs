/**
 * Las páginas interiores del sitio, en UN solo sitio.
 *
 * La lista vivía copiada en el validador, en el sincronizador y en el mutador.
 * Tres copias de lo mismo se separan solas: añadir una página obligaba a
 * acordarse de tres ficheros, y el día que se olvidara uno la página quedaría
 * fuera de una comprobación sin que nadie se enterara.
 *
 *   chrome:false   no lleva barra ni pie. Sólo la pantalla de acceso: colgarle
 *                  la barra de un sitio de marketing le cambiaría lo que es.
 *
 *   sinOriginal    no sale de ningún original de Archemir, se escribió de cero.
 *                  La comprobación de «las mismas palabras» no le aplica
 *                  —no hay contra qué compararla— y las mutaciones que
 *                  dependen del original tampoco. A cambio se le exigen sus
 *                  propias afirmaciones, que es lo que de verdad hay que
 *                  vigilar en una página de confianza.
 */
module.exports = [
  { slug: "legal", chrome: true },
  { slug: "precios", chrome: true },
  { slug: "marcos", chrome: true },
  { slug: "contacto", chrome: true },
  { slug: "partners", chrome: false },
  { slug: "confianza", chrome: true, sinOriginal: true },
];
