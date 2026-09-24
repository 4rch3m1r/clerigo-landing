/**
 * Manda la elección de la persona. Y nada más.
 *
 * Quien pulsó «ES» alguna vez va a /es/ aunque entre por una dirección
 * inglesa. Quien no ha elegido nunca se queda donde ha entrado.
 *
 * ── LO QUE HACÍA ANTES, Y POR QUÉ SE QUITÓ ────────────────────────────────
 *
 * Hasta el 2026-09-20 este guion miraba `navigator.language`: quien llegaba
 * con el navegador en castellano a una dirección inglesa era reenviado a /es/,
 * y al revés. La cabecera de este fichero decía que eso NO tocaba a los
 * rastreadores, que «Google y compañía no ejecutan esto». Era falso.
 *
 * Google renderiza con Chrome, y su renderizador pide en inglés. O sea: en
 * TODA página de /es/ el guion se ejecutaba, veía un navegador en inglés, y
 * hacía `location.replace` a la inglesa. Para Google eso es una redirección,
 * no una página.
 *
 * Medido el 2026-09-20. Por HTTP las catorce direcciones del mapa del sitio
 * contestaban 200 —también con el agente de Googlebot—, así que por fuera todo
 * parecía correcto; la redirección sólo aparecía al renderizar. Cargada
 * `https://clerigo.io/es/` en un navegador con `navigator.language = "en-US"`,
 * se acababa en `https://clerigo.io/`. Search Console daba `/es/` y
 * `/es/contacto` —las dos únicas españolas ya renderizadas— por «Página con
 * redirección», y las seis restantes por «Descubierta: actualmente sin
 * indexar». En Google no salía una sola página en castellano.
 *
 * ── POR QUÉ ESTO SÍ ES SEGURO ─────────────────────────────────────────────
 *
 * Porque el reenvío depende de `localStorage`, y un rastreador llega siempre
 * con el almacenamiento vacío: nunca ha pulsado el selector. No hay lista de
 * agentes que mantener ni comportamiento distinto que servirle —se le da
 * exactamente el mismo guion que a una persona—, y aun así no se le reenvía
 * jamás. Las etiquetas `hreflang` ya le dicen que hay dos versiones y cuál es
 * la de por omisión; con eso indexa las dos y sirve la que toca a cada quien.
 *
 * LO QUE SE PIERDE: quien entra por primera vez en clerigo.io con el navegador
 * en castellano ve la portada en inglés hasta que pulsa «ES». Se acepta a
 * sabiendas. Lo cubre `hreflang`: quien busque en castellano en Google llegará
 * ya a /es/. Si algún día se quiere recuperar el recibimiento en el idioma del
 * navegador, se hace con un aviso —«¿Prefieres español? Ver en español»— y no
 * con un salto: un aviso no es una redirección y ningún rastreador lo cuenta
 * como tal.
 *
 * ── Y DE PASO, CUATRO 404 QUE LLEVABAN AHÍ DESDE SIEMPRE ──────────────────
 *
 * El destino se calculaba metiendo `/es/` delante del último trozo de la ruta.
 * Eso sólo acierta cuando la página se llama igual en los dos idiomas. Para
 * las otras cuatro daba `/es/pricing`, `/es/contact`, `/es/frameworks` y
 * `/es/trustcenter`, y las cuatro contestan 404 —comprobado en producción el
 * 2026-09-20—: la página se llama `/es/precios`.
 *
 * O sea que hasta hoy, quien llegaba desde Google a `clerigo.io/pricing` con
 * el navegador en castellano —el caso más común en el mercado al que va el
 * sitio— era reenviado a una página que no existe. Ahora el destino se lee del
 * `hreflang` de la propia cabecera, que ya trae el nombre traducido y sale del
 * mismo sitio que el mapa del sitio.
 *
 * ── LOS DOS CUIDADOS QUE SE QUEDAN ────────────────────────────────────────
 *
 *   1. LA ELECCIÓN SE APUNTA AL TOCAR EL SELECTOR, antes de que el enlace
 *      navegue. Si no se apuntara, no habría nada que obedecer después.
 *   2. UNA SOLA VEZ POR VISITA. Se marca en la sesión que ya se miró. Sin eso,
 *      volver atrás con el botón del navegador te reenvía otra vez y no hay
 *      forma de salir de la página.
 *
 * El guion es IDÉNTICO en las dos versiones: de dónde está y a dónde va lo
 * deduce de la propia dirección. Si fuera distinto en cada una, sería otra
 * diferencia que declarar y otro sitio donde se pueden separar.
 *
 * ── LA PRIMERA LÍNEA DEL COMENTARIO ES UNA MARCA ──────────────────────────
 *
 * `/* El idioma del navegador decide` la buscan cinco sitios del generador
 * —mutar.cjs, idiomas/validar.cjs, paginas/validar.cjs, paginas/sincronizar.cjs
 * y validar.cjs— para recortar el guion o comprobar que está. Por eso sigue
 * empezando igual aunque ya no sea el navegador quien decide; la frase se
 * completa para que no mienta.
 */

const GUION = `
<script>
/* El idioma del navegador decide: NADA. Manda la eleccion guardada, y solo
   esa. Ver fuente/idiomas/deteccion.cjs para el porque de cada cuidado. */
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

  /* SOLO LA ELECCION EXPLICITA. Nada de navigator.language: el renderizador de
     Google pide en ingles, y mirarlo hacia que toda pagina de /es/ saltase a
     la inglesa delante del buscador. Un rastreador llega con el almacenamiento
     vacio, asi que aqui se para siempre. */
  var quiere = guardado();
  if (quiere !== 'es' && quiere !== 'en') return;
  if (quiere === mio) return;

  /* A DONDE, LO DICE EL PROPIO SELECTOR. Su enlace ya trae la direccion de la
     otra version CON SU NOMBRE TRADUCIDO. Calcularlo a mano —meterle '/es/'
     delante al ultimo trozo— daba /es/pricing, /es/contact, /es/frameworks y
     /es/trustcenter, que son cuatro 404: la pagina se llama /es/precios.

     ANTES ESTO LEIA EL hreflang DE LA CABECERA, y esas etiquetas ya no estan:
     desde el 2026-09-24 en el buscador solo va el ingles, y un hreflang es
     justo lo que le ofrece a Google la version castellana como alternativa.
     El selector, en cambio, es del visitante, no del buscador: es el sitio
     natural del que leer esto. Se coge solo la ruta para no salirse de este
     servidor: el enlace puede ser relativo o absoluto. */
  var otra = document.querySelector('a.idioma[data-idioma=\"' + quiere + '\"]');
  var destino = null;
  try { destino = otra && new URL(otra.getAttribute('href'), location.href).pathname; } catch (e) {}
  if (!destino || destino === ruta) return;
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
