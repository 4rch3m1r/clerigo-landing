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

## De dónde sale

El origen vive en el repositorio del producto, en `app-saas/landing/`, junto a
los guiones que generaron estos ficheros a partir del original. Si se toca algo
aquí, conviene llevarlo también allí para que las dos copias no se separen.
