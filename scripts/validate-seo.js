import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const files = [
  'index.html',
  'es/index.html',
  'marcos.html',
  'es/marcos.html',
  'precios.html',
  'es/precios.html',
  'confianza.html',
  'es/confianza.html',
  'contacto.html',
  'es/contacto.html',
  'partners.html',
  'es/partners.html',
  'legal.html',
  'es/legal.html'
];

let allPassed = true;

console.log("=== INICIANDO VALIDACIÓN DE METADATOS Y LINK PREVIEW ===");

files.forEach(f => {
  const filePath = path.join(ROOT, f);
  if (!fs.existsSync(filePath)) {
    console.error(`[ERROR] Archivo no existe: ${f}`);
    allPassed = false;
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasTitle = /<title>[^<]+<\/title>/.test(content);
  const hasOgTitle = /<meta\s+property=["']og:title["']/.test(content);
  const hasOgDesc = /<meta\s+property=["']og:description["']/.test(content);
  const hasOgImg = /<meta\s+property=["']og:image["']\s+content=["']https:\/\/clerigo\.io\//.test(content);
  const hasCanonical = /<link\s+rel=["']canonical["']\s+href=["']https:\/\/clerigo\.io\//.test(content);
  
  const jsonLdMatch = content.match(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/);
  let jsonLdValid = false;
  if (jsonLdMatch) {
    try {
      JSON.parse(jsonLdMatch[1]);
      jsonLdValid = true;
    } catch (e) {
      console.error(`[ERROR] JSON-LD inválido en ${f}:`, e.message);
    }
  }

  const passed = hasTitle && hasOgTitle && hasOgDesc && hasOgImg && hasCanonical && jsonLdValid;
  if (!passed) {
    allPassed = false;
    console.error(`[FAIL] ${f}:`, { hasTitle, hasOgTitle, hasOgDesc, hasOgImg, hasCanonical, jsonLdValid });
  } else {
    console.log(`[PASS] ${f}`);
  }
});

if (allPassed) {
  console.log("\n=======================================================");
  console.log("🎉 TODAS LAS 14 PÁGINAS PASARON LA VALIDACIÓN AL 100%");
  console.log("=======================================================");
} else {
  process.exit(1);
}
