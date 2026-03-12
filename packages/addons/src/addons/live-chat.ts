/**
 * Live Chat Add-On
 * 
 * Real-time customer support chat widget
 */

import { AddOnDefinition } from '../../types';

export const LIVE_CHAT_ADDON: AddOnDefinition = {
  id: 'vayva.live-chat',
  name: 'Live Chat',
  description: 'Real-time chat widget for customer support with typing indicators, file sharing, and chat history',
  tagline: 'Connect with customers in real-time',
  version: '1.0.0',
  category: 'customer-service',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'MessageCircle',
  tags: ['chat', 'support', 'customer-service', 'communication', 'live'],
  compatibleTemplates: ['*'],
  mountPoints: ['floating-button', 'footer-widgets'],
  requirements: [],
  previewImages: {
    thumbnail: '/addons/live-chat/thumbnail.png',
    screenshots: ['/addons/live-chat/screenshot-1.png', '/addons/live-chat/screenshot-2.png'],
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
    installCount: 8900,
    rating: 4.7,
    reviewCount: 523,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/dashboard/chat', title: 'Live Chat' },
      { route: '/dashboard/chat/history', title: 'Chat History' },
    ],
    components: [
      { mountPoint: 'floating-button', componentName: 'ChatWidget' },
    ],
    apiRoutes: [
      { path: '/api/chat', methods: ['GET', 'POST'] },
      { path: '/api/chat/messages', methods: ['GET', 'POST'] },
      { path: '/api/chat/upload', methods: ['POST'] },
    ],
    databaseModels: ['ChatSession', 'ChatMessage'],
  },
  highlights: [
    'Real-time messaging',
    'Typing indicators',
    'File attachments',
    'Chat history',
    'Offline messages',
  ],
  installTimeEstimate: 2,
};

export const LIVE_CHAT_MODELS = `
model ChatSession {
  id        String   @id @default(cuid())
  storeId   String
  customerId String?
  visitorId String?
  status    ChatStatus @default(ACTIVE)
  subject   String?
  messages  ChatMessage[]
  metadata  Json?
  startedAt DateTime @default(now())
  endedAt   DateTime?
  updatedAt DateTime @updatedAt
  
  @@index([storeId, status])
  @@index([customerId])
}

model ChatMessage {
  id        String   @id @default(cuid())
  sessionId String
  session   ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  senderType MessageSender
  content   String
  attachments Json?
  readAt    DateTime?
  createdAt DateTime @default(now())
  
  @@index([sessionId, createdAt])
}

enum ChatStatus {
  ACTIVE
  WAITING
  RESOLVED
  CLOSED
}

enum MessageSender {
  CUSTOMER
  MERCHANT
  SYSTEM
  BOT
}
`;

export default LIVE_CHAT_ADDON;
