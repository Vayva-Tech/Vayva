/**
 * Event Calendar Add-On
 * 
 * Events management with ticketing and RSVPs
 */

import { AddOnDefinition } from '../../types';

export const EVENT_CALENDAR_ADDON: AddOnDefinition = {
  id: 'vayva.event-calendar',
  name: 'Event Calendar',
  description: 'Complete event management with calendar views, ticketing, RSVPs, and attendee management',
  tagline: 'Host events that sell out',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'CalendarRange',
  tags: ['events', 'calendar', 'ticketing', 'rsvp', 'bookings'],
  compatibleTemplates: ['events', 'entertainment', 'venue'],
  mountPoints: ['hero-section', 'page-sidebar', 'below-fold'],
  previewImages: {
    thumbnail: '/addons/event-calendar/thumbnail.png',
    screenshots: ['/addons/event-calendar/screenshot-1.png'],
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
    installCount: 1500,
    rating: 4.5,
    reviewCount: 78,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/events', title: 'Events' },
      { route: '/events/calendar', title: 'Event Calendar' },
      { route: '/events/[slug]', title: 'Event Details' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'FeaturedEvents' },
      { mountPoint: 'page-sidebar', componentName: 'EventFilters' },
    ],
    apiRoutes: [
      { path: '/api/events', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/events/rsvp', methods: ['POST', 'DELETE'] },
      { path: '/api/events/tickets', methods: ['GET', 'POST'] },
    ],
    databaseModels: ['Event', 'EventTicket', 'EventAttendee', 'EventCategory'],
  },
  highlights: [
    'Calendar & list views',
    'Ticketing & RSVPs',
    'Recurring events',
    'Venue management',
    'Attendee check-in',
  ],
  installTimeEstimate: 3,
};

export const EVENT_CALENDAR_MODELS = `
model Event {
  id          String   @id @default(cuid())
  storeId     String
  title       String
  slug        String
  description String?
  categoryId  String?
  category    EventCategory? @relation(fields: [categoryId], references: [id])
  
  // Timing
  startDate   DateTime
  endDate     DateTime?
  timezone    String   @default("Africa/Lagos")
  isRecurring Boolean  @default(false)
  recurrence  Json?    // { frequency: "weekly", interval: 1, ends: "date" | "count" }
  
  // Location
  venue       String?
  address     String?
  city        String?
  state       String?
  coordinates Json?    // { lat, lng }
  isVirtual   Boolean  @default(false)
  virtualLink String?
  
  // Media
  image       String?
  gallery     String[]
  
  // Tickets & Capacity
  capacity    Int?
  tickets     EventTicket[]
  attendees   EventAttendee[]
  waitlist    EventWaitlist[]
  
  // Status
  status      EventStatus @default(DRAFT)
  visibility  EventVisibility @default(PUBLIC)
  
  // Organizer
  organizerName String?
  organizerEmail String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([storeId, slug])
  @@index([storeId, status, startDate])
}

model EventCategory {
  id          String   @id @default(cuid())
  storeId     String
  name        String
  color       String?
  sortOrder   Int      @default(0)
  events      Event[]
  createdAt   DateTime @default(now())
  
  @@index([storeId])
}

model EventTicket {
  id          String   @id @default(cuid())
  eventId     String
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  quantity    Int
  sold        Int      @default(0)
  available   Int      // computed
  startSale   DateTime
  endSale     DateTime?
  isActive    Boolean  @default(true)
  maxPerOrder Int      @default(10)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([eventId, isActive])
}

model EventAttendee {
  id          String   @id @default(cuid())
  eventId     String
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  ticketId    String?
  ticket      EventTicket? @relation(fields: [ticketId], references: [id])
  customerId  String?
  email       String
  firstName   String
  lastName    String
  phone       String?
  quantity    Int      @default(1)
  status      AttendeeStatus @default(CONFIRMED)
  checkedIn   Boolean  @default(false)
  checkedInAt DateTime?
  qrCode      String?
  answers     Json?    // { questionId: answer }
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([eventId, status])
  @@index([email])
}

model EventWaitlist {
  id          String   @id @default(cuid())
  eventId     String
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  email       String
  name        String
  phone       String?
  quantity    Int      @default(1)
  notifiedAt  DateTime?
  createdAt   DateTime @default(now())
  
  @@index([eventId, notifiedAt])
}

enum EventStatus {
  DRAFT
  PUBLISHED
  SOLD_OUT
  CANCELLED
  COMPLETED
}

enum EventVisibility {
  PUBLIC
  PRIVATE
  INVITE_ONLY
}

enum AttendeeStatus {
  CONFIRMED
  CANCELLED
  NO_SHOW
  REFUNDED
}
`;

export default EVENT_CALENDAR_ADDON;
