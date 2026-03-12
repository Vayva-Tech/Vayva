/**
 * Symptom Checker Add-On
 * 
 * AI-powered symptom assessment tool
 */

import { AddOnDefinition } from '../../types';

export const SYMPTOM_CHECKER_ADDON: AddOnDefinition = {
  id: 'vayva.symptom-checker',
  name: 'Symptom Checker',
  description: 'AI-powered symptom assessment tool that helps patients understand their symptoms and guides them to appropriate care',
  tagline: 'Check your symptoms instantly',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'Stethoscope',
  tags: ['healthcare', 'symptoms', 'assessment', 'triage', 'ai'],
  compatibleTemplates: ['healthcare', 'clinic', 'medical', 'hospital', 'pharmacy'],
  mountPoints: ['hero-section', 'page-sidebar', 'floating-button'],
  previewImages: {
    thumbnail: '/addons/symptom-checker/thumbnail.png',
    screenshots: ['/addons/symptom-checker/screenshot-1.png'],
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
    installCount: 520,
    rating: 4.5,
    reviewCount: 67,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/symptom-checker', title: 'Check Your Symptoms' },
      { route: '/symptom-checker/results', title: 'Assessment Results' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'SymptomCheckerWidget' },
      { mountPoint: 'floating-button', componentName: 'QuickSymptomCheck' },
    ],
    apiRoutes: [
      { path: '/api/symptoms/assess', methods: ['POST'] },
      { path: '/api/symptoms/history', methods: ['GET'] },
    ],
    databaseModels: ['SymptomAssessment', 'SymptomCondition'],
  },
  highlights: [
    'AI-powered assessment',
    'Body map selection',
    'Triage guidance',
    'Care recommendations',
    'Anonymous checking',
  ],
  installTimeEstimate: 3,
};

export const SYMPTOM_CHECKER_MODELS = `
model SymptomAssessment {
  id          String   @id @default(cuid())
  storeId     String
  sessionId   String   @unique
  customerId  String?
  symptoms    String[]
  bodyParts   String[]
  duration    String?
  severity    Int      @default(1) // 1-10
  age         Int?
  gender      String?
  conditions  String[]
  medications String[]
  aiAnalysis  String?  @db.Text
  urgencyLevel UrgencyLevel @default(LOW)
  recommendedAction String?
  disclaimerAccepted Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, sessionId])
  @@index([urgencyLevel])
}

model SymptomCondition {
  id          String   @id @default(cuid())
  storeId     String
  name        String
  description String   @db.Text
  commonSymptoms String[]
  relatedBodyParts String[]
  urgencyLevel UrgencyLevel
  recommendedAction String @db.Text
  isVerified  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, name])
  @@index([urgencyLevel])
}

enum UrgencyLevel {
  LOW
  MEDIUM
  HIGH
  EMERGENCY
}
`;

export default SYMPTOM_CHECKER_ADDON;
