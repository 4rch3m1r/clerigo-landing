/**
 * VIGILA EL TEMA OSCURO. Los demás validadores lo quitan antes de mirar
 * (`sinTema`); éste mira sólo lo suyo:
 *
 *   · cada página lleva las cuatro piezas, una sola vez y en su sitio, y el
 *     botón de móvil sólo donde el selector de idioma se oculta;
 *   · el arranque va en el <head>: decide antes de pintar el <body>, sin parpadeo;
 *   · el botón está en el idioma de la página;
 *   · correr el generador otra vez no cambia nada;
 *   · la regla de color hace lo que promete en los casos que importan.
 *
 * Uso: node fuente/tema/validar.cjs
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { MARCAS, sinTema } = require("./marcas.cjs");
const { colorOscuro, BOTON_MOVIL } = require("./oscuro.cjs");
const { PAGINAS } = require("../seo/posicionar.cjs");
const { CASTELLANO, INGLES } = require("../donde.cjs");

let fallos = 0, total = 0;
function comprueba(nombre, ok, detalle) {
  total++;
  if (!ok) fallos++;
  console.log((ok ? "  OK  " : "  MAL ") + nombre + (ok || !detalle ? "" : "  ·  " + detalle));
}
const cuenta = (html, re) => (html.match(new RegExp(re.source, "g")) || []).length;

function paginas() {
  const lista = [];
  for (const [carpeta, idioma] of [[CASTELLANO, "es"], [INGLES, "en"]])
    for (const p of PAGINAS) {
      if (p.slug === "login") continue;
      const ruta = path.join(carpeta, p.disco[idioma]);
      if (fs.existsSync(ruta)) lista.push({ nombre: idioma + "/" + p.disco[idioma], ruta, idioma, slug: p.slug });
    }
  return lista;
}

const antes = new Map();
for (const pg of paginas()) {
  const html = fs.readFileSync(pg.ruta, "utf8");
  antes.set(pg.ruta, html);
  /* La portada lleva el valor oscuro de su gemela en cada elemento con color;
     las demás, ninguno. */
  const gemelos = cuenta(html, MARCAS.gemelos);
  comprueba(`${pg.nombre}: ${pg.slug === "index" ? "los elementos llevan su valor oscuro de la gemela" : "no lleva valores de gemela"}`,
    pg.slug === "index" ? gemelos > 200 : gemelos === 0, gemelos + " atributos");
  for (const [pieza, re] of Object.entries(MARCAS)) {
    if (pieza === "gemelos") continue;
    /* El botón de móvil sólo va donde el selector de idioma se oculta. */
    const esperado = pieza === "movil" ? (BOTON_MOVIL[pg.slug] ? 1 : 0) : 1;
    comprueba(`${pg.nombre}: ${pieza} ${esperado ? "una sola vez" : "no está"}`, cuenta(html, re) === esperado, cuenta(html, re) + " veces");
  }
  if (BOTON_MOVIL[pg.slug]) {
    const movil = (html.match(MARCAS.movil) || [""])[0];
    comprueba(`${pg.nombre}: el botón de móvil va encima de la tarjeta, en su idioma`,
      new RegExp(BOTON_MOVIL[pg.slug] + "\\r?\\n\\s*<button[^>]*id=\"temaToggleMovil\"").test(html) &&
      movil.includes(pg.idioma === "es" ? "Cambiar a modo oscuro" : "Switch to dark mode"));
    comprueba(`${pg.nombre}: el botón de móvil sólo se ve por debajo de 820 px`,
      /\.tema-toggle-movil\{display:none\}/.test(html) && /@media \(max-width:820px\)\{[^\n]*\.tema-toggle-movil\{display:inline-flex/.test(html));
  }

  const cabeza = html.slice(0, html.indexOf("</head>"));
  comprueba(`${pg.nombre}: el arranque va en el <head>`, cabeza.includes('<script id="tema-arranque">'));
  comprueba(`${pg.nombre}: el motor va justo antes de </body>`, /<script id="tema-motor">[\s\S]*?<\/script>\s*<\/body>/.test(html));

  const boton = (html.match(MARCAS.boton) || [""])[0];
  const esperado = pg.idioma === "es" ? "Cambiar a modo oscuro" : "Switch to dark mode";
  comprueba(`${pg.nombre}: el botón habla el idioma de la página`, boton.includes(esperado));
  comprueba(`${pg.nombre}: el botón está junto al selector de idioma`, /<div class="idiomas">[\s\S]*?<\/div>\s*<button type="button" class="tema-toggle"/.test(html));
  comprueba(`${pg.nombre}: sin tema no queda rastro`, !/tema-(arranque|oscuro|motor)|temaToggle/.test(sinTema(html)));
}

execFileSync(process.execPath, [path.join(__dirname, "oscuro.cjs")], { stdio: "ignore" });
const cambiadas = [...antes].filter(([ruta, html]) => fs.readFileSync(ruta, "utf8") !== html).map(([r]) => path.basename(r));
comprueba("correr el generador otra vez no cambia ninguna página", cambiadas.length === 0, cambiadas.join(", "));

const casos = [
  ["#FFFFFF", "", "#0E0E0E", "el blanco de página pasa a negro"],
  ["#16181C", "tinta", "#F0F0F0", "la tinta oscura pasa a clara"],
  ["#FFFFFF", "tinta", "#FFFFFF", "el texto blanco (sobre rojo) se queda blanco"],
  ["#EB1000", "", "#EB1000", "el rojo de marca no se toca"],
  ["rgba(0,0,0,0.08)", "", "rgba(240,240,240,0.076)", "una línea translúcida cambia de tinta"],
  ["rgba(0,0,0,0.5)", "", "rgba(0,0,0,0.625)", "un velo sigue siendo velo"],
  ["rgba(0,0,0,0.1)", "sombra", "rgba(0,0,0,0.22)", "una sombra sigue siendo oscura"],
  ["var(--dark)", "", "var(--dark)", "lo que no es un color no se toca"],
  ["#16181C", "", "#16181C", "una superficie oscura a propósito se queda oscura"],
  ["#C4C4C4", "tinta", "#C4C4C4", "un texto gris claro (sobre un panel oscuro) se queda"],
  ["rgba(255,255,255,0.5)", "tinta", "rgba(255,255,255,0.5)", "una tinta blanca translúcida se queda"],
  ["#C10D00", "tinta", "#FF7066", "una tinta de color oscura se aclara"],
];
for (const [entra, uso, sale, nombre] of casos) {
  const obtenido = colorOscuro(entra, uso);
  comprueba(`color: ${nombre}`, obtenido === sale, `${entra} → ${obtenido}, se esperaba ${sale}`);
}

/* Las páginas: lo que se vio roto al mirarlas en oscuro. */
const leer = (p) => fs.readFileSync(p, "utf8");
const portada = leer(path.join(CASTELLANO, "index.html"));
comprueba("la barra estrecha sus espacios de 769 a 1320 px para que el botón no parta los enlaces, y a 1320 vale lo de siempre",
  /@media \(min-width:769px\) and \(max-width:1320px\)\{nav\{gap:clamp\(16px,calc\(16px \+ \(100vw - 1000px\) \* \.075\),40px\)/.test(portada) &&
  (16 + 320 * 0.075 === 40) && (24 + 320 * 0.075 === 48) && (16 + 320 * 0.0375 === 28) && (8 + 320 * 0.0125 === 12));
comprueba("en móvil la barra no parte «log in» ni se sale: botones sin partir y espacios estrechos por debajo de 768 px",
  /@media \(max-width:768px\)\{nav\{gap:10px\}\.nav-cta\{gap:8px\}\.tema-toggle\{margin-left:0;width:32px;height:32px\}\.nav-cta \.btn-ghost,\.nav-cta \.btn-primary,\.nav-logo-text\{white-space:nowrap\}\}/.test(portada) &&
  /@media \(max-width:389px\)\{\.nav-logo-text small\{display:none\}\}/.test(portada) &&
  /* Y el sitio del selector EN/ES, que desde el 2026-09-16 también se ve en el
     móvil: la barra se aprieta a 420 y a 340 para que siga cabiendo en una
     línea. Medido de 320 a 768 px en las doce páginas con barra. */
  /@media \(max-width:420px\)\{nav\{gap:8px\}\.idiomas \.idioma\{padding:4px 5px\}\}/.test(portada) &&
  /@media \(max-width:340px\)\{nav\{padding:0 14px;gap:7px\}\.idiomas\{margin-right:0\}\.idiomas \.idioma\{padding:4px 4px\}/.test(portada));
/* El tema oscuro cambia colores y nada más: ni alineaciones ni tamaños. Se mira
   el CSS generado de la portada —el que copia de la gemela— quitando la hoja
   base del botón, que sí lleva medidas a propósito. */
{
  const bloque = (portada.match(/<style id="tema-oscuro">([\s\S]*?)<\/style>/) || ["", ""])[1];
  const generado = bloque.split("\n")
    .filter((l) => l.startsWith('html[data-tema="oscuro"] ') || l.startsWith("@media") && l.includes('html[data-tema="oscuro"] '))
    .filter((l) => !/tema-toggle|tema-sol|tema-luna/.test(l));
  const sinColor = generado.flatMap((l) => [...l.matchAll(/\{([^{}]*)\}/g)].flatMap((m) => m[1].split(";")))
    .filter((d) => d && !/#[0-9a-f]{3,8}\b|rgba?\(|white|black|var\(--|gradient|transparent|none|text$|^\s*(border|background)(-[a-z]+)*:/i.test(d));
  comprueba("portada: el bloque oscuro sólo cambia colores (nada de alineaciones: los botones del móvil siguen centrados)",
    sinColor.length === 0 && !/oscuro"\] \.hero-actions\{/.test(portada), sinColor.slice(0, 4).join(" | "));
}
comprueba("el motor no confunde `white-space` con el color blanco",
  (() => { const re = /(?<![\w-])(?:white|black)(?![\w-])/g; return "white-space:nowrap".replace(re, "X") === "white-space:nowrap" && "color:white".replace(re, "X") === "color:X"; })()
  && /var COLOR = [^;]*\(\?<!\[\\\\w-\]\)\(\?:white\|black\)/.test(portada) === false && portada.includes("(?<![\\w-])(?:white|black)(?![\\w-])"));
comprueba("portada: las medallas toman los colores de la portada oscura (nada de tinta aclarada sobre el oro)",
  !/oscuro"\] \.award-(num|er|lugar|tape-text)\{/.test(portada) &&
  /oscuro"\] \.award-firm-name\{color:#F5D020\}/.test(portada));
comprueba("portada: el disco de plata trae su estilo oscuro hecho a mano",
  /data-tema-style="[^"]*conic-gradient\(#c0c0c0/.test(portada));
comprueba("portada: el degradado del titular conserva el recorte al texto",
  /oscuro"\] \.hero-title \.word-simple\{[^}]*background-clip:text/.test(portada));
const marcos = leer(path.join(CASTELLANO, "marcos.html"));
comprueba("marcos: la pestaña activa (texto blanco) sigue oscura",
  /oscuro"\] \.tab-btn\.active\{[^}]*background:#16181C/.test(marcos));
const partners = leer(path.join(CASTELLANO, "partners.html"));
comprueba("partners: el panel de marca no se aclara",
  !/oscuro"\] \.lp\{[^}]*--text:#[0-3]/i.test(partners));
comprueba("la tinta terciaria sube al 50%", /--text-3:rgba\(240,240,240,0\.5\)/.test(portada));

console.log("─".repeat(64));
console.log(fallos ? `${fallos} FALLOS de ${total} comprobaciones` : `TODO PASA  ·  ${total} comprobaciones`);
process.exitCode = fallos ? 1 : 0;
