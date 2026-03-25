/**
 * Table Booking Add-On (Restaurant Industry)
 * 
 * Features:
 * - Online table reservations
 * - Table management
 * - Guest count handling
 * - Special occasion notes
 */

import type { AddOnDefinition } from '../../types';

export const TABLE_BOOKING_ADDON: AddOnDefinition = {
  id: 'vayva.restaurant.table-booking',
  name: 'Table Reservations',
  description: 'Accept table reservations online. Manage floor plan, table availability, and guest preferences.',
  tagline: 'Book tables online',
  version: '1.0.0',
  category: 'industry-specific',
  
  author: {
    name: 'Vayva',
    isOfficial: true,
    isVerified: true,
  },
  
  icon: 'Armchair',
  tags: ['restaurant', 'booking', 'reservations', 'tables', 'dining'],
  
  compatibleTemplates: ['restaurant', 'food'],
  conflictsWith: [],
  requires: [],
  
  previewImages: {
    thumbnail: '/addons/table-booking/thumbnail.png',
    screenshots: ['/addons/table-booking/screenshot-1.png'],
  },
  
  installationType: 'automatic',
  canUninstall: true,
  installTimeEstimate: 5,
  
  versionHistory: [
    {
      version: '1.0.0',
      date: new Date().toISOString(),
      changes: ['Initial release'],
    },
  ],
  
  provides: {
    pages: [
      {
        route: '/reservations',
        title: 'Book a Table',
        description: 'Table reservation page',
        layout: 'default',
      },
      {
        route: '/dashboard/reservations',
        title: 'Table Reservations',
        description: 'Manage reservations',
        layout: 'default',
      },
    ],
    components: [
      {
        mountPoint: 'header-right',
        componentName: 'BookTableButton',
        priority: 20,
        conditions: {
          pageTypes: ['home', 'page'],
          authState: 'any',
        },
      },
      {
        mountPoint: 'hero-section',
        componentName: 'ReservationCTA',
        priority: 35,
        conditions: {
          pageTypes: ['home'],
          authState: 'any',
        },
      },
    ],
    apiRoutes: [
      {
        path: '/api/addons/table-booking/reserve',
        methods: ['POST'],
        description: 'Create reservation',
      },
      {
        path: '/api/addons/table-booking/availability',
        methods: ['GET'],
        description: 'Check table availability',
      },
      {
        path: '/api/addons/table-booking/tables',
        methods: ['GET', 'POST', 'PATCH'],
        description: 'Manage tables',
      },
    ],
    databaseModels: ['TableReservation', 'RestaurantTable'],
  },
  
  configSchema: {
    fields: [
      {
        key: 'maxGuestsPerTable',
        label: 'Max Guests Per Table',
        type: 'number',
        defaultValue: 8,
        required: false,
        validation: { min: 2, max: 20 },
      },
      {
        key: 'minGuests',
        label: 'Minimum Party Size',
        type: 'number',
        defaultValue: 1,
        required: false,
        validation: { min: 1, max: 4 },
      },
      {
        key: 'advanceBookingDays',
        label: 'Advance Booking Days',
        type: 'number',
        defaultValue: 30,
        required: false,
        validation: { min: 1, max: 365 },
      },
      {
        key: 'slotDuration',
        label: 'Reservation Slot (minutes)',
        type: 'number',
        defaultValue: 90,
        required: false,
        validation: { min: 30, max: 300 },
      },
      {
        key: 'depositRequired',
        label: 'Require Deposit',
        type: 'boolean',
        defaultValue: false,
        required: false,
      },
      {
        key: 'depositPerPerson',
        label: 'Deposit Per Person (kobo)',
        type: 'number',
        defaultValue: 500000, // ₦5,000
        required: false,
        validation: { min: 0, max: 1000000 },
      },
      {
        key: 'allowSameDay',
        label: 'Allow Same-Day Booking',
        type: 'boolean',
        defaultValue: true,
        required: false,
      },
      {
        key: 'cutoffTime',
        label: 'Same-Day Cutoff (minutes)',
        type: 'number',
        defaultValue: 60,
        required: false,
        validation: { min: 15, max: 240 },
      },
      {
        key: 'specialOccasions',
        label: 'Special Occasions',
        type: 'boolean',
        description: 'Allow guests to note special occasions',
        defaultValue: true,
        required: false,
      },
    ],
  },
  
  defaultConfig: {
    maxGuestsPerTable: 8,
    minGuests: 1,
    advanceBookingDays: 30,
    slotDuration: 90,
    depositRequired: false,
    depositPerPerson: 500000,
    allowSameDay: true,
    cutoffTime: 60,
    specialOccasions: true,
  },
  
  configRequired: true,
  
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
  
  highlights: [
    'Online table reservations',
    'Floor plan management',
    'Guest count handling',
    'Special occasion notes',
    'SMS confirmations',
  ],
  
  docs: {
    setup: 'Set up your table layout and dining hours. The booking widget will appear on your restaurant pages.',
  },
};

// Prisma models for table booking
export const TABLE_BOOKING_MODELS = `
model TableReservation {
  id          String   @id @default(uuid())
  storeId     String
  store       Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  
  // Guest info
  name        String
  email       String
  phone       String
  partySize   Int
  
  // Reservation details
  date        DateTime @db.Date
  time        String   // HH:MM format
  duration    Int      @default(90) // minutes
  
  // Table assignment
  tableId     String?
  table       RestaurantTable? @relation(fields: [tableId], references: [id])
  
  // Status
  status      ReservationStatus @default(CONFIRMED)
  
  // Special requests
  specialRequests String? @db.Text
  occasion    String?  // birthday, anniversary, business, etc.
  
  // Deposit
  depositAmount   Int?     // kobo
  depositPaid     Boolean  @default(false)
  
  // Check-in
  checkedInAt DateTime?
  checkedOutAt DateTime?
  
  // Reminders
  reminderSent Boolean @default(false)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, date])
  @@index([storeId, status])
  @@index([date, time])
  @@map("table_reservations")
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  SEATED
  COMPLETED
  CANCELLED
  NO_SHOW
}

model RestaurantTable {
  id          String   @id @default(uuid())
  storeId     String
  
  name        String   // e.g., "Table 1", "Booth A"
  capacity    Int      // max guests
  
  // Location/zone
  zone        String?  // main, patio, bar, private
  
  // Features
  isActive    Boolean  @default(true)
  features    String[] // wheelchair_accessible, high_chair, quiet, etc.
  
  // Shape for floor plan
  shape       String?  // rectangle, circle, square
  positionX   Int?     // for floor plan
  positionY   Int?     // for floor plan
  width       Int?
  height      Int?
  
  reservations TableReservation[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, isActive])
  @@index([storeId, zone])
  @@map("restaurant_tables")
}
`;

export default TABLE_BOOKING_ADDON;
