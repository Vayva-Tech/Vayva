/**
 * Appointment Scheduler Add-On
 * 
 * Service-based business booking system
 */

import { AddOnDefinition } from '../../types';

export const APPOINTMENT_SCHEDULER_ADDON: AddOnDefinition = {
  id: 'vayva.appointment-scheduler',
  name: 'Appointment Scheduler',
  description: 'Complete booking system for salons, clinics, consultants, and service-based businesses with availability management',
  tagline: 'Book clients, manage your calendar',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'CalendarDays',
  tags: ['booking', 'appointments', 'calendar', 'scheduling', 'services'],
  compatibleTemplates: ['services', 'salon', 'clinic', 'wellness'],
  mountPoints: ['hero-section', 'floating-button', 'page-sidebar'],
  previewImages: {
    thumbnail: '/addons/appointment-scheduler/thumbnail.png',
    screenshots: ['/addons/appointment-scheduler/screenshot-1.png'],
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
    installCount: 2800,
    rating: 4.7,
    reviewCount: 134,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/book', title: 'Book Appointment' },
      { route: '/book/confirmation', title: 'Booking Confirmed' },
      { route: '/book/cancel', title: 'Cancel Booking' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'BookingHero' },
      { mountPoint: 'floating-button', componentName: 'QuickBookButton' },
    ],
    apiRoutes: [
      { path: '/api/appointments', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/appointments/availability', methods: ['GET'] },
      { path: '/api/appointments/cancel', methods: ['POST'] },
    ],
    databaseModels: ['Appointment', 'Service', 'TimeSlot', 'StaffSchedule'],
  },
  highlights: [
    'Online booking 24/7',
    'Staff availability',
    'Buffer times',
    'SMS reminders',
    'Deposit payments',
  ],
  installTimeEstimate: 3,
};

export const APPOINTMENT_SCHEDULER_MODELS = `
model Appointment {
  id          String   @id @default(cuid())
  storeId     String
  customerId  String
  serviceId   String
  service     Service  @relation(fields: [serviceId], references: [id])
  staffId     String?
  date        DateTime
  startTime   String
  endTime     String
  duration    Int      // minutes
  status      AppointmentStatus @default(CONFIRMED)
  notes       String?
  depositPaid Decimal? @db.Decimal(10, 2)
  totalAmount Decimal  @db.Decimal(10, 2)
  reminders   AppointmentReminder[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, date])
  @@index([customerId])
  @@index([status])
}

model Service {
  id           String   @id @default(cuid())
  storeId      String
  name         String
  description  String?
  duration     Int      // minutes
  price        Decimal  @db.Decimal(10, 2)
  depositRequired Decimal? @db.Decimal(10, 2)
  depositPercent Int?
  maxClients   Int      @default(1)
  color        String?
  bufferBefore Int      @default(0)
  bufferAfter  Int      @default(0)
  staff        ServiceStaff[]
  appointments Appointment[]
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@index([storeId, isActive])
}

model TimeSlot {
  id        String   @id @default(cuid())
  staffId   String
  date      DateTime
  startTime String
  endTime   String
  isBooked  Boolean  @default(false)
  appointmentId String?
  createdAt DateTime @default(now())
  
  @@unique([staffId, date, startTime])
  @@index([staffId, date, isBooked])
}

model StaffSchedule {
  id        String    @id @default(cuid())
  staffId   String
  dayOfWeek DayOfWeek
  startTime String
  endTime   String
  isActive  Boolean   @default(true)
  breaks    Json?     // [{ start: "12:00", end: "13:00" }]
  
  @@unique([staffId, dayOfWeek])
}

model ServiceStaff {
  serviceId String
  staffId   String
  
  @@id([serviceId, staffId])
}

model AppointmentReminder {
  id            String   @id @default(cuid())
  appointmentId String
  type          ReminderType
  scheduledFor  DateTime
  sentAt        DateTime?
  status        ReminderStatus @default(PENDING)
  createdAt     DateTime @default(now())
  
  @@index([appointmentId, status])
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  CHECKED_IN
  IN_PROGRESS
  COMPLETED
  NO_SHOW
  CANCELLED
}

enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

enum ReminderType {
  EMAIL
  SMS
  WHATSAPP
}

enum ReminderStatus {
  PENDING
  SENT
  FAILED
}
`;

export default APPOINTMENT_SCHEDULER_ADDON;
