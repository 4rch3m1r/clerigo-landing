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
 *
 * ── UNA SOLA DIRECCIÓN: https://clerigo.io ────────────────────────────────
 *
 * Medido el 2026-09-13: `http://clerigo.io/` contestaba 200 sin pasar a https,
 * y `www.clerigo.io` lo atendía la aplicación, que lo mandaba a
 * app.clerigo.io/login — compartir «www.clerigo.io» enseñaba la pantalla de
 * acceso, sin tarjeta. Ahora las dos van con UN 301, en un solo salto y
 * conservando ruta y consulta: http://www.clerigo.io/pricing?x=1 →
 * https://clerigo.io/pricing?x=1.
 *
 * Esto sólo corre si el Worker va delante de los ficheros —`run_worker_first`
 * en wrangler.toml— y si `www` le llega —la ruta `www.clerigo.io/*`—. Sin lo
 * primero, `/` servía `index.html` directamente y nadie redirigía.
 *
 * Sólo para los dos nombres del sitio: en `wrangler dev` o en workers.dev no se
 * toca nada.
 */
const CANONICO = "clerigo.io";
const NOMBRES_DEL_SITIO = [CANONICO, "www." + CANONICO];

/* ── HSTS ──────────────────────────────────────────────────────────────────
 *
 * Con la redirección de arriba, quien escribe `clerigo.io` a secas hace UNA
 * petición por http antes del 301, y ésa se puede interceptar. HSTS le dice al
 * navegador que durante un año vaya directo por https, sin esa primera vuelta.
 *
 * CON `includeSubDomains`: obliga a https a TODOS los subdominios de clerigo.io
 * —los de la aplicación, los de cada organización y cualquiera que se cree
 * mañana— durante un año, y no se puede deshacer desde aquí. Antes de ponerlo
 * se comprobó el 2026-09-13: el certificado cubre `clerigo.io` y
 * `*.clerigo.io`; hay un comodín que lleva todo subdominio a la aplicación; y
 * app, una organización real, un slug inventado y los reservados (api, admin,
 * mail, static, assets…) contestan por https con certificado válido y YA
 * redirigen http→https con 301. O sea: no cambia nada que funcione hoy.
 *
 * LO QUE HAY QUE SABER A PARTIR DE AQUÍ: un subdominio nuevo que se sirva sólo
 * por http —fuera del comodín, en otro proveedor— no abrirá en un navegador
 * que haya visitado clerigo.io. Y los de dos niveles (`a.b.clerigo.io`) no
 * tienen certificado; hoy ya fallan por https, con HSTS tampoco valdrá http.
 *
 * CON `preload`. La palabra sola no mete a nadie en ninguna lista: sólo dice
 * que el dominio ACEPTA estar en la lista de precarga que traen Chrome,
 * Firefox, Safari y Edge. Entrar exige enviarlo en https://hstspreload.org, y
 * eso es una decisión aparte. Una vez dentro, https va escrito en el propio
 * navegador —incluso en la primera visita— para clerigo.io y TODOS sus
 * subdominios, y SALIR tarda meses: hay que pedir la baja y esperar a que
 * salgan versiones nuevas de los navegadores. Mientras no se envíe, quitar
 * `preload` de aquí basta.
 *
 * Sólo en https y sólo en los dos nombres del sitio: por http el navegador la
 * ignora, y en `wrangler dev` o workers.dev no pinta nada.
 */
const HSTS = "max-age=31536000; includeSubDomains; preload";

/** La misma respuesta con HSTS. Se copia porque las cabeceras de una respuesta
 *  servida —y las de `Response.redirect`— son inmutables y escribirlas lanza. */
function conHsts(respuesta, url) {
  if (!NOMBRES_DEL_SITIO.includes(url.hostname) || url.protocol !== "https:") return respuesta;
  const copia = new Response(respuesta.body, respuesta);
  copia.headers.set("strict-transport-security", HSTS);
  return copia;
}

const REDIRECCIONES = [
  [["/marcos", "/marcos.html"], "/frameworks"],
  [["/confianza", "/confianza.html"], "/trustcenter"],
  [["/contacto", "/contacto.html"], "/contact"],
  [["/precios", "/precios.html"], "/pricing"],
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (NOMBRES_DEL_SITIO.includes(url.hostname)
      && (url.hostname !== CANONICO || url.protocol !== "https:")) {
      return conHsts(Response.redirect("https://" + CANONICO + url.pathname + url.search, 301), url);
    }

    for (const [desde, hasta] of REDIRECCIONES) {
      if (desde.includes(url.pathname)) {
        return conHsts(Response.redirect(new URL(hasta, request.url), 301), url);
      }
    }
    if (["/login", "/login.html", "/es/login", "/es/login.html"].includes(url.pathname)) {
      return conHsts(Response.redirect("https://app.clerigo.io/login", 301), url);
    }

    const respuesta = await env.ASSETS.fetch(request);

    const tipo = respuesta.headers.get("content-type") || "";
    if (!tipo.includes("text/html") || tipo.toLowerCase().includes("charset")) {
      return conHsts(respuesta, url);
    }
    /* Se clona para poder tocar las cabeceras: las de una respuesta servida
       vienen inmutables y escribir sobre ellas lanza. */
    const copia = new Response(respuesta.body, respuesta);
    copia.headers.set("content-type", "text/html; charset=utf-8");
    return conHsts(copia, url);
  },
};
