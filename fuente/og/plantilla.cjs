/**
 * CÓMO SE DIBUJA UNA TARJETA. El qué dice está en `tarjetas.cjs`.
 *
 * 1200 x 630, que es lo que piden WhatsApp, LinkedIn, X y Facebook.
 *
 * ── LOS COLORES NO SE ELIGEN AQUÍ ─────────────────────────────────────────
 *
 * Son los tokens del landing, copiados uno a uno de su `:root`. Si allí cambia
 * el rojo, aquí tiene que cambiar con él, y por eso van con su nombre y no
 * sueltos por el fichero.
 *
 * ── LO QUE NO LLEVA, Y ES DELIBERADO ──────────────────────────────────────
 *
 *   · Ni resplandores, ni orbes, ni cordilleras de fondo. Todo eso es lo que
 *     hace que una imagen se lea como salida de una máquina.
 *   · Ni una cifra escrita por la tarjeta. Los números que se ven están DENTRO
 *     de la captura y son los del sistema; el único que se escribe es el
 *     precio, y está publicado en la página de planes.
 *   · El logotipo es el REAL, el mismo que sirve el landing.
 *
 * En el titular, lo que va entre @arrobas@ lleva el subrayado rojo ceñido: el
 * mismo que la portada pone bajo «GRC».
 */

/* Del `:root` del landing, sin cambiar una coma. */
const TOKENS = `
  --red: #EB1000;
  --blanco: #FFFFFF;
  --gris-1: #F7F8F9;
  --borde: rgba(14,14,14,0.10);
  --tinta: #16181C;
  --tinta-2: rgba(22,24,28,0.68);
  --tinta-3: rgba(22,24,28,0.48);
`;

const escapa = (s) => String(s)
  .split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");

/** El titular, con lo que va entre @arrobas@ subrayado en rojo. */
function pintaTitular(lineas) {
  return lineas.map((l) => escapa(l)
    .split("@")
    .map((trozo, i) => (i % 2 ? `<span class="subrayado">${trozo}</span>` : trozo))
    .join("")).join("<br>");
}

function plantilla(t) {
  const conVentana = t.variante === "producto";
  return `<!DOCTYPE html>
<html lang="${t.idioma}">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700;900&family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet">
<style>
:root {${TOKENS}}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; }
body {
  font-family: "Source Sans 3", -apple-system, "Segoe UI", sans-serif;
  background: var(--blanco); color: var(--tinta);
  position: relative; overflow: hidden;
  -webkit-font-smoothing: antialiased;
}
/* La retícula del propio landing. Donde hay ventana se apaga bajo ella, para
   no competir con la captura. */
.reticula {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(14,14,14,0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(14,14,14,0.035) 1px, transparent 1px);
  background-size: 44px 44px;
  -webkit-mask-image: ${conVentana
    ? "linear-gradient(100deg, #000 0%, #000 38%, transparent 62%)"
    : "radial-gradient(115% 95% at 12% 18%, #000 0%, transparent 70%)"};
          mask-image: ${conVentana
    ? "linear-gradient(100deg, #000 0%, #000 38%, transparent 62%)"
    : "radial-gradient(115% 95% at 12% 18%, #000 0%, transparent 70%)"};
}
/* La barra roja del borde: estructura, no adorno. Sustituye al resplandor. */
.filo { position: absolute; left: 0; top: 0; bottom: 0; width: 12px; background: var(--red); z-index: 3; }

.hoja {
  position: absolute; left: 0; top: 0; bottom: 0; z-index: 2;
  width: ${conVentana ? "640px" : "1200px"};
  padding: ${conVentana ? "56px 40px 50px 84px" : "58px 76px 54px 88px"};
  display: flex; flex-direction: column;
}

.marca { display: flex; align-items: center; gap: 16px; }
.marca img { width: 56px; height: 56px; display: block; border-radius: 13px; }
.marca .nombre { font-size: 37px; font-weight: 700; letter-spacing: -0.7px; line-height: 1; }
.marca .sub {
  font-family: "Source Code Pro", monospace; font-size: 13px; font-weight: 600;
  letter-spacing: 2.2px; color: var(--tinta-3); line-height: 1; margin-left: -4px;
}

.cuerpo { margin-top: auto; margin-bottom: auto; padding-top: 20px; }
.antetitulo {
  font-family: "Source Code Pro", monospace;
  font-size: 13px; font-weight: 600; letter-spacing: 3px;
  color: var(--tinta-3); text-transform: uppercase; margin-bottom: 18px;
}
h1 {
  font-weight: 900; line-height: 1.07;
  font-size: ${conVentana ? "52px" : "60px"};
  letter-spacing: ${conVentana ? "-1.4px" : "-1.8px"};
  max-width: ${conVentana ? "none" : "1000px"};
}
h1 .subrayado { position: relative; white-space: nowrap; }
h1 .subrayado::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: 1px;
  height: ${conVentana ? "5px" : "6px"}; background: var(--red);
}
.bajada {
  margin-top: ${conVentana ? "26px" : "30px"};
  font-size: ${conVentana ? "19px" : "22px"}; font-weight: 400; line-height: 1.48;
  color: var(--tinta-2); max-width: ${conVentana ? "500px" : "880px"};
}

.pie {
  display: flex; padding-bottom: 4px;
  ${conVentana
    ? "flex-direction: column; gap: 22px;"
    : "align-items: flex-end; justify-content: space-between; gap: 24px;"}
}
.marcos { display: flex; align-items: center; }
.marcos span {
  font-family: "Source Code Pro", monospace;
  font-size: 12px; font-weight: 600; letter-spacing: 1.2px;
  color: var(--tinta-3); padding: 0 11px; white-space: nowrap;
}
.marcos span:first-child { padding-left: 0; }
.marcos span + span { border-left: 1px solid var(--borde); }
.dominio { font-size: ${conVentana ? "22px" : "24px"}; font-weight: 700; letter-spacing: -0.3px; }
.dominio b { color: var(--red); }

/* La ventana del producto: el mismo marco que el landing pone a sus capturas.
   Sangra por la derecha y por abajo — cerrada por los cuatro lados quedaba
   cortada a media fila y se leía como un recorte mal hecho. La sombra es baja
   y ancha; una sombra fuerte convierte una captura en una pegatina. */
.ventana {
  position: absolute; left: 648px; top: 78px; bottom: -56px; width: 700px; z-index: 1;
  background: var(--blanco);
  border: 1px solid var(--borde); border-bottom: 0; border-right: 0;
  border-radius: 16px 0 0 0;
  box-shadow: -22px 22px 64px rgba(14,14,14,0.15), -2px 2px 8px rgba(14,14,14,0.05);
  overflow: hidden;
}
.barra {
  height: 38px; background: var(--gris-1); border-bottom: 1px solid var(--borde);
  display: flex; align-items: center; gap: 7px; padding: 0 15px;
}
.punto { width: 10px; height: 10px; border-radius: 50%; }
.rotulo {
  font-family: "Source Code Pro", monospace; font-size: 12px; color: var(--tinta-3);
  letter-spacing: 0.4px; margin-left: 14px;
}
.lienzo { position: relative; height: calc(100% - 38px); overflow: hidden; }
/* Se enseña la esquina de arriba a la izquierda —la barra lateral y la fila de
   indicadores—, que es lo que sigue siendo legible cuando la tarjeta se ve del
   tamaño de un sello en un chat. */
.lienzo img { position: absolute; left: 0; top: 0; width: 900px; height: auto; display: block; }
</style>
</head>
<body>
  <div class="reticula"></div>
  <div class="filo"></div>
${conVentana ? `
  <div class="ventana">
    <div class="barra">
      <span class="punto" style="background:#FF5F57"></span>
      <span class="punto" style="background:#FEBC2E"></span>
      <span class="punto" style="background:#28C840"></span>
      <span class="rotulo">${escapa(t.rotuloVentana || "")}</span>
    </div>
    <div class="lienzo"><img src="captura.png" alt=""></div>
  </div>` : ""}

  <div class="hoja">
    <div class="marca">
      <img src="logo.png" alt="">
      <div class="nombre">Cl&egrave;rigo</div>
      <div class="sub">XGRC</div>
    </div>

    <div class="cuerpo">
      <div class="antetitulo">${escapa(t.antetitulo)}</div>
      <h1>${pintaTitular(t.titular)}</h1>
      <div class="bajada">${escapa(t.bajada)}</div>
    </div>

    <div class="pie">
      <div class="marcos">${t.tira.map((n) => `<span>${escapa(n)}</span>`).join("")}</div>
      <div class="dominio">clerigo<b>.io</b></div>
    </div>
  </div>
</body>
</html>`;
}

module.exports = { plantilla };
