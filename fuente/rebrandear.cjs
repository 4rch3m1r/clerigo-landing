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

</style>`,
  1,
);

/* ── 2 septies. Fuera el panel de certificaciones ───────────────────────────
   ESTO QUITA CONTENIDO DEL ORIGINAL, y va aparte por eso.

   El panel se titulaba «Nuestras Certificaciones» y traía cuatro sellos: ISO
   27001 y ISO 22301 con la palabra «Certified» dentro del dibujo, SOC 2 con
   «TYPE II · CERTIFIED», y NIST CSF.

   Ninguno es una certificación que Clèrigo tenga: son marcos que la plataforma
   CUBRE. Publicar lo uno como lo otro, en un producto de cumplimiento, es la
   clase de afirmación que mira precisamente quien compra cumplimiento. Y la
   página está en internet.

   Se quita el bloque entero —rótulo y sellos—, no sólo los que dicen
   «Certified»: el problema es el título, que afirma tener certificaciones.

   Se localiza contando etiquetas, no por número de línea: así sigue valiendo
   si el original cambia de sitio. */
{
  const MARCA = '<div class="cert-panel';
  const li = h.split("\n");
  const ini = li.findIndex((l) => l.includes(MARCA));
  if (ini < 0) throw new Error("no encuentro el panel de certificaciones");

  /* Se baja contando `<div>` que abren y `</div>` que cierran hasta volver a
     cero: ahí acaba el bloque, sin depender de cómo esté sangrado. */
  let prof = 0;
  let fin = -1;
  for (let i = ini; i < li.length; i++) {
    prof += (li[i].match(/<div\b/g) || []).length;
    prof -= (li[i].match(/<\/div>/g) || []).length;
    if (prof === 0) { fin = i; break; }
  }
  if (fin < 0) throw new Error("el panel de certificaciones no cierra");

  /* El comentario que lo anuncia se va con él. */
  const desde = li[ini - 1].includes("CERT LOGOS PANEL") ? ini - 1 : ini;
  const cuantas = fin - desde + 1;
  li.splice(desde, cuantas);
  h = li.join("\n");
  parte.push(`${String(cuantas).padStart(3)} × líneas del panel de certificaciones (fuera)`);

  if (h.includes(MARCA)) throw new Error("queda algún panel de certificaciones");
}

/* Con el panel fuera, la regla de teléfono que lo colocaba sobra. Esto va
   ANTES de barrer el CSS, porque el barrido comprueba al final que no quede
   ni una mención del panel — y esta regla es una. */
cambia(
  `  .hero-inner > .hero-text  { order: 1; }
  .hero-inner > .hero-award { order: 2; }
  .hero-inner > .cert-panel { order: 3; }`,
  `  .hero-inner > .hero-text  { order: 1; }
  .hero-inner > .hero-award { order: 2; }`,
  1,
);

/* Y su CSS es código muerto: cincuenta y pico líneas de estilos para algo que
   ya no existe. Se van también, que un repositorio que otro vaya a leer no
   debe dejar preguntas sin respuesta. */
{
  const desde = h.indexOf("/* ── CERT LOGOS PANEL (static, in hero) ── */");
  const hasta = h.indexOf("/* ── SECURITY TRUST STRIP ── */");
  if (desde < 0 || hasta < 0 || hasta < desde) throw new Error("no acoto el CSS del panel de certificaciones");
  const cuantas = h.slice(desde, hasta).split("\n").length - 1;
  h = h.slice(0, desde) + h.slice(hasta);
  parte.push(`${String(cuantas).padStart(3)} × líneas de CSS del panel (fuera)`);
  for (const resto of [".cert-panel", ".cert-logo-item", ".cert-divider", ".cert-logo-name"]) {
    if (h.includes(resto)) throw new Error(`queda CSS de ${resto}`);
  }
}

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
