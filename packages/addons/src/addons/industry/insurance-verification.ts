/**
 * Insurance Verification Add-On
 * 
 * Health insurance verification and coverage checking
 */

import { AddOnDefinition } from '../../types';

export const INSURANCE_VERIFICATION_ADDON: AddOnDefinition = {
  id: 'vayva.insurance-verification',
  name: 'Insurance Verification',
  description: 'Real-time health insurance verification with coverage details, copay information, and prior authorization tracking',
  tagline: 'Verify coverage instantly',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'CreditCard',
  tags: ['healthcare', 'insurance', 'verification', 'coverage', 'billing'],
  compatibleTemplates: ['healthcare', 'clinic', 'medical', 'hospital', 'dental'],
  mountPoints: ['checkout-summary', 'page-sidebar'],
  previewImages: {
    thumbnail: '/addons/insurance-verification/thumbnail.png',
    screenshots: ['/addons/insurance-verification/screenshot-1.png'],
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
    installCount: 290,
    rating: 4.7,
    reviewCount: 31,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/insurance/verify', title: 'Verify Insurance' },
      { route: '/insurance/coverage', title: 'Coverage Details' },
    ],
    components: [
      { mountPoint: 'checkout-summary', componentName: 'InsuranceVerifier' },
      { mountPoint: 'page-sidebar', componentName: 'CoverageInfo' },
    ],
    apiRoutes: [
      { path: '/api/insurance/verify', methods: ['POST'] },
      { path: '/api/insurance/coverage', methods: ['GET'] },
    ],
    databaseModels: ['InsurancePolicy', 'CoverageVerification'],
  },
  highlights: [
    'Real-time verification',
    'Coverage details',
    'Copay calculator',
    'Prior auth tracking',
    'Multiple insurers',
  ],
  installTimeEstimate: 4,
};

export const INSURANCE_VERIFICATION_MODELS = `
model InsurancePolicy {
  id          String   @id @default(cuid())
  storeId     String
  customerId  String
  providerName String
  policyNumber String
  groupNumber String?
  memberId    String
  policyHolderName String
  policyHolderDOB DateTime?
  relationshipToHolder String @default("SELF")
  isActive    Boolean  @default(true)
  effectiveDate DateTime?
  terminationDate DateTime?
  coverageType String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([customerId, policyNumber])
  @@index([storeId, customerId])
  @@index([providerName, isActive])
}

model CoverageVerification {
  id          String   @id @default(cuid())
  storeId     String
  policyId    String
  serviceCode String
  serviceDescription String
  isCovered   Boolean
  coveragePercent Int?
  copayAmount Decimal?
  deductibleMet Decimal?
  deductibleRemaining Decimal?
  outOfPocketMet Decimal?
  priorAuthRequired Boolean @default(false)
  priorAuthStatus String?
  priorAuthNumber String?
  verificationDate DateTime @default(now())
  verifiedBy  String
  notes       String?
  
  @@index([policyId, serviceCode])
  @@index([verificationDate])
}
`;

export default INSURANCE_VERIFICATION_ADDON;
