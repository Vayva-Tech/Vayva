import { z } from 'zod';

/**
 * Business Settings Schema
 * 
 * Core business configuration that affects all aspects of the platform.
 * These settings are universal across all industries.
 */

// ============================================================================
// BUSINESS PROFILE
// ============================================================================

export const businessProfileSchema = z.object({
  // Basic Information
  businessName: z.string().min(1, 'Business name is required'),
  legalBusinessName: z.string().optional(),
  tagline: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  
  // Contact Information
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  website: z.string().url('Invalid URL').optional(),
  
  // Address
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  
  // Operating Hours
  businessHours: z.object({
    monday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(), // "09:00"
      closeTime: z.string().optional(), // "17:00"
    }).optional(),
    tuesday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }).optional(),
    wednesday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }).optional(),
    thursday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }).optional(),
    friday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }).optional(),
    saturday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }).optional(),
    sunday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }).optional(),
  }).optional(),
  
  // Service Areas (for businesses that serve customers at their location)
  serviceAreas: z.array(z.object({
    type: z.enum(['city', 'state', 'zipCode', 'radius']),
    value: z.string(),
    radiusMiles: z.number().optional(), // Only for radius type
  })).optional(),
  
  // Tax Configuration
  taxConfig: z.object({
    taxId: z.string().optional(),
    defaultTaxRate: z.number().min(0).max(100).optional(),
    taxIncludedInPrices: z.boolean().default(false),
    chargeTaxOnShipping: z.boolean().default(false),
  }).optional(),
  
  // Social Media
  socialMedia: z.object({
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    youtube: z.string().url().optional(),
    tiktok: z.string().url().optional(),
  }).optional(),
});

export type BusinessProfile = z.infer<typeof businessProfileSchema>;

// ============================================================================
// BRANDING CONFIGURATION
// ============================================================================

export const brandingConfigSchema = z.object({
  // Logo & Images
  logo: z.object({
    url: z.string().url(),
    altText: z.string().optional(),
    height: z.number().optional(),
    width: z.number().optional(),
  }).optional(),
  
  favicon: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  
  // Colors
  colors: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be valid hex color'),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be valid hex color').optional(),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be valid hex color').optional(),
    success: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be valid hex color').optional(),
    warning: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be valid hex color').optional(),
    error: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be valid hex color').optional(),
  }).optional(),
  
  // Typography
  typography: z.object({
    fontFamilyHeading: z.string().optional(),
    fontFamilyBody: z.string().optional(),
    fontSizeBase: z.enum(['sm', 'base', 'lg']).optional(),
  }).optional(),
  
  // Theme
  theme: z.object({
    mode: z.enum(['light', 'dark', 'system']),
    sidebarColor: z.enum(['light', 'dark', 'primary', 'transparent']).optional(),
    headerColor: z.enum(['light', 'dark', 'primary', 'transparent']).optional(),
  }).default({ mode: 'light' }),
});

export type BrandingConfig = z.infer<typeof brandingConfigSchema>;

// ============================================================================
// LOCALIZATION CONFIGURATION
// ============================================================================

export const localizationConfigSchema = z.object({
  // Locale
  locale: z.string().default('en-US'),
  timezone: z.string().default('America/New_York'),
  
  // Currency
  currency: z.string().default('USD'),
  currencySymbol: z.string().default('$'),
  currencyPosition: z.enum(['before', 'after']).default('before'),
  currencyDecimalPlaces: z.number().min(0).max(4).default(2),
  
  // Date Format
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  timeFormat: z.enum(['12h', '24h']).default('12h'),
  firstDayOfWeek: z.enum(['sunday', 'monday']).default('sunday'),
  
  // Number Format
  numberFormat: z.object({
    decimalSeparator: z.enum(['.', ',']).default('.'),
    thousandsSeparator: z.enum(['', ',', '.']).default(','),
  }).optional(),
  
  // Measurement Units
  measurementSystem: z.enum(['imperial', 'metric']).default('imperial'),
});

export type LocalizationConfig = z.infer<typeof localizationConfigSchema>;

// ============================================================================
// COMBINED BUSINESS SETTINGS SCHEMA
// ============================================================================

export const businessSettingsSchema = z.object({
  profile: businessProfileSchema,
  branding: brandingConfigSchema,
  localization: localizationConfigSchema,
});

export type BusinessSettings = z.infer<typeof businessSettingsSchema>;
