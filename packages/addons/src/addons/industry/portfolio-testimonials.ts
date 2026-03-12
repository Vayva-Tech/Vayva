/**
 * Portfolio Testimonials Add-On
 * 
 * Client testimonials and reviews showcase
 */

import { AddOnDefinition } from '../../types';

export const PORTFOLIO_TESTIMONIALS_ADDON: AddOnDefinition = {
  id: 'vayva.portfolio-testimonials',
  name: 'Portfolio Testimonials',
  description: 'Beautiful client testimonials showcase with ratings, project details, and verified client information for social proof',
  tagline: 'Show client love',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'Quote',
  tags: ['creative', 'testimonials', 'reviews', 'social-proof', 'clients'],
  compatibleTemplates: ['creative', 'portfolio', 'designer', 'agency', 'freelancer'],
  mountPoints: ['hero-section', 'page-sidebar', 'footer-section'],
  previewImages: {
    thumbnail: '/addons/portfolio-testimonials/thumbnail.png',
    screenshots: ['/addons/portfolio-testimonials/screenshot-1.png'],
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
    installCount: 650,
    rating: 4.7,
    reviewCount: 78,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/testimonials', title: 'Client Testimonials' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'FeaturedTestimonials' },
      { mountPoint: 'footer-section', componentName: 'TestimonialCarousel' },
    ],
    apiRoutes: [
      { path: '/api/testimonials', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/testimonials/request', methods: ['POST'] },
    ],
    databaseModels: ['PortfolioTestimonial', 'TestimonialRequest'],
  },
  highlights: [
    'Star ratings',
    'Client photos',
    'Project links',
    'Video testimonials',
    'Verified badges',
  ],
  installTimeEstimate: 3,
};

export const PORTFOLIO_TESTIMONIALS_MODELS = `
model PortfolioTestimonial {
  id          String   @id @default(cuid())
  storeId     String
  clientName  String
  clientTitle String?
  clientCompany String?
  clientLogo  String?
  clientAvatar String?
  clientWebsite String?
  clientEmail String?
  projectId   String?
  projectName String?
  rating      Int      @default(5) // 1-5
  title       String?
  content     String   @db.Text
  isVideo     Boolean  @default(false)
  videoUrl    String?
  videoThumbnail String?
  isFeatured  Boolean  @default(false)
  isVerified  Boolean  @default(false)
  verifiedAt  DateTime?
  sortOrder   Int      @default(0)
  tags        String[]
  metrics     Json?    // {roi, timeSaved, revenueIncrease}
  isPublished Boolean  @default(false)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, isPublished, isFeatured])
  @@index([rating, isVerified])
  @@index([projectId])
}

model TestimonialRequest {
  id          String   @id @default(cuid())
  storeId     String
  clientName  String
  clientEmail String
  clientCompany String?
  projectId   String?
  projectName String?
  requestType RequestType @default(EMAIL)
  message     String?  @db.Text
  linkToken   String   @unique
  linkExpiresAt DateTime
  isSent      Boolean  @default(false)
  sentAt      DateTime?
  isCompleted Boolean  @default(false)
  completedAt DateTime?
  testimonialId String?
  reminderCount Int    @default(0)
  lastReminderAt DateTime?
  status      RequestStatus @default(PENDING)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, status])
  @@index([linkToken])
  @@index([clientEmail])
}

enum RequestType {
  EMAIL
  LINK
  VIDEO
  FORM
}

enum RequestStatus {
  PENDING
  SENT
  OPENED
  COMPLETED
  EXPIRED
  REMINDED
}
`;

export default PORTFOLIO_TESTIMONIALS_ADDON;
