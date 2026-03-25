/**
 * Property Booking Viewings Add-On
 * 
 * Schedule property viewings and open houses
 */

import type { AddOnDefinition } from '../../types';

export const PROPERTY_BOOKING_ADDON: AddOnDefinition = {
  id: 'vayva.property-booking',
  name: 'Property Viewings',
  description: 'Schedule property viewings, open houses, and virtual tours with calendar integration',
  tagline: 'Book viewings online',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'Home',
  tags: ['real-estate', 'booking', 'viewings', 'appointments', 'property'],
  compatibleTemplates: ['realestate', 'property', 'rentals'],
  mountPoints: ['product-detail', 'floating-button'],
  previewImages: {
    thumbnail: '/addons/property-booking/thumbnail.png',
    screenshots: ['/addons/property-booking/screenshot-1.png'],
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
    rating: 4.6,
    reviewCount: 38,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/book-viewing', title: 'Book a Viewing' },
      { route: '/viewings/confirmation', title: 'Viewing Confirmed' },
    ],
    components: [
      { mountPoint: 'product-detail', componentName: 'ViewingScheduler' },
      { mountPoint: 'floating-button', componentName: 'QuickViewingButton' },
    ],
    apiRoutes: [
      { path: '/api/viewings', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/viewings/availability', methods: ['GET'] },
    ],
    databaseModels: ['PropertyViewing', 'ViewingSlot'],
  },
  highlights: [
    'Online scheduling',
    'Calendar sync',
    'Open house events',
    'Virtual tour links',
    'Agent notifications',
  ],
  installTimeEstimate: 3,
};

export const PROPERTY_BOOKING_MODELS = `
model PropertyViewing {
  id          String   @id @default(cuid())
  storeId     String
  propertyId  String
  customerId  String
  agentId     String?
  viewingType ViewingType @default(IN_PERSON)
  status      ViewingStatus @default(CONFIRMED)
  scheduledAt DateTime
  duration    Int      @default(30) // minutes
  notes       String?
  virtualLink String?
  reminderSent Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, propertyId])
  @@index([customerId])
  @@index([status, scheduledAt])
}

model ViewingSlot {
  id          String   @id @default(cuid())
  storeId     String
  propertyId  String?
  agentId     String
  date        DateTime
  startTime   String
  endTime     String
  isBooked    Boolean  @default(false)
  viewingId   String?
  isOpenHouse Boolean  @default(false)
  maxAttendees Int?
  createdAt   DateTime @default(now())
  
  @@unique([storeId, agentId, date, startTime])
  @@index([propertyId, isBooked])
}

enum ViewingType {
  IN_PERSON
  VIRTUAL
  OPEN_HOUSE
}

enum ViewingStatus {
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
  RESCHEDULED
}
`;

export default PROPERTY_BOOKING_ADDON;
