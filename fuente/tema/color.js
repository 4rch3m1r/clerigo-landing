/* LA REGLA DE COLOR DEL TEMA OSCURO. Una sola, y la usan los dos lados:
 *
 *   · `fuente/tema/oscuro.cjs` la aplica al CSS de cada página al generar el
 *     bloque `html[data-tema="oscuro"] …`;
 *   · el motor que va dentro de la página la aplica a lo que el CSS no alcanza:
 *     los atributos `style` y los colores de los SVG, también los que pinta la
 *     calculadora al vuelo.
 *
 * Por eso este fichero es JavaScript del navegador, sin `require` ni `export`:
 * el generador lo lee como texto, lo evalúa y lo incrusta tal cual. Si fueran
 * dos copias, un día una convertiría un gris y la otra no.
 *
 * QUÉ HACE CON CADA COLOR
 *
 *   · Los NEUTROS opacos claros se invierten sobre la escala de la portada
 *     oscura: el blanco de página (#FFFFFF) pasa a #0E0E0E, las superficies
 *     grises (#F7F8F9, #EFF1F3, #E5E8EB) a #141414-#222222, y la tinta
 *     (#16181C) a #F0F0F0. Una superficie que ya era oscura en claro —el panel
 *     de marca, un banner, la pestaña activa— lo es a propósito y se queda.
 *   · Los NEUTROS translúcidos oscuros cambian de tinta y conservan la
 *     transparencia: una línea negra al 10% sobre blanco es una línea blanca al
 *     10% sobre negro. En las sombras no: una sombra sigue siendo oscura. Los
 *     blancos translúcidos sólo viven sobre algo oscuro, y se quedan.
 *   · Los colores con TONO se quedan como están —el rojo de la marca, los de
 *     cada módulo—, salvo dos casos que dejarían de leerse: un fondo pastel muy
 *     claro pasa a una versión oscura del mismo tono, y una tinta de color
 *     oscura se aclara.
 *   · Lo que no es un color —`transparent`, `currentColor`, variables— no se
 *     toca.
 */
/*
 * `uso` dice para qué es el color: 'sombra', 'tinta' (color de texto, fill,
 * stroke) o nada (fondos, bordes). Importa en un caso: un BLANCO usado como
 * tinta se queda blanco. En claro sólo hay texto blanco encima de algo oscuro
 * o de color —el botón rojo—, y ese algo no cambia; invertirlo pondría texto
 * negro sobre rojo.
 */
function colorOscuro(valor, uso) {
  var esSombra = uso === true || uso === 'sombra';
  var esTinta = uso === 'tinta';
  var v = String(valor).trim();
  var low = v.toLowerCase();
  var r, g, b, a = 1, m;
  if (low === 'white') { r = 255; g = 255; b = 255; }
  else if (low === 'black') { r = 0; g = 0; b = 0; }
  else if (v.charAt(0) === '#') {
    var h = v.slice(1);
    if (h.length === 3 || h.length === 4) h = h.split('').map(function (c) { return c + c; }).join('');
    if (h.length !== 6 && h.length !== 8) return valor;
    r = parseInt(h.slice(0, 2), 16); g = parseInt(h.slice(2, 4), 16); b = parseInt(h.slice(4, 6), 16);
    if (h.length === 8) a = parseInt(h.slice(6, 8), 16) / 255;
    if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) return valor;
  } else if ((m = low.match(/^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/))) {
    r = +m[1]; g = +m[2]; b = +m[3];
    if (m[4] !== undefined) a = m[4].slice(-1) === '%' ? parseFloat(m[4]) / 100 : +m[4];
  } else {
    return valor;
  }

  var max = Math.max(r, g, b) / 255, min = Math.min(r, g, b) / 255;
  var l = (max + min) / 2;
  var croma = max - min;
  var neutro = croma < 0.08;

  function dos(n) { n = Math.round(Math.max(0, Math.min(255, n))); return (n < 16 ? '0' : '') + n.toString(16).toUpperCase(); }
  function sale(R, G, B, A) {
    return A >= 0.999
      ? '#' + dos(R) + dos(G) + dos(B)
      : 'rgba(' + Math.round(R) + ',' + Math.round(G) + ',' + Math.round(B) + ',' + (+Math.min(1, A).toFixed(3)) + ')';
  }
  function desdeHsl(H, S, L) {
    var q = L < 0.5 ? L * (1 + S) : L + S - L * S, p = 2 * L - q;
    function c(t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    return sale(c(H + 1 / 3) * 255, c(H) * 255, c(H - 1 / 3) * 255, 1);
  }
  function tono() {
    if (croma === 0) return 0;
    var R = r / 255, G = g / 255, B = b / 255, H;
    if (max === R) H = ((G - B) / croma) % 6;
    else if (max === G) H = (B - R) / croma + 2;
    else H = (R - G) / croma + 4;
    H /= 6; return H < 0 ? H + 1 : H;
  }
  function aclarada(A) {
    var c = desdeHsl(tono(), Math.min(1, saturacion()), 0.7);
    if (A >= 0.999) return c;
    return sale(parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16), A);
  }
  /* Una tinta que sobre el negro de página no llega a leerse bien: luminancia
     relativa por debajo de 0.15 (el rojo de marca, #EB1000, está en 0.18). */
  function apagada() {
    function f(x) { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) < 0.15;
  }
  function saturacion() { return croma === 0 ? 0 : croma / (1 - Math.abs(2 * l - 1)); }

  if (esSombra) return (neutro && l < 0.5) ? sale(0, 0, 0, Math.min(0.6, a * 2.2)) : valor;

  if (a < 0.999) {
    if (!neutro) {
      /* Una tinta de color oscura y translúcida no se lee sobre negro. */
      if (esTinta && apagada()) return aclarada(a);
      return valor;
    }
    if (l < 0.5) {
      /* Un negro translúcido DENSO en un fondo es un velo —el que oscurece la
         página detrás de un modal—: sigue siendo velo, y algo más denso. */
      if (!esTinta && a >= 0.3) return sale(0, 0, 0, Math.min(0.85, a * 1.25));
      return sale(240, 240, 240, a * 0.95);
    }
    /* Un blanco translúcido en claro sólo vive sobre algo oscuro —el panel de
       marca, un banner—, y ese algo se queda oscuro: se queda como está. Salvo
       un fondo blanco casi opaco, que es una superficie esmerilada de página. */
    if (esTinta || a < 0.5) return valor;
    return sale(14, 14, 14, a);
  }

  /* Un texto gris claro no se lee sobre blanco: en claro está encima de algo
     oscuro, que se queda oscuro. */
  if (neutro && esTinta && l > 0.6) return valor;
  /* Una SUPERFICIE que ya es oscura en claro —el panel de marca, la pestaña
     activa, un banner— es oscura a propósito, y su texto es claro: se queda. */
  if (neutro && !esTinta && l < 0.2) return valor;
  if (neutro) {
    var nl = l >= 0.1 ? 0.94 - (l - 0.1) * (0.885 / 0.9) : 0.94 + (0.1 - l) * 0.3;
    nl = Math.max(0.04, Math.min(0.97, nl));
    return sale(nl * 255, nl * 255, nl * 255, 1);
  }
  if (esTinta) return apagada() ? aclarada(1) : valor;
  if (l > 0.85) return desdeHsl(tono(), saturacion() * 0.45, 0.14);
  return valor;
}
