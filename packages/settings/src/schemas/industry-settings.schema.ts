import { z } from 'zod';

/**
 * Industry-Specific Settings Schema
 * 
 * Extensible schema that allows each industry to define its own
 * configuration options while maintaining a common structure.
 */

// ============================================================================
// COMMON INDUSTRY SETTINGS (Shared Across Multiple Verticals)
// ============================================================================

export const appointmentSettingsSchema = z.object({
  // Appointment Configuration (Healthcare, Wellness, Professional Services, etc.)
  enableAppointments: z.boolean().default(true),
  bookingWindow: z.object({
    daysInAdvance: z.number().min(1).max(365).default(90),
    hoursBeforeBooking: z.number().min(0).max(168).default(24), // Minimum notice
  }),
  cancellationPolicy: z.object({
    allowCancellation: z.boolean().default(true),
    cancellationDeadlineHours: z.number().min(0).max(168).default(24),
    cancellationFee: z.number().min(0).max(100).optional(), // Percentage
  }),
  noShowPolicy: z.object({
    chargeNoShowFee: z.boolean().default(false),
    noShowFee: z.number().min(0).max(100).optional(), // Percentage or flat rate
  }),
  reminders: z.object({
    sendEmailReminder: z.boolean().default(true),
    sendSmsReminder: z.boolean().default(false),
    reminderTimes: z.array(z.number()).default([24, 2]), // Hours before appointment
  }),
  bufferTime: z.object({
    beforeAppointment: z.number().min(0).max(60).default(0), // Minutes
    afterAppointment: z.number().min(0).max(60).default(0), // Minutes
  }),
});

export const inventorySettingsSchema = z.object({
  // Inventory Configuration (Retail, Grocery, Fashion, etc.)
  trackInventory: z.boolean().default(true),
  lowStockThreshold: z.number().min(0).default(10),
  allowBackorders: z.boolean().default(false),
  hideOutOfStock: z.boolean().default(false),
  
  // Reorder Settings
  autoReorderEnabled: z.boolean().default(false),
  reorderPoint: z.number().min(0).optional(),
  reorderQuantity: z.number().min(0).optional(),
  safetyStockDays: z.number().min(0).default(7),
  
  // Stock Rotation
  stockRotationMethod: z.enum(['FIFO', 'LIFO', 'FEFO']).default('FIFO'), // First-Expired-First-Out
  
  // Multi-location
  trackByLocation: z.boolean().default(false),
  allowTransferBetweenLocations: z.boolean().default(true),
});

export const deliverySettingsSchema = z.object({
  // Delivery Configuration (Restaurant, Grocery, Retail, etc.)
  enableDelivery: z.boolean().default(true),
  deliveryRadius: z.number().min(0).max(50).default(10), // Miles
  
  // Pricing
  deliveryFeeType: z.enum(['flat', 'percentage', 'distance', 'free']).default('flat'),
  flatDeliveryFee: z.number().min(0).default(5.00),
  percentageDeliveryFee: z.number().min(0).max(100).default(10),
  minimumOrderForDelivery: z.number().min(0).default(0),
  freeDeliveryThreshold: z.number().min(0).optional(),
  
  // Zones
  deliveryZones: z.array(z.object({
    name: z.string(),
    zipCodes: z.array(z.string()),
    fee: z.number(),
    estimatedTime: z.string(),
  })).optional(),
  
  // Time
  estimatedDeliveryTime: z.string().default('30-45 mins'),
  scheduleDeliveryEnabled: z.boolean().default(true),
  maxDeliveriesPerSlot: z.number().min(1).default(10),
});

export const paymentSettingsSchema = z.object({
  // Payment Configuration (Universal)
  acceptedPaymentMethods: z.object({
    cash: z.boolean().default(true),
    creditCard: z.boolean().default(true),
    debitCard: z.boolean().default(true),
    digitalWallet: z.boolean().default(true), // Apple Pay, Google Pay
    bankTransfer: z.boolean().default(false),
    check: z.boolean().default(false),
    financing: z.boolean().default(false), // Affirm, Klarna
  }),
  
  // Credit Cards
  acceptedCards: z.array(z.enum(['visa', 'mastercard', 'amex', 'discover'])).default(['visa', 'mastercard', 'amex', 'discover']),
  
  // Tipping
  tippingEnabled: z.boolean().default(true),
  suggestedTipPercentages: z.array(z.number()).default([15, 18, 20, 25]),
  customTipAllowed: z.boolean().default(true),
  
  // Deposits
  depositRequired: z.boolean().default(false),
  depositPercentage: z.number().min(0).max(100).default(0),
  
  // Auto-pay
  autoPayEnabled: z.boolean().default(false),
  autoPayTrigger: z.enum(['on_booking', 'on_completion', 'on_invoice']).default('on_invoice'),
});

// ============================================================================
// INDUSTRY-SPECIFIC CONFIGURATIONS
// ============================================================================

// Healthcare Specific
export const healthcareSpecificSchema = z.object({
  hipaaComplianceMode: z.boolean().default(true),
  phiAuditLogRetention: z.number().min(1).max(2555).default(2190), // Days (6 years)
  patientPrivacyLevel: z.enum(['standard', 'enhanced', 'maximum']).default('maximum'),
  
  // Insurance
  acceptInsurance: z.boolean().default(true),
  insuranceProviders: z.array(z.object({
    name: z.string(),
    payerId: z.string(),
    acceptedPlans: z.array(z.string()),
  })).optional(),
  
  // EHR Integration
  ehrIntegration: z.object({
    enabled: z.boolean().default(false),
    system: z.enum(['epic', 'cerner', 'allscripts', 'athenahealth', 'other']).optional(),
    apiEndpoint: z.string().url().optional(),
  }),
  
  // Prescriptions
  ePrescribingEnabled: z.boolean().default(true),
  controlledSubstanceLicense: z.string().optional(),
  
  // Clinical
  defaultAppointmentDuration: z.number().min(5).max(120).default(30), // Minutes
  useClinicalProtocols: z.boolean().default(true),
  icd10CodeLookup: z.boolean().default(true),
});

// Restaurant Specific
export const restaurantSpecificSchema = z.object({
  // Service Style
  serviceStyle: z.enum(['dine-in', 'takeout', 'delivery', 'full-service']).default('full-service'),
  
  // Table Management
  tableManagement: z.object({
    enableReservations: z.boolean().default(true),
    averageTurnTime: z.number().min(15).max(180).default(60), // Minutes
    autoSeat: z.boolean().default(false),
    mergeTables: z.boolean().default(true),
  }),
  
  // Menu
  menuDisplay: z.enum(['qr-code', 'tablet', 'printed', 'digital-screen']).default('qr-code'),
  allergenInfoDisplayed: z.boolean().default(true),
  nutritionalInfoDisplayed: z.boolean().default(false),
  
  // Kitchen
  kdsEnabled: z.boolean().default(true),
  courseFiring: z.object({
    firingMethod: z.enum(['automatic', 'manual']).default('automatic'),
    timeBetweenCourses: z.number().min(5).max(60).default(15), // Minutes
  }),
  
  // Staff
  tipPooling: z.object({
    enabled: z.boolean().default(true),
    distributionMethod: z.enum(['equal', 'by-hours', 'by-sales', 'points']).default('equal'),
    frontOfHouseParticipation: z.boolean().default(true),
    backOfHouseParticipation: z.boolean().default(false),
  }),
  
  // Auto-gratuity
  autoGratuity: z.object({
    enabled: z.boolean().default(false),
    partySizeThreshold: z.number().min(2).max(20).default(6),
    gratuityPercentage: z.number().min(0).max(100).default(18),
  }),
});

// Legal Specific
export const legalSpecificSchema = z.object({
  // Practice Areas
  practiceAreas: z.array(z.string()).default(['General Practice']),
  
  // Billing
  billingModel: z.enum(['hourly', 'flat-fee', 'contingency', 'retainer']).default('hourly'),
  hourlyRate: z.number().min(0).default(250),
  billingIncrement: z.enum(['6min', '15min', '30min']).default('6min'), // Tenths of an hour
  
  // Trust Accounting
  trustAccounting: z.object({
    ioltaCompliant: z.boolean().default(true),
    trustAccountBalance: z.number().min(0).default(0),
    minimumTrustBalance: z.number().min(0).default(1000),
    notifyOnLowTrust: z.boolean().default(true),
  }),
  
  // Conflict Checking
  conflictChecking: z.object({
    enabled: z.boolean().default(true),
    checkFrequency: z.enum(['on-new-matter', 'daily', 'weekly']).default('on-new-matter'),
    includeRelatedParties: z.boolean().default(true),
  }),
  
  // Document Retention
  documentRetention: z.object({
    retentionPeriodYears: z.number().min(1).max(50).default(7),
    autoArchive: z.boolean().default(true),
    destructionSchedule: z.enum(['immediate', 'annual', 'as-needed']).default('annual'),
  }),
  
  // Court Integration
  courtFilingIntegration: z.boolean().default(false),
  jurisdictionDefaults: z.array(z.object({
    court: z.string(),
    filingDeadlineBufferDays: z.number().default(3),
  })).optional(),
});

// Retail Specific
export const retailSpecificSchema = z.object({
  // Channel Management
  channelSync: z.object({
    syncOnlineAndPos: z.boolean().default(true),
    syncMarketplaces: z.boolean().default(false),
    syncFrequency: z.enum(['realtime', 'hourly', 'daily']).default('realtime'),
  }),
  
  // Pricing Strategy
  pricingStrategy: z.enum(['everyday-low', 'high-low', 'competitive', 'premium']).default('competitive'),
  dynamicPricingEnabled: z.boolean().default(false),
  markdownOptimization: z.boolean().default(false),
  
  // Customer Loyalty
  loyaltyProgram: z.object({
    enabled: z.boolean().default(true),
    programType: z.enum(['points', 'tiered', 'subscription', 'value-based']).default('points'),
    pointsPerDollar: z.number().min(0).default(1),
    rewardRedemptionRate: z.number().min(0).max(100).default(100), // Points per $1 reward
  }),
  
  // Returns
  returnPolicy: z.object({
    returnWindowDays: z.number().min(0).max(365).default(30),
    refundMethod: z.enum(['original-payment', 'store-credit', 'exchange']).default('original-payment'),
    restockingFee: z.number().min(0).max(100).default(0),
    receiptRequired: z.boolean().default(true),
  }),
  
  // Purchase Orders
  autoPurchaseOrders: z.boolean().default(false),
  preferredVendors: z.array(z.string()).optional(),
});

// Real Estate Specific
export const realEstateSpecificSchema = z.object({
  // MLS Integration
  mlsIntegration: z.object({
    enabled: z.boolean().default(false),
    mlsId: z.string().optional(),
    autoSync: z.boolean().default(true),
    syncFrequency: z.enum(['realtime', 'hourly', 'daily']).default('hourly'),
  }),
  
  // Property Types
  propertyTypes: z.array(z.enum(['residential', 'commercial', 'land', 'multi-family', 'industrial'])).default(['residential']),
  
  // Commission
  defaultCommissionRate: z.number().min(0).max(100).default(6), // Percentage
  commissionSplit: z.object({
    listingAgentPercentage: z.number().min(0).max(100).default(50),
    buyingAgentPercentage: z.number().min(0).max(100).default(50),
  }),
  
  // Showing Management
  showingPreferences: z.object({
    showingWindow: z.object({
      minNoticeHours: z.number().min(0).max(168).default(2),
      maxNoticeHours: z.number().min(0).max(168).default(168),
    }),
    feedbackRequest: z.boolean().default(true),
    lockboxAccess: z.boolean().default(false),
  }),
  
  // Transaction Management
  transactionCoordinator: z.boolean().default(false),
  standardDisclosureForms: z.array(z.string()).optional(),
  escrowTimelineDays: z.number().min(1).max(90).default(30),
});

// Events Specific
export const eventsSpecificSchema = z.object({
  // Event Types
  eventTypes: z.array(z.enum(['wedding', 'corporate', 'social', 'nonprofit', 'private'])).default(['wedding', 'corporate']),
  
  // Capacity
  maxGuestCount: z.number().min(0).default(500),
  minGuestCount: z.number().min(0).default(10),
  
  // Venue
  venueLayout: z.object({
    indoorCapacity: z.number().optional(),
    outdoorCapacity: z.number().optional(),
    standingRoomOnly: z.boolean().default(false),
    accessibleSeating: z.boolean().default(true),
  }),
  
  // Vendor Management
  preferredVendors: z.array(z.object({
    category: z.string(),
    vendorName: z.string(),
    contactInfo: z.string(),
    preferredPricing: z.boolean().default(false),
  })).optional(),
  
  // Setup/Breakdown
  setupBreakdown: z.object({
    setupTimeIncluded: z.number().min(0).default(4), // Hours
    breakdownTimeIncluded: z.number().min(0).default(2), // Hours
    overtimeHourlyRate: z.number().min(0).default(150),
  }),
  
  // RSVP
  rsvpManagement: z.object({
    rsvpDeadlineDays: z.number().min(1).max(90).default(7),
    autoReminders: z.boolean().default(true),
    mealSelection: z.boolean().default(true),
    plusOnesAllowed: z.boolean().default(true),
  }),
});

// ============================================================================
// COMBINED INDUSTRY SETTINGS SCHEMA
// ============================================================================

export const industrySettingsSchema = z.object({
  // Common Settings (Available to All Industries)
  appointments: appointmentSettingsSchema.optional(),
  inventory: inventorySettingsSchema.optional(),
  delivery: deliverySettingsSchema.optional(),
  payments: paymentSettingsSchema.optional(),
  
  // Industry-Specific Extensions
  healthcare: healthcareSpecificSchema.optional(),
  restaurant: restaurantSpecificSchema.optional(),
  legal: legalSpecificSchema.optional(),
  retail: retailSpecificSchema.optional(),
  realestate: realEstateSpecificSchema.optional(),
  events: eventsSpecificSchema.optional(),
  
  // Placeholder for other industries (can be extended)
  custom: z.record(z.any()).optional(),
});

export type IndustrySettings = z.infer<typeof industrySettingsSchema>;
export type IndustrySpecificConfig = 
  | HealthcareSpecific
  | RestaurantSpecific
  | LegalSpecific
  | RetailSpecific
  | RealEstateSpecific
  | EventsSpecific;

export type HealthcareSpecific = z.infer<typeof healthcareSpecificSchema>;
export type RestaurantSpecific = z.infer<typeof restaurantSpecificSchema>;
export type LegalSpecific = z.infer<typeof legalSpecificSchema>;
export type RetailSpecific = z.infer<typeof retailSpecificSchema>;
export type RealEstateSpecific = z.infer<typeof realEstateSpecificSchema>;
export type EventsSpecific = z.infer<typeof eventsSpecificSchema>;
