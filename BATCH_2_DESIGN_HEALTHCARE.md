# Batch 2 Design Document: HEALTHCARE Industry Dashboard
## Signature Clean Design with HIPAA Compliance

**Document Version:** 1.0  
**Industry:** Healthcare & Medical Practice  
**Design Category:** Signature Clean (HIPAA-Compliant)  
**Plan Tier Support:** Basic → Pro  
**Last Updated:** 2026-03-11

---

## 1. Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (Clean White/Light - HIPAA Secure)                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  [Logo]  Dashboard  Patients  Appointments  Queue  Prescriptions  Analytics ▼  │  │
│  │                                                            🔒 [🔔] [👤 Dr. Pro]│  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  PRACTICE OVERVIEW                    [+ New Patient] [📊 Daily Report]        │  │
│  │  "March 11, 2026 | Dr. Sarah Johnson, MD"                                     │  │
│  │  Current Status: ● In Clinic | Next: Surgery at 2 PM                          │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │  PATIENTS   │ │  APPTS      │ │  QUEUE      │ │  PRESCRIP.  │ │  REVENUE    │   │
│  │    2,847    │ │    42       │ │    18       │ │    156      │ │   $18.4K    │   │
│  │   ↑ 8.2%    │ │   ↑ 12.5%   │ │   Wait: 12m │ │   ↑ 15.3%   │ │   ↑ 9.4%    │   │
│  │   [Chart]   │ │   [Chart]   │ │   [Live]    │ │   [Chart]   │ │   [Chart]   │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       PATIENT QUEUE                     │ │       TODAY'S APPOINTMENTS       │   │
│  │                                         │ │                                  │   │
│  │  Current Wait Time: 12 minutes          │ │  Morning Session (22 patients):  │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │  🟢 WAITING ROOM (8 patients)     │  │ │  │ 08:00 AM - John Smith      │  │   │
│  │  │                                   │  │ │  │    Annual Physical         │  │   │
│  │  │  1. Maria Garcia - 15 min         │  │ │  │    ✓ Checked in            │  │   │
│  │  │  2. James Wilson - 22 min         │  │ │  │    Room: Exam 1            │  │   │
│  │  │  3. Susan Chen - 28 min           │  │ │  │                            │  │   │
│  │  │  4. Robert Brown - 35 min         │  │ │  │ 08:15 AM - Emily Davis     │  │   │
│  │  │                                   │  │ │  │    Follow-up               │  │   │
│  │  │  [View Full Queue] [Call Next]    │  │ │  │    🔄 In Room              │  │   │
│  │  │                                   │  │ │  │    Vitals: Complete        │  │   │
│  │  │  🟡 IN EXAM (6 patients)          │  │ │  │    Room: Exam 3            │  │   │
│  │  │  • Exam 1: Maria G. (Dr. Johnson) │  │ │  │                            │  │   │
│  │  │  • Exam 2: Available              │  │ │  │ 08:30 AM - Michael Lee     │  │   │
│  │  │  • Exam 3: Emily D. (Dr. Johnson) │  │ │  │    Consultation            │  │   │
│  │  │  • Exam 4: Available              │  │ │  │    ⏳ Waiting              │  │   │
│  │  │  • Procedure: John M. (Nurse)     │  │ │  │    Last visit: 6 mo ago    │  │   │
│  │  │  • Pediatric: Sarah K. (PA)       │  │ │  │    Room: Exam 2            │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │  🔴 WITH PROVIDER (4 patients)    │  │ │  │ [View All Appointments]    │  │   │
│  │  │  • Dr. Johnson: 3 patients        │  │ │  │                            │  │   │
│  │  │  • Dr. Williams: 1 patient        │  │ │  │ Provider Availability:      │  │   │
│  │  │  • PA Martinez: 2 patients        │  │ │  │ Dr. Johnson: ● Available   │  │   │
│  │  │                                   │  │ │  │ Dr. Williams: 🟡 Busy      │  │   │
│  │  │  [Manage Queue] [Add Walk-in]     │  │ │  │ PA Martinez: ● Available   │  │   │
│  │  │                                   │  │ │  │ Nurse Practitioner: 🟢 Free│  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                         │ │  │ No-show Rate Today: 4.8%   │  │   │
│  │  Queue Analytics:                       │ │  │ On-time Rate: 87%          │  │   │
│  │  Avg. Wait: 18 min | Avg. Visit: 32 min │ │  │                            │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       PATIENT ALERTS                    │ │       PRESCRIPTION MANAGEMENT    │   │
│  │                                         │ │                                  │   │
│  │  Critical Alerts (3):                   │ │  Prescription Requests (12):     │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │ 🔴 CRITICAL - Lab Results         │  │ │  │                            │  │   │
│  │  │    Patient: Maria Garcia          │  │ │  │ ✅ Approved (8)            │  │   │
│  │  │    HbA1c: 9.2% (High)             │  │ │  │ • Metformin 500mg - 45     │  │   │
│  │  │    Action Required                │  │ │  │ • Lisinopril 10mg - 32     │  │   │
│  │  │    [Review Results] [Call Patient]│  │ │  │ • Atorvastatin 20mg - 28   │  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                          │ │  │ ⏳ Pending Review (4)      │  │   │
│  │  ┌───────────────────────────────────┐  │ │  │ • Oxycodone 5mg - John D.  │  │   │
│  │  │ 🟡 ALLERGY ALERT                  │  │ │  │   ⚠️ Controlled substance  │  │   │
│  │  │    Patient: James Wilson          │  │ │  │ • Adderall 20mg - Lisa M.  │  │   │
│  │  │    Penicillin allergy detected    │  │ │  │   ⚠️ Stimulant medication  │  │   │
│  │  │    Prescribed: Amoxicillin        │  │ │  │ • Tramadol 50mg - Tom R.   │  │   │
│  │  │    [Review Alternative]           │  │ │  │   ⚠️ Controlled substance  │  │   │
│  │  └───────────────────────────────────┘  │ │  │ • Ambien 10mg - Kate S.    │  │   │
│  │                                          │ │  │                            │  │   │
│  │  ┌───────────────────────────────────┐  │ │  │ ❌ Rejected (0)            │  │   │
│  │  │ 🟠 FOLLOW-UP REQUIRED             │  │ │  │                            │  │   │
│  │  │    Patient: Susan Chen            │  │ │  │ [Review All Requests]      │  │   │
│  │  │    Post-surgery check             │  │ │  │                            │  │   │
│  │  │    Due within 7 days              │  │ │  │ E-Prescribing Status:      │  │   │
│  │  │    [Schedule Appointment]         │  │ │  │ ✓ Connected to Surescripts │  │   │
│  │  └───────────────────────────────────┘  │ │  │ ✓ PDMP checked             │  │   │
│  │                                          │ │  │                            │  │   │
│  │  [View All Alerts] [Triage Settings]    │ │  │ [E-Prescribe] [Refill]     │  │   │
│  │                                          │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       RECENT PATIENTS                   │ │       PRACTICE ANALYTICS         │   │
│  │                                         │ │                                  │   │
│  │  ┌───────────────────────────────────┐  │ │  Today's Performance:            │  │   │
│  │  │ Maria Garcia | DOB: 05/12/1968   │  │ │  ┌────────────────────────────┐  │   │
│  │  │ Last Visit: Today, 08:00 AM       │  │ │  │                            │  │   │
│  │  │ Type 2 Diabetes | Hypertension    │  │ │  │ Patients Seen: 42/48       │  │   │
│  │  │ [View Chart] [Message] [Labs]     │  │ │  │ ████████████████░░░░ 87%   │  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                          │ │  │ RVU Count: 124.5           │  │   │
│  │  ┌───────────────────────────────────┐  │ │  │ Target: 140                │  │   │
│  │  │ James Wilson | DOB: 08/23/1985   │  │ │  │                            │  │   │
│  │  │ Last Visit: Today, 08:15 AM       │  │ │  │ Collections: $18,420       │  │   │
│  │  │ Annual Physical                   │  │ │  │ A/R: $42,500               │  │   │
│  │  │ [View Chart] [Message] [Labs]     │  │ │  │                            │  │   │
│  │  └───────────────────────────────────┘  │ │  │ Denial Rate: 3.2%          │  │   │
│  │                                          │ │  │                            │  │   │
│  │  ┌───────────────────────────────────┐  │ │  │ [Full Analytics Report]    │  │   │
│  │  │ Emily Davis | DOB: 03/15/1992    │  │ │  │                            │  │   │
│  │  │ Last Visit: 6 months ago          │  │ │  │ Quality Metrics:           │  │   │
│  │  │ Follow-up Consultation            │  │ │  │ • HbA1c Control: 78% ✓     │  │   │
│  │  │ [View Chart] [Message] [Labs]     │  │ │  │ • BP Control: 82% ✓        │  │   │
│  │  └───────────────────────────────────┘  │ │  │ • Cancer Screening: 74% ⚠️  │  │   │
│  │                                          │ │  │ • Vaccination: 91% ✓       │  │   │
│  │  [Search Patients] [Register Patient]   │ │  │                            │  │   │
│  │                                          │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                         AI INSIGHTS (Pro Tier Only)                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ 💡 Risk Alert: 12 patients due for preventive screening this month      │  │  │
│  │  │    Based on: Age, history, last screening date                          │  │  │
│  │  │    Recommended: Send automated reminders for mammography, colonoscopy   │  │  │
│  │  │    Impact: Improve quality metrics, prevent late-stage diagnosis        │  │  │
│  │  │  [Review List] [Send Reminders]                                         │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Category Application

### Signature Clean Design System (HIPAA-Compliant)

**Primary Palette:**
```
Background Primary:   #FFFFFF (Pure white - clinical clean)
Background Secondary: #F8FAFC (Light gray-blue)
Background Tertiary:  #F1F5F9 (Subtle panels)

Accent Primary:       #10B981 (Medical green - trust, health)
Accent Secondary:     #34D399 (Soft green)
Accent Tertiary:      #A7F3D0 (Light green highlight)

Text Primary:         #0F172A (Dark slate - high contrast)
Text Secondary:       #475569 (Medium slate)
Text Tertiary:        #94A3B8 (Light slate)

Status Colors:
  Normal:   #10B981 (Green)
  Warning:  #F59E0B (Amber)
  Critical: #EF4444 (Red)
  Info:     #3B82F6 (Blue)
```

**Clean Design Effects:**
```css
/* Clean Card */
.clean-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Clean Card Hover */
.clean-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #CBD5E1;
}

/* Subtle Gradient */
.accent-gradient {
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
}

/* Progress Bar */
.progress-bar {
  background: linear-gradient(90deg, #10B981, #34D399);
  border-radius: 4px;
}

/* HIPAA Badge */
.hipaa-secure {
  background: linear-gradient(135deg, #3B82F6, #60A5FA);
  color: #FFFFFF;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}
```

---

## 3. Component Hierarchy

```
HealthcareDashboard (Root)
├── DashboardHeader
│   ├── BreadcrumbNav
│   ├── HIPAASecureBadge
│   ├── QuickActions
│   │   ├── NewPatientButton
│   │   └── DailyReportButton
│   └── ProviderStatus
├── KPIRow (5 metrics)
│   └── HealthcareMetricCard × 5
│       ├── TrendChart
│       ├── TrendIndicator
│       └── ValueDisplay
├── ContentGrid (2 columns)
│   ├── LeftColumn
│   │   ├── PatientQueue
│   │   │   ├── QueueStatus
│   │   │   ├── WaitingRoomList
│   │   │   ├── ExamRoomStatus
│   │   │   └── ProviderStatus
│   │   ├── PatientAlerts
│   │   │   ├── CriticalAlert × N
│   │   │   ├── AllergyAlert
│   │   │   └── FollowUpRequired
│   │   └── RecentPatients
│   │       └── PatientCard × N
│   └── RightColumn
│       ├── TodaysAppointments
│       │   ├── AppointmentCard × N
│       │   ├── TimeSlot
│       │   ├── StatusBadge
│       │   └── RoomAssignment
│       ├── PrescriptionManagement
│       │   ├── RequestList
│       │   ├── ApprovalSection
│       │   ├── PendingReview
│       │   └── EPrescribingStatus
│       └── PracticeAnalytics
│           ├── PerformanceMetrics
│           ├── RVUDisplay
│           ├── CollectionsPanel
│           └── QualityMetrics
└── AIInsightsPanel (Pro Tier)
    └── PreventiveCareAlert
```

---

## 4. 5 Theme Presets

### Theme 1: Medical Green (Default)
```
Primary:    #10B981
Secondary:  #34D399
Background: #FFFFFF
Surface:    #F8FAFC
Accent:     linear-gradient(135deg, #10B981, #34D399)
```

### Theme 2: Trust Blue
```
Primary:    #3B82F6
Secondary:  #60A5FA
Background: #FFFFFF
Surface:    #EFF6FF
Accent:     linear-gradient(135deg, #3B82F6, #60A5FA)
```

### Theme 3: Calming Teal
```
Primary:    #14B8A6
Secondary:  #2DD4BF
Background: #FFFFFF
Surface:    #F0FDFA
Accent:     linear-gradient(135deg, #14B8A6, #2DD4BF)
```

### Theme 4: Professional Purple
```
Primary:    #8B5CF6
Secondary:  #A78BVA
Background: #FFFFFF
Surface:    #F5F3FF
Accent:     linear-gradient(135deg, #8B5CF6, #A78BVA)
```

### Theme 5: Warm Coral
```
Primary:    #F97316
Secondary:  #FB923C
Background: #FFFFFF
Surface:    #FFF7ED
Accent:     linear-gradient(135deg, #F97316, #FB923C)
```

---

## 5. Expanded Settings Page Design

### Healthcare-Specific Settings Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SETTINGS - Healthcare Practice Configuration (HIPAA Secure)                 │
├──────────────────┬──────────────────────────────────────────────────────────┤
│                  │  GENERAL SETTINGS                                        │
│  General         │                                                          │
│  Branding        │  ┌────────────────────────────────────────────────────┐  │
│  Notifications   │  │ PRACTICE INFORMATION                                │  │
│  Security/HIPAA  │  │                                                    │  │
│  Integrations    │  │ Practice Name: [Johnson Medical Center]            │  │
│  Team            │  │ NPI Number: [1234567890]                           │  │
│  Billing         │  │ Tax ID: [XX-XXXXXXX]                               │  │
│                  │  │                                                    │  │
│  ──────────────  │  │ Practice Type:                                     │  │
│                  │  │ [✓] Primary Care  [✓] Family Medicine             │  │
│  HEALTHCARE SPEC │  │ [✗] Pediatrics [✗] Internal Med                  │  │
│  ├─ Patients     │  │ [✗] Specialty   [✗] Urgent Care                  │  │
│  ├─ Appointments │  │                                                    │  │
│  ├─ Queue Mgmt   │  │ Insurance Accepted:                                │  │
│  ├─ E-Prescribe  │  │ [✓] Medicare   [✓] Medicaid   [✓] Private         │  │
│  ├─ Labs         │  │                                                    │  │
│  └─ Billing      │  │ [Save Practice Info]                               │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ HIPAA COMPLIANCE                                    │  │
│                  │  │                                                    │  │
│                  │  │ Security Settings:                                 │  │
│                  │  │ • Auto-logout: [15] minutes                        │  │
│                  │  │ • Password expiry: [90] days                       │  │
│                  │  │ • Two-factor auth: [✓] Required                    │  │
│                  │  │ • Session timeout: [30] minutes                    │  │
│                  │  │                                                    │  │
│                  │  │ Audit Trail:                                       │  │
│                  │  │ [✓] Log all PHI access                             │  │
│                  │  │ [✓] Log prescription changes                       │  │
│                  │  │ [✓] Log patient message                            │  │
│                  │  │ Retention: [7] years                               │  │
│                  │  │                                                    │  │
│                  │  │ Business Associate Agreements:                     │  │
│                  │  │ [Upload BAA] [Manage BAAs]                         │  │
│                  │  │                                                    │  │
│                  │  │ [HIPAA Compliance Checklist]                       │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ PATIENT MANAGEMENT                                  │  │
│                  │  │                                                    │  │
│                  │  │ Registration Settings:                             │  │
│                  │  │ • Allow online registration: [✓]                   │  │
│                  │  │ • Require insurance verification: [✓]              │  │
│                  │  │ • Consent forms: Digital [✓] Paper [✗]            │  │
│                  │  │                                                    │  │
│                  │  │ Patient Portal:                                    │  │
│                  │  │ [✓] Enable patient portal                          │  │
│                  │  │ [✓] Allow online scheduling                        │  │
│                  │  │ [✓] Enable secure messaging                        │  │
│                  │  │ [✓] Lab results release: [3] business days         │  │
│                  │  │                                                    │  │
│                  │  │ Record Retention:                                  │  │
│                  │  │ Adult records: [10] years                          │  │
│                  │  │ Minor records: [Age of majority + 7] years         │  │
│                  │  │ Deceased records: [7] years                        │  │
│                  │  │                                                    │  │
│                  │  │ [Manage Patient Forms]                             │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ APPOINTMENT SCHEDULING                              │  │
│                  │  │                                                    │  │
│                  │  │ Scheduling Rules:                                  │  │
│                  │  │ • Slot duration: [15] minutes                      │  │
│                  │  │ • Buffer time: [5] minutes                         │  │
│                  │  │ • Max advance booking: [60] days                   │  │
│                  │  │ • Cutoff time: [2] hours before                    │  │
│                  │  │                                                    │  │
│                  │  │ Appointment Types:                                 │  │
│                  │  │ • Annual Physical: [60] minutes                    │  │
│                  │  │ • Follow-up: [30] minutes                          │  │
│                  │  │ • Acute Visit: [20] minutes                        │  │
│                  │  │ • Telehealth: [30] minutes                         │  │
│                  │  │ • Procedure: [45] minutes                          │  │
│                  │  │                                                    │  │
│                  │  │ Reminder Settings:                                 │  │
│                  │  │ [✓] Send SMS reminder: [24] hours before           │  │
│                  │  │ [✓] Send email reminder: [48] hours before         │  │
│                  │  │ [✓] Automated call: [Day before]                   │  │
│                  │  │                                                    │  │
│                  │  │ No-show Policy:                                    │  │
│                  │  │ Fee after [2] no-shows: [$50]                      │  │
│                  │  │                                                    │  │
│                  │  │ [Manage Schedule Templates]                        │  │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ E-PRESCRIBING                                       │  │
│                  │  │                                                    │  │
│                  │  │ E-Prescribe Settings:                              │  │
│                  │  │ [✓] Enable e-prescribing                           │  │
│                  │  │ Connected to: Surescripts ✓                        │  │
│                  │  │                                                    │  │
│                  │  │ Controlled Substances:                             │  │
│                  │  │ [✓] Enable C-II-V prescribing                      │  │
│                  │  │ [✓] Check PDMP before prescribing                  │  │
│                  │  │ DEA Number: [AB1234567]                            │  │
│                  │  │                                                    │  │
│                  │  │ Prescription Defaults:                             │  │
│                  │  │ Default duration: [30] days                        │  │
│                  │  │ Default refills: [3]                               │  │
│                  │  │ Generic substitution: [✓] Allow                    │  │
│                  │  │                                                    │  │
│                  │  │ Pharmacy Integration:                              │  │
│                  │  │ Preferred pharmacies: [Configure]                  │  │
│                  │  │ Real-time benefit check: [✓] Enable                │  │
│                  │  │                                                    │  │
│                  │  │ [Manage Formulary]                                 │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ LAB INTEGRATION                                     │  │
│                  │  │                                                    │  │
│                  │  │ Lab Partners:                                      │  │
│                  │  │ [✓] Quest Diagnostics                              │  │
│                  │  │ [✓] LabCorp                                        │  │
│                  │  │ [✗] Local Hospital Lab                            │  │
│                  │  │                                                    │  │
│                  │  │ Order Settings:                                    │  │
│                  │  │ [✓] Electronic lab orders                          │  │
│                  │  │ [✓] Auto-import results                            │  │
│                  │  │ [✓] Flag abnormal results                          │  │
│                  │  │ Critical value alert: [✓] Immediate notification   │  │
│                  │  │                                                    │  │
│                  │  │ Result Release:                                    │  │
│                  │  │ Release to patient: [✓] After [3] days             │  │
│                  │  │ Sensitive results: [✗] Hold for review            │  │
│                  │  │                                                    │  │
│                  │  │ [Manage Lab Panels]                                │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ BILLING & INSURANCE                                 │  │
│                  │  │                                                    │  │
│                  │  │ Billing Settings:                                  │  │
│                  │  │ [✓] Accept self-pay                                │  │
│                  │  │ [✓] Accept insurance                               │  │
│                  │  │ [✓] Collect copay at time of service: [✓]          │  │
│                  │  │                                                    │  │
│                  │  │ Insurance Verification:                            │  │
│                  │  │ [✓] Verify eligibility before appointment          │  │
│                  │  │ Auto-verify: [24] hours before                     │  │
│                  │  │                                                    │  │
│                  │  │ Claim Submission:                                  │  │
│                  │  │ Clearinghouse: [Change Healthcare ✓]               │  │
│                  │  │ Submit claims: [Daily at 5 PM]                     │  │
│                  │  │ ERA auto-post: [✓] Enable                          │  │
│                  │  │                                                    │  │
│                  │  │ Payment Methods:                                   │  │
│                  │  │ [✓] Cash  [✓] Credit Card  [✓] HSA/FSA            │  │
│                  │  │ [✓] Payment plans available                        │  │
│                  │  │                                                    │  │
│                  │  │ [Manage Fee Schedule]                              │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
└──────────────────┴──────────────────────────────────────────────────────────┘
```

---

## 6. API Endpoints Mapping

### Required APIs for Healthcare Dashboard

| Feature | API Endpoint | Method | Priority |
|---------|--------------|--------|----------|
| **Dashboard** ||||
| Get aggregate metrics | `/api/dashboard/aggregate` | GET | P0 |
| Get patient queue | `/api/healthcare/queue` | GET | P0 |
| Get today's appointments | `/api/healthcare/appointments/today` | GET | P0 |
| **Patients** ||||
| List patients | `/api/healthcare/patients` | GET | P0 |
| Create patient | `/api/healthcare/patients` | POST | P0 |
| Get patient details | `/api/healthcare/patients/:id` | GET | P1 |
| Update patient | `/api/healthcare/patients/:id` | PUT | P1 |
| Get patient history | `/api/healthcare/patients/:id/history` | GET | P1 |
| Get patient consent | `/api/healthcare/patients/:id/consent` | GET | P2 |
| **Appointments** ||||
| List appointments | `/api/healthcare/appointments` | GET | P0 |
| Create appointment | `/api/healthcare/appointments` | POST | P0 |
| Update appointment | `/api/healthcare/appointments/:id` | PUT | P1 |
| Get availability | `/api/healthcare/appointments/availability` | GET | P1 |
| Check-in patient | `/api/healthcare/appointments/:id/checkin` | POST | P1 |
| **Queue** ||||
| Get queue | `/api/healthcare/queue` | GET | P0 |
| Add to queue | `/api/healthcare/queue/add` | POST | P1 |
| Update queue status | `/api/healthcare/queue/:id/status` | PUT | P1 |
| Get wait times | `/api/healthcare/queue/wait-times` | GET | P1 |
| **Prescriptions** ||||
| List prescriptions | `/api/healthcare/prescriptions` | GET | P1 |
| Create prescription | `/api/healthcare/prescriptions` | POST | P0 |
| Update prescription | `/api/healthcare/prescriptions/:id` | PUT | P1 |
| Refill prescription | `/api/healthcare/prescriptions/:id/refill` | POST | P1 |
| **Lab Results** ||||
| List lab results | `/api/healthcare/lab-results` | GET | P1 |
| Create lab result | `/api/healthcare/lab-results` | POST | P1 |
| Get lab result | `/api/healthcare/lab-results/:id` | GET | P1 |
| **Billing** ||||
| Get insurance providers | `/api/healthcare/insurance/providers` | GET | P2 |
| Get billing claims | `/api/healthcare/billing/claims` | GET | P2 |
| Create claim | `/api/healthcare/billing/claims` | POST | P2 |
| Verify coverage | `/api/healthcare/billing/coverage-verification` | POST | P2 |

---

*Document generated as part of Batch 2 Design Documents - Healthcare Industry*
