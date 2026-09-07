/**
 * EL SITIO ENTERO, DE UNA VEZ Y EN ORDEN.
 *
 *   node fuente/hacer.cjs            genera y comprueba
 *   node fuente/hacer.cjs --mutar    y además rompe todo a propósito
 *
 * ── POR QUÉ HACE FALTA ESTO ───────────────────────────────────────────────
 *
 * Porque el orden importa y hasta hoy sólo estaba escrito en el README, que es
 * como decir que no estaba en ninguna parte.
 *
 * El paso al inglés lee de `es/` y escribe la raíz. El posicionamiento escribe
 * sobre las dieciséis páginas ya hechas. Si se corren al revés —y es fácil, se
 * toca una traducción y se vuelve a lanzar `a-ingles`— la raíz se rehace desde
 * el castellano y se lleva por delante todo lo del posicionamiento: la ficha
 * de datos de la portada inglesa acaba siendo la de la castellana, con su
 * dirección `/es/` dentro.
 *
 * Pasó mientras se escribía esto. Lo cazó `seo/validar.cjs`, que para eso
 * está, pero cazarlo después no es lo mismo que no poder equivocarse.
 */
const { execFileSync } = require("node:child_process");
const path = require("node:path");

const RAIZ = path.join(__dirname, "..");
const conMutaciones = process.argv.includes("--mutar");

/* El orden NO se puede cambiar. Cada paso escribe encima de lo que dejó el
   anterior, y el de posicionamiento va el último porque toca las dieciséis
   páginas, las ocho de cada idioma. */
const PASOS = [
  ["el castellano, desde el original", "fuente/rebrandear.cjs"],
  ["el modo claro", "fuente/a-modo-claro.cjs"],
  ["las seis interiores, desde la plantilla", "fuente/paginas/sincronizar.cjs"],
  ["el inglés, por sustitución de texto", "fuente/idiomas/a-ingles.cjs"],
  ["el posicionamiento, sobre las dieciséis", "fuente/seo/posicionar.cjs"],
  ["el mapa del sitio y el robots", "fuente/seo/mapa.cjs"],
];

const COMPRUEBAS = [
  ["la portada cuadra con el original", "fuente/validar.cjs"],
  ["las interiores salen de la plantilla", "fuente/paginas/validar.cjs"],
  ["las dos versiones son la misma página", "fuente/idiomas/validar.cjs"],
  ["lo que se le cuenta al buscador es verdad", "fuente/seo/validar.cjs"],
];

const MUTACIONES = [
  ["la portada", "fuente/mutar.cjs", []],
  ["una interior", "fuente/paginas/mutar.cjs", ["marcos"]],
  ["el bilingüe", "fuente/idiomas/mutar.cjs", []],
  ["el posicionamiento", "fuente/seo/mutar.cjs", []],
];

function corre(guion, args = []) {
  try {
    const salida = execFileSync("node", [guion, ...args], { cwd: RAIZ, encoding: "utf8" });
    return { ok: true, salida };
  } catch (e) {
    return { ok: false, salida: (e.stdout || "") + (e.stderr || "") };
  }
}

let mal = 0;

console.log("\n── Se genera ───────────────────────────────────────────────────");
for (const [que, guion] of PASOS) {
  const r = corre(guion);
  console.log((r.ok ? "  hecho  " : "  FALLÓ  ") + que);
  if (!r.ok) { mal++; console.log(r.salida.split("\n").slice(-6).join("\n")); }
}

console.log("\n── Se comprueba ────────────────────────────────────────────────");
for (const [que, guion] of COMPRUEBAS) {
  const r = corre(guion);
  const resumen = (r.salida.match(/^(TODO PASA.*|FALLAN .*)$/m) || [, ""])[1];
  console.log((r.ok ? "  OK     " : "  MAL    ") + que.padEnd(44) + resumen);
  if (!r.ok) { mal++; console.log(r.salida.match(/^  MAL .*/gm)?.slice(0, 5).map((l) => "    " + l.trim()).join("\n")); }
}

if (conMutaciones) {
  console.log("\n── Se rompe a propósito ────────────────────────────────────────");
  for (const [que, guion, args] of MUTACIONES) {
    const r = corre(guion, args);
    const resumen = (r.salida.match(/^\d+\/\d+ mutaciones detectadas.*$/m) || [, ""])[0] || "";
    console.log((r.ok ? "  OK     " : "  MAL    ") + que.padEnd(44) + resumen.replace(/ · ficheros? restaurados?/, ""));
    if (!r.ok) { mal++; console.log(r.salida.match(/^  SE LE ESCAPA .*/gm)?.map((l) => "    " + l.trim()).join("\n")); }
  }
} else {
  console.log("\n  (sin mutaciones. Para romperlo todo a propósito: --mutar)");
}

console.log("\n────────────────────────────────────────────────────────────────");
console.log(mal === 0 ? "EL SITIO ESTÁ HECHO Y CUADRA" : `HAY ${mal} PASOS EN ROJO`);
process.exitCode = mal ? 1 : 0;
