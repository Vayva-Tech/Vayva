/**
 * Projects Add-On
 * 
 * Portfolio project showcase with case studies
 */

import type { AddOnDefinition } from '../../types';

export const PROJECTS_ADDON: AddOnDefinition = {
  id: 'vayva.projects',
  name: 'Projects',
  description: 'Beautiful project portfolio showcase with case studies, image galleries, and detailed project breakdowns for creative professionals',
  tagline: 'Showcase your work',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'FolderOpen',
  tags: ['creative', 'portfolio', 'projects', 'case-studies', 'gallery'],
  compatibleTemplates: ['creative', 'portfolio', 'designer', 'agency'],
  mountPoints: ['hero-section', 'product-grid', 'page-sidebar'],
  previewImages: {
    thumbnail: '/addons/projects/thumbnail.png',
    screenshots: ['/addons/projects/screenshot-1.png'],
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
    installCount: 720,
    rating: 4.8,
    reviewCount: 89,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/projects', title: 'Projects' },
      { route: '/projects/[slug]', title: 'Project Details' },
      { route: '/projects/case-study/[slug]', title: 'Case Study' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'FeaturedProjects' },
      { mountPoint: 'product-grid', componentName: 'ProjectGrid' },
    ],
    apiRoutes: [
      { path: '/api/projects', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/projects/[slug]', methods: ['GET'] },
    ],
    databaseModels: ['Project', 'ProjectCategory', 'ProjectImage', 'ProjectTestimonial'],
  },
  highlights: [
    'Case studies',
    'Image galleries',
    'Project filtering',
    'Client details',
    'Results & metrics',
  ],
  installTimeEstimate: 3,
};

export const PROJECTS_MODELS = `
model Project {
  id          String   @id @default(cuid())
  storeId     String
  slug        String   @unique
  title       String
  subtitle    String?
  description String   @db.Text
  shortDescription String?
  categoryId  String?
  clientName  String?
  clientLogo  String?
  industry    String?
  projectUrl  String?
  demoUrl     String?
  githubUrl   String?
  status      ProjectStatus @default(COMPLETED)
  startDate   DateTime?
  endDate     DateTime?
  duration    String?
  team        String[]
  services    String[]
  technologies String[]
  challenge   String?  @db.Text
  solution    String?  @db.Text
  results     String?  @db.Text
  metrics     Json?    // [{label, value, unit}]
  testimonialId String?
  isFeatured  Boolean  @default(false)
  sortOrder   Int      @default(0)
  seoTitle    String?
  seoDescription String?
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([storeId, slug])
  @@index([storeId, status, isFeatured])
  @@index([categoryId])
  @@index([publishedAt])
}

model ProjectCategory {
  id          String   @id @default(cuid())
  storeId     String
  slug        String
  name        String
  description String?
  icon        String?
  color       String?
  sortOrder   Int      @default(0)
  projectCount Int    @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([storeId, slug])
}

model ProjectImage {
  id          String   @id @default(cuid())
  projectId   String
  url         String
  thumbnailUrl String?
  caption     String?
  alt         String?
  type        ImageType @default(SCREENSHOT)
  sortOrder   Int      @default(0)
  isHero      Boolean  @default(false)
  width       Int?
  height      Int?
  createdAt   DateTime @default(now())
  
  @@index([projectId, sortOrder])
  @@index([isHero])
}

model ProjectTestimonial {
  id          String   @id @default(cuid())
  projectId   String   @unique
  authorName  String
  authorTitle String?
  authorCompany String?
  authorPhoto String?
  content     String   @db.Text
  rating      Int?     // 1-5
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
}

enum ProjectStatus {
  IN_PROGRESS
  COMPLETED
  ON_HOLD
  CANCELLED
}

enum ImageType {
  SCREENSHOT
  MOCKUP
  WIREFRAME
  LOGO
  PHOTO
  VIDEO_THUMB
}
`;

export default PROJECTS_ADDON;
