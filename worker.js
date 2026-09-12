/**
 * El borde: primero las redirecciones, después los ficheros.
 *
 * ── EL `charset`, QUE FALTABA ─────────────────────────────────────────────
 *
 * Los ficheros salían con `Content-Type: text/html` y nada más. El juego de
 * caracteres iba sólo DENTRO del documento, en su `<meta charset>`, y eso vale
 * para un navegador pero no es lo que manda: cuando la cabecera HTTP no lo
 * dice, quien lee puede suponer otro —latin-1 es lo habitual— y entonces
 * «Clèrigo» se lee «ClÃ¨rigo». Lo sufre justo quien no ejecuta la página y sólo
 * mira las etiquetas: los que pintan la vista previa de un enlace.
 *
 * Se añade sólo al HTML y sólo si no lo trae ya. Lo demás —imágenes, hojas de
 * estilo, el mapa del sitio— se devuelve sin tocar: ponerle un juego de
 * caracteres a un PNG es decir una cosa falsa de un fichero binario.
 */
const REDIRECCIONES = [
  [["/marcos", "/marcos.html"], "/frameworks"],
  [["/confianza", "/confianza.html"], "/trustcenter"],
  [["/contacto", "/contacto.html"], "/contact"],
  [["/precios", "/precios.html"], "/pricing"],
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    for (const [desde, hasta] of REDIRECCIONES) {
      if (desde.includes(url.pathname)) {
        return Response.redirect(new URL(hasta, request.url), 301);
      }
    }
    if (["/login", "/login.html", "/es/login", "/es/login.html"].includes(url.pathname)) {
      return Response.redirect("https://app.clerigo.io/login", 301);
    }

    const respuesta = await env.ASSETS.fetch(request);

    const tipo = respuesta.headers.get("content-type") || "";
    if (!tipo.includes("text/html") || tipo.toLowerCase().includes("charset")) {
      return respuesta;
    }
    /* Se clona para poder tocar las cabeceras: las de una respuesta servida
       vienen inmutables y escribir sobre ellas lanza. */
    const copia = new Response(respuesta.body, respuesta);
    copia.headers.set("content-type", "text/html; charset=utf-8");
    return copia;
  },
};
