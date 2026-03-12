/**
 * Skills Add-On
 * 
 * Skills showcase with progress bars and endorsements
 */

import { AddOnDefinition } from '../../types';

export const SKILLS_ADDON: AddOnDefinition = {
  id: 'vayva.skills',
  name: 'Skills',
  description: 'Professional skills showcase with visual progress bars, proficiency levels, endorsements, and skill categorization',
  tagline: 'Show what you know',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'BarChart',
  tags: ['creative', 'skills', 'portfolio', 'proficiency', 'expertise'],
  compatibleTemplates: ['creative', 'portfolio', 'designer', 'developer'],
  mountPoints: ['hero-section', 'page-sidebar'],
  previewImages: {
    thumbnail: '/addons/skills/thumbnail.png',
    screenshots: ['/addons/skills/screenshot-1.png'],
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
    installCount: 580,
    rating: 4.6,
    reviewCount: 62,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/skills', title: 'Skills & Expertise' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'SkillsShowcase' },
      { mountPoint: 'page-sidebar', componentName: 'SkillsCloud' },
    ],
    apiRoutes: [
      { path: '/api/skills', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/skills/endorse', methods: ['POST'] },
    ],
    databaseModels: ['Skill', 'SkillCategory', 'SkillEndorsement'],
  },
  highlights: [
    'Progress bars',
    'Proficiency levels',
    'Endorsements',
    'Categories',
    'Visual charts',
  ],
  installTimeEstimate: 2,
};

export const SKILLS_MODELS = `
model Skill {
  id          String   @id @default(cuid())
  storeId     String
  categoryId  String?
  name        String
  slug        String
  proficiency Int      @default(50) // 0-100
  level       SkillLevel @default(INTERMEDIATE)
  yearsExperience Decimal?
  description String?
  icon        String?
  color       String?
  isFeatured  Boolean  @default(false)
  sortOrder   Int      @default(0)
  endorsementCount Int @default(0)
  projectCount Int   @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([storeId, slug])
  @@index([storeId, isActive, isFeatured])
  @@index([categoryId, proficiency])
}

model SkillCategory {
  id          String   @id @default(cuid())
  storeId     String
  slug        String
  name        String
  description String?
  icon        String?
  color       String?
  sortOrder   Int      @default(0)
  skillCount  Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([storeId, slug])
}

model SkillEndorsement {
  id          String   @id @default(cuid())
  storeId     String
  skillId     String
  endorserName String
  endorserTitle String?
  endorserCompany String?
  endorserAvatar String?
  relationship String? // COLLEAGUE, MANAGER, CLIENT, etc
  comment     String?  @db.Text
  isVerified  Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  @@index([skillId, createdAt])
  @@index([isVerified])
}

enum SkillLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
  MASTER
}
`;

export default SKILLS_ADDON;
