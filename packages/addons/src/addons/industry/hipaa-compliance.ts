/**
 * HIPAA Compliance Add-On
 * 
 * Healthcare privacy and compliance management tools
 */

import { AddOnDefinition } from '../../types';

export const HIPAA_COMPLIANCE_ADDON: AddOnDefinition = {
  id: 'vayva.hipaa-compliance',
  name: 'HIPAA Compliance',
  description: 'Essential HIPAA compliance tools including audit logs, consent management, data retention policies, and breach notification workflows',
  tagline: 'Stay HIPAA compliant',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'ShieldCheck',
  tags: ['healthcare', 'hipaa', 'compliance', 'privacy', 'security'],
  compatibleTemplates: ['healthcare', 'clinic', 'medical', 'hospital', 'dental'],
  mountPoints: ['admin-panel', 'page-sidebar'],
  previewImages: {
    thumbnail: '/addons/hipaa-compliance/thumbnail.png',
    screenshots: ['/addons/hipaa-compliance/screenshot-1.png'],
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
    installCount: 450,
    rating: 4.9,
    reviewCount: 62,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/admin/compliance', title: 'HIPAA Compliance' },
      { route: '/admin/compliance/audit-log', title: 'Audit Log' },
      { route: '/admin/compliance/consents', title: 'Consent Management' },
    ],
    components: [
      { mountPoint: 'admin-panel', componentName: 'ComplianceDashboard' },
      { mountPoint: 'page-sidebar', componentName: 'ComplianceStatus' },
    ],
    apiRoutes: [
      { path: '/api/compliance/audit-log', methods: ['GET'] },
      { path: '/api/compliance/consent', methods: ['GET', 'POST'] },
      { path: '/api/compliance/breach-report', methods: ['POST'] },
    ],
    databaseModels: ['AuditLog', 'ConsentRecord', 'BreachReport', 'DataRetentionPolicy'],
  },
  highlights: [
    'Audit logging',
    'Consent tracking',
    'Breach workflows',
    'Data encryption',
    'Retention policies',
  ],
  installTimeEstimate: 4,
};

export const HIPAA_COMPLIANCE_MODELS = `
model AuditLog {
  id          String   @id @default(cuid())
  storeId     String
  userId      String?
  userType    String   // PATIENT, PROVIDER, ADMIN, SYSTEM
  action      String   // VIEW, CREATE, UPDATE, DELETE, EXPORT, PRINT
  resourceType String  // PATIENT_RECORD, PRESCRIPTION, APPOINTMENT, etc.
  resourceId  String?
  patientId   String?
  ipAddress   String?
  userAgent   String?
  description String   @db.Text
  success     Boolean  @default(true)
  failureReason String?
  sessionId   String?
  timestamp   DateTime @default(now())
  
  @@index([storeId, timestamp])
  @@index([patientId, action])
  @@index([userId, timestamp])
  @@index([resourceType, resourceId])
}

model ConsentRecord {
  id          String   @id @default(cuid())
  storeId     String
  patientId   String
  consentType String   // TREATMENT, TELEHEALTH, SHARING, MARKETING
  version     String
  documentUrl String?
  isGranted   Boolean  @default(false)
  grantedAt   DateTime?
  grantedVia  String?  // PORTAL, IN_PERSON, PHONE
  grantedBy   String?  // providerId or 'self'
  revokedAt   DateTime?
  revokedBy   String?
  revokedReason String?
  expiresAt   DateTime?
  signatureData String? @db.Text
  ipAddress   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([patientId, consentType, version])
  @@index([storeId, patientId])
  @@index([consentType, isGranted])
}

model BreachReport {
  id          String   @id @default(cuid())
  storeId     String
  incidentId  String   @unique
  discoveredAt DateTime
  reportedAt  DateTime @default(now())
  discoveredBy String
  breachType  String   // THEFT, LOSS, UNAUTHORIZED_ACCESS, DISCLOSURE
  description String   @db.Text
  affectedPatients Int
  affectedRecords Int
  affectedSystems String[]
  dataTypesInvolved String[]
  riskAssessment String? @db.Text
  mitigationSteps String? @db.Text
  notificationSentAt DateTime?
  hhsReportedAt DateTime?
  mediaNotifiedAt DateTime?
  individualsNotifiedAt DateTime?
  status      BreachStatus @default(INVESTIGATING)
  severity    BreachSeverity?
  assignedTo  String?
  closedAt    DateTime?
  lessonsLearned String? @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([storeId, status])
  @@index([discoveredAt])
  @@index([severity])
}

model DataRetentionPolicy {
  id          String   @id @default(cuid())
  storeId     String   @unique
  medicalRecordsYears Int     @default(7)
  billingRecordsYears Int    @default(7)
  auditLogsYears Int         @default(6)
  imagingFilesYears Int      @default(7)
  labResultsYears Int        @default(7)
  consentRecordsYears Int    @default(7)
  deletedRecordsRetentionDays Int @default(30)
  autoPurgeEnabled Boolean   @default(false)
  lastPurgeRun DateTime?
  nextScheduledPurge DateTime?
  legalHoldCases String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum BreachStatus {
  INVESTIGATING
  CONFIRMED
  CONTAINED
  NOTIFICATION_SENT
  RESOLVED
  CLOSED
}

enum BreachSeverity {
  LOW
  MODERATE
  HIGH
  CRITICAL
}
`;

export default HIPAA_COMPLIANCE_ADDON;
