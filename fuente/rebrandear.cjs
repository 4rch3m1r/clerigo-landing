/**
 * REBRANDING ARCHEMIR → CLÈRIGO sobre el landing original.
 *
 * Sólo marca, dominio y logotipo. NADA de estructura, composición, secciones,
 * animaciones ni textos que no nombren a Archemir.
 *
 * Cada sustitución se cuenta y se comprueba: si una no aparece las veces que
 * se espera, el guion falla en vez de dejar el fichero a medias.
 */
const RAIZ = require("node:path").join(__dirname, "..");
const fs = require("fs");
const path = require("path");

/**
 * EL ORIGINAL NO ESTÁ EN EL REPOSITORIO, Y ES A PROPÓSITO.
 *
 * `archemir-original.html` es el landing de Archemir con su marca, su dominio
 * y sus textos. Este repositorio es público, así que el original no viaja en
 * él: se ignora en `.gitignore` y hay que ponerlo a mano al lado de este
 * guion para poder regenerar la página.
 *
 * Sin él no se puede rehacer nada, y por eso se avisa aquí y no se revienta
 * treinta líneas más abajo con un error de lectura que no dice nada.
 */
const ORIGEN = path.join(__dirname, "archemir-original.html");
if (!fs.existsSync(ORIGEN)) {
  console.error("");
  console.error("  Falta el original de Archemir.");
  console.error("");
  console.error("  Ponlo aquí:  " + ORIGEN);
  console.error("");
  console.error("  No está en el repositorio porque es público y ese fichero");
  console.error("  lleva la marca y los textos de Archemir. Los ficheros ya");
  console.error("  generados —index.html y oscuro.html— sí están, así que sólo");
  console.error("  hace falta si quieres REHACERLOS desde cero.");
  console.error("");
  process.exit(1);
}
const DESTINO = path.join(RAIZ, "oscuro.html");
const LOGO_PNG = path.join(__dirname, "logo.png");

/* El original viene con finales de línea de Windows. Se trabaja en memoria con
   `\n` —si no, ninguna búsqueda de varias líneas encuentra nada— y se devuelve
   el CRLF al escribir, para que el fichero salga como entró. */
const CRUDO = fs.readFileSync(ORIGEN, "utf8");
const ERA_CRLF = CRUDO.includes("\r\n");
let h = CRUDO.split("\r\n").join("\n");

const logo = "data:image/png;base64," + fs.readFileSync(LOGO_PNG).toString("base64");

const parte = [];
/** Sustituye y exige un número exacto de coincidencias. */
function cambia(antes, despues, veces) {
  const trozos = h.split(antes);
  const hay = trozos.length - 1;
  if (hay !== veces) {
    throw new Error(`«${antes.slice(0, 70)}»: esperaba ${veces} y hay ${hay}`);
  }
  h = trozos.join(despues);
  parte.push(`${String(veces).padStart(3)} × ${antes.slice(0, 64).replace(/\n/g, "\\n")}`);
}

/* ── 1. Título y metadatos ──────────────────────────────────────────────── */

cambia(
  "<title>GRC Intelligence — Gobernanza, Riesgo y Cumplimiento sin complicaciones</title>",
  "<title>Clèrigo — Gobernanza, Riesgo y Cumplimiento sin complicaciones</title>\n"
  + '<meta name="description" content="Clèrigo unifica Gestión de Riesgos, Cumplimiento Legal y Regulatorio, Privacidad, Ciberseguridad, Control Interno y Auditoría en un solo entorno.">\n'
  + '<link rel="canonical" href="https://clerigo.io/">\n'
  + '<meta property="og:type" content="website">\n'
  + '<meta property="og:site_name" content="Clèrigo">\n'
  + '<meta property="og:url" content="https://clerigo.io/">\n'
  + '<meta property="og:title" content="Clèrigo — Gobernanza, Riesgo y Cumplimiento sin complicaciones">\n'
  + '<meta property="og:description" content="Clèrigo unifica Gestión de Riesgos, Cumplimiento Legal y Regulatorio, Privacidad, Ciberseguridad, Control Interno y Auditoría en un solo entorno.">\n'
  /* La tarjeta que sale al pegar el enlace en WhatsApp, LinkedIn, Slack, X o
     iMessage. Las medidas y el tipo NO son adorno: WhatsApp descarta la imagen
     si tiene que descargarla entera para averiguar cuánto mide, y con
     `og:image:width` y `og:image:height` puestos se la cree y la pinta.
     `og.png` lo dibuja fuente/hacer-og.ps1. */
  + '<meta property="og:image" content="https://clerigo.io/og.png">\n'
  + '<meta property="og:image:secure_url" content="https://clerigo.io/og.png">\n'
  + '<meta property="og:image:type" content="image/png">\n'
  + '<meta property="og:image:width" content="1200">\n'
  + '<meta property="og:image:height" content="630">\n'
  + '<meta property="og:image:alt" content="Clèrigo — Gobernanza, Riesgo y Cumplimiento sin complicaciones">\n'
  + '<meta property="og:locale" content="es_ES">\n'
  + '<meta name="twitter:card" content="summary_large_image">\n'
  + '<meta name="twitter:title" content="Clèrigo — Gobernanza, Riesgo y Cumplimiento sin complicaciones">\n'
  + '<meta name="twitter:description" content="Clèrigo unifica Gestión de Riesgos, Cumplimiento Legal y Regulatorio, Privacidad, Ciberseguridad, Control Interno y Auditoría en un solo entorno.">\n'
  + '<meta name="twitter:image" content="https://clerigo.io/og.png">\n'
  + '<meta name="twitter:image:alt" content="Clèrigo — Gobernanza, Riesgo y Cumplimiento sin complicaciones">\n'
  + '<meta name="theme-color" content="#0E0E0E">\n'
  + '<link rel="image_src" href="https://clerigo.io/og.png">\n'
  /* Para Google y LinkedIn, que leen datos estructurados además de las
     etiquetas de Open Graph. */
  + '<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite",'
  + '"name":"Clèrigo","url":"https://clerigo.io/","inLanguage":"es",'
  + '"description":"Clèrigo unifica Gestión de Riesgos, Cumplimiento Legal y Regulatorio, Privacidad, Ciberseguridad, Control Interno y Auditoría en un solo entorno.",'
  + '"publisher":{"@type":"Organization","name":"Clèrigo","url":"https://clerigo.io/",'
  + '"logo":"https://clerigo.io/favicon.png"}}</script>',
  1,
);

/* El favicon sigue apuntando a `favicon.png`, igual que en el original: sólo
   cambia el fichero, que ahora es el logotipo de Clèrigo y se escribe al lado.
   Se corrige el tamaño declarado, que decía 50x50 y el icono es de 160x160.
   Incrustarlo aquí también habría metido 97 kB de base64 repetido para nada. */
cambia(
  '<link rel="icon" type="image/png" href="favicon.png" sizes="50x50">',
  '<link rel="icon" type="image/png" href="favicon.png" sizes="160x160">',
  1,
);

/* ── 2. El logotipo, en una sola copia ──────────────────────────────────── */

/* Se declara como variable junto al resto de fichas de color, para que los
   cuatro sitios donde aparece la marca usen la misma imagen sin repetirla. */
cambia(
  "  --teal: #0D8F8F;\n}",
  `  --teal: #0D8F8F;\n  --logo: url("${logo}");\n}`,
  1,
);

/* Los tres tamaños de marca conservan su caja exacta —30, 24 y 20 píxeles— y
   su sitio. Sólo cambia lo de dentro: el cuadro rojo recortado con las letras
   «GRC» pasa a ser el logotipo de Clèrigo, que ya trae su propia esquina
   cortada y su color. */
cambia(
  `.nav-logo-mark {
  width: 30px; height: 30px;
  background: var(--red);
  clip-path: polygon(0 0, 100% 0, 100% 72%, 72% 100%, 0 100%);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.nav-logo-mark span { color: white; font-size: 10px; font-weight: 900; letter-spacing: -0.3px; }`,
  `.nav-logo-mark {
  width: 30px; height: 30px;
  background: var(--logo) center / contain no-repeat;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}`,
  1,
);

cambia(
  `.plat-logo-mark {
  width: 24px; height: 24px; background: var(--red);
  clip-path: polygon(0 0, 100% 0, 100% 72%, 72% 100%, 0 100%);
  display: flex; align-items: center; justify-content: center;
}
.plat-logo-mark span { color: white; font-size: 8px; font-weight: 900; }`,
  `.plat-logo-mark {
  width: 24px; height: 24px;
  background: var(--logo) center / contain no-repeat;
  display: flex; align-items: center; justify-content: center;
}`,
  1,
);

cambia('<div class="nav-logo-mark"><span>GRC</span></div>', '<div class="nav-logo-mark"></div>', 2);
cambia('<div class="plat-logo-mark"><span>GRC</span></div>', '<div class="plat-logo-mark"></div>', 1);

/* La marca de 20 px del boceto de producto va con estilo en línea. */
cambia(
  '<div style="width:20px;height:20px;background:var(--red);clip-path:polygon(0 0,100% 0,100% 72%,72% 100%,0 100%);display:flex;align-items:center;justify-content:center"><span style="color:white;font-size:7px;font-weight:900">GRC</span></div>',
  '<div style="width:20px;height:20px;background:var(--logo) center / contain no-repeat;display:flex;align-items:center;justify-content:center"></div>',
  1,
);

/* ── 2 bis. Fuera el emoji ──────────────────────────────────────────────────
   El distintivo llevaba un trofeo de emoji, que cada sistema pinta a su manera
   —y en Windows sale con su propio color, ajeno a la paleta—. Se cambia por un
   trofeo dibujado en SVG con el mismo oro #F5D020 que la firma de al lado.
   La caja sigue siendo de 20 px (`.award-tt-star { font-size: 20px }`), en la
   misma fila y con la misma alineación: no se mueve nada. */
cambia(
  '<div class="award-tt-star">\u{1F3C6}</div>',
  '<div class="award-tt-star"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">'
  + '<path d="M6.2 2.8h7.6v4.4a3.8 3.8 0 0 1-7.6 0V2.8Z" fill="#F5D020"/>'
  + '<path d="M6.2 4.2H4.1c-.6 0-1.1.5-1.1 1.1 0 1.7 1.3 3.1 3 3.3" fill="none" stroke="#F5D020" stroke-width="1.2" stroke-linecap="round"/>'
  + '<path d="M13.8 4.2h2.1c.6 0 1.1.5 1.1 1.1 0 1.7-1.3 3.1-3 3.3" fill="none" stroke="#F5D020" stroke-width="1.2" stroke-linecap="round"/>'
  + '<path d="M10 11v2.2" stroke="#F5D020" stroke-width="1.4" stroke-linecap="round"/>'
  + '<path d="M6.6 17.2h6.8l-.7-3.4H7.3l-.7 3.4Z" fill="#F5D020"/>'
  + "</svg></div>",
  1,
);

/* ── 2 ter. Las estrellas de la valoración, dibujadas ───────────────────────
   Las cinco estrellas de cada testimonio eran el signo tipográfico «★», que
   cada sistema dibuja con su propia fuente. Pasan a SVG.

   Medido en el navegador antes de tocarlas: la tinta del glifo ocupa 11 × 9 px,
   el hueco entre estrellas son 2 px de `gap`, y la fila mide 20,8 px de alto
   porque quien manda ahí es el interlineado (13 px × 1,6), no la estrella.

   Por eso el SVG va EN LÍNEA dentro del mismo `<span class="star">`, apoyado en
   la misma base: la caja de línea sigue midiendo 20,8 px y la fila no se mueve
   ni un píxel. Y como pinta con `currentColor`, el naranja lo sigue poniendo
   `.star { color: #F5A623 }`, que no se toca. Cero cambios de CSS. */
const ESTRELLA = '<svg width="11" height="10" viewBox="0 0 18.1 17.2" fill="currentColor" aria-hidden="true">'
  + '<path d="M9.04 0 11.17 6.56 18.08 6.56 12.49 10.62 14.62 17.19 9.04 13.13 3.46 17.19 5.59 10.62 0 6.56 6.91 6.56Z"/>'
  + "</svg>";
cambia(
  '<div class="testimonial-stars">' + '<span class="star">★</span>'.repeat(5) + "</div>",
  '<div class="testimonial-stars">' + ('<span class="star">' + ESTRELLA + "</span>").repeat(5) + "</div>",
  3,
);

/* ── 2 quater. Las flechas, dibujadas ───────────────────────────────────────
   Quedaban tres sitios con flechas de texto. Medidas en el navegador antes de
   tocarlas, para que cada SVG ocupe exactamente lo mismo que el glifo:

     · la viñeta de las listas de módulos: → de 10 × 5 px, en 60 sitios;
     · el aviso del caos: ↓ de 7 × 7 px, dos veces en una frase;
     · el enlace del banner de cookies: → de 12 × 4 px.

   Las tres pintan con el color que ya tenían —`var(--text-3)` las dos primeras,
   el del enlace la tercera— así que ninguna trae color propio: heredan. */

/** Un SVG metido en un `url()` de CSS, con lo justo escapado. */
const enUrl = (svg) => 'url("data:image/svg+xml,'
  + encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22") + '")';

/* La viñeta es un `::before`, y en `content` no cabe un SVG. Se convierte en
   una caja del tamaño exacto del glifo que se PINTA con el color de la línea
   (`currentColor`) y se RECORTA con la silueta de la flecha. Así el color sigue
   saliendo de `.module-feature { color: var(--text-3) }` y vale para los dos
   temas sin duplicar nada. Una sola regla, en vez de tocar los 60 sitios. */
const SILUETA_DERECHA = enUrl(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 5">'
  + '<path d="M0.6 2.5h7.5M6.3 0.9 8.9 2.5 6.3 4.1" fill="none" stroke="#000"'
  + ' stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
);
cambia(
  `.module-feature::before {
  content: '→'; font-size: 10px; margin-top: 2px; flex-shrink: 0;
  font-weight: 700;
}`,
  /* Se queda en las MISMAS cuatro líneas que ocupaba. No es manía: los cambios
     de color del modo claro vienen apuntados por número de línea, y si esta
     regla crece, todo lo de abajo se descoloca. */
  /* El `margin-top` pasa de 2 a 8 px, y no es un capricho: es lo que hace que
     la flecha NO se mueva. El glifo vivía en una caja de línea de 16 px con la
     base a 11, así que su tinta empezaba 6 px por debajo del borde de la caja,
     más los 2 de margen: 8 px desde arriba. La caja nueva mide 5 px justos —lo
     que medía la tinta—, así que esos 6 px de hueco hay que reponerlos en el
     margen. Medido en el navegador, no calculado a ojo. */
  `.module-feature::before {
  content: ''; font-size: 10px; margin-top: 8px; flex-shrink: 0; font-weight: 700;
  width: 10px; height: 5px; background-color: currentColor; -webkit-mask: ${SILUETA_DERECHA} center / contain no-repeat; mask: ${SILUETA_DERECHA} center / contain no-repeat;
}`,
  1,
);

/* Las dos que van dentro de una frase se apoyan en la línea base igual que se
   apoyaba el glifo: la ↓ bajaba 1 px por debajo, la → se quedaba 1 px por
   encima. De ahí los `vertical-align`. */
const FLECHA_ABAJO = '<svg width="7" height="7" viewBox="0 0 7 7" fill="none" stroke="currentColor"'
  + ' stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"'
  + ' style="vertical-align:-1px" aria-hidden="true"><path d="M3.5 0.7v5.6M1.3 4.2 3.5 6.4 5.7 4.2"/></svg>';
cambia(
  '<div class="chaos-arrow">↓ SIN INTEGRACIÓN · SIN VISIBILIDAD UNIFICADA ↓</div>',
  `<div class="chaos-arrow">${FLECHA_ABAJO} SIN INTEGRACIÓN · SIN VISIBILIDAD UNIFICADA ${FLECHA_ABAJO}</div>`,
  1,
);

const FLECHA_DERECHA = '<svg width="12" height="5" viewBox="0 0 12 5" fill="none" stroke="currentColor"'
  + ' stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"'
  + ' style="vertical-align:0.5px" aria-hidden="true"><path d="M0.6 2.5h9.5M8.1 0.9 10.9 2.5 8.1 4.1"/></svg>';
cambia("Más información →</a>", `Más información ${FLECHA_DERECHA}</a>`, 1);

/* Y la que vive dentro de un comentario del código: no se pinta nunca, pero
   así una búsqueda de flechas en el fichero sale limpia. */
cambia(
  "<!-- 07 Gobernanza & Reportes IA → ahora dividido en 07 y 08 -->",
  "<!-- 07 Gobernanza & Reportes IA -> ahora dividido en 07 y 08 -->",
  1,
);

/* ── 2 quinquies. La barra en el teléfono ───────────────────────────────────
   ESTO SÍ CAMBIA EL COMPORTAMIENTO DEL ORIGINAL, y va aparte por eso.

   En el original la barra necesita 409 px para el logotipo y las tres acciones,
   y `body` lleva `overflow-x: hidden`: por debajo de ~414 px el botón de
   «Contacto» no se puede desplazar, se CORTA. Medido: a 375 px se sale 10 px, a
   360 px se sale 25 y a 320 px se sale 64. Eso son casi todos los teléfonos.

   El arreglo es de una sola declaración y sigue la lógica que ya usa el
   original —a 768 px esconde `.nav-links`—: por debajo de 480 px se retira
   «Planes», que sigue estando en el pie bajo Producto -> Precios. Se quedan
   «login» y «Contacto», que son las dos que la gente busca. Con eso la barra
   pide 266 px y entra hasta en 320. */
/* El bloque va AL FINAL de la hoja, justo antes de cerrar el <style>, y no
   junto a las otras consultas de medios. Motivo medido: las reglas base de
   `.security-strip-inner` y `.sec-pill` están escritas MÁS ABAJO que aquellas,
   y como una consulta de medios no añade especificidad, la regla base ganaba
   y el margen de 48 px no cambiaba. Puesto al final, gana este bloque. */
cambia(
  `  .award-tooltip { left: 50%; top: 120%; transform: translateX(-50%); }
}

</style>`,
  `  .award-tooltip { left: 50%; top: 120%; transform: translateX(-50%); }
}

/* ── AJUSTES DE TELÉFONO — esto NO venía en el original ──────────────────
   Dos defectos que el original tiene y que en pantalla pequeña se ven: nada
   de esto se puede desplazar: el cuerpo de la pagina lleva overflow-x oculto,
   asi que lo que sobra no se arrastra de lado, se CORTA. */
@media (max-width: 768px) {
  /* La maqueta de navegador del hero se quedaba con su barra lateral de
     180 px y el panel se salía de la pantalla. El original ya hace justo
     esto con la maqueta hermana de la plataforma —.plat-sidebar, tres
     líneas más arriba—: a ésta se le pasó. Se le aplica su misma regla. */
  .preview-sidebar { display: none; }
  /* minmax(0,1fr) y no 1fr: con 1fr la columna no baja del ancho mínimo de su
     contenido —364 px medidos— y seguía saliéndose. */
  .preview-body { grid-template-columns: minmax(0,1fr); }
  /* Los cinco indicadores en fila pasan a tres, como ya hace el original con
     .plat-kpi-row a 1024 px. */
  .preview-kpi-row { grid-template-columns: repeat(3,1fr); }
  /* Y los tres paneles se apilan: el tercero tenía una columna fija de 140 px
     que era lo que de verdad impedía encoger la maqueta entera. */
  .preview-charts { grid-template-columns: minmax(0,1fr); }
  .preview-panel { min-width: 0; }
  /* La franja de seguridad se quedaba con los 48 px de margen del escritorio
     mientras el resto de la página baja a 20, y sus rótulos no podían partir
     de línea. Se le da el mismo margen que a .container y se les deja doblar. */
  .security-strip-inner { padding: 0 20px; }
  /* Y las píldoras llevaban flex-shrink: 0, así que tampoco encogían. */
  .sec-pill { flex-shrink: 1; min-width: 0; }
  /* La última fila del pie —copyright a un lado, Términos/Privacidad/Cookies
     al otro— es una fila que no doblaba y se salía 21 px. */
  .footer-bottom { flex-wrap: wrap; row-gap: 10px; }
  .footer-bottom > div { flex-wrap: wrap; }
  /* Los cuatro pasos se quedaban en dos columnas hasta el final. El original
     ya apila aquí .modules-grid y .testimonials-grid; a ésta se le pasó. */
  .steps-grid { grid-template-columns: minmax(0,1fr); }

  /* ── Las medallas y los sellos, en fila y abajo ──────────────────────────
     En un móvil el hero medía 1.743 px y 1.048 eran medallas y sellos
     apilados en vertical: el 60% de la pantalla antes de llegar al titular.
     Ahora el titular va primero y las dos piezas bajan, cada una con su
     contenido en fila. */
  .hero-inner > .hero-text  { order: 1; }
  .hero-inner > .hero-award { order: 2; }
  .hero-inner > .cert-panel { order: 3; }

  /* Las dos medallas, una al lado de la otra. Va con rejilla y no con «row»
     porque la primera medalla son CUATRO hermanos sueltos —cinta, disco,
     colas y firma— y la segunda es un bloque solo: se manda la primera a la
     columna izquierda y la segunda a la derecha ocupando las cuatro filas. */
  .hero-award {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: start;
    justify-items: center;
    column-gap: 10px;
    margin-right: 0;
    margin-bottom: 28px;
  }
  .hero-award > :not(.award-ipexpert) { grid-column: 1; }
  /* El «!important» es contra un estilo EN LÍNEA de 28 px que separaba una
     medalla de la otra cuando iban en vertical. En fila sobra. */
  .award-ipexpert { grid-column: 2; grid-row: 1 / span 4; margin-top: 0 !important; }

  /* Y los sellos, en rejilla de dos por dos ─────────────────────────────
     Lo mismo que las medallas, y por lo mismo. Apilados en vertical el panel
     medía 592 px de alto en una pantalla de 844: él solo se comía el 70% del
     teléfono antes de llegar a nada. En dos filas de dos baja a la mitad.
     Las rayas de separación sobran cuando ya no hay una columna que cortar. */
  .cert-panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-items: center;
    align-items: start;
    width: auto;
    max-width: 320px;
    margin-left: 0;
    row-gap: 18px;
  }
  .cert-panel-label { grid-column: 1 / -1; }
  .cert-divider { display: none; }


}
@media (max-width: 480px) {
  /* Las tres acciones de la barra no caben y «Contacto» se cortaba: a 375 px
     se salía 10, a 360 px 25 y a 320 px 64. Se retira «Planes», que sigue en
     el pie bajo Producto -> Precios; «login» y «Contacto» se quedan. */
  .nav-cta .btn-ghost + .btn-ghost { display: none; }
}
@media (max-width: 340px) {
  /* Sólo en pantallas diminutas. A 360 y 375 la barra pide 342 y cabe con el
     sufijo puesto; a 320 no, y ahí sí se aprieta el espaciado y se retira el
     «XGRC» del rótulo. El logotipo y el nombre siguen estando. */
  .nav-cta { gap: 6px; }
  .btn-ghost, .btn-primary { padding: 7px 10px; }
  .nav-logo-text small { display: none; }
}

</style>`,
  1,
);

/* ── 2 sexies. La barra de arriba y el pie, en oscuro ───────────────────────
   Pedido a mano: en la versión clara, la franja de navegación y el pie van en
   oscuro, enmarcando la página blanca.

   Se hace redeclarando las FICHAS de color dentro de `nav` y `footer`. Como
   las variables de CSS se heredan, todo lo que vive ahí dentro —rótulos,
   enlaces, bordes, iconos, botones fantasma— coge la paleta oscura solo. Una
   regla en vez de repintar veinte piezas, y sin tocar el marcado.

   Va en los DOS ficheros con los mismos bytes: en el oscuro son los valores
   que ya tenía, así que ahí no cambia nada, y los dos siguen siendo la misma
   página. Al final de la hoja, porque una consulta de medios no añade
   especificidad y las reglas base están escritas más abajo. */
cambia(
  "  .nav-logo-text small { display: none; }\n}\n\n</style>",
  `  .nav-logo-text small { display: none; }
}

/* ── BARRA Y PIE SIEMPRE EN OSCURO ─────────────────────────────────────── */
nav, footer {
  --dark: #0E0E0E;
  --dark-2: #141414;
  --dark-3: #1B1B1B;
  --dark-4: #222222;
  --border: rgba(255,255,255,0.08);
  --border-light: rgba(255,255,255,0.12);
  --text: #F0F0F0;
  --text-2: rgba(240,240,240,0.65);
  --text-3: rgba(240,240,240,0.35);
}
nav { background: rgba(14,14,14,0.85); }
footer { background: #0E0E0E; }
/* Los cuadros de los iconos sociales se quedaron con el relleno y el borde del
   modo claro —negro al 4% y al 12%— y el pie es #0E0E0E: negro sobre negro. El
   cuadro no se veía, sólo el dibujo flotando, y el de X, que trae su propia
   tarjeta negra, casi tampoco. Aquí llevan la misma alfa pero en blanco. */
footer .social-icon { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); }
footer .social-icon:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.24); }
/* ── FIN DE LA BARRA Y EL PIE EN OSCURO ────────────────────────────────── */

</style>`,
  1,
);

/* ── 2 septies. El panel del hero: los mismos sellos, otro rótulo ──────────
   ESTO CAMBIA UN TEXTO DEL ORIGINAL, y va aparte por eso.

   El panel se titulaba «Nuestras Certificaciones» y traía cuatro sellos: ISO
   27001, NIST CSF, SOC 2 Type II e ISO 22301.

   El problema nunca fueron los sellos: era el rótulo. Son marcos que la
   plataforma cubre y estándares que cumple la infraestructura donde vive, no
   papeles que Clèrigo tenga colgados. Así que cambia el rótulo y los sellos se
   quedan:

     «Nuestras Certificaciones»
        →  «ECOSISTEMA DE NIVEL ENTERPRISE»
           «Alojada en datacenters bajo estándares internacionales»

   La segunda línea es la única frase AÑADIDA a la portada, y por eso está
   declarada en `validar.cjs`: sin declararla, la comprobación de que las tres
   versiones dicen lo mismo dejaría de cuadrar. */
cambia(
  '      <div class="cert-panel-label">Nuestras Certificaciones</div>',
  '      <div class="cert-panel-label">ECOSISTEMA DE NIVEL ENTERPRISE'
    + '<span class="cert-panel-sub">Alojada en datacenters bajo estándares internacionales</span></div>',
  1,
);

/* El estilo de esa segunda línea: la única regla de CSS que se añade aquí.
   Cuelga DENTRO del rótulo —comparte su raya de abajo— para que las dos líneas
   se lean como un bloque y no como dos rótulos pegados. */
cambia(
  `.cert-logo-item {`,
  `.cert-panel-sub {
  display: block;
  font-size: 7.5px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: none;
  line-height: 1.35;
  margin-top: 5px;
  color: rgba(240,240,240,0.38);
}
.cert-logo-item {`,
  1,
);


/* ── 3. El nombre de la marca ───────────────────────────────────────────── */

/* El rótulo de la barra: mismo hueco, mismo `<small>` colgando detrás. */
cambia(
  '<span class="nav-logo-text">GRC Intelligence <small>Platform</small></span>',
  '<span class="nav-logo-text">Clèrigo <small>XGRC</small></span>',
  1,
);
cambia("GRC Intelligence Platform — Centro de Comando", "Clèrigo XGRC — Centro de Comando", 1);
cambia("grc-intelligence.app", "clerigo.io", 1);

/* Lo que queda de «GRC Intelligence» es el nombre a secas. Ojo: «GRC» solo
   —«la gestión GRC», «Score GRC», «Módulos GRC»— es la categoría, no la
   marca, y no se toca. */
cambia("GRC Intelligence", "Clèrigo", 7);
cambia("Axioma GRC", "Clèrigo", 2);

/* ── 4. El dominio ──────────────────────────────────────────────────────── */

/* El botón «login» apuntaba a truestoneadvisory.com, que no es Archemir pero
   tampoco es Clèrigo. Va a la aplicación. */
cambia('href="https://truestoneadvisory.com/login"', 'href="https://app.clerigo.io"', 1);

cambia("https://portal.archemir.com", "https://portal.clerigo.io", 1);
cambia('href="archemir.com"', 'href="https://clerigo.io"', 1);
cambia("https://archemir.com", "https://clerigo.io", 19);

/* ── 4b. Los enlaces al resto del sitio ─────────────────────────────────── */

/* La portada ya traía los enlaces a las cinco páginas interiores, apuntando a
   rutas de un dominio que todavía no existe. Ahora esas páginas están aquí al
   lado, así que apuntan al fichero.
 *
 * No se añade NI UN enlace: son los mismos que había, con otro destino. Por eso
 * la cuenta de enlaces de la página no cambia, y la comprobación que la vigila
 * sigue valiendo.
 *
 * Relativos y no absolutos a propósito: así el sitio funciona en GitHub Pages,
 * en cualquier hosting y abriendo el fichero con doble clic, sin depender de
 * que clerigo.io esté ya levantado. La canónica y las etiquetas de Open Graph
 * sí se quedan absolutas, que para eso están. */
cambia('href="https://clerigo.io/marcos"', 'href="marcos.html"', 6);
cambia('href="https://clerigo.io/legal"', 'href="legal.html"', 5);
cambia('href="https://clerigo.io/precios"', 'href="precios.html"', 3);
cambia('href="https://clerigo.io/prospectos/"', 'href="contacto.html"', 2);
cambia('href="https://clerigo.io/prospectos"', 'href="contacto.html"', 1);
cambia('href="https://portal.clerigo.io"', 'href="partners.html"', 1);
cambia('href="https://clerigo.io"', 'href="index.html"', 2);

/* Y lo que NO cambia, para que se vea que es a propósito:
     https://clerigo.io/            la canónica y las og:url — absolutas
     https://clerigo.io/academia    no hay página de academia todavía
     https://app.clerigo.io         la aplicación, que es otro sitio */

/* ── 4b-bis. El Centro de Confianza ─────────────────────────────────────── */

/* El ÚNICO enlace que se le añade a la página. Todos los demás ya estaban y
 * sólo cambiaron de destino.
 *
 * Va en la fila legal del pie, al lado de Términos y Privacidad, porque es ahí
 * donde lo busca quien tiene que aprobar la compra: el comité de seguridad del
 * cliente. Es la página que dice dónde viven sus datos y quién responde. */
cambia(
  '      <a href="legal.html">Términos de uso</a>',
  '      <a href="confianza.html">Centro de Confianza</a>\n'
  + '      <a href="legal.html">Términos de uso</a>',
  1,
);

/* ── 4b-ter. La tira de integraciones ───────────────────────────────────── */

/* El camino de integraciones que fijó el dueño el 2026-09-06. Sale ServiceNow y
 * entran siete: ServiceDesk Plus, Teams, Vicarius, Tenable Nessus, NexPose,
 * Defender y Meet. Catorce en total.
 *
 * Los distintivos se dibujan como el original dibujaba el de ServiceNow: la
 * forma de la marca, su color y sus iniciales. No son los logotipos oficiales
 * ni pretenden serlo. */
const CHAPA = (titulo, nombre, color, iniciales, redondo) => `
      <div class="int-logo" title="${titulo}">
        <svg width="20" height="20" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          ${redondo
    ? `<circle cx="30" cy="30" r="30" fill="${color}"/>`
    : `<rect x="0" y="0" width="60" height="60" rx="12" fill="${color}"/>`}
          <text x="30" y="38" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="${iniciales.length > 2 ? 16 : 20}" fill="white">${iniciales}</text>
        </svg>
        <span class="int-logo-name">${nombre}</span>
      </div>`;

/* ServiceNow deja su sitio a ServiceDesk Plus. */
cambia(
  `      <!-- ServiceNow -->
      <div class="int-logo" title="ServiceNow">
        <svg width="20" height="20" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          <circle cx="30" cy="30" r="30" fill="#62D84E"/>
          <text x="30" y="37" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="18" fill="white">SN</text>
        </svg>
        <span class="int-logo-name">ServiceNow</span>
      </div>`,
  `      <!-- ServiceDesk Plus -->${CHAPA("ServiceDesk Plus — ManageEngine", "ServiceDesk Plus", "#F58220", "SD", false)}`,
  1,
);

/* Los distintivos de Microsoft y Google van dibujados con su forma y sus
 * colores de marca, como los que ya traía el original. Los otros cuatro
 * —Vicarius, Tenable, Rapid7 y ManageEngine— llevan de momento una chapa con
 * sus iniciales: no tengo su trazado oficial y dibujarlo de memoria saldría
 * parecido pero mal, que en un logotipo es lo mismo que mal. */
const LOGOS = {
  teams: `<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fill="#5059C9" d="M16.8 8.5h5.1c.6 0 1.1.5 1.1 1.1v4.7a3.6 3.6 0 0 1-3.6 3.6h-.1a3.6 3.6 0 0 1-3.6-3.6V9.1c0-.3.3-.6.6-.6z"/>
          <circle fill="#5059C9" cx="19.4" cy="5.3" r="2.2"/>
          <circle fill="#7B83EB" cx="12.4" cy="4.7" r="2.8"/>
          <path fill="#7B83EB" d="M15.9 8.5H8.2c-.6 0-1.1.5-1.1 1.1v5.6a5 5 0 0 0 5 5 5 5 0 0 0 5-5V9.6c0-.6-.5-1.1-1.2-1.1z"/>
          <rect fill="#4B53BC" x="2" y="7.3" width="10.4" height="10.4" rx="1.2"/>
          <text x="7.2" y="15" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="8" fill="white">T</text>
        </svg>`,
  defender: `<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fill="#0F6CBD" d="M12 1.8 3.6 5v6.2c0 5.2 3.5 8.9 8.4 10.4V1.8z"/>
          <path fill="#50E6FF" d="M12 1.8 20.4 5v6.2c0 5.2-3.5 8.9-8.4 10.4V1.8z"/>
        </svg>`,
  meet: `<svg width="22" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fill="#00832D" d="M15.5 12 22 7.3v9.4z"/>
          <path fill="#0066DA" d="M3.6 5.6h9.7c1.2 0 2.2 1 2.2 2.2v8.4c0 1.2-1 2.2-2.2 2.2H3.6z"/>
          <path fill="#E94235" d="M3.6 5.6 1 8.2v2.3l2.6-2.6z"/>
          <path fill="#FFBA00" d="M3.6 18.4 1 15.8v-2.3l2.6 2.6z"/>
          <path fill="#2684FC" d="M1 8.2h2.6v7.6H1z"/>
        </svg>`,
};

/* Y las seis que faltan, al final de la tira. */
{
  const marca = "        <span class=\"int-logo-name\">Azure</span>\n      </div>";
  const conLogo = (titulo, nombre, svg) => `
      <div class="int-logo" title="${titulo}">
        ${svg}
        <span class="int-logo-name">${nombre}</span>
      </div>`;
  const nuevas = [
    ["Microsoft Teams", "Microsoft Teams", LOGOS.teams],
    ["Microsoft Defender", "Microsoft Defender", LOGOS.defender],
    ["Google Meet", "Google Meet", LOGOS.meet],
  ].map(([t, n, svg]) => `\n\n      <!-- ${n} -->${conLogo(t, n, svg)}`).join("")
    + [
      ["Vicarius", "Vicarius", "#6C4BF4", "V", false],
      ["Tenable Nessus", "Tenable Nessus", "#0B7285", "N", true],
      ["NexPose — Rapid7", "NexPose", "#F03C21", "R7", true],
    ].map(([t, n, c, i, r]) => `\n\n      <!-- ${n} -->${CHAPA(t, n, c, i, r)}`).join("");
  const donde = h.indexOf(marca);
  if (donde < 0) throw new Error("no encuentro el final de la tira de integraciones");
  h = h.slice(0, donde + marca.length) + nuevas + h.slice(donde + marca.length);
  parte.push("  · 6 integraciones más en la tira (14 en total)");
}

/* Y que se vean. Estaban al 55% de opacidad, como fantasmas; ahora son fichas
   con su borde, a color entero. Va dentro del tramo de añadidos. */
cambia(
  "/* ── BARRA Y PIE SIEMPRE EN OSCURO ──",
  `/* ── LA TIRA DE INTEGRACIONES, VISIBLE ──────────────────────────────────── */
.integrations-bar { padding: 80px 0 8px; }
.integrations-bar-label {
  font-size: 11px; letter-spacing: 2.2px; color: var(--text-2); margin-bottom: 30px;
}
.integrations-logos { gap: 12px; max-width: 1020px; margin: 0 auto; }
.int-logo {
  opacity: 1;
  background: var(--dark-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 11px 16px;
  transition: border-color 0.18s, transform 0.18s, box-shadow 0.18s;
}
.int-logo:hover {
  opacity: 1;
  border-color: var(--border-light);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(14,14,14,0.07);
}
.int-logo-name { font-size: 13px; color: var(--text); }

/* ── BARRA Y PIE SIEMPRE EN OSCURO ──`,
  1,
);

/* ── 4b-quater. ISO 42001 ───────────────────────────────────────────────── */

/* La norma de sistemas de gestión de inteligencia artificial. Entra en la
 * rejilla de marcos compatibles, con el mismo sello que las demás ISO: el aro
 * doble, la retícula del globo y el texto en arco.
 *
 * Va la última de las ISO, justo antes de la ficha de «y más marcos», porque es
 * la más nueva —2023— y así se lee como lo último que se ha añadido. */
cambia(
  "      <!-- ── Entre Otros ── -->",
  `      <!-- ── ISO 42001 ── -->
      <div class="fw-logo-card reveal reveal-4">
        <svg width="64" height="64" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="96" fill="none" stroke="#5B21B6" stroke-width="6"/>
          <circle cx="100" cy="100" r="84" fill="none" stroke="#5B21B6" stroke-width="1.5"/>
          <circle cx="100" cy="100" r="82" fill="#5B21B6" opacity="0.08"/>
          <circle cx="100" cy="100" r="55" fill="none" stroke="rgba(91,33,182,0.3)" stroke-width="1.2"/>
          <ellipse cx="100" cy="100" rx="30" ry="55" fill="none" stroke="rgba(91,33,182,0.3)" stroke-width="1.2"/>
          <line x1="45" y1="100" x2="155" y2="100" stroke="rgba(91,33,182,0.3)" stroke-width="1.2"/>
          <line x1="100" y1="45" x2="100" y2="155" stroke="rgba(91,33,182,0.3)" stroke-width="1.2"/>
          <text x="100" y="97" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="38" fill="white" letter-spacing="-1">ISO</text>
          <text x="100" y="128" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="20" fill="#5B21B6" letter-spacing="0.5">42001</text>
          <path id="g8-top" d="M 22,100 A 78,78 0 0,1 178,100" fill="none"/>
          <text font-family="Arial,sans-serif" font-size="10" font-weight="700" fill="#5B21B6" letter-spacing="0.5">
            <textPath href="#g8-top" startOffset="14%">Artificial Intelligence</textPath>
          </text>
          <path id="g8-bot" d="M 45,132 A 65,65 0 0,0 155,132" fill="none"/>
          <text font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#5B21B6" letter-spacing="1.5">
            <textPath href="#g8-bot" startOffset="12%">Management</textPath>
          </text>
        </svg>
        <span class="fw-logo-label">ISO 42001</span>
      </div>

      <!-- ── Entre Otros ── -->`,
  1,
);

/* ── 4c. Dónde vive el sitio ────────────────────────────────────────────── */

/* Las direcciones ABSOLUTAS de la cabecera —la canónica, og:url, og:image,
 * twitter:image y la ficha de datos estructurados— salen de fuente/sitio.json,
 * no de aquí. Ahora mismo apuntan a GitHub Pages y es provisional: clerigo.io
 * contesta a cualquier ruta con una copia vieja de la portada, así que la
 * tarjeta que pide WhatsApp le llega como página web y no se pinta nada.
 *
 * El cambio se hace SÓLO sobre la cabecera. En el cuerpo hay dos enlaces a
 * clerigo.io que no son el sitio y no se tocan: la academia, que no existe
 * todavía, y app.clerigo.io, que es la aplicación y vive en otro sitio.
 *
 * Cuando clerigo.io sirva estos ficheros, se pone «base» en sitio.json y esto
 * se vuelve una operación que no cambia nada. */
{
  const SITIO = JSON.parse(require("node:fs").readFileSync(
    require("node:path").join(__dirname, "sitio.json"), "utf8"));
  const fin = h.indexOf("</head>");
  if (fin < 0) throw new Error("no encuentro el cierre de la cabecera");
  const cabeza = h.slice(0, fin).split("https://clerigo.io/").join(SITIO.base + "/");
  h = cabeza + h.slice(fin);
  parte.push(`  · direcciones absolutas de la cabecera -> ${SITIO.base}`);
}

/* ── 4d. Las fotos del sistema ──────────────────────────────────────────── */

/* El original dibujaba el producto con CSS: dos maquetas de un panel que no
 * existe, 249 líneas entre las dos. Ahora van fotos del sistema de verdad,
 * tomadas del inquilino de demostración.
 *
 * Se cambia SÓLO lo de dentro. El marco de ventana —los tres puntos de colores
 * y el rótulo— se queda: es lo que hace que la foto se lea como una pantalla y
 * no como una imagen pegada. Y así el cambio es el mínimo que hace el trabajo.
 *
 * Es lo segundo que se le quita al original, después del panel de
 * certificaciones, y por eso está declarado en `validar.cjs`: sin declararlo,
 * la comprobación de «esto sale del original» dejaría de valer. */
function cambiaBloque(marca, dentro, nombre) {
  const li = h.split("\n");
  const ini = li.findIndex((l) => l.includes(marca));
  if (ini < 0) throw new Error(`no encuentro «${marca}» para ${nombre}`);
  let prof = 0;
  let fin = -1;
  for (let i = ini; i < li.length; i++) {
    prof += (li[i].match(/<div\b/g) || []).length;
    prof -= (li[i].match(/<\/div>/g) || []).length;
    if (prof === 0) { fin = i; break; }
  }
  if (fin < 0) throw new Error(`«${marca}» no cierra`);
  const sangria = li[ini].match(/^\s*/)[0];
  li.splice(ini, fin - ini + 1, ...dentro.split("\n").map((l) => (l ? sangria + l : l)));
  h = li.join("\n");
  parte.push(`${String(fin - ini + 1).padStart(3)} × líneas de dibujo → foto (${nombre})`);
}

cambiaBloque(
  '<div class="preview-body">',
  '<img class="foto-sistema" src="sistema/sistema-panel.png" width="1600" height="1000"\n'
  + '     alt="Resumen General de Clèrigo: índice de cumplimiento, riesgos de terceros, controles ERM, plan de auditoría y hallazgos críticos.">',
  "la ventana del encabezado",
);
cambiaBloque(
  '<div class="platform-body">',
  '<img class="foto-sistema" src="sistema/sistema-panel.png" width="1600" height="1000"\n'
  + '     alt="Centro de Comando de Clèrigo con los indicadores de las cinco áreas y el radar de conocimiento.">',
  "el panel de la sección Plataforma",
);

/* Y las otras cinco pantallas, debajo del panel. Esto SÍ es nuevo: no sale del
 * original. Van con `loading="lazy"` porque pesan 1,4 MB entre las cinco y
 * nadie las ve hasta bajar. */
const GALERIA = `
      <div class="galeria-sistema">
        <figure><img src="sistema/sistema-riesgos.png" width="1600" height="1000" loading="lazy" alt="Gestión de Riesgos: madurez ERM, riesgo inherente frente a residual y mapa de calor."><figcaption>Riesgos</figcaption></figure>
        <figure><img src="sistema/sistema-cumplimiento.png" width="1600" height="1000" loading="lazy" alt="Cumplimiento Regulatorio: estado por marco y requisitos."><figcaption>Cumplimiento</figcaption></figure>
        <figure><img src="sistema/sistema-auditoria.png" width="1600" height="1000" loading="lazy" alt="Gestión de Auditorías: plan anual, hallazgos y seguimiento."><figcaption>Auditoría</figcaption></figure>
        <figure><img src="sistema/sistema-activos.png" width="1600" height="1000" loading="lazy" alt="Inventario de activos tecnológicos con su clasificación."><figcaption>Activos</figcaption></figure>
        <figure><img src="sistema/sistema-terceros.png" width="1600" height="1000" loading="lazy" alt="Evaluación de riesgos de terceros y estado de las contrapartes."><figcaption>Terceros</figcaption></figure>
      </div>`;
{
  const cierre = "\n    </div>\n";
  const i = h.indexOf('<div class="platform-frame');
  const j = h.indexOf(cierre, h.indexOf("foto-sistema", i));
  if (j < 0) throw new Error("no encuentro dónde acaba el marco de la plataforma");
  h = h.slice(0, j + cierre.length) + GALERIA + "\n" + h.slice(j + cierre.length);
  parte.push("  · galería de 5 pantallas añadida bajo el panel");
}

/* El CSS de las fotos va DENTRO del tramo de añadidos, entre el rótulo de los
   ajustes de teléfono y el del pie oscuro: así la comprobación lo recorta con
   el resto de lo añadido y no hace falta declararlo aparte. */
cambia(
  "/* ── BARRA Y PIE SIEMPRE EN OSCURO ──",
  `/* ── LAS FOTOS DEL SISTEMA ─────────────────────────────────────────────── */
.foto-sistema { display: block; width: 100%; height: auto; }
.galeria-sistema {
  display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px;
  max-width: 1160px; margin: 24px auto 0; padding: 0 48px;
}
.galeria-sistema figure { margin: 0; }
.galeria-sistema img {
  width: 100%; height: auto; display: block;
  border: 1px solid var(--border); border-radius: 6px;
}
.galeria-sistema figcaption {
  font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
  color: var(--text-3); margin-top: 10px; text-align: center;
}
@media (max-width: 900px) { .galeria-sistema { grid-template-columns: repeat(2, minmax(0,1fr)); padding: 0 20px; } }
@media (max-width: 520px) { .galeria-sistema { grid-template-columns: minmax(0,1fr); } }

/* ── BARRA Y PIE SIEMPRE EN OSCURO ──`,
  1,
);

/* ── 5. Comprobación ────────────────────────────────────────────────────── */

const restos = h.match(/archemir/gi) || [];
if (restos.length) throw new Error(`quedan ${restos.length} rastros de Archemir`);
if (/GRC Intelligence|Axioma GRC|grc-intelligence/i.test(h)) throw new Error("queda el nombre viejo");
if (/truestoneadvisory/i.test(h)) throw new Error("queda un enlace a truestoneadvisory");
/* Pictogramas de color. Las flechas → ↓ y la estrella ★ de la valoración NO
   entran: son signos tipográficos que se pintan con la fuente del texto, no
   emojis de color, y la estrella es la propia valoración de los testimonios. */
/* Pictogramas: emojis, estrellas y flechas. Todos son SVG ahora. Se busca
   sobre el fichero SIN los `url(data:…)`, porque dentro de un SVG escapado
   pueden aparecer secuencias que se parezcan. */
const sinDatos = h.replace(/data:image\/svg\+xml,[^"')]+/g, "").replace(/data:image\/png;base64,[A-Za-z0-9+/=]+/g, "");
const pictogramas = sinDatos.match(/[\u{1F000}-\u{1FAFF}\u{2605}\u{2606}\u{2190}-\u{21FF}\u{2794}-\u{27BF}\u{2B00}-\u{2BFF}]/gu) || [];
if (pictogramas.length) throw new Error(`quedan ${pictogramas.length} pictogramas: ${[...new Set(pictogramas)].join(" ")}`);

fs.writeFileSync(DESTINO, ERA_CRLF ? h.split("\n").join("\r\n") : h);
fs.copyFileSync(LOGO_PNG, path.join(RAIZ, "favicon.png"));

console.log(parte.join("\n"));
console.log("\nescrito:", DESTINO, "|", h.length, "bytes |", h.split("\n").length, "lineas");
console.log("favicon:", path.join(RAIZ, "favicon.png"));
