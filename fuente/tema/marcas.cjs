/**
 * LO QUE AÑADE EL TEMA OSCURO A UNA PÁGINA, Y CÓMO QUITARLO.
 *
 * `fuente/tema/oscuro.cjs` es el último paso: mete cuatro piezas en cada página,
 * todas con su marca para poder encontrarlas.
 *
 *   <script id="tema-arranque">   en el <head>: decide claro u oscuro antes de
 *                                  pintar, para que no parpadee;
 *   <style id="tema-oscuro">      el CSS oscuro de ESA página, generado;
 *   <button id="temaToggle">      el sol/luna, al lado del selector de idioma
 *                                  (y en partners otro, sólo para móvil);
 *   <script id="tema-motor">      antes de </body>: colores en línea, el botón
 *                                  y el cambio a las 7.
 *
 * `sinTema()` las quita. La usan el propio generador —para que correrlo dos
 * veces deje la página igual— y los validadores que comparan páginas entre sí
 * o contra su original: el tema no es parte de lo que ellos vigilan, y lo
 * vigila `fuente/tema/validar.cjs`.
 */
const MARCAS = {
  arranque: /[ \t]*<script id="tema-arranque">[\s\S]*?<\/script>\r?\n?/g,
  estilo: /[ \t]*<style id="tema-oscuro">[\s\S]*?<\/style>\r?\n?/g,
  boton: /<button type="button" class="tema-toggle" id="temaToggle"[\s\S]*?<\/button>/g,
  movil: /\r?\n[ \t]*<button type="button" class="tema-toggle tema-toggle-movil" id="temaToggleMovil"[\s\S]*?<\/button>/g,
  motor: /[ \t]*<script id="tema-motor">[\s\S]*?<\/script>\r?\n?/g,
};

function sinTema(html) {
  return String(html)
    .replace(MARCAS.arranque, "")
    .replace(MARCAS.estilo, "")
    .replace(MARCAS.boton, "")
    .replace(MARCAS.movil, "")
    .replace(MARCAS.motor, "");
}

module.exports = { MARCAS, sinTema };
