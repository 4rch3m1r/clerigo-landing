/**
 * GOOGLE TAG MANAGER. Lo pone `posicionar.cjs` al final de cada página, y
 * `sinEtiqueta()` lo quita para los validadores que comparan páginas entre sí
 * —igual que `rapido.cjs`—.
 *
 * Es el fragmento tal cual lo da Google para el contenedor GTM-N2T7DR3D, sin
 * tocarle una coma: quien lo mire desde el panel de GTM tiene que reconocerlo.
 *
 * ── DOS DECISIONES QUE NO SON LAS QUE DICE GOOGLE ─────────────────────────
 *
 * 1. VA AL FINAL DEL <head>, NO «LO MÁS ARRIBA POSIBLE».
 *
 *    Arriba son 430 bytes metidos delante de las etiquetas de la tarjeta de
 *    enlace, y `og:image` tiene que caer en el primer kilobyte y medio o
 *    WhatsApp no pinta vista previa —pasó, está contado en `posicionar.cjs`, y
 *    hay dos guardas que lo vigilan: `fuente/validar.cjs` y
 *    `fuente/paginas/validar.cjs`—. Medido: en la portada `og:image` está en el
 *    byte 1.136; con el fragmento delante se iría a ~1.570 y rompería las dos.
 *
 *    No se pierde nada: el guion se pide con `j.async=true`, así que el
 *    navegador lo baja en paralelo y no bloquea el pintado esté donde esté
 *    dentro de la cabecera. «Lo más arriba posible» es de cuando el fragmento
 *    era síncrono.
 *
 * 2. EL <noscript> VA JUSTO DESPUÉS DE <body>, ESO SÍ TAL CUAL.
 *    Es lo que mide a quien navega sin JavaScript. No cuesta nada: un iframe
 *    oculto que sólo se pide si no hay JavaScript.
 *
 * ── LO QUE ESTO NO ARREGLA ────────────────────────────────────────────────
 *
 * El aviso de privacidad de la web dice hoy «sin analítica y sin rastreadores
 * de terceros», y la política de cookies dice lo mismo. Con esto puesto, esa
 * frase deja de ser cierta: GTM abre conexión con googletagmanager.com y lo que
 * se cargue desde el contenedor —Analytics, píxeles— pone cookies. Cambiar esa
 * copia es un cambio de texto legal y se hace aparte, a conciencia.
 */

const ID = "GTM-N2T7DR3D";

const CABEZA = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${ID}');</script>
<!-- End Google Tag Manager -->`;

const CUERPO = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${ID}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

/* Por sus comentarios, que son la marca que trae de fábrica: da igual dónde
   haya quedado el bloque y da igual cuántas veces se haya corrido el paso.
 *
 * CADA UNO SE LLEVA EL SALTO QUE ÉL PUSO, Y NO EL DE AL LADO. El de la cabeza
 * va delante de `</head>` y añade el salto DETRÁS; el del cuerpo va detrás de
 * `<body>` y lo añade DELANTE. Con un solo patrón —`\r?\n?` delante en los
 * dos— el de la cabeza devolvía la página con el salto cambiado de sitio: el
 * arranque del tema, que se mete justo ahí, pasaba de ir pegado a `</style>`
 * a ir en su propia línea. Cosmético en la página, pero los validadores
 * comparan ese tramo con la plantilla carácter a carácter y CUATRO
 * comprobaciones que estaban en rojo pasaron a verde sin que nadie hubiera
 * arreglado nada. Un deshacedor que no devuelve la página exacta no deshace:
 * maquilla. */
const RASTRO_CABEZA = /<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->\r?\n?/g;
const RASTRO_CUERPO = /\r?\n?<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/g;

/** La página sin rastro del contenedor. */
function sinEtiqueta(html) {
  return String(html).replace(RASTRO_CUERPO, "").replace(RASTRO_CABEZA, "");
}

/** La página con el contenedor, una sola vez y en su sitio. */
function etiqueta(html) {
  let h = sinEtiqueta(html);
  /* Con el salto de línea de la página —las de disco son de Windows—, o el
     fichero saldría distinto en cada pasada. */
  const salto = h.includes("\r\n") ? "\r\n" : "\n";
  const enSalto = (t) => t.split("\n").join(salto);
  if (h.includes("</head>")) h = h.replace("</head>", enSalto(CABEZA) + salto + "</head>");
  h = h.replace(/<body[^>]*>/, (etiquetaBody) => etiquetaBody + salto + enSalto(CUERPO));
  return h;
}

module.exports = { ID, etiqueta, sinEtiqueta };
