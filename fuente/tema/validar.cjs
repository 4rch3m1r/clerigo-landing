/**
 * VIGILA EL TEMA OSCURO. Los demás validadores lo quitan antes de mirar
 * (`sinTema`); éste mira sólo lo suyo:
 *
 *   · cada página lleva las cuatro piezas, una sola vez y en su sitio;
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
const { colorOscuro } = require("./oscuro.cjs");
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
      if (fs.existsSync(ruta)) lista.push({ nombre: idioma + "/" + p.disco[idioma], ruta, idioma });
    }
  return lista;
}

const antes = new Map();
for (const pg of paginas()) {
  const html = fs.readFileSync(pg.ruta, "utf8");
  antes.set(pg.ruta, html);
  for (const [pieza, re] of Object.entries(MARCAS))
    comprueba(`${pg.nombre}: ${pieza} una sola vez`, cuenta(html, re) === 1, cuenta(html, re) + " veces");

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
