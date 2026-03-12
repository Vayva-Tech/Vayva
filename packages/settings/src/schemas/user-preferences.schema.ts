import { z } from 'zod';

/**
 * User Preferences Schema
 * 
 * Individual user settings that don't affect the business globally.
 */

// ============================================================================
// THEME PREFERENCES
// ============================================================================

export const themePreferenceSchema = z.object({
  // Color Theme
  mode: z.enum(['light', 'dark', 'system']).default('system'),
  
  // Accent Color
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be valid hex color').default('#3B82F6'),
  
  // Density
  density: z.enum(['compact', 'comfortable', 'spacious']).default('comfortable'),
  
  // Font Size
  fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
  
  // Contrast
  highContrast: z.boolean().default(false),
  
  // Reduce Motion
  reduceMotion: z.boolean().default(false),
});

export type ThemePreference = z.infer<typeof themePreferenceSchema>;

// ============================================================================
// ACCESSIBILITY OPTIONS
// ============================================================================

export const accessibilityOptionsSchema = z.object({
  // Visual
  screenReaderOptimized: z.boolean().default(false),
  dyslexiaFriendlyFont: z.boolean().default(false),
  colorBlindMode: z.enum(['none', 'deuteranopia', 'protanopia', 'tritanopia']).default('none'),
  
  // Motor
  keyboardNavigationOnly: z.boolean().default(false),
  voiceControlEnabled: z.boolean().default(false),
  
  // Cognitive
  simplifiedLayout: z.boolean().default(false),
  focusMode: z.boolean().default(false), // Hide distractions
  readingAssist: z.boolean().default(false),
  
  // Hearing
  captionsAlwaysOn: z.boolean().default(false),
  visualAlerts: z.boolean().default(false),
});

export type AccessibilityOptions = z.infer<typeof accessibilityOptionsSchema>;

// ============================================================================
// WORKSPACE PREFERENCES
// ============================================================================

export const workspacePreferencesSchema = z.object({
  // Default Views
  defaultDashboard: z.string().optional(), // Dashboard ID
  defaultLandingPage: z.string().default('/dashboard'),
  
  // List/Table Preferences
  itemsPerPage: z.number().min(5).max(100).default(20),
  defaultSortField: z.string().optional(),
  defaultSortOrder: z.enum(['asc', 'desc']).default('desc'),
  viewMode: z.enum(['list', 'grid', 'kanban', 'calendar']).default('list'),
  
  // Editor Preferences
  richTextEditor: z.boolean().default(true),
  markdownSupport: z.boolean().default(false),
  autoSave: z.boolean().default(true),
  autoSaveIntervalSeconds: z.number().min(5).max(300).default(30),
  
  // Search & Filter
  saveSearchFilters: z.boolean().default(true),
  recentSearchesCount: z.number().min(0).max(20).default(5),
  
  // Clipboard
  enableClipboardHistory: z.boolean().default(false),
  clipboardHistorySize: z.number().min(1).max(50).default(10),
});

// ============================================================================
// LANGUAGE & REGION
// ============================================================================

export const languageRegionSchema = z.object({
  // Language
  language: z.string().default('en'),
  secondaryLanguages: z.array(z.string()).optional(),
  
  // Region
  region: z.string().default('US'),
  
  // Date/Time
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  timeFormat: z.enum(['12h', '24h']).default('12h'),
  firstDayOfWeek: z.enum(['sunday', 'monday']).default('sunday'),
  
  // Numbers
  numberFormat: z.object({
    decimalSeparator: z.enum(['.', ',']).default('.'),
    thousandsSeparator: z.enum(['', ',', '.']).default(','),
  }),
  
  // Currency Display
  showCurrencySymbol: z.boolean().default(true),
  currencyCodePosition: z.enum(['before', 'after']).default('before'),
});

// ============================================================================
// PRIVACY & DATA
// ============================================================================

export const privacyDataSchema = z.object({
  // Activity Tracking
  trackActivity: z.boolean().default(true),
  trackProductivity: z.boolean().default(false),
  shareUsageAnalytics: z.boolean().default(true),
  
  // Data Retention
  retainSearchHistory: z.boolean().default(true),
  searchHistoryDays: z.number().min(0).max(365).default(90),
  retainViewedItems: z.boolean().default(true),
  viewedItemsDays: z.number().min(0).max(365).default(30),
  
  // Profile Visibility
  profileVisibility: z.enum(['public', 'team-only', 'private']).default('team-only'),
  showOnlineStatus: z.boolean().default(true),
  showContactInfo: z.boolean().default(false),
});

// ============================================================================
// SHORTCUTS & HOTKEYS
// ============================================================================

export const shortcutsHotkeysSchema = z.object({
  // Enable/Disable
  enableKeyboardShortcuts: z.boolean().default(true),
  
  // Custom Shortcuts
  customShortcuts: z.array(z.object({
    key: z.string(),
    modifiers: z.array(z.enum(['ctrl', 'cmd', 'shift', 'alt'])),
    action: z.string(),
  })).optional(),
  
  // Quick Actions
  quickActionsShortcut: z.boolean().default(true),
  quickActionsKey: z.string().default('k'), // e.g., Cmd+K
});

// ============================================================================
// COMBINED USER PREFERENCES SCHEMA
// ============================================================================

export const userPreferencesSchema = z.object({
  // Appearance
  theme: themePreferenceSchema,
  accessibility: accessibilityOptionsSchema,
  
  // Workspace
  workspace: workspacePreferencesSchema,
  
  // Language & Region
  languageRegion: languageRegionSchema,
  
  // Privacy
  privacy: privacyDataSchema,
  
  // Shortcuts
  shortcuts: shortcutsHotkeysSchema,
  
  // Session
  sessionTimeout: z.number().min(5).max(1440).default(60), // Minutes
  rememberMe: z.boolean().default(true),
  multiSessionAllowed: z.boolean().default(true),
  
  // Onboarding
  onboardingCompleted: z.boolean().default(false),
  featureTourDismissed: z.array(z.string()).optional(), // Feature IDs
  
  // Beta Features
  optInBetaFeatures: z.boolean().default(false),
  betaFeatureFlags: z.record(z.boolean()).optional(),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;
