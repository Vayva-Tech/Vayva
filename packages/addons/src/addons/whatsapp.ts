/**
 * WhatsApp Chat Add-On - Customer support via WhatsApp
 * 
 * Features:
 * - Floating WhatsApp button on storefront
 * - Pre-filled messages with product/page context
 * - Business hours configuration
 * - Multiple agent support
 */

import type { AddOnDefinition } from '../types';

export const WHATSAPP_ADDON: AddOnDefinition = {
  id: 'vayva.whatsapp',
  name: 'WhatsApp Chat',
  description: 'Let customers reach you instantly via WhatsApp. Floating button with smart pre-filled messages based on what they\'re viewing.',
  tagline: 'Connect with customers on WhatsApp',
  version: '1.0.0',
  category: 'customer-service',
  
  developer: 'Vayva',
  author: {
    name: 'Vayva',
    isOfficial: true,
    isVerified: true,
  },
  
  icon: 'MessageCircle',
  tags: ['whatsapp', 'chat', 'support', 'messaging', 'communication'],
  
  compatibleTemplates: ['*'],
  mountPoints: ['floating-button'],
  
  requirements: [],
  
  previewImages: {
    thumbnail: '/addons/whatsapp/thumbnail.png',
    screenshots: ['/addons/whatsapp/screenshot-1.png'],
  },
  
  pricing: {
    type: 'free',
    amount: 0,
    basePrice: 0,
    currency: 'NGN',
  },
  
  stats: {
    installCount: 0,
    rating: 0,
    reviewCount: 0,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  
  provides: {
    components: [
      {
        mountPoint: 'floating-button',
        componentName: 'WhatsAppButton',
        priority: 10,
        conditions: {
          pageTypes: ['home', 'product', 'category', 'cart', 'checkout'],
          authState: 'any',
        },
      },
    ],
    apiRoutes: [
      {
        path: '/api/addons/whatsapp/track',
        methods: ['POST'],
        description: 'Track WhatsApp click events',
      },
    ],
    databaseModels: ['WhatsAppAnalytics'],
  },
  
  configSchema: {
    fields: [
      {
        key: 'phoneNumber',
        label: 'WhatsApp Number',
        type: 'string',
        description: 'Your WhatsApp business number (with country code, e.g., +2348012345678)',
        required: true,
        validation: {
          pattern: '^\\+[1-9]\\d{7,14}$',
        },
      },
      {
        key: 'welcomeMessage',
        label: 'Welcome Message',
        type: 'string',
        description: 'Default message shown when customers click the button',
        defaultValue: 'Hi! I have a question about your store.',
        required: false,
      },
      {
        key: 'buttonText',
        label: 'Button Text',
        type: 'string',
        defaultValue: 'Chat on WhatsApp',
        required: false,
      },
      {
        key: 'buttonColor',
        label: 'Button Color',
        type: 'color',
        defaultValue: '#25D366',
        required: false,
      },
      {
        key: 'position',
        label: 'Button Position',
        type: 'select',
        description: 'Where to place the button on the screen',
        options: [
          { label: 'Bottom Right', value: 'bottom-right' },
          { label: 'Bottom Left', value: 'bottom-left' },
        ],
        defaultValue: 'bottom-right',
        required: false,
      },
      {
        key: 'showOnMobile',
        label: 'Show on Mobile',
        type: 'boolean',
        description: 'Display button on mobile devices',
        defaultValue: true,
        required: false,
      },
      {
        key: 'showOnDesktop',
        label: 'Show on Desktop',
        type: 'boolean',
        description: 'Display button on desktop devices',
        defaultValue: true,
        required: false,
      },
      {
        key: 'businessHoursEnabled',
        label: 'Enable Business Hours',
        type: 'boolean',
        description: 'Only show button during business hours',
        defaultValue: false,
        required: false,
      },
      {
        key: 'businessHoursStart',
        label: 'Business Hours Start',
        type: 'string',
        description: 'Format: HH:MM (24-hour)',
        defaultValue: '09:00',
        required: false,
        validation: {
          pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
        },
      },
      {
        key: 'businessHoursEnd',
        label: 'Business Hours End',
        type: 'string',
        description: 'Format: HH:MM (24-hour)',
        defaultValue: '17:00',
        required: false,
        validation: {
          pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
        },
      },
      {
        key: 'timezone',
        label: 'Timezone',
        type: 'select',
        options: [
          { label: 'Africa/Lagos (WAT)', value: 'Africa/Lagos' },
          { label: 'UTC', value: 'UTC' },
        ],
        defaultValue: 'Africa/Lagos',
        required: false,
      },
      {
        key: 'includeProductInfo',
        label: 'Include Product Info',
        type: 'boolean',
        description: 'When on a product page, include product details in the message',
        defaultValue: true,
        required: false,
      },
      {
        key: 'includePageUrl',
        label: 'Include Page URL',
        type: 'boolean',
        description: 'Include current page URL in the message',
        defaultValue: true,
        required: false,
      },
    ],
  },
  
  defaultConfig: {
    welcomeMessage: 'Hi! I have a question about your store.',
    buttonText: 'Chat on WhatsApp',
    buttonColor: '#25D366',
    position: 'bottom-right',
    showOnMobile: true,
    showOnDesktop: true,
    businessHoursEnabled: false,
    businessHoursStart: '09:00',
    businessHoursEnd: '17:00',
    timezone: 'Africa/Lagos',
    includeProductInfo: true,
    includePageUrl: true,
  },
  
  configRequired: true,
  installTimeEstimate: 2,
  
  highlights: [
    'Instant customer connection',
    'Smart context-aware messages',
    'Business hours scheduling',
    'Mobile and desktop support',
    'No additional fees',
  ],
  
  docs: {
    setup: 'Enter your WhatsApp business number in the settings. The button will appear immediately on your storefront. Customers can click to start a chat with pre-filled context about the product or page they\'re viewing.',
  },
};

// Prisma model extension for WhatsApp analytics
export const WHATSAPP_ANALYTICS_MODEL = `
model WhatsAppAnalytics {
  id          String   @id @default(uuid())
  storeId     String
  store       Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  
  // Click details
  clickedAt   DateTime @default(now())
  pageUrl     String
  pageType    String   // home, product, category, etc.
  productId   String?
  
  // Context
  referrer    String?
  userAgent   String?
  ipAddress   String?
  
  // Conversion tracking
  convertedToOrder Boolean @default(false)
  orderId     String?
  
  @@index([storeId, clickedAt])
  @@index([storeId, pageType])
  @@index([storeId, convertedToOrder])
  @@map("whatsapp_analytics")
}
`;

export default WHATSAPP_ADDON;
