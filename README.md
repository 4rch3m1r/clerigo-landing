# Página de presentación de Clèrigo

```
index.html      la portada, en claro — la principal
oscuro.html     la misma portada, en oscuro

legal.html      Términos, Privacidad y Cookies
precios.html    Planes y precios
marcos.html     Cobertura regulatoria
contacto.html   Contacto
partners.html   Portal de Partners (pantalla de acceso)

favicon.png     el icono y el logotipo, 160 × 160
og*.png         las seis tarjetas de vista previa, 1200 × 630
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

## Las cinco páginas interiores

Vienen de otros cinco HTML de Archemir y se han **vestido**, no rediseñado: la
misma composición, las mismas secciones y —esto es lo importante— **las mismas
palabras**. Lo que cambia es la piel: color, letra, radios, y la barra y el pie,
que ahora son los de la portada.

La portada ya las enlazaba: sus botones apuntaban a `clerigo.io/marcos`,
`/legal`, `/precios`, `/prospectos` y `portal.clerigo.io`. Ahora esos mismos
enlaces —los mismos, ni uno más— llevan al fichero de al lado.

| Página | Se llega desde |
|---|---|
| `marcos.html` | 6 enlaces de la portada |
| `legal.html` | 5 |
| `precios.html` | 3 |
| `contacto.html` | 3 |
| `partners.html` | 1 |

**De Archemir no queda nada.** Ni el nombre, ni el dominio, ni un buzón. Los
correos son los que usaría cualquier grande, en inglés: `hello@clerigo.io`,
`legal@clerigo.io` y `privacy@clerigo.io`. La tabla completa, con el motivo de
cada cambio, está en `fuente/paginas/marca.json`.

**Los Términos ahora dicen Clèrigo.** Donde ponía «Archemir Group, S.R.L.»
—quien opera el servicio, quien responde del tratamiento de datos y el titular
del copyright— ahora pone «Clèrigo», sin forma societaria, porque no se inventa
una sociedad que no existe. La jurisdicción se queda como estaba y es coherente:
República Dominicana, Ley 172-13, Ley 20-00, INDOTEL, domicilio en Santo
Domingo.

`partners.html` es la única distinta: es una pantalla de acceso a página
completa y no lleva barra ni pie. Su panel de marca se queda en oscuro a
propósito, como el acceso de la aplicación, y va rotulado como tal para que el
validador no lo confunda con un descuido.

## La tarjeta que sale al pegar el enlace

Las páginas declaraban `og:image` apuntando a `clerigo.io/og.png` desde el
principio, y **ese fichero no existía**: el servidor contesta a cualquier ruta
con el HTML de la portada, así que el rastreador pedía una imagen y recibía una
página. La tarjeta salía sin foto en todas partes y en WhatsApp muchas veces no
salía tarjeta.

Ahora hay seis, una por página, de 1200 × 630 y menos de 80 KB, dibujadas por
`fuente/hacer-og.ps1`. Y las etiquetas están completas: medidas y tipo
declarados —sin ellos WhatsApp descarta la imagen—, texto alternativo, tarjeta
grande de X, `theme-color` y una ficha de datos estructurados para Google y
LinkedIn. Todo dentro del primer kilobyte, que es lo que llega a leer el
rastreador de WhatsApp.

El validador no se cree la etiqueta: abre el PNG, mira sus medidas en la
cabecera del fichero y comprueba lo que pesa.

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
- La maqueta del «Centro de Comando» está dibujada con CSS: no es el sistema.

**Los sellos de certificación ya se quitaron**, y son lo único que se le ha
quitado al original. El panel se titulaba «Nuestras Certificaciones» y traía
ISO 27001, ISO 22301 y SOC 2 Type II con la palabra «Certified» dentro del
dibujo. Son marcos que la plataforma **cubre**, no certificaciones que Clèrigo
**tenga**, y la página está abierta a cualquiera. Los nombres siguen en la
lista de marcos compatibles, que es donde están bien dichos.

Revisar una por una antes de que esto lo vea un cliente.

**Y tres cosas que la página ya anuncia y todavía no existen:**

- Los buzones `hello@`, `legal@` y `privacy@` de clerigo.io. Están en Contacto y
  en los dos documentos legales. Hasta que se den de alta, quien escriba a
  cualquiera de ellos no llega a nadie.
- El LinkedIn `linkedin.com/company/clerigo`.
- Los Términos no nombran ninguna sociedad. Cuando haya una constituida, su
  nombre completo entra en `fuente/paginas/marca.json` y se rehacen las cinco.

**Y lo que hay publicado en clerigo.io no es esto.** El dominio sirve una copia
anterior de la portada —con los sellos de certificación todavía puestos— y
contesta a CUALQUIER ruta con esa misma página: `/legal`, `/precios` y hasta
`/og.png` devuelven el HTML de la portada. Mientras eso siga así, las cinco
páginas nuevas no se ven y la tarjeta de vista previa no tiene imagen. Hay que
volver a subir el sitio entero.

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
# la portada
node fuente/rebrandear.cjs     # el original  ->  oscuro.html + favicon.png
node fuente/a-modo-claro.cjs   # oscuro.html  ->  index.html
node fuente/validar.cjs        # comprueba que todo cuadra
node fuente/mutar.cjs          # rompe el validador a propósito, once veces

# las cinco páginas interiores
node fuente/paginas/sincronizar.cjs   # les vuelve a pasar la plantilla común
node fuente/paginas/validar.cjs       # 122 comprobaciones
node fuente/paginas/mutar.cjs marcos  # rompe la guarda a propósito, quince veces

# las tarjetas de vista previa (Windows: usa System.Drawing)
powershell -ExecutionPolicy Bypass -File fuente/hacer-og.ps1
```

Las cinco páginas **no se editan a mano en lo que es común**. Cabecera, tokens,
hoja de estilo, barra y pie salen de `fuente/paginas/plantilla.html`: se cambia
ahí, se corre `sincronizar.cjs` y las cinco quedan iguales otra vez. Lo propio
de cada página —su CSS, su cuerpo y su guion— sí vive en su fichero.

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
| `hacer-og.ps1` | dibuja las seis tarjetas de vista previa |
| `paginas-originales/` | los cinco originales de Archemir. **No versionados** |
| `paginas/plantilla.html` | la línea gráfica común de las cinco |
| `paginas/marca.json` | qué palabra de marca cambia por cuál, y por qué |
| `paginas/palabras.cjs` | de un HTML a la lista de palabras que ve una persona |
| `paginas/sincronizar.cjs` | vuelve a pasar la plantilla por las cinco |
| `paginas/validar.cjs` | las 122 comprobaciones de las cinco |
| `paginas/mutar.cjs` | las rompe de quince maneras para ver si la guarda mira |

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
