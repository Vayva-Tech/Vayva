/**
 * Wellness Tracking Add-On
 * 
 * Patient wellness tracking and health goals
 */

import type { AddOnDefinition } from '../../types';

export const WELLNESS_TRACKING_ADDON: AddOnDefinition = {
  id: 'vayva.wellness-tracking',
  name: 'Wellness Tracking',
  description: 'Comprehensive wellness tracking for patients including vitals, health goals, activity tracking, and progress reports',
  tagline: 'Track your wellness journey',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'Heart',
  tags: ['healthcare', 'wellness', 'tracking', 'health', 'fitness'],
  compatibleTemplates: ['healthcare', 'clinic', 'wellness', 'fitness'],
  mountPoints: ['patient-portal', 'page-sidebar', 'floating-button'],
  previewImages: {
    thumbnail: '/addons/wellness-tracking/thumbnail.png',
    screenshots: ['/addons/wellness-tracking/screenshot-1.png'],
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
    installCount: 320,
    rating: 4.6,
    reviewCount: 41,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/wellness', title: 'Wellness Dashboard' },
      { route: '/wellness/goals', title: 'Health Goals' },
      { route: '/wellness/vitals', title: 'Vitals History' },
    ],
    components: [
      { mountPoint: 'patient-portal', componentName: 'WellnessDashboard' },
      { mountPoint: 'floating-button', componentName: 'LogVitalsButton' },
    ],
    apiRoutes: [
      { path: '/api/wellness/vitals', methods: ['GET', 'POST'] },
      { path: '/api/wellness/goals', methods: ['GET', 'POST', 'PUT'] },
    ],
    databaseModels: ['VitalReading', 'HealthGoal', 'WellnessEntry'],
  },
  highlights: [
    'Vitals tracking',
    'Health goals',
    'Progress charts',
    'Activity logging',
    'Provider sharing',
  ],
  installTimeEstimate: 3,
};

export const WELLNESS_TRACKING_MODELS = `
model VitalReading {
  id          String   @id @default(cuid())
  storeId     String
  patientId   String
  readingType VitalType
  value       Decimal
  unit        String
  measuredAt  DateTime
  measuredBy  String?  // providerId or 'self'
  deviceId    String?  // connected device
  notes       String?
  isAbnormal  Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  @@index([storeId, patientId])
  @@index([readingType, measuredAt])
  @@index([isAbnormal])
}

model HealthGoal {
  id          String   @id @default(cuid())
  storeId     String
  patientId   String
  goalType    String
  title       String
  description String?
  targetValue Decimal?
  currentValue Decimal?
  unit        String?
  startDate   DateTime
  targetDate  DateTime?
  status      GoalStatus @default(ACTIVE)
  reminderFrequency String?
  providerId  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, patientId])
  @@index([status, targetDate])
}

model WellnessEntry {
  id          String   @id @default(cuid())
  storeId     String
  patientId   String
  entryType   String
  date        DateTime
  mood        Int?     // 1-10 scale
  sleepHours  Decimal?
  sleepQuality Int?    // 1-5 scale
  stressLevel Int?     // 1-10 scale
  energyLevel Int?     // 1-10 scale
  notes       String?  @db.Text
  activities  String[]
  symptoms    String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, patientId])
  @@index([date])
}

enum VitalType {
  WEIGHT
  BLOOD_PRESSURE_SYSTOLIC
  BLOOD_PRESSURE_DIASTOLIC
  HEART_RATE
  TEMPERATURE
  BLOOD_GLUCOSE
  OXYGEN_SATURATION
  RESPIRATORY_RATE
  HEIGHT
  BMI
  BODY_FAT_PERCENTAGE
}

enum GoalStatus {
  ACTIVE
  ACHIEVED
  PAUSED
  ABANDONED
}
`;

export default WELLNESS_TRACKING_ADDON;
