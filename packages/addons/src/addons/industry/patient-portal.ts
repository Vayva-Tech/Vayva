/**
 * Patient Portal Add-On
 * 
 * Secure patient portal for healthcare providers
 */

import { AddOnDefinition } from '../../types';

export const PATIENT_PORTAL_ADDON: AddOnDefinition = {
  id: 'vayva.patient-portal',
  name: 'Patient Portal',
  description: 'Secure patient portal for appointment history, medical records, and communication with healthcare providers',
  tagline: 'Your health, your portal',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'Shield',
  tags: ['healthcare', 'patient', 'portal', 'medical-records', 'hipaa'],
  compatibleTemplates: ['healthcare', 'clinic', 'medical', 'hospital'],
  mountPoints: ['hero-section', 'page-sidebar', 'floating-button'],
  previewImages: {
    thumbnail: '/addons/patient-portal/thumbnail.png',
    screenshots: ['/addons/patient-portal/screenshot-1.png'],
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
    installCount: 380,
    rating: 4.8,
    reviewCount: 42,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/patient-portal', title: 'Patient Portal' },
      { route: '/patient-portal/appointments', title: 'My Appointments' },
      { route: '/patient-portal/records', title: 'Medical Records' },
      { route: '/patient-portal/messages', title: 'Messages' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'PortalHero' },
      { mountPoint: 'floating-button', componentName: 'QuickPortalAccess' },
    ],
    apiRoutes: [
      { path: '/api/patient/appointments', methods: ['GET'] },
      { path: '/api/patient/records', methods: ['GET'] },
      { path: '/api/patient/messages', methods: ['GET', 'POST'] },
    ],
    databaseModels: ['PatientProfile', 'PatientAccess', 'PatientMessage'],
  },
  highlights: [
    'Secure login',
    'Appointment history',
    'Medical records access',
    'Doctor messaging',
    'HIPAA compliant',
  ],
  installTimeEstimate: 5,
};

export const PATIENT_PORTAL_MODELS = `
model PatientProfile {
  id          String   @id @default(cuid())
  storeId     String
  customerId  String   @unique
  dateOfBirth DateTime?
  bloodType   String?
  allergies   String[]
  medications String[]
  conditions  String[]
  emergencyContactName String?
  emergencyContactPhone String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, customerId])
}

model PatientAccess {
  id          String   @id @default(cuid())
  storeId     String
  customerId  String
  accessLevel AccessLevel @default(STANDARD)
  grantedAt   DateTime @default(now())
  expiresAt   DateTime?
  grantedBy   String
  revokedAt   DateTime?
  revokedReason String?
  
  @@unique([storeId, customerId])
  @@index([accessLevel])
}

model PatientMessage {
  id          String   @id @default(cuid())
  storeId     String
  customerId  String
  providerId  String
  subject     String
  content     String
  isEncrypted Boolean  @default(true)
  isRead      Boolean  @default(false)
  readAt      DateTime?
  attachments String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, customerId])
  @@index([providerId, isRead])
}

enum AccessLevel {
  STANDARD
  RESTRICTED
  FULL
}
`;

export default PATIENT_PORTAL_ADDON;
