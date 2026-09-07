/**
 * LAS CIFRAS DE LA PORTADA, CON SU FUENTE AL LADO.
 *
 * ── POR QUÉ ESTE FICHERO EXISTE ───────────────────────────────────────────
 *
 * Porque decían «15+» las dos, y ninguna de las dos salía de ningún sitio. De
 * estas cifras se toman decisiones con dinero detrás: alguien las lee, las
 * repite en una reunión y las pone en una propuesta. Una cifra sin fuente es
 * una cifra que nadie puede defender cuando la preguntan.
 *
 * Y envejecen solas. Por eso cada una lleva escrito CÓMO se contó y CUÁNDO,
 * para que volver a contarla sea repetir una orden y no rehacer el trabajo.
 *
 * ── CONTADAS EL 2026-09-07, SOBRE app-saas ────────────────────────────────
 *
 * MÓDULOS = 32
 *
 *   Las pantallas del panel con espacio propio, quitando lo que no es un
 *   módulo: la cuenta, los ajustes, «mi espacio», permisos y el radar.
 *
 *     ls src/app/dashboard/  ->  47 carpetas con page.tsx
 *     menos 15 que no son módulo               = 32
 *
 *   Hay otras dos cuentas defendibles, y se dicen para que nadie crea que
 *   ésta se eligió por ser la más alta —de hecho es la más baja—:
 *     · 42  hojas funcionales del árbol de permisos (MODULE_TREE, 49 hojas
 *           menos 7 de configuración)
 *     · 47  todas las carpetas de /dashboard con página
 *   Se publica 32 porque es la que cualquiera puede comprobar abriendo el
 *   producto y contando lo que ve en el menú.
 *
 * MARCOS, NORMAS Y LEYES = 66, de 16 organismos
 *
 *   Contado en la base, tabla `RegDocumento`, que es de donde el producto los
 *   sirve:
 *
 *     documentos normativos, total ........ 94
 *     menos los catálogos propios de XGRC .. 28   (escalas, taxonomías,
 *                                                  amenazas, indicadores)
 *     de organismos externos .............. 66
 *
 *   El desglose por emisor, que es lo que va en el subtítulo:
 *     ISO 19 · OGTIC 12 · JM/SB 6 · NIST 6 · SIMV 5 · COSO 3 · INDOTEL 2 ·
 *     ISACA 2 · PCI SSC 2 · UE 2 · SWIFT 2 · UAF 1 · BCRD 1 · IDECOOP 1 ·
 *     AICPA 1 · AXELOS 1
 *
 *   Detrás de esos 66 hay 557 cláusulas y 4.519 requisitos cargados. Esa
 *   última es la cifra más fuerte que tiene esta casa y hoy no se dice en
 *   ningún sitio de la portada.
 *
 * ── LAS OTRAS DOS DE LA FILA ──────────────────────────────────────────────
 *
 * REDUCCIÓN DE TRABAJO MANUAL = 78 %
 *
 *   Las dos venían del original de Archemir —decía 90 %— y no salían de
 *   ninguna medición. Se avisó, y el dueño fijó el 78 % el 2026-09-07.
 *
 *   Su fuente es ésa: una decisión suya, no una cuenta. Se escribe aquí para
 *   que conste, porque una cifra que nadie sabe de dónde viene acaba
 *   repitiéndose en una propuesta sin que nadie pueda defenderla — y ésta sí
 *   se puede: la puso quien responde del producto.
 *
 * TIEMPO DE IMPLEMENTACIÓN = 48 h
 *
 *   Igual: viene del original y el dueño la mantiene. Es la promesa que hace
 *   la casa, no una media medida.
 *
 * ── LA CIFRA QUE HAY Y NO SE USA ──────────────────────────────────────────
 *
 * Detrás de los 66 documentos hay 557 cláusulas y 4.519 REQUISITOS cargados.
 * «4.519 requisitos normativos mapeados» es más fuerte que cualquier otra cosa
 * de esta fila y hoy no se dice en ninguna parte de la portada. Queda apuntado
 * por si algún día se decide sustituir una de las dos de arriba.
 */

module.exports = {
  es: {
    modulos: { valor: "32", sufijo: "", rotulo: "Módulos integrados",
      desc: "Un solo entorno para toda tu operación GRC" },
    marcos: { valor: "66", sufijo: "", rotulo: "Marcos, normas y leyes",
      desc: "De 16 organismos: ISO, NIST, COSO, ISACA, PCI SSC, SWIFT, AICPA, AXELOS, UE, y los dominicanos SIMV, JM/SB, BCRD, OGTIC, INDOTEL, UAF e IDECOOP" },
    manual: { valor: "78", sufijo: "%", rotulo: "Reducción de trabajo manual",
      desc: "Automatización de tareas repetitivas de cumplimiento" },
  },
  en: {
    modulos: { valor: "32", sufijo: "", rotulo: "Integrated modules",
      desc: "One environment for your entire GRC operation" },
    marcos: { valor: "66", sufijo: "", rotulo: "Frameworks, standards and laws",
      desc: "From 16 issuing bodies: ISO, NIST, COSO, ISACA, PCI SSC, SWIFT, AICPA, AXELOS, EU, and the Dominican SIMV, JM/SB, BCRD, OGTIC, INDOTEL, UAF and IDECOOP" },
    manual: { valor: "78", sufijo: "%", rotulo: "Reduction in manual work",
      desc: "Automation of repetitive compliance tasks" },
  },
};
