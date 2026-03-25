/**
 * Telehealth Add-On
 * 
 * Video consultations and virtual appointments
 */

import type { AddOnDefinition } from '../../types';

export const TELEHEALTH_ADDON: AddOnDefinition = {
  id: 'vayva.telehealth',
  name: 'Telehealth',
  description: 'Secure video consultations and virtual appointments with integrated scheduling, reminders, and prescription management',
  tagline: 'See patients virtually',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'Video',
  tags: ['healthcare', 'telehealth', 'video', 'consultation', 'virtual'],
  compatibleTemplates: ['healthcare', 'clinic', 'medical', 'hospital', 'therapy'],
  mountPoints: ['hero-section', 'floating-button', 'page-sidebar'],
  previewImages: {
    thumbnail: '/addons/telehealth/thumbnail.png',
    screenshots: ['/addons/telehealth/screenshot-1.png'],
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
    installCount: 410,
    rating: 4.9,
    reviewCount: 55,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/telehealth', title: 'Virtual Visit' },
      { route: '/telehealth/schedule', title: 'Schedule Virtual Visit' },
      { route: '/telehealth/waiting-room', title: 'Waiting Room' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'TelehealthHero' },
      { mountPoint: 'floating-button', componentName: 'StartVideoCall' },
    ],
    apiRoutes: [
      { path: '/api/telehealth/session', methods: ['POST', 'GET'] },
      { path: '/api/telehealth/token', methods: ['POST'] },
    ],
    databaseModels: ['TelehealthSession', 'VideoRecording'],
  },
  highlights: [
    'HD video calls',
    'Screen sharing',
    'Session recording',
    'Waiting room',
    'End-to-end encrypted',
  ],
  installTimeEstimate: 5,
};

export const TELEHEALTH_MODELS = `
model TelehealthSession {
  id          String   @id @default(cuid())
  storeId     String
  appointmentId String?
  providerId  String
  patientId   String
  roomName    String   @unique
  status      SessionStatus @default(SCHEDULED)
  scheduledAt DateTime
  startedAt   DateTime?
  endedAt     DateTime?
  duration    Int?     // minutes
  notes       String?  @db.Text
  diagnosis   String?
  prescriptions String[]
  followUpRequired Boolean @default(false)
  followUpDate DateTime?
  recordingId String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, providerId])
  @@index([patientId, status])
  @@index([scheduledAt])
}

model VideoRecording {
  id          String   @id @default(cuid())
  storeId     String
  sessionId   String   @unique
  providerId  String
  patientId   String
  recordingUrl String?
  thumbnailUrl String?
  duration    Int      // seconds
  fileSize    Int?     // bytes
  isEncrypted Boolean  @default(true)
  retentionUntil DateTime?
  consentGiven Boolean @default(false)
  consentDate DateTime?
  downloadedAt DateTime?
  createdAt   DateTime @default(now())
  
  @@index([storeId, sessionId])
  @@index([retentionUntil])
}

enum SessionStatus {
  SCHEDULED
  WAITING
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}
`;

export default TELEHEALTH_ADDON;
