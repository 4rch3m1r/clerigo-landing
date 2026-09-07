/**
 * EL TEXTO DE LAS SECCIONES DEL AGENTE Y DE LA ARQUITECTURA.
 *
 * Separado del marcado a propósito: el texto lo escribe y lo revisa una
 * persona, el marcado no se toca casi nunca. Mezclados, cambiar una coma
 * obliga a leer doscientas líneas de HTML.
 *
 * ── LA MARCA SE ESCRIBE «Clèrigo», CON ACENTO GRAVE ───────────────────────
 *
 * Como el logotipo. «Clérigo» con agudo es el sustantivo común castellano, no
 * la marca; estaba escrito así en 190 sitios y se corrigió. El texto de
 * partida venía con el agudo y aquí va con el grave.
 *
 * ── LOS DOS IDIOMAS ───────────────────────────────────────────────────────
 *
 * El castellano es la fuente y vive en `es/`; el inglés ocupa la raíz. Las dos
 * versiones tienen que decir LO MISMO y tener la MISMA forma: de eso vive la
 * garantía bilingüe —quitando el texto, las dos páginas son el mismo fichero—.
 * Por eso las dos listas de aquí abajo son gemelas, elemento a elemento.
 */

const ES = {
  /* ── El agente ──────────────────────────────────────────────────────── */
  agente: {
    chip: "El Agente de Cumplimiento",
    titulo: "Un agente que entiende tu organización<br>y actúa sobre ella.",
    entrada: "Clèrigo incorpora un <strong>Agente de Cumplimiento con IA</strong> diseñado para trabajar junto a los equipos de Riesgos, Cumplimiento, Auditoría, Ciberseguridad, Control Interno y Tecnología.",
    negacion: "No se limita a responder preguntas.",
    /* Los cinco verbos son la idea entera de la sección: el sistema deja de
       registrar lo que hacen las personas y pasa a hacer parte del trabajo. */
    verbos: ["Analiza", "Decide", "Ejecuta", "Documenta", "Da seguimiento"],
    capacidades: "A partir de la evidencia disponible, el agente puede evaluar el nivel de cumplimiento, identificar brechas, proponer controles y planes de acción, asignar responsables, generar documentación, coordinar reuniones, elaborar minutas, gestionar aprobaciones y firmas, emitir alertas y generar informes ejecutivos.",
    cierre: "Todo dentro de un entorno Enterprise, con trazabilidad y control sobre cada acción.",
  },

  /* ── Las tres formas de trabajar ────────────────────────────────────── */
  modos: {
    chip: "Cómo se trabaja con Clèrigo",
    titulo: "Tres formas de trabajar.<br>Una sola plataforma.",
    tarjetas: [
      {
        num: "01", nombre: "Agente", lema: "Clèrigo trabaja por ti.",
        texto: "Automatiza tareas de cumplimiento de extremo a extremo: analiza evidencia, detecta brechas, propone controles, crea planes de acción, asigna responsables, genera documentación, coordina actividades y mantiene el seguimiento hasta el cierre.",
      },
      {
        num: "02", nombre: "Asistido", lema: "Clèrigo trabaja contigo.",
        texto: "El profesional mantiene el control mientras la IA se encarga de acelerar el trabajo. Desde el chat puedes registrar activos, evaluar riesgos, crear tareas, preparar informes, gestionar documentos, programar reuniones o solicitar análisis especializados.",
      },
      {
        num: "03", nombre: "Inteligencia", lema: "Clèrigo te ayuda a decidir.",
        texto: "Consulta, analiza y relaciona la información de tu organización para obtener una visión contextual del riesgo, cumplimiento, controles, auditorías y obligaciones regulatorias.",
      },
    ],
    /* La frase que sostiene todo lo anterior. Va sola y en grande porque es la
       objeción que trae de casa quien lee esto: «esto viene a sustituirme». */
    sentencia: ["Clèrigo no reemplaza al profesional.", "Le da la capacidad de operar a escala."],
  },

  /* ── La arquitectura de producto ────────────────────────────────────── */
  arquitectura: {
    chip: "La arquitectura de producto",
    titulo: "Cinco dominios.<br>Un solo entorno.",
    subtitulo: "Los módulos no se enumeran: se agrupan por lo que resuelven. Cada dominio comparte datos y contexto con los demás, y el agente trabaja sobre todos a la vez.",
    grupos: [
      { nombre: "GRC", partes: ["Riesgos", "Controles", "Auditoría", "Cumplimiento", "Control Interno", "Gobierno"] },
      { nombre: "Cyber &amp; Technology", partes: ["Ciberseguridad", "Activos", "Vulnerabilidades", "Tecnología", "Continuidad", "SLA"] },
      { nombre: "Operations", partes: ["Procesos", "Tareas", "Proyectos", "Reuniones", "Encuestas", "Planes de acción"] },
      { nombre: "Trust &amp; Governance", partes: ["Firma Digital", "Gestor Documental", "Credenciales", "Evidencias", "Reportes"] },
      { nombre: "AI", partes: ["Read AI", "Agente de Cumplimiento", "Análisis de Riesgos", "Inteligencia Regulatoria", "Generación de Informes"] },
    ],
    cierre: ["Una plataforma. Una fuente de verdad.", "Un agente que convierte la gestión en ejecución."],
  },
};

const EN = {
  agente: {
    chip: "The Compliance Agent",
    titulo: "An agent that understands your organisation<br>and acts on it.",
    entrada: "Clèrigo ships with an <strong>AI Compliance Agent</strong> built to work alongside Risk, Compliance, Audit, Cybersecurity, Internal Control and Technology teams.",
    negacion: "It does not just answer questions.",
    verbos: ["Analyses", "Decides", "Executes", "Documents", "Follows through"],
    capacidades: "From the evidence available, the agent can assess the level of compliance, identify gaps, propose controls and action plans, assign owners, generate documentation, coordinate meetings, draft minutes, handle approvals and signatures, raise alerts and produce executive reports.",
    cierre: "All inside an enterprise environment, with traceability and control over every action.",
  },

  modos: {
    chip: "How you work with Clèrigo",
    titulo: "Three ways of working.<br>One single platform.",
    tarjetas: [
      {
        num: "01", nombre: "Agent", lema: "Clèrigo works for you.",
        texto: "It automates compliance work end to end: analyses evidence, detects gaps, proposes controls, creates action plans, assigns owners, generates documentation, coordinates activities and keeps the follow-up going until closure.",
      },
      {
        num: "02", nombre: "Assisted", lema: "Clèrigo works with you.",
        texto: "The professional stays in control while the AI does the accelerating. From the chat you can register assets, assess risks, create tasks, prepare reports, manage documents, schedule meetings or request specialised analysis.",
      },
      {
        num: "03", nombre: "Intelligence", lema: "Clèrigo helps you decide.",
        texto: "It queries, analyses and connects your organisation's information to give you a contextual view of risk, compliance, controls, audits and regulatory obligations.",
      },
    ],
    sentencia: ["Clèrigo does not replace the professional.", "It gives them the capacity to operate at scale."],
  },

  arquitectura: {
    chip: "The product architecture",
    titulo: "Five domains.<br>One single environment.",
    subtitulo: "The modules are not listed one by one: they are grouped by what they solve. Each domain shares data and context with the rest, and the agent works across all of them at once.",
    grupos: [
      { nombre: "GRC", partes: ["Risk", "Controls", "Audit", "Compliance", "Internal Control", "Governance"] },
      { nombre: "Cyber &amp; Technology", partes: ["Cybersecurity", "Assets", "Vulnerabilities", "Technology", "Continuity", "SLA"] },
      { nombre: "Operations", partes: ["Processes", "Tasks", "Projects", "Meetings", "Surveys", "Action plans"] },
      { nombre: "Trust &amp; Governance", partes: ["Digital Signature", "Document Manager", "Credentials", "Evidence", "Reports"] },
      { nombre: "AI", partes: ["Read AI", "Compliance Agent", "Risk Analysis", "Regulatory Intelligence", "Report Generation"] },
    ],
    cierre: ["One platform. One source of truth.", "An agent that turns management into execution."],
  },
};

/* Las dos versiones tienen que tener la MISMA forma, o la garantía bilingüe
   —quitando el texto, son el mismo fichero— deja de poder comprobarse. Esto no
   es una comprobación de estilo: es la que impide que una traducción se coma
   una tarjeta o un grupo sin que nadie lo note. */
function mismaForma(a, b, donde = "") {
  if (Array.isArray(a) !== Array.isArray(b)) throw new Error(`${donde}: uno es lista y el otro no`);
  if (Array.isArray(a)) {
    if (a.length !== b.length) throw new Error(`${donde}: ${a.length} contra ${b.length} elementos`);
    a.forEach((x, i) => mismaForma(x, b[i], `${donde}[${i}]`));
    return;
  }
  if (typeof a === "object" && a !== null) {
    const ka = Object.keys(a).sort().join(","), kb = Object.keys(b).sort().join(",");
    if (ka !== kb) throw new Error(`${donde}: claves distintas — «${ka}» contra «${kb}»`);
    for (const k of Object.keys(a)) mismaForma(a[k], b[k], `${donde}.${k}`);
  }
}
mismaForma(ES, EN, "raíz");

module.exports = { ES, EN };
