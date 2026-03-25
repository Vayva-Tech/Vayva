/**
 * Resume Add-On
 * 
 * Digital resume with experience and education timeline
 */

import type { AddOnDefinition } from '../../types';

export const RESUME_ADDON: AddOnDefinition = {
  id: 'vayva.resume',
  name: 'Resume',
  description: 'Professional digital resume builder with interactive timeline, experience tracking, education history, and PDF export',
  tagline: 'Your professional story',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'FileText',
  tags: ['creative', 'resume', 'cv', 'experience', 'professional'],
  compatibleTemplates: ['creative', 'portfolio', 'designer', 'developer', 'freelancer'],
  mountPoints: ['hero-section', 'page-sidebar'],
  previewImages: {
    thumbnail: '/addons/resume/thumbnail.png',
    screenshots: ['/addons/resume/screenshot-1.png'],
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
    rating: 4.7,
    reviewCount: 64,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/resume', title: 'Resume' },
      { route: '/resume/experience', title: 'Experience' },
      { route: '/resume/education', title: 'Education' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'ResumeSummary' },
      { mountPoint: 'page-sidebar', componentName: 'DownloadResume' },
    ],
    apiRoutes: [
      { path: '/api/resume', methods: ['GET', 'PUT'] },
      { path: '/api/resume/pdf', methods: ['GET'] },
    ],
    databaseModels: ['ResumeProfile', 'Experience', 'Education', 'Certification'],
  },
  highlights: [
    'Interactive timeline',
    'PDF export',
    'Experience tracker',
    'Education history',
    'Skills matrix',
  ],
  installTimeEstimate: 3,
};

export const RESUME_MODELS = `
model ResumeProfile {
  id          String   @id @default(cuid())
  storeId     String
  fullName    String
  title       String?
  tagline     String?
  summary     String?  @db.Text
  email       String?
  phone       String?
  website     String?
  location    String?
  linkedinUrl String?
  githubUrl   String?
  twitterUrl  String?
  avatarUrl   String?
  resumeUrl   String?
  yearsExperience Int?
  availability String? // FULL_TIME, PART_TIME, CONTRACT, etc
  hourlyRate  Decimal?
  languages   Json?    // [{language, proficiency}]
  interests   String[]
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([storeId])
}

model Experience {
  id          String   @id @default(cuid())
  storeId     String
  companyName String
  companyLogo String?
  companyUrl  String?
  title       String
  location    String?
  startDate   DateTime
  endDate     DateTime?
  isCurrent   Boolean  @default(false)
  description String?  @db.Text
  achievements String[]
  technologies String[]
  sortOrder   Int      @default(0)
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, isPublished, startDate])
  @@index([isCurrent])
}

model Education {
  id          String   @id @default(cuid())
  storeId     String
  institution String
  institutionLogo String?
  degree      String
  fieldOfStudy String?
  location    String?
  startDate   DateTime
  endDate     DateTime?
  isCurrent   Boolean  @default(false)
  gpa         String?
  description String?  @db.Text
  achievements String[]
  sortOrder   Int      @default(0)
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, isPublished, endDate])
}

model Certification {
  id          String   @id @default(cuid())
  storeId     String
  name        String
  organization String
  credentialId String?
  credentialUrl String?
  issueDate   DateTime
  expiryDate  DateTime?
  doesExpire  Boolean  @default(false)
  logoUrl     String?
  description String?
  sortOrder   Int      @default(0)
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, isPublished, issueDate])
}
`;

export default RESUME_ADDON;
