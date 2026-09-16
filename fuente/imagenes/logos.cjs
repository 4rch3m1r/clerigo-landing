/**
 * LOS LOGOTIPOS DE LOS ORGANISMOS, A LA MEDIDA DE LA TARJETA.
 *
 *   node fuente/imagenes/logos.cjs
 *
 * Los ficheros se bajan de la web oficial de cada organismo tal cual los
 * publican, y ahí vienen como vienen: el de IDECOOP son 1.947 × 494 px y
 * 170 KB —la marca a la izquierda y, a la derecha, el nombre entero otra vez
 * en letras de cartel—. En una tarjeta de 300 px eso es una mancha azul y un
 * cuarto de megabyte de más.
 *
 * Esto recorta lo que sobra y deja cada uno al doble del tamaño al que se
 * pinta, que es lo que necesita una pantalla de retina y ni un píxel más.
 *
 * Con el Chrome sin ventana del equipo, como `webp.cjs` y `og/hacer.cjs`: un
 * lienzo, `drawImage` con el recorte, y a disco. Sin dependencias.
 *
 * NO SE TOCA EL DIBUJO. Se recorta el lienzo y se reduce; no se recolorea, ni
 * se le quita el fondo, ni se recompone: es la marca de otro y se publica como
 * la publican ellos.
 */
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const RAIZ = path.join(__dirname, "..", "..");
const PUBLICO = path.join(RAIZ, "public");
const PUERTO = 9472;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/* `recorte` va en tanto por uno del original. `ancho` es el del fichero que se
   escribe: el doble del que ocupa en la tarjeta. */
const LOGOS = [
  {
    fichero: "idecoop.png", ancho: 240,
    /* Sólo el bloque de la izquierda: la cúpula, «Gobierno de la República
       Dominicana» y el logotipo IDECOOP. Lo de la derecha es el nombre
       completo en grande, y el nombre ya lo dice la propia tarjeta. */
    recorte: { x: 0, y: 0, w: 0.385, h: 1 },
  },
  { fichero: "indotel.png", ancho: 240 },
  { fichero: "uaf.png", ancho: 240 },
];

(async () => {
  const perfil = path.join(__dirname, ".chrome-logos");
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
  await pedir("Page.navigate", { url: "file:///" + PUBLICO.split("\\").join("/") + "/" });
  await dormir(800);

  for (const logo of LOGOS) {
    const ruta = path.join(PUBLICO, logo.fichero);
    if (!fs.existsSync(ruta)) { console.log("  " + logo.fichero + ": no está"); continue; }
    const antes = fs.statSync(ruta).size;
    const url = "file:///" + ruta.split("\\").join("/");
    const r = { x: 0, y: 0, w: 1, h: 1, ...(logo.recorte || {}) };
    const res = await pedir("Runtime.evaluate", {
      awaitPromise: true, returnByValue: true,
      expression: `(async () => {
        const img = new Image(); img.src = ${JSON.stringify(url)}; await img.decode();
        const r = ${JSON.stringify(r)};
        const sx = Math.round(img.naturalWidth * r.x), sy = Math.round(img.naturalHeight * r.y);
        const sw = Math.round(img.naturalWidth * r.w), sh = Math.round(img.naturalHeight * r.h);
        const w = ${logo.ancho}, h = Math.round(sh * w / sw);
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
        x.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
        return { datos: c.toDataURL('image/png').split(',')[1], w, h };
      })()`,
    });
    if (!res.result || !res.result.value) throw new Error(logo.fichero + ": no se pudo redibujar");
    const { datos, w, h } = res.result.value;
    const bytes = Buffer.from(datos, "base64");
    fs.writeFileSync(ruta, bytes);
    console.log(`  ${logo.fichero.padEnd(14)} ${Math.round(antes / 1024)} KB → ${w}×${h} px · ${Math.round(bytes.length / 1024)} KB`);
  }

  chrome.kill();
  setTimeout(() => fs.rmSync(perfil, { recursive: true, force: true }), 1500);
  console.log("");
})();
