/**
 * QUÉ DICE CADA TARJETA DE ENLACE.
 *
 * Una entrada por fichero de `og/`. El texto NO se inventa aquí: sale del
 * `og:title` y la `description` de la página que usa cada tarjeta, resumidos a
 * lo que cabe en una imagen que se ve del tamaño de un sello en un chat.
 *
 * ── EL IDIOMA DE CADA UNA ─────────────────────────────────────────────────
 *
 * El de la página que la usa, no el que nos guste. Hay tarjetas compartidas
 * entre la versión inglesa y la castellana —`marcos-og.png` la usan
 * `marcos.html` y `es/marcos.html`—; en ésas manda el título de la página de
 * la raíz, que es la que más se comparte.
 *
 * ── LA MARCA VA CON ACENTO GRAVE: «Clèrigo» ───────────────────────────────
 *
 * Es como la escribe el logotipo y como la escribe la portada, 15 veces. Los
 * títulos de las páginas interiores dicen «Clérigo», con acento agudo, y eso
 * es un error suyo que hay que corregir aparte; las tarjetas no lo copian.
 *
 * ── DOS VARIANTES, UN SOLO SISTEMA ────────────────────────────────────────
 *
 *   "producto"     lleva una ventana con una captura de verdad del sistema.
 *                  Va donde la página habla DE la plataforma: la portada y los
 *                  marcos. Ahí lo que convence es ver que el sistema existe.
 *   "tipografica"  sin ventana, el titular a todo el ancho. Va donde no hay
 *                  pantalla que enseñar —seguridad, precios, contacto, legal—.
 *                  Forzar una captura donde no viene a cuento es lo que hace
 *                  que un juego de tarjetas parezca relleno.
 *
 * Las dos comparten rejilla, marca, filo rojo, tipografía y tira de normas, que
 * es lo que hace que se lean como una familia.
 *
 * ── LAS CIFRAS ────────────────────────────────────────────────────────────
 *
 * Sólo las que la propia página publica. El precio de $20 por usuario y mes
 * está en la página de planes, así que va; es además lo más útil que puede
 * decir una tarjeta de precios. Lo que NO va son indicadores inventados: la
 * tarjeta anterior de la portada decía «99.4% Continuous Compliance Health» y
 * «93 Controls Monitored», que no salen de ningún sitio.
 */

/* Las normas que el producto cubre de verdad; salen de la página de marcos. */
const NORMAS = ["ISO 27001", "ISO 22301", "NIST CSF", "SOC 2", "GDPR"];
/* Y lo que sostiene el centro de confianza, que es otra clase de prueba. */
const SEGURIDAD_EN = ["AES-256", "ZERO TRUST", "TENANT ISOLATION", "AUDIT TRAIL"];
const SEGURIDAD_ES = ["AES-256", "ZERO TRUST", "AISLAMIENTO POR ORGANIZACIÓN", "BITÁCORA"];

module.exports = [
  /* ── La portada. La tarjeta que más se comparte, con diferencia. ────── */
  {
    fichero: "clerigo-og.png", idioma: "en", variante: "producto",
    captura: "sistema/sistema-panel.png",
    rotuloVentana: "Clèrigo XGRC — Command Centre",
    antetitulo: "Governance · Risk · Compliance",
    /* El titular DEL SITIO, partido igual y con el mismo subrayado. Quien haya
       visto la portada lo reconoce de golpe. */
    titular: ["Managing GRC", "doesn't have to be", "@complicated@"],
    bajada: "Risk, regulatory compliance, internal audit, internal control, cybersecurity and privacy — in a single platform.",
    tira: NORMAS,
  },
  {
    /* `oscuro.html` es la misma portada con otra piel, y comparte mensaje. */
    fichero: "og.png", idioma: "en", variante: "producto",
    captura: "sistema/sistema-panel.png",
    rotuloVentana: "Clèrigo XGRC — Command Centre",
    antetitulo: "Governance · Risk · Compliance",
    titular: ["Managing GRC", "doesn't have to be", "@complicated@"],
    bajada: "Risk, regulatory compliance, internal audit, internal control, cybersecurity and privacy — in a single platform.",
    tira: NORMAS,
  },

  /* ── Marcos regulatorios ─────────────────────────────────────────────── */
  {
    fichero: "frameworks-og.png", idioma: "en", variante: "producto",
    captura: "sistema/sistema-cumplimiento.png",
    rotuloVentana: "Clèrigo XGRC — Regulatory Compliance",
    antetitulo: "Compliance frameworks",
    titular: ["Every framework,", "@cross-mapped@"],
    bajada: "66 standards, laws and frameworks from 16 issuing bodies — ISO, NIST, COSO, PCI SSC, SWIFT, SIMV, JM/SB, BCRD, OGTIC — one control set.",
    tira: NORMAS,
  },
  {
    fichero: "marcos-og.png", idioma: "es", variante: "producto",
    captura: "sistema/sistema-cumplimiento.png",
    rotuloVentana: "Clèrigo XGRC — Cumplimiento Regulatorio",
    antetitulo: "Marcos normativos",
    titular: ["Cada marco,", "@mapeado@ con los demás"],
    bajada: "66 marcos, normas y leyes de 16 organismos — ISO, NIST, COSO, PCI SSC, SWIFT, SIMV, JM/SB, BCRD, OGTIC — y un solo juego de controles.",
    tira: ["ISO 27001", "NIST CSF", "SOC 2", "SIMV", "LEY 155-17"],
  },

  /* ── Centro de confianza. Sin ventana: aquí no hay pantalla que enseñar,
        lo que se enseña es cómo está montado por dentro. ──────────────── */
  {
    fichero: "trustcenter-og.png", idioma: "en", variante: "tipografica",
    antetitulo: "Trust Center",
    titular: ["Where your data lives,", "and @who answers@ for it"],
    bajada: "AES-256 at rest and in transit, Zero Trust architecture, tenant isolation enforced by the database, and data residency.",
    tira: SEGURIDAD_EN,
  },
  {
    fichero: "confianza-og.png", idioma: "es", variante: "tipografica",
    antetitulo: "Centro de Confianza",
    titular: ["Dónde viven tus datos,", "y @quién responde@"],
    bajada: "Cifrado AES-256 en reposo y en tránsito, arquitectura Zero Trust, aislamiento entre organizaciones aplicado por la base de datos y soberanía de datos.",
    tira: SEGURIDAD_ES,
  },

  /* ── Contacto ────────────────────────────────────────────────────────── */
  {
    fichero: "contact-og.png", idioma: "en", variante: "tipografica",
    antetitulo: "Request a demo",
    titular: ["Twenty minutes with a", "compliance @specialist@"],
    bajada: "A guided tour of the platform against your own risk and audit workflows. No commitment.",
    tira: NORMAS,
  },
  {
    fichero: "contacto-og.png", idioma: "es", variante: "tipografica",
    antetitulo: "Solicita una demostración",
    titular: ["Veinte minutos con un", "especialista en @cumplimiento@"],
    bajada: "Un recorrido por la plataforma sobre tus propios flujos de riesgo y auditoría. Sin compromiso.",
    tira: NORMAS,
  },

  /* ── Planes. El precio va porque está publicado en su página, y porque es
        lo que se viene a saber. ──────────────────────────────────────── */
  {
    fichero: "precios-og.png", idioma: "es", variante: "tipografica",
    antetitulo: "Planes y precios",
    titular: ["Desde @$20@ por usuario", "al mes"],
    bajada: "Activa sólo los módulos y los marcos que tu empresa necesita. Sin cargos ocultos y sin tarjeta para empezar.",
    tira: NORMAS,
  },

  /* ── Partners ────────────────────────────────────────────────────────── */
  {
    fichero: "partners-og.png", idioma: "es", variante: "tipografica",
    antetitulo: "Programa de partners",
    titular: ["Para quien ya asesora", "en riesgo y @cumplimiento@"],
    bajada: "Consultoras, auditores y firmas de ciberseguridad: portal propio, reparto de ingresos y certificación.",
    tira: NORMAS,
  },

  /* ── Legal. La más callada del juego, a propósito: nadie comparte esta
        página con entusiasmo, y una tarjeta ruidosa aquí desentona. ──── */
  {
    fichero: "legal-og.png", idioma: "es", variante: "tipografica",
    antetitulo: "Legal",
    titular: ["Términos, privacidad", "y @cookies@"],
    bajada: "Condiciones del servicio, tratamiento de datos personales y compromisos de nivel de servicio.",
    tira: ["ISO 27001", "GDPR", "LEY 172-13"],
  },
];
