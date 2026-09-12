/**
 * El selector de idioma, y las etiquetas que le dicen a Google que hay dos
 * versiones de la misma página.
 *
 * Se pone en las DOS versiones, con el mismo marcado y el mismo estilo. Lo
 * único que cambia entre una y otra son los enlaces —el inglés apunta a
 * `es/loquesea.html` y el castellano a `../loquesea.html`— y eso está
 * declarado en `validar.cjs` de esta carpeta, que además comprueba que los dos
 * lleven al mismo sitio.
 *
 * POR QUÉ RELATIVOS Y NO `/` Y `/es/`. Con rutas absolutas el marcado sería
 * idéntico y no habría nada que declarar, pero hoy el sitio no vive en la raíz
 * de su dominio: `sitio.json` apunta a github.io/clerigo-landing mientras
 * clerigo.io sirve una copia vieja. Con `/es/` el selector llevaría a la raíz
 * de github.io, que no es este sitio. Relativos funcionan en los dos sitios y
 * también abriendo el fichero a mano.
 *
 * CUÁL ESTÁ ACTIVO lo decide el CSS mirando `<html lang>`, no una clase puesta
 * a mano. Así el marcado no se separa entre versiones por el estado.
 */

/** El bloque, con los enlaces que correspondan. */
function bloque(idioma, ficheroEn, ficheroEs) {
  /* DOS NOMBRES, UNO POR IDIOMA, y no uno solo para los dos.
     Tres páginas no se llaman igual en cada idioma: `marcos.html` es
     `frameworks.html`, `confianza.html` es `trustcenter.html` y
     `contacto.html` es `contact.html`. Con un solo nombre, el enlace «EN» de
     la página castellana apuntaba a `../marcos.html`, que es una redirección
     301 a `/frameworks`: funcionaba de milagro y sólo porque esa redirección
     existe. Y el día que se quitara, dejaba de funcionar sin que nadie lo
     tocara. */
  const en = ficheroEn || "index.html";
  const es = ficheroEs || ficheroEn || "index.html";
  const aIngles = idioma === "en" ? en : "../" + en;
  const aCastellano = idioma === "en" ? "es/" + es : es;
  return '<div class="idiomas">'
    + '<a href="' + aIngles + '" class="idioma" data-idioma="en" hreflang="en">EN</a>'
    + '<a href="' + aCastellano + '" class="idioma" data-idioma="es" hreflang="es">ES</a>'
    + "</div>";
}

/* El estilo. Va IGUAL en las dos versiones: el activo sale del `lang` del
   documento, no de una clase. */
const ESTILO = [
  "/* ── EL SELECTOR DE IDIOMA ─────────────────────────────────────────────",
  "   Cuál está activo lo dice el `lang` del documento y no una clase escrita a",
  "   mano: así el marcado es el mismo en las dos versiones y lo único que",
  "   cambia entre ellas son los dos enlaces. */",
  ".idiomas { display: flex; align-items: center; gap: 2px; margin-right: 4px; }",
  ".idiomas .idioma {",
  "  font-size: 11px; font-weight: 700; letter-spacing: .6px;",
  "  color: var(--text-3); padding: 5px 7px; border-radius: 5px;",
  "  transition: color .2s, background .2s;",
  "}",
  ".idiomas .idioma:hover { color: var(--text-2); }",
  'html[lang="en"] .idioma[data-idioma="en"],',
  'html[lang="es"] .idioma[data-idioma="es"] { color: var(--text); background: var(--dark-3); }',
  "@media (max-width: 768px) { .idiomas { display: none; } }",
  /* Cierra con un rótulo propio y no con su última regla. El validador aplana
     cada bloque `{ … }` a una línea antes de comparar, así que anclar el final
     en «background: var(--dark-3); }» no casaba —quedaba «…;}», sin el
     espacio— y el bloque entero se colaba en la comparación. Es la misma
     lección que el tramo «BARRA Y PIE SIEMPRE EN OSCURO». */
  "/* ── FIN DEL SELECTOR DE IDIOMA ── */",
].join("\n");

/**
 * Mete el selector en la barra y su estilo en la hoja.
 *
 * Se ancla al enlace de acceso, que es la primera cosa de la zona de acciones
 * y está en las siete páginas.
 */
/**
 * El estilo del selector, justo antes de que cierre la hoja.
 *
 * Si ya hay uno, se SUSTITUYE entero: ni se conserva ni se añade otro. Una
 * versión anterior se lo saltaba al encontrarlo, y entonces un cambio en el
 * estilo no llegaba nunca a las páginas ya generadas — había que borrarlas a
 * mano para verlo. Sustituir es lo único que se comporta igual la primera vez
 * y la décima.
 *
 * El bloque se acota entre sus dos rótulos y no por su última regla: el
 * validador aplana cada `{ … }` a una línea antes de comparar, así que anclar
 * el final en una declaración concreta deja de casar en cuanto cambia un
 * espacio. Misma lección que el tramo «BARRA Y PIE SIEMPRE EN OSCURO».
 */
/**
 * El bloque de estilo ya puesto, para quitarlo antes de poner el nuevo.
 *
 * DOS DETALLES QUE FALTABAN Y COSTARON CARO:
 *
 *   · `\r?\n`, porque las páginas van en CRLF. Pidiendo un salto de línea a
 *     secas detrás del cierre de comentario, la limpieza no casaba y cada
 *     pasada del generador dejaba OTRA copia del bloque. `precios.html` llegó
 *     a tener cuatro, y así se publicó.
 *
 *   · la bandera `g`. Sin ella, `replace` quita UNA copia y pone otra: un
 *     fichero que ya arrastraba cuatro se quedaba en cuatro para siempre, y
 *     nada lo cantaba porque el CSS repetido no rompe nada, sólo pesa.
 */
const ESTILO_PUESTO = /\/\* ── EL SELECTOR DE IDIOMA ──[\s\S]*?── FIN DEL SELECTOR DE IDIOMA ── \*\/\r?\n/g;

function conEstilo(html) {
  const limpio = html.replace(ESTILO_PUESTO, "");
  const finHead = limpio.indexOf("</head>");
  const j = finHead >= 0 ? limpio.lastIndexOf("</style>", finHead) : limpio.lastIndexOf("</style>");
  if (j < 0) throw new Error("la página no tiene hoja de estilo donde poner el selector");
  return limpio.slice(0, j) + ESTILO + "\n" + limpio.slice(j);
}

function ponSelector(html, idioma, ficheroEn, ficheroEs) {
  /* Si el marcado ya está puesto, se CAMBIA; no se añade otro.
     Este guion lee y escribe la misma carpeta del castellano, así que se corre
     más de una vez sobre el mismo fichero. Sin esto, cada pasada colgaba otro
     selector: a la tercera había tres, y los validadores del castellano
     cantaron siete enlaces y tres transiciones de más. El fallo no se veía en
     la página —los tres salen seguidos y parecen uno— sino en las cuentas.
     Y NO se devuelve aquí: el estilo también hay que revisarlo, y saliendo en
     este punto un cambio en el estilo no llegaba nunca a una página ya
     generada. Se sigue hasta abajo, que es donde se resuelven los dos. */
  const YA_PUESTO = /<div class="idiomas">.*?<\/div>/s;
  if (YA_PUESTO.test(html)) {
    return conEstilo(html.replace(YA_PUESTO, bloque(idioma, ficheroEn, ficheroEs)));
  }

  /* Dos anclajes, y hacen falta los dos.
     Seis de las siete páginas llevan la barra común, y ahí el selector va
     delante del enlace de acceso. `partners.html` NO la lleva —tiene cabecera
     propia, y por eso está marcada `chrome: false` en `paginas/paginas.cjs`—
     así que ahí se cuelga detrás de su logotipo. Con un solo anclaje, partners
     se quedaba sin selector y la página en inglés no tenía forma de volver al
     castellano. */
  const ANCLAJES = [
    { marca: '<a href="https://app.clerigo.io/login" class="btn-ghost">', antes: true },
    { marca: '<a href="https://app.clerigo.io" class="btn-ghost">', antes: true },
    { marca: '    <span class="lsub">Clèrigo.</span>\n  </a>\n', antes: false },
  ];
  let punto = -1;
  let anclaje = null;
  for (const a of ANCLAJES) {
    const i = html.indexOf(a.marca);
    if (i >= 0) { punto = a.antes ? i : i + a.marca.length; anclaje = a; break; }
  }
  if (punto < 0) throw new Error("no encuentro dónde colgar el selector de idioma");

  const sangria = anclaje.antes
    ? (html.slice(0, punto).match(/\n([ \t]*)$/) || [null, "    "])[1]
    : "  ";
  const conSelector = anclaje.antes
    ? html.slice(0, punto) + bloque(idioma, ficheroEn, ficheroEs) + "\n" + sangria + html.slice(punto)
    : html.slice(0, punto) + "\n" + sangria + bloque(idioma, ficheroEn, ficheroEs) + html.slice(punto);

  return conEstilo(conSelector);
}

/**
 * Las etiquetas de idioma alternativo.
 *
 * Sin ellas, Google trata las dos versiones como páginas distintas que dicen
 * casi lo mismo y elige una por su cuenta; con ellas sabe que son la misma en
 * dos idiomas y enseña la que le toque a cada quien. `x-default` es la que se
 * sirve cuando el idioma de quien busca no es ninguno de los dos: el inglés,
 * que es el de por omisión.
 */
/* CADA IDIOMA CON SU NOMBRE DE FICHERO, QUE NO SIEMPRE ES EL MISMO.
 *
 * Antes entraba UN solo nombre y servía para las dos direcciones. Eso vale
 * mientras las dos versiones se llamen igual, y cuatro no se llaman igual:
 * `precios` se sirve como `pricing`, `marcos` como `frameworks`, `contacto`
 * como `contact` y `confianza` como `trustcenter`.
 *
 * Consecuencia medida en las cuatro: la canónica de la página inglesa declaraba
 * el nombre CASTELLANO —`pricing.html` decía «mi dirección es /precios.html»—,
 * y esa dirección es una redirección 301 hacia ella misma. Declararse en una
 * dirección que redirige es pedirle al buscador que no sepa cuál indexar, y es
 * justo lo que la canónica existe para evitar.
 *
 * Ahora entran los dos nombres y cada versión se declara en el suyo. */
function ponAlternativas(html, idioma, ficheroEn, ficheroEs, base) {
  const enIngles = base + "/" + (ficheroEn || "");
  const enCastellano = base + "/es/" + (ficheroEs || "");
  const etiquetas = [
    '<link rel="alternate" hreflang="en" href="' + enIngles + '">',
    '<link rel="alternate" hreflang="es" href="' + enCastellano + '">',
    '<link rel="alternate" hreflang="x-default" href="' + enIngles + '">',
  ].join("\n  ");

  /* La canónica de cada versión apunta a SÍ MISMA, no las dos a la inglesa:
     si las dos dijeran lo mismo, la castellana estaría pidiendo que no la
     indexen. */
  const miCanonica = idioma === "en" ? enIngles : enCastellano;

  /* La canónica Y `og:url` a la vez. Si sólo se cambiara la canónica, la
     castellana diría «mi dirección es /es/» en una etiqueta y «/» en la otra:
     dos afirmaciones contrarias sobre lo mismo, y el rastreador se queda con la
     que quiera.
     Se PONE el valor entero, no se sustituye un trozo. Sustituyendo, la segunda
     pasada encontraba `base/` dentro de `base/es/` y dejaba `base/es/es/`: este
     guion se corre más de una vez sobre el mismo fichero y tiene que dar lo
     mismo siempre. */
  let salida = html;
  salida = salida.replace(/<link rel="canonical" href="[^"]*">/,
    '<link rel="canonical" href="' + miCanonica + '">');
  salida = salida.replace(/<meta property="og:url" content="[^"]*">/,
    '<meta property="og:url" content="' + miCanonica + '">');

  /* Y la ficha de datos estructurados, que dice lo mismo por tercera vez: su
     `url` y su `inLanguage`. Es la que leen Google y LinkedIn para pintar la
     tarjeta del enlace, así que dejarla apuntando a la otra versión es
     contarles que la página castellana vive en la dirección inglesa.
     Se cambia sólo dentro de la ficha —está acotada entre sus etiquetas— para
     no tocar ninguna otra dirección de la página. */
  salida = salida.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, (ficha) =>
    ficha
      .replace(/"url":"[^"]*"/, '"url":"' + miCanonica + '"')
      .replace(/"inLanguage":"[^"]*"/, '"inLanguage":"' + idioma + '"'));

  if (!salida.includes('rel="alternate" hreflang')) {
    salida = salida.replace(/(<link rel="canonical"[^>]*>)/, "$1\n  " + etiquetas);
  }
  return salida;
}

/**
 * Las imágenes y el icono, vistos desde /es/.
 *
 * Las capturas del sistema y el favicon viven en la RAÍZ y son las mismas en
 * los dos idiomas: duplicar dos megas de PNG por traducir unas palabras no
 * tiene sentido, y además dejaría dos copias que se pueden desincronizar.
 *
 * Pero la página castellana está un nivel más adentro, así que un
 * `src="sistema/loquesea.png"` apunta a `/es/sistema/…`, que no existe. Se vio
 * en la primera foto: la ventana del carrusel salía vacía con el texto
 * alternativo encima.
 *
 * Sólo se toca lo que no lleva ya un prefijo: las direcciones absolutas, los
 * anclas y los enlaces a otras páginas del sitio —que sí viven al lado— se
 * quedan como están.
 */
function subeUnNivelLosRecursos(html) {
  return html.replace(
    /(\s(?:src|href)=")((?!https?:|\/|#|mailto:|\.\.\/|data:)[^"]*\.(?:png|jpg|jpeg|svg|webp|ico|css|js))"/g,
    (todo, antes, ruta) => antes + "../" + ruta + '"',
  ).replace(URL_DEL_CSS, (todo, comilla, ruta) => "url(" + comilla + "../" + ruta + comilla + ")");
}

/**
 * Y LO MISMO PARA LO QUE NO SE PIDE CON UN ATRIBUTO SINO CON CSS.
 *
 * Esto llegó tarde y costó un logotipo. El de la barra no se pone con un
 * `<img>`: se pone con una ficha, `--logo: url("favicon.png")`, y arriba se
 * subía el nivel sólo a `src=` y `href=`. Resultado: en las cinco páginas
 * castellanas que usan la plantilla, el hueco del logotipo salía vacío. En la
 * barra, arriba a la izquierda, en todas.
 *
 * Y NO SE VEÍA MIRANDO LA INGLESA, que es lo que lo hizo durar. Las inglesas
 * viven en la raíz, donde `favicon.png` sí está al lado; las castellanas viven
 * un nivel más adentro. Media web bien y media web sin logotipo.
 *
 * La guarda que comprueba que las imágenes citadas existen tampoco lo veía:
 * miraba atributos. Ahora mira también esto.
 *
 * Se aceptan las tres formas que admite el CSS —comillas dobles, simples y sin
 * comillas— y se deja fuera lo que ya lleva prefijo, lo absoluto y el base64,
 * que es como va el logotipo de la portada.
 */
const URL_DEL_CSS = /\burl\(\s*(['"]?)((?!https?:|\/|#|data:|\.\.\/)[^'")\s]*\.(?:png|jpg|jpeg|svg|webp|ico|css|js))\1\s*\)/g;
const URL_DEL_CSS_CON_PREFIJO = /\burl\(\s*(['"]?)\.\.\/((?!\.\.\/)[^'")\s]*\.(?:png|jpg|jpeg|svg|webp|ico|css|js))\1\s*\)/g;

/**
 * Y lo contrario, para la página de la raíz.
 *
 * ESTO NO ES SIMETRÍA POR GUSTO: ES EL ARREGLO DE UN FALLO QUE SE VEÍA.
 *
 * El paso al inglés lee de `es/`, escribe el inglés en la raíz y además vuelve
 * a escribir el castellano en su sitio —con su selector, su canónica y el
 * `../` de las imágenes—. La segunda vez que se corre, lo que lee de `es/` ya
 * trae el `../` puesto, y de ahí sale la página inglesa: quince capturas
 * apuntando a `/../sistema/…`, que no existe. La primera pasada salía bien y
 * la segunda rompía el carrusel entero de la portada, en silencio.
 *
 * Se arregla NORMALIZANDO en vez de suponer: la inglesa quita el prefijo lo
 * lleve o no, la castellana lo pone lo lleve o no. Así da igual en qué estado
 * esté la fuente y da igual cuántas veces se corra.
 */
function bajaUnNivelLosRecursos(html) {
  return html.replace(
    /(\s(?:src|href)=")\.\.\/((?!\.\.\/)[^"]*\.(?:png|jpg|jpeg|svg|webp|ico|css|js))"/g,
    (todo, antes, ruta) => antes + ruta + '"',
  ).replace(URL_DEL_CSS_CON_PREFIJO, (todo, comilla, ruta) => "url(" + comilla + ruta + comilla + ")");
}

module.exports = { ponSelector, ponAlternativas, bloque, ESTILO,
  subeUnNivelLosRecursos, bajaUnNivelLosRecursos };
