/**
 * Newsletter Add-On - Email subscription and list management
 * 
 * Features:
 * - Subscription form for storefront mount points
 * - Email list management in merchant admin
 * - Export to CSV
 * - Basic analytics
 */

import { AddOnDefinition } from '../../types';

export const NEWSLETTER_ADDON: AddOnDefinition = {
  id: 'vayva.newsletter',
  name: 'Newsletter & Subscriptions',
  description: 'Collect email subscribers and manage your mailing list. Export to CSV for use with any email marketing service.',
  tagline: 'Grow your audience with email subscriptions',
  version: '1.0.0',
  category: 'marketing',
  
  // No pricing - free add-on
  price: 0,
  isFree: true,
  
  developer: 'Vayva',
  author: {
    name: 'Vayva',
    isOfficial: true,
    isVerified: true,
  },
  
  icon: 'Mail',
  tags: ['email', 'newsletter', 'marketing', 'subscriptions', 'leads'],
  
  compatibleTemplates: ['*'], // Works with all templates
  mountPoints: ['footer-widgets', 'floating-button', 'page-sidebar', 'hero-section'],
  
  requirements: [],
  
  previewImages: {
    thumbnail: '/addons/newsletter/thumbnail.png',
    screenshots: [
      '/addons/newsletter/screenshot-1.png',
      '/addons/newsletter/screenshot-2.png',
    ],
  },
  
  pricing: {
    type: 'free',
  },
  
  stats: {
    installCount: 0,
    rating: 0,
    reviewCount: 0,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  
  provides: {
    pages: [
      {
        route: '/dashboard/subscribers',
        title: 'Email Subscribers',
        description: 'Manage your email subscription list',
        layout: 'default',
      },
    ],
    components: [
      {
        mountPoint: 'footer-widgets',
        componentName: 'NewsletterSignup',
        priority: 10,
        conditions: {
          pageTypes: ['home', 'product', 'post', 'page'],
          authState: 'any',
        },
      },
      {
        mountPoint: 'floating-button',
        componentName: 'NewsletterFloatingButton',
        priority: 20,
        conditions: {
          pageTypes: ['home'],
          authState: 'logged-out',
        },
      },
    ],
    apiRoutes: [
      {
        path: '/api/addons/newsletter/subscribe',
        methods: ['POST'],
        description: 'Subscribe to newsletter',
      },
      {
        path: '/api/addons/newsletter/unsubscribe',
        methods: ['POST'],
        description: 'Unsubscribe from newsletter',
      },
      {
        path: '/api/addons/newsletter/export',
        methods: ['GET'],
        description: 'Export subscribers to CSV',
      },
    ],
    databaseModels: ['NewsletterSubscriber'],
  },
  
  configSchema: {
    fields: [
      {
        key: 'title',
        label: 'Signup Title',
        type: 'string',
        description: 'Title displayed on the signup form',
        defaultValue: 'Subscribe to our newsletter',
        required: false,
      },
      {
        key: 'description',
        label: 'Description',
        type: 'string',
        description: 'Subtitle or description for the signup form',
        defaultValue: 'Get the latest updates and exclusive offers',
        required: false,
      },
      {
        key: 'buttonText',
        label: 'Button Text',
        type: 'string',
        defaultValue: 'Subscribe',
        required: false,
      },
      {
        key: 'placeholder',
        label: 'Email Placeholder',
        type: 'string',
        defaultValue: 'Enter your email',
        required: false,
      },
      {
        key: 'successMessage',
        label: 'Success Message',
        type: 'string',
        defaultValue: 'Thank you for subscribing!',
        required: false,
      },
      {
        key: 'showNameField',
        label: 'Show Name Field',
        type: 'boolean',
        description: 'Also collect subscriber name',
        defaultValue: false,
        required: false,
      },
      {
        key: 'requireDoubleOptIn',
        label: 'Require Double Opt-In',
        type: 'boolean',
        description: 'Send confirmation email before adding to list',
        defaultValue: false,
        required: false,
      },
      {
        key: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        defaultValue: '#F9FAFB',
        required: false,
      },
      {
        key: 'textColor',
        label: 'Text Color',
        type: 'color',
        defaultValue: '#111827',
        required: false,
      },
      {
        key: 'buttonColor',
        label: 'Button Color',
        type: 'color',
        defaultValue: '#10B981',
        required: false,
      },
    ],
  },
  
  defaultConfig: {
    title: 'Subscribe to our newsletter',
    description: 'Get the latest updates and exclusive offers',
    buttonText: 'Subscribe',
    placeholder: 'Enter your email',
    successMessage: 'Thank you for subscribing!',
    showNameField: false,
    requireDoubleOptIn: false,
    backgroundColor: '#F9FAFB',
    textColor: '#111827',
    buttonColor: '#10B981',
  },
  
  configRequired: false,
  installTimeEstimate: 1,
  
  highlights: [
    'Collect unlimited email subscribers',
    'Customizable signup forms',
    'Export to CSV for any email service',
    'GDPR-compliant with opt-in controls',
    'Works with any template',
  ],
  
  docs: {
    setup: 'The newsletter form will automatically appear in your chosen location. Configure the title, colors, and messaging from the add-on settings.',
  },
};

// Prisma model extension for NewsletterSubscriber
export const NEWSLETTER_SUBSCRIBER_MODEL = `
model NewsletterSubscriber {
  id          String   @id @default(uuid())
  storeId     String
  store       Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  
  email       String
  name        String?
  
  // Status
  isActive    Boolean  @default(true)
  isVerified  Boolean  @default(false)
  
  // Metadata
  source      String   @default("website") // website, import, manual
  ipAddress   String?
  userAgent   String?
  
  // Double opt-in
  verificationToken String?
  verifiedAt  DateTime?
  
  // Unsubscribe
  unsubscribeToken String @unique
  unsubscribedAt DateTime?
  
  // Engagement
  lastOpenAt  DateTime?
  openCount   Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([storeId, email])
  @@index([storeId, isActive])
  @@index([storeId, createdAt])
  @@map("newsletter_subscribers")
}
`;

export default NEWSLETTER_ADDON;
