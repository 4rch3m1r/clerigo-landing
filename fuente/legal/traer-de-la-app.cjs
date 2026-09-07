/**
 * TRAE LOS TEXTOS LEGALES DESDE LA APLICACIÓN.
 *
 *   node fuente/legal/traer-de-la-app.cjs
 *
 * POR QUÉ. Los términos, la privacidad y las cookies se sirven desde el
 * producto —`app-saas/src/app/legal/documentos.ts`— y es ahí donde la gente los
 * acepta al registrarse. El landing tenía su propia copia, escrita aparte, y
 * las dos se separaron: el landing decía que el contrato se rige por las leyes
 * de la República Dominicana y la aplicación decía Delaware. Dos contratos
 * distintos para el mismo servicio no es un descuido de estilo.
 *
 * Manda la aplicación. Aquí no se reescribe una frase: se copia.
 *
 * POR QUÉ UNA INSTANTÁNEA Y NO LEER EL REPO DE LA APP AL GENERAR. El landing se
 * despliega solo, desde su propio repositorio; si su construcción dependiera de
 * tener `app-saas` al lado, el día que no esté se publica una página legal a
 * medias. Se trae la copia, se comitea, y `validar.cjs` de esta carpeta avisa
 * cuando la copia y la aplicación dejan de decir lo mismo.
 *
 * SE TRAEN LOS DOS IDIOMAS. El inglés no se traduce aquí: sale del diccionario
 * de la propia plataforma (`src/lib/traducciones/en.ts`), que es el que usa la
 * aplicación para servir esas mismas páginas. Traducir el contrato por segunda
 * vez y por otro camino es volver a tener dos textos.
 */
const fs = require("node:fs");
const path = require("node:path");

const AQUI = __dirname;
const RAIZ = path.join(AQUI, "..", "..");
const APP = path.join(RAIZ, "..", "app-saas");
const DOCS_TS = path.join(APP, "src", "app", "legal", "documentos.ts");
const EN_TS = path.join(APP, "src", "lib", "traducciones", "en.ts");
const SALIDA = path.join(AQUI, "documentos.json");

/**
 * Saca `VERSION` y `DOCUMENTOS` del fichero TypeScript.
 *
 * De TypeScript, ese fichero sólo tiene las declaraciones de tipo de arriba y
 * las anotaciones de los `const`: los datos son objetos literales. Se corta
 * desde `export const VERSION`, se quitan las anotaciones y se evalúa. No se
 * lee el HTML que sirve el servidor a propósito: el texto de un contrato tiene
 * que salir de donde lo escribieron, no de una página que puede estar
 * traducida, paginada o a medio pintar.
 */
function documentosDeLaApp() {
  if (!fs.existsSync(DOCS_TS)) {
    throw new Error("no encuentro " + DOCS_TS + "\n  El landing se construye sin esto; " +
      "sólo hace falta para REFRESCAR la copia. Clona app-saas al lado del landing.");
  }
  const s = fs.readFileSync(DOCS_TS, "utf8");
  const i = s.indexOf("export const VERSION");
  const j = s.indexOf("export function documentoPorId");
  if (i < 0) throw new Error("documentos.ts ha cambiado de forma: no encuentro VERSION");
  const cuerpo = (j > 0 ? s.slice(i, j) : s.slice(i))
    /* Los tres documentos son `const TERMINOS: Documento = {`, sin `export`;
       sólo VERSION y DOCUMENTOS lo llevan. Hacen falta los dos casos. */
    .replace(/(?:export\s+)?const (\w+)(?:\s*:\s*[A-Za-z<>\[\]| ]+)?\s*=/g, "const $1 =");
  return new Function(cuerpo + "\nreturn { VERSION, DOCUMENTOS };")();
}

/** El diccionario es→en de la plataforma, como mapa. */
function diccionarioDeLaApp() {
  const s = fs.readFileSync(EN_TS, "utf8");
  const mapa = new Map();
  const re = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,?\s*$/gm;
  let m;
  while ((m = re.exec(s))) {
    try { mapa.set(JSON.parse('"' + m[1] + '"'), JSON.parse('"' + m[2] + '"')); } catch { /* línea rara, se salta */ }
  }
  return mapa;
}

/** Todo el texto de un documento, en orden y sin repetir. */
function cadenasDe(d) {
  const fuera = [];
  const mete = (t) => { if (t && String(t).trim()) fuera.push(String(t)); };
  /* `actualizado` entra porque la fecha se enseña en la página y va escrita en
     castellano —«20 de agosto de 2026»—: en la inglesa hay que decirla en
     inglés, no dejarla a medias. */
  mete(d.titulo); mete(d.corto); mete(d.sumario); mete(d.entradilla); mete(d.actualizado);
  for (const s of d.secciones) {
    mete(s.titulo);
    for (const b of s.bloques) {
      if (b.t === "p" || b.t === "aviso") mete(b.texto);
      else if (b.t === "lista") b.items.forEach((i) => { mete(i.fuerte); mete(i.texto); });
      else if (b.t === "tabla") { b.cols.forEach(mete); b.filas.forEach((f) => f.forEach(mete)); }
    }
  }
  return fuera;
}

/* Lo que NO se traduce: la marca, los correos y los nombres técnicos de las
   cookies. Se declara para que la cuenta de «sin traducción» sea la de verdad
   y no un montón de ruido que acaba tapando una que sí falta. */
const IGUAL_EN_LOS_DOS = /^(Clèrigo|XGRC|[\w.+-]+@[\w.-]+|authjs\.[\w-]+|auth_[\w]+|ucrisk_\w+)$/;

if (require.main === module) {
  const { VERSION, DOCUMENTOS } = documentosDeLaApp();
  const dic = diccionarioDeLaApp();
  console.log("  app: versión " + VERSION + " · " + DOCUMENTOS.length + " documentos · diccionario con " + dic.size + " entradas\n");

  const en = {};
  const sinTraduccion = [];
  let cadenas = 0;
  for (const d of DOCUMENTOS) {
    const suyas = cadenasDe(d);
    cadenas += suyas.length;
    for (const t of suyas) {
      if (dic.has(t)) { en[t] = dic.get(t); continue; }
      if (IGUAL_EN_LOS_DOS.test(t.trim())) { en[t] = t; continue; }
      if (!sinTraduccion.includes(t)) sinTraduccion.push(t);
    }
    console.log("  " + d.id.padEnd(12) + d.secciones.length + " secciones · " + suyas.length + " cadenas · " + d.actualizado);
  }

  console.log("\n  " + cadenas + " cadenas · " + Object.keys(en).length + " con inglés · " + sinTraduccion.length + " sin inglés");
  sinTraduccion.forEach((t) => console.log("    SIN INGLÉS: " + JSON.stringify(t).slice(0, 110)));

  const salida = {
    _: "Copia de app-saas/src/app/legal/documentos.ts. NO se edita a mano: " +
       "se refresca con `node fuente/legal/traer-de-la-app.cjs`. Manda la aplicación.",
    version: VERSION,
    documentos: DOCUMENTOS,
    en,
  };
  fs.writeFileSync(SALIDA, JSON.stringify(salida, null, 1) + "\n");
  console.log("\n  escrito " + path.relative(RAIZ, SALIDA) + "\n");
  if (sinTraduccion.length) process.exitCode = 1;
}

module.exports = { documentosDeLaApp, diccionarioDeLaApp, cadenasDe, IGUAL_EN_LOS_DOS, SALIDA };
