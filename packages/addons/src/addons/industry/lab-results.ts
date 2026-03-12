/**
 * Lab Results Add-On
 * 
 * Secure lab result viewing and trend analysis
 */

import { AddOnDefinition } from '../../types';

export const LAB_RESULTS_ADDON: AddOnDefinition = {
  id: 'vayva.lab-results',
  name: 'Lab Results',
  description: 'Secure lab result viewing with trend analysis, comparison charts, and easy-to-understand explanations',
  tagline: 'View your lab results',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'FlaskConical',
  tags: ['healthcare', 'lab', 'results', 'tests', 'diagnostics'],
  compatibleTemplates: ['healthcare', 'clinic', 'medical', 'hospital'],
  mountPoints: ['patient-portal', 'page-sidebar'],
  previewImages: {
    thumbnail: '/addons/lab-results/thumbnail.png',
    screenshots: ['/addons/lab-results/screenshot-1.png'],
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
    installCount: 280,
    rating: 4.7,
    reviewCount: 34,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/lab-results', title: 'Lab Results' },
      { route: '/lab-results/[id]', title: 'Result Details' },
    ],
    components: [
      { mountPoint: 'patient-portal', componentName: 'LabResultsWidget' },
      { mountPoint: 'page-sidebar', componentName: 'RecentResults' },
    ],
    apiRoutes: [
      { path: '/api/lab-results', methods: ['GET'] },
      { path: '/api/lab-results/[id]', methods: ['GET'] },
    ],
    databaseModels: ['LabOrder', 'LabResult', 'LabTestItem'],
  },
  highlights: [
    'Secure viewing',
    'Trend charts',
    'Reference ranges',
    'Result explanations',
    'Download reports',
  ],
  installTimeEstimate: 3,
};

export const LAB_RESULTS_MODELS = `
model LabOrder {
  id          String   @id @default(cuid())
  storeId     String
  patientId   String
  providerId  String
  orderNumber String   @unique
  labName     String
  status      LabOrderStatus @default(ORDERED)
  orderedAt   DateTime @default(now())
  collectedAt DateTime?
  receivedAt  DateTime?
  completedAt DateTime?
  testCodes   String[]
  diagnosisCodes String[]
  notes       String?  @db.Text
  isPublished Boolean @default(false)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, patientId])
  @@index([status, completedAt])
}

model LabResult {
  id          String   @id @default(cuid())
  storeId     String
  orderId     String
  patientId   String
  testCode    String
  testName    String
  value       String
  numericValue Decimal?
  unit        String?
  referenceRangeLow Decimal?
  referenceRangeHigh Decimal?
  status      ResultStatus @default(PENDING)
  isAbnormal  Boolean  @default(false)
  abnormalFlag String?
  interpretation String? @db.Text
  method      String?
  performedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([orderId, testCode])
  @@index([patientId, status])
  @@index([isAbnormal])
}

model LabTestItem {
  id          String   @id @default(cuid())
  storeId     String
  testCode    String   @unique
  testName    String
  category    String
  description String?  @db.Text
  unit        String?
  referenceRangeLow Decimal?
  referenceRangeHigh Decimal?
  criticalLow Decimal?
  criticalHigh Decimal?
  method      String?
  preparationInstructions String? @db.Text
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([category])
  @@index([isActive])
}

enum LabOrderStatus {
  ORDERED
  COLLECTED
  RECEIVED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum ResultStatus {
  PENDING
  PRELIMINARY
  FINAL
  CORRECTED
}
`;

export default LAB_RESULTS_ADDON;
