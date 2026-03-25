/**
 * Process Add-On
 * 
 * Visual workflow of the creative process
 */

import type { AddOnDefinition } from '../../types';

export const PROCESS_ADDON: AddOnDefinition = {
  id: 'vayva.process',
  name: 'Process',
  description: 'Visual showcase of your creative process with step-by-step workflow, methodology, and approach to projects',
  tagline: 'How I work',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'GitBranch',
  tags: ['creative', 'process', 'workflow', 'methodology', 'approach'],
  compatibleTemplates: ['creative', 'portfolio', 'designer', 'agency', 'freelancer'],
  mountPoints: ['hero-section', 'page-sidebar'],
  previewImages: {
    thumbnail: '/addons/process/thumbnail.png',
    screenshots: ['/addons/process/screenshot-1.png'],
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
    installCount: 420,
    rating: 4.6,
    reviewCount: 47,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/process', title: 'My Process' },
      { route: '/process/[step]', title: 'Process Step' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'ProcessOverview' },
      { mountPoint: 'page-sidebar', componentName: 'ProcessSteps' },
    ],
    apiRoutes: [
      { path: '/api/process', methods: ['GET', 'PUT'] },
    ],
    databaseModels: ['Process', 'ProcessStep', 'ProcessDeliverable'],
  },
  highlights: [
    'Visual timeline',
    'Step breakdown',
    'Deliverables list',
    'Interactive flow',
    'Client education',
  ],
  installTimeEstimate: 3,
};

export const PROCESS_MODELS = `
model Process {
  id          String   @id @default(cuid())
  storeId     String   @unique
  title       String
  subtitle    String?
  description String?  @db.Text
  methodology String?  @db.Text
  durationEstimate String? // e.g., "2-4 weeks"
  stepsCount  Int      @default(0)
  isPublished Boolean  @default(false)
  style       String   @default("timeline") // timeline, cards, flowchart
  accentColor String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ProcessStep {
  id          String   @id @default(cuid())
  processId   String
  stepNumber  Int
  title       String
  description String?  @db.Text
  details     String?  @db.Text
  duration    String? // e.g., "3-5 days"
  icon        String?
  color       String?
  imageUrl    String?
  deliverables Json?   // [{name, description}]
  clientInput String?  @db.Text
  tools       String[]
  outputs     String[]
  tips        String?  @db.Text
  faq         Json?    // [{question, answer}]
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([processId, sortOrder])
  @@index([stepNumber])
}

model ProcessDeliverable {
  id          String   @id @default(cuid())
  processId   String
  stepId      String
  name        String
  description String?
  format      String? // PDF, Figma, Code, etc
  exampleUrl  String?
  isRequired  Boolean @default(true)
  sortOrder   Int     @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([processId, stepId])
}
`;

export default PROCESS_ADDON;
