# Guía de Arquitectura de Link Preview, Open Graph y SEO para Clérigo.io

Esta guía documenta la infraestructura profesional de **Link Preview (Rich Previews)**, **Open Graph Protocol**, **Twitter/X Cards**, **Schema.org (JSON-LD)** y **SEO On-Page** implementada en `https://clerigo.io/`.

---

## 1. Visión General del Sistema

Cuando un usuario comparte cualquier enlace de Clérigo (`https://clerigo.io/`, `/es/`, `/marcos.html`, etc.) en **WhatsApp, LinkedIn, X/Twitter, Facebook, Slack, Microsoft Teams, Telegram o iMessage**, la plataforma genera automáticamente una tarjeta enriquecida enterprise con:

- **Imagen HD Optimizada:** 1200 × 630 px con branding oficial, logo nítido, headline, badges de cumplimiento y estética dark `#0E0E0E`.
- **Título Profesional:** Jerárquico y contextualizado por página e idioma.
- **Descripción Atractiva:** Resumen conciso de la propuesta de valor de Gobernanza, Riesgo y Cumplimiento con IA.
- **Dominio Canónico:** `clerigo.io` con SSL y rutas canónicas absolutas.
- **Microdatos Semánticos:** Grafo Schema.org con entidades `Organization`, `WebSite`, `SoftwareApplication`, `WebPage` y `BreadcrumbList`.

---

## 2. Estructura de Archivos

```
clerigo-landing/
├── seo.config.js                 # 🌟 Fuente única de verdad de metadatos y rutas
├── seo.config.json               # Versión JSON consumible por herramientas y CI/CD
├── robots.txt                    # Permisos explícitos para rastreadores sociales
├── sitemap.xml                   # Mapa del sitio oficial referenciando https://clerigo.io/
├── link-preview-test.html        # 🧪 Simulador interactivo en tiempo real
├── es/link-preview-test.html     # Simulador en directorio español
├── public/og/                    # 🖼️ Directorio público de imágenes OG (1200x630)
│   ├── clerigo-og.png            # Imagen principal (Portada)
│   ├── marcos-og.png             # Marcos y estándares regulatorios
│   ├── precios-og.png            # Planes y modelos de inversión
│   ├── confianza-og.png          # Centro de confianza y seguridad
│   ├── contacto-og.png           # Contacto y solicitud de demo
│   ├── partners-og.png           # Programa de partners
│   ├── legal-og.png              # Términos y privacidad
│   ├── security-og.png           # Seguridad Enterprise
│   ├── compliance-og.png         # Cumplimiento Continuo
│   └── platform-og.png           # Arquitectura de plataforma
├── scripts/
│   ├── generate-og-images.ps1    # Script para generar las imágenes OG en HD
│   └── build-seo.js              # Script Node.js para inyectar metadatos en los HTML
```

---

## 3. Cómo Modificar Metadatos o Añadir Nuevas Páginas

### 3.1. Editar Metadatos Existentes
Abre `seo.config.js` y localiza la clave de la página (por ejemplo `es/index.html` o `es/marcos.html`):

```javascript
"es/marcos.html": {
  canonicalPath: "es/marcos.html",
  lang: "es",
  locale: "es_ES",
  title: "Marcos Regulatorios Soportados | Clérigo GRC",
  description: "23+ marcos normativos integrados: ISO 27001, SOC 2, HIPAA, GDPR...",
  ogImage: "https://clerigo.io/public/og/marcos-og.png",
  ogImageAlt: "Marcos Regulatorios - Clérigo GRC"
}
```

### 3.2. Añadir una Nueva Ruta (ejemplo `/features` o `/seguridad`)
Agrega la nueva entrada al objeto `ROUTES` en `seo.config.js`:

```javascript
"seguridad.html": {
  canonicalPath: "seguridad.html",
  lang: "es",
  locale: "es_ES",
  title: "Seguridad y Cifrado Enterprise | Clérigo GRC",
  description: "Aislamiento de datos, cifrado AES-256 y arquitectura Zero Trust.",
  ogImage: "https://clerigo.io/public/og/security-og.png",
  ogImageAlt: "Seguridad Clérigo GRC"
}
```

### 3.3. Aplicar los Cambios a Todos los Archivos HTML
Ejecuta el sincronizador:

```bash
node scripts/build-seo.js
```

El script actualizará automáticamente el bloque `<head>` de todas las páginas con etiquetas Open Graph, Twitter Cards y JSON-LD limpias y sin duplicados.

---

## 4. Cómo Regenerar las Imágenes Open Graph

Si modificas el diseño, tipografías, colores o badges de las tarjetas de vista previa, ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/generate-og-images.ps1
```

Esto generará automáticamente todas las imágenes en 1200×630 px en `/public/og/`, `/og/` y la raíz del proyecto.

---

## 5. Simulador Interactivo de Link Preview

Puedes probar y previsualizar cómo se ven las tarjetas en tiempo real abriendo localmente:
- `link-preview-test.html` o `es/link-preview-test.html`

El simulador incluye maquetas interactivas con renderizado idéntico al de:
1. **WhatsApp** (Burbuja de chat con tarjeta)
2. **LinkedIn** (Publicación de feed)
3. **X / Twitter** (`summary_large_image`)
4. **Slack** (Despliegue de mensaje con barra roja de marca)
5. **Microsoft Teams** (Tarjeta adaptativa)

---

## 6. Depuración y Purga de Caché en Redes Sociales

Cuando publiques una actualización en producción, las plataformas pueden tener la vista previa anterior guardada en caché. Utiliza estas herramientas oficiales para forzar la actualización:

1. **Facebook / WhatsApp / Instagram:**
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - Pega `https://clerigo.io/` y haz clic en **"Scrape Again"** (Depurar de nuevo).

2. **LinkedIn:**
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
   - Pega la URL y haz clic en **"Inspect"**.

3. **X / Twitter:**
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)

4. **Telegram:**
   - Envía el enlace a `@WebpageBot` en Telegram y selecciona **"Update preview"**.

---

## 7. Directivas de Rastreadores (`robots.txt`)

`robots.txt` está configurado para autorizar explícitamente a todos los bots de previsualización:
- `facebookexternalhit`, `Facebot`
- `Twitterbot`
- `LinkedInBot`
- `WhatsApp`
- `TelegramBot`
- `Slackbot-LinkExpanding`, `Slack-ImgBatcher`
- `Discordbot`, `Applebot`, `Googlebot`, `Bingbot`

---

*Desarrollado para Clérigo Technologies · Plataforma Integral de Gobernanza, Riesgo y Cumplimiento (GRC).*
