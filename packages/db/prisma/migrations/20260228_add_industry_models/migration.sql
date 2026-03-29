-- Migration: Add Industry-Specific Models for Accommodation, Events, B2B, and Marketplace
-- Created: February 28, 2026

-- ============================================================================
-- TRAVEL & HOSPITALITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS "accommodations" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- room, suite, villa, apartment
    "description" TEXT NOT NULL,
    "maxGuests" INTEGER NOT NULL,
    "bedConfiguration" TEXT NOT NULL,
    "amenities" TEXT[] DEFAULT '{}',
    "images" TEXT[] DEFAULT '{}',
    "basePrice" DECIMAL(10,2) NOT NULL,
    "cleaningFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "serviceFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "accommodations_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "accommodations_storeId_idx" ON "accommodations"("storeId");
CREATE INDEX IF NOT EXISTS "accommodations_storeId_isActive_idx" ON "accommodations"("storeId", "isActive");

CREATE TABLE IF NOT EXISTS "availability_calendar" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "accommodationId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "priceOverride" DECIMAL(10,2),
    "minimumStay" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    
    CONSTRAINT "availability_calendar_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "accommodations"("id") ON DELETE CASCADE,
    UNIQUE ("accommodationId", "date")
);

CREATE INDEX IF NOT EXISTS "availability_calendar_accommodationId_date_idx" ON "availability_calendar"("accommodationId", "date");

CREATE TABLE IF NOT EXISTS "accommodation_bookings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "storeId" TEXT NOT NULL,
    "accommodationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "guests" INTEGER NOT NULL,
    "guestNames" TEXT[] DEFAULT '{}',
    "specialRequests" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmed', -- confirmed, checked_in, checked_out, cancelled, no_show
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cancellationPolicy" TEXT NOT NULL, -- flexible, moderate, strict
    "cancellationDate" TIMESTAMP(3),
    "refundAmount" DECIMAL(10,2),
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "keyCode" TEXT,
    "wifiCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "accommodation_bookings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE,
    CONSTRAINT "accommodation_bookings_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "accommodations"("id") ON DELETE CASCADE,
    CONSTRAINT "accommodation_bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "accommodation_bookings_storeId_status_idx" ON "accommodation_bookings"("storeId", "status");
CREATE INDEX IF NOT EXISTS "accommodation_bookings_accommodationId_checkIn_idx" ON "accommodation_bookings"("accommodationId", "checkIn");

CREATE TABLE IF NOT EXISTS "housekeeping_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "storeId" TEXT NOT NULL,
    "accommodationId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL, -- clean, inspect, maintenance, restock
    "priority" TEXT NOT NULL DEFAULT 'normal', -- low, normal, high, urgent
    "status" TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, skipped
    "assignedTo" TEXT,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "checklist" JSONB DEFAULT '{}',
    "issues" TEXT[] DEFAULT '{}',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "housekeeping_tasks_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE,
    CONSTRAINT "housekeeping_tasks_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "accommodations"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "housekeeping_tasks_storeId_status_idx" ON "housekeeping_tasks"("storeId", "status");
CREATE INDEX IF NOT EXISTS "housekeeping_tasks_accommodationId_scheduledFor_idx" ON "housekeeping_tasks"("accommodationId", "scheduledFor");

-- ============================================================================
-- EVENTS & NIGHTLIFE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "event_ticket_tiers" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "sold" INTEGER NOT NULL DEFAULT 0,
    "maxPerOrder" INTEGER NOT NULL DEFAULT 10,
    "saleStartsAt" TIMESTAMP(3) NOT NULL,
    "saleEndsAt" TIMESTAMP(3),
    "perks" TEXT[] DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    
    CONSTRAINT "event_ticket_tiers_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "products"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "event_ticket_tiers_eventId_isActive_idx" ON "event_ticket_tiers"("eventId", "isActive");

CREATE TABLE IF NOT EXISTS "event_seat_maps" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "eventId" TEXT NOT NULL UNIQUE,
    "svgLayout" TEXT NOT NULL,
    "sections" JSONB NOT NULL DEFAULT '{}',
    "seats" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "event_seat_maps_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "products"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "event_check_ins" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "ticketTier" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInBy" TEXT NOT NULL,
    "entryMethod" TEXT NOT NULL DEFAULT 'scan', -- scan, manual, nfc
    "seatAssigned" TEXT,
    "plusOnes" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    
    CONSTRAINT "event_check_ins_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "event_check_ins_orderId_checkedInAt_idx" ON "event_check_ins"("orderId", "checkedInAt");

CREATE TABLE IF NOT EXISTS "vip_table_reservations" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "storeId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "tableNumber" TEXT NOT NULL,
    "minSpend" DECIMAL(10,2) NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "bottleService" BOOLEAN NOT NULL DEFAULT false,
    "specialRequests" TEXT,
    "depositPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled, completed
    "arrivedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "actualSpend" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "vip_table_reservations_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE,
    CONSTRAINT "vip_table_reservations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "vip_table_reservations_storeId_date_idx" ON "vip_table_reservations"("storeId", "date");

CREATE TABLE IF NOT EXISTS "guest_lists" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "storeId" TEXT NOT NULL,
    "eventId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "guestCount" INTEGER NOT NULL DEFAULT 1,
    "promoterId" TEXT,
    "entryType" TEXT NOT NULL DEFAULT 'comp', -- comp, reduced, vip
    "arrived" BOOLEAN NOT NULL DEFAULT false,
    "arrivedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "guest_lists_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "guest_lists_storeId_date_idx" ON "guest_lists"("storeId", "date");

-- ============================================================================
-- SERVICES INDUSTRY
-- ============================================================================

CREATE TABLE IF NOT EXISTS "service_packages" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "services" JSONB NOT NULL DEFAULT '{}',
    "totalSessions" INTEGER NOT NULL,
    "validityDays" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "savings" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "service_packages_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "service_packages_storeId_isActive_idx" ON "service_packages"("storeId", "isActive");

CREATE TABLE IF NOT EXISTS "service_availability" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "serviceId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL, -- 0-6
    "startTime" TEXT NOT NULL, -- "09:00"
    "endTime" TEXT NOT NULL, -- "17:00"
    "slotDuration" INTEGER NOT NULL, -- minutes
    "bufferMinutes" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "exceptions" JSONB,
    
    CONSTRAINT "service_availability_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "products"("id") ON DELETE CASCADE,
    UNIQUE ("serviceId", "staffId", "dayOfWeek")
);

CREATE TABLE IF NOT EXISTS "staff_block_outs" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "staffId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "staff_block_outs_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "staff_block_outs_staffId_startDate_idx" ON "staff_block_outs"("staffId", "startDate");

CREATE TABLE IF NOT EXISTS "appointment_notes" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "bookingId" TEXT NOT NULL,
    "noteType" TEXT NOT NULL, -- service_notes, client_preferences, follow_up
    "content" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "appointment_notes_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "appointment_notes_bookingId_noteType_idx" ON "appointment_notes"("bookingId", "noteType");

CREATE TABLE IF NOT EXISTS "client_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "customerId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "category" TEXT NOT NULL, -- product, service, staff, time
    "preference" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "client_preferences_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE,
    CONSTRAINT "client_preferences_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "client_preferences_customerId_category_idx" ON "client_preferences"("customerId", "category");

-- ============================================================================
-- B2B WHOLESALE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "rfq_requests" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "storeId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "rfqNumber" TEXT NOT NULL UNIQUE,
    "status" TEXT NOT NULL DEFAULT 'open', -- open, quoted, accepted, rejected, expired
    "dueDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "deliveryLocation" TEXT,
    "paymentTerms" TEXT,
    "notes" TEXT,
    "attachments" TEXT[] DEFAULT '{}',
    "totalValue" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "rfq_requests_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE,
    CONSTRAINT "rfq_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "rfq_requests_storeId_status_idx" ON "rfq_requests"("storeId", "status");

CREATE TABLE IF NOT EXISTS "rfq_items" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "rfqId" TEXT NOT NULL,
    "productId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "targetPrice" DECIMAL(10,2),
    "specifications" TEXT,
    "quotedPrice" DECIMAL(10,2),
    "quotedQuantity" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending', -- pending, quoted, accepted, rejected
    "notes" TEXT,
    
    CONSTRAINT "rfq_items_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "rfq_requests"("id") ON DELETE CASCADE,
    CONSTRAINT "rfq_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "rfq_items_rfqId_idx" ON "rfq_items"("rfqId");

CREATE TABLE IF NOT EXISTS "volume_pricing_tiers" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "productId" TEXT NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "maxQuantity" INTEGER,
    "price" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    
    CONSTRAINT "volume_pricing_tiers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE,
    UNIQUE ("productId", "minQuantity")
);

CREATE TABLE IF NOT EXISTS "credit_applications" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "storeId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "yearsInBusiness" INTEGER NOT NULL,
    "annualRevenue" DECIMAL(10,2) NOT NULL,
    "tradeReferences" JSONB NOT NULL DEFAULT '{}',
    "bankReferences" JSONB NOT NULL DEFAULT '{}',
    "requestedLimit" DECIMAL(10,2) NOT NULL,
    "approvedLimit" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'pending', -- pending, approved, denied, review
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "documents" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "credit_applications_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE,
    CONSTRAINT "credit_applications_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "purchase_orders" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "storeId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "poNumber" TEXT NOT NULL UNIQUE,
    "quoteId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft', -- draft, sent, acknowledged, shipped, delivered, invoiced, paid
    "items" JSONB NOT NULL DEFAULT '{}',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "deliveryDate" TIMESTAMP(3),
    "deliveryAddress" TEXT,
    "specialInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "purchase_orders_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE,
    CONSTRAINT "purchase_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "purchase_orders_storeId_status_idx" ON "purchase_orders"("storeId", "status");

-- ============================================================================
-- MARKETPLACE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "vendors" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "storeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL UNIQUE,
    "businessName" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "commissionRate" DECIMAL(10,2) NOT NULL DEFAULT 10,
    "paymentSchedule" TEXT NOT NULL DEFAULT 'weekly', -- daily, weekly, biweekly, monthly
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "onboardingStatus" TEXT NOT NULL DEFAULT 'pending', -- pending, in_review, approved, rejected
    "documents" JSONB NOT NULL DEFAULT '{}',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "rating" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "totalSales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "vendors_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE,
    CONSTRAINT "vendors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "vendors_storeId_isActive_idx" ON "vendors"("storeId", "isActive");

CREATE TABLE IF NOT EXISTS "vendor_payouts" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "vendorId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalSales" DECIMAL(10,2) NOT NULL,
    "commission" DECIMAL(10,2) NOT NULL,
    "fees" DECIMAL(10,2) NOT NULL,
    "netPayout" DECIMAL(10,2) NOT NULL,
    "orderCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending', -- pending, processing, paid, failed
    "paymentMethod" TEXT NOT NULL, -- bank_transfer, wallet
    "paymentRef" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "vendor_payouts_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "vendor_payouts_vendorId_status_idx" ON "vendor_payouts"("vendorId", "status");

CREATE TABLE IF NOT EXISTS "marketplace_order_items" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "commission" DECIMAL(10,2) NOT NULL,
    "vendorPayout" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, shipped, delivered, returned
    "trackingNumber" TEXT,
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    
    CONSTRAINT "marketplace_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE,
    CONSTRAINT "marketplace_order_items_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE,
    CONSTRAINT "marketplace_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "marketplace_order_items_vendorId_status_idx" ON "marketplace_order_items"("vendorId", "status");

CREATE TABLE IF NOT EXISTS "marketplace_disputes" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "storeId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderItemId" TEXT,
    "customerId" TEXT NOT NULL,
    "vendorId" TEXT,
    "disputeType" TEXT NOT NULL, -- not_received, damaged, wrong_item, quality, other
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT[] DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'open', -- open, under_review, resolved, escalated, closed
    "resolution" TEXT, -- refund, replacement, partial_refund, reject
    "refundAmount" DECIMAL(10,2),
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "messages" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "marketplace_disputes_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE,
    CONSTRAINT "marketplace_disputes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE,
    CONSTRAINT "marketplace_disputes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "marketplace_disputes_storeId_status_idx" ON "marketplace_disputes"("storeId", "status");
CREATE INDEX IF NOT EXISTS "marketplace_disputes_vendorId_status_idx" ON "marketplace_disputes"("vendorId", "status");

-- ============================================================================
-- NONPROFIT
-- ============================================================================

CREATE TABLE IF NOT EXISTS "donors" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "storeId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "donorType" TEXT NOT NULL DEFAULT 'individual', -- individual, corporate, foundation
    "totalDonated" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "donationCount" INTEGER NOT NULL DEFAULT 0,
    "firstDonation" TIMESTAMP(3),
    "lastDonation" TIMESTAMP(3),
    "preferredCause" TEXT,
    "communicationPreference" TEXT NOT NULL DEFAULT 'email', -- email, phone, mail
    "isRecurringDonor" BOOLEAN NOT NULL DEFAULT false,
    "recurringAmount" DECIMAL(10,2),
    "notes" TEXT,
    "tags" TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "donors_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE,
    CONSTRAINT "donors_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "donors_storeId_totalDonated_idx" ON "donors"("storeId", "totalDonated");

CREATE TABLE IF NOT EXISTS "fundraising_campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "goalAmount" DECIMAL(10,2) NOT NULL,
    "raisedAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "donorCount" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "coverImage" TEXT,
    "videoUrl" TEXT,
    "category" TEXT, -- education, health, environment, etc.
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "impactMetrics" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "fundraising_campaigns_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "fundraising_campaigns_storeId_isActive_idx" ON "fundraising_campaigns"("storeId", "isActive");

CREATE TABLE IF NOT EXISTS "recurring_donations" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "storeId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "frequency" TEXT NOT NULL, -- weekly, monthly, quarterly, annually
    "startDate" TIMESTAMP(3) NOT NULL,
    "nextChargeDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active', -- active, paused, cancelled, failed
    "campaignId" TEXT,
    "paymentMethod" TEXT NOT NULL, -- card, bank, wallet
    "lastChargedAt" TIMESTAMP(3),
    "totalCharged" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "chargeCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "recurring_donations_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE,
    CONSTRAINT "recurring_donations_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "donors"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "recurring_donations_storeId_status_idx" ON "recurring_donations"("storeId", "status");

CREATE TABLE IF NOT EXISTS "donation_receipts" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "donationId" TEXT NOT NULL UNIQUE,
    "receiptNumber" TEXT NOT NULL UNIQUE,
    "donorId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT,
    "isTaxDeductible" BOOLEAN NOT NULL DEFAULT true,
    "taxId" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "downloadedAt" TIMESTAMP(3),
    
    CONSTRAINT "donation_receipts_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "donors"("id") ON DELETE CASCADE
);

-- ============================================================================
-- AUTOMOTIVE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "vehicle_test_drives" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "storeId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "alternateDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, completed, cancelled, no_show
    "salesPersonId" TEXT,
    "notes" TEXT,
    "licenseVerified" BOOLEAN NOT NULL DEFAULT false,
    "insuranceVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "vehicle_test_drives_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "vehicle_test_drives_storeId_status_idx" ON "vehicle_test_drives"("storeId", "status");
CREATE INDEX IF NOT EXISTS "vehicle_test_drives_vehicleId_preferredDate_idx" ON "vehicle_test_drives"("vehicleId", "preferredDate");

CREATE TABLE IF NOT EXISTS "vehicle_history_reports" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "vehicleId" TEXT NOT NULL UNIQUE,
    "vin" TEXT NOT NULL,
    "reportProvider" TEXT NOT NULL, -- carfax, autocheck, etc.
    "reportUrl" TEXT NOT NULL,
    "accidents" INTEGER NOT NULL DEFAULT 0,
    "owners" INTEGER NOT NULL DEFAULT 0,
    "serviceRecords" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "isClean" BOOLEAN NOT NULL DEFAULT true,
    "redFlags" TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "trade_in_valuations" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "storeId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "condition" TEXT NOT NULL, -- excellent, good, fair, poor
    "vin" TEXT,
    "estimatedValue" DECIMAL(10,2) NOT NULL,
    "offerPrice" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, converted
    "vehicleId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "trade_in_valuations_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "trade_in_valuations_storeId_status_idx" ON "trade_in_valuations"("storeId", "status");

CREATE TABLE IF NOT EXISTS "financing_applications" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "storeId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "downPayment" DECIMAL(10,2) NOT NULL,
    "loanAmount" DECIMAL(10,2) NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "interestRate" DECIMAL(10,2),
    "monthlyPayment" DECIMAL(10,2),
    "creditScore" INTEGER,
    "employmentStatus" TEXT NOT NULL,
    "annualIncome" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'pending', -- pending, approved, denied, documents_required
    "lenderId" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "documents" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "financing_applications_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "financing_applications_storeId_status_idx" ON "financing_applications"("storeId", "status");
