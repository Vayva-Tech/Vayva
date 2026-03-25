/**
 * Hire Me Add-On
 * 
 * Booking system for hiring the creative professional
 */

import type { AddOnDefinition } from '../../types';

export const HIRE_ME_ADDON: AddOnDefinition = {
  id: 'vayva.hire-me',
  name: 'Hire Me',
  description: 'Professional booking system for client inquiries, project requests, consultation scheduling, and availability management',
  tagline: 'Get hired easily',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'Briefcase',
  tags: ['creative', 'hiring', 'booking', 'freelance', 'clients'],
  compatibleTemplates: ['creative', 'portfolio', 'designer', 'developer', 'freelancer'],
  mountPoints: ['hero-section', 'floating-button'],
  previewImages: {
    thumbnail: '/addons/hire-me/thumbnail.png',
    screenshots: ['/addons/hire-me/screenshot-1.png'],
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
    installCount: 540,
    rating: 4.8,
    reviewCount: 71,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/hire', title: 'Hire Me' },
      { route: '/hire/consultation', title: 'Book Consultation' },
      { route: '/hire/availability', title: 'Availability' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'HireCTA' },
      { mountPoint: 'floating-button', componentName: 'QuickHireButton' },
    ],
    apiRoutes: [
      { path: '/api/hire/inquiry', methods: ['POST'] },
      { path: '/api/hire/availability', methods: ['GET'] },
      { path: '/api/hire/consultation', methods: ['POST'] },
    ],
    databaseModels: ['HireInquiry', 'ConsultationSlot', 'ServiceOffering'],
  },
  highlights: [
    'Project inquiry form',
    'Consultation booking',
    'Availability calendar',
    'Service packages',
    'Auto-responses',
  ],
  installTimeEstimate: 4,
};

export const HIRE_ME_MODELS = `
model HireInquiry {
  id          String   @id @default(cuid())
  storeId     String
  clientName  String
  clientEmail String
  clientCompany String?
  projectType String   // WEBSITE, BRANDING, CONSULTATION, etc
  budgetRange String?
  timeline    String?
  description String   @db.Text
  attachments Json?    // [{name, url}]
  referralSource String?
  urgency     String   @default("normal") // urgent, normal, flexible
  status      InquiryStatus @default(NEW)
  priority    String   @default("medium")
  estimatedValue Decimal?
  followUpDate DateTime?
  notes       String?  @db.Text
  assignedTo  String?
  respondedAt DateTime?
  response    String?  @db.Text
  convertedToProjectId String?
  isArchived  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, status, createdAt])
  @@index([priority, followUpDate])
  @@index([clientEmail])
}

model ConsultationSlot {
  id          String   @id @default(cuid())
  storeId     String
  date        DateTime
  startTime   String   // HH:MM format
  endTime     String   // HH:MM format
  duration    Int      @default(30) // minutes
  type        String   @default("intro") // intro, strategy, review
  isBooked    Boolean  @default(false)
  bookedByName String?
  bookedByEmail String?
  bookedByPhone String?
  projectDescription String? @db.Text
  meetingUrl  String?
  calendarEventId String?
  reminderSent Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, date, isBooked])
  @@index([isBooked, startTime])
}

model ServiceOffering {
  id          String   @id @default(cuid())
  storeId     String
  slug        String
  name        String
  description String   @db.Text
  shortDescription String?
  deliverables String[]
  timeline    String?
  price       Decimal?
  priceType   String   @default("fixed") // fixed, hourly, range, contact
  priceRangeLow Decimal?
  priceRangeHigh Decimal?
  isPopular   Boolean  @default(false)
  isAvailable Boolean  @default(true)
  sortOrder   Int      @default(0)
  icon        String?
  imageUrl    String?
  caseStudyIds String[]
  faq         Json?    // [{question, answer}]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([storeId, slug])
  @@index([isAvailable, isPopular])
}

enum InquiryStatus {
  NEW
  REVIEWING
  RESPONDED
  MEETING_SCHEDULED
  QUOTE_SENT
  NEGOTIATING
  ACCEPTED
  DECLINED
  ARCHIVED
}
`;

export default HIRE_ME_ADDON;
