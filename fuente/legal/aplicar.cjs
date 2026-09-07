/**
 * PONE EN EL LANDING LOS TEXTOS LEGALES DE LA APLICACIÓN.
 *
 *   node fuente/legal/aplicar.cjs
 *
 * Lee `documentos.json` —la copia que trae `traer-de-la-app.cjs`— y reescribe
 * las tres secciones de `es/legal.html`. De paso mete el inglés en el
 * diccionario del landing, para que `a-ingles.cjs` genere `legal.html` con la
 * MISMA traducción que usa el producto y no con otra hecha aparte.
 *
 * QUÉ SE SUSTITUYE Y QUÉ NO. Se sustituye lo que obliga —los apartados
 * numerados—, la entradilla, la fecha de actualización y el titular de cada
 * documento, que es el `sumario` de la aplicación. NO se toca la barra lateral
 * ni las pestañas: son navegación del landing, no texto del contrato, y sus
 * anclas siguen siendo las mismas (t1…t13, p1…p11, c1…c6).
 *
 * LO QUE SE PIERDE, dicho aquí para que nadie lo descubra por sorpresa: los dos
 * recuadros de contacto con su icono pasan a ser listas, porque en la
 * aplicación esos bloques son listas y aquí no se inventa estructura que el
 * original no tiene. Y los avisos salen todos del mismo color: la aplicación no
 * distingue entre unos y otros, y elegir el color aquí sería decidir por mi
 * cuenta cuál es más grave.
 */
const fs = require("node:fs");
const path = require("node:path");

const AQUI = __dirname;
const RAIZ = path.join(AQUI, "..", "..");
const FUENTE = path.join(RAIZ, "es", "legal.html");
const DIC = path.join(RAIZ, "fuente", "idiomas", "en.json");
const COPIA = path.join(AQUI, "documentos.json");

/* Qué sección del landing lleva qué documento, y con qué prefijo van sus
   anclas. El prefijo NO se deduce del id: se declara, porque de él cuelgan los
   enlaces de la barra lateral y adivinarlo es como se rompen en silencio. */
const DONDE = [
  { doc: "terminos", seccion: "section-terms", ancla: "t" },
  { doc: "privacidad", seccion: "section-privacy", ancla: "p" },
  { doc: "cookies", seccion: "section-cookies", ancla: "c" },
];

const ICONO_AVISO = '<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

/**
 * LA JURISDICCIÓN QUE SE ANUNCIA EN LA CABECERA.
 *
 * La cabecera de la página resume el contrato en cuatro datos, y uno es la
 * jurisdicción. Decía «República Dominicana» mientras el apartado 12 decía
 * Delaware: una página contradiciéndose a sí misma, que es peor que no
 * resumir nada.
 *
 * La aplicación no guarda este dato en un campo, así que se declara aquí. No
 * se inventa: `validar.cjs` comprueba que la frase de abajo aparezca de verdad
 * en el apartado de ley aplicable. El día que cambie el contrato, salta.
 */
const JURISDICCION = { rotulo: "Delaware, Estados Unidos", enElTexto: "leyes del Estado de Delaware, Estados Unidos" };

const escapa = (t) => String(t)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * LOS CORREOS VAN EN TEXTO PLANO, Y NO ES UN OLVIDO.
 *
 * La página los tenía como enlaces `mailto:`, que se agradece. Pero envolver el
 * correo en una etiqueta PARTE EL PÁRRAFO EN TRES trozos para el traductor —lo
 * de antes, el correo, y lo de después— y ninguno de los tres coincide ya con
 * la frase entera, que es la clave del diccionario. El resultado era medio
 * párrafo del contrato en castellano dentro de la página inglesa.
 *
 * Entre un correo pinchable y un contrato traducido entero, el contrato.
 */
const conCorreos = escapa;

function bloqueHtml(b, s = "        ") {
  if (b.t === "p") return s + "<p>" + conCorreos(b.texto) + "</p>";
  if (b.t === "aviso") {
    return [
      s + '<div class="info-box blue">',
      s + '  <div class="info-box-icon">' + ICONO_AVISO + "</div>",
      s + "  <span>" + conCorreos(b.texto) + "</span>",
      s + "</div>",
    ].join("\n");
  }
  if (b.t === "lista") {
    return [s + "<ul>"]
      .concat(b.items.map((i) => s + "  <li>" +
        (i.fuerte ? "<strong>" + escapa(i.fuerte) + "</strong> " : "") + conCorreos(i.texto) + "</li>"))
      .concat([s + "</ul>"]).join("\n");
  }
  if (b.t === "tabla") {
    return [
      s + '<table class="data-table">',
      s + "  <thead>",
      s + "    <tr>" + b.cols.map((c) => "<th>" + escapa(c) + "</th>").join("") + "</tr>",
      s + "  </thead>",
      s + "  <tbody>",
    ].concat(b.filas.map((f) => s + "    <tr>" + f.map((c, k) =>
      "<td>" + (k === 0 ? "<strong>" + conCorreos(c) + "</strong>" : conCorreos(c)) + "</td>").join("") + "</tr>"))
      .concat([s + "  </tbody>", s + "</table>"]).join("\n");
  }
  throw new Error("bloque de tipo desconocido: " + b.t);
}

function seccionesHtml(doc, ancla) {
  return doc.secciones.map((sec, k) => [
    '      <div class="article-block" id="' + ancla + (k + 1) + '">',
    '        <h3><span class="num">' + escapa(sec.n) + "</span> " + escapa(sec.titulo) + "</h3>",
    sec.bloques.map((b) => bloqueHtml(b)).join("\n"),
    "      </div>",
  ].join("\n")).join("\n\n");
}

/**
 * «20 de agosto de 2026» a un número que se puede ordenar.
 *
 * Hace falta para saber cuál de los tres documentos se revisó el último, que es
 * la fecha que va en la cabecera. Comparar las cadenas tal cual pondría «21 de
 * abril» por delante de «20 de agosto».
 */
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
function comoNumero(fecha) {
  const m = /^(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})$/i.exec(String(fecha).trim());
  if (!m) throw new Error("no sé leer la fecha «" + fecha + "»: la aplicación la escribe de otra forma");
  const mes = MESES.indexOf(m[2].toLowerCase());
  if (mes < 0) throw new Error("mes desconocido en «" + fecha + "»");
  return Number(m[3]) * 10000 + (mes + 1) * 100 + Number(m[1]);
}

/** Cambia una sola vez, y si no encuentra el sitio se para. */
function unaVez(texto, viejo, nuevo, que) {
  const veces = texto.split(viejo).length - 1;
  if (veces !== 1) throw new Error(que + ": esperaba 1 sitio y hay " + veces);
  return texto.split(viejo).join(nuevo);
}

if (require.main === module) {
  const copia = JSON.parse(fs.readFileSync(COPIA, "utf8"));
  let html = fs.readFileSync(FUENTE, "utf8");
  const crlf = html.includes("\r\n");
  const fin = (t) => (crlf ? t.split("\n").join("\r\n") : t);

  for (const { doc, seccion, ancla } of DONDE) {
    const d = copia.documentos.find((x) => x.id === doc);
    if (!d) throw new Error("la copia no trae el documento " + doc);

    /* El trozo de la sección, para no tocar las otras dos sin querer. */
    const abre = html.indexOf('<section class="legal-section', html.indexOf('id="' + seccion + '"') - 200);
    const iId = html.indexOf('id="' + seccion + '"');
    if (iId < 0) throw new Error("no encuentro la sección " + seccion);
    const iAbre = html.lastIndexOf("<section", iId);
    const iCierra = html.indexOf("</section>", iId);
    if (iAbre < 0 || iCierra < 0) throw new Error("la sección " + seccion + " no está bien cerrada");
    let trozo = html.slice(iAbre, iCierra);

    /* 1. El titular: es el `sumario` de la aplicación, sin el punto final. */
    const h2 = trozo.match(/<h2>[\s\S]*?<\/h2>/);
    if (!h2) throw new Error(seccion + ": no encuentro el <h2>");
    trozo = unaVez(trozo, h2[0], "<h2>" + escapa(d.sumario.replace(/\.$/, "")) + "</h2>", seccion + " h2");

    /* 2. La entradilla: el <p> que va justo detrás del titular. */
    const p = trozo.match(/<h2>[\s\S]*?<\/h2>\s*\r?\n\s*<p>[\s\S]*?<\/p>/);
    if (!p) throw new Error(seccion + ": no encuentro la entradilla");
    trozo = unaVez(trozo, p[0],
      p[0].replace(/<p>[\s\S]*?<\/p>/, "<p>" + conCorreos(d.entradilla) + "</p>"), seccion + " entradilla");

    /* 3. La fecha. Se cambia SOLO lo que va entre <strong>: el resto de la
          frase del aviso es del landing y dice cosas distintas en cada uno. */
    const fecha = trozo.match(/(Última actualización:\s*<strong>)([^<]*)(<\/strong>)/);
    if (!fecha) throw new Error(seccion + ": no encuentro la fecha");
    trozo = unaVez(trozo, fecha[0], fecha[1] + escapa(d.actualizado) + fecha[3], seccion + " fecha");

    /* 4. Y los apartados, enteros. */
    const iPrimero = trozo.indexOf('<div class="article-block"');
    if (iPrimero < 0) throw new Error(seccion + ": no hay apartados que sustituir");
    trozo = trozo.slice(0, iPrimero) + fin(seccionesHtml(d, ancla)) + fin("\n\n    ");

    html = html.slice(0, iAbre) + trozo + html.slice(iCierra);
    console.log("  " + seccion.padEnd(16) + d.secciones.length + " apartados · " + d.actualizado);
  }

  /* LA CABECERA, que resume el contrato en cuatro datos y los tenía los tres
     que dependen de la aplicación desfasados: versión 2.1 cuando la aplicación
     iba por la 2.4, revisión de marzo cuando los documentos son de agosto, y
     jurisdicción República Dominicana cuando el apartado 12 dice Delaware.
     «Vigente desde» se queda: es dato del landing y no lo contradice nadie. */
  const masReciente = copia.documentos.map((d) => d.actualizado)
    .reduce((a, b) => (comoNumero(b) > comoNumero(a) ? b : a));
  html = unaVez(html, /<span><strong>Versión:<\/strong>[^<]*<\/span>/.exec(html)[0],
    "<span><strong>Versión:</strong> " + escapa(copia.version) + "</span>", "cabecera versión");
  html = unaVez(html, /<span><strong>Última revisión:<\/strong>[^<]*<\/span>/.exec(html)[0],
    "<span><strong>Última revisión:</strong> " + escapa(masReciente) + "</span>", "cabecera revisión");
  html = unaVez(html, /<span><strong>Jurisdicción:<\/strong>[^<]*<\/span>/.exec(html)[0],
    "<span><strong>Jurisdicción:</strong> " + escapa(JURISDICCION.rotulo) + "</span>", "cabecera jurisdicción");
  console.log("\n  cabecera: versión " + copia.version + " · revisión " + masReciente + " · " + JURISDICCION.rotulo);

  fs.writeFileSync(FUENTE, html);

  /* Y el inglés al diccionario del landing, sin pisar lo que ya hubiera. */
  const dic = JSON.parse(fs.readFileSync(DIC, "utf8"));
  let nuevas = 0;
  const mete = (es, en) => {
    if (!es || !String(es).trim()) return;
    if (Object.prototype.hasOwnProperty.call(dic, es)) return;
    dic[es] = en; nuevas++;
  };
  for (const [es, en] of Object.entries(copia.en)) {
    /* Las que se escriben igual en los dos idiomas —la marca, los correos, los
       nombres técnicos de las cookies— TAMBIÉN entran, con su traducción igual
       a sí mismas. No es redundante: es la forma de DECLARAR que no se
       traducen. Sin la entrada, el aviso de «esto se quedó sin traducir» las
       cuenta como pendientes para siempre y acaba siendo ruido que se ignora. */
    mete(es, en);
  }
  /* El titular de cada documento se enseña sin el punto final, así que esa
     forma es otra clave. Se deriva de la misma pareja para que no puedan
     decir cosas distintas. */
  for (const d of copia.documentos) {
    const en = copia.en[d.sumario];
    if (en) mete(d.sumario.replace(/\.$/, ""), en.replace(/\.$/, ""));
  }
  /* Y la jurisdicción de la cabecera, que se declara aquí y no sale de la
     aplicación: sin entrada, la página inglesa diría «Delaware, Estados
     Unidos» en mitad de una frase en inglés. */
  mete(JURISDICCION.rotulo, "Delaware, United States");
  const ordenado = {};
  for (const k of Object.keys(dic).sort()) ordenado[k] = dic[k];
  fs.writeFileSync(DIC, JSON.stringify(ordenado, null, 2) + "\n");
  console.log("\n  " + nuevas + " entradas nuevas en el diccionario (" + Object.keys(ordenado).length + " en total)");
  console.log("  ahora: node fuente/idiomas/a-ingles.cjs\n");
}

module.exports = { bloqueHtml, seccionesHtml, DONDE, JURISDICCION, comoNumero };
