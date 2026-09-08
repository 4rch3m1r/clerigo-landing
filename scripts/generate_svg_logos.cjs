const fs = require('fs');
const path = require('path');

// 1. PCI-DSS: Official PCI Security Standards Council / PCI DSS Logo
const pciDssSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 110" width="100%" height="100%">
  <defs>
    <linearGradient id="pciBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#002D62"/>
      <stop offset="100%" stop-color="#001738"/>
    </linearGradient>
    <linearGradient id="pciGold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FF9E1B"/>
      <stop offset="100%" stop-color="#FFC72C"/>
    </linearGradient>
    <filter id="pciDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.15"/>
    </filter>
  </defs>
  
  <!-- Outer Badge Container -->
  <rect x="2" y="2" width="236" height="106" rx="8" fill="url(#pciBadgeGrad)" filter="url(#pciDrop)" stroke="#004687" stroke-width="1.2"/>
  
  <!-- "PCI" Bold Geometric Wordmark -->
  <g fill="#FFFFFF">
    <!-- P -->
    <path d="M 22 28 L 50 28 C 61 28 69 34 69 44 C 69 54 61 60 50 60 L 35 60 L 35 82 L 22 82 Z M 35 39 L 35 49 L 48 49 C 52.5 49 56 47 56 44 C 56 41 52.5 39 48 39 Z"/>
    <!-- C -->
    <path d="M 104 38 C 100 31 93 28 85 28 C 71 28 60 39 60 55 C 60 71 71 82 85 82 C 94 82 100 78 104 72 L 94 65 C 91 69 88 71 85 71 C 77 71 73 63 73 55 C 73 47 77 39 85 39 C 88 39 91 41 94 45 Z"/>
    <!-- I -->
    <path d="M 112 28 L 125 28 L 125 82 L 112 82 Z"/>
  </g>
  
  <!-- Golden Swoosh Globe Arc -->
  <path d="M 18 60 C 44 47 100 43 136 65 C 140 67.5 144 65 141 61 C 111 34 49 36 16 54 C 13 55.5 15 61.5 18 60 Z" fill="url(#pciGold)"/>
  
  <!-- Divider -->
  <line x1="140" y1="24" x2="140" y2="86" stroke="rgba(255,255,255,0.2)" stroke-width="1.2"/>
  
  <!-- "DSS" Shield Badge & Subtitle -->
  <g transform="translate(148, 22)">
    <rect x="0" y="0" width="76" height="34" rx="4" fill="url(#pciGold)"/>
    <text x="38" y="24.5" text-anchor="middle" font-family="'Arial Black', 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="20" fill="#001738" letter-spacing="2">DSS</text>
    <text x="38" y="47" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="7.5" fill="#FFFFFF" letter-spacing="0.6">SECURITY</text>
    <text x="38" y="58" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="6.5" fill="rgba(255,255,255,0.75)" letter-spacing="0.2">STANDARDS COUNCIL</text>
  </g>
</svg>`;

// 2. HIPAA: Official Health Insurance Portability and Accountability Act / HHS Shield Vector
const hipaaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 110" width="100%" height="100%">
  <defs>
    <linearGradient id="hipaaBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F4C81"/>
      <stop offset="100%" stop-color="#082845"/>
    </linearGradient>
    <linearGradient id="hipaaShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="100%" stop-color="#0369A1"/>
    </linearGradient>
    <filter id="hipaaDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.15"/>
    </filter>
  </defs>
  
  <!-- Outer Badge Container -->
  <rect x="2" y="2" width="236" height="106" rx="8" fill="url(#hipaaBadgeGrad)" filter="url(#hipaaDrop)" stroke="#1E5E99" stroke-width="1.2"/>
  
  <!-- Medical Shield Emblem on the left -->
  <g transform="translate(16, 16)">
    <!-- Outer Shield -->
    <path d="M 36 2 L 68 14 C 68 46 52 66 36 74 C 20 66 4 46 4 14 Z" fill="url(#hipaaShieldGrad)" stroke="#38BDF8" stroke-width="1.2"/>
    <!-- Inner Shield Inset -->
    <path d="M 36 7 L 63 17.5 C 63 44 49 61 36 68 C 23 61 9 44 9 17.5 Z" fill="#FFFFFF" opacity="0.15"/>
    <!-- Medical Cross -->
    <path d="M 31 22 L 41 22 L 41 32 L 51 32 L 51 40 L 41 40 L 41 50 L 31 50 L 31 40 L 21 40 L 21 32 L 31 32 Z" fill="#FFFFFF"/>
    <!-- Checkmark Accent -->
    <path d="M 28 57 L 34 62 L 46 50" fill="none" stroke="#FDE047" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  <!-- Typography on the right -->
  <g transform="translate(94, 24)">
    <text x="0" y="28" font-family="'Arial Black', 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="30" fill="#FFFFFF" letter-spacing="2">HIPAA</text>
    <!-- Subtitle Badge -->
    <rect x="0" y="36" width="128" height="15" rx="3" fill="#0D9488"/>
    <text x="64" y="47" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="7.5" fill="#FFFFFF" letter-spacing="0.8">COMPLIANCE STANDARD</text>
    <!-- HHS Subtitle -->
    <text x="0" y="62" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="7" fill="rgba(255,255,255,0.85)" letter-spacing="0.2">Health Insurance Portability</text>
    <text x="0" y="70" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="7" fill="rgba(255,255,255,0.85)" letter-spacing="0.2">&amp; Accountability Act · HHS</text>
  </g>
</svg>`;

// 3. SWIFT CSP: Official SWIFT Globe + Wordmark + CSP Badge
const swiftSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 110" width="100%" height="100%">
  <defs>
    <linearGradient id="swiftBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E242B"/>
      <stop offset="100%" stop-color="#0E1217"/>
    </linearGradient>
    <linearGradient id="swiftOrange" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF7700"/>
      <stop offset="100%" stop-color="#E55500"/>
    </linearGradient>
    <filter id="swiftDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.15"/>
    </filter>
  </defs>
  
  <!-- Outer Badge Container -->
  <rect x="2" y="2" width="236" height="106" rx="8" fill="url(#swiftBadgeGrad)" filter="url(#swiftDrop)" stroke="#2D3748" stroke-width="1.2"/>
  
  <!-- SWIFT Official Vector Mark (Globe + SWIFT Text) -->
  <g transform="translate(24, 18) scale(1.18)">
    <g fill="#FFFFFF">
      <path d="M17.2 0c-3.4 0-6.7 1-9.5 2.9s-5 4.6-6.3 7.7c-1.3 3.2-1.6 6.6-1 10S2.6 27 5 29.4c2.4 2.4 5.5 4.1 8.8 4.7 3.3.7 6.8.3 9.9-1 3.1-1.3 5.8-3.5 7.7-6.4 1.9-2.8 2.9-6.2 2.9-9.6 0-4.6-1.8-9-5-12.2C26.1 1.8 21.7 0 17.2 0zm-16 17.9h5.3c0 2.4.4 4.8 1.1 7.1H3.2c-1.2-2.2-1.9-4.7-2-7.1zm16.6-9.6v-7c3 .3 5.6 3 7.2 7h-7.2zm7.6 1.2c.7 2.3 1.1 4.7 1.2 7.1h-8.8V9.5h7.6zm-8.9-8.2v7H9.3c1.6-4 4.3-6.7 7.2-7zm0 8.2v7.1H7.7c0-2.4.4-4.8 1.2-7.1h7.6zm-10 7.1H1.2c.1-2.5.8-4.9 2-7.1h4.4c-.7 2.3-1 4.7-1.1 7.1zm1.2 1.3h8.8V25H8.9c-.7-2.3-1.1-4.7-1.2-7.1zm8.8 8.3v7c-3-.3-5.6-3-7.2-7h7.2zm1.3 7v-7.1H25c-1.6 4.1-4.2 6.8-7.2 7.1zm0-8.3v-7.1h8.8c0 2.4-.4 4.8-1.2 7.1h-7.6zm10-7h5.3c-.1 2.5-.8 4.9-2 7.1h-4.4c.7-2.4 1.1-4.7 1.1-7.1zm0-1.3c0-2.4-.4-4.8-1.1-7.1h4.4c1.2 2.2 1.9 4.6 2 7.1h-5.3zm2.6-8.3h-4.1c-.4-1.1-.9-2.1-1.5-3.1-.7-1.2-1.5-2.2-2.5-3.1 3.3 1.1 6.1 3.3 8.1 6.2zM12 2.1c-.9.9-1.8 1.9-2.5 3.1-.6 1-1.1 2-1.5 3.1H3.9c2-2.9 4.8-5.1 8.1-6.2zM3.9 26.2H8c.4 1.1.9 2.1 1.5 3.1.7 1.1 1.5 2.2 2.5 3.1-3.3-1.1-6.1-3.3-8.1-6.2zm18.4 6.2c1-.9 1.8-1.9 2.5-3.1.6-1 1.1-2.1 1.5-3.1h4.1c-2 2.9-4.8 5.1-8.1 6.2zm59.2-20.1h-2.8v15.4h2.8V12.3zm-1.4-2.1c1 0 1.9-.8 1.9-1.9s-.8-1.9-1.9-1.9c-1 0-1.9.8-1.9 1.9s.9 1.9 1.9 1.9zm7.1 6.2h4.1V14h-4.1v-2.2c0-1.6 1.1-2.5 3-2.5h1.1V6.5h-1.1c-3.6 0-5.8 2-5.8 5.2v16.1h2.8V16.4zm11.7 11.4h1.1V25h-1.1c-1.9 0-3-.9-3-2.5v-6.1h4.1V14h-4.1V6.5h-2.8v16.1c0 3.1 2.2 5.1 5.8 5.2zm-35.4 0l2.8-11.5 2.8 11.5h3.2l4.3-15.4h-2.9l-3 11.8-2.9-11.8h-3.1l-2.9 11.8-3-11.8H56l4.3 15.4h3.2zm-15.2-2.6c-2.4 0-4.4-1.5-5.1-3l-2.6 1.4c1.2 2.7 4.2 4.5 7.6 4.5 4.4 0 7.5-2.5 7.5-6.1 0-8.3-11.7-4.8-11.7-9.6 0-2.1 1.8-3.1 4.3-3.1 2 0 3.8 1.1 4.9 2.5l2.2-1.9c-1.5-2.1-4.2-3.3-7.1-3.3-4.5 0-7.3 2.8-7.3 5.8 0 8.1 11.8 4.1 11.8 9.7 0 1.8-1.8 3.1-4.5 3.1z"/>
    </g>
  </g>
  
  <!-- CSP Badge & Subtitle -->
  <g transform="translate(18, 66)">
    <rect x="0" y="0" width="204" height="18" rx="3" fill="url(#swiftOrange)"/>
    <text x="102" y="12.5" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="9" fill="#FFFFFF" letter-spacing="1.2">CUSTOMER SECURITY PROGRAMME (CSP)</text>
    <text x="102" y="27" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="6.5" fill="rgba(255,255,255,0.7)" letter-spacing="0.3">CSC Controls Framework · Financial Messaging</text>
  </g>
</svg>`;

// 4. COBIT 2019: Official ISACA Framework Logo
const cobitSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 110" width="100%" height="100%">
  <defs>
    <linearGradient id="cobitBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E2A47"/>
      <stop offset="100%" stop-color="#08182B"/>
    </linearGradient>
    <linearGradient id="cobitCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00A3E0"/>
      <stop offset="100%" stop-color="#007799"/>
    </linearGradient>
    <filter id="cobitDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.15"/>
    </filter>
  </defs>
  
  <!-- Outer Badge Container -->
  <rect x="2" y="2" width="236" height="106" rx="8" fill="url(#cobitBadgeGrad)" filter="url(#cobitDrop)" stroke="#16436E" stroke-width="1.2"/>
  
  <!-- ISACA Geometric Emblem on left -->
  <g transform="translate(18, 20)">
    <!-- Hexagonal Governance Node -->
    <polygon points="32,4 58,18 58,48 32,62 6,48 6,18" fill="rgba(0,163,224,0.15)"/>
    <polygon points="32,4 58,18 58,48 32,62 6,48 6,18" fill="none" stroke="#00A3E0" stroke-width="2.5"/>
    <line x1="32" y1="4" x2="32" y2="62" stroke="#00A3E0" stroke-width="1.5" opacity="0.6"/>
    <line x1="6" y1="18" x2="58" y2="48" stroke="#00A3E0" stroke-width="1.5" opacity="0.6"/>
    <line x1="6" y1="48" x2="58" y2="18" stroke="#00A3E0" stroke-width="1.5" opacity="0.6"/>
    <!-- Central Core -->
    <circle cx="32" cy="33" r="8" fill="#00A3E0"/>
    <circle cx="32" cy="33" r="4" fill="#FFFFFF"/>
    <!-- Outer accent dots -->
    <circle cx="32" cy="4" r="3" fill="#38BDF8"/>
    <circle cx="58" cy="18" r="3" fill="#38BDF8"/>
    <circle cx="58" cy="48" r="3" fill="#38BDF8"/>
    <circle cx="32" cy="62" r="3" fill="#38BDF8"/>
    <circle cx="6" cy="48" r="3" fill="#38BDF8"/>
    <circle cx="6" cy="18" r="3" fill="#38BDF8"/>
  </g>
  
  <!-- Typography on right -->
  <g transform="translate(90, 24)">
    <text x="0" y="27" font-family="'Arial Black', 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" letter-spacing="2">COBIT</text>
    <!-- 2019 Badge -->
    <rect x="94" y="8" width="38" height="20" rx="3" fill="url(#cobitCyan)"/>
    <text x="113" y="22.5" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="11" fill="#FFFFFF" letter-spacing="0.5">2019</text>
    
    <!-- ISACA Subtitle -->
    <rect x="0" y="36" width="132" height="1.5" fill="rgba(255,255,255,0.2)"/>
    <text x="0" y="50" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="8.5" fill="#38BDF8" letter-spacing="1">AN ISACA® FRAMEWORK</text>
    <text x="0" y="62" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="7" fill="rgba(255,255,255,0.75)" letter-spacing="0.2">Information &amp; Technology Governance</text>
  </g>
</svg>`;

// 5. COSO ERM: Official COSO 3D Cube + Typography Logo
const cosoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 110" width="100%" height="100%">
  <defs>
    <linearGradient id="cosoBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2D1B00"/>
      <stop offset="100%" stop-color="#190F00"/>
    </linearGradient>
    <filter id="cosoDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.15"/>
    </filter>
  </defs>
  
  <!-- Outer Badge Container -->
  <rect x="2" y="2" width="236" height="106" rx="8" fill="url(#cosoBadgeGrad)" filter="url(#cosoDrop)" stroke="#4A2F08" stroke-width="1.2"/>
  
  <!-- Authentic 3D Isometric COSO Cube on left -->
  <g transform="translate(18, 18)">
    <!-- Top Face (Organizational Structure) -->
    <polygon points="36,4 66,18 36,32 6,18" fill="#3B82F6" stroke="#FFFFFF" stroke-width="0.8"/>
    <!-- Top Face Grid lines -->
    <line x1="21" y1="11" x2="51" y2="25" stroke="#FFFFFF" stroke-width="0.6" opacity="0.8"/>
    <line x1="51" y1="11" x2="21" y2="25" stroke="#FFFFFF" stroke-width="0.6" opacity="0.8"/>

    <!-- Right Face (Objectives: Operations, Reporting, Compliance) -->
    <polygon points="36,32 66,18 66,32 36,46" fill="#1E40AF" stroke="#FFFFFF" stroke-width="0.6"/>
    <polygon points="36,46 66,32 66,46 36,60" fill="#1D4ED8" stroke="#FFFFFF" stroke-width="0.6"/>
    <polygon points="36,60 66,46 66,60 36,74" fill="#2563EB" stroke="#FFFFFF" stroke-width="0.6"/>
    <polygon points="36,74 66,60 66,74 36,88" fill="#3B82F6" stroke="#FFFFFF" stroke-width="0.6"/>

    <!-- Left Front Face: 5 Components Layers (Classic COSO Cube) -->
    <!-- 1. Control Environment (Top Red/Orange) -->
    <polygon points="6,18 36,32 36,44 6,30" fill="#EF4444" stroke="#FFFFFF" stroke-width="0.6"/>
    <!-- 2. Risk Assessment (Orange) -->
    <polygon points="6,30 36,44 36,56 6,42" fill="#F97316" stroke="#FFFFFF" stroke-width="0.6"/>
    <!-- 3. Control Activities (Amber) -->
    <polygon points="6,42 36,56 36,68 6,54" fill="#F59E0B" stroke="#FFFFFF" stroke-width="0.6"/>
    <!-- 4. Information & Communication (Green/Teal) -->
    <polygon points="6,54 36,68 36,78 6,64" fill="#10B981" stroke="#FFFFFF" stroke-width="0.6"/>
    <!-- 5. Monitoring Activities (Dark Blue/Teal) -->
    <polygon points="6,64 36,78 36,88 6,74" fill="#06B6D4" stroke="#FFFFFF" stroke-width="0.6"/>
  </g>
  
  <!-- Typography on right -->
  <g transform="translate(94, 24)">
    <text x="0" y="28" font-family="'Georgia', 'Times New Roman', serif" font-weight="900" font-size="32" fill="#FFA826" letter-spacing="3">COSO</text>
    <!-- ERM Badge -->
    <rect x="0" y="36" width="130" height="15" rx="3" fill="#EA580C"/>
    <text x="65" y="47" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="7.5" fill="#FFFFFF" letter-spacing="1">INTERNAL CONTROL &amp; ERM</text>
    <!-- Committee Subtitle -->
    <text x="0" y="62" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="6.5" fill="rgba(255,255,255,0.75)" letter-spacing="0.2">Committee of Sponsoring Organizations</text>
    <text x="0" y="70" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="6.5" fill="rgba(255,255,255,0.75)" letter-spacing="0.2">of the Treadway Commission</text>
  </g>
</svg>`;

// 6. ITIL 4: Official AXELOS ITIL 4 Logo
const itilSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 110" width="100%" height="100%">
  <defs>
    <linearGradient id="itilBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B0764"/>
      <stop offset="100%" stop-color="#240240"/>
    </linearGradient>
    <linearGradient id="itilAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E879F9"/>
      <stop offset="100%" stop-color="#C026D3"/>
    </linearGradient>
    <filter id="itilDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.15"/>
    </filter>
  </defs>
  
  <!-- Outer Badge Container -->
  <rect x="2" y="2" width="236" height="106" rx="8" fill="url(#itilBadgeGrad)" filter="url(#itilDrop)" stroke="#581C87" stroke-width="1.2"/>
  
  <!-- ITIL 4-Facet Diamond Emblem on left -->
  <g transform="translate(20, 22)">
    <!-- Quadrant 1 (Top) -->
    <polygon points="32,4 56,28 32,28" fill="#C084FC"/>
    <!-- Quadrant 2 (Right) -->
    <polygon points="56,28 32,28 32,52" fill="#9333EA"/>
    <!-- Quadrant 3 (Bottom) -->
    <polygon points="32,52 8,28 32,28" fill="#C026D3"/>
    <!-- Quadrant 4 (Left) -->
    <polygon points="8,28 32,4 32,28" fill="#E879F9"/>
    
    <!-- Central intersection lines -->
    <line x1="32" y1="4" x2="32" y2="52" stroke="#FFFFFF" stroke-width="1.5"/>
    <line x1="8" y1="28" x2="56" y2="28" stroke="#FFFFFF" stroke-width="1.5"/>
    
    <circle cx="32" cy="28" r="4" fill="#FFFFFF"/>
  </g>
  
  <!-- Typography on right -->
  <g transform="translate(88, 24)">
    <text x="0" y="28" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="32" fill="#FFFFFF" letter-spacing="2">ITIL</text>
    <!-- "4" Badge -->
    <rect x="70" y="6" width="24" height="24" rx="4" fill="url(#itilAccentGrad)"/>
    <text x="82" y="23.5" text-anchor="middle" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="16" fill="#FFFFFF">4</text>
    
    <!-- AXELOS Accreditation Badge -->
    <rect x="0" y="36" width="134" height="15" rx="3" fill="#7E22CE"/>
    <text x="67" y="47" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="7.5" fill="#FFFFFF" letter-spacing="1">AXELOS · PEOPLECERT</text>
    
    <!-- Subtitle -->
    <text x="0" y="62" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="7" fill="rgba(255,255,255,0.85)" letter-spacing="0.3">IT Service Management (ITSM)</text>
    <text x="0" y="70" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="6.5" fill="rgba(255,255,255,0.65)" letter-spacing="0.2">Best Practice Framework</text>
  </g>
</svg>`;

// 7. FINRA: Official Financial Industry Regulatory Authority Logo
const finraSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 110" width="100%" height="100%">
  <defs>
    <linearGradient id="finraBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#003B6B"/>
      <stop offset="100%" stop-color="#002244"/>
    </linearGradient>
    <filter id="finraDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.15"/>
    </filter>
  </defs>
  
  <!-- Outer Badge Container -->
  <rect x="2" y="2" width="236" height="106" rx="8" fill="url(#finraBadgeGrad)" filter="url(#finraDrop)" stroke="#0A5B9C" stroke-width="1.2"/>
  
  <!-- Official FINRA Vector Paths (Scaled & Centered) -->
  <g transform="translate(20, 20) scale(1.65)">
    <g fill="#FFFFFF">
      <!-- I -->
      <rect x="21.01" y="0.22" width="4.19" height="23.83"/>
      <!-- A -->
      <path d="M76.43,19.98a2.22,2.22,0,0,1-2.44-2.27c0-1.15.73-2.08,2.45-2.55l8.98-2.47v7.29Zm13.25-13.64c0-3.04-1.93-6.12-6.63-6.12h-8.85c-1.44,0-1.94.59-2.07,1.82-.05.5-.24,2.25-.24,2.25h10.45c2.21,0,3.08,1.04,3.08,2.71v1.39l-8.83,2.4c-4.72,1.3-7,3.35-7,6.94a6.26,6.26,0,0,0,6.58,6.32h13.51Z"/>
      <!-- R -->
      <path d="M58.88,7c0-1.67.86-2.71,3.08-2.71h7.07s-.19-1.75-.24-2.25c-.13-1.22-.63-1.82-2.07-1.82h-5.48c-4.7,0-6.62,3.09-6.62,6.12v17.71h4.26Z"/>
      <!-- N -->
      <path d="M42.45,4.29c2.21,0,3.08,1.04,3.08,2.71v17.05h4.26V6.35c0-3.04-1.93-6.12-6.62-6.12h-13v23.83h4.2V4.29Z"/>
      <!-- F -->
      <path d="M15.27,11.52c-.13-1.23-.63-1.82-2.07-1.82h-8.37v-2.7c0-1.67.86-2.71,3.08-2.71h10.07s-.19-1.75-.24-2.25c-.13-1.22-.63-1.82-2.07-1.82h-8.48c-4.7,0-6.63,3.08-6.63,6.12v17.71h4.26v-10.28h10.68s-.19-1.75-.24-2.25"/>
      <!-- Registered mark -->
      <circle cx="94.2" cy="22.2" r="1.8" fill="none" stroke="#FFFFFF" stroke-width="0.3"/>
      <text x="94.2" y="23.2" text-anchor="middle" font-size="2" font-family="sans-serif" font-weight="700" fill="#FFFFFF">R</text>
    </g>
  </g>
  
  <!-- Subtitle and Badge -->
  <g transform="translate(18, 66)">
    <rect x="0" y="0" width="204" height="17" rx="3" fill="#0077CC"/>
    <text x="102" y="12" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="8.5" fill="#FFFFFF" letter-spacing="1.2">FINANCIAL INDUSTRY REGULATORY AUTHORITY</text>
    <text x="102" y="27" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="6.5" fill="rgba(255,255,255,0.75)" letter-spacing="0.3">Broker-Dealer &amp; Securities Market Oversight</text>
  </g>
</svg>`;

// 8. SEC: Official U.S. Securities and Exchange Commission Logo
const secSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 110" width="100%" height="100%">
  <defs>
    <linearGradient id="secBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#002B49"/>
      <stop offset="100%" stop-color="#001626"/>
    </linearGradient>
    <linearGradient id="secGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F9B624"/>
      <stop offset="100%" stop-color="#D99000"/>
    </linearGradient>
    <filter id="secDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.15"/>
    </filter>
  </defs>
  
  <!-- Outer Badge Container -->
  <rect x="2" y="2" width="236" height="106" rx="8" fill="url(#secBadgeGrad)" filter="url(#secDrop)" stroke="#0A4672" stroke-width="1.2"/>
  
  <!-- Official SEC Seal Graphic on the left -->
  <g transform="translate(16, 16)">
    <!-- Outer Gold Ring -->
    <circle cx="38" cy="38" r="36" fill="url(#secGoldGrad)"/>
    <circle cx="38" cy="38" r="34" fill="none" stroke="#002B49" stroke-width="1"/>
    <!-- Navy Inner Circle -->
    <circle cx="38" cy="38" r="28" fill="#002B49"/>
    
    <!-- Eagle & Shield Silhouette inside Seal -->
    <!-- Shield -->
    <path d="M 38 26 L 49 32 C 49 46 43 53 38 56 C 33 53 27 46 27 32 Z" fill="#F9B624"/>
    <path d="M 38 28 L 47 33 C 47 44 42 50 38 53 C 34 50 29 44 29 33 Z" fill="#002B49"/>
    
    <!-- Eagle Wings -->
    <path d="M 38 23 C 33 16 20 22 16 32 C 23 30 30 33 34 38 Z" fill="#F9B624"/>
    <path d="M 38 23 C 43 16 56 22 60 32 C 53 30 46 33 42 38 Z" fill="#F9B624"/>
    <!-- Eagle Head -->
    <path d="M 38 18 L 41 22 L 35 22 Z" fill="#F9B624"/>
    <circle cx="38" cy="20" r="3.5" fill="#F9B624"/>
    <!-- Olive Branch & Arrows -->
    <line x1="26" y1="50" x2="20" y2="54" stroke="#F9B624" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="50" y1="50" x2="56" y2="54" stroke="#F9B624" stroke-width="1.5" stroke-linecap="round"/>
    
    <!-- Star Accents -->
    <circle cx="38" cy="7" r="1.5" fill="#002B49"/>
    <circle cx="38" cy="69" r="1.5" fill="#002B49"/>
    <circle cx="7" cy="38" r="1.5" fill="#002B49"/>
    <circle cx="69" cy="38" r="1.5" fill="#002B49"/>
  </g>
  
  <!-- Typography on the right -->
  <g transform="translate(98, 24)">
    <!-- "SEC" Bold Header -->
    <text x="0" y="28" font-family="'Arial Black', 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="32" fill="#FFFFFF" letter-spacing="2">SEC</text>
    <!-- Subtitle Badge -->
    <rect x="0" y="36" width="126" height="15" rx="3" fill="url(#secGoldGrad)"/>
    <text x="63" y="47" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="7" fill="#001626" letter-spacing="0.8">U.S. SECURITIES &amp; EXCHANGE</text>
    <!-- Federal Subtitle -->
    <text x="0" y="62" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="7" fill="rgba(255,255,255,0.85)" letter-spacing="0.2">Securities Exchange Act of 1934</text>
    <text x="0" y="70" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="6.5" fill="rgba(255,255,255,0.65)" letter-spacing="0.2">Public Companies &amp; Capital Markets</text>
  </g>
</svg>`;

// Write all SVGs to public/
const pubDir = path.join(__dirname, '../public');
fs.writeFileSync(path.join(pubDir, 'pci-dss.svg'), pciDssSvg, 'utf8');
fs.writeFileSync(path.join(pubDir, 'hipaa.svg'), hipaaSvg, 'utf8');
fs.writeFileSync(path.join(pubDir, 'swift.svg'), swiftSvg, 'utf8');
fs.writeFileSync(path.join(pubDir, 'cobit.svg'), cobitSvg, 'utf8');
fs.writeFileSync(path.join(pubDir, 'coso.svg'), cosoSvg, 'utf8');
fs.writeFileSync(path.join(pubDir, 'itil.svg'), itilSvg, 'utf8');
fs.writeFileSync(path.join(pubDir, 'finra.svg'), finraSvg, 'utf8');
fs.writeFileSync(path.join(pubDir, 'sec.svg'), secSvg, 'utf8');

console.log('Successfully generated all 8 SVGs in public/ directory!');
