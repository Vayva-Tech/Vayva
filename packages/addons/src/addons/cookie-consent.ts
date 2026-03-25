/**
 * Cookie Consent Add-On
 * 
 * GDPR-compliant cookie banner with customization
 */

import type { AddOnDefinition } from '../types';

export const COOKIE_CONSENT_ADDON: AddOnDefinition = {
  id: 'vayva.cookie-consent',
  name: 'Cookie Consent',
  description: 'GDPR and CCPA compliant cookie consent banner with customizable design and granular consent options',
  tagline: 'Stay compliant with cookie consent',
  version: '1.0.0',
  category: 'marketing',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'Shield',
  tags: ['cookie', 'gdpr', 'compliance', 'privacy', 'legal'],
  compatibleTemplates: ['*'],
  mountPoints: ['page-footer', 'floating-button'],
  previewImages: {
    thumbnail: '/addons/cookie-consent/thumbnail.png',
    screenshots: ['/addons/cookie-consent/screenshot-1.png'],
  },
  author: {
    name: 'Vayva',
    isOfficial: true,
    isVerified: true,
  },
  pricing: {
    type: 'free',
  },
  stats: {
    installCount: 21000,
    rating: 4.8,
    reviewCount: 1245,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    components: [
      { mountPoint: 'page-footer', componentName: 'CookieBanner' },
      { mountPoint: 'floating-button', componentName: 'CookieSettingsButton' },
    ],
    apiRoutes: [
      { path: '/api/cookie-consent', methods: ['GET', 'POST'] },
    ],
    databaseModels: ['CookieConsentRecord'],
  },
  highlights: [
    'GDPR compliant',
    'CCPA compliant',
    'Customizable design',
    'Granular consent',
    'Consent analytics',
  ],
  installTimeEstimate: 1,
};

export const COOKIE_CONSENT_MODELS = `
model CookieConsentRecord {
  id          String   @id @default(cuid())
  visitorId   String   @unique
  storeId     String
  essential   Boolean  @default(true)
  analytics   Boolean  @default(false)
  marketing   Boolean  @default(false)
  preferences Boolean  @default(false)
  thirdParty  Boolean  @default(false)
  ipAddress   String?
  userAgent   String?
  country     String?
  consentDate DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId])
  @@index([visitorId])
}
`;

export default COOKIE_CONSENT_ADDON;
