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
 * SIN `preload`, decidido el 2026-09-13. Declara que el dominio acepta entrar
 * en la lista de precarga de los navegadores (https://hstspreload.org), de la
 * que salir tarda meses. La propia hstspreload.org no la recomienda —Chrome y
 * Safari ya pasan a https solos—, pide subir el max-age por etapas antes de
 * enviar, y la precarga alcanza también a subdominios internos que no se han
 * podido revisar. Se llegó a poner y se quitó sin haber enviado nada.
 *
 * Sólo en https y sólo en los dos nombres del sitio: por http el navegador la
 * ignora, y en `wrangler dev` o workers.dev no pinta nada.
 */
const HSTS = "max-age=31536000; includeSubDomains";

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

/* A DÓNDE ACABARÁ UNA RUTA, para el salto de `http` y `www`. Sin esto,
   http://clerigo.io/index.html daba DOS 301 —primero a https con la misma
   ruta, luego a /— y Search Console apuntaba las dos direcciones. Se hace de
   una vez lo que harían los pasos de después: las redirecciones de la tabla y
   el `.html` que Cloudflare quita. Medido el 2026-09-21. */
function rutaFinal(ruta) {
  for (const [desde, hasta] of REDIRECCIONES) if (desde.includes(ruta)) return hasta;
  if (ruta.endsWith("/index.html")) return ruta.slice(0, -"index.html".length);
  if (ruta.endsWith(".html")) return ruta.slice(0, -".html".length);
  return ruta;
}

/* ── LA PANTALLA DE ACCESO DE LA APLICACIÓN, FUERA DE GOOGLE ──────────────
 *
 * Medido el 2026-09-21: buscando «clerigo.io», el primer resultado era
 * https://app.clerigo.io/login —«Clèrigo · Inicia sesión…»—, por delante de
 * esta web, y Search Console la daba por «Duplicada: sin canónica». Una
 * pantalla de acceso no es una página que enseñar en un buscador.
 *
 * Lo correcto es que la aplicación lo diga ella misma, y el cambio está hecho
 * en su repositorio (src/app/(auth)/login/layout.tsx). Pero la aplicación no
 * se despliega al subir —producción iba por detrás del 15 de septiembre—, así
 * que esto lo dice YA, desde el borde: la ruta `app.clerigo.io/login*` de
 * wrangler.toml pasa por aquí, se le pide la página a la aplicación tal cual y
 * se le añade la cabecera. No se toca nada más de la respuesta.
 *
 * Va lo PRIMERO: la tabla de abajo manda `/login` a app.clerigo.io/login, y
 * aplicada aquí sería una redirección a sí misma, sin fin.
 *
 * `follow` porque los enlaces de la pantalla —a clerigo.io, a lo legal— sí
 * deben seguirse. Y por cabecera, no por robots.txt: si se prohibiera el paso,
 * Google no llegaría a leer el `noindex` y la dejaría indexada.
 */
const ACCESO_DE_LA_APP = "app.clerigo.io";

async function sinIndexar(request) {
  const respuesta = await fetch(request);
  const copia = new Response(respuesta.body, respuesta);
  copia.headers.set("x-robots-tag", "noindex, follow");
  return copia;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === ACCESO_DE_LA_APP) return sinIndexar(request);

    if (NOMBRES_DEL_SITIO.includes(url.hostname)
      && (url.hostname !== CANONICO || url.protocol !== "https:")) {
      return conHsts(Response.redirect("https://" + CANONICO + rutaFinal(url.pathname) + url.search, 301), url);
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

    /* LAS REDIRECCIONES DE LOS FICHEROS, PERMANENTES. Cloudflare quita solo el
       `.html` y la barra final —/pricing.html → /pricing, /index.html → /—,
       pero con un 307, que es TEMPORAL: le dice al buscador que la dirección
       vieja sigue siendo la buena, y Google tenía indexada «clerigo.io ›
       precios». El destino es el mismo que ya decide Cloudflare; sólo cambia
       el código. Medido el 2026-09-15. */
    if ((respuesta.status === 307 || respuesta.status === 308) && respuesta.headers.get("location")) {
      return conHsts(Response.redirect(new URL(respuesta.headers.get("location"), request.url), 301), url);
    }

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
