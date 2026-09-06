/**
 * Reúne lo que hay que traducir y lo que ya está traducido.
 *
 *   node fuente/idiomas/reunir.cjs            enseña el recuento
 *   node fuente/idiomas/reunir.cjs --escribir escribe base.json y pendiente.json
 *
 * DE DÓNDE SALE LO QUE YA ESTÁ. La plataforma lleva su propio diccionario
 * es→en —22.595 entradas, `src/lib/traducciones/en.ts`— hecho para ESTE mismo
 * producto. De ahí sale más de la cuarta parte del sitio, y sobre todo sale el
 * vocabulario: «Marcos» es «Frameworks» en la aplicación y tiene que serlo
 * también en la página. Traducirlo aparte es como se acaba con dos nombres
 * para la misma cosa.
 *
 * Ese diccionario NO se copia entero: se toma sólo lo que el sitio usa. Copiar
 * 22.595 entradas para gastar 302 deja un fichero que nadie puede revisar.
 */
const fs = require("node:fs");
const path = require("node:path");
const { segmentos } = require("./segmentos.cjs");
const { CASTELLANO } = require("../donde.cjs");

const RAIZ = path.join(__dirname, "..", "..");
const DICCIONARIO_APP = "C:/3.14/app-saas/src/lib/traducciones/en.ts";
const PAGINAS = ["index", "legal", "precios", "marcos", "contacto", "partners", "confianza"];

const COMILLA = String.fromCharCode(34);
const LINEA = new RegExp('^\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*,?\\s*$', "gm");

/** El diccionario de la plataforma, leído sin compilar TypeScript. */
function diccionarioDeLaApp() {
  if (!fs.existsSync(DICCIONARIO_APP)) return new Map();
  const dic = new Map();
  for (const m of fs.readFileSync(DICCIONARIO_APP, "utf8").matchAll(LINEA)) {
    const k = m[1].split('\\"').join(COMILLA);
    const v = m[2].split('\\"').join(COMILLA);
    if (!dic.has(k)) dic.set(k, v);
  }
  return dic;
}

/** Qué trozos usa cada página, y todos juntos sin repetir. */
function trozosDelSitio() {
  const porPagina = new Map();
  const todos = new Map();
  for (const p of PAGINAS) {
    const ruta = path.join(CASTELLANO, p + ".html");
    if (!fs.existsSync(ruta)) continue;
    const lista = segmentos(fs.readFileSync(ruta, "utf8"));
    porPagina.set(p, lista.map((x) => x.texto));
    for (const x of lista) if (!todos.has(x.texto)) todos.set(x.texto, p);
  }
  return { porPagina, todos };
}

function reunir() {
  const dic = diccionarioDeLaApp();
  const { porPagina, todos } = trozosDelSitio();

  const base = {};
  const pendientePorPagina = new Map();
  for (const [texto, primeraPagina] of todos) {
    if (dic.has(texto)) { base[texto] = dic.get(texto); continue; }
    if (!pendientePorPagina.has(primeraPagina)) pendientePorPagina.set(primeraPagina, []);
    pendientePorPagina.get(primeraPagina).push(texto);
  }
  return { base, pendientePorPagina, porPagina, todos, dic };
}

if (require.main === module) {
  const { base, pendientePorPagina, todos } = reunir();
  const yaEstan = Object.keys(base).length;
  console.log(`  trozos del sitio:  ${todos.size}`);
  console.log(`  ya traducidos:     ${yaEstan}  (del diccionario de la plataforma)`);
  console.log(`  por traducir:      ${todos.size - yaEstan}\n`);
  for (const [p, lista] of pendientePorPagina) {
    console.log(`    ${p.padEnd(12)} ${String(lista.length).padStart(4)}`);
  }
  if (process.argv.includes("--escribir")) {
    fs.writeFileSync(path.join(__dirname, "base.json"), JSON.stringify(base, null, 1) + "\n");
    const pend = {};
    for (const [p, lista] of pendientePorPagina) pend[p] = lista;
    fs.writeFileSync(path.join(__dirname, "pendiente.json"), JSON.stringify(pend, null, 1) + "\n");
    console.log("\n  escritos base.json y pendiente.json");
  }
}

module.exports = { reunir, trozosDelSitio, diccionarioDeLaApp, PAGINAS };
