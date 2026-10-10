/**
 * Local SEO Utility for MedFlow Pro
 * Provides comprehensive local business metadata, geo-targeting, and Schema.org JSON-LD
 * for every page and clinical subsystem in the application.
 */

export interface PageSeoConfig {
  title: string;
  description: string;
  keywords: string;
  path: string;
  schemaType: 'MedicalWebPage' | 'AboutPage' | 'ContactPage' | 'ItemPage' | 'WebPage' | 'MedicalClinic';
  section: string;
}

export const CLINIC_LOCAL_INFO = {
  name: 'MedFlow Pro Clinic & Healthcare Center',
  legalName: 'MedFlow Healthcare Technologies Pvt. Ltd.',
  alternateName: 'MedFlow Multispecialty Clinic Bangalore',
  url: 'https://cms-pa.netlify.app',
  logo: 'https://cms-pa.netlify.app/medi-logo.jpg',
  telephone: '+91-80-4567-8900',
  emergencyPhone: '+91-98765-43210',
  email: 'care@medflowclinic.com',
  streetAddress: '#42, 100 Feet Road, HAL 2nd Stage, Indiranagar',
  addressLocality: 'Bangalore',
  addressRegion: 'Karnataka',
  postalCode: '560038',
  addressCountry: 'IN',
  latitude: 12.9716,
  longitude: 77.5946,
  areaServed: [
    'Bangalore',
    'Indiranagar',
    'Koramangala',
    'Domlur',
    'Whitefield',
    'HSR Layout',
    'Karnataka',
    'India'
  ],
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, UPI, Credit Card, Debit Card, Net Banking, Cashless Insurance TPA',
  openingHours: [
    'Mo-Sa 08:00-20:00',
    'Su 09:00-14:00'
  ],
  emergencyHours: '24/7 Emergency Triage & Admissions',
  medicalSpecialties: [
    'Cardiology',
    'General Practice',
    'Pediatrics',
    'Orthopedics',
    'Neurology',
    'Dermatology',
    'Gynecology',
    'ENT',
    'Pulmonology',
    'Psychiatry'
  ]
};

export const PAGE_LOCAL_SEO_CONFIGS: Record<string, PageSeoConfig> = {
  dashboard: {
    title: 'Hospital Dashboard & Daily OPD Patient Flow – Bangalore | MedFlow Pro',
    description: 'Real-time hospital census, OPD patient admissions, and clinical departmental analytics for MedFlow Pro Clinic in Indiranagar, Bangalore.',
    keywords: 'hospital dashboard bangalore, clinic metrics karnataka, OPD patient admissions, healthcare management system',
    path: '/',
    schemaType: 'MedicalWebPage',
    section: 'Clinical Administration'
  },
  patients: {
    title: 'Patient Directory & Electronic Health Records (EHR) – Bangalore | MedFlow Pro',
    description: 'Secure digital patient directory, longitudinal medical histories, and triage registration at MedFlow Pro Healthcare Center, Bangalore.',
    keywords: 'patient health records bangalore, EHR software karnataka, digital patient intake, clinic directory',
    path: '/patients',
    schemaType: 'MedicalWebPage',
    section: 'Patient Records'
  },
  appointments: {
    title: 'Book Doctor Consultation & Specialist Appointments – Bangalore | MedFlow Pro',
    description: 'Schedule in-clinic and follow-up doctor appointments with top physicians and specialists at MedFlow Pro Clinic, Indiranagar, Bangalore.',
    keywords: 'book doctor appointment bangalore, doctor consultation indiranagar, specialist clinic booking karnataka, outpatient scheduling',
    path: '/appointments',
    schemaType: 'MedicalWebPage',
    section: 'Appointments & Scheduling'
  },
  queue: {
    title: 'Live OPD Queue Tracker & Real-Time Token Calling – Bangalore | MedFlow Pro',
    description: 'Strict FIFO live patient queue management, automated token triage, and waiting room tracker at MedFlow Pro Clinic, Bangalore.',
    keywords: 'live clinic queue bangalore, OPD token system, hospital waiting room display, triage calling system',
    path: '/queue',
    schemaType: 'MedicalWebPage',
    section: 'OPD Queue Management'
  },
  doctors: {
    title: 'Multi-Specialty Doctors & Physicians Directory – Bangalore | MedFlow Pro',
    description: 'Meet verified cardiologists, pediatricians, orthopedists, and general physicians available for consultation at MedFlow Pro Clinic, Bangalore.',
    keywords: 'doctors in bangalore, cardiologists indiranagar, pediatricians karnataka, specialist physicians directory',
    path: '/doctors',
    schemaType: 'MedicalWebPage',
    section: 'Medical Staff & Doctors'
  },
  records: {
    title: 'Electronic Medical Records (EMR) & Clinical Notes – Bangalore | MedFlow Pro',
    description: 'Tamper-evident clinical consultation records, diagnoses, and medical archives at MedFlow Pro Healthcare, Indiranagar, Bangalore.',
    keywords: 'EMR software bangalore, clinical notes, digital medical records karnataka, healthcare archive',
    path: '/records',
    schemaType: 'MedicalWebPage',
    section: 'Electronic Health Records'
  },
  prescriptions: {
    title: 'Digital E-Prescriptions & Pharmacy Dispensing – Bangalore | MedFlow Pro',
    description: 'NABH-compliant electronic prescriptions with drug dosage verification and in-house pharmacy dispensing at MedFlow Pro Clinic, Bangalore.',
    keywords: 'e-prescriptions bangalore, pharmacy dispensing karnataka, digital prescription software, medicine dosage guide',
    path: '/prescriptions',
    schemaType: 'MedicalWebPage',
    section: 'Prescriptions & Pharmacy'
  },
  billing: {
    title: 'Cashless Medical Billing, Invoicing & GST Claims – Bangalore | MedFlow Pro',
    description: 'Transparent INR itemized clinical billing, TPA insurance claim processing, and instant GST invoices at MedFlow Pro Clinic, Bangalore.',
    keywords: 'medical billing bangalore, cashless clinic insurance, GST hospital invoice, outpatient billing karnataka',
    path: '/billing',
    schemaType: 'MedicalWebPage',
    section: 'Billing & Invoicing'
  },
  payments: {
    title: 'Healthcare Payment Gateway & UPI Settlement – Bangalore | MedFlow Pro',
    description: 'Secure multi-mode payments via UPI, credit/debit cards, and cashless receipts at MedFlow Pro Healthcare Center, Bangalore.',
    keywords: 'clinic payment gateway bangalore, hospital UPI payments, cashless medical settlement, payment receipt',
    path: '/payments',
    schemaType: 'MedicalWebPage',
    section: 'Financial Transactions'
  },
  reports: {
    title: 'Clinical Admission Reports & Financial Revenue Audits – Bangalore | MedFlow Pro',
    description: 'Comprehensive hospital analytics, patient admission trends, and departmental revenue audits for MedFlow Pro Clinic, Bangalore.',
    keywords: 'hospital analytics bangalore, clinic financial reports, patient census analytics karnataka',
    path: '/reports',
    schemaType: 'MedicalWebPage',
    section: 'Clinical Intelligence'
  },
  staff: {
    title: 'Medical Staff & RBAC Personnel Directory – Bangalore | MedFlow Pro',
    description: 'Institutional healthcare workforce management, role-based access control, and staff shifts at MedFlow Pro Clinic, Bangalore.',
    keywords: 'hospital staff management bangalore, clinical workforce directory, healthcare RBAC permissions',
    path: '/staff',
    schemaType: 'MedicalWebPage',
    section: 'Workforce Administration'
  },
  settings: {
    title: 'Clinic Branch Configuration & System Parameters – Bangalore | MedFlow Pro',
    description: 'Configure hospital branch parameters, clinical safety rules, and local currency settings for MedFlow Pro Clinic, Bangalore.',
    keywords: 'clinic software configuration, hospital branch settings, EHR system parameters',
    path: '/settings',
    schemaType: 'MedicalWebPage',
    section: 'System Configuration'
  },
  notifications: {
    title: 'Emergency Clinic Alerts & Hospital Broadcasts – Bangalore | MedFlow Pro',
    description: 'Critical patient alerts, triage emergencies, and scheduled appointment broadcasts at MedFlow Pro Clinic, Bangalore.',
    keywords: 'emergency hospital alerts, clinical notifications bangalore, triage broadcast',
    path: '/notifications',
    schemaType: 'MedicalWebPage',
    section: 'Alerts & Broadcasts'
  },
  about: {
    title: 'About MedFlow Pro Clinic & Healthcare Center – Indiranagar, Bangalore',
    description: 'Learn about MedFlow Pro Clinic in Indiranagar, Bangalore: NABH-aligned digital EHR, multi-specialty outpatient services, and clinical governance.',
    keywords: 'about medflow clinic bangalore, healthcare centre indiranagar, multispecialty clinic karnataka, NABH digital standards',
    path: '/about',
    schemaType: 'AboutPage',
    section: 'About MedFlow Pro'
  },
  help: {
    title: 'Patient & Clinical Help Desk, Support & FAQs – Bangalore | MedFlow Pro',
    description: 'Find answers to patient questions, appointment FAQs, clinical user guides, and 24/7 technical support for MedFlow Pro Clinic, Bangalore.',
    keywords: 'clinic help desk bangalore, doctor appointment FAQs, patient support indiranagar, hospital help centre',
    path: '/help',
    schemaType: 'ContactPage',
    section: 'Help & Support'
  },
  policies: {
    title: 'HIPAA & Patient Privacy Policies – MedFlow Pro Clinic Bangalore',
    description: 'Review our patient confidentiality safeguards, DISHA/HIPAA compliance, and terms of service at MedFlow Pro Clinic, Bangalore.',
    keywords: 'patient privacy policy bangalore, clinic HIPAA compliance, medical data security karnataka, terms of service',
    path: '/policies',
    schemaType: 'WebPage',
    section: 'Compliance & Policies'
  },
  thankyou: {
    title: 'Submission Confirmed – MedFlow Pro Healthcare Bangalore',
    description: 'Your clinical data and appointment have been successfully recorded at MedFlow Pro Healthcare Center, Bangalore.',
    keywords: 'submission successful, appointment confirmed bangalore',
    path: '/thankyou',
    schemaType: 'WebPage',
    section: 'Confirmation'
  },
  '404': {
    title: 'Page Not Found (404) – MedFlow Pro Clinic Bangalore',
    description: 'The requested clinical resource or page could not be located in the MedFlow Pro Clinic portal.',
    keywords: '404 not found, clinic portal',
    path: '/404',
    schemaType: 'WebPage',
    section: 'Error'
  },
  '500': {
    title: 'Server Error (500) – MedFlow Pro Clinic Bangalore',
    description: 'An unexpected system interruption occurred. Our clinical IT support team in Bangalore has been notified.',
    keywords: '500 server error, technical support',
    path: '/500',
    schemaType: 'WebPage',
    section: 'Error'
  }
};

/**
 * Generate Schema.org JSON-LD object for local medical business & specific page
 */
export function generateLocalSeoJsonLd(activeTab: string): object {
  const pageConfig = PAGE_LOCAL_SEO_CONFIGS[activeTab] || PAGE_LOCAL_SEO_CONFIGS.dashboard;
  const pageUrl = `${CLINIC_LOCAL_INFO.url}${pageConfig.path === '/' ? '' : pageConfig.path}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. Local Medical Clinic / Medical Business Entity
      {
        '@type': ['MedicalClinic', 'MedicalBusiness', 'LocalBusiness'],
        '@id': `${CLINIC_LOCAL_INFO.url}/#clinic`,
        'name': CLINIC_LOCAL_INFO.name,
        'legalName': CLINIC_LOCAL_INFO.legalName,
        'alternateName': CLINIC_LOCAL_INFO.alternateName,
        'url': CLINIC_LOCAL_INFO.url,
        'logo': CLINIC_LOCAL_INFO.logo,
        'image': CLINIC_LOCAL_INFO.logo,
        'telephone': CLINIC_LOCAL_INFO.telephone,
        'email': CLINIC_LOCAL_INFO.email,
        'priceRange': CLINIC_LOCAL_INFO.priceRange,
        'currenciesAccepted': CLINIC_LOCAL_INFO.currenciesAccepted,
        'paymentAccepted': CLINIC_LOCAL_INFO.paymentAccepted,
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': CLINIC_LOCAL_INFO.streetAddress,
          'addressLocality': CLINIC_LOCAL_INFO.addressLocality,
          'addressRegion': CLINIC_LOCAL_INFO.addressRegion,
          'postalCode': CLINIC_LOCAL_INFO.postalCode,
          'addressCountry': CLINIC_LOCAL_INFO.addressCountry
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': CLINIC_LOCAL_INFO.latitude,
          'longitude': CLINIC_LOCAL_INFO.longitude
        },
        'openingHoursSpecification': [
          {
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            'opens': '08:00',
            'closes': '20:00'
          },
          {
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': ['Sunday'],
            'opens': '09:00',
            'closes': '14:00'
          }
        ],
        'medicalSpecialty': CLINIC_LOCAL_INFO.medicalSpecialties,
        'areaServed': CLINIC_LOCAL_INFO.areaServed.map(area => ({
          '@type': 'AdministrativeArea',
          'name': area
        })),
        'contactPoint': [
          {
            '@type': 'ContactPoint',
            'telephone': CLINIC_LOCAL_INFO.telephone,
            'contactType': 'customer service',
            'areaServed': 'IN',
            'availableLanguage': ['English', 'Kannada', 'Hindi']
          },
          {
            '@type': 'ContactPoint',
            'telephone': CLINIC_LOCAL_INFO.emergencyPhone,
            'contactType': 'emergency',
            'areaServed': 'IN',
            'availableLanguage': ['English', 'Kannada', 'Hindi']
          }
        ]
      },

      // 2. Specific Page Entity
      {
        '@type': pageConfig.schemaType,
        '@id': pageUrl,
        'url': pageUrl,
        'name': pageConfig.title,
        'description': pageConfig.description,
        'isPartOf': {
          '@type': 'WebSite',
          '@id': `${CLINIC_LOCAL_INFO.url}/#website`,
          'name': CLINIC_LOCAL_INFO.name,
          'url': CLINIC_LOCAL_INFO.url
        },
        'inLanguage': 'en-IN',
        'breadcrumb': {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': CLINIC_LOCAL_INFO.url
            },
            ...(pageConfig.path !== '/' ? [
              {
                '@type': 'ListItem',
                'position': 2,
                'name': pageConfig.section,
                'item': pageUrl
              }
            ] : [])
          ]
        }
      }
    ]
  };
}

/**
 * Applies dynamic Local SEO meta tags, title, and Schema.org JSON-LD to document
 */
export function applyLocalSeo(activeTab: string): void {
  const config = PAGE_LOCAL_SEO_CONFIGS[activeTab] || PAGE_LOCAL_SEO_CONFIGS.dashboard;
  const pageUrl = `${CLINIC_LOCAL_INFO.url}${config.path === '/' ? '' : config.path}`;

  // 1. Page Title
  document.title = config.title;

  // 2. Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', config.description);

  // 3. Meta Keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.setAttribute('content', config.keywords);

  // 4. Canonical Link
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', pageUrl);

  // 5. OpenGraph Tags
  const ogTags: Record<string, string> = {
    'og:title': config.title,
    'og:description': config.description,
    'og:url': pageUrl,
    'og:type': 'website',
    'og:site_name': CLINIC_LOCAL_INFO.name,
    'og:locale': 'en_IN'
  };

  Object.entries(ogTags).forEach(([prop, content]) => {
    let tag = document.querySelector(`meta[property="${prop}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', prop);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  });

  // 6. Twitter Card Tags
  const twitterTags: Record<string, string> = {
    'twitter:card': 'summary_large_image',
    'twitter:title': config.title,
    'twitter:description': config.description
  };

  Object.entries(twitterTags).forEach(([name, content]) => {
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', name);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  });

  // 7. Inject Dynamic Schema.org JSON-LD Script
  let schemaScript = document.getElementById('local-seo-schema') as HTMLScriptElement | null;
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'local-seo-schema';
    schemaScript.type = 'application/ld+json';
    document.head.appendChild(schemaScript);
  }
  schemaScript.textContent = JSON.stringify(generateLocalSeoJsonLd(activeTab), null, 2);
}
