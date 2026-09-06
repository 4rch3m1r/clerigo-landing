/**
 * VALIDACIÓN FINAL — el punto 11 del encargo, comprobado sobre los ficheros.
 *
 * No dice «parece que está bien»: cada punto es una comprobación que pasa o
 * falla, y al final sale el recuento.
 */
const RAIZ = require("node:path").join(__dirname, "..");
const fs = require("fs");
const { pelado, restosDeTemaOscuro, EXCEPCIONES, sinPanelDeCertificaciones } = require("./tema.cjs");
/* Donde vive el sitio: de aqui salen las direcciones absolutas de la cabecera. */
const SITIO = JSON.parse(fs.readFileSync(require("node:path").join(__dirname, "sitio.json"), "utf8"));

/* El original de Archemir no viaja en el repositorio —es público y ese fichero
   lleva su marca—. Sin él no se puede comparar contra la fuente, así que se
   dice claro en vez de morir leyendo un fichero que no existe. */
const ORIGINAL = require("node:path").join(__dirname, "archemir-original.html");
if (!require("node:fs").existsSync(ORIGINAL)) {
  console.error("\n  Falta el original de Archemir en " + ORIGINAL);
  console.error("  Sin él no se puede comprobar que la página sale de la fuente.");
  console.error("  Mira la nota de fuente/rebrandear.cjs.\n");
  process.exit(1);
}
const OSCURO = require("node:path").join(RAIZ, "oscuro.html");
const CLARO = require("node:path").join(RAIZ, "index.html");

const lee = (p) => fs.readFileSync(p, "utf8").split("\r\n").join("\n");
const org = lee(ORIGINAL);
const osc = lee(OSCURO);
const cla = lee(CLARO);

const fallos = [];
function comprueba(punto, condicion, detalle) {
  const ok = !!condicion;
  if (!ok) fallos.push(punto + (detalle ? " — " + detalle : ""));
  console.log((ok ? "  OK  " : "  MAL ") + punto + (detalle && !ok ? "  ·  " + detalle : ""));
}

const cuenta = (t, re) => (t.match(re) || []).length;

console.log("── Rebranding ──────────────────────────────────────────────────");
for (const [n, t] of [["oscuro", osc], ["claro", cla]]) {
  comprueba(`sin «archemir» en el ${n}`, cuenta(t, /archemir/gi) === 0, cuenta(t, /archemir/gi) + " restos");
  comprueba(`sin «GRC Intelligence» ni «Axioma GRC» en el ${n}`,
    !/GRC Intelligence|Axioma GRC|grc-intelligence/i.test(t));
  /* Esto contaba apariciones de «clerigo.io» y pedía 26 o más. Dejó de valer el
     día que los enlaces del sitio pasaron a apuntar al fichero de al lado: la
     cuenta se desplomó a 7 y el número grande no decía nada. Se mira dónde va
     cada cosa, que es lo que importa.
     Las direcciones absolutas de la cabecera salen de fuente/sitio.json —hoy
     GitHub Pages, provisionalmente— y las dos del cuerpo que NO son el sitio
     se quedan donde estaban: la academia y la aplicación. */
  comprueba(`las direcciones absolutas son las de sitio.json en el ${n}`,
    t.includes(`<link rel="canonical" href="${SITIO.base}/"`)
    /* og:image, og:image:secure_url y twitter:image */
    && cuenta(t, new RegExp(`content="${SITIO.base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/og\\.png"`, "g")) === 3
    && t.includes('href="https://app.clerigo.io"')
    && t.includes('href="https://clerigo.io/academia"'));
  comprueba(`los enlaces del sitio van a las páginas de al lado en el ${n}`,
    cuenta(t, /href="marcos\.html"/g) === 6
    && cuenta(t, /href="legal\.html"/g) === 5
    && cuenta(t, /href="precios\.html"/g) === 3
    && cuenta(t, /href="contacto\.html"/g) === 3
    && cuenta(t, /href="partners\.html"/g) === 1
    && cuenta(t, /href="index\.html"/g) === 2,
    "marcos " + cuenta(t, /href="marcos\.html"/g)
    + ", legal " + cuenta(t, /href="legal\.html"/g)
    + ", precios " + cuenta(t, /href="precios\.html"/g)
    + ", contacto " + cuenta(t, /href="contacto\.html"/g)
    + ", partners " + cuenta(t, /href="partners\.html"/g)
    + ", index " + cuenta(t, /href="index\.html"/g));
  comprueba(`y los ficheros a los que apunta existen, en el ${n}`,
    ["marcos", "legal", "precios", "contacto", "partners", "index"]
      .every((f) => fs.existsSync(require("node:path").join(RAIZ, f + ".html"))),
    ["marcos", "legal", "precios", "contacto", "partners", "index"]
      .filter((f) => !fs.existsSync(require("node:path").join(RAIZ, f + ".html")))
      .map((f) => f + ".html") + " no está");
  comprueba(`la marca es «Clèrigo» en el ${n}`, cuenta(t, /Clèrigo/g) >= 18,
    cuenta(t, /Clèrigo/g) + " apariciones");
  comprueba(`el título es de Clèrigo en el ${n}`, /<title>Clèrigo — /.test(t));
  comprueba(`hay canonical, Open Graph y Twitter en el ${n}`,
    t.includes(`rel="canonical" href="${SITIO.base}/"`)
    && t.includes(`og:url" content="${SITIO.base}/"`)
    && /twitter:card/.test(t));
  /* La tarjeta de la vista previa. La etiqueta sola no vale de nada: durante
     meses apuntó a og.png y ese fichero NO existía —el servidor contestaba a
     esa ruta con el HTML de la portada—, así que el enlace salía sin imagen en
     todas partes. Aquí se comprueba el fichero, no la promesa. */
  comprueba(`las etiquetas de la tarjeta están completas en el ${n}`,
    /og:image:width" content="1200"/.test(t)
    && /og:image:height" content="630"/.test(t)
    && /og:image:type" content="image\/png"/.test(t)
    && /og:image:alt"/.test(t)
    && /twitter:card" content="summary_large_image"/.test(t)
    && /twitter:image:alt"/.test(t)
    && /application\/ld\+json/.test(t));
  comprueba(`y están arriba del todo, donde las lee WhatsApp, en el ${n}`,
    t.indexOf('property="og:image"') > 0 && t.indexOf('property="og:image"') < 1536,
    "og:image aparece en el byte " + t.indexOf('property="og:image"'));
  comprueba(`el login apunta a app.clerigo.io en el ${n}`,
    t.includes('href="https://app.clerigo.io"') && !/truestoneadvisory/i.test(t));
  comprueba(`el logotipo de Clèrigo se usa en los 3 sitios de marca del ${n}`,
    cuenta(t, /var\(--logo\)/g) === 3, cuenta(t, /var\(--logo\)/g) + " usos");
}
for (const [n, t] of [["oscuro", osc], ["claro", cla]]) {
  /* Nada dibujado con la fuente: ni el trofeo, ni las estrellas, ni las
     flechas. Se busca sobre el fichero sin los `data:` incrustados, porque
     dentro de un SVG escapado pueden salir secuencias parecidas. */
  const sinDatos = t
    .replace(/data:image\/svg\+xml,[^"')]+/g, "")
    .replace(/data:image\/png;base64,[A-Za-z0-9+/=]+/g, "");
  const pict = sinDatos.match(/[\u{1F000}-\u{1FAFF}\u{2605}\u{2606}\u{2190}-\u{21FF}\u{2794}-\u{27BF}\u{2B00}-\u{2BFF}]/gu) || [];
  comprueba(`sin emojis, estrellas ni flechas de texto en el ${n}`, pict.length === 0, [...new Set(pict)].join(" "));
}
/* Lo ÚNICO que se le quita al original. El panel decía «Nuestras
   Certificaciones» y traía sellos con la palabra «Certified» sobre ISO 27001,
   ISO 22301 y SOC 2 Type II: son marcos que la plataforma cubre, no
   certificaciones que Clèrigo tenga. La página es pública. */
for (const [n, t] of [["oscuro", osc], ["claro", cla]]) {
  /* Ojo: «ISO 22301» y «SOC 2 Type II» SÍ siguen en la página, en la lista de
     marcos compatibles, y ahí están bien: son marcos que la plataforma cubre.
     Lo que se comprueba es que no quede el panel que los presentaba como
     certificaciones propias — ni su marcado ni su CSS. */
  comprueba(`sin el panel de certificaciones en el ${n}`,
    !/cert-panel|cert-logo-item|cert-divider|cert-logo-name|Nuestras Certificaciones/.test(t));
}
comprueba("y en el original SÍ estaba, que si no esta comprobación no dice nada",
  /class="cert-panel/.test(org) && /Nuestras Certificaciones/.test(org));

/* Las seis tarjetas: la de la portada y una por página interior. Se miran los
   BYTES del fichero, no la etiqueta que dice que existe. */
{
  const cartas = ["og.png", "og-legal.png", "og-precios.png", "og-marcos.png",
    "og-contacto.png", "og-partners.png"];
  const malas = [];
  for (const c of cartas) {
    const f = require("node:path").join(RAIZ, c);
    if (!fs.existsSync(f)) { malas.push(c + " no está"); continue; }
    const cab = Buffer.alloc(24);
    const fd = fs.openSync(f, "r");
    fs.readSync(fd, cab, 0, 24, 0);
    fs.closeSync(fd);
    const kb = Math.round(fs.statSync(f).size / 1024);
    if (cab.readUInt32BE(16) !== 1200 || cab.readUInt32BE(20) !== 630 || kb >= 300) {
      malas.push(`${c}: ${cab.readUInt32BE(16)} × ${cab.readUInt32BE(20)}, ${kb} KB`);
    }
  }
  comprueba("las 6 tarjetas de vista previa existen, miden 1200 × 630 y pesan poco",
    malas.length === 0, malas.join(" | "));
}

comprueba("el favicon apunta a favicon.png y el fichero existe",
  /rel="icon"[^>]*href="favicon\.png"/.test(osc) && fs.existsSync(require("node:path").join(RAIZ, "favicon.png")));

console.log("\n── Estructura intacta ──────────────────────────────────────────");
/* La prueba dura: quitando marca, dominio, logotipo y color, los tres ficheros
   tienen que ser LA MISMA página. */
const esqueleto = (s) => pelado(
  /* El marcado del panel se recorta contando etiquetas, con el mismo ayudante
     que usa el guion que lo quita: por regex se cortaba en el primer `</div>`
     —el panel tiene divs dentro— o se llevaba de más el cierre del bloque que
     lo envuelve. Las dos cosas pasaron. */
  sinPanelDeCertificaciones(s)
  /* Estas dos van ANTES de pelar, porque `pelado` aplana cada bloque `{ … }` a
     una línea y después un `^--logo:` ya no existe como principio de línea. */
    .replace(/^.*(og:|twitter:|rel="canonical"|name="description"|name="theme-color"|rel="image_src"|application\/ld\+json).*$/gm, "")
    .replace(/^\s*--logo:.*$/gm, "")
    /* El bloque de ajustes de teléfono es el ÚNICO añadido de verdad, y se
       quita aquí a propósito para que el resto de la página siga comparándose
       carácter a carácter. Que exista se comprueba aparte, más abajo. */
    .replace(/\/\* ── AJUSTES DE TELÉFONO[\s\S]*?── FIN DE LA BARRA Y EL PIE EN OSCURO ──[^\n]*\n/, "")
    /* Y el panel de certificaciones es lo ÚNICO que se quita del original: se
       recorta también aquí —del original, donde sí está— para que el resto de
       la página siga comparándose línea por línea. Que NO esté en las dos
       versiones se comprueba aparte, más abajo. */
    .replace(/\/\* ── CERT LOGOS PANEL \(static, in hero\) ── \*\/[\s\S]*?(?=\/\* ── SECURITY TRUST STRIP ── \*\/)/, "")
    .replace(/[ \t]*\.hero-inner > \.cert-panel \{ order: 3; \}\n/, ""),
)
  /* Los enlaces al resto del sitio apuntan al fichero de al lado en vez de a
     una ruta de clerigo.io. Se deshace aquí —y sólo aquí— para poder seguir
     comparando línea por línea contra el original, donde eran rutas de
     archemir.com. No es una excepción nueva: es la misma normalización del
     dominio que ya había, un paso antes. */
  .replace(/href="marcos\.html"/g, 'href="https://clerigo.io/marcos"')
  .replace(/href="legal\.html"/g, 'href="https://clerigo.io/legal"')
  .replace(/href="precios\.html"/g, 'href="https://clerigo.io/precios"')
  .replace(/href="contacto\.html"/g, 'href="https://clerigo.io/prospectos"')
  .replace(/href="partners\.html"/g, 'href="https://portal.clerigo.io"')
  .replace(/href="index\.html"/g, 'href="https://clerigo.io"')
  .replace(/GRC Intelligence Platform|GRC Intelligence|Axioma GRC|Clèrigo XGRC|Clèrigo/g, "MARCA")
  .replace(/grc-intelligence\.app|portal\.archemir\.com|portal\.clerigo\.io|truestoneadvisory\.com\/login|app\.clerigo\.io|archemir\.com|clerigo\.io/g, "DOM")
  /* El original escribía la misma ruta de dos maneras, con barra final y sin
     ella. Las dos llevan ahora al mismo fichero, así que la barra final se
     iguala en los tres para poder compararlos. */
  .replace(/href="https:\/\/DOM\/prospectos\/"/g, 'href="https://DOM/prospectos"')
  /* El sufijo del rótulo de la barra: «Platform» pasó a «XGRC», mismo hueco. */
  .replace(/<small>(Platform|XGRC)<\/small>/g, "<small>SUF</small>")
  /* El enlace del pie venía sin protocolo —un fallo del original— y ahora lo
     lleva. Se iguala para que el resto de la línea sí se compare. */
  .replace(/href="(https:\/\/)?DOM"/g, 'href="DOM"')
  /* El logotipo trae su propia esquina cortada y su color, así que al ponerlo
     desaparecen el recorte y la regla del texto «GRC» que había dentro. */
  .replace(/clip-path: ?polygon\(0 0, ?100% 0, ?100% 72%, ?72% 100%, ?0 100%\);?/g, "")
  .replace(/<span[^>]*>GRC<\/span>/g, "")
  .replace(/\.(nav|plat)-logo-mark span \{[^}]*\}/g, "")
  .replace(/background: ?var\(--(red|logo)\)( center \/ contain no-repeat)?;?/g, "MARK")
  .replace(/sizes="\d+x\d+"/g, "")
  /* El trofeo del distintivo era un emoji y ahora es un SVG del mismo oro, en
     la misma caja de 20 px. Se iguala para poder comparar el resto. */
  .replace(/<div class="award-tt-star">(\u{1F3C6}|<svg .*?<\/svg>)<\/div>/gu, '<div class="award-tt-star">TROFEO</div>')
  /* Las cinco estrellas de cada testimonio: eran el signo «★» y ahora son un
     SVG en la misma caja de línea, con el color de `.star`. */
  .replace(/<span class="star">(\u{2605}|<svg .*?<\/svg>)<\/span>/gu, '<span class="star">ESTRELLA</span>')
  /* Las tres flechas. La de la viñeta era `content: '→'` y ahora es una caja
     del mismo tamaño que se pinta con `currentColor` y se recorta con la
     silueta; las otras dos eran glifos dentro de una frase. */
  .replace(/\.module-feature::before \{[^}]*\}/g, ".module-feature::before {FLECHA}")
  .replace(/(\u{2193}|<svg [^>]*>(?:(?!<\/svg>).)*<\/svg>) SIN INTEGRACIÓN · SIN VISIBILIDAD UNIFICADA (\u{2193}|<svg [^>]*>(?:(?!<\/svg>).)*<\/svg>)/gu,
    "FLECHA SIN INTEGRACIÓN · SIN VISIBILIDAD UNIFICADA FLECHA")
  .replace(/Más información (\u{2192}|<svg [^>]*>(?:(?!<\/svg>).)*<\/svg>)<\/a>/gu, "Más información FLECHA</a>")
  .replace(/Reportes IA (\u{2192}|->) ahora dividido/gu, "Reportes IA FLECHA ahora dividido")
  /* Al quitar declaraciones enteras quedan espacios dobles donde estaban. */
  .replace(/[ \t]{2,}/g, " ")
  .split("\n").map((l) => l.trim()).filter((l) => l !== "").join("\n");

const eOrg = esqueleto(org), eOsc = esqueleto(osc), eCla = esqueleto(cla);
function compara(a, b, na, nb) {
  const la = a.split("\n"), lb = b.split("\n");
  const dif = [];
  for (let i = 0; i < Math.max(la.length, lb.length); i++) {
    if (la[i] !== lb[i]) { dif.push({ i: i + 1, a: String(la[i]).slice(0, 120), b: String(lb[i]).slice(0, 120) }); if (dif.length > 8) break; }
  }
  comprueba(`${na} y ${nb} son la misma página`, dif.length === 0,
    dif.length ? `${dif.length}+ diferencias` : "");
  for (const d of dif) { console.log(`        ~${d.i}  ${na}: ${d.a}`); console.log(`        ~${d.i}  ${nb}: ${d.b}`); }
}
compara(eOrg, eOsc, "original", "oscuro");
compara(eOsc, eCla, "oscuro", "claro");

console.log("\n── Modo claro ──────────────────────────────────────────────────");
comprueba("el fondo de la página es blanco", /--dark: #FFFFFF;/.test(cla));
comprueba("la tinta del texto es oscura", /--text: #16181C;/.test(cla));
const { restos, excepcionadas, huerfanas } = restosDeTemaOscuro(cla.split("\n"));
comprueba("no quedan superficies ni bordes del tema oscuro", restos.length === 0,
  restos.length + " líneas: " + restos.slice(0, 12).map((x) => x.n).join(", "));
for (const x of restos.slice(0, 12)) console.log(`        L${x.n}: ${x.l}`);
comprueba("las excepciones anotadas siguen donde decían", huerfanas.length === 0,
  "revisar: " + huerfanas.join(", "));
for (const e of excepcionadas) console.log("        (excepción justificada L" + e.n + ": " + e.porque + ")");

console.log("\n── Comportamiento ──────────────────────────────────────────────");
for (const [n, t] of [["oscuro", osc], ["claro", cla]]) {
  comprueba(`mismas animaciones que el original en el ${n}`,
    cuenta(t, /@keyframes/g) === cuenta(org, /@keyframes/g),
    `${cuenta(t, /@keyframes/g)} vs ${cuenta(org, /@keyframes/g)}`);
  /* Una consulta de medios MÁS que el original, y sólo una: la de 480 px que
     retira «Planes» de la barra en el teléfono. Sin ella, el botón de
     «Contacto» se corta en cualquier pantalla de menos de 414 px. Es el único
     cambio de comportamiento respecto al original, y por eso se cuenta aquí
     en vez de darlo por bueno. */
  comprueba(`las consultas de medios del original + las 3 del teléfono en el ${n}`,
    cuenta(t, /@media/g) === cuenta(org, /@media/g) + 3
    && /@media \(max-width: 480px\)/.test(t)
    && /\.nav-cta \.btn-ghost \+ \.btn-ghost \{ display: none; \}/.test(t)
    && /\.preview-sidebar \{ display: none; \}/.test(t)
    && /\.preview-kpi-row \{ grid-template-columns: repeat\(3,1fr\); \}/.test(t),
    `${cuenta(t, /@media/g)} vs ${cuenta(org, /@media/g)} del original`);

  /* La barra y el pie van en oscuro en las DOS versiones, con los mismos
     bytes. Se comprueba que el bloque esté y que el guion no vuelva a poner
     la barra blanca al desplazar —un estilo en línea gana a la hoja—. */
  comprueba(`la barra y el pie van en oscuro en el ${n}`,
    /nav, footer \{[\s\S]{0,400}--text: #F0F0F0;/.test(t)
    && t.includes("nav { background: rgba(14,14,14,0.85); }")
    && t.includes("footer { background: #0E0E0E; }")
    && !/nav\.style\.background = 'rgba\(255/.test(t));

  /* Los mismos guiones que el original, más UNO: el de datos estructurados de
     la cabecera, que no es código —no se ejecuta— sino la ficha que leen
     Google y LinkedIn para pintar la tarjeta del enlace. */
  comprueba(`mismo guion en el ${n}`,
    cuenta(t, /<script/g) === cuenta(org, /<script/g) + 1
    && cuenta(t, /<script type="application\/ld\+json">/g) === 1,
    `${cuenta(t, /<script/g)} vs ${cuenta(org, /<script/g)} + 1`);
  comprueba(`mismas secciones en el ${n}`,
    cuenta(t, /<section/g) === cuenta(org, /<section/g),
    `${cuenta(t, /<section/g)} vs ${cuenta(org, /<section/g)}`);
  comprueba(`mismo número de enlaces en el ${n}`,
    cuenta(t, /<a /g) === cuenta(org, /<a /g),
    `${cuenta(t, /<a /g)} vs ${cuenta(org, /<a /g)}`);
  /* Una transición MENOS que el original, y sólo una: la de
     `.cert-logo-item`, que crecía al pasar el ratón por encima de un sello.
     El sello ya no está, así que su animación tampoco. */
  comprueba(`las transiciones del original menos la del sello, en el ${n}`,
    cuenta(t, /transition:/g) === cuenta(org, /transition:/g) - 1,
    `${cuenta(t, /transition:/g)} vs ${cuenta(org, /transition:/g)} del original`);
  comprueba(`mismos observadores de aparición en el ${n}`,
    cuenta(t, /IntersectionObserver/g) === cuenta(org, /IntersectionObserver/g));
}

console.log("\n────────────────────────────────────────────────────────────────");
console.log(fallos.length === 0 ? "TODO PASA" : `FALLAN ${fallos.length}:`);
fallos.forEach((f) => console.log("  · " + f));
process.exitCode = fallos.length ? 1 : 0;
