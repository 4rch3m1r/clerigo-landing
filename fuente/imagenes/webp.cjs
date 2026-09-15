/**
 * LAS CAPTURAS DEL SISTEMA EN WEBP, EN TRES ANCHOS.
 *
 *   node fuente/imagenes/webp.cjs
 *
 * Lee `sistema/sistema-*.png` (1600 × 1000) y escribe
 * `sistema/webp/sistema-*-{800,1200,1600}.webp`. Las sirve `seo/rapido.cjs`
 * con `srcset`: el PNG se queda como `src`, de respaldo.
 *
 * ── POR QUÉ ───────────────────────────────────────────────────────────────
 *
 * Lighthouse, 2026-09-15: la captura del panel pesa 147 KB a 1600 px y en un
 * teléfono se ve a 348. Medido en clerigo.io el ancho al que se pintan: 348 px
 * a 390, 720 a 768 y como mucho 1.062 en escritorio. Con tres anchos cada
 * pantalla pide el suyo según su densidad —un teléfono de 3× pide el de 1200—.
 *
 * ── CÓMO ──
 *
 * Con el Chrome sin ventana del equipo, como `og/hacer.cjs`: dibuja cada PNG en
 * un lienzo y lo exporta como WebP. Sin dependencias. Calidad 0,82: por debajo
 * se ven halos en los textos pequeños de las capturas.
 */
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const RAIZ = path.join(__dirname, "..", "..");
const ORIGEN = path.join(RAIZ, "sistema");
const DESTINO = path.join(ORIGEN, "webp");
const ANCHOS = [800, 1200, 1600];
const CALIDAD = 0.82;
const PUERTO = 9471;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const pngs = fs.readdirSync(ORIGEN).filter((f) => /^sistema-.*\.png$/.test(f));
  fs.mkdirSync(DESTINO, { recursive: true });
  const perfil = path.join(__dirname, ".chrome");
  const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + PUERTO, "--user-data-dir=" + perfil,
    "--no-first-run", "--allow-file-access-from-files"], { stdio: "ignore" });
  await dormir(2500);
  const lista = await fetch(`http://127.0.0.1:${PUERTO}/json/list`).then((r) => r.json());
  const ws = new WebSocket(lista.find((x) => x.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pedir = (method, params = {}) => new Promise((res, rej) => {
    const mio = ++id;
    const oye = (e) => { const m = JSON.parse(e.data); if (m.id === mio) { ws.removeEventListener("message", oye); m.error ? rej(new Error(m.error.message)) : res(m.result); } };
    ws.addEventListener("message", oye);
    ws.send(JSON.stringify({ id: mio, method, params }));
  });
  await pedir("Page.enable");
  await pedir("Page.navigate", { url: "file:///" + ORIGEN.split("\\").join("/") + "/" });
  await dormir(800);

  let antes = 0, despues = 0;
  for (const png of pngs) {
    const url = "file:///" + path.join(ORIGEN, png).split("\\").join("/");
    const r = await pedir("Runtime.evaluate", {
      awaitPromise: true, returnByValue: true,
      expression: `(async () => {
        const img = new Image(); img.src = ${JSON.stringify(url)}; await img.decode();
        const salida = {};
        for (const w of ${JSON.stringify(ANCHOS)}) {
          const h = Math.round(img.naturalHeight * w / img.naturalWidth);
          const c = document.createElement('canvas'); c.width = w; c.height = h;
          const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, w, h);
          salida[w] = c.toDataURL('image/webp', ${CALIDAD}).split(',')[1];
        }
        return salida;
      })()`,
    });
    if (!r.result || !r.result.value) throw new Error(png + ": no se pudo convertir");
    antes += fs.statSync(path.join(ORIGEN, png)).size;
    const fila = [];
    for (const w of ANCHOS) {
      const bytes = Buffer.from(r.result.value[w], "base64");
      fs.writeFileSync(path.join(DESTINO, png.replace(/\.png$/, `-${w}.webp`)), bytes);
      if (w === 800) despues += bytes.length;
      fila.push(`${w}: ${Math.round(bytes.length / 1024)} KB`);
    }
    console.log(`  ${png.padEnd(28)} ${Math.round(fs.statSync(path.join(ORIGEN, png)).size / 1024)} KB → ${fila.join(" · ")}`);
  }
  chrome.kill();
  setTimeout(() => fs.rmSync(perfil, { recursive: true, force: true }), 1500);
  console.log(`\n  ${pngs.length} capturas. PNG: ${Math.round(antes / 1024)} KB; WebP de 800: ${Math.round(despues / 1024)} KB.\n`);
})();
