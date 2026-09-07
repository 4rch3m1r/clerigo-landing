/**
 * LAS TARJETAS DE ENLACE DE clerigo.io, todas.
 *
 *   node fuente/og/hacer.cjs                  las once
 *   node fuente/og/hacer.cjs precios          sólo las que casen con «precios»
 *
 * Escribe cada una en `og/` y en `public/og/` —las dos, porque las páginas
 * apuntan a `/public/og/…` y en el disco hay una copia en cada sitio—, a
 * 1200x630 exactos.
 *
 * ── POR QUÉ ESTO EXISTE ───────────────────────────────────────────────────
 *
 * Porque las tarjetas anteriores no tenían forma de rehacerse. Estaban
 * dibujadas a mano, una por una: escribían «Clerigo.io» sin el acento de la
 * marca, usaban un logotipo que no es el del sitio, y la de la portada llevaba
 * cifras inventadas —«99.4% Continuous Compliance Health», «93 Controls
 * Monitored», «0 critical vulnerabilities»— en la imagen que se pega en un
 * chat. Corregir cualquiera de esas cosas obligaba a volver a dibujarlas todas.
 *
 * Ahora salen de un sitio: `tarjetas.cjs` dice qué pone cada una y
 * `plantilla.cjs` cómo se dibuja, con los mismos tokens de color del landing y
 * el logotipo REAL sacado de su CSS.
 *
 * ── CÓMO ──
 *
 * Chrome sin ventana y el protocolo de depuración, sin dependencias: Node 22 ya
 * trae `WebSocket` global. UNA sola sesión de Chrome para las once.
 *
 * Se ESPERA A LAS TIPOGRAFÍAS antes de cada disparo (`document.fonts.ready`);
 * sin esa espera la primera foto sale con la letra de reserva del sistema y no
 * se parece al sitio.
 *
 * ── DESPUÉS ──
 *
 * Los rastreadores se quedan con la tarjeta vieja durante días. Al publicar,
 * pasar las direcciones por:
 *     https://developers.facebook.com/tools/debug/   (botón «Volver a extraer»)
 *     https://www.linkedin.com/post-inspector/
 * o WhatsApp seguirá enseñando las anteriores.
 */
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { plantilla } = require("./plantilla.cjs");
const TARJETAS = require("./tarjetas.cjs");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const AQUI = __dirname;
const RAIZ = path.join(AQUI, "..", "..");
const TEMPORAL = path.join(AQUI, ".taller");
const PUERTO = 9412;
const ANCHO = 1200;
const ALTO = 630;
const DESTINOS = ["og", "public/og"];

const filtro = process.argv[2] || "";
const lista = filtro ? TARJETAS.filter((t) => t.fichero.includes(filtro)) : TARJETAS;
if (!lista.length) { console.error("\n  ninguna tarjeta casa con «" + filtro + "»\n"); process.exit(1); }

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  fs.rmSync(TEMPORAL, { recursive: true, force: true });
  fs.mkdirSync(TEMPORAL, { recursive: true });

  /* El logotipo, una vez: es el mismo en las once. */
  const logo = path.join(RAIZ, "fuente/logo.png");
  if (!fs.existsSync(logo)) throw new Error("no encuentro fuente/logo.png");
  fs.copyFileSync(logo, path.join(TEMPORAL, "logo.png"));

  const chrome = spawn(CHROME, [
    "--headless=new", "--remote-debugging-port=" + PUERTO,
    "--user-data-dir=" + path.join(TEMPORAL, "chrome"),
    "--no-first-run", "--disable-gpu", "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=" + ANCHO + "," + ALTO,
  ], { stdio: "ignore" });
  await dormir(3000);

  const paginas = await fetch("http://127.0.0.1:" + PUERTO + "/json/list").then((r) => r.json());
  const ws = new WebSocket((paginas.find((x) => x.type === "page") || paginas[0]).webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  let id = 0;
  const pedir = (method, params) => new Promise((res, rej) => {
    const mio = ++id;
    const oye = (e) => {
      const m = JSON.parse(e.data);
      if (m.id === mio) {
        ws.removeEventListener("message", oye);
        if (m.error) rej(new Error(m.error.message)); else res(m.result);
      }
    };
    ws.addEventListener("message", oye);
    ws.send(JSON.stringify({ id: mio, method, params }));
  });

  await pedir("Page.enable");
  await pedir("Runtime.enable");
  await pedir("Emulation.setDeviceMetricsOverride",
    { width: ANCHO, height: ALTO, deviceScaleFactor: 1, mobile: false });

  console.log("");
  for (const t of lista) {
    /* La captura de esta tarjeta, con nombre fijo: así la plantilla no tiene
       que saber de qué fichero viene. */
    const conCaptura = !!t.captura;
    if (conCaptura) {
      const de = path.join(RAIZ, t.captura);
      if (!fs.existsSync(de)) throw new Error(t.fichero + ": no encuentro " + t.captura);
      fs.copyFileSync(de, path.join(TEMPORAL, "captura.png"));
    }

    const html = path.join(TEMPORAL, "tarjeta.html");
    fs.writeFileSync(html, plantilla(t));
    await pedir("Page.navigate", { url: "file:///" + html.split("\\").join("/") });
    await dormir(1400);
    await pedir("Runtime.evaluate", {
      expression: "document.fonts.ready", awaitPromise: true, returnByValue: true,
    });
    await dormir(500);

    const r = await pedir("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    const bytes = Buffer.from(r.data, "base64");
    for (const d of DESTINOS) {
      const f = path.join(RAIZ, d, t.fichero);
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, bytes);
    }
    console.log("  " + t.fichero.padEnd(22) + t.idioma + "  " + t.variante.padEnd(12)
      + String(Math.round(bytes.length / 1024)).padStart(4) + " KB");
  }

  chrome.kill();
  await dormir(400);
  fs.rmSync(TEMPORAL, { recursive: true, force: true });

  console.log("\n  " + lista.length + " tarjetas, en og/ y en public/og/");
  console.log("\n  Al publicar, pasa las direcciones por el depurador de Facebook y el");
  console.log("  inspector de LinkedIn, o seguirán sirviendo las tarjetas viejas.\n");
  process.exit(0);
})().catch((e) => { console.error("\n  FALLÓ: " + e.message + "\n"); process.exit(1); });
