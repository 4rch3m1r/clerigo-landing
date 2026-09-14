/**
 * EL TEMA OSCURO DE TODO EL SITIO. Va el ÚLTIMO, después de posicionar.cjs.
 *
 *   node fuente/tema/oscuro.cjs
 *
 * ── QUÉ SE PIDIÓ ──────────────────────────────────────────────────────────
 *
 * Que de noche la página se vea en oscuro: de las 7 de la tarde a las 7 de la
 * mañana, con la HORA DE QUIEN VISITA, en todas las páginas, y con un botón
 * sol/luna para elegir a mano —y que se recuerde lo elegido—. 2026-09-14.
 *
 * ── CÓMO ──────────────────────────────────────────────────────────────────
 *
 * No se escribe una segunda versión de cada página: serían catorce copias que
 * envejecen por separado. Se GENERA, a partir de los colores de cada página y
 * con una sola regla (`color.js`):
 *
 *   1. Del CSS de la página sale un bloque `html[data-tema="oscuro"] …` con
 *      cada declaración que lleva color, ya convertida. Las variables comunes
 *      (--dark, --text, --border…) toman los valores de la portada oscura, que
 *      es la paleta oscura que ya existe y está aprobada.
 *   2. La barra y el pie NO se tocan: ya van siempre en oscuro.
 *   3. Lo que el CSS no alcanza —atributos `style` y colores de SVG, también
 *      los que pinta la calculadora al vuelo— lo convierte el motor en la
 *      página, con la misma regla, y lo deshace al volver a claro.
 *   4. Un guion mínimo en el <head> decide el tema ANTES de pintar, así que no
 *      hay destello blanco de noche.
 *
 * Es idempotente: quita lo que puso la vez anterior (`marcas.cjs`) y lo vuelve
 * a poner.
 */
const fs = require("node:fs");
const path = require("node:path");
const { CASTELLANO, INGLES } = require("../donde.cjs");
const { PAGINAS } = require("../seo/posicionar.cjs");
const { sinTema } = require("./marcas.cjs");

const AQUI = __dirname;
const FUENTE_COLOR = fs.readFileSync(path.join(AQUI, "color.js"), "utf8");
const colorOscuro = new Function(FUENTE_COLOR + "\nreturn colorOscuro;")();
const COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\bwhite\b|\bblack\b/g;
const PREFIJO = 'html[data-tema="oscuro"]';

/* ── La paleta oscura que ya existe: la de la portada oscura ────────────── */
function fichasOscuras() {
  const h = fs.readFileSync(path.join(CASTELLANO, "oscuro.html"), "utf8");
  const root = (h.match(/:root\s*\{([\s\S]*?)\}/) || [])[1] || "";
  const fichas = {};
  for (const m of root.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    if (/url\(/.test(m[2])) continue;
    fichas[m[1]] = m[2].trim();
  }
  /* La tinta terciaria de la portada oscura (blanco al 35%) se queda en un
     contraste de 2,9 sobre el negro; en claro la misma tinta pasa de 4,5. En
     las páginas interiores hay etiquetas y precios con ella: sube al 50%. */
  for (const [ficha, valor] of Object.entries(fichas)) {
    const m = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/.exec(valor);
    if (/^--text/.test(ficha) && m && +m[1] > 200 && +m[4] < 0.5) fichas[ficha] = `rgba(${m[1]},${m[2]},${m[3]},0.5)`;
  }
  return fichas;
}
const FICHAS = fichasOscuras();

/* ── LA PORTADA TIENE GEMELA OSCURA ─────────────────────────────────────────
   es/oscuro.html es la misma portada, pintada a mano en oscuro y aprobada. Para
   la portada no se adivina: cada regla y cada estilo en línea que existe en las
   dos toma el valor de la gemela. La regla genérica se queda para lo que la
   gemela no tiene. Así las medallas —oro sobre oro, plata sobre plata— salen
   como se diseñaron, y no con la tinta aclarada encima del metal. */
const GEMELAS = { index: "oscuro.html" };
const ATRIBUTOS_GEMELOS = ["style", "fill", "stroke", "stop-color"];
const clave = (prelude, selector) => (prelude + "|" + selector).replace(/\s+/g, " ").trim();

function cssDe(html) {
  return [...html.matchAll(/<style(?![^>]*id="tema-)[^>]*>([\s\S]*?)<\/style>/g)]
    .map((m) => m[1].replace(/\/\*[\s\S]*?\*\//g, ""))
    .join("\n");
}

function gemelaDe(slug, htmlClaro) {
  if (!GEMELAS[slug]) return null;
  const oscuro = sinTema(fs.readFileSync(path.join(CASTELLANO, GEMELAS[slug]), "utf8")).split("\r\n").join("\n");
  const reglas = new Map();
  const recorre = (lista, prelude) => {
    for (const b of lista) {
      if (b.tipo === "at") { recorre(b.hijos, prelude + b.prelude); continue; }
      const decl = new Map();
      for (const d of declaraciones(b.cuerpo)) decl.set(d.prop, d.valor);
      reglas.set(clave(prelude, b.selector), decl);
    }
  };
  recorre(bloques(cssDe(oscuro)), "");

  return { reglas, oscuro };
}

/* CADA ELEMENTO LLEVA SU VALOR OSCURO. Los estilos en línea y los colores de
   SVG de la portada no se traducen por valor —un mismo azul es tinta en un
   sello y relleno translúcido en otro—, sino elemento a elemento: se alinean
   las etiquetas de las dos portadas (etiqueta, clase y nombres de atributo; la
   subsecuencia común más larga, así una etiqueta de más en una no descoloca
   al resto) y cada elemento emparejado recibe data-tema-fill="…",
   data-tema-style="…"… con el valor de la gemela. El motor usa ese valor en
   vez de la regla genérica; sinTema() los quita. */
function etiquetas(html) {
  /* Dentro de <script> y <style> no hay elementos: se tapan, con el mismo largo. */
  const tapado = html.replace(/(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2>)/gi, (m, abre, _n, dentro, cierra) => abre + " ".repeat(dentro.length) + cierra);
  const inicio = tapado.indexOf("<body");
  const lista = [];
  for (const m of tapado.slice(inicio).matchAll(/<([a-zA-Z][\w:-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*\/?>/g)) {
    const attrs = new Map([...m[2].matchAll(/([\w:-]+)(?:="([^"]*)")?/g)].map((x) => [x[1], x[2] || ""]));
    const forma = m[1] + "." + (attrs.get("class") || "") + "|" + [...attrs.keys()].sort().join(",");
    lista.push({ forma, attrs, fin: inicio + m.index + m[1].length + 1 });
  }
  return lista;
}

const tieneColor = (v) => { COLOR.lastIndex = 0; const si = COLOR.test(v); COLOR.lastIndex = 0; return si; };

function marcarGemela(htmlClaro, htmlOscuro) {
  const A = etiquetas(htmlClaro), B = etiquetas(htmlOscuro);
  const n = A.length, m = B.length;
  /* Subsecuencia común más larga sobre las formas de las etiquetas. */
  const tabla = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      tabla[i][j] = A[i].forma === B[j].forma ? tabla[i + 1][j + 1] + 1 : Math.max(tabla[i + 1][j], tabla[i][j + 1]);
  const inserciones = [];
  let emparejados = 0;
  for (let i = 0, j = 0; i < n && j < m;) {
    if (A[i].forma === B[j].forma) {
      emparejados++;
      const extra = ATRIBUTOS_GEMELOS
        .filter((x) => A[i].attrs.has(x) && B[j].attrs.has(x) && tieneColor(A[i].attrs.get(x) + " " + B[j].attrs.get(x)))
        .map((x) => " data-tema-" + x + '="' + B[j].attrs.get(x) + '"').join("");
      if (extra) inserciones.push([A[i].fin, extra]);
      i++; j++;
    } else if (tabla[i + 1][j] >= tabla[i][j + 1]) i++;
    else j++;
  }
  let salida = htmlClaro;
  for (let k = inserciones.length - 1; k >= 0; k--) {
    const [pos, extra] = inserciones[k];
    salida = salida.slice(0, pos) + extra + salida.slice(pos);
  }
  return { html: salida, emparejados, total: n, marcados: inserciones.length };
}

/* ── Un lector de CSS lo justo para esto ────────────────────────────────────
   Reglas, @media/@supports con sus reglas dentro, y lo demás (@keyframes,
   @font-face) se salta: una animación no se puede acotar a un tema. */
function bloques(css) {
  const salida = [];
  let i = 0;
  while (i < css.length) {
    const abre = css.indexOf("{", i);
    if (abre < 0) break;
    const prelude = css.slice(i, abre).trim();
    let nivel = 1, j = abre + 1, comilla = null;
    for (; j < css.length && nivel > 0; j++) {
      const ch = css[j];
      if (comilla) { if (ch === comilla && css[j - 1] !== "\\") comilla = null; continue; }
      if (ch === '"' || ch === "'") comilla = ch;
      else if (ch === "{") nivel++;
      else if (ch === "}") nivel--;
    }
    const cuerpo = css.slice(abre + 1, j - 1);
    if (prelude.startsWith("@media") || prelude.startsWith("@supports")) {
      salida.push({ tipo: "at", prelude, hijos: bloques(cuerpo) });
    } else if (!prelude.startsWith("@")) {
      salida.push({ tipo: "regla", selector: prelude, cuerpo });
    }
    i = j;
  }
  return salida;
}

function declaraciones(cuerpo) {
  const partes = [];
  let actual = "", parentesis = 0, comilla = null;
  for (const ch of cuerpo) {
    if (comilla) { actual += ch; if (ch === comilla) comilla = null; continue; }
    if (ch === '"' || ch === "'") { comilla = ch; actual += ch; continue; }
    if (ch === "(") parentesis++;
    if (ch === ")") parentesis--;
    if (ch === ";" && parentesis === 0) { partes.push(actual); actual = ""; continue; }
    actual += ch;
  }
  if (actual.trim()) partes.push(actual);
  return partes.map((d) => {
    const k = d.indexOf(":");
    return k < 0 ? null : { prop: d.slice(0, k).trim(), valor: d.slice(k + 1).trim() };
  }).filter(Boolean);
}

/* La barra y el pie ya van en oscuro siempre: sus reglas no se convierten, o
   se aclararían. Se reconocen por el selector. */
const ES_BARRA_O_PIE = /(^|[\s>+~,(])(nav|footer)(?![\w-])|\.nav-|\.footer-|\.nav\b|\.footer\b/;

function acotar(selector) {
  const partes = [];
  let actual = "", parentesis = 0;
  for (const ch of selector) {
    if (ch === "(") parentesis++;
    if (ch === ")") parentesis--;
    if (ch === "," && parentesis === 0) { partes.push(actual.trim()); actual = ""; continue; }
    actual += ch;
  }
  partes.push(actual.trim());
  return partes
    .filter((s) => s && !ES_BARRA_O_PIE.test(s))
    .map((s) => {
      if (s.startsWith(":root")) return PREFIJO + s.slice(5);
      if (/^html(?![\w-])/.test(s)) return PREFIJO + s.slice(4);
      return PREFIJO + " " + s;
    });
}

const PROPS_TINTA = /^(color|fill|stroke|caret-color|-webkit-text-fill-color|stop-color)$|^--(text|ink|fg)\b|^--[\w-]*-(ink|text)$/i;
/* Piezas pequeñas en un estado —la bola de un interruptor marcado, una casilla
   activa, un adorno ::before— que en claro son blancas ENCIMA de un color: se
   quedan blancas, como la tinta. */
const SELECTOR_DE_ESTADO = /:checked|\.activo\b|\.active\b|::?before|::?after|\.casilla/;
function uso(prop, selector) {
  if (/shadow/i.test(prop)) return "sombra";
  if (PROPS_TINTA.test(prop) || SELECTOR_DE_ESTADO.test(selector)) return "tinta";
  return "";
}
function convertir(valor, prop, selector, recortaTexto) {
  /* Un fondo recortado a la forma del texto es tinta, no fondo. */
  const u = recortaTexto && /^background/.test(prop) ? "tinta" : uso(prop, selector);
  return valor.replace(COLOR, (c) => colorOscuro(c, u));
}

/* Luminosidad 0-1 de un #hex opaco; null si no lo es. */
function luz(valor) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(valor).trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split("").map((x) => x + x).join("") : m[1];
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return (Math.max(...c) + Math.min(...c)) / 2;
}
const BLANCO = /^(#fff|#ffffff|white|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))$/i;

function cssOscuro(lista, claros, gemela, prelude = "") {
  /* Los valores CLAROS de las fichas de esta página, para el caso de abajo. */
  if (!claros) {
    claros = {};
    for (const b of lista) if (b.tipo !== "at" && /^:root\b/.test(b.selector.trim()))
      for (const d of declaraciones(b.cuerpo)) if (d.prop.startsWith("--")) claros[d.prop] = d.valor;
  }
  const out = [];
  for (const b of lista) {
    if (b.tipo === "at") {
      const dentro = cssOscuro(b.hijos, claros, gemela, prelude + b.prelude);
      if (dentro) out.push(`${b.prelude}{${dentro}}`);
      continue;
    }
    const selectores = acotar(b.selector);
    if (!selectores.length) continue;
    const esRaiz = /^:root\b/.test(b.selector.trim());
    const cambios = [];
    const lista = declaraciones(b.cuerpo);
    const gemelas = !esRaiz && gemela ? gemela.reglas.get(clave(prelude, b.selector)) : null;
    if (gemelas) {
      for (const { prop, valor } of lista) {
        const oscuro = gemelas.get(prop);
        if (oscuro !== undefined && oscuro !== valor) cambios.push(`${prop}:${oscuro}`);
      }
      if (cambios.some((c) => c.startsWith("background:")))
        for (const d of lista) if (/^(-webkit-)?background-clip$/.test(d.prop) && /text/.test(d.valor)) cambios.push(`${d.prop}:${d.valor}`);
      if (cambios.length) out.push(`${selectores.join(",")}{${cambios.join(";")}}`);
      continue;
    }
    /* TEXTO CON DEGRADADO. `background:` es un atajo que devuelve
       `background-clip` a su valor inicial: al reescribirlo hay que volver a
       poner el recorte, o el degradado sale como un rectángulo detrás del texto. */
    const recortes = lista.filter((d) => /^(-webkit-)?background-clip$/.test(d.prop) && /text/.test(d.valor));
    for (const { prop, valor } of lista) {
      if (esRaiz && prop.startsWith("--") && FICHAS[prop] !== undefined) {
        if (FICHAS[prop] !== valor) cambios.push(`${prop}:${FICHAS[prop]}`);
        continue;
      }
      /* Las máscaras usan el color sólo como transparencia. */
      if (/mask/i.test(prop)) continue;
      if (!COLOR.test(valor)) { COLOR.lastIndex = 0; continue; }
      COLOR.lastIndex = 0;
      const nuevo = convertir(valor, prop, b.selector, recortes.length > 0);
      if (nuevo !== valor) cambios.push(`${prop}:${nuevo}`);
    }
    if (cambios.some((c) => c.startsWith("background:"))) for (const d of recortes) cambios.push(`${d.prop}:${d.valor}`);
    /* TEXTO BLANCO SOBRE UNA FICHA QUE SE ACLARA. `background: var(--text);
       color: white` es una píldora oscura en claro; en oscuro --text es casi
       blanca y el texto dejaría de verse. La píldora se queda con su valor
       claro, oscuro, como cualquier superficie oscura a propósito; el borde sí
       se aclara, y es lo que la marca como activa. */
    if (lista.some((d) => d.prop === "color" && BLANCO.test(d.valor))) {
      for (const { prop, valor } of lista) {
        if (!/^background(-color)?$/.test(prop)) continue;
        const nuevo = valor.replace(/var\((--[\w-]+)\)/g, (todo, ficha) => {
          const antes = luz(claros[ficha]), despues = luz(FICHAS[ficha]);
          return antes !== null && despues !== null && antes < 0.2 && despues > 0.5 ? claros[ficha] : todo;
        });
        if (nuevo !== valor) cambios.push(`${prop}:${nuevo}`);
      }
    }
    if (cambios.length) out.push(`${selectores.join(",")}{${cambios.join(";")}}`);
  }
  return out.join("\n");
}

/* ── Las piezas que van en la página ────────────────────────────────────── */
const ICONO_LUNA = '<svg class="tema-luna" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
const ICONO_SOL = '<svg class="tema-sol" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

const TEXTOS = {
  es: { aOscuro: "Cambiar a modo oscuro", aClaro: "Cambiar a modo claro" },
  en: { aOscuro: "Switch to dark mode", aClaro: "Switch to light mode" },
};

/* De 7 de la tarde a 7 de la mañana, con el reloj de quien visita, salvo que
   haya elegido a mano. */
const ARRANQUE = `<script id="tema-arranque">(function(){var t=null;try{t=localStorage.getItem('clerigo-tema')}catch(e){}if(t!=='oscuro'&&t!=='claro'){var h=new Date().getHours();t=(h>=19||h<7)?'oscuro':'claro'}document.documentElement.setAttribute('data-tema',t)})();</script>`;

const ESTILO_BASE = `
.tema-toggle{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:34px;height:34px;margin-left:8px;padding:0;border-radius:8px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);color:#F0F0F0;cursor:pointer;transition:background .15s,border-color .15s,transform .15s}
.tema-toggle:hover{background:rgba(255,255,255,0.10);border-color:rgba(255,255,255,0.26)}
.tema-toggle:active{transform:scale(.94)}
.tema-toggle:focus-visible{outline:2px solid #EB1000;outline-offset:2px}
.tema-toggle svg{width:16px;height:16px;display:block}
.tema-toggle .tema-sol{display:none}
${PREFIJO} .tema-toggle .tema-sol{display:block}
${PREFIJO} .tema-toggle .tema-luna{display:none}
/* El segundo botón: sólo donde el primero se oculta en móvil (partners). */
.tema-toggle-movil{display:none}
@media (max-width:820px){.rp{flex-direction:column}.tema-toggle-movil{display:inline-flex;align-self:flex-end;margin:0 0 10px;color:var(--text);background:var(--dark-2);border-color:var(--border-light)}}
${PREFIJO}{color-scheme:dark}`;

function boton(idioma, movil) {
  const t = TEXTOS[idioma];
  const clase = movil ? "tema-toggle tema-toggle-movil" : "tema-toggle";
  const id = movil ? "temaToggleMovil" : "temaToggle";
  return `<button type="button" class="${clase}" id="${id}" aria-label="${t.aOscuro}" title="${t.aOscuro}">${ICONO_LUNA}${ICONO_SOL}</button>`;
}

/* PÁGINAS DONDE EL SELECTOR DE IDIOMA SE OCULTA EN MÓVIL, y con él el botón.
   En partners el panel de marca entero desaparece por debajo de 820 px: el
   segundo botón va encima de la tarjeta, y sólo se ve ahí. */
const BOTON_MOVIL = { partners: '<div class="rp">' };

function motor(idioma) {
  const t = TEXTOS[idioma];
  return `<script id="tema-motor">
(function () {
${FUENTE_COLOR.replace(/^\/\*[\s\S]*?\*\/\s*/, "")}
  var R = document.documentElement, CLAVE = 'clerigo-tema';
  var COLOR = /#[0-9a-fA-F]{3,8}\\b|rgba?\\([^)]*\\)|\\bwhite\\b|\\bblack\\b/g;
  var ATRIBUTOS = ['style', 'fill', 'stroke', 'stop-color'];
  var guardados = new WeakMap();
  function preferido() { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } }
  function porHora() { var h = new Date().getHours(); return (h >= 19 || h < 7) ? 'oscuro' : 'claro'; }
  function oscuro() { return R.getAttribute('data-tema') === 'oscuro'; }
  function convertirValor(v, atributo) {
    return v.replace(COLOR, function (c, i) {
      if (atributo !== 'style') return colorOscuro(c, 'tinta');
      var antes = v.slice(0, i), prop = (antes.slice(antes.lastIndexOf(';') + 1).split(':')[0] || '').trim().toLowerCase();
      var u = /shadow/.test(prop) ? 'sombra' : /^(color|fill|stroke|caret-color|-webkit-text-fill-color|stop-color)$/.test(prop) ? 'tinta' : '';
      return colorOscuro(c, u);
    });
  }
  function aplicar(el) {
    if (!el || el.nodeType !== 1 || (el.closest && el.closest('nav, footer'))) return;
    var d = guardados.get(el) || {};
    for (var k = 0; k < ATRIBUTOS.length; k++) {
      var a = ATRIBUTOS[k], actual = el.getAttribute(a);
      if (actual === null) continue;
      var reg = d[a];
      if (!reg || (actual !== reg.claro && actual !== reg.oscuro)) {
        COLOR.lastIndex = 0;
        if (!COLOR.test(actual)) { COLOR.lastIndex = 0; continue; }
        COLOR.lastIndex = 0;
        /* El valor hecho a mano, si el elemento lo trae (la portada). */
        var gemelo = el.getAttribute('data-tema-' + a);
        reg = d[a] = { claro: actual, oscuro: gemelo !== null ? gemelo : convertirValor(actual, a) };
      }
      var quiero = oscuro() ? reg.oscuro : reg.claro;
      if (actual !== quiero) el.setAttribute(a, quiero);
    }
    guardados.set(el, d);
  }
  var SELECTOR = '[style],[fill],[stroke],[stop-color]';
  function todo() { var l = document.querySelectorAll(SELECTOR); for (var i = 0; i < l.length; i++) aplicar(l[i]); }
  var botones = document.querySelectorAll('.tema-toggle');
  function pintarBoton() {
    var etiqueta = oscuro() ? ${JSON.stringify(t.aClaro)} : ${JSON.stringify(t.aOscuro)};
    for (var i = 0; i < botones.length; i++) {
      var b = botones[i];
      b.setAttribute('aria-label', etiqueta); b.setAttribute('title', etiqueta);
      b.setAttribute('aria-pressed', oscuro() ? 'true' : 'false');
    }
  }
  function poner(tema, recordar) {
    R.setAttribute('data-tema', tema);
    if (recordar) { try { localStorage.setItem(CLAVE, tema); } catch (e) {} }
    todo(); pintarBoton();
  }
  todo(); pintarBoton();
  new MutationObserver(function (cambios) {
    for (var i = 0; i < cambios.length; i++) {
      var c = cambios[i];
      if (c.type === 'attributes') { aplicar(c.target); continue; }
      for (var j = 0; j < c.addedNodes.length; j++) {
        var n = c.addedNodes[j];
        if (n.nodeType !== 1) continue;
        aplicar(n);
        var dentro = n.querySelectorAll ? n.querySelectorAll(SELECTOR) : [];
        for (var k = 0; k < dentro.length; k++) aplicar(dentro[k]);
      }
    }
  }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ATRIBUTOS });
  for (var i = 0; i < botones.length; i++)
    botones[i].addEventListener('click', function () { poner(oscuro() ? 'claro' : 'oscuro', true); });
  /* Con la página abierta, a las 7 cambia sola —si nadie ha elegido a mano—. */
  setInterval(function () {
    var p = preferido();
    if (p === 'oscuro' || p === 'claro') return;
    var t = porHora();
    if (t !== R.getAttribute('data-tema')) poner(t, false);
  }, 60000);
  window.clerigoTema = { poner: poner, porHora: porHora };
})();
</script>`;
}

/* ── Aplicar a las catorce páginas ─────────────────────────────────────── */
function aplicarATodas() {
  const filas = [];
  for (const [carpeta, idioma] of [[CASTELLANO, "es"], [INGLES, "en"]]) {
    for (const p of PAGINAS) {
      if (p.slug === "login") continue;
      const f = path.join(carpeta, p.disco[idioma]);
      if (!fs.existsSync(f)) continue;
      const antes = fs.readFileSync(f, "utf8");
      const crlf = antes.includes("\r\n");
      let h = sinTema(antes).split("\r\n").join("\n");

      const css = [...h.matchAll(/<style(?![^>]*id="tema-)[^>]*>([\s\S]*?)<\/style>/g)]
        .map((m) => m[1].replace(/\/\*[\s\S]*?\*\//g, ""))
        .join("\n");
      const gemela = gemelaDe(p.slug, h);
      if (gemela) h = marcarGemela(h, gemela.oscuro).html;
      const generado = cssOscuro(bloques(css), null, gemela);
      const estilo = `<style id="tema-oscuro">${ESTILO_BASE}\n${generado}\n</style>`;

      if (!h.includes('<div class="idiomas">')) throw new Error(`${idioma}/${p.disco[idioma]}: no encuentro el selector de idioma`);
      h = h.replace("</head>", `${ARRANQUE}\n${estilo}\n</head>`);
      h = h.replace(/(<div class="idiomas">[\s\S]*?<\/div>)/, `$1${boton(idioma)}`);
      const ancla = BOTON_MOVIL[p.slug];
      if (ancla) {
        if (!h.includes(ancla)) throw new Error(`${idioma}/${p.disco[idioma]}: no encuentro ${ancla} para el botón de móvil`);
        h = h.replace(ancla, () => `${ancla}\n  ${boton(idioma, true)}`);
      }
      const fin = h.lastIndexOf("</body>");
      h = h.slice(0, fin) + motor(idioma) + "\n" + h.slice(fin);

      const salida = crlf ? h.split("\n").join("\r\n") : h;
      if (salida !== antes) fs.writeFileSync(f, salida);
      filas.push(`  ${(idioma + "/" + p.disco[idioma]).padEnd(22)} ${(generado.length / 1024).toFixed(1).padStart(5)} KB de CSS oscuro · ${generado.split("\n").filter(Boolean).length} reglas`);
    }
  }
  filas.forEach((l) => console.log(l));
  console.log(`\n  ${filas.length} páginas con tema oscuro (19:00–07:00, hora de quien visita, y botón sol/luna)\n`);
}

if (require.main === module) aplicarATodas();

module.exports = { colorOscuro, cssOscuro, bloques, acotar, FICHAS, BOTON_MOVIL, aplicarATodas };
