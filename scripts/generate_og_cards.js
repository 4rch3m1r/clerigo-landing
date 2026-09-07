import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const publicOgDir = path.join(rootDir, 'public', 'og');
const ogDir = path.join(rootDir, 'og');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profileBaseDir = 'C:\\Users\\jlahoz\\.gemini\\antigravity\\brain\\3c346523-e49f-4f7e-a790-0b42d4e63497\\scratch\\edge_profiles';

if (!fs.existsSync(publicOgDir)) fs.mkdirSync(publicOgDir, { recursive: true });
if (!fs.existsSync(ogDir)) fs.mkdirSync(ogDir, { recursive: true });
if (!fs.existsSync(profileBaseDir)) fs.mkdirSync(profileBaseDir, { recursive: true });

// Read logo base64
const faviconPath = path.join(rootDir, 'favicon.png');
let logoBase64 = '';
if (fs.existsSync(faviconPath)) {
  logoBase64 = `data:image/png;base64,${fs.readFileSync(faviconPath).toString('base64')}`;
}

const CARDS = [
  {
    names: ['clerigo-og.png', 'og.png'],
    badge: 'XGRC PLATFORM',
    tagline: 'Enterprise Technology Innovation & AI-Powered GRC Platform',
    location: 'United States • Global Compliance Engine',
    statusText: 'CONTINUOUS AUDIT ENGINE ACTIVE',
    headline: 'Managing GRC Doesn\'t Have to Be <span class="red-text">Complicated.</span>',
    subhead: 'Automate audits, assess risks in real-time, and streamline compliance across 23+ global frameworks with generative AI.',
    chips: [
      { text: 'ISO 27001' },
      { text: 'SOC 2 Type II' },
      { text: 'HIPAA & GDPR' },
      { text: 'NIST CSF 2.0' },
      { text: 'PCI-DSS 4.0' }
    ],
    uiCard: {
      title: 'Continuous Compliance Health',
      subtitle: 'Real-Time Evidence Telemetry',
      score: '99.4%',
      rows: [
        { icon: 'ISO', iconColor: '#FF5544', iconBg: 'rgba(235, 16, 0, 0.14)', name: 'ISO/IEC 27001:2022', sub: '93 Controls Monitored', tag: '100% PASS', tagClass: 'tag-green' },
        { icon: 'SOC', iconColor: '#38BDF8', iconBg: 'rgba(56, 189, 248, 0.14)', name: 'SOC 2 Type II', sub: 'Continuous Evidence Stream', tag: 'VERIFIED', tagClass: 'tag-blue' }
      ],
      aiText: '<strong>AI Risk Agent:</strong> 0 critical vulnerabilities. Real-time audit package ready.'
    },
    stripItems: ['Enterprise Technology', 'SaaS & Cloud Platforms', 'AI Agents as a Service', 'Cybersecurity', 'Automation'],
    footerSec: 'AES-256 • SLA 99.9% • Zero Trust'
  },
  {
    names: ['marcos-og.png', 'og-marcos.png', 'frameworks-og.png'],
    badge: 'FRAMEWORK MATRIX',
    tagline: 'Multi-Framework Regulatory Catalog & Automated Cross-Mapping',
    location: 'Global Regulatory Standards • 23+ Frameworks',
    statusText: '23+ FRAMEWORKS INTEGRATED',
    headline: 'Multi-Framework <span class="red-text">Automated Compliance.</span>',
    subhead: 'ISO 27001, SOC 2, HIPAA, GDPR, PCI-DSS, NIST, SB, SIMV and international standards mapped with zero duplicate effort.',
    chips: [
      { text: 'ISO 27001:2022' },
      { text: 'SOC 2 Type II' },
      { text: 'HIPAA Security' },
      { text: 'GDPR / Privacy' },
      { text: 'NIST CSF 2.0' },
      { text: 'PCI-DSS 4.0' }
    ],
    uiCard: {
      title: 'Active Framework Coverage',
      subtitle: 'Intelligent Control Mapping',
      score: '23+',
      rows: [
        { icon: 'ISO', iconColor: '#FF5544', iconBg: 'rgba(235, 16, 0, 0.14)', name: 'ISO 27001:2022', sub: 'ISMS & Annex A Controls', tag: 'ACTIVE', tagClass: 'tag-green' },
        { icon: 'SOC', iconColor: '#38BDF8', iconBg: 'rgba(56, 189, 248, 0.14)', name: 'SOC 2 Trust Services', sub: 'Security, Privacy, Confidentiality', tag: 'MAPPED', tagClass: 'tag-blue' }
      ],
      aiText: '<strong>Cross-Map AI:</strong> 1 control satisfies requirements across 4 different frameworks.'
    },
    stripItems: ['Cross-Standard Mapping', 'Automated Testing', 'Custom Framework Builder', 'Regulatory Feed'],
    footerSec: 'ISO 27001 • SOC 2 • NIST CSF'
  },
  {
    names: ['precios-og.png', 'og-precios.png'],
    badge: 'TRANSPARENT PRICING',
    tagline: 'Modular Investment Plans for Startups & Global Enterprises',
    location: 'Flexible Cloud & Dedicated On-Premise',
    statusText: 'PLANS FROM $20 / USER / MO',
    headline: 'Transparent Pricing for <span class="red-text">Teams of Any Scale.</span>',
    subhead: 'Modular plans designed for maximum agility. Activate only the modules and frameworks your team needs with zero hidden fees.',
    chips: [
      { text: 'From $20/user/mo' },
      { text: 'No Lock-in Contract' },
      { text: 'All 45+ Modules' },
      { text: 'Dedicated 24/7 Support' }
    ],
    uiCard: {
      title: 'Modular Plans & Features',
      subtitle: 'Transparent Investment',
      score: '$20',
      rows: [
        { icon: 'PRO', iconColor: '#FF5544', iconBg: 'rgba(235, 16, 0, 0.14)', name: 'Professional Plan', sub: 'Risk, Audits & Frameworks', tag: '$45/mo', tagClass: 'tag-blue' },
        { icon: 'ENT', iconColor: '#A855F7', iconBg: 'rgba(168, 85, 247, 0.14)', name: 'Enterprise Dedicated', sub: 'Unlimited Users & Custom SLA', tag: 'CUSTOM', tagClass: 'tag-green' }
      ],
      aiText: '<strong>ROI Impact:</strong> Reduce audit preparation time and consultant costs by up to 70%.'
    },
    stripItems: ['No Hidden Fees', 'Cancel Anytime', 'All Modules Included', 'Dedicated Implementation'],
    footerSec: 'Transparent • Predictable • Scalable'
  },
  {
    names: ['confianza-og.png', 'og-confianza.png', 'trustcenter-og.png'],
    badge: 'SECURITY & TRUST',
    tagline: 'Bank-Grade Security Architecture & Continuous Data Protection',
    location: 'Continuous Monitoring • 99.9% Uptime SLA',
    statusText: 'ZERO TRUST POSTURE ACTIVE',
    headline: 'Bank-Grade Security, <span class="red-text">Absolute Privacy.</span>',
    subhead: 'AES-256 encryption at rest and in transit, strict multi-tenant isolation, continuous threat monitoring, and certified compliance.',
    chips: [
      { text: 'AES-256 GCM' },
      { text: 'Zero Trust MFA' },
      { text: '99.9% Uptime SLA' },
      { text: 'SOC 2 Type II' },
      { text: 'Annual Pentest' }
    ],
    uiCard: {
      title: 'System Security Health',
      subtitle: 'Continuous Verification',
      score: '100%',
      rows: [
        { icon: 'ENC', iconColor: '#10B981', iconBg: 'rgba(16, 185, 129, 0.14)', name: 'Data Encryption', sub: 'AES-256 at Rest & TLS 1.3 in Transit', tag: 'ENFORCED', tagClass: 'tag-green' },
        { icon: 'SSO', iconColor: '#38BDF8', iconBg: 'rgba(56, 189, 248, 0.14)', name: 'Access Controls', sub: 'SAML 2.0, Okta, Azure AD & MFA', tag: 'ACTIVE', tagClass: 'tag-blue' }
      ],
      aiText: '<strong>Trust Engine:</strong> Live security posture verified continuously by independent audits.'
    },
    stripItems: ['AES-256 Encryption', 'Isolated Tenant Databases', 'Immutable Audit Logs', 'Penetration Tested'],
    footerSec: 'SOC 2 Type II • ISO 27001 • GDPR'
  },
  {
    names: ['contacto-og.png', 'og-contacto.png', 'contact-og.png'],
    badge: 'DEMO & CONSULTING',
    tagline: 'Personalized GRC Advisory & Live Platform Demonstrations',
    location: 'Global GRC Specialist Team • Fast Onboarding',
    statusText: 'SCHEDULE A LIVE DEMO',
    headline: 'Transform Your <span class="red-text">GRC Operations.</span>',
    subhead: 'Schedule a personalized live session with our compliance specialists. Discover how Clérigo automates audits, manages risk, and accelerates certifications.',
    chips: [
      { text: 'Live Guided Demo' },
      { text: 'Free Gap Assessment' },
      { text: 'Enterprise Onboarding' },
      { text: 'Immediate Setup' }
    ],
    uiCard: {
      title: 'Live Discovery Session',
      subtitle: 'Personalized Walkthrough',
      score: '30m',
      rows: [
        { icon: 'DEM', iconColor: '#FF5544', iconBg: 'rgba(235, 16, 0, 0.14)', name: 'Interactive Platform Tour', sub: 'Risk, Audit & Compliance Modules', tag: 'LIVE', tagClass: 'tag-blue' },
        { icon: 'GAP', iconColor: '#10B981', iconBg: 'rgba(16, 185, 129, 0.14)', name: 'Maturity Assessment', sub: 'ISO 27001 / SOC 2 Roadmap', tag: 'FREE', tagClass: 'tag-green' }
      ],
      aiText: '<strong>Fast Onboarding:</strong> Deploy across your enterprise in less than 48 hours.'
    },
    stripItems: ['hello@clerigo.io', '24/7 Expert Support', 'Global Implementation', 'Custom Workflows'],
    footerSec: 'Live Demo • Expert Advisory • Free Gap Analysis'
  },
  {
    names: ['partners-og.png', 'og-partners.png'],
    badge: 'PARTNER PROGRAM',
    tagline: 'Strategic Alliances for Audit, Legal & Cybersecurity Firms',
    location: 'Global Partner Ecosystem • Multi-Tenant Portal',
    statusText: 'EXPAND YOUR PRACTICE',
    headline: 'Empower Your Audit & <span class="red-text">Consulting Practice.</span>',
    subhead: 'Deliver high-margin GRC and compliance automation services to your clients using the leading multi-tenant AI GRC platform.',
    chips: [
      { text: 'Revenue Share' },
      { text: 'Official Certification' },
      { text: 'Multi-Tenant Portal' },
      { text: 'White-Label Options' }
    ],
    uiCard: {
      title: 'Partner Ecosystem Hub',
      subtitle: 'Multi-Client Management',
      score: '30%',
      rows: [
        { icon: 'CLT', iconColor: '#38BDF8', iconBg: 'rgba(56, 189, 248, 0.14)', name: 'Multi-Tenant Console', sub: 'Manage All Client Engagements', tag: 'UNIFIED', tagClass: 'tag-blue' },
        { icon: 'REV', iconColor: '#10B981', iconBg: 'rgba(16, 185, 129, 0.14)', name: 'Partner Revenue Share', sub: 'Recurring Annual Commission', tag: '30% SHARE', tagClass: 'tag-green' }
      ],
      aiText: '<strong>Partner Advantage:</strong> Reduce client audit delivery timelines by over 60% with AI.'
    },
    stripItems: ['Audit Firms', 'Cybersecurity MSPs', 'Legal & Regulatory Advisory', 'Technology Integrators'],
    footerSec: 'Revenue Share • Dedicated Support • Portal'
  },
  {
    names: ['legal-og.png', 'og-legal.png'],
    badge: 'LEGAL & PRIVACY',
    tagline: 'Terms of Service, Data Processing Agreements & Compliance',
    location: 'Contractual Data Ownership • GDPR Art. 28',
    statusText: 'GDPR & PRIVACY COMPLIANT',
    headline: 'Enterprise Terms & <span class="red-text">Data Protection.</span>',
    subhead: 'Contractual commitments to information security, global data privacy laws, standard DPA agreements, and service level guarantees.',
    chips: [
      { text: 'GDPR Article 28 DPA' },
      { text: '99.9% Uptime SLA' },
      { text: 'Privacy by Design' },
      { text: 'Data Ownership' }
    ],
    uiCard: {
      title: 'Legal & Privacy Posture',
      subtitle: 'Contractual Guarantees',
      score: 'SLA',
      rows: [
        { icon: 'DPA', iconColor: '#10B981', iconBg: 'rgba(16, 185, 129, 0.14)', name: 'Data Processing Agreement', sub: 'Standard Contractual Clauses', tag: 'SIGNED', tagClass: 'tag-green' },
        { icon: 'PRV', iconColor: '#38BDF8', iconBg: 'rgba(56, 189, 248, 0.14)', name: 'Zero Data Selling', sub: 'Strict Confidentiality Guarantee', tag: 'ENFORCED', tagClass: 'tag-blue' }
      ],
      aiText: '<strong>Privacy First:</strong> Strict multi-tenant isolation with zero unauthorized AI training.'
    },
    stripItems: ['Legal Transparency', 'Contractual SLAs', 'Global Privacy Laws', 'Data Residency Options'],
    footerSec: 'GDPR • HIPAA • Privacy by Design'
  },
  {
    names: ['security-og.png'],
    badge: 'CYBERSECURITY',
    tagline: 'Enterprise Perimeter Defense & Continuous Threat Monitoring',
    location: 'Zero-Trust Architecture • Hardware-Backed MFA',
    statusText: 'ZERO-TRUST ARCHITECTURE',
    headline: 'Continuous Security & <span class="red-text">Threat Protection.</span>',
    subhead: 'Enterprise SSO, hardware-backed MFA, role-based access control, granular audit logs, and continuous threat monitoring 24/7/365.',
    chips: [
      { text: 'SSO / SAML 2.0' },
      { text: 'MFA Enforced' },
      { text: 'Role-Based RBAC' },
      { text: 'SIEM Integration' }
    ],
    uiCard: {
      title: 'Security Operations Shield',
      subtitle: 'Zero-Trust Perimeter',
      score: '24/7',
      rows: [
        { icon: 'MFA', iconColor: '#10B981', iconBg: 'rgba(16, 185, 129, 0.14)', name: 'SSO & MFA Enforcement', sub: 'FIDO2 / WebAuthn & TOTP', tag: 'ACTIVE', tagClass: 'tag-green' },
        { icon: 'LOG', iconColor: '#38BDF8', iconBg: 'rgba(56, 189, 248, 0.14)', name: 'Granular Audit Logging', sub: 'Immutable SIEM Export & Webhooks', tag: 'STREAMING', tagClass: 'tag-blue' }
      ],
      aiText: '<strong>Security Shield:</strong> Automated anomaly detection with real-time alerting.'
    },
    stripItems: ['Zero-Trust Architecture', 'End-to-End Encryption', 'Penetration Tested', 'Granular RBAC'],
    footerSec: 'SAML 2.0 • FIDO2 • SOC 2 Type II'
  },
  {
    names: ['compliance-og.png'],
    badge: 'CONTINUOUS COMPLIANCE',
    tagline: 'Automated Control Testing & Audit Evidence Synchronization',
    location: 'Continuous Verification • Real-Time Audit Packs',
    statusText: 'REAL-TIME EVIDENCE SYNC',
    headline: 'Automate Compliance <span class="red-text">with Generative AI.</span>',
    subhead: 'Continuous control monitoring, automatic evidence collection, and AI-powered audit workflows that reduce prep time by 70%.',
    chips: [
      { text: 'Continuous Controls' },
      { text: 'Automated Evidence' },
      { text: 'Audit-Ready Packs' },
      { text: '70% Time Reduction' }
    ],
    uiCard: {
      title: 'Automated Evidence Stream',
      subtitle: 'Audit Readiness Engine',
      score: '100%',
      rows: [
        { icon: 'EVD', iconColor: '#10B981', iconBg: 'rgba(16, 185, 129, 0.14)', name: 'Continuous Evidence Sync', sub: 'Cloud, Code & HR Integrations', tag: 'AUTOMATED', tagClass: 'tag-green' },
        { icon: 'AUD', iconColor: '#38BDF8', iconBg: 'rgba(56, 189, 248, 0.14)', name: 'One-Click Audit Package', sub: 'Instant Export for Auditors', tag: 'READY', tagClass: 'tag-blue' }
      ],
      aiText: '<strong>Audit Copilot:</strong> Generate auditor-approved compliance summaries in seconds.'
    },
    stripItems: ['Continuous Evidence', 'Real-Time Controls', 'One-Click Audit Packs', 'Policy Drift Detection'],
    footerSec: 'Automated • Audit-Ready • Continuous'
  },
  {
    names: ['platform-og.png'],
    badge: 'UNIFIED PLATFORM',
    tagline: 'Comprehensive Suite for Risk, Audit, Controls & Policies',
    location: '45+ Integrated Modules • Open REST API',
    statusText: '45+ INTEGRATED MODULES',
    headline: 'Complete Governance, <span class="red-text">Risk & Compliance Suite.</span>',
    subhead: 'Risk matrices, process mapping, internal audit, document control, XSign digital signature, vendor risk, and compliance AI chatbot.',
    chips: [
      { text: '45+ GRC Modules' },
      { text: 'XSign Digital Signature' },
      { text: 'Vendor Risk VRM' },
      { text: 'AI Chatbot' }
    ],
    uiCard: {
      title: 'Platform Architecture',
      subtitle: 'Unified GRC Suite',
      score: '45+',
      rows: [
        { icon: 'RSK', iconColor: '#FF5544', iconBg: 'rgba(235, 16, 0, 0.14)', name: 'Enterprise Risk Management', sub: 'Dynamic Heatmaps & KRI Telemetry', tag: 'ACTIVE', tagClass: 'tag-green' },
        { icon: 'SIG', iconColor: '#38BDF8', iconBg: 'rgba(56, 189, 248, 0.14)', name: 'XSign Digital Signatures', sub: 'Cryptographic Document Approval', tag: 'INTEGRATED', tagClass: 'tag-blue' }
      ],
      aiText: '<strong>All-in-One:</strong> Eliminate fragmented tools and manual spreadsheets permanently.'
    },
    stripItems: ['45+ Integrated Modules', 'Open REST API', 'XSign Signatures', 'Compliance AI Chatbot'],
    footerSec: 'Enterprise GRC • Cloud • On-Premise'
  }
];

function generateHtml(card) {
  const chipsHtml = card.chips.map(c => `
    <div class="badge-chip">
      <div class="chip-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
      ${c.text}
    </div>
  `).join('');

  const rowsHtml = card.uiCard.rows.map(r => `
    <div class="card-row">
      <div class="row-l">
        <div class="row-icon" style="background: ${r.iconBg}; color: ${r.iconColor}; border: 1px solid ${r.iconBg.replace('0.14', '0.35')};">${r.icon}</div>
        <div>
          <div class="row-name">${r.name}</div>
          <div class="row-sub">${r.sub}</div>
        </div>
      </div>
      <div class="row-tag ${r.tagClass}">${r.tag}</div>
    </div>
  `).join('');

  const stripHtml = card.stripItems.map((item, idx) => `
    <span>${item}</span>
    ${idx < card.stripItems.length - 1 ? '<span class="cap-sep">|</span>' : ''}
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1200, height=630">
<title>Clerigo OG</title>
<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    width: 1200px;
    height: 630px;
    overflow: hidden;
    background-color: #0E131F;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #FFFFFF;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  /* Top Mountain Banner */
  .banner-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 240px;
    overflow: hidden;
    background: #151A26;
  }

  .banner-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .banner-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(235, 16, 0, 0.25) 0%, rgba(14, 19, 31, 0.1) 40%, #0E131F 98%);
  }

  .top-red-line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #EB1000 0%, #FF5533 50%, #EB1000 100%);
    box-shadow: 0 0 15px rgba(235, 16, 0, 0.8);
    z-index: 5;
  }

  /* Ambient Glows */
  .glow-red {
    position: absolute;
    top: 130px;
    left: 60px;
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(235, 16, 0, 0.28) 0%, rgba(235, 16, 0, 0.05) 50%, transparent 70%);
    pointer-events: none;
    z-index: 3;
  }

  .glow-right {
    position: absolute;
    top: 45%;
    right: 40px;
    transform: translateY(-50%);
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(235, 16, 0, 0.15) 0%, transparent 65%);
    pointer-events: none;
    z-index: 3;
  }

  /* Tech Grid */
  .grid-bg {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 38px 38px;
    pointer-events: none;
    z-index: 2;
  }

  /* Main Content Wrapper */
  .content {
    position: relative;
    z-index: 10;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 70px 60px 34px 60px;
  }

  /* Top Section: Avatar + Profile Info + Live Status Badge */
  .profile-section {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .avatar-block {
    display: flex;
    align-items: center;
    gap: 26px;
  }

  .avatar-wrapper {
    position: relative;
  }

  .avatar-circle {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #FF3322 0%, #EB1000 60%, #B30C00 100%);
    border: 5px solid #0E131F;
    box-shadow: 0 0 35px rgba(235, 16, 0, 0.6), 0 12px 30px rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .avatar-img {
    width: 72px;
    height: 72px;
    object-fit: contain;
    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
  }

  .qr-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #161B26;
    border: 2px solid #0E131F;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  }

  .qr-badge svg {
    width: 14px;
    height: 14px;
    fill: #CBD5E1;
  }

  .profile-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .profile-title-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .profile-name {
    font-size: 42px;
    font-weight: 900;
    letter-spacing: -1.2px;
    color: #FFFFFF;
    line-height: 1;
  }

  .profile-name span {
    color: #EB1000;
  }

  .tag-pill {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #FF5544;
    background: rgba(235, 16, 0, 0.15);
    border: 1px solid rgba(235, 16, 0, 0.35);
    padding: 4px 10px;
    border-radius: 6px;
  }

  .profile-subtitle {
    font-size: 17px;
    font-weight: 600;
    color: #94A3B8;
    letter-spacing: -0.2px;
  }

  .profile-loc {
    font-size: 13px;
    font-weight: 600;
    color: #64748B;
  }

  .live-status {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(22, 28, 42, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 8px 18px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #E2E8F0;
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    margin-bottom: 8px;
  }

  .live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10B981;
    box-shadow: 0 0 12px #10B981;
  }

  /* Mid Section: Headline + Glassmorphic Telemetry Card */
  .mid-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
    margin-top: 6px;
  }

  .hero-left {
    flex: 1;
    max-width: 610px;
  }

  .hero-h1 {
    font-size: 38px;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -1.2px;
    color: #FFFFFF;
    margin-bottom: 12px;
  }

  .hero-h1 .red-text {
    background: linear-gradient(135deg, #FF6655 0%, #EB1000 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero-p {
    font-size: 16.5px;
    line-height: 1.45;
    color: #94A3B8;
    margin-bottom: 18px;
    font-weight: 400;
  }

  .badges-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .badge-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(22, 28, 42, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #E2E8F0;
  }

  .chip-check {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chip-check svg {
    width: 8px;
    height: 8px;
    stroke: #10B981;
    stroke-width: 2.5;
    fill: none;
  }

  /* Right Dashboard Telemetry */
  .hero-right {
    width: 420px;
  }

  .card-box {
    background: rgba(18, 24, 36, 0.88);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 18px;
    padding: 18px 20px;
    box-shadow: 0 25px 50px -10px rgba(0, 0, 0, 0.85), 0 0 30px rgba(235, 16, 0, 0.15);
    backdrop-filter: blur(20px);
    position: relative;
    overflow: hidden;
  }

  .card-box::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  }

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .card-title {
    font-size: 13.5px;
    font-weight: 700;
    color: #F8FAFC;
  }

  .card-score {
    font-size: 22px;
    font-weight: 800;
    color: #10B981;
    font-family: 'Consolas', 'Segoe UI Mono', monospace;
  }

  .card-rows {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }

  .card-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    padding: 8px 12px;
    border-radius: 8px;
  }

  .row-l {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .row-icon {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    font-family: 'Consolas', 'Segoe UI Mono', monospace;
  }

  .row-name {
    font-size: 12px;
    font-weight: 600;
    color: #F1F5F9;
  }

  .row-sub {
    font-size: 10px;
    color: #64748B;
  }

  .row-tag {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    font-family: 'Consolas', 'Segoe UI Mono', monospace;
  }

  .tag-green {
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #10B981;
  }

  .tag-blue {
    background: rgba(56, 189, 248, 0.12);
    border: 1px solid rgba(56, 189, 248, 0.3);
    color: #38BDF8;
  }

  .tag-purple {
    background: rgba(168, 85, 247, 0.12);
    border: 1px solid rgba(168, 85, 247, 0.3);
    color: #C084FC;
  }

  .ai-box {
    background: linear-gradient(135deg, rgba(235, 16, 0, 0.12) 0%, rgba(20, 26, 38, 0.6) 100%);
    border: 1px solid rgba(235, 16, 0, 0.3);
    border-radius: 8px;
    padding: 8px 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ai-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #EB1000;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFF;
    font-size: 10px;
    flex-shrink: 0;
    box-shadow: 0 0 10px rgba(235, 16, 0, 0.6);
  }

  .ai-desc {
    font-size: 10px;
    color: #E2E8F0;
    line-height: 1.3;
  }

  /* Bottom Capabilities Strip */
  .capabilities-strip {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .cap-list {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11.5px;
    font-weight: 600;
    color: #94A3B8;
  }

  .cap-sep {
    color: #475569;
  }

  .cap-sec {
    font-size: 11.5px;
    font-weight: 600;
    color: #64748B;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .cap-sec span {
    color: #94A3B8;
  }

  /* Bottom Red Accent Glow */
  .bottom-accent {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #EB1000 0%, #FF5533 50%, #EB1000 100%);
    box-shadow: 0 0 20px rgba(235, 16, 0, 0.8);
  }
</style>
</head>
<body>
  <!-- Mountain Banner Background -->
  <div class="banner-container">
    <svg class="banner-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 240" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#3A4659"/>
          <stop offset="60%" stop-color="#1E2636"/>
          <stop offset="100%" stop-color="#0E131F"/>
        </linearGradient>
        <linearGradient id="mountainFar" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#55647D"/>
          <stop offset="100%" stop-color="#141B29"/>
        </linearGradient>
        <linearGradient id="mountainMid" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#3F4D63"/>
          <stop offset="100%" stop-color="#0E131F"/>
        </linearGradient>
        <linearGradient id="mountainNear" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#283244"/>
          <stop offset="100%" stop-color="#0E131F"/>
        </linearGradient>
      </defs>
      
      <!-- Sky Background -->
      <rect width="1200" height="240" fill="url(#skyGrad)"/>
      
      <!-- Far Range -->
      <polygon points="0,170 80,105 170,140 260,85 360,135 480,70 590,125 710,60 820,115 940,55 1060,110 1150,75 1200,120 1200,240 0,240" fill="url(#mountainFar)"/>
      
      <!-- Mid Mountain Peaks -->
      <polygon points="0,195 120,125 210,165 310,110 430,155 540,95 670,145 790,85 910,135 1030,90 1140,140 1200,105 1200,240 0,240" fill="url(#mountainMid)"/>
      
      <!-- Sharp Ridge Texture Lines -->
      <path d="M480,70 L510,135 L540,95 L570,145 M710,60 L740,125 L790,85 L840,150 M940,55 L980,125 L1030,90" stroke="#7A8CA8" stroke-width="1.2" fill="none" opacity="0.4"/>
      
      <!-- Near Ridge -->
      <polygon points="0,215 150,155 280,190 410,140 560,185 700,130 840,175 990,120 1120,165 1200,135 1200,240 0,240" fill="url(#mountainNear)"/>
    </svg>
    <div class="banner-overlay"></div>
    <div class="top-red-line"></div>
  </div>

  <div class="grid-bg"></div>
  <div class="glow-red"></div>
  <div class="glow-right"></div>

  <div class="content">
    <!-- Profile & Header Section -->
    <div class="profile-section">
      <div class="avatar-block">
        <div class="avatar-wrapper">
          <div class="avatar-circle">
            <img src="${logoBase64}" class="avatar-img" alt="Clérigo">
          </div>
          <div class="qr-badge">
            <svg viewBox="0 0 24 24"><path d="M3 3h8v8H3zm2 2v4h4V5zm8-2h8v8h-8zm2 2v4h4V5zM3 13h8v8H3zm2 2v4h4v-4zm13-2h3v2h-3zm-5 0h3v3h-3zm2 5h3v3h-3zm3-2h3v3h-3zm-5-3h2v2h-2zm0 3h2v2h-2z"/></svg>
          </div>
        </div>
        <div class="profile-text">
          <div class="profile-title-row">
            <div class="profile-name">Clerigo<span>.io</span></div>
            <div class="tag-pill">${card.badge}</div>
          </div>
          <div class="profile-subtitle">${card.tagline}</div>
          <div class="profile-loc">${card.location}</div>
        </div>
      </div>

      <div class="live-status">
        <div class="live-dot"></div>
        ${card.statusText}
      </div>
    </div>

    <!-- Mid Section: Hero + Live Telemetry -->
    <div class="mid-section">
      <div class="hero-left">
        <div class="hero-h1">
          ${card.headline}
        </div>
        <div class="hero-p">
          ${card.subhead}
        </div>
        <div class="badges-wrap">
          ${chipsHtml}
        </div>
      </div>

      <div class="hero-right">
        <div class="card-box">
          <div class="card-head">
            <div>
              <div class="card-title">${card.uiCard.title}</div>
              <div style="font-size: 10px; color: #94A3B8;">${card.uiCard.subtitle}</div>
            </div>
            <div class="card-score">${card.uiCard.score}</div>
          </div>

          <div class="card-rows">
            ${rowsHtml}
          </div>

          <div class="ai-box">
            <div class="ai-dot">⚡</div>
            <div class="ai-desc">
              ${card.uiCard.aiText}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Capabilities Strip -->
    <div class="capabilities-strip">
      <div class="cap-list">
        ${stripHtml}
      </div>
      <div class="cap-sec">
        ${card.footerSec}
      </div>
    </div>
  </div>

  <div class="bottom-accent"></div>
</body>
</html>`;
}

console.log('Generating high-resolution Open Graph social cards (1200x630)...');

for (let i = 0; i < CARDS.length; i++) {
  const card = CARDS[i];
  const cardSlug = card.names[0].replace('.png', '');
  const tempHtmlPath = path.join(rootDir, `scratch_og_${cardSlug}.html`);
  const tempPngPath = path.join(rootDir, `scratch_og_${cardSlug}.png`);
  const cardProfileDir = path.join(profileBaseDir, `prof_${i}`);

  if (!fs.existsSync(cardProfileDir)) fs.mkdirSync(cardProfileDir, { recursive: true });

  const html = generateHtml(card);
  fs.writeFileSync(tempHtmlPath, html, 'utf8');

  // Fast isolated headless edge invocation with dedicated per-card user-data-dir
  const cmd = `"${edgePath}" --headless=new --disable-gpu --user-data-dir="${cardProfileDir}" --window-size=1200,630 --hide-scrollbars --screenshot="${tempPngPath}" "file:///${tempHtmlPath.replace(/\\\\/g, '/')}"`;
  
  try {
    execSync(cmd, { stdio: 'pipe' });
  } catch (e) {
    console.error(`Error rendering card ${cardSlug}:`, e.message);
  }

  if (fs.existsSync(tempPngPath)) {
    const pngBuffer = fs.readFileSync(tempPngPath);
    const sizeKb = Math.round(pngBuffer.length / 1024);

    for (const name of card.names) {
      // 1. In public/og/
      fs.writeFileSync(path.join(publicOgDir, name), pngBuffer);
      // 2. In og/
      fs.writeFileSync(path.join(ogDir, name), pngBuffer);
      // 3. In root if relevant
      if (name.startsWith('og') || name === 'clerigo-og.png') {
        fs.writeFileSync(path.join(rootDir, name), pngBuffer);
      }

      console.log(`  [OK] ${name} -> 1200x630 (${sizeKb} KB)`);
    }

    fs.unlinkSync(tempPngPath);
  }
  if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
}

console.log('All Open Graph cards generated successfully!');
