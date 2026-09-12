/**
 * Las cinco páginas interiores, comprobadas contra su original.
 *
 * El encargo tenía una frase corta y dos permisos: «no cambies las palabras,
 * pero puedes tocar el tipo de letra y el estilo visual». Esto es esa frase
 * convertida en guarda:
 *
 *   · las PALABRAS de cada página tienen que ser las mismas del original,
 *     en el mismo orden, salvo la tabla de marca de `marca.json`;
 *   · lo que la página HACE —controles, manejadores, funciones— tiene que
 *     seguir estando;
 *   · y la barra, el pie, los tokens y la hoja compartida tienen que salir
 *     de `plantilla.html` sin una coma de diferencia, que de eso va lo de
 *     «la misma línea gráfica».
 *
 *   node fuente/paginas/validar.cjs           las cinco
 *   node fuente/paginas/validar.cjs precios   una sola
 */
const path = require("node:path");
const fs = require("node:fs");
const RAIZ = path.join(__dirname, "..", "..");
/* El castellano es la FUENTE y vive en su carpeta; el ingles ocupa la raiz.
   Ver `fuente/donde.cjs`, que es donde esta escrito el porque. */
const { CASTELLANO } = require("../donde.cjs");
const { sinPosicionamiento } = require("../seo/marcas.cjs");
const AQUI = __dirname;

const { palabras, aplicaMarca, comportamiento, PICTOGRAMAS } = require("./palabras.cjs");
const { restosDeTemaOscuro } = require("../tema.cjs");

const MARCA = JSON.parse(fs.readFileSync(path.join(AQUI, "marca.json"), "utf8"));
const SITIO = JSON.parse(fs.readFileSync(path.join(AQUI, "..", "sitio.json"), "utf8"));
/* Lo que una página escrita de cero TIENE y NO PUEDE decir. */
const AFIRMACIONES = JSON.parse(fs.readFileSync(path.join(AQUI, "afirmaciones.json"), "utf8"));

/* Lo que una página dejó de hacer A PROPÓSITO.
 *
 * La regla es que no se pierde nada de lo que la página hacía. Cuando algo se
 * retira a conciencia se apunta aquí con su porqué, y sigue fallando todo lo
 * que no esté en la lista. Aflojar la comprobación en vez de declarar la
 * excepción es quedarse sin comprobación. */
const RETIRADOS = {
  precios: {
    /* El deslizador de usuarios estaba en CADA tarjeta de módulo. Ahora hay uno
       solo, de cuenta (`setUsuarios`), porque las siete licencias incluidas
       —2 administradores y 5 gestores— son de la cuenta y no del módulo: sumar
       un deslizador por módulo cobraba tres veces a quien usa tres módulos.
       Decisión del cliente, 2026-09-07. */
    /* EL FORMULARIO DE PAGO, RETIRADO ENTERO — 2026-09-11.
     *
     * Pedía número de tarjeta, vencimiento, CVV y titular, más una contraseña y
     * su confirmación en el primer paso. No mandaba nada a ninguna parte: en
     * toda la página no hay una sola llamada de red. El «pago» era un
     * `setTimeout` de 2,2 segundos, y después enseñaba «Tu cuenta ha sido
     * creada», «recibirás un correo con tus credenciales» y «tu Customer
     * Success Manager te contactará en menos de 2 horas hábiles».
     *
     * Eso no es un pago roto: es pedir una contraseña y una tarjeta y decir que
     * ya está hecho. Debajo del campo de la tarjeta había un sello que decía
     * «PCI-DSS Compliant».
     *
     * No se conecta una pasarela porque este sitio es estático —no hay dónde
     * guardar una llave— y elegirla es decisión del cliente. Lo que sí se hace
     * es que la página deje de pedir lo que no puede usar: quedan tres pasos y
     * un botón que abre un correo a hello@clerigo.io con lo elegido, que es el
     * canal que la página de contacto ya usa.
     *
     * Y NO ES UN CAMBIO DE MODELO: la propia página promete TRES veces que no
     * hace falta tarjeta —el pie del resumen, el primer paso del modal y la
     * pregunta frecuente—. Esto la deja diciendo lo que ya vendía. */
    manejadores: ["updateUsers('${m.id}', this.value)",
      "selPay(this,'card')", "selPay(this,'paypal')", "selPay(this,'google')", "selPay(this,'apple')",
      "formatCard(this)", "formatExp(this)", "processPayment()"],
    funciones: ["updateUsers", "selPay", "formatCard", "processPayment"],
    identificadores: ["a-pwd", "a-pwd2", "cc-num", "cc-exp", "cc-cvv", "cc-name",
      "cardFields", "altPayMsg", "payMethods", "payBtn", "mview3"],
    /* Seis entradas menos: las cuatro de la tarjeta y las dos de contraseña.
       Y dos botones: «Ir al pago» y «Pagar y activar cuenta». */
    entradas: 6,
    botones: 2,
  },
};
const PLANTILLA = lee(path.join(AQUI, "plantilla.html"));

const PAGINAS = require("./paginas.cjs");

function lee(p) {
  return fs.readFileSync(p, "utf8").split("\r\n").join("\n");
}

const fallos = [];
let total = 0;
function comprueba(punto, condicion, detalle) {
  total++;
  const ok = !!condicion;
  if (!ok) fallos.push(punto + (detalle ? " — " + detalle : ""));
  console.log((ok ? "  OK  " : "  MAL ") + punto + (detalle && !ok ? "  ·  " + detalle : ""));
}

/* ── Los trozos fijos de la plantilla ──────────────────────────────────── */
const iEstilo = PLANTILLA.indexOf("{{ESTILO}}");
const iCuerpo = PLANTILLA.indexOf("{{CUERPO}}");
const iGuion = PLANTILLA.indexOf("{{GUION}}");
const CABECERA = PLANTILLA.slice(0, iEstilo);
const CIERRE = PLANTILLA.slice(iEstilo + "{{ESTILO}}".length, iCuerpo);
const PIE = PLANTILLA.slice(iCuerpo + "{{CUERPO}}".length, iGuion);
/* Sin la barra ni el pie: lo que le toca a la página de acceso. */
/* El selector de idioma se recorta antes de comparar el trozo compartido:
   son dos enlaces y una hoja de estilo que la plantilla no trae, y sus dos
   enlaces cambian de una pagina a otra a proposito —desde legal.html se salta
   a legal.html del otro idioma—. Exigir que fueran iguales seria exigir que
   el selector no funcionara. */
const sinSelector = (h) => h.replace(/\n?<script>\n\/\* El idioma del navegador decide[\s\S]*?<\/script>\n/, "")
  .replace(/<div class="idiomas">[\s\S]*?<\/div>\n?[ \t]*/, "").replace(/\/\* ── EL SELECTOR DE IDIOMA ──[\s\S]*?── FIN DEL SELECTOR DE IDIOMA ── \*\/\n/, "");

const CIERRE_SIN_BARRA = CIERRE.replace(/<!-- ══════════ BARRA ══════════ -->[\s\S]*?<\/nav>\n/, "");
const PIE_SIN_PIE = PIE.replace(/<!-- ══════════ PIE ══════════ -->[\s\S]*?<\/footer>\n/, "");

/**
 * Del original, lo que de verdad se compara: su cuerpo sin la barra ni el pie.
 *
 * La cabecera se va porque el título y la descripción los pone la plantilla y
 * se comprueban aparte; si se quedara, «Términos, Privacidad y Cookies» del
 * `<title>` saldría como palabra que falta en la página.
 * La barra y el pie se van porque también los pone la plantilla.
 */
function soloElCuerpo(html) {
  const i = html.indexOf("<body");
  return (i < 0 ? html : html.slice(i))
    .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, " ");
}

/** Las letras que hacían de logotipo no cuentan como palabras. */
const sinLetrasDeLogotipo = (lista) =>
  lista.filter((p) => !MARCA.letras_de_logotipo.includes(p));

const soloUna = process.argv[2];
const aRevisar = soloUna ? PAGINAS.filter((p) => p.slug === soloUna) : PAGINAS;
if (soloUna && aRevisar.length === 0) {
  console.error(`No hay ninguna página que se llame «${soloUna}».`);
  process.exit(1);
}

for (const { slug, chrome, sinOriginal } of aRevisar) {
  const fOrigen = path.join(AQUI, "..", "paginas-originales", slug + ".html");
  const fSalida = path.join(CASTELLANO, slug + ".html");

  console.log(`\n── ${slug}.html ${"─".repeat(Math.max(0, 56 - slug.length))}`);

  if (!sinOriginal && !fs.existsSync(fOrigen)) {
    comprueba(`el original de ${slug} está en fuente/paginas-originales/`, false);
    continue;
  }
  /* Y si dice que no tiene original, que de verdad no lo tenga: una página con
     original marcada como «sin original» se saltaría la comprobación de las
     palabras sin que se notara. */
  if (sinOriginal) {
    comprueba(`${slug}: escrita de cero, no hay original contra el que comparar`,
      !fs.existsSync(fOrigen), "hay un original y entonces SÍ habría que compararla");
  }
  if (!fs.existsSync(fSalida)) {
    comprueba(`existe ${slug}.html`, false, "todavía no se ha escrito");
    continue;
  }

  const org = sinOriginal ? "" : lee(fOrigen);
  const sal = lee(fSalida);

  /* ── 1. LAS PALABRAS ──────────────────────────────────────────────── */
  /* Sin el selector de idioma: sus dos rótulos son «EN» y «ES», y en las
     páginas que lo llevan DENTRO del cuerpo —partners, que tiene cabecera
     propia— se colaban en la lista de palabras. El original no los tiene, así
     que la comparación cantaba una diferencia en la palabra 4 de 366. No es
     texto de la página: es un mando. */
  /* ── LO QUE LAS PÁGINAS DICEN Y EL ORIGINAL NO, DECLARADO UNO A UNO ────
   *
   * La regla de la casa es que las palabras son las del original. Cuando el
   * cliente cambia una a propósito, se declara AQUÍ y se normaliza a la frase
   * vieja, de modo que el resto de la página se sigue comparando palabra por
   * palabra. Bajarle el listón a la guarda sería no tener guarda.
   *
   * Cada entrada lleva escrito su porqué: dentro de un año nadie se acuerda de
   * cuál de estas frases fue una decisión y cuál un despiste.
   *
   * OJO: aquí sólo se declara CASTELLANO. Esta guarda lee `fSalida` de
   * `CASTELLANO`, así que nunca ve la inglesa; hubo aquí un par de entradas en
   * inglés que no podían dispararse jamás y parecían cobertura. La inglesa la
   * vigila `fuente/idiomas/validar.cjs`, que es otra cosa. */
  const DECLARADAS = [
    /* El modelo de licencias cambió, en tres pasos y todos del cliente el
       2026-09-07: ya no es «1 usuario por módulo»; cada módulo que se paga trae
       1 administrador y 1 gestor, y los seis juntos son el paquete —2
       administradores, 5 licencias de gestor y 5 de Colaborador para
       WorkSpace—. Los dos caminos dan doce porque los seis módulos de pago
       suman exactamente los $5.000 del paquete. */
    ["cada módulo trae <strong>1 administrador y 1 gestor</strong>, y los seis juntos son el paquete completo: <strong>2 administradores, 5 licencias de gestor</strong> (riesgos, cumplimiento, ciberseguridad y auditoría interna) <strong>y 5 licencias de Colaborador</strong> para WorkSpace. Usuarios adicionales",
     "1 usuario incluido. Usuarios adicionales"],
    /* La misma decisión, en la respuesta de las dudas. La pregunta cambió con
       ella: ya no se pregunta cuánto cuesta añadir, sino cuántos vienen. */
    ["{q:'¿Cuántos usuarios vienen incluidos?',a:'Depende de lo que actives. Cada módulo que contratas trae 1 administrador y 1 gestor. Si activas los seis módulos entra el paquete completo por $5,000 al año, con 2 administradores, 5 licencias de gestor —riesgos, cumplimiento, ciberseguridad y auditoría interna— y 5 licencias de Colaborador para WorkSpace: son las mismas 12 licencias, mejor repartidas y con el acceso a WorkSpace, que sólo va en el paquete. Los usuarios adicionales se facturan aparte, con periodicidad anual. Para más de 200 usuarios o necesidades especiales hay plan Enterprise.'}",
     "{q:'¿Cuánto cuesta agregar usuarios?',a:'Cada módulo incluye 1 usuario. Los usuarios adicionales tienen un costo de $20 USD/usuario/mes, facturados anualmente. Para más de 200 usuarios o necesidades especiales, contáctanos para un plan Enterprise.'}"],
    /* Y la misma decisión, en la calculadora. El deslizador estaba en CADA
       tarjeta de módulo; ahora hay uno solo, en el panel de resumen, porque las
       doce licencias son de la cuenta y no del módulo: sumar un deslizador por
       módulo contaba tres veces a quien usa tres módulos. Aquí se deshace el
       traslado —se quita el control nuevo y se devuelve el rótulo viejo a la
       tarjeta— para que el resto de las 1.326 palabras se sigan comparando. */
    [/<div class="cuenta-users">[\s\S]*?<div class="sum-divider"><\/div>\n\s*/, ""],
    [/(<div class="mod-features">)/, '<div class="users-label"><span>Usuarios</span></div>$1'],
    /* La línea de usuarios del panel de resumen es NUEVA: antes no existía,
       porque lo que costaba la gente iba escondido dentro del precio de cada
       módulo y no se enseñaba en ninguna parte. */
    [/function lineaUsuariosResumen\(\) \{[\s\S]*?\n\}\n/, ""],
    /* Y también son nuevas las dos piezas del tope: la línea que explica por qué
       el total es menor que la suma de los módulos, y el aviso de que activando
       los que faltan el paquete sale por lo mismo. Sin la primera, el resumen
       enseña unas cuentas que no cuadran a la vista. */
    [/function lineaTopeResumen\(\) \{[\s\S]*?\n\}\n/, ""],
    [/\n\s*\$\{licenciasIncluidas\(\)\.paquete \? '' :[\s\S]*?licencias de Colaborador\)<\/span>`\}/, ""],
    /* `textoDeLasLicencias` tampoco existía: el original no decía en ninguna
       parte qué licencias trae lo que has elegido, porque no dependía de ello. */
    [/function textoDeLasLicencias\(\) \{[\s\S]*?\n\}\n/, ""],
    /* Y el rótulo del contador dice lo mismo que decía —lo que trae el
       paquete— con el número nuevo. */
    ["`${usuariosCuenta} usuarios incluidos`", "`1 usuario incluido`"],
    /* LA MONEDA, DICHA. El original ponía «MDF $15K» a secas en el nivel Gold
       del programa de socios. Esta página se vende en la República Dominicana,
       donde «$» se lee peso —RD$— salvo que ponga otra cosa, así que un importe
       sin moneda se lee por la treintava parte de lo que vale. Decisión del
       dueño el 2026-09-12: la moneda es siempre el dólar estadounidense, y se
       dice donde el importe se lee solo. Lo vigilan dos guardas —«no hay más
       moneda que el dólar» y «todo precio escrito dice USD»— en
       `fuente/validar.cjs`. */
    ["MDF $15K USD,", "MDF $15K,"],
  ];
  let normalizada = sal;
  for (const [ahora, antes] of DECLARADAS) {
    normalizada = typeof ahora === "string"
      ? normalizada.split(ahora).join(antes)
      : normalizada.replace(ahora, antes);
  }
  const dePagina = sinLetrasDeLogotipo(palabras(sinSelector(normalizada), { abre: `<main class="pagina">`, cierra: "</main>" }) || []);
  const deOrigen = sinOriginal ? null : sinLetrasDeLogotipo(palabras(aplicaMarca(soloElCuerpo(org), MARCA)));

  if (sinOriginal) {
    /* Sin original no hay palabras que comparar, pero sí hay algo que exigir:
       que el cuerpo esté donde toca y que tenga contenido de verdad. */
    comprueba(`${slug}: el cuerpo va dentro de <main class="pagina">`,
      sal.includes(`<main class="pagina">`));
    comprueba(`${slug}: tiene texto, no es una plantilla vacía`,
      dePagina.length > 150, dePagina.length + " palabras");

  } else if (!sal.includes(`<main class="pagina">`)) {
    comprueba(`${slug}: el cuerpo va dentro de <main class="pagina">`, false);
  } else if (slug === "legal") {
    /* ── LAS PALABRAS DE `legal` LAS VIGILA OTRO, Y ES MÁS ESTRICTO ──────
     *
     * Esta comprobación pregunta si la página dice lo mismo que el HTML
     * original de Archemir. Para `legal` eso ya no es la pregunta correcta: los
     * términos, la privacidad y las cookies se sirven desde el producto
     * —`app-saas/src/app/legal/documentos.ts`—, que es donde la gente los
     * acepta al registrarse, y el landing tiene que decir eso y no lo que
     * dijera un fichero congelado.
     *
     * No es aflojar la guarda: es cambiarla por una más dura.
     * `fuente/legal/validar.cjs` compara los treinta apartados palabra por
     * palabra contra el contrato de verdad, y además comprueba que la copia no
     * se haya quedado atrás respecto a la aplicación. Esta de aquí no podía ver
     * ninguna de las dos cosas.
     *
     * Aquí queda lo que esta guarda SÍ puede afirmar por su cuenta: que los
     * treinta apartados están, con su número y su título. Si mañana alguien
     * borra media página, salta aquí aunque la otra no llegue a correr. */
    const copia = path.join(AQUI, "..", "legal", "documentos.json");
    if (!fs.existsSync(copia)) {
      comprueba(`${slug}: existe la copia de los textos legales`, false, copia);
    } else {
      const docs = JSON.parse(fs.readFileSync(copia, "utf8")).documentos;
      const faltan = [];
      for (const d of docs) {
        for (const s of d.secciones) {
          const marca = `<span class="num">${s.n}</span> ${s.titulo}`;
          if (!sal.includes(marca)) faltan.push(d.id + " " + s.n);
        }
      }
      const cuantos = docs.reduce((n, d) => n + d.secciones.length, 0);
      comprueba(`${slug}: están los ${cuantos} apartados legales (el texto lo vigila fuente/legal/validar.cjs)`,
        faltan.length === 0, "faltan: " + faltan.join(", "));
    }
  } else {
    let corte = -1;
    const hasta = Math.max(dePagina.length, deOrigen.length);
    for (let i = 0; i < hasta; i++) {
      if (dePagina[i] !== deOrigen[i]) { corte = i; break; }
    }
    comprueba(
      `${slug}: las mismas palabras que el original, en el mismo orden`,
      corte === -1,
      corte === -1 ? "" :
        `en la palabra ${corte + 1} de ${deOrigen.length}: el original dice «` +
        (deOrigen.slice(Math.max(0, corte - 4), corte + 4).join(" ") || "(se acabó)") +
        `» y la página dice «` +
        (dePagina.slice(Math.max(0, corte - 4), corte + 4).join(" ") || "(se acabó)") + "»",
    );
  }

  /* LAS AFIRMACIONES, DE TODAS LAS PÁGINAS Y NO SÓLO DE LAS ESCRITAS DE CERO.
   *
   * Esto vivía dentro de la rama `if (sinOriginal)`, así que sólo miraba el
   * Centro de Confianza —la única página sin original—. La de planes tiene
   * original, y por eso nadie miró nunca sus afirmaciones: ahí estuvo
   * «conectores nativos con SharePoint, Teams y Power Apps», con Power Apps
   * inexistente en el producto y SharePoint siendo lo CONTRARIO de un
   * conector —un importador que pide bajar un CSV a mano—.
   *
   * La guarda no estaba mal escrita: estaba en el sitio equivocado. Una
   * página con original tiene vigilado que no CAMBIE lo que decía; nadie
   * vigilaba que lo que decía fuera VERDAD. Son dos preguntas distintas.
   *
   * Las páginas que no declaran nada en `afirmaciones.json` no cambian: las
   * tres listas se leen con `|| []`. */
  /* Y sus AFIRMACIONES, que es lo que de verdad hay que vigilar aquí: una
     página de confianza sin original es una página donde nadie se entera si
     «en proceso» pasa a «certificado». */
  const af = AFIRMACIONES[slug];
  if (af) {
    const faltan = (af.deben_estar || []).filter((x) => !sal.includes(x));
    comprueba(`${slug}: dice todo lo que prometió decir`, faltan.length === 0,
      "falta: " + faltan.join(" · "));

    const iso = (af.iso_en_proceso || []).filter((x) => !sal.includes(x));
    comprueba(`${slug}: la ISO 27001 sigue dicha como EN CURSO, no como obtenida`,
      iso.length === 0, "falta: " + iso.join(" · "));

    const coladas = [];
    for (const [patron, motivo] of af.no_pueden_estar || []) {
      const m = sal.match(new RegExp(patron, "i"));
      if (m) coladas.push(`«${m[0]}» — ${motivo}`);
    }
    comprueba(`${slug}: no promete nada que el código no sostenga`,
      coladas.length === 0, coladas.slice(0, 3).join(" | "));
  }

  /* ── 2. LO QUE LA PÁGINA HACE ─────────────────────────────────────── */
  const hOrg = comportamiento(soloElCuerpo(org));
  const hSal = comportamiento(
    sal.slice(sal.indexOf('<main class="pagina">'), sal.lastIndexOf("</main>")) +
    /* El guion de la página va después de `</main>`; sin él no se ven ni las
       funciones ni los manejadores que se escriben desde el código. */
    sal.slice(sal.lastIndexOf("</main>")),
  );
  for (const clave of ["identificadores", "manejadores", "funciones"]) {
    const quitados = (RETIRADOS[slug] || {})[clave] || [];
    const faltan = hOrg[clave].filter((x) => !hSal[clave].includes(x) && !quitados.includes(x));
    comprueba(`${slug}: no se ha perdido ningún ${clave.slice(0, -2)}or`.replace("ionor", "ion"),
      faltan.length === 0, "faltan: " + faltan.join(", "));
    /* Y al revés: una retirada declarada que SIGUE ahí es una declaración
       podrida, y una declaración podrida es un agujero por el que mañana se
       cuela una pérdida de verdad sin que nadie se entere. */
    const siguen = quitados.filter((x) => hSal[clave].includes(x));
    if (quitados.length) {
      comprueba(`${slug}: lo que se declara retirado (${clave}) de verdad no está`,
        siguen.length === 0, "siguen ahí: " + siguen.join(", "));
    }
  }
  /* LOS CONTROLES QUE SE RETIRAN A PROPÓSITO SE DESCUENTAN, y se dice cuántos.
     La regla sigue siendo «no se pierde ningún control»; lo que cambia es que
     una retirada declarada deja de contar como pérdida. El número va en
     `RETIRADOS` junto a su porqué, así que no se puede bajar el listón sin
     escribir al lado la razón. */
  const menos = RETIRADOS[slug] || {};
  for (const clave of ["entradas", "listas", "opciones", "areas", "botones"]) {
    const retirados = menos[clave] || 0;
    const perdidos = Math.max(0, hOrg[clave] - hSal[clave]);
    /* EL DESCUENTO TIENE QUE SER EXACTO, NO UN TECHO.
       La primera versión decía «vale si no has perdido más de lo declarado», y
       eso deja poner 99 y quedarse sin comprobación para siempre. Lo cazó su
       propia mutación: subir el número a 99 no hacía saltar nada.
       Ahora se exige además que lo declarado NO PASE de lo que de verdad falta:
       declarar de más es tan fallo como perder de más. Así el número no se
       puede inflar «por si acaso», que es como mueren estas listas. */
    comprueba(`${slug}: los mismos controles (${clave})`,
      hSal[clave] >= hOrg[clave] - retirados && retirados <= perdidos,
      retirados > perdidos
        ? `se declaran ${retirados} retirados y sólo faltan ${perdidos}: sobra declaración`
        : `el original tiene ${hOrg[clave]} y la página ${hSal[clave]}`
          + (retirados ? ` (se declararon ${retirados} retirados)` : ""));
  }

  /* ── 3. LA LÍNEA GRÁFICA, LETRA A LETRA ───────────────────────────── */
  const titulo = (sal.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  const desc = (sal.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
  /* La canónica y la tarjeta NO se leen de la página: se calculan de
     fuente/sitio.json igual que las calcula el sincronizador, y se exige que la
     página diga exactamente eso. Leerlas de la página sería preguntarle al
     examinado por la respuesta. */
  /* SI FALTA LA PÁGINA EN LA TABLA, SE DICE. Con `|| {}` esto aguantaba
     cuando `imagen` era una cadena —daba `undefined` y la comparación fallaba
     con su mensaje—; desde que es `{en, es}`, `{}.imagen.es` lanza un
     TypeError y el validador muere sin decir de qué página hablaba. Salta el
     día que alguien añada una página y se olvide de la tabla, que es justo el
     día en que hace falta que esto hable. */
  const donde = SITIO.paginas[slug];
  if (!donde) {
    comprueba(`${slug}: sitio.json dice dónde vive y con qué tarjeta se comparte`,
      false, "no tiene entrada en fuente/sitio.json");
    continue;
  }
  /* La canónica de la CASTELLANA lleva /es/: es la dirección donde vive de
     verdad. La imagen no, que está en la raíz — pero SÍ depende del idioma, y
     aquí decía lo contrario: «es la misma en los dos idiomas». Lo era, y ése
     era el fallo: nueve de las dieciocho páginas servían la tarjeta en el
     idioma equivocado. Esta comprobación mira la castellana, así que pide la
     castellana. */
  const canonica = SITIO.base + "/es/" + donde.fichero;
  /* CON `public/og/`, que es donde vive. Sin ese trozo la dirección era
     `https://clerigo.io/legal-og.png` y da 404, y la plantilla la estampa en
     sus CINCO huecos de imagen: og:image, og:image:secure_url, twitter:image,
     image_src y la ficha de datos.
     No se veía porque `posicionar.cjs` corre después y sobreescribe tres de
     las cinco; las otras dos se salvaban sólo porque nadie volvía a correr
     esto. Y el validador comparaba contra la misma dirección mala, así que los
     dos estaban de acuerdo y los dos equivocados: doce fallos suyos salían de
     aquí. Lo encontró una revisión en abanico, no yo. */
  const imagen = SITIO.base + "/public/og/" + donde.imagen.es;
  const cabeceraEsperada = CABECERA
    .split("{{TITULO}}").join(titulo)
    .split("{{DESCRIPCION}}").join(desc)
    .split("{{CANONICA}}").join(canonica)
    .split("{{IMAGEN}}").join(imagen)
    .split("{{BASE}}").join(SITIO.base);
  /* De la página se quitan las tres etiquetas de idioma alternativo antes de
     comparar: las pone el paso bilingüe, no la plantilla, y son idénticas en
     las siete páginas salvo por su propia dirección. */
  /* Y el `../` del icono: la castellana está un nivel más adentro que la raíz,
     donde vive el fichero, y la plantilla lo cita sin prefijo porque no sabe en
     qué idioma se va a usar. */
  /* Y lo que pone el paso de posicionamiento, que corre DESPUÉS de que la
     plantilla se estampe: palabras clave, orden al buscador, idioma de la
     tarjeta y la ficha de datos entera. La plantilla no las trae, así que
     compararlas contra ella sería comparar contra algo que no existe. */
  const salSinAlternativas = sinPosicionamiento(sal)
    .replace(/[ \t]*<link rel="alternate" hreflang="[a-z-]+" href="[^"]*">\n/g, "")
    .replace(/(\s(?:src|href)=")\.\.\/((?:sistema\/[a-z0-9-]+|favicon)\.png)"/g, '$1$2"');
  /* La plantilla se normaliza IGUAL que la página. `sinPosicionamiento` no
     borra el `og:locale`, lo pone a un valor fijo —cambia entre idiomas y
     tiene que dejar de contar, pero la etiqueta debe seguir estando—, así que
     aplicarlo sólo a un lado dejaba «·» contra «es_ES» y ninguna página
     empezaba por su plantilla. */
  comprueba(`${slug}: la cabecera, los tokens y la hoja compartida salen de la plantilla`,
    salSinAlternativas.startsWith(sinPosicionamiento(cabeceraEsperada)));
  comprueba(`${slug}: la canónica y la tarjeta son las que dice sitio.json`,
    sal.includes(`<link rel="canonical" href="${canonica}">`)
    && sal.includes(`<meta property="og:image" content="${imagen}">`),
    canonica);
  /* Y que las tres alternativas estén: sin ellas, el buscador trata las dos
     versiones como páginas distintas que dicen casi lo mismo y elige una por
     su cuenta. */
  comprueba(`${slug}: declara sus dos idiomas y cuál se sirve por omisión`,
    sal.includes(`hreflang="en" href="${SITIO.base}/${donde.fichero}"`)
    && sal.includes(`hreflang="es" href="${SITIO.base}/es/${donde.fichero}"`)
    && sal.includes(`hreflang="x-default" href="${SITIO.base}/${donde.fichero}"`));
  comprueba(`${slug}: tiene título y descripción propios`,
    titulo.includes("Clèrigo") && desc.length > 40,
    `título «${titulo}», descripción de ${desc.length} letras`);

  /* ── La tarjeta que sale al pegar el enlace ───────────────────────────
     Esto no se puede dar por bueno mirando la etiqueta: la etiqueta llevaba
     meses apuntando a og.png y el fichero NO existía. Se comprueba que el
     fichero está, que pesa lo que puede tragar WhatsApp y que mide lo que
     piden las tarjetas grandes. */
  /* De la dirección al fichero de al lado: la tarjeta tiene que estar aquí. */
  const fImagen = path.join(RAIZ, imagen.slice(SITIO.base.length + 1));
  const hayImagen = imagen !== "" && fs.existsSync(fImagen);
  comprueba(`${slug}: la imagen de la vista previa existe de verdad`, hayImagen, imagen || "no declara ninguna");
  if (hayImagen) {
    const kb = Math.round(fs.statSync(fImagen).size / 1024);
    /* Las medidas van en la cabecera del PNG: bytes 16-23 tras la firma. */
    const cab = Buffer.alloc(24);
    const fd = fs.openSync(fImagen, "r");
    fs.readSync(fd, cab, 0, 24, 0);
    fs.closeSync(fd);
    const ancho = cab.readUInt32BE(16);
    const alto = cab.readUInt32BE(20);
    comprueba(`${slug}: la imagen mide 1200 × 630 y pesa menos de 300 KB`,
      ancho === 1200 && alto === 630 && kb < 300, `${ancho} × ${alto}, ${kb} KB`);
  }
  comprueba(`${slug}: las etiquetas que piden WhatsApp, LinkedIn y X están completas`,
    /og:image:width" content="1200"/.test(sal)
    && /og:image:height" content="630"/.test(sal)
    && /og:image:type" content="image\/png"/.test(sal)
    && /og:image:alt"/.test(sal)
    && /twitter:card" content="summary_large_image"/.test(sal)
    && /twitter:image:alt"/.test(sal)
    && /application\/ld\+json/.test(sal));
  /* Y que estén ARRIBA: el rastreador de WhatsApp se lleva los primeros
     kilobytes de la página y si las etiquetas caen más abajo no las ve. */
  comprueba(`${slug}: y están en el primer kilobyte y medio de la página`,
    sal.indexOf('property="og:image"') > 0 && sal.indexOf('property="og:image"') < 1536,
    "og:image aparece en el byte " + sal.indexOf('property="og:image"'));
  /* El trozo compartido se compara SIN el selector de idioma: sus dos enlaces
     llevan a la MISMA pagina en el otro idioma, asi que cambian de una a otra.
     Eso es lo correcto —desde legal.html se salta a legal.html— y por eso se
     recorta antes de comparar, en vez de exigir que sean iguales. */
  /* También sin lo del posicionamiento: `keywords` y `robots` se ponen justo
     antes de `</head>`, y ese cierre cae DENTRO del tramo compartido que se
     compara aquí. */
  const salSinSelector = sinPosicionamiento(sinSelector(sal));
  comprueba(`${slug}: ${chrome ? "la barra y el pie son" : "el cierre de la hoja es"} el de la plantilla`,
    salSinSelector.includes(chrome ? CIERRE : CIERRE_SIN_BARRA)
    && salSinSelector.includes(chrome ? PIE : PIE_SIN_PIE));

  /* ── 4. NADA DE LA MARCA VIEJA ────────────────────────────────────── */
  let sinLosIntactos = sal;
  for (const v of MARCA.intactos) sinLosIntactos = sinLosIntactos.split(v).join(" ");
  /* También «arquemir» y «axioma»: el original traía las dos mal escritas —una
     con q y otra como app.axioma.com— y una comprobación que sólo buscara la
     grafía correcta las habría dado por buenas. Lo dieron por bueno, de hecho,
     hasta que alguien las leyó. */
  const VIEJO = /archemir|arquemir|axioma/i;
  comprueba(`${slug}: sin rastro de la marca vieja, ni mal escrita`,
    !VIEJO.test(sinLosIntactos),
    (sinLosIntactos.match(new RegExp(VIEJO, "gi")) || []).join(", "));
  comprueba(`${slug}: la marca es «Clèrigo»`, /Clèrigo/.test(sal));

  /* ── 5. NI UN PICTOGRAMA ──────────────────────────────────────────── */
  const sinDatos = sal
    .replace(/data:image\/svg\+xml,[^"')]+/g, "")
    .replace(/data:image\/png;base64,[A-Za-z0-9+/=]+/g, "");
  const pict = [...new Set(sinDatos.match(PICTOGRAMAS) || [])];
  comprueba(`${slug}: sin emojis ni estrellas ni flechas de texto`, pict.length === 0, pict.join(" "));

  /* ── 6. NI UN RESTO DEL TEMA OSCURO ───────────────────────────────── */
  /* Una página puede tener un tramo oscuro A PROPÓSITO —la de acceso lleva su
     panel de marca en negro, como el de la aplicación—, pero tiene que estar
     rotulado y todo su color tiene que vivir dentro del rótulo. Fuera de ahí,
     un valor del tema oscuro es un descuido. */
  const ABRE_OSCURO = "── OSCURO A PROPÓSITO ──";
  const CIERRA_OSCURO = "── FIN DEL OSCURO A PROPÓSITO ──";
  const declaraOscuro = sal.includes(ABRE_OSCURO);
  comprueba(`${slug}: sólo declara un tramo oscuro si le hace falta`,
    declaraOscuro === !chrome,
    declaraOscuro ? "lo declara y no lo necesita" : "lo necesita y no lo declara");
  if (declaraOscuro) {
    comprueba(`${slug}: el tramo oscuro está cerrado`, sal.includes(CIERRA_OSCURO));
  }
  const sinElTramo = declaraOscuro
    ? sal.slice(0, sal.indexOf(ABRE_OSCURO)) + sal.slice(sal.indexOf(CIERRA_OSCURO))
    : sal;
  const { restos } = restosDeTemaOscuro(sinElTramo.split("\n"));
  comprueba(`${slug}: nada sigue pintando en oscuro fuera de la barra y el pie`,
    restos.length === 0,
    restos.slice(0, 3).map((r) => "línea " + r.n + ": " + r.l).join(" | "));

  /* ── 6 bis. QUE EL «+20%» SE LEA, EN LOS DOS ESTADOS ──────────────────
   *
   * El distintivo del interruptor «Anual / Mensual» es verde oscuro sobre
   * verde al 10%. Apagado se lee. Encendido, el fondo pasa a ser el rojo de la
   * marca y ese verde encima quedaba en 1,23 de contraste: no es que se leyera
   * mal, es que no se leía, y así estuvo publicado hasta que alguien lo miró.
   *
   * NO SE COMPRUEBA QUE ESTÉ ESCRITO UN COLOR CONCRETO, SE MIDE. Una guarda
   * que dijera «tiene que poner #FFFFFF» pasaría el día que se cambie el rojo
   * de la marca por uno más claro y el blanco deje de leerse encima, que es
   * exactamente el fallo que esto viene a impedir. Aquí se sacan los colores
   * de la propia página —el rojo de su ficha, el fondo del interruptor, lo que
   * diga cada regla—, se superponen las capas translúcidas como las superpone
   * el navegador, y se calcula el contraste de verdad. El mínimo son 4,5, que
   * es lo que pide la norma para un texto.
   *
   * Se miran LOS DOS estados. Con mirar sólo el encendido, apagar el otro sin
   * querer pasaría de largo. */
  if (slug === "precios") {
    const hex = (s) => ({ r: parseInt(s.slice(1, 3), 16), g: parseInt(s.slice(3, 5), 16), b: parseInt(s.slice(5, 7), 16), a: 1 });
    /* Los colores de esta página se escriben casi siempre como `var(--algo)`,
       así que hay que ir a buscar el valor a la ficha. Con leer sólo lo que
       pone la regla, el fondo del interruptor salía «var(--dark-3)», no se
       entendía como color, y la medida se hacía contra un blanco inventado. */
    const valorDe = (nombre) => (sal.match(new RegExp("--" + nombre + ":\\s*([^;}]+)")) || [])[1];
    const col = (s, vueltas = 0) => {
      s = String(s || "").trim();
      const v = s.match(/^var\(\s*--([\w-]+)\s*\)$/);
      if (v) return vueltas > 4 ? null : col(valorDe(v[1]), vueltas + 1);
      if (s[0] === "#") return hex(s.length === 4 ? "#" + s[1] + s[1] + s[2] + s[2] + s[3] + s[3] : s);
      const m = s.match(/[\d.]+/g);
      return m ? { r: +m[0], g: +m[1], b: +m[2], a: m.length > 3 ? +m[3] : 1 } : null;
    };
    const encima = (f, d) => ({ r: f.r * f.a + d.r * (1 - f.a), g: f.g * f.a + d.g * (1 - f.a), b: f.b * f.a + d.b * (1 - f.a), a: 1 });
    const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const luz = (p) => 0.2126 * lin(p.r) + 0.7152 * lin(p.g) + 0.0722 * lin(p.b);
    const contraste = (a, b) => { const x = luz(a), y = luz(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const dime = (re) => (sal.match(re) || [])[1];
    /* EL PREFIJO NO ES ADORNO. Sin él, buscar «color:» encontraba primero el
       «border-color:» de la línea de al lado y la guarda medía el contraste
       del texto contra el borde: decía 3,08 donde el navegador dice 6,83. Una
       guarda que se equivoca a la baja da tanta guerra como una que no ve. */
    const declara = (bloque, prop) =>
      (String(bloque || "").match(new RegExp("(?:^|[;{\\s])" + prop + ":\\s*([^;}]+)")) || [])[1];

    const rojo = col(dime(/--red:\s*(#[0-9a-fA-F]{3,6})/));
    const verde = col(dime(/--success:\s*(#[0-9a-fA-F]{3,6})/));
    const base = col(dime(/\.billing-toggle\s*\{[^}]*background:\s*([^;}]+)/)) || { r: 255, g: 255, b: 255, a: 1 };
    const suyo = dime(/\.save-badge\s*\{([^}]*)\}/);
    const encendida = dime(/\.bill-btn\.active\s+\.save-badge\s*\{([^}]*)\}/);

    const papel = { r: 255, g: 255, b: 255, a: 1 };
    const mide = (fondoDelBoton, bloque, tintaPorOmision) => {
      const f = col(declara(bloque, "background")) || col(declara(bloque, "background-color"));
      const tinta = col(declara(bloque, "color")) || tintaPorOmision;
      if (!f || !tinta) return null;
      return contraste(tinta, encima(f, fondoDelBoton));
    };
    const apagado = rojo && verde && suyo ? mide(encima(base, papel), suyo, verde) : null;
    const enc = rojo && suyo ? mide(rojo, (encendida || "") + ";" + suyo, verde) : null;
    const MINIMO = 4.5;
    comprueba(`${slug}: el «+20%» se lee con el botón apagado`,
      apagado !== null && apagado >= MINIMO,
      apagado === null ? "no se han podido leer sus colores" : "contraste " + apagado.toFixed(2) + " (mínimo " + MINIMO + ")");
    comprueba(`${slug}: el «+20%» se lee con el botón encendido, sobre el rojo`,
      enc !== null && enc >= MINIMO,
      enc === null ? "no se han podido leer sus colores" : "contraste " + enc.toFixed(2) + " (mínimo " + MINIMO + ")");

    /* ── 6 ter. UNA SOLA CUENTA DEL TOTAL, Y EL CUPÓN EN LAS DOS PANTALLAS ──
     *
     * Esta página enseña el total en DOS sitios: el panel de resumen y la caja
     * del pedido, dentro de la ventana de alta. Tenía un defecto en cada uno.
     *
     * El primero se veía. `applyCoupon` repintaba sólo la caja: con Riesgos
     * elegido, la caja decía 1.520 y el panel de detrás seguía diciendo 1.900.
     * Y al revés —con el descuento puesto, un cupón que no vale devolvía la
     * caja a 1.900 y dejaba el 1.520 en el panel—. El panel sólo se enteraba
     * cuando la persona tocaba un módulo o el ciclo de facturación.
     *
     * El segundo no se veía todavía. Cada pantalla hacía su propia cuenta
     * —`round(S · (1 − d))` una, `S − round(S · d)` la otra— y coincidían
     * sólo porque todos los precios son múltiplos de diez. Con un precio en
     * 1.895, de 3.906 casos pintados en el navegador se separaban 252, de un
     * dólar cada uno, y nadie lo habría relacionado con el cupón.
     *
     * Se vigilan las dos cosas, porque la segunda no se deduce de la primera:
     * una cuenta compartida no sirve de nada si una de las dos pantallas no se
     * vuelve a pintar. */
    const cuerpoDe = (nombre) => {
      const i = sal.search(new RegExp("^function " + nombre + "\\(", "m"));
      if (i < 0) return null;
      const fin = sal.slice(i).search(/^\}/m);
      return fin < 0 ? null : sal.slice(i, i + fin + 1);
    };
    const LA_CUENTA = "totalDelPedido";
    const PANTALLAS = ["updateSummary", "renderOrderBox"];
    const laCuenta = cuerpoDe(LA_CUENTA);
    comprueba(`${slug}: el total lo calcula UNA función, y ahí está el descuento`,
      laCuenta !== null && /Math\.round\([^\n]*1 - discount/.test(laCuenta),
      laCuenta === null ? "no hay función " + LA_CUENTA : "existe pero no aplica el descuento");
    /* Fuera de esa función, `discount` sólo puede LEERSE: para decidir si se
       enseña la línea del descuento, o para escribir el tanto por ciento.
       Sumar, restar o multiplicar con él en otro sitio es volver a tener dos
       cuentas, que es de donde venía el fallo. */
    const echaCuentasConElDescuento = (cuerpo) =>
      /[-+*/]\s*discount|discount\s*[-+*/]/.test(String(cuerpo || "").replace(/discount\s*\*\s*100/g, ""));
    PANTALLAS.forEach((f) => {
      const c = cuerpoDe(f);
      const llama = c !== null && c.includes(LA_CUENTA + "(");
      comprueba(`${slug}: «${f}» saca el total de ${LA_CUENTA}, no de una cuenta propia`,
        llama && !echaCuentasConElDescuento(c),
        c === null ? "no se encuentra la función"
          : llama ? "llama, pero además echa cuentas con el descuento por su cuenta"
          : "no llama a " + LA_CUENTA);
    });
    /* ── LA MONEDA DE LOS NÚMEROS QUE SE PINTAN ──────────────────────────
     *
     * El validador del sitio ya exige que todo precio ESCRITO diga USD. Pero
     * los números de esta página casi no están escritos: se pintan desde los
     * datos. El de la tarjeta de cada área —el más gordo, 26 píxeles y
     * negrita— sale de `$${calcModulePrice(m)}`, así que en el fichero no hay
     * cifra que mirar y aquella guarda no lo ve. Se comprobó: quitándole el
     * «USD» a esa plantilla, el validador del sitio seguía en verde.
     *
     * Esto mira los tres sitios donde la página dice la moneda de un número
     * pintado. Y son tres comprobaciones con su nombre, no una: con una sola,
     * perder uno de los tres se confundiría con perder otro.
     *
     * Importa porque el mercado es la República Dominicana, donde «$» se lee
     * peso salvo que ponga otra cosa: «$2,000 /año» leído en pesos es un
     * módulo por la treintava parte de su precio. */
    const trozo = (desde, hasta) => {
      const i = sal.indexOf(desde);
      if (i < 0) return null;
      const j = sal.indexOf(hasta, i + desde.length);
      return j < 0 ? null : sal.slice(i, j);
    };
    const laTarjeta = trozo('<div class="mod-price-val"', "</div>");
    comprueba(`${slug}: el precio de la tarjeta del área dice la moneda`,
      laTarjeta !== null && laTarjeta.includes("USD"),
      laTarjeta === null ? "no se encuentra el precio de la tarjeta" : "se pinta sin decir USD");
    /* La línea ENTERA, no hasta el primer : dentro hay dos divs, y el
       primero es el rótulo «Total». Cortando ahí, la guarda decía que faltaba
       la moneda cuando estaba justo después. */
    /* La línea ENTERA, no hasta el primer `</div>`: dentro hay dos divs y el
       primero es el rótulo «Total». Cortando ahí, la guarda decía que faltaba
       la moneda cuando estaba tres caracteres más allá. */
    const elTotal = sal.split("\n").find((l) => l.includes('class="order-line total"')) || null;
    comprueba(`${slug}: el total de la caja del pedido dice la moneda`,
      elTotal !== null && elTotal.includes("USD"),
      elTotal === null ? "no se encuentra el total del pedido" : "se pinta sin decir USD");
    /* Las líneas del panel no repiten la moneda a propósito: van una debajo de
       otra bajo este rótulo. Por eso el rótulo no puede perderla — es el único
       sitio donde el panel la dice—, y se exige en sus DOS formas: la que va
       escrita en la página y la que el guion pone al cambiar de ciclo. */
    const rotuloEscrito = trozo('id="sumPeriod"', "</div>");
    const rotuloDelGuion = trozo("getElementById('sumPeriod').textContent", ";");
    comprueba(`${slug}: el rótulo del periodo del panel dice la moneda, en los dos ciclos`,
      rotuloEscrito !== null && rotuloEscrito.includes("USD")
      && rotuloDelGuion !== null && (rotuloDelGuion.match(/USD/g) || []).length === 2,
      "escrito: " + (rotuloEscrito || "no está") + " · guion: " + (rotuloDelGuion || "no está"));

    const cupon = cuerpoDe("applyCoupon");
    const sinRepintar = PANTALLAS.filter((f) => !String(cupon || "").includes(f + "()"));
    comprueba(`${slug}: el cupón repinta LAS DOS pantallas que enseñan el total`,
      cupon !== null && sinRepintar.length === 0,
      cupon === null ? "no hay función applyCoupon" : "se queda sin repintar: " + sinRepintar.join(", "));
  }

  /* ── 7. LA LETRA ──────────────────────────────────────────────────── */
  const familias = [...new Set([...sal.matchAll(/font-family:\s*([^;}"]+)/g)].map((m) => m[1].trim()))];
  /* `inherit` vale: es lo que se le pone a los controles de formulario para
     que dejen de caer en la letra del navegador, y lo que heredan es la de la
     portada. */
  const raras = familias.filter((f) =>
    !/^'Source Sans 3', sans-serif$|^'Source Code Pro', monospace$|^inherit$/.test(f));
  comprueba(`${slug}: sólo la letra de la portada`, raras.length === 0, raras.join(" | "));

  /* ── 8. LOS ENLACES LLEVAN A ALGÚN SITIO ──────────────────────────── */
  const internos = [...new Set([...sal.matchAll(/href="([a-z0-9-]+\.html)(?:#[^"]*)?"/g)].map((m) => m[1]))];
  const rotos = internos.filter((f) => !fs.existsSync(path.join(CASTELLANO, f)));
  comprueba(`${slug}: todos los enlaces internos llevan a un fichero que existe`,
    rotos.length === 0, rotos.join(", "));
}

/* ── Y la comprobación que vigila a las demás ───────────────────────────── */
if (!soloUna) {
  console.log("\n── La línea gráfica es UNA ─────────────────────────────────────");
  const conChrome = PAGINAS.filter((p) => p.chrome).map((p) => path.join(CASTELLANO, p.slug + ".html"))
    .filter((f) => fs.existsSync(f)).map(lee)
    /* Sin el selector ni lo del posicionamiento, por lo mismo de arriba: las
       palabras clave son distintas en cada página a propósito —para eso están—
       y si se comparan, las cinco dejan de parecerse. */
    .map((h) => sinPosicionamiento(sinSelector(h)));
  comprueba("las páginas con barra y pie llevan EL MISMO trozo compartido",
    conChrome.length > 1 && conChrome.every((h) => h.includes(CIERRE) && h.includes(PIE)),
    conChrome.length + " páginas encontradas");
}

console.log("\n" + "─".repeat(64));
if (fallos.length === 0) {
  console.log(`TODO PASA  ·  ${total} comprobaciones`);
} else {
  console.log(`${fallos.length} FALLOS de ${total} comprobaciones\n`);
  fallos.forEach((f) => console.log("  · " + f));
  process.exitCode = 1;
}
