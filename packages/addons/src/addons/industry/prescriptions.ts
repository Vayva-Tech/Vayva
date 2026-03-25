/**
 * Prescriptions Add-On
 * 
 * Digital prescription management and pharmacy integration
 */

import type { AddOnDefinition } from '../../types';

export const PRESCRIPTIONS_ADDON: AddOnDefinition = {
  id: 'vayva.prescriptions',
  name: 'Digital Prescriptions',
  description: 'Electronic prescription management with pharmacy integration, refill requests, and medication reminders',
  tagline: 'Manage prescriptions digitally',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'Pill',
  tags: ['healthcare', 'prescriptions', 'pharmacy', 'medication', 'digital'],
  compatibleTemplates: ['healthcare', 'clinic', 'medical', 'hospital', 'pharmacy'],
  mountPoints: ['patient-portal', 'page-sidebar', 'floating-button'],
  previewImages: {
    thumbnail: '/addons/prescriptions/thumbnail.png',
    screenshots: ['/addons/prescriptions/screenshot-1.png'],
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
    installCount: 340,
    rating: 4.8,
    reviewCount: 48,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/prescriptions', title: 'My Prescriptions' },
      { route: '/prescriptions/request-refill', title: 'Request Refill' },
    ],
    components: [
      { mountPoint: 'patient-portal', componentName: 'PrescriptionList' },
      { mountPoint: 'floating-button', componentName: 'QuickRefill' },
    ],
    apiRoutes: [
      { path: '/api/prescriptions', methods: ['GET', 'POST'] },
      { path: '/api/prescriptions/refill', methods: ['POST'] },
    ],
    databaseModels: ['Prescription', 'PrescriptionItem', 'RefillRequest'],
  },
  highlights: [
    'Digital Rx management',
    'Pharmacy integration',
    'Refill requests',
    'Medication reminders',
    'Dosage tracking',
  ],
  installTimeEstimate: 4,
};

export const PRESCRIPTIONS_MODELS = `
model Prescription {
  id          String   @id @default(cuid())
  storeId     String
  patientId   String
  providerId  String
  prescriptionNumber String @unique
  status      PrescriptionStatus @default(ACTIVE)
  diagnosis   String?
  notes       String?  @db.Text
  pharmacyId  String?
  pharmacyName String?
  sentToPharmacyAt DateTime?
  filledAt    DateTime?
  pickedUpAt  DateTime?
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, patientId])
  @@index([providerId, status])
  @@index([prescriptionNumber])
}

model PrescriptionItem {
  id          String   @id @default(cuid())
  prescriptionId String
  medicationName String
  genericName String?
  dosage      String
  frequency   String
  duration    String?
  quantity    Int
  refillsAllowed Int     @default(0)
  refillsRemaining Int   @default(0)
  instructions String?   @db.Text
  isControlled Boolean @default(false)
  ndcCode     String?
  createdAt   DateTime @default(now())
  
  @@index([prescriptionId])
}

model RefillRequest {
  id          String   @id @default(cuid())
  storeId     String
  prescriptionId String
  patientId   String
  itemId      String
  status      RefillStatus @default(PENDING)
  requestedAt DateTime @default(now())
  approvedAt  DateTime?
  approvedBy  String?
  deniedAt    DateTime?
  denialReason String?
  pickupDate  DateTime?
  pharmacyId  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([prescriptionId, status])
  @@index([patientId, requestedAt])
}

enum PrescriptionStatus {
  ACTIVE
  COMPLETED
  EXPIRED
  CANCELLED
  ON_HOLD
}

enum RefillStatus {
  PENDING
  APPROVED
  DENIED
  FILLED
  PICKED_UP
}
`;

export default PRESCRIPTIONS_ADDON;
