/**
 * Certificates Add-On
 * 
 * Certificate generation and verification system
 */

import type { AddOnDefinition } from '../../types';

export const CERTIFICATES_ADDON: AddOnDefinition = {
  id: 'vayva.certificates',
  name: 'Certificates',
  description: 'Professional certificate generation with customizable templates, verification system, and digital credential sharing',
  tagline: 'Award achievements',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'Award',
  tags: ['education', 'certificates', 'credentials', 'achievements', 'badges'],
  compatibleTemplates: ['education', 'school', 'training', 'academy'],
  mountPoints: ['hero-section', 'page-sidebar'],
  previewImages: {
    thumbnail: '/addons/certificates/thumbnail.png',
    screenshots: ['/addons/certificates/screenshot-1.png'],
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
    installCount: 560,
    rating: 4.8,
    reviewCount: 71,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/certificates', title: 'My Certificates' },
      { route: '/certificates/verify', title: 'Verify Certificate' },
      { route: '/certificates/[id]', title: 'Certificate' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'CertificateShowcase' },
      { mountPoint: 'page-sidebar', componentName: 'RecentCertificates' },
    ],
    apiRoutes: [
      { path: '/api/certificates', methods: ['GET', 'POST'] },
      { path: '/api/certificates/verify', methods: ['POST'] },
    ],
    databaseModels: ['Certificate', 'CertificateTemplate', 'CredentialVerification'],
  },
  highlights: [
    'Custom templates',
    'Digital credentials',
    'Verification system',
    'Social sharing',
    'Blockchain option',
  ],
  installTimeEstimate: 4,
};

export const CERTIFICATES_MODELS = `
model Certificate {
  id          String   @id @default(cuid())
  storeId     String
  templateId  String
  studentId   String
  courseId    String?
  certificateNumber String @unique
  title       String
  studentName String
  issueDate   DateTime @default(now())
  expiryDate  DateTime?
  status      CertificateStatus @default(ACTIVE)
  pdfUrl      String?
  verificationUrl String?
  metadata    Json?    // course, grade, hours, etc.
  sharedOn    Json?    // {linkedin, twitter, etc}
  downloadCount Int   @default(0)
  revokedAt   DateTime?
  revokedReason String?
  blockchainHash String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, studentId])
  @@index([certificateNumber])
  @@index([status, issueDate])
}

model CertificateTemplate {
  id          String   @id @default(cuid())
  storeId     String
  name        String
  description String?
  layout      String   @default("standard")
  orientation String   @default("landscape")
  backgroundUrl String?
  logoUrl     String?
  signatureUrl String?
  primaryColor String   @default("#000000")
  secondaryColor String @default("#666666")
  fontFamily  String   @default("serif")
  customFields Json?   // [{name, position, fontSize}]
  isDefault   Boolean  @default(false)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, isActive])
  @@index([isDefault])
}

model CredentialVerification {
  id          String   @id @default(cuid())
  storeId     String
  certificateId String
  verifiedBy  String?
  verifiedVia String   // WEB, QR_CODE, API
  ipAddress   String?
  userAgent   String?
  result      Boolean  @default(true)
  verifiedAt  DateTime @default(now())
  createdAt   DateTime @default(now())
  
  @@index([certificateId, verifiedAt])
  @@index([verifiedVia])
}

enum CertificateStatus {
  ACTIVE
  EXPIRED
  REVOKED
  SUSPENDED
}
`;

export default CERTIFICATES_ADDON;
