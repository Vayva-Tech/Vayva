/**
 * Live Class Add-On
 * 
 * Live streaming classes with interactive features
 */

import type { AddOnDefinition } from '../../types';

export const LIVE_CLASS_ADDON: AddOnDefinition = {
  id: 'vayva.live-class',
  name: 'Live Class',
  description: 'Live streaming classroom with real-time interaction, screen sharing, whiteboard, breakout rooms, and attendance tracking',
  tagline: 'Teach live online',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'Radio',
  tags: ['education', 'live', 'streaming', 'classroom', 'interactive'],
  compatibleTemplates: ['education', 'school', 'training', 'academy'],
  mountPoints: ['hero-section', 'floating-button'],
  previewImages: {
    thumbnail: '/addons/live-class/thumbnail.png',
    screenshots: ['/addons/live-class/screenshot-1.png'],
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
    rating: 4.8,
    reviewCount: 56,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/live', title: 'Live Class' },
      { route: '/live/schedule', title: 'Live Schedule' },
      { route: '/live/room/[id]', title: 'Class Room' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'LiveClassHero' },
      { mountPoint: 'floating-button', componentName: 'JoinLiveButton' },
    ],
    apiRoutes: [
      { path: '/api/live/sessions', methods: ['GET', 'POST'] },
      { path: '/api/live/token', methods: ['POST'] },
      { path: '/api/live/attendance', methods: ['POST'] },
    ],
    databaseModels: ['LiveSession', 'LiveAttendance', 'LiveRecording'],
  },
  highlights: [
    'HD streaming',
    'Interactive whiteboard',
    'Breakout rooms',
    'Screen sharing',
    'Attendance tracking',
  ],
  installTimeEstimate: 5,
};

export const LIVE_CLASS_MODELS = `
model LiveSession {
  id          String   @id @default(cuid())
  storeId     String
  courseId    String?
  instructorId String
  title       String
  description String?  @db.Text
  roomName    String   @unique
  status      LiveStatus @default(SCHEDULED)
  scheduledAt DateTime
  duration    Int      @default(60) // minutes
  maxAttendees Int?
  password    String?
  settings    Json?    // {enableChat, enableVideo, enableScreenShare, recordSession}
  chatEnabled Boolean  @default(true)
  videoEnabled Boolean @default(true)
  screenShareEnabled Boolean @default(true)
  recordingEnabled Boolean @default(false)
  whiteboardEnabled Boolean @default(true)
  breakoutRoomsEnabled Boolean @default(false)
  attendeeCount Int    @default(0)
  startedAt   DateTime?
  endedAt     DateTime?
  recordingId String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, scheduledAt])
  @@index([status, startedAt])
  @@index([courseId])
}

model LiveAttendance {
  id          String   @id @default(cuid())
  storeId     String
  sessionId   String
  studentId   String
  joinedAt    DateTime @default(now())
  leftAt      DateTime?
  duration    Int      @default(0) // seconds
  watchTime   Int      @default(0) // seconds actually watching
  chatMessagesCount Int @default(0)
  reactionsCount Int  @default(0)
  handRaisedCount Int @default(0)
  participatedInBreakout Boolean @default(false)
  deviceType  String?
  ipAddress   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([sessionId, studentId])
  @@index([storeId, studentId])
  @@index([joinedAt, leftAt])
}

model LiveRecording {
  id          String   @id @default(cuid())
  storeId     String
  sessionId   String   @unique
  recordingUrl String?
  thumbnailUrl String?
  duration    Int      // seconds
  fileSize    Int      // bytes
  format      String     @default("mp4")
  resolution  String?
  segments    Json?      // [{start, end, title}]
  isPublished Boolean   @default(false)
  publishedAt DateTime?
  viewCount   Int       @default(0)
  downloadCount Int     @default(0)
  createdAt   DateTime  @default(now())
  
  @@index([storeId, isPublished])
  @@index([publishedAt])
}

enum LiveStatus {
  SCHEDULED
  LIVE
  ENDED
  CANCELLED
  RECORDING_AVAILABLE
}
`;

export default LIVE_CLASS_ADDON;
