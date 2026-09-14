/**
 * LOS ICONOS DE PANTALLA DE INICIO: `apple-touch-icon.png` (180x180),
 * `icono-192.png` e `icono-512.png` (los del manifiesto). Los tres en la raíz.
 *
 *   node fuente/iconos.cjs
 *
 * ── POR QUÉ NO SE REESCALA `favicon.png` ──────────────────────────────────
 *
 * El logotipo sólo existe como PNG de 160 px —no hay vector, ni aquí ni en
 * app.clerigo.io—. Estirarlo a 180 lo emborrona. Y tiene esquinas
 * TRANSPARENTES —el redondeo y el pico doblado—, que iOS rellena de NEGRO
 * en la pantalla de inicio.
 *
 * Así que se compone: fondo blanco opaco y el logotipo encima a su tamaño o
 * menos —140 px en el de 180, 160 px (1:1) en el de 192—. Nunca se amplía.
 * iOS y Android ponen su propia máscara redondeada encima.
 *
 * EL DE 512 SALE DEL VECTOR, `fuente/logo.svg`: ampliar el PNG de 160 px más
 * de tres veces lo emborronaba. Mismas proporciones que el de 192 —el logotipo
 * ocupa el 83 %—. El vector está medido contra el original; lo cuenta su
 * propio comentario. Los de 180 y 192 siguen saliendo del PNG, que a ese tamaño
 * es el original sin ampliar.
 */
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const RAIZ = path.join(__dirname, "..");
const TALLER = path.join(__dirname, ".taller-iconos");

const ICONOS = [
  { fichero: "apple-touch-icon.png", lado: 180, logo: 140 },
  { fichero: "icono-192.png", lado: 192, logo: 160 },
  { fichero: "icono-512.png", lado: 512, logo: 426, fuente: "logo.svg" },
];

fs.rmSync(TALLER, { recursive: true, force: true });
fs.mkdirSync(TALLER, { recursive: true });
fs.copyFileSync(path.join(__dirname, "logo.png"), path.join(TALLER, "logo.png"));
fs.copyFileSync(path.join(__dirname, "logo.svg"), path.join(TALLER, "logo.svg"));

for (const i of ICONOS) {
  const html = path.join(TALLER, i.fichero + ".html");
  fs.writeFileSync(html, `<!DOCTYPE html><html><head><style>
html, body { margin: 0; width: ${i.lado}px; height: ${i.lado}px; background: #FFFFFF; overflow: hidden; }
img { position: absolute; width: ${i.logo}px; height: ${i.logo}px;
  left: ${(i.lado - i.logo) / 2}px; top: ${(i.lado - i.logo) / 2}px; }
</style></head><body><img src="${i.fuente || "logo.png"}" alt=""></body></html>`);
  const salida = path.join(TALLER, i.fichero);
  execFileSync(CHROME, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
    "--force-device-scale-factor=1", "--default-background-color=FFFFFFFF",
    "--user-data-dir=" + path.join(TALLER, "chrome"),
    "--window-size=" + i.lado + "," + i.lado,
    "--screenshot=" + salida,
    "file:///" + html.split("\\").join("/"),
  ], { stdio: "ignore" });
  const b = fs.readFileSync(salida);
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  if (w !== i.lado || h !== i.lado) throw new Error(`${i.fichero} salió de ${w}x${h}`);
  fs.copyFileSync(salida, path.join(RAIZ, i.fichero));
  console.log(`  ${i.fichero.padEnd(22)} ${w}x${h}  ${Math.round(b.length / 1024)} KB`);
}

try { fs.rmSync(TALLER, { recursive: true, force: true }); } catch { /* Chrome aún la suelta */ }
