/**
 * =============================================================================
 * CLÉRIGO.IO - CONFIGURACIÓN CENTRALIZADA DE METADATOS SEO Y SOCIAL PREVIEWS
 * =============================================================================
 * Arquitectura optimizada para Google Sitelinks, Open Graph, Twitter Cards,
 * canonicalización, hreflang, y Schema.org (JSON-LD) para https://clerigo.io/
 */

const SITE_CONFIG = {
  siteName: "Clérigo",
  siteUrl: "https://clerigo.io",
  appUrl: "https://app.clerigo.io",
  defaultLocale: "es_ES",
  locales: {
    es: { code: "es_ES", lang: "es", label: "Español" },
    en: { code: "en_US", lang: "en", label: "English" }
  },
  themeColor: "#0E0E0E",
  defaultImage: "https://clerigo.io/public/og/clerigo-og.png",
  defaultImageAlt: "Clérigo - Plataforma Integral de Gobernanza, Riesgo y Cumplimiento (GRC) con IA",
  imageWidth: 1200,
  imageHeight: 630,
  imageType: "image/png",
  twitter: {
    card: "summary_large_image",
    site: "@clerigo_io",
    creator: "@clerigo_io"
  },
  socialProfiles: [
    "https://www.linkedin.com/company/clerigo-grc",
    "https://x.com/clerigo_io",
    "https://github.com/4rch3m1r/clerigo-landing"
  ],
  organization: {
    name: "Clérigo",
    legalName: "Clérigo Technologies",
    alternateName: "Clérigo XGRC",
    url: "https://clerigo.io/",
    logo: "https://clerigo.io/favicon.png",
    email: "hello@clerigo.io",
    description: "Plataforma de Gobernanza, Riesgo y Cumplimiento (GRC) que unifica riesgos, cumplimiento normativo, auditoría interna, control interno, ciberseguridad y privacidad en un entorno inteligente.",
    areaServed: ["República Dominicana", "Latinoamérica", "Norteamérica", "España", "Global"],
    knowsAbout: [
      "Software GRC", "Plataforma GRC", "Gobierno, Riesgo y Cumplimiento",
      "Automatización del Cumplimiento", "Gestión de Riesgos Empresariales",
      "Auditoría Interna Continua", "Control Interno", "Ciberseguridad y SGSI",
      "Privacidad de Datos", "Riesgo de Terceros (TPRM)", "Continuidad del Negocio (BCP/DRP)",
      "ISO 27001", "ISO 27701", "ISO 9001", "ISO 22301", "ISO 31000", "ISO 37301", "ISO 37001", "ISO 42001",
      "SOC 2 Type II", "NIST CSF", "NIST 800-53", "NIST Privacy", "GDPR", "HIPAA", "PCI-DSS",
      "Regulaciones SIMV", "Superintendencia de Bancos", "Banco Central", "NORTIC"
    ]
  }
};

/**
 * Catálogo de Rutas con Metadatos Individuales
 */
const ROUTES = {
  // ── INICIO ESPAÑOL ──
  "es/index.html": {
    canonicalPath: "es/",
    lang: "es",
    locale: "es_ES",
    alternateLocale: "en_US",
    alternateEn: "https://clerigo.io/",
    alternateEs: "https://clerigo.io/es/",
    title: "Clérigo | Software GRC de Gobernanza, Riesgo y Cumplimiento",
    description: "Software GRC que unifica riesgos, cumplimiento normativo, auditoría interna, control interno, ciberseguridad y privacidad en una sola plataforma con IA.",
    keywords: "software GRC, plataforma GRC, GRC, gobierno riesgo y cumplimiento, software de cumplimiento, software de gestión de riesgos, software de auditoría, herramienta GRC, sistema de gestión integrado, SGSI, sistemas de gestión ISO, automatización del cumplimiento, GRC en la nube, software GRC multiempresa, gestión de riesgos, cumplimiento normativo, cumplimiento regulatorio, auditoría interna, control interno, gobierno corporativo, ciberseguridad, privacidad y protección de datos, continuidad del negocio, gestión documental, firma digital, riesgo de terceros, gestión de proveedores, planes de acción, ISO 27001, ISO 27701, ISO 9001, ISO 22301, ISO 31000, ISO 37301, ISO 37001, ISO 42001, ISO 30301, NIST CSF, NIST 800-53, NIST Privacy Framework, República Dominicana, Latinoamérica, SIMV, Superintendencia de Bancos, Banco Central de la República Dominicana, NORTIC",
    ogImage: "https://clerigo.io/public/og/clerigo-og.png",
    ogImageAlt: "Clérigo - Software GRC de Gobernanza, Riesgo y Cumplimiento",
    pageType: "website",
    schemaType: "WebPage",
    breadcrumbName: "Inicio"
  },

  // ── INICIO INGLÉS ──
  "index.html": {
    canonicalPath: "",
    lang: "en",
    locale: "en_US",
    alternateLocale: "es_ES",
    alternateEn: "https://clerigo.io/",
    alternateEs: "https://clerigo.io/es/",
    title: "Clérigo | Enterprise GRC & Compliance Management Software",
    description: "Enterprise GRC software unifying risk management, regulatory compliance, internal audit, internal control, cybersecurity, and data privacy in a single AI-powered platform.",
    keywords: "GRC software, GRC platform, governance risk and compliance, compliance automation, risk management software, audit management, ISO 27001 software, SOC 2 compliance, internal controls, TPRM",
    ogImage: "https://clerigo.io/public/og/clerigo-og.png",
    ogImageAlt: "Clérigo - Enterprise Governance, Risk and Compliance (GRC) Platform",
    pageType: "website",
    schemaType: "WebPage",
    breadcrumbName: "Home"
  },

  // ── MARCOS REGULATORIOS (ES) ──
  "es/marcos.html": {
    canonicalPath: "es/marcos.html",
    lang: "es",
    locale: "es_ES",
    alternateLocale: "en_US",
    alternateEn: "https://clerigo.io/marcos.html",
    alternateEs: "https://clerigo.io/es/marcos.html",
    title: "Marcos Regulatorios y Normativos Soportados | Clérigo GRC",
    description: "23+ marcos y estándares regulatorios integrados: ISO 27001, SOC 2, HIPAA, GDPR, NIST CSF, PCI-DSS, SIMV y Superintendencia de Bancos con mapeo cruzado inteligente.",
    keywords: "marcos regulatorios, ISO 27001, SOC 2, HIPAA, GDPR, NIST CSF, PCI-DSS, SIMV, SB, normas ISO, cumplimiento normativo, mapeo cruzado",
    ogImage: "https://clerigo.io/public/og/marcos-og.png",
    ogImageAlt: "Marcos Regulatorios y Estándares de Cumplimiento - Clérigo GRC",
    pageType: "website",
    schemaType: "ItemPage",
    breadcrumbName: "Marcos Regulatorios"
  },

  // ── MARCOS REGULATORIOS (EN) ──
  "marcos.html": {
    canonicalPath: "marcos.html",
    lang: "en",
    locale: "en_US",
    alternateLocale: "es_ES",
    alternateEn: "https://clerigo.io/marcos.html",
    alternateEs: "https://clerigo.io/es/marcos.html",
    title: "Supported Compliance Frameworks & Standards | Clérigo GRC",
    description: "23+ integrated regulatory standards: ISO 27001, SOC 2, HIPAA, GDPR, NIST CSF, PCI-DSS, and financial regulations with automated cross-mapping.",
    keywords: "compliance frameworks, ISO 27001, SOC 2, HIPAA, GDPR, NIST CSF, PCI-DSS, regulatory compliance, cross-mapping controls",
    ogImage: "https://clerigo.io/public/og/marcos-og.png",
    ogImageAlt: "Compliance Frameworks and Standards - Clérigo GRC",
    pageType: "website",
    schemaType: "ItemPage",
    breadcrumbName: "Frameworks"
  },

  // ── PRECIOS Y PLANES (ES) ──
  "es/precios.html": {
    canonicalPath: "es/precios.html",
    lang: "es",
    locale: "es_ES",
    alternateLocale: "en_US",
    alternateEn: "https://clerigo.io/precios.html",
    alternateEs: "https://clerigo.io/es/precios.html",
    title: "Planes y Precios Transparentes | Clérigo GRC",
    description: "Inversión flexible desde $20/usuario/mes. Elige y activa únicamente los módulos y marcos que tu empresa necesita sin cargos ocultos.",
    keywords: "precios GRC, planes GRC, costo software GRC, suscripción GRC, software auditoria precio, pricing",
    ogImage: "https://clerigo.io/public/og/precios-og.png",
    ogImageAlt: "Planes y Precios Clérigo GRC",
    pageType: "website",
    schemaType: "ItemPage",
    breadcrumbName: "Precios"
  },

  // ── PRECIOS Y PLANES (EN) ──
  "precios.html": {
    canonicalPath: "precios.html",
    lang: "en",
    locale: "en_US",
    alternateLocale: "es_ES",
    alternateEn: "https://clerigo.io/precios.html",
    alternateEs: "https://clerigo.io/es/precios.html",
    title: "Transparent Plans & Pricing | Clérigo GRC",
    description: "Flexible GRC pricing from $20/user/month. Activate only the modules and frameworks your team needs with no hidden fees.",
    keywords: "GRC pricing, GRC cost, risk management software price, compliance software plans",
    ogImage: "https://clerigo.io/public/og/precios-og.png",
    ogImageAlt: "Clérigo GRC Pricing & Plans",
    pageType: "website",
    schemaType: "ItemPage",
    breadcrumbName: "Pricing"
  },

  // ── CENTRO DE CONFIANZA Y SEGURIDAD (ES) ──
  "es/confianza.html": {
    canonicalPath: "es/confianza.html",
    lang: "es",
    locale: "es_ES",
    alternateLocale: "en_US",
    alternateEn: "https://clerigo.io/confianza.html",
    alternateEs: "https://clerigo.io/es/confianza.html",
    title: "Centro de Confianza, Seguridad y Privacidad | Clérigo GRC",
    description: "Conoce nuestra arquitectura de seguridad: cifrado AES-256 en reposo y tránsito, Zero Trust, alta disponibilidad del 99.9% y soberanía de datos.",
    keywords: "centro de confianza, seguridad de la información, cifrado AES-256, privacidad de datos, seguridad en la nube, Zero Trust",
    ogImage: "https://clerigo.io/public/og/confianza-og.png",
    ogImageAlt: "Centro de Confianza y Seguridad - Clérigo",
    pageType: "website",
    schemaType: "ItemPage",
    breadcrumbName: "Centro de Confianza"
  },

  // ── CENTRO DE CONFIANZA Y SEGURIDAD (EN) ──
  "confianza.html": {
    canonicalPath: "confianza.html",
    lang: "en",
    locale: "en_US",
    alternateLocale: "es_ES",
    alternateEn: "https://clerigo.io/confianza.html",
    alternateEs: "https://clerigo.io/es/confianza.html",
    title: "Trust Center, Security & Privacy | Clérigo GRC",
    description: "Explore our enterprise security posture: AES-256 encryption at rest and in transit, Zero Trust architecture, 99.9% uptime SLA, and data residency.",
    keywords: "trust center, security posture, AES-256 encryption, data privacy, cloud compliance, Zero Trust",
    ogImage: "https://clerigo.io/public/og/confianza-og.png",
    ogImageAlt: "Clérigo Trust and Security Center",
    pageType: "website",
    schemaType: "ItemPage",
    breadcrumbName: "Trust Center"
  },

  // ── CONTACTO Y DEMO (ES) ──
  "es/contacto.html": {
    canonicalPath: "es/contacto.html",
    lang: "es",
    locale: "es_ES",
    alternateLocale: "en_US",
    alternateEn: "https://clerigo.io/contacto.html",
    alternateEs: "https://clerigo.io/es/contacto.html",
    title: "Solicita una Demo o Contacta a Nuestros Expertos | Clérigo GRC",
    description: "Agenda una sesión personalizada de 20 minutos con nuestros especialistas y descubre cómo modernizar tu gestión de riesgos y auditoría.",
    keywords: "contacto GRC, solicitar demo GRC, asesoría GRC, agendar demostración, consulta compliance",
    ogImage: "https://clerigo.io/public/og/contacto-og.png",
    ogImageAlt: "Contacto y Solicitud de Demostración - Clérigo GRC",
    pageType: "website",
    schemaType: "ContactPage",
    breadcrumbName: "Contacto"
  },

  // ── CONTACTO Y DEMO (EN) ──
  "contacto.html": {
    canonicalPath: "contacto.html",
    lang: "en",
    locale: "en_US",
    alternateLocale: "es_ES",
    alternateEn: "https://clerigo.io/contacto.html",
    alternateEs: "https://clerigo.io/es/contacto.html",
    title: "Request a Demo & Contact GRC Specialists | Clérigo",
    description: "Schedule a personalized 20-minute product tour with our compliance experts and see how Clérigo streamlines risk and audit workflows.",
    keywords: "contact GRC, book GRC demo, compliance demo, schedule meeting, risk consultation",
    ogImage: "https://clerigo.io/public/og/contacto-og.png",
    ogImageAlt: "Contact and Request a Demo - Clérigo GRC",
    pageType: "website",
    schemaType: "ContactPage",
    breadcrumbName: "Contact"
  },

  // ── PARTNERS (ES) ──
  "es/partners.html": {
    canonicalPath: "es/partners.html",
    lang: "es",
    locale: "es_ES",
    alternateLocale: "en_US",
    alternateEn: "https://clerigo.io/partners.html",
    alternateEs: "https://clerigo.io/es/partners.html",
    title: "Programa Global de Partners y Consultores | Clérigo GRC",
    description: "Únete al programa de socios de Clérigo para consultoras, auditores y firmas de ciberseguridad. Revenue share, portal de partner y certificaciones.",
    keywords: "programa de partners, socios GRC, consultores compliance, alianzas de auditoría, partner GRC",
    ogImage: "https://clerigo.io/public/og/partners-og.png",
    ogImageAlt: "Programa de Partners - Clérigo GRC",
    pageType: "website",
    schemaType: "ItemPage",
    breadcrumbName: "Partners"
  },

  // ── PARTNERS (EN) ──
  "partners.html": {
    canonicalPath: "partners.html",
    lang: "en",
    locale: "en_US",
    alternateLocale: "es_ES",
    alternateEn: "https://clerigo.io/partners.html",
    alternateEs: "https://clerigo.io/es/partners.html",
    title: "Global Partner Program for Advisory & Audit Firms | Clérigo",
    description: "Empower your consulting practice with Clérigo GRC. Dedicated partner portal, revenue share, co-marketing, and official certifications.",
    keywords: "partner program, GRC partners, consulting alliance, audit firm partnership",
    ogImage: "https://clerigo.io/public/og/partners-og.png",
    ogImageAlt: "Global Partner Program - Clérigo GRC",
    pageType: "website",
    schemaType: "ItemPage",
    breadcrumbName: "Partners"
  },

  // ── LEGAL (ES) ──
  "es/legal.html": {
    canonicalPath: "es/legal.html",
    lang: "es",
    locale: "es_ES",
    alternateLocale: "en_US",
    alternateEn: "https://clerigo.io/legal.html",
    alternateEs: "https://clerigo.io/es/legal.html",
    title: "Términos del Servicio y Aviso Legal | Clérigo GRC",
    description: "Condiciones contractuales, política de privacidad, tratamiento de datos y compromisos de nivel de servicio (SLA) de Clérigo.",
    keywords: "términos de servicio, aviso legal, privacidad, SLA, DPA, política de cookies",
    ogImage: "https://clerigo.io/public/og/legal-og.png",
    ogImageAlt: "Términos del Servicio y Legal - Clérigo",
    pageType: "website",
    schemaType: "ItemPage",
    breadcrumbName: "Legal"
  },

  // ── LEGAL (EN) ──
  "legal.html": {
    canonicalPath: "legal.html",
    lang: "en",
    locale: "en_US",
    alternateLocale: "es_ES",
    alternateEn: "https://clerigo.io/legal.html",
    alternateEs: "https://clerigo.io/es/legal.html",
    title: "Terms of Service & Privacy Policy | Clérigo GRC",
    description: "Legal terms, user agreements, data processing addendum (DPA), service level agreements (SLA), and privacy standards.",
    keywords: "terms of service, legal notice, privacy policy, SLA, DPA, data protection",
    ogImage: "https://clerigo.io/public/og/legal-og.png",
    ogImageAlt: "Terms of Service and Legal - Clérigo",
    pageType: "website",
    schemaType: "ItemPage",
    breadcrumbName: "Legal"
  },

  // ── MODO OSCURO (ES / EN) ──
  "es/oscuro.html": {
    canonicalPath: "es/oscuro.html",
    lang: "es",
    locale: "es_ES",
    alternateLocale: "en_US",
    alternateEn: "https://clerigo.io/oscuro.html",
    alternateEs: "https://clerigo.io/es/oscuro.html",
    title: "Clérigo | Software GRC (Modo Oscuro)",
    description: "Software GRC integral de Gobernanza, Riesgo y Cumplimiento.",
    ogImage: "https://clerigo.io/public/og/clerigo-og.png",
    ogImageAlt: "Clérigo GRC",
    noIndex: true
  },
  "oscuro.html": {
    canonicalPath: "oscuro.html",
    lang: "en",
    locale: "en_US",
    alternateLocale: "es_ES",
    alternateEn: "https://clerigo.io/oscuro.html",
    alternateEs: "https://clerigo.io/es/oscuro.html",
    title: "Clérigo | GRC Platform (Dark Mode)",
    description: "Enterprise Governance, Risk, and Compliance platform.",
    ogImage: "https://clerigo.io/public/og/clerigo-og.png",
    ogImageAlt: "Clérigo GRC",
    noIndex: true
  }
};

/**
 * Generador de bloque completo de etiquetas <head> para cualquier ruta
 */
function generateHeadMetaTags(fileKey, overrides = {}) {
  const route = { ...(ROUTES[fileKey] || {}), ...overrides };
  const siteUrl = SITE_CONFIG.siteUrl;
  const canonicalUrl = `${siteUrl}/${route.canonicalPath || ""}`;
  const title = route.title || SITE_CONFIG.defaultTitle;
  const description = route.description || SITE_CONFIG.defaultDescription;
  const ogImage = route.ogImage || SITE_CONFIG.defaultImage;
  const ogImageAlt = route.ogImageAlt || SITE_CONFIG.defaultImageAlt;
  const locale = route.locale || SITE_CONFIG.defaultLocale;
  const alternateLocale = route.alternateLocale || "en_US";
  const alternateEn = route.alternateEn || `${siteUrl}/`;
  const alternateEs = route.alternateEs || `${siteUrl}/es/`;
  const robots = route.noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}">`,
    route.keywords ? `<meta name="keywords" content="${route.keywords}">` : null,
    `<meta name="robots" content="${robots}">`,
    `<meta name="theme-color" content="${SITE_CONFIG.themeColor}">`,
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<link rel="alternate" hreflang="en" href="${alternateEn}">`,
    `<link rel="alternate" hreflang="es" href="${alternateEs}">`,
    `<link rel="alternate" hreflang="x-default" href="${alternateEn}">`,
    `<!-- Open Graph / Facebook / LinkedIn / WhatsApp -->`,
    `<meta property="og:type" content="${route.pageType || "website"}">`,
    `<meta property="og:site_name" content="${SITE_CONFIG.siteName}">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:image" content="${ogImage}">`,
    `<meta property="og:image:secure_url" content="${ogImage}">`,
    `<meta property="og:image:type" content="${SITE_CONFIG.imageType}">`,
    `<meta property="og:image:width" content="${SITE_CONFIG.imageWidth}">`,
    `<meta property="og:image:height" content="${SITE_CONFIG.imageHeight}">`,
    `<meta property="og:image:alt" content="${ogImageAlt}">`,
    `<meta property="og:locale" content="${locale}">`,
    `<meta property="og:locale:alternate" content="${alternateLocale}">`,
    `<!-- Twitter / X Cards -->`,
    `<meta name="twitter:card" content="${SITE_CONFIG.twitter.card}">`,
    `<meta name="twitter:site" content="${SITE_CONFIG.twitter.site}">`,
    `<meta name="twitter:creator" content="${SITE_CONFIG.twitter.creator}">`,
    `<meta name="twitter:url" content="${canonicalUrl}">`,
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${description}">`,
    `<meta name="twitter:image" content="${ogImage}">`,
    `<meta name="twitter:image:alt" content="${ogImageAlt}">`,
    `<link rel="image_src" href="${ogImage}">`
  ].filter(Boolean).join("\n");

  return tags;
}

/**
 * Generador de JSON-LD estructurado completo según Schema.org con soporte de SITELINKS
 */
function generateJsonLdGraph(fileKey, overrides = {}) {
  const route = { ...(ROUTES[fileKey] || {}), ...overrides };
  const siteUrl = SITE_CONFIG.siteUrl;
  const canonicalUrl = `${siteUrl}/${route.canonicalPath || ""}`;
  const title = route.title || SITE_CONFIG.defaultTitle;
  const description = route.description || SITE_CONFIG.defaultDescription;
  const ogImage = route.ogImage || SITE_CONFIG.defaultImage;
  const lang = route.lang || "es";
  const isEs = lang === "es";

  // 1. Entidad Organización
  const orgNode = {
    "@type": "Organization",
    "@id": `${siteUrl}/#organizacion`,
    "name": SITE_CONFIG.organization.name,
    "legalName": SITE_CONFIG.organization.legalName,
    "alternateName": SITE_CONFIG.organization.alternateName,
    "url": `${siteUrl}/`,
    "logo": {
      "@type": "ImageObject",
      "url": SITE_CONFIG.organization.logo,
      "width": 160,
      "height": 160
    },
    "image": SITE_CONFIG.defaultImage,
    "email": SITE_CONFIG.organization.email,
    "description": SITE_CONFIG.organization.description,
    "sameAs": SITE_CONFIG.socialProfiles,
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "sales",
      "email": SITE_CONFIG.organization.email,
      "url": isEs ? `${siteUrl}/es/contacto.html` : `${siteUrl}/contacto.html`,
      "availableLanguage": ["Spanish", "English"]
    },
    "knowsAbout": SITE_CONFIG.organization.knowsAbout,
    "areaServed": SITE_CONFIG.organization.areaServed
  };

  // 2. Entidad WebSite con Sitelinks SearchAction
  const webSiteNode = {
    "@type": "WebSite",
    "@id": `${siteUrl}/#sitio`,
    "name": SITE_CONFIG.siteName,
    "url": `${siteUrl}/`,
    "inLanguage": lang,
    "publisher": { "@id": `${siteUrl}/#organizacion` },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/${isEs ? "es/" : ""}marcos.html?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  // 3. Entidad SoftwareApplication
  const softwareNode = {
    "@type": "SoftwareApplication",
    "@id": `${siteUrl}/#producto`,
    "name": "Clérigo XGRC",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Software GRC",
    "operatingSystem": "Navegador web (Cloud / SaaS / On-Premise)",
    "url": `${siteUrl}/`,
    "publisher": { "@id": `${siteUrl}/#organizacion` },
    "inLanguage": ["es", "en", "fr", "pt"],
    "description": "Software GRC que unifica riesgos, cumplimiento normativo, auditoría interna, control interno, ciberseguridad y privacidad en una sola plataforma con IA.",
    "offers": {
      "@type": "Offer",
      "price": "20",
      "priceCurrency": "USD",
      "url": isEs ? `${siteUrl}/es/precios.html` : `${siteUrl}/precios.html`,
      "availability": "https://schema.org/InStock",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "20",
        "priceCurrency": "USD",
        "unitText": "usuario / mes"
      }
    }
  };

  // 4. Entidad WebPage
  const webPageNode = {
    "@type": route.schemaType || "WebPage",
    "@id": `${canonicalUrl}#pagina`,
    "name": title,
    "description": description,
    "url": canonicalUrl,
    "inLanguage": lang,
    "isPartOf": { "@id": `${siteUrl}/#sitio` },
    "about": { "@id": `${siteUrl}/#producto` },
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": ogImage
    },
    "breadcrumb": { "@id": `${canonicalUrl}#migas` }
  };

  // 5. BreadcrumbList
  const breadcrumbs = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": isEs ? "Inicio" : "Home",
      "item": isEs ? `${siteUrl}/es/` : `${siteUrl}/`
    }
  ];

  if (route.breadcrumbName && route.breadcrumbName !== "Inicio" && route.breadcrumbName !== "Home") {
    breadcrumbs.push({
      "@type": "ListItem",
      "position": 2,
      "name": route.breadcrumbName,
      "item": canonicalUrl
    });
  }

  const breadcrumbNode = {
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl}#migas`,
    "itemListElement": breadcrumbs
  };

  // 6. SiteNavigationElement (Especial para SITELINKS de Google estilo ServiceNow)
  const sitelinks = [
    {
      "@type": "SiteNavigationElement",
      "@id": `${siteUrl}/#sitelink-trust-center`,
      "name": isEs ? "Centro de Confianza & Seguridad" : "Trust Center & Security",
      "description": isEs ? "Arquitectura de seguridad, cifrado AES-256, Zero Trust y soberanía de datos." : "Enterprise security posture, AES-256 encryption, Zero Trust, and compliance.",
      "url": isEs ? `${siteUrl}/es/confianza.html` : `${siteUrl}/confianza.html`
    },
    {
      "@type": "SiteNavigationElement",
      "@id": `${siteUrl}/#sitelink-login`,
      "name": isEs ? "Acceso a la Plataforma (Login)" : "Platform Login",
      "description": isEs ? "Portal de acceso seguro para usuarios corporativos y administradores GRC." : "Secure single sign-on and portal login for corporate GRC users.",
      "url": SITE_CONFIG.appUrl
    },
    {
      "@type": "SiteNavigationElement",
      "@id": `${siteUrl}/#sitelink-contact-center`,
      "name": isEs ? "Contacto & Demostración" : "Contact & Demo",
      "description": isEs ? "Solicita una sesión personalizada o contacta a nuestros especialistas GRC." : "Schedule a 20-minute product tour or reach out to sales and support.",
      "url": isEs ? `${siteUrl}/es/contacto.html` : `${siteUrl}/contacto.html`
    },
    {
      "@type": "SiteNavigationElement",
      "@id": `${siteUrl}/#sitelink-compliance-scope`,
      "name": isEs ? "Alcance Regulatorio & Marcos" : "Compliance Frameworks Scope",
      "description": isEs ? "23+ marcos normativos integrados: ISO 27001, SOC 2, HIPAA, GDPR, NIST, SIMV." : "23+ integrated standards: ISO 27001, SOC 2, HIPAA, GDPR, NIST, SIMV, and SB.",
      "url": isEs ? `${siteUrl}/es/marcos.html` : `${siteUrl}/marcos.html`
    },
    {
      "@type": "SiteNavigationElement",
      "@id": `${siteUrl}/#sitelink-pricing`,
      "name": isEs ? "Planes y Precios" : "Pricing & Plans",
      "description": isEs ? "Modelo transparente desde $20/usuario/mes para equipos de cualquier escala." : "Transparent and scalable GRC pricing from $20/user/month.",
      "url": isEs ? `${siteUrl}/es/precios.html` : `${siteUrl}/precios.html`
    }
  ];

  const graph = [orgNode, webSiteNode, softwareNode, webPageNode, breadcrumbNode, ...sitelinks];

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

module.exports = {
  SITE_CONFIG,
  ROUTES,
  generateHeadMetaTags,
  generateJsonLdGraph
};
