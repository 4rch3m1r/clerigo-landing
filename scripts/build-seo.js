/**
 * =============================================================================
 * CLÉRIGO.IO - GENERADOR Y SINCRONIZADOR DE METADATOS HTML
 * =============================================================================
 * Inyecta y estandariza todas las etiquetas SEO, Open Graph, Twitter Cards y
 * Schema.org (JSON-LD) en todas las páginas estáticas del proyecto.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_CONFIG, ROUTES, generateHeadMetaTags, generateJsonLdGraph } from '../seo.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Lista de archivos objetivo
const TARGET_FILES = [
  'index.html',
  'es/index.html',
  'frameworks.html',
  'es/marcos.html',
  'pricing.html',
  'es/precios.html',
  'trustcenter.html',
  'es/confianza.html',
  'contact.html',
  'es/contacto.html',
  'partners.html',
  'es/partners.html',
  'legal.html',
  'es/legal.html',
  'oscuro.html',
  'es/oscuro.html'
];

function processHtmlFile(relativeFilePath) {
  const fullPath = path.join(ROOT_DIR, relativeFilePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`[SKIP] No existe el archivo: ${relativeFilePath}`);
    return;
  }

  let html = fs.readFileSync(fullPath, 'utf8');

  // Determinar la clave de configuración de ruta
  const fileKey = relativeFilePath.replace(/\\/g, '/');
  const routeConfig = ROUTES[fileKey] || {};

  // Generar etiquetas SEO y JSON-LD
  const metaTags = generateHeadMetaTags(fileKey);
  const jsonLd = generateJsonLdGraph(fileKey);

  // Extraer el contenido del <head>
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  if (!headMatch) {
    console.warn(`[ERROR] No se encontró <head> en ${relativeFilePath}`);
    return;
  }

  let headContent = headMatch[1];

  // Extraer estilos, preconnects, fuentes y scripts personalizados que no sean json-ld
  // Guardamos los links a fuentes y estilos
  const fontLinks = headContent.match(/<link[^>]+(fonts\.googleapis|fonts\.gstatic)[^>]*>/gi) || [];
  const stylesheets = headContent.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) || [];
  const customStyles = headContent.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
  const customScripts = headContent.match(/<script(?![^>]*type=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/gi) || [];
  
  // Favicons
  const isSubdir = fileKey.startsWith('es/');
  const faviconPrefix = isSubdir ? '../' : '';
  const faviconTags = [
    `<link rel="icon" type="image/png" href="${faviconPrefix}favicon.png" sizes="160x160">`,
    `<link rel="apple-touch-icon" href="${faviconPrefix}favicon.png">`
  ].join('\n');

  // Preconnects recomendados para rendimiento
  const preconnects = [
    `<link rel="preconnect" href="https://app.clerigo.io" crossorigin>`,
    `<link rel="dns-prefetch" href="https://app.clerigo.io">`,
    `<link rel="preconnect" href="https://fonts.googleapis.com">`,
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
    `<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;0,900;1,300;1,400&family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet">`
  ].join('\n');

  // JSON-LD tag
  const jsonLdTag = `<script type="application/ld+json">${jsonLd}</script>`;

  // Armar el nuevo <head> limpio y optimizado
  const newHeadContent = `
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${metaTags}
${faviconTags}
${preconnects}
${jsonLdTag}
${customStyles.join('\n')}
${customScripts.join('\n')}
`;

  // Reemplazar el <head>
  html = html.replace(/<head[^>]*>[\s\S]*?<\/head>/i, `<head>${newHeadContent}</head>`);

  // Asegurar lang en la etiqueta <html>
  const expectedLang = routeConfig.lang || (isSubdir ? 'es' : 'en');
  html = html.replace(/<html(\s+[^>]*)?>/i, `<html lang="${expectedLang}">`);

  fs.writeFileSync(fullPath, html, 'utf8');
  console.log(`[OK] Actualizado con éxito: ${relativeFilePath}`);
}

console.log('Iniciando inyección de metadatos SEO y Social Preview en páginas HTML...');
TARGET_FILES.forEach(processHtmlFile);
console.log('¡Proceso completado con éxito!');
