/**
 * LAS PALABRAS POR LAS QUE QUEREMOS QUE NOS ENCUENTREN.
 *
 * ── LO PRIMERO, PORQUE SI NO ESTO NO SE ENTIENDE ──────────────────────────
 *
 * La etiqueta `<meta name="keywords">` NO POSICIONA. Google dejó de usarla en
 * 2009 y lo tiene escrito; Bing la trata como señal de spam si se abusa. Se
 * pone igualmente —cuesta nada, algún buscador menor la lee, y es el sitio
 * donde queda por escrito qué palabras nos importan— pero quien crea que con
 * eso se sube en el buscador va a esperar sentado.
 *
 * Lo que SÍ cuenta de esta lista es lo otro: que estas palabras estén en el
 * <title>, en los encabezados, en el texto que se ve y en la ficha de datos
 * estructurados. Esta lista es la fuente de la que salen todas ellas, para que
 * digan lo mismo. Escribirlas en cinco sitios a mano es como acaban diciendo
 * cinco cosas distintas.
 *
 * ── DE DÓNDE SALEN ────────────────────────────────────────────────────────
 *
 * De lo que el producto HACE, no de lo que gustaría que hiciera. Cada norma de
 * esta lista está en la página de marcos, cada módulo está en el producto.
 * Una palabra que traiga a alguien buscando algo que no tenemos es una visita
 * que se va en diez segundos, y eso el buscador lo mide y lo cobra.
 */

/* Las normas y marcos que el producto cubre de verdad: salen de la página de
   marcos, que es la que los enumera uno a uno. */
const NORMAS = [
  "ISO 27001", "ISO 27701", "ISO 9001", "ISO 22301", "ISO 31000", "ISO 37301",
  "ISO 37001", "ISO 42001", "ISO 30301", "NIST CSF", "NIST 800-53",
  "NIST Privacy Framework", "SOC 2", "PCI-DSS", "GDPR", "HIPAA", "COBIT",
  "COSO ERM", "ITIL", "SWIFT CSP", "CIS Controls",
];

/* Lo dominicano y regional. Es donde de verdad se puede ganar: «GRC software»
   compite contra ServiceNow y Archer; «software cumplimiento SIMV» no. */
const REGION_ES = [
  "República Dominicana", "Latinoamérica", "SIMV", "Superintendencia de Bancos",
  "Banco Central de la República Dominicana", "NORTIC", "Ley 155-17",
  "Ley 172-13", "INDOTEL", "SIPEN", "IDECOOP",
];
const REGION_EN = [
  "Dominican Republic", "Latin America", "SIMV", "Dominican banking regulator",
  "NORTIC", "Law 155-17", "Law 172-13",
];

/* Los módulos, en las dos lenguas. El orden es el de la portada. */
const MODULOS_ES = [
  "gestión de riesgos", "cumplimiento normativo", "cumplimiento regulatorio",
  "auditoría interna", "control interno", "gobierno corporativo",
  "ciberseguridad", "privacidad y protección de datos", "continuidad del negocio",
  "gestión documental", "firma digital", "riesgo de terceros",
  "gestión de proveedores", "planes de acción", "matriz de riesgos",
  "gestión de procesos", "declaración jurada", "canal de denuncias",
  "gestión de contratos", "clasificación de la información", "gestión de accesos",
  "concienciación y formación", "encuestas GRC", "catálogo normativo",
];
const MODULOS_EN = [
  "risk management", "regulatory compliance", "compliance management",
  "internal audit", "internal control", "corporate governance",
  "cybersecurity", "privacy and data protection", "business continuity",
  "document management", "digital signature", "third party risk management",
  "vendor risk management", "action plans", "risk matrix",
  "process management", "conflict of interest disclosure", "whistleblowing channel",
  "contract management", "information classification", "access management",
  "security awareness training", "GRC surveys", "regulatory catalogue",
];

/* Cómo lo busca la gente. Las de categoría van primero a propósito: son las
   que definen de qué va esto para un buscador. */
const CATEGORIA_ES = [
  "software GRC", "plataforma GRC", "GRC", "gobierno riesgo y cumplimiento",
  "software de cumplimiento", "software de gestión de riesgos",
  "software de auditoría", "herramienta GRC", "sistema de gestión integrado",
  "SGSI", "sistemas de gestión ISO", "automatización del cumplimiento",
  "GRC en la nube", "software GRC multiempresa",
];
const CATEGORIA_EN = [
  "GRC software", "GRC platform", "GRC", "governance risk and compliance",
  "compliance software", "risk management software", "audit management software",
  "GRC tool", "integrated management system", "ISMS", "ISO management systems",
  "compliance automation", "cloud GRC", "multi-tenant GRC software",
];

const junta = (...listas) => [...new Set(listas.flat())];

/* Por página. La portada las lleva casi todas; las interiores, las suyas y
   poco más: repetir la misma lista en las siete es la forma más rápida de que
   ninguna destaque en nada. */
const PALABRAS = {
  index: {
    es: junta(CATEGORIA_ES, MODULOS_ES.slice(0, 14), NORMAS.slice(0, 12), REGION_ES.slice(0, 6)),
    en: junta(CATEGORIA_EN, MODULOS_EN.slice(0, 14), NORMAS.slice(0, 12), REGION_EN.slice(0, 5)),
  },
  marcos: {
    es: junta(NORMAS, REGION_ES, ["cobertura regulatoria", "marcos normativos",
      "catálogo de normas", "cumplimiento ISO", "mapeo de controles"]),
    en: junta(NORMAS, REGION_EN, ["regulatory coverage", "compliance frameworks",
      "standards catalogue", "ISO compliance", "control mapping"]),
  },
  confianza: {
    es: junta(["centro de confianza", "seguridad de la información", "cifrado",
      "aislamiento de datos", "multiempresa", "bitácora de auditoría",
      "residencia de datos", "protección de datos", "RGPD", "control de accesos",
      "autenticación de doble factor", "copias de seguridad"], NORMAS.slice(0, 8)),
    en: junta(["trust center", "information security", "encryption",
      "data isolation", "multi-tenant", "audit trail", "data residency",
      "data protection", "GDPR", "access control", "two-factor authentication",
      "backups"], NORMAS.slice(0, 8)),
  },
  precios: {
    es: junta(["precios software GRC", "planes", "coste por usuario",
      "prueba gratuita", "software GRC precio", "suscripción"], CATEGORIA_ES.slice(0, 6)),
    en: junta(["GRC software pricing", "plans", "price per user", "free trial",
      "GRC software cost", "subscription"], CATEGORIA_EN.slice(0, 6)),
  },
  contacto: {
    es: junta(["demostración GRC", "solicitar demo", "contacto", "implantación GRC",
      "asesoría en cumplimiento"], CATEGORIA_ES.slice(0, 4)),
    en: junta(["GRC demo", "request a demo", "contact", "GRC implementation",
      "compliance consulting"], CATEGORIA_EN.slice(0, 4)),
  },
  partners: {
    es: ["partners GRC", "programa de partners", "canal de distribución",
      "revendedor software GRC", "consultoras de cumplimiento"],
    en: ["GRC partners", "partner programme", "reseller channel",
      "GRC software reseller", "compliance consultancies"],
  },
  legal: {
    es: ["términos del servicio", "política de privacidad", "política de cookies",
      "condiciones de uso", "tratamiento de datos"],
    en: ["terms of service", "privacy policy", "cookie policy",
      "terms of use", "data processing"],
  },
};
/* La oscura es la misma portada con otra piel. */
PALABRAS.oscuro = PALABRAS.index;

module.exports = {
  PALABRAS, NORMAS, MODULOS_ES, MODULOS_EN,
  CATEGORIA_ES, CATEGORIA_EN, REGION_ES, REGION_EN,
};
