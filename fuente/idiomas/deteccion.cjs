/**
 * El idioma del navegador decide, pero la persona manda.
 *
 * Quien llega por primera vez a clerigo.io con el navegador en castellano va a
 * /es/ sin tener que buscar nada. Quien llega con cualquier otro idioma se
 * queda en inglés, que es el de por omisión.
 *
 * TRES CUIDADOS, y los tres importan:
 *
 *   1. LA ELECCIÓN DE LA PERSONA GANA SIEMPRE. En cuanto alguien toca el
 *      selector, se guarda su idioma y no se le vuelve a mover. Un sitio que
 *      te devuelve a su idioma cada vez que navegas es peor que uno que no
 *      detecta nada: te deja sin salida.
 *   2. UNA SOLA VEZ POR VISITA. Se apunta en la sesión que ya se miró. Sin
 *      eso, volver atrás con el botón del navegador te reenvía otra vez y no
 *      hay forma de salir de la página.
 *   3. NO SE TOCA A LOS RASTREADORES. Google y compañía no ejecutan esto: leen
 *      las etiquetas `hreflang` de la cabecera, que ya dicen que hay dos
 *      versiones y cuál es la de por omisión. Por eso el reenvío es de
 *      navegador y no del servidor: así el buscador indexa las dos.
 *
 * El guion es IDÉNTICO en las dos versiones: de dónde está y a dónde va lo
 * deduce de la propia dirección. Si fuera distinto en cada una, sería otra
 * diferencia que declarar y otro sitio donde se pueden separar.
 */

const GUION = `
<script>
/* El idioma del navegador decide; la eleccion de la persona manda. Ver
   fuente/idiomas/deteccion.cjs para el porque de cada cuidado. */
(function () {
  var ruta = location.pathname;
  var enCastellano = ruta.indexOf('/es/') !== -1;
  var mio = enCastellano ? 'es' : 'en';

  function guarda(cual) {
    try { localStorage.setItem('clerigo-idioma', cual); } catch (e) {}
  }
  function guardado() {
    try { return localStorage.getItem('clerigo-idioma'); } catch (e) { return null; }
  }

  /* Tocar el selector es elegir: se apunta antes de que el enlace navegue. */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('.idioma') : null;
    if (a) guarda(a.getAttribute('data-idioma'));
  });

  /* Una sola vez por visita: con el boton de atras, volver aqui no puede
     reenviarte otra vez. */
  var yaMirado;
  try { yaMirado = sessionStorage.getItem('clerigo-idioma-mirado'); } catch (e) { yaMirado = '1'; }
  if (yaMirado) return;
  try { sessionStorage.setItem('clerigo-idioma-mirado', '1'); } catch (e) {}

  var elegido = guardado();
  var quiere = elegido || ((navigator.language || navigator.userLanguage || 'en')
    .toLowerCase().indexOf('es') === 0 ? 'es' : 'en');
  if (quiere === mio) return;

  var destino = quiere === 'es'
    ? ruta.replace(/\\/([^\\/]*)$/, '/es/$1')
    : ruta.replace('/es/', '/');
  if (destino === ruta) return;
  location.replace(destino + location.search + location.hash);
})();
</script>
`;

/* Entre estas dos marcas se recorta en los validadores. La de cierre es la
   etiqueta misma; la de apertura, el comentario de la primera linea. */
const ABRE = "/* El idioma del navegador decide";

/**
 * Mete el guion justo antes de que cierre la cabecera.
 *
 * Va en el `<head>` y sin `defer` a propósito: tiene que decidir ANTES de que
 * se pinte nada. Puesto al final del cuerpo, se vería la página en un idioma y
 * saltaría al otro delante de quien la está leyendo.
 *
 * Se sustituye si ya está, como todo lo demás de este paso: este guion se
 * corre más de una vez sobre el mismo fichero.
 */
function ponDeteccion(html) {
  /* Los saltos van como `\r?\n` porque las páginas están en CRLF. Con `\n` a
     secas esta limpieza NO casaba, y entonces cada pasada del generador dejaba
     otra copia del guion de detección: dos redirecciones por idioma peleándose
     en la misma cabecera. No se veía porque no se regeneraba casi nunca. */
  const PUESTO = /\r?\n?<script>\r?\n\/\* El idioma del navegador decide[\s\S]*?<\/script>\r?\n/;
  const limpio = html.replace(PUESTO, "");
  const i = limpio.indexOf("</head>");
  if (i < 0) throw new Error("la página no tiene </head> donde poner la detección de idioma");
  return limpio.slice(0, i) + GUION + limpio.slice(i);
}

module.exports = { ponDeteccion, GUION, ABRE };
