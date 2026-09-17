const fs = require('fs');
const path = require('path');

const pubDir = path.join(__dirname, '../public');

// 1. NIST CSF 2.0
const nistSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 110" width="100%" height="100%">
  <defs>
    <linearGradient id="nistGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B2545"/>
      <stop offset="100%" stop-color="#041224"/>
    </linearGradient>
    <linearGradient id="nistBlue" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#006699"/>
      <stop offset="100%" stop-color="#0088CC"/>
    </linearGradient>
    <filter id="nistDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect x="2" y="2" width="236" height="106" rx="8" fill="url(#nistGrad)" filter="url(#nistDrop)" stroke="#0E3D6E" stroke-width="1.2"/>
  <g transform="translate(18, 16)">
    <rect x="0" y="0" width="70" height="78" rx="6" fill="#003087" stroke="#1A5FB4" stroke-width="1"/>
    <text x="35" y="46" text-anchor="middle" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF" letter-spacing="2">NIST</text>
    <rect x="10" y="56" width="50" height="14" rx="2" fill="#0088CC"/>
    <text x="35" y="66" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="8" fill="#FFFFFF" letter-spacing="1">CSF 2.0</text>
  </g>
  <g transform="translate(100, 24)">
    <text x="0" y="24" font-family="'Arial Black', 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="22" fill="#FFFFFF" letter-spacing="1.5">NIST CSF</text>
    <rect x="0" y="32" width="124" height="14" rx="3" fill="url(#nistBlue)"/>
    <text x="62" y="42.5" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="7" fill="#FFFFFF" letter-spacing="0.8">CYBERSECURITY FRAMEWORK</text>
    <text x="0" y="58" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="7" fill="rgba(255,255,255,0.85)" letter-spacing="0.2">National Institute of Standards</text>
    <text x="0" y="66" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="6.5" fill="rgba(255,255,255,0.65)" letter-spacing="0.2">&amp; Technology · 6 Funciones Core</text>
  </g>
</svg>`;

// 2. SOC 2 Type II
const soc2Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 110" width="100%" height="100%">
  <defs>
    <linearGradient id="socGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2D0E12"/>
      <stop offset="100%" stop-color="#190608"/>
    </linearGradient>
    <linearGradient id="socRed" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#DC2626"/>
      <stop offset="100%" stop-color="#EF4444"/>
    </linearGradient>
    <filter id="socDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect x="2" y="2" width="236" height="106" rx="8" fill="url(#socGrad)" filter="url(#socDrop)" stroke="#5B161B" stroke-width="1.2"/>
  <g transform="translate(18, 16)">
    <circle cx="39" cy="39" r="38" fill="none" stroke="#DC2626" stroke-width="2.5"/>
    <circle cx="39" cy="39" r="33" fill="#3D1217" stroke="#DC2626" stroke-width="1"/>
    <text x="39" y="36" text-anchor="middle" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="18" fill="#FFFFFF" letter-spacing="-0.5">SOC</text>
    <text x="39" y="55" text-anchor="middle" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="16" fill="#EF4444">2</text>
    <path id="socArch" d="M 14,39 A 25,25 0 0,1 64,39" fill="none"/>
    <text font-family="'Helvetica Neue', Arial, sans-serif" font-size="6" font-weight="900" fill="#EF4444" letter-spacing="1">
      <textPath href="#socArch" startOffset="16%">AICPA · TSC</textPath>
    </text>
  </g>
  <g transform="translate(102, 24)">
    <text x="0" y="24" font-family="'Arial Black', 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="22" fill="#FFFFFF" letter-spacing="1">SOC 2 TYPE II</text>
    <rect x="0" y="32" width="122" height="14" rx="3" fill="url(#socRed)"/>
    <text x="61" y="42.5" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="7" fill="#FFFFFF" letter-spacing="0.8">TRUST SERVICES CRITERIA</text>
    <text x="0" y="58" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="7" fill="rgba(255,255,255,0.85)" letter-spacing="0.2">AICPA Criterios de Seguridad</text>
    <text x="0" y="66" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="6.5" fill="rgba(255,255,255,0.65)" letter-spacing="0.2">Disponibilidad, Integridad &amp; Privacidad</text>
  </g>
</svg>`;

// 3. GDPR / RGPD
const gdprSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 110" width="100%" height="100%">
  <defs>
    <linearGradient id="gdprGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#001F5C"/>
      <stop offset="100%" stop-color="#000D2B"/>
    </linearGradient>
    <linearGradient id="gdprGold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#FBBF24"/>
    </linearGradient>
    <filter id="gdprDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect x="2" y="2" width="236" height="106" rx="8" fill="url(#gdprGrad)" filter="url(#gdprDrop)" stroke="#003599" stroke-width="1.2"/>
  <g transform="translate(18, 16)">
    <circle cx="39" cy="39" r="38" fill="#001848" stroke="#2563EB" stroke-width="1.5"/>
    <!-- 12 EU Stars -->
    <g fill="#FBBF24">
      <circle cx="39" cy="9" r="2.2"/><circle cx="54" cy="13" r="2.2"/><circle cx="65" cy="24" r="2.2"/><circle cx="69" cy="39" r="2.2"/>
      <circle cx="65" cy="54" r="2.2"/><circle cx="54" cy="65" r="2.2"/><circle cx="39" cy="69" r="2.2"/><circle cx="24" cy="65" r="2.2"/>
      <circle cx="13" cy="54" r="2.2"/><circle cx="9" cy="39" r="2.2"/><circle cx="13" cy="24" r="2.2"/><circle cx="24" cy="13" r="2.2"/>
    </g>
    <text x="39" y="44" text-anchor="middle" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="14" fill="#FFFFFF" letter-spacing="1">GDPR</text>
  </g>
  <g transform="translate(102, 24)">
    <text x="0" y="24" font-family="'Arial Black', 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="22" fill="#FFFFFF" letter-spacing="1.5">RGPD / GDPR</text>
    <rect x="0" y="32" width="122" height="14" rx="3" fill="url(#gdprGold)"/>
    <text x="61" y="42.5" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="7" fill="#000D2B" letter-spacing="0.8">REGLAMENTO GENERAL (UE)</text>
    <text x="0" y="58" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="7" fill="rgba(255,255,255,0.85)" letter-spacing="0.2">Reglamento (UE) 2016/679</text>
    <text x="0" y="66" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="6.5" fill="rgba(255,255,255,0.65)" letter-spacing="0.2">Protección de Datos &amp; Derechos ARCO</text>
  </g>
</svg>`;

// Helper for ISO Standards
function createIsoSvg(number, title, subtitle, color1, color2, badgeText) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 110" width="100%" height="100%">
  <defs>
    <linearGradient id="isoGrad_${number}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="#060A10"/>
    </linearGradient>
    <linearGradient id="isoAccent_${number}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${color2}"/>
      <stop offset="100%" stop-color="${color1}"/>
    </linearGradient>
    <filter id="isoDrop_${number}" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect x="2" y="2" width="236" height="106" rx="8" fill="url(#isoGrad_${number})" filter="url(#isoDrop_${number})" stroke="${color2}" stroke-width="1.2"/>
  <g transform="translate(18, 16)">
    <circle cx="39" cy="39" r="38" fill="none" stroke="${color2}" stroke-width="2"/>
    <circle cx="39" cy="39" r="32" fill="#0A101D" stroke="${color2}" stroke-width="0.8" opacity="0.6"/>
    <!-- Globe lines -->
    <ellipse cx="39" cy="39" rx="14" ry="32" fill="none" stroke="${color2}" stroke-width="0.7" opacity="0.5"/>
    <line x1="7" y1="39" x2="71" y2="39" stroke="${color2}" stroke-width="0.7" opacity="0.5"/>
    <text x="39" y="34" text-anchor="middle" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="15" fill="#FFFFFF" letter-spacing="1">ISO</text>
    <text x="39" y="52" text-anchor="middle" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="13" fill="${color2}">${number}</text>
  </g>
  <g transform="translate(102, 24)">
    <text x="0" y="24" font-family="'Arial Black', 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="22" fill="#FFFFFF" letter-spacing="1">ISO ${number}</text>
    <rect x="0" y="32" width="122" height="14" rx="3" fill="url(#isoAccent_${number})"/>
    <text x="61" y="42.5" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="7" fill="#FFFFFF" letter-spacing="0.8">${badgeText}</text>
    <text x="0" y="58" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="7" fill="rgba(255,255,255,0.85)" letter-spacing="0.2">${title}</text>
    <text x="0" y="66" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="6.5" fill="rgba(255,255,255,0.65)" letter-spacing="0.2">${subtitle}</text>
  </g>
</svg>`;
}

const iso27001 = createIsoSvg('27001', 'Seguridad de la Información', 'SGSI · Análisis de Brechas & SoA', '#0257BF', '#3B82F6', 'CERTIFICACIÓN INTERNACIONAL');
const iso27002 = createIsoSvg('27002', 'Catálogo de Controles (93)', 'Taxonomía de Seguridad en 4 Temas', '#6B27A8', '#A855F7', 'GUÍA DE CONTROLES DE SEGURIDAD');
const iso22301 = createIsoSvg('22301', 'Continuidad del Negocio', 'SGCN · BCP, DRP & Simulación', '#0D9488', '#14B8A6', 'GESTIÓN DE RESILIENCIA');
const iso31000 = createIsoSvg('31000', 'Gestión de Riesgos', 'Directrices & Tolerancia ERM', '#7C3AED', '#8B5CF6', 'MARCO INTEGRAL DE RIESGOS');
const iso9001  = createIsoSvg('9001', 'Gestión de Calidad (SGC)', 'Satisfacción del Cliente & Procesos', '#059669', '#10B981', 'CALIDAD Y MEJORA CONTINUA');

// Write standards to public/
fs.writeFileSync(path.join(pubDir, 'nist-csf.svg'), nistSvg, 'utf8');
fs.writeFileSync(path.join(pubDir, 'soc2.svg'), soc2Svg, 'utf8');
fs.writeFileSync(path.join(pubDir, 'gdpr.svg'), gdprSvg, 'utf8');
fs.writeFileSync(path.join(pubDir, 'iso-27001.svg'), iso27001, 'utf8');
fs.writeFileSync(path.join(pubDir, 'iso-27002.svg'), iso27002, 'utf8');
fs.writeFileSync(path.join(pubDir, 'iso-22301.svg'), iso22301, 'utf8');
fs.writeFileSync(path.join(pubDir, 'iso-31000.svg'), iso31000, 'utf8');
fs.writeFileSync(path.join(pubDir, 'iso-9001.svg'), iso9001, 'utf8');

// 9 Control Areas Vector Icons
function createModuleSvg(id, title, subtitle, iconPath) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 110" width="100%" height="100%">
  <defs>
    <linearGradient id="modGrad_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E0A0A"/>
      <stop offset="100%" stop-color="#0D0404"/>
    </linearGradient>
    <linearGradient id="modRed_${id}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#EB1000"/>
      <stop offset="100%" stop-color="#FF3829"/>
    </linearGradient>
    <filter id="modDrop_${id}" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect x="2" y="2" width="236" height="106" rx="8" fill="url(#modGrad_${id})" filter="url(#modDrop_${id})" stroke="#4A1414" stroke-width="1.2"/>
  <g transform="translate(18, 16)">
    <rect x="0" y="0" width="76" height="78" rx="8" fill="#2B0C0C" stroke="#EB1000" stroke-width="1.2"/>
    <g transform="translate(18, 19)" fill="none" stroke="#EB1000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      ${iconPath}
    </g>
  </g>
  <g transform="translate(104, 24)">
    <text x="0" y="22" font-family="'Arial Black', 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="19" fill="#FFFFFF" letter-spacing="0.5">${title}</text>
    <rect x="0" y="30" width="120" height="14" rx="3" fill="url(#modRed_${id})"/>
    <text x="60" y="40.5" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="7" fill="#FFFFFF" letter-spacing="0.8">ÁREA DE CONTROL GRC</text>
    <text x="0" y="56" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="7" fill="rgba(255,255,255,0.85)" letter-spacing="0.2">${subtitle}</text>
    <text x="0" y="64" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="6.5" fill="rgba(255,255,255,0.65)" letter-spacing="0.2">Motor Nativo Clèrigo XGRC</text>
  </g>
</svg>`;
}

const mod1 = createModuleSvg('m1', 'Gestión Riesgos', 'ERM Integral & Mapas de Calor',
  `<polygon points="20 4 36 34 4 34"/>
   <line x1="20" y1="16" x2="20" y2="24"/>
   <circle cx="20" cy="29" r="1.5" fill="#EB1000"/>`);

const mod2 = createModuleSvg('m2', 'Cumplimiento', 'Monitoreo Regulatorio & Políticas',
  `<circle cx="20" cy="20" r="16"/>
   <circle cx="20" cy="20" r="10"/>
   <line x1="20" y1="4" x2="20" y2="36"/>
   <line x1="4" y1="20" x2="36" y2="20"/>`);

const mod3 = createModuleSvg('m3', 'Auditoría', 'Planes, Evidencias & Hallazgos',
  `<rect x="6" y="8" width="28" height="28" rx="3"/>
   <line x1="12" y1="16" x2="28" y2="16"/>
   <line x1="12" y1="22" x2="28" y2="22"/>
   <line x1="12" y1="28" x2="20" y2="28"/>
   <path d="M14 4 L26 4 L26 8 L14 8 Z"/>`);

const mod4 = createModuleSvg('m4', 'Control Interno', 'Alineado a COSO 2013 & SOX',
  `<path d="M20 4 L34 10 L34 22 C34 30 20 36 20 36 C20 36 6 30 6 22 L6 10 Z"/>
   <polyline points="13 19 18 24 27 15"/>`);

const mod5 = createModuleSvg('m5', 'Ciberseguridad', 'Gestión de Amenazas & NIST',
  `<rect x="8" y="16" width="24" height="18" rx="3"/>
   <path d="M13 16 V10 A7 7 0 0 1 27 10 V16"/>
   <circle cx="20" cy="25" r="2.5" fill="#EB1000"/>`);

const mod6 = createModuleSvg('m6', 'Gobierno Corp.', 'Consejos, Comités & Actas',
  `<path d="M4 32 L36 32"/>
   <path d="M20 6 L34 14 L6 14 Z"/>
   <line x1="10" y1="14" x2="10" y2="32"/>
   <line x1="20" y1="14" x2="20" y2="32"/>
   <line x1="30" y1="14" x2="30" y2="32"/>`);

const mod7 = createModuleSvg('m7', 'Continuidad', 'BCP, DRP & ISO 22301',
  `<path d="M34 16 A16 16 0 1 1 20 4"/>
   <polyline points="34 8 34 16 26 16"/>
   <polyline points="12 20 18 20 20 14 24 26 26 20 30 20"/>`);

const mod8 = createModuleSvg('m8', 'Privacidad', 'Ley 172-13, RGPD & ARCO',
  `<ellipse cx="20" cy="14" rx="8" ry="8"/>
   <path d="M6 34 C6 26 14 24 20 24 C26 24 34 26 34 34"/>
   <rect x="23" y="24" width="12" height="10" rx="2" fill="#2B0C0C" stroke="#EB1000" stroke-width="1.8"/>
   <path d="M26 24 V21 A3 3 0 0 1 32 21 V24"/>`);

const mod9 = createModuleSvg('m9', 'Riesgo Terceros', 'TPRM, Proveedores & SLAs',
  `<circle cx="20" cy="8" r="4"/>
   <circle cx="8" cy="30" r="4"/>
   <circle cx="32" cy="30" r="4"/>
   <line x1="18" y1="12" x2="10" y2="26"/>
   <line x1="22" y1="12" x2="30" y2="26"/>
   <line x1="12" y1="30" x2="28" y2="30"/>`);

fs.writeFileSync(path.join(pubDir, 'mod-riesgos.svg'), mod1, 'utf8');
fs.writeFileSync(path.join(pubDir, 'mod-cumplimiento.svg'), mod2, 'utf8');
fs.writeFileSync(path.join(pubDir, 'mod-auditoria.svg'), mod3, 'utf8');
fs.writeFileSync(path.join(pubDir, 'mod-control.svg'), mod4, 'utf8');
fs.writeFileSync(path.join(pubDir, 'mod-ciberseguridad.svg'), mod5, 'utf8');
fs.writeFileSync(path.join(pubDir, 'mod-gobierno.svg'), mod6, 'utf8');
fs.writeFileSync(path.join(pubDir, 'mod-continuidad.svg'), mod7, 'utf8');
fs.writeFileSync(path.join(pubDir, 'mod-privacidad.svg'), mod8, 'utf8');
fs.writeFileSync(path.join(pubDir, 'mod-terceros.svg'), mod9, 'utf8');

console.log('Successfully generated all framework and module logos in public/ !');
