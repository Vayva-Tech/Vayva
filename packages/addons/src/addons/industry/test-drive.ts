/**
 * Test Drive Booking Add-On (Automotive Industry)
 * 
 * Features:
 * - Schedule test drives for vehicles
 * - Calendar integration
 * - Staff assignment
 * - Customer reminders
 */

import { AddOnDefinition } from '../../types';

export const TEST_DRIVE_ADDON: AddOnDefinition = {
  id: 'vayva.automotive.test-drive',
  name: 'Test Drive Booking',
  description: 'Let customers schedule vehicle test drives. Includes calendar management, staff assignment, and automated reminders.',
  tagline: 'Book test drives online',
  version: '1.0.0',
  category: 'industry-specific',
  
  author: {
    name: 'Vayva',
    isOfficial: true,
    isVerified: true,
  },
  
  icon: 'Car',
  tags: ['automotive', 'test-drive', 'booking', 'vehicles', 'appointments'],
  
  compatibleTemplates: ['autodealer', 'automotive'],
  conflictsWith: [],
  requires: [],
  
  previewImages: {
    thumbnail: '/addons/test-drive/thumbnail.png',
    screenshots: ['/addons/test-drive/screenshot-1.png'],
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
        route: '/book-test-drive',
        title: 'Book a Test Drive',
        description: 'Test drive booking page',
        layout: 'full-width',
      },
      {
        route: '/dashboard/test-drives',
        title: 'Test Drive Appointments',
        description: 'Manage test drive bookings',
        layout: 'default',
      },
    ],
    components: [
      {
        mountPoint: 'product-detail',
        componentName: 'TestDriveButton',
        priority: 45,
        conditions: {
          pageTypes: ['product'],
          authState: 'any',
        },
      },
      {
        mountPoint: 'product-card',
        componentName: 'QuickTestDrive',
        priority: 25,
        conditions: {
          pageTypes: ['home', 'category'],
          authState: 'any',
        },
      },
    ],
    apiRoutes: [
      {
        path: '/api/addons/test-drive/book',
        methods: ['POST'],
        description: 'Book a test drive',
      },
      {
        path: '/api/addons/test-drive/slots',
        methods: ['GET'],
        description: 'Get available time slots',
      },
      {
        path: '/api/addons/test-drive/appointments',
        methods: ['GET', 'PATCH'],
        description: 'Manage appointments',
      },
    ],
    databaseModels: ['TestDriveAppointment', 'TestDriveSlot'],
  },
  
  configSchema: {
    fields: [
      {
        key: 'durationMinutes',
        label: 'Test Drive Duration',
        type: 'number',
        description: 'How long each test drive lasts',
        defaultValue: 30,
        required: false,
        validation: { min: 15, max: 120 },
      },
      {
        key: 'bufferMinutes',
        label: 'Buffer Between Drives',
        type: 'number',
        description: 'Minutes between appointments',
        defaultValue: 15,
        required: false,
        validation: { min: 5, max: 60 },
      },
      {
        key: 'requireLicense',
        label: 'Require License Upload',
        type: 'boolean',
        description: 'Require driver license before booking',
        defaultValue: true,
        required: false,
      },
      {
        key: 'minAge',
        label: 'Minimum Age',
        type: 'number',
        description: 'Minimum age to book test drive',
        defaultValue: 21,
        required: false,
        validation: { min: 18, max: 25 },
      },
      {
        key: 'advanceBookingDays',
        label: 'Advance Booking',
        type: 'number',
        description: 'How many days ahead customers can book',
        defaultValue: 14,
        required: false,
        validation: { min: 1, max: 90 },
      },
      {
        key: 'sameDayBooking',
        label: 'Allow Same-Day Booking',
        type: 'boolean',
        description: 'Allow bookings for today',
        defaultValue: false,
        required: false,
      },
      {
        key: 'depositRequired',
        label: 'Require Deposit',
        type: 'boolean',
        description: 'Require refundable deposit',
        defaultValue: false,
        required: false,
      },
      {
        key: 'depositAmount',
        label: 'Deposit Amount (kobo)',
        type: 'number',
        description: 'Amount to hold (in kobo)',
        defaultValue: 500000, // ₦5,000
        required: false,
        validation: { min: 0, max: 5000000 },
      },
      {
        key: 'businessHoursStart',
        label: 'Business Hours Start',
        type: 'string',
        defaultValue: '09:00',
        required: false,
      },
      {
        key: 'businessHoursEnd',
        label: 'Business Hours End',
        type: 'string',
        defaultValue: '18:00',
        required: false,
      },
      {
        key: 'daysOpen',
        label: 'Days Open',
        type: 'multiselect',
        options: [
          { label: 'Monday', value: 'monday' },
          { label: 'Tuesday', value: 'tuesday' },
          { label: 'Wednesday', value: 'wednesday' },
          { label: 'Thursday', value: 'thursday' },
          { label: 'Friday', value: 'friday' },
          { label: 'Saturday', value: 'saturday' },
          { label: 'Sunday', value: 'sunday' },
        ],
        required: false,
      },
    ],
  },
  
  defaultConfig: {
    durationMinutes: 30,
    bufferMinutes: 15,
    requireLicense: true,
    minAge: 21,
    advanceBookingDays: 14,
    sameDayBooking: false,
    depositRequired: false,
    depositAmount: 500000,
    businessHoursStart: '09:00',
    businessHoursEnd: '18:00',
    daysOpen: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
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
    'Online test drive scheduling',
    'Automatic calendar management',
    'License verification',
    'SMS/email reminders',
    'Staff assignment',
  ],
  
  docs: {
    setup: 'Configure your business hours and booking policies. The test drive button will appear on all vehicle pages.',
  },
};

// Prisma models for test drive
export const TEST_DRIVE_MODELS = `
model TestDriveAppointment {
  id          String   @id @default(uuid())
  storeId     String
  store       Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  
  // Vehicle
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  
  // Customer
  customerId  String?
  customer    Customer? @relation(fields: [customerId], references: [id])
  
  // Appointment details
  scheduledAt DateTime
  duration    Int      @default(30) // minutes
  
  // Customer info
  name        String
  email       String
  phone       String
  age         Int?
  
  // License
  licenseNumber String?
  licenseImage  String?
  
  // Status
  status      TestDriveStatus @default(CONFIRMED)
  
  // Staff assignment
  assignedStaffId String?
  
  // Deposit
  depositAmount   Int?     // in kobo
  depositRefunded Boolean  @default(false)
  
  // Feedback
  completedAt DateTime?
  rating      Int?
  feedback    String?  @db.Text
  
  // No-show tracking
  noShow      Boolean  @default(false)
  
  // Reminders
  reminderSentAt DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, scheduledAt])
  @@index([storeId, status])
  @@index([productId, scheduledAt])
  @@map("test_drive_appointments")
}

enum TestDriveStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

model TestDriveSlot {
  id          String   @id @default(uuid())
  storeId     String
  
  // Date and time
  date        DateTime @db.Date
  startTime   String   // HH:MM format
  endTime     String   // HH:MM format
  
  // Capacity
  maxBookings Int      @default(3)
  currentBookings Int  @default(0)
  
  // Status
  isBlocked   Boolean  @default(false)
  blockReason String?
  
  @@unique([storeId, date, startTime])
  @@index([storeId, date])
  @@map("test_drive_slots")
}
`;

export default TEST_DRIVE_ADDON;
