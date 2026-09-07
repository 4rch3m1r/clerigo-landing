/**
 * CÓMO SE DIBUJAN LAS SECCIONES DEL AGENTE Y DE LA ARQUITECTURA.
 * El texto está en `contenido.cjs`.
 *
 * ── SE REUSA LO QUE YA HAY ────────────────────────────────────────────────
 *
 * `label-chip`, `section-title-center`, `section-subtitle` y las clases
 * `reveal` son del propio sitio y hacen exactamente lo que hace falta. El CSS
 * nuevo se limita a lo que no existía: la fila de verbos, las tres tarjetas de
 * modo, la sentencia y la rejilla de dominios.
 *
 * Los colores salen de las variables del sitio —`--red`, `--text`, `--text-2`,
 * `--border`, `--dark-2`—. Ninguno se escribe suelto: si el landing cambia de
 * rojo, esto cambia con él.
 *
 * ── LAS MARCAS DE CORTE ───────────────────────────────────────────────────
 *
 * Todo lo que se inserta va entre comentarios que lo delimitan. Sin ellos, el
 * aplicador tendría que adivinar dónde empieza y dónde acaba lo suyo, y correr
 * dos veces dejaría dos copias. Con ellos, se reemplaza siempre lo mismo y
 * pasar el guion veinte veces da el mismo fichero.
 */

/* ── LAS MARCAS DE LA HOJA VAN EN COMENTARIO DE CSS, NO DE HTML ───────────
 *
 * Y no es una cuestión de gusto. Dentro de un `<style>`, `<!--` y `-->` no
 * delimitan un comentario para el analizador de CSS: son dos fichas que se
 * ignoran, pero LO QUE VA EN MEDIO se lee como si fuera un selector. Con la
 * marca en HTML, «══ ESTILO DE AGENTE ══ --> .ag-cuerpo { … }» se convertía en
 * una sola regla inválida y el navegador se comía la PRIMERA regla del bloque.
 *
 * El síntoma era muy fácil de leer mal: todo el estilo funcionaba menos una
 * regla, justo la que centraba el texto. Medido: `.ag-cuerpo` salía con
 * `max-width: none` mientras `.ag-capacidades`, tres reglas más abajo, sí
 * tenía su `780px`.
 */
const M = {
  css: ["/* ══ ESTILO DE AGENTE Y ARQUITECTURA ══ */", "/* ══ FIN DEL ESTILO DE AGENTE Y ARQUITECTURA ══ */"],
  secciones: ["<!-- ══ AGENTE Y MODOS ══ -->", "<!-- ══ FIN DE AGENTE Y MODOS ══ -->"],
  dominios: ["<!-- ══ DOMINIOS ══ -->", "<!-- ══ FIN DE DOMINIOS ══ -->"],
};

/* ── El estilo ───────────────────────────────────────────────────────────
   Va dentro del <style> que la página ya tiene, no en una etiqueta nueva: una
   segunda hoja obligaría a pensar en cuál gana. */
const CSS = `
/* ── EL AGENTE ── */
.ag-cuerpo { max-width: 860px; margin: 0 auto; text-align: center; }
.ag-entrada { font-size: 20px; line-height: 1.6; color: var(--text-2); margin-bottom: 44px; }
.ag-entrada strong { color: var(--text); font-weight: 700; }
/* «No se limita a responder preguntas» va sola y en grande: es el giro de la
   sección, y metida dentro de un párrafo se pierde. */
.ag-negacion {
  font-size: 27px; font-weight: 300; color: var(--text-3);
  letter-spacing: -0.4px; margin-bottom: 22px;
}
.ag-verbos {
  display: flex; flex-wrap: wrap; justify-content: center; align-items: center;
  gap: 0; margin-bottom: 46px;
}
.ag-verbo {
  font-size: 26px; font-weight: 900; color: var(--text);
  letter-spacing: -0.8px; padding: 0 20px; position: relative;
}
.ag-verbo + .ag-verbo::before {
  content: ""; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  width: 5px; height: 5px; border-radius: 50%; background: var(--red);
}
.ag-capacidades {
  font-size: 17px; line-height: 1.75; color: var(--text-2);
  max-width: 780px; margin: 0 auto 34px;
}
.ag-cierre {
  display: inline-block; font-size: 15px; font-weight: 600; color: var(--text);
  border: 1px solid var(--border); border-radius: 999px; padding: 12px 24px;
  background: var(--dark-2);
}

/* ── LAS TRES FORMAS DE TRABAJAR ── */
.modos-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px;
  margin-top: 52px;
}
.modo-card {
  border: 1px solid var(--border); border-radius: 14px;
  padding: 32px 28px 30px; background: var(--dark);
  display: flex; flex-direction: column;
}
.modo-num {
  font-family: 'Source Code Pro', monospace; font-size: 12px; font-weight: 600;
  letter-spacing: 1.6px; color: var(--text-3); margin-bottom: 18px;
}
.modo-num b { color: var(--red); font-weight: 600; }
.modo-nombre { font-size: 25px; font-weight: 900; letter-spacing: -0.6px; margin-bottom: 6px; }
.modo-lema { font-size: 17px; font-weight: 700; color: var(--red-ink); margin-bottom: 16px; }
.modo-texto { font-size: 15px; line-height: 1.65; color: var(--text-2); }

/* La sentencia. Es la objeción que trae de casa quien lee esto —«esto viene a
   sustituirme»— así que se contesta sola, en grande y sin nada alrededor. */
.modos-sentencia {
  margin-top: 56px; text-align: center;
  font-size: 32px; font-weight: 900; line-height: 1.28; letter-spacing: -1px;
}
.modos-sentencia .segunda { color: var(--red); }

/* ── LOS CINCO DOMINIOS ── */
.dominios-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.dominio {
  border: 1px solid var(--border); border-radius: 14px;
  padding: 26px 26px 24px; background: var(--dark);
}
.dominio-nombre {
  font-size: 19px; font-weight: 900; letter-spacing: -0.4px; margin-bottom: 16px;
  padding-bottom: 14px; border-bottom: 1px solid var(--border);
}
.dominio-partes { display: flex; flex-wrap: wrap; gap: 8px; }
.dominio-parte {
  font-size: 13px; font-weight: 600; color: var(--text-2);
  background: var(--dark-2); border: 1px solid var(--border);
  border-radius: 999px; padding: 6px 12px;
}
/* El dominio de IA se marca y ocupa dos columnas: es el que explica por qué
   esto no es otro GRC con un chat encima. Y de paso cierra la rejilla — cinco
   cajas en tres columnas dejaban un hueco en la segunda fila. */
.dominio.es-ia { border-color: var(--red); grid-column: span 2; }
.dominio.es-ia .dominio-partes { gap: 8px 10px; }
.dominio.es-ia .dominio-nombre { color: var(--red); border-bottom-color: var(--red-dim); }
.dominio.es-ia .dominio-parte { background: var(--red-dim); border-color: transparent; color: var(--red-ink); }

.dominios-cierre {
  margin-top: 46px; text-align: center;
  font-size: 24px; font-weight: 700; line-height: 1.4; letter-spacing: -0.6px;
  color: var(--text);
}
.dominios-cierre .segunda { color: var(--text-3); font-weight: 400; }

@media (max-width: 900px) {
  .modos-grid, .dominios-grid { grid-template-columns: 1fr; }
  /* En una sola columna, «ocupar dos» no significa nada y rompe la rejilla. */
  .dominio.es-ia { grid-column: auto; }
  .ag-verbo { font-size: 20px; padding: 0 13px; }
  .ag-negacion { font-size: 21px; }
  .modos-sentencia { font-size: 24px; }
  .dominios-cierre { font-size: 19px; }
}
`;

/* ── Las dos secciones nuevas ─────────────────────────────────────────── */
function seccionesNuevas(t) {
  const a = t.agente, m = t.modos;
  return `
<section id="agente">
  <div class="container">
    <div class="solution-header">
      <div class="label-chip reveal">${a.chip}</div>
      <h2 class="section-title-center reveal reveal-2">${a.titulo}</h2>
    </div>
    <div class="ag-cuerpo">
      <p class="ag-entrada reveal reveal-3">${a.entrada}</p>
      <div class="ag-negacion reveal reveal-3">${a.negacion}</div>
      <div class="ag-verbos reveal reveal-4">
${a.verbos.map((v) => `        <span class="ag-verbo">${v}</span>`).join("\n")}
      </div>
      <p class="ag-capacidades reveal reveal-4">${a.capacidades}</p>
      <div class="reveal reveal-4"><span class="ag-cierre">${a.cierre}</span></div>
    </div>
  </div>
</section>

<section id="modos">
  <div class="container">
    <div class="solution-header">
      <div class="label-chip reveal">${m.chip}</div>
      <h2 class="section-title-center reveal reveal-2">${m.titulo}</h2>
    </div>
    <div class="modos-grid">
${m.tarjetas.map((c) => `      <div class="modo-card reveal">
        <div class="modo-num"><b>${c.num}</b></div>
        <div class="modo-nombre">${c.nombre}</div>
        <div class="modo-lema">${c.lema}</div>
        <div class="modo-texto">${c.texto}</div>
      </div>`).join("\n")}
    </div>
    <div class="modos-sentencia reveal reveal-3">
      ${m.sentencia[0]}<br><span class="segunda">${m.sentencia[1]}</span>
    </div>
  </div>
</section>
`;
}

/* ── Los cinco dominios, que sustituyen a la rejilla de quince módulos ── */
function dominios(t) {
  const q = t.arquitectura;
  return `<div class="dominios-grid">
${q.grupos.map((g) => `      <div class="dominio${g.nombre === "AI" ? " es-ia" : ""} reveal">
        <div class="dominio-nombre">${g.nombre}</div>
        <div class="dominio-partes">
${g.partes.map((p) => `          <span class="dominio-parte">${p}</span>`).join("\n")}
        </div>
      </div>`).join("\n")}
    </div>
    <div class="dominios-cierre reveal reveal-2">
      ${q.cierre[0]}<br><span class="segunda">${q.cierre[1]}</span>
    </div>`;
}

module.exports = { M, CSS, seccionesNuevas, dominios };
