# Página de presentación de Clèrigo

```
index.html     la versión clara — la principal
oscuro.html    la misma página, en oscuro
favicon.png    el icono, 160 × 160
```

Se abren con doble clic: el logotipo va incrustado en el propio HTML y sólo se
traen las tipografías de Google. No hay build, ni dependencias, ni nada que
instalar. Para publicarlas, `favicon.png` tiene que estar en la misma carpeta.

---

## Qué es esto

Una **adaptación** del landing de Archemir, que ya estaba aprobado, cambiando
marca, dominio y logotipo. No es un diseño nuevo, y ésa fue la instrucción:
«no lo mejores, no lo rediseñes, no lo reinventes».

Lo que se cambió:

| | |
|---|---|
| Marca | «GRC Intelligence» y «Axioma GRC» → **Clèrigo**, 13 sitios |
| Dominio | `archemir.com` → `clerigo.io`, 21 enlaces |
| Acceso | el botón «login» → `app.clerigo.io` |
| Logotipo | el cuadro rojo con las letras «GRC» → la marca de Clèrigo, en sus tres tamaños y sin mover la caja |
| Metadatos | title, description, canonical, Open Graph y Twitter — no existía ninguno |
| Pictogramas | trofeo, estrellas y flechas: de glifo de fuente a SVG |
| Teléfono | tres consultas de medios nuevas |
| Barra y pie | en oscuro también en la versión clara |

Todo lo demás —secciones, orden, textos, animaciones, espaciados— está intacto.
La comprobación que lo sostiene: quitando marca, dominio, logotipo y color, los
dos ficheros y el original son la misma página, línea por línea.

La marca se escribe **Clèrigo**, con acento grave, como en el producto.

## Lo que se arregló del original

No se podía usar en un teléfono. La barra pedía 409 px y el cuerpo lleva
`overflow-x` oculto, así que lo que sobraba no se arrastraba: se cortaba. El
botón de «Contacto» salía partido en casi todos los móviles.

| Ancho | Se salía |
|---|---|
| 375 px | 10 px |
| 360 px | 25 px |
| 320 px | 64 px |

Corregido con las reglas que la propia página ya usa, en un bloque al final de
la hoja rotulado `AJUSTES DE TELÉFONO`. Sin desbordamiento de 320 px en
adelante.

## ANTES DE PUBLICARLA: lo que no está verificado

Esto es lo más importante de este documento.

**Las cifras, los premios y los testimonios vienen del original y nadie los ha
comprobado contra el producto:**

- «90% de reducción de trabajo manual», «48 horas de implementación»,
  «15+ marcos», «12 módulos».
- Los dos premios: WE2SEC 2026 e IPEXPERT 2025.
- Los tres testimonios, con nombre, cargo y empresa.
- **Los sellos de certificación.** Dicen «Certified» sobre ISO 27001 y
  SOC 2 Type II. Son marcos que la plataforma **cubre**, no certificaciones que
  Clèrigo **tenga**. Publicar eso sin respaldo es el riesgo más serio de la
  página, y más en un producto de cumplimiento.
- La maqueta del «Centro de Comando» está dibujada con CSS: no es el sistema.

Revisar una por una antes de que esto lo vea un cliente.

## Cómo publicarla

Son ficheros estáticos, valen en cualquier hosting.

**Con GitHub Pages:** en Settings → Pages, rama `main`, carpeta `/ (root)`.
El repositorio tiene que ser público, o hacer falta un plan de pago.

**Con hosting propio:** subir los tres ficheros por FTP a la raíz del sitio y
apuntar el dominio ahí.

## Cómo se rehace

Los tres ficheros de arriba **están generados**. No se editan a mano: se
regeneran desde el original de Archemir con los guiones de `fuente/`.

```bash
node fuente/rebrandear.cjs     # el original  ->  oscuro.html + favicon.png
node fuente/a-modo-claro.cjs   # oscuro.html  ->  index.html
node fuente/validar.cjs        # comprueba que todo cuadra
node fuente/mutar.cjs          # rompe el validador a propósito, once veces
```

No hacen falta dependencias: sólo Node.

**El original no está aquí.** `fuente/archemir-original.html` es el landing de
Archemir con su marca y sus textos, y este repositorio es público: se queda
fuera a propósito. Para regenerar la página hay que ponerlo a mano en
`fuente/`. Los guiones avisan si falta. Los ficheros ya generados —`index.html`
y `oscuro.html`— están en el repositorio y no dependen de él.

| En `fuente/` | |
|---|---|
| `archemir-original.html` | el landing aprobado, sin tocar. La fuente de todo. **No versionado** |
| `logo.png` | la marca de Clèrigo, 160 × 160 |
| `rebrandear.cjs` | marca, dominio, logotipo, metadatos, los SVG y los ajustes de teléfono |
| `cambios-de-color.json` | los 264 cambios de color de la versión clara, uno a uno |
| `a-modo-claro.cjs` | los aplica sobre la versión oscura |
| `tema.cjs` | lo que comparten el aplicador y el validador |
| `validar.cjs` | las comprobaciones |
| `mutar.cjs` | rompe el validador a propósito, para ver si de verdad mira |

**Por qué se puede confiar en esto.** `validar.cjs` no dice «parece bien»:
quita marca, dominio, logotipo y color de los tres ficheros y exige que salgan
idénticos línea por línea. Si alguien cambia un tamaño, un texto o una clase,
falla. Y `mutar.cjs` lo rompe de once maneras —tocar un relleno, quitar una
sección, dejar texto casi blanco, colar una flecha de texto— para comprobar que
el validador las ve todas. Una guarda que no se ha roto nunca no sirve de nada.

Comprobado: borrando los tres ficheros y regenerándolos, salen **byte a byte
idénticos**.

Cada guion explica por dentro por qué hace lo que hace, incluidas las trampas
que ya mordieron: los finales de línea de Windows, la regla base que gana a una
consulta de medios por estar escrita más abajo, y el estilo en línea que gana a
la hoja entera.

## Este repositorio es el único dueño

Estuvo un tiempo también en el repositorio del producto, en `app-saas/landing/`.
Se quitó de allí: dos copias del mismo fichero se separan solas, y esto es HTML
estático que no importa nadie ni toca ninguna prueba. Si hay que cambiar algo,
se cambia aquí y sólo aquí.
