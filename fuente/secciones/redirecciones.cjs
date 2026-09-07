/**
 * LAS TRES RUTAS EN CASTELLANO DE LA RAÍZ, QUE REDIRIGEN.
 *
 *   node fuente/secciones/redirecciones.cjs
 *
 * ── QUÉ PROBLEMA RESUELVE ─────────────────────────────────────────────────
 *
 * El castellano vive en `/es/`. Pero en la raíz había además `marcos.html`,
 * `confianza.html` y `contacto.html` sirviendo LA MISMA PÁGINA en castellano.
 * Medido sobre el sitio publicado: `/marcos` y `/es/marcos` devolvían las dos
 * 200 con el mismo contenido.
 *
 * Eso es contenido duplicado, y de la peor clase: dos direcciones compitiendo
 * por el mismo texto, sin que ninguna diga cuál manda.
 *
 * ── POR QUÉ NO LO ARREGLA `worker.js` ─────────────────────────────────────
 *
 * Porque su código está muerto. El worker tiene los tres redirects escritos,
 * pero con los assets estáticos de Wrangler el FICHERO se sirve antes de que
 * el worker llegue a correr. Comprobado: `/marcos` contesta 200, no 301.
 *
 * Un redirect que no redirige es peor que ninguno: quien lee ese fichero cree
 * que el problema está resuelto.
 *
 * ── CÓMO SE RESUELVE AQUÍ ─────────────────────────────────────────────────
 *
 * Con una página de redirección de verdad en la raíz, que sí se sirve. Y con
 * la misma idea que tenía la original —recuperada del historial— que es la
 * correcta y merece explicarse:
 *
 *   · `<meta http-equiv="refresh">` para quien no tenga JavaScript.
 *   · `<link rel="canonical">` a la inglesa, que es la que debe indexarse.
 *   · Y un guion que mira el idioma ANTES de saltar: quien tiene el navegador
 *     en castellano —o eligió castellano alguna vez— acaba en `/es/marcos`,
 *     no en una página en inglés. Mandar a un hispanohablante que escribió
 *     «marcos» a una página en inglés es perder justo lo que venía a buscar.
 *
 * `noindex` en las tres: son puertas, no páginas.
 */
const fs = require("node:fs");
const path = require("node:path");

const RAIZ = path.join(__dirname, "..", "..");

/* De dónde a dónde. Los destinos son los del `worker.js`, para que las dos
   capas digan lo mismo el día que el worker sí llegue a correr. */
const PUERTAS = [
  { fichero: "marcos.html", ingles: "/frameworks", castellano: "/es/marcos", nombre: "frameworks" },
  { fichero: "confianza.html", ingles: "/trustcenter", castellano: "/es/confianza", nombre: "trust center" },
  { fichero: "contacto.html", ingles: "/contact", castellano: "/es/contacto", nombre: "contact" },
];

const stub = (p) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="robots" content="noindex, follow">
<meta http-equiv="refresh" content="0; url=${p.ingles}">
<link rel="canonical" href="https://clerigo.io${p.ingles}">
<title>Redirecting…</title>
<script>
/* El idioma decide a dónde. La elección guardada manda sobre el navegador:
   quien pulsó «EN» alguna vez no quiere acabar en castellano por tener el
   sistema en español. */
(function () {
  var lang = null;
  try { lang = localStorage.getItem('clerigo-idioma'); } catch (e) {}
  if (!lang) {
    lang = (navigator.language || navigator.userLanguage || '').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
  }
  location.replace((lang === 'es' ? '${p.castellano}' : '${p.ingles}') + location.search + location.hash);
})();
</script>
</head>
<body>
<p>Redirecting to <a href="${p.ingles}">${p.nombre}</a>…</p>
</body>
</html>
`;

console.log("");
for (const p of PUERTAS) {
  const f = path.join(RAIZ, p.fichero);
  const antes = fs.existsSync(f) ? fs.statSync(f).size : 0;
  fs.writeFileSync(f, stub(p));
  const despues = fs.statSync(f).size;
  console.log(`  ${p.fichero.padEnd(16)} ${String(Math.round(antes / 1024)).padStart(4)} KB → ${despues} bytes`
    + `   ·  en → ${p.ingles}   es → ${p.castellano}`);
}
console.log(`\n  ${PUERTAS.length} puertas. El castellano vive en /es/, y estas tres llevan allí o a su`);
console.log(`  equivalente en inglés según el idioma de quien llega.\n`);
