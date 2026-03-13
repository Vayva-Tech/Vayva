# Batch 4 Design Document: EDUCATION Industry Dashboard
## Modern Dark Design with Student Progress Tracking

**Document Version:** 1.0  
**Industry:** Education & E-Learning Platform  
**Design Category:** Modern Dark  
**Plan Tier Support:** Basic → Pro  
**Last Updated:** 2026-03-11

---

## 1. Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (Modern Dark - Education Platform)                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  [Logo]  Dashboard  Courses  Students  Enrollments  Assignments  Analytics  ▼  │  │
│  │                                                                  [🔔] [👤 Pro] │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  LEARNING OVERVIEW                    [+ New Course] [📊 Performance Report]   │  │
│  │  "EduTech Academy | Spring Semester 2026"                                     │  │
│  │  Active Courses: 42 | Students: 1,847 | Instructors: 28                         │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │  REVENUE    │ │ ENROLLMENTS │ │  STUDENTS   │ │ COMPLETION  │ │   SATISF.   │   │
│  │   $284.5K   │ │    2,847    │ │    1,847    │ │    78%      │ │    4.6/5    │   │
│  │   ↑ 18.4%   │ │   ↑ 34.2%   │ │   ↑ 22.5%   │ │   ↑ 12.3%   │ │   ↑ 8.2%    │   │
│  │   [Spark]   │ │   [Spark]   │ │   [Spark]   │ │   [Spark]   │ │   [Spark]   │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       ACTIVE COURSES                    │ │       STUDENT PROGRESS           │   │
│  │                                         │ │                                  │   │
│  │  Total Courses: 42                      │ │  Overall Progress: 78%           │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ 📚 Web Development Bootcamp       │  │ │  │  Progress by Course:       │  │   │
│  │  │    Instructor: Sarah Johnson      │  │ │  │  ┌──────────────────────┐  │  │   │
│  │  │    Students: 247/300              │  │ │  │  │ Web Dev    ████████░░ │  │  │   │
│  │  │    Progress: 68%                  │  │ │  │  │ 82% completion         │  │  │   │
│  │  │    Revenue: $48,500               │  │ │  │  │                        │  │  │   │
│  │  │    [View Course] [Edit]           │  │ │  │  │ Data Science ███████░░ │  │  │   │
│  │  │                                   │  │ │  │  │ 74% completion         │  │  │   │
│  │  │ 📚 Data Science Fundamentals      │  │ │  │  │                        │  │  │   │
│  │  │    Instructor: Michael Chen       │  │ │  │  │ UX Design  ██████░░░░  │  │  │   │
│  │  │    Students: 189/250              │  │ │  │  │ 62% completion         │  │  │   │
│  │  │    Progress: 74%                  │  │ │  │  │                        │  │  │   │
│  │  │    Revenue: $38,900               │  │ │  │  │ [View All Courses]     │  │  │   │
│  │  │    [View Course] [Edit]           │  │ │  │  │                        │  │  │   │
│  │  │                                   │  │ │  │  │ At-Risk Students: 42   │  │  │   │
│  │  │ 📚 UI/UX Design Masterclass       │  │ │  │  │ Below 60% progress     │  │  │   │
│  │  │    Instructor: Emily Rodriguez    │  │ │  │  │ [Intervention List]    │  │  │   │
│  │  │    Students: 156/200              │  │ │  │  │                        │  │  │   │
│  │  │    Progress: 62%                  │  │ │  │  │ Completion Rate Trend: │  │  │   │
│  │  │    Revenue: $28,400               │  │ │  │  │ ▲ 12.3% this semester  │  │  │   │
│  │  │    [View Course] [Edit]           │  │ │  │  │                        │  │  │   │
│  │  │                                   │  │ │  │  │                        │  │  │   │
│  │  │ [View All Courses]                 │  │ │  │  │                        │  │  │   │
│  │  │                                   │  │ │  │  │                        │  │  │   │
│  │  │ Course Categories:                 │  │ │  │  │                        │  │  │   │
│  │  │ Development (18) | Design (12)     │  │ │  │  │                        │  │  │   │
│  │  │ Business (8) | Data (4)            │  │ │  │  │                        │  │  │   │
│  │  │                                   │  │ │  │  │                        │  │  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       ASSIGNMENTS & ASSESSMENTS         │ │       CERTIFICATES               │   │
│  │                                         │ │                                  │   │
│  │  Pending Grading: 84 submissions        │ │  Certificates Issued: 847        │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ 🔴 Overdue (12)                   │  │ │  │ Recent Certificates:       │  │   │
│  │  │ • Project 3 - John Smith          │  │ │  │                            │  │   │
│  │  │   Web Dev Bootcamp                │  │ │  │ ✅ Maria Garcia            │  │   │
│  │  │   Submitted: 2 days late          │  │ │  │   Web Development          │  │   │
│  │  │   [Grade Now]                     │  │ │  │   Issued: Mar 10, 2026     │  │   │
│  │  │                                   │  │ │  │   [View Certificate]       │  │   │
│  │  │ 🟡 Due Today (24)                 │  │ │  │                            │  │   │
│  │  │ • Quiz 5 - 24 students            │  │ │  │ ✅ James Wilson            │  │   │
│  │  │   Data Science Fundamentals       │  │ │  │   Data Science             │  │   │
│  │  │   Due: 11:59 PM                   │  │ │  │   Issued: Mar 10, 2026     │  │   │
│  │  │   [Send Reminder]                 │  │ │  │   [View Certificate]       │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ 🟢 Upcoming (48)                  │  │ │  │ ✅ Susan Chen              │  │   │
│  │  │ • Assignment 4 - Due Tomorrow     │  │ │  │   UX Design                │  │   │
│  │  │ • Final Project - Due Mar 15      │  │ │  │   Issued: Mar 9, 2026      │  │   │
│  │  │                                   │  │ │  │   [View Certificate]       │  │   │
│  │  │ [Grading Dashboard] [Rubrics]     │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │ [Manage Certificates]      │  │   │
│  │  │ Average Grading Time: 2.4 days    │  │ │  │                            │  │   │
│  │  │ Auto-graded: 62%                  │  │ │  │ Certificate Templates: 8   │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       INSTRUCTOR PERFORMANCE            │ │       ENGAGEMENT METRICS         │   │
│  │                                         │ │                                  │   │
│  │  Top Instructors This Month:            │ │  Student Engagement Score: 84%   │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ 👤 Sarah Johnson                  │  │ │  │ Activity Breakdown:        │  │   │
│  │  │    Courses: 3 | Students: 428     │  │ │  │ ┌──────────────────────┐   │  │   │
│  │  │    Rating: 4.9/5.0 (342 reviews)  │  │ │  │ │ Video Views   84%    │   │  │   │
│  │  │    Completion: 82%                │  │ │  │ │ Quiz Attempts 78%    │   │  │   │
│  │  │    Revenue: $84,500               │  │ │  │ │ Forum Posts   62%    │   │  │   │
│  │  │    ████████████████████░░          │  │ │  │ │ Assignments   74%    │   │  │   │
│  │  │                                   │  │ │  │ └──────────────────────┘   │  │   │
│  │  │ 👤 Michael Chen                   │  │ │  │                            │  │   │
│  │  │    Courses: 2 | Students: 312     │  │ │  │ Login Frequency:           │  │   │
│  │  │    Rating: 4.8/5.0 (284 reviews)  │  │ │  │ Daily: 42% | Weekly: 38%   │  │   │
│  │  │    Completion: 78%                │  │ │  │ Monthly: 18% | Rarely: 2%  │  │   │
│  │  │    Revenue: $62,400               │  │ │  │                            │  │   │
│  │  │    ██████████████████░░░░░░        │  │ │  │ Discussion Forums:         │  │   │
│  │  │                                   │  │ │  │ Active Threads: 247        │  │   │
│  │  │ 👤 Emily Rodriguez                │  │ │  │ Posts Today: 84            │  │   │
│  │  │    Courses: 2 | Students: 284     │  │ │  │ Avg. Response: 4.2 hours   │  │   │
│  │  │    Rating: 4.7/5.0 (218 reviews)  │  │ │  │                            │  │   │
│  │  │    Completion: 74%                │  │ │  │ [Engagement Dashboard]     │  │   │
│  │  │    Revenue: $52,800               │  │ │  │                            │  │   │
│  │  │    ████████████████░░░░░░░░        │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ [View All Instructors]             │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                         AI INSIGHTS (Pro Tier Only)                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ 💡 At-Risk Alert: 42 students below 60% progress threshold              │  │  │
│  │  │    Based on: Login frequency, assignment completion, video views        │  │  │
│  │  │    Recommendation: Send personalized encouragement, offer tutoring      │  │  │
│  │  │    Impact: Improve completion rate by 8-12%                             │  │  │
│  │  │  [View At-Risk List] [Create Campaign]                                  │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Category Application

### Modern Dark Design System

**Primary Palette:**
```
Background Primary:   #0D0D0D (Near black)
Background Secondary: #1A1A1A (Dark surfaces)
Background Tertiary:  #252525 (Card backgrounds)

Accent Primary:       #00D9FF (Electric cyan)
Accent Secondary:     #00B8D4 (Teal)
Accent Tertiary:      #7DE2F9 (Light cyan)

Text Primary:         #FFFFFF (Pure white)
Text Secondary:       rgba(255, 255, 255, 0.85)
Text Tertiary:        rgba(255, 255, 255, 0.65)

Status Colors:
  Success:  #10B981 (Green)
  Warning:  #F59E0B (Amber)
  Error:    #EF4444 (Red)
  Info:     #00D9FF (Cyan)
```

---

*Continuing with complete specification...*

## 3. Component Hierarchy

```
EducationDashboard (Root)
├── DashboardHeader
│   ├── BreadcrumbNav
│   ├── ActionButtons
│   │   ├── NewCourseButton
│   │   └── PerformanceReportButton
│   └── AcademyStatus
├── KPIRow (5 metrics)
│   └── EducationMetricCard × 5
│       ├── SparklineChart
│       ├── TrendIndicator
│       └── ValueDisplay
├── ContentGrid (2 columns)
│   ├── LeftColumn
│   │   ├── ActiveCourses
│   │   │   ├── CourseCard × N
│   │   │   ├── EnrollmentStats
│   │   │   └── ProgressMeter
│   │   ├── AssignmentsAssessments
│   │   │   ├── OverdueList
│   │   │   ├── DueTodayList
│   │   │   └── UpcomingList
│   │   └── InstructorPerformance
│   │       ├── InstructorCard × N
│   │       ├── RatingDisplay
│   │       └── RevenueStats
│   └── RightColumn
│       ├── StudentProgress
│       │   ├── OverallProgress
│       │   ├── CourseBreakdown
│       │   └── AtRiskStudents
│       ├── Certificates
│       │   ├── RecentCertificates
│       │   ├── CertificateCard × N
│       │   └── TemplateManager
│       └── EngagementMetrics
│           ├── EngagementScore
│           ├── ActivityBreakdown
│           └── LoginFrequency
└── AIInsightsPanel (Pro Tier)
    └── AtRiskAlert
```

---

## 4. 5 Theme Presets

### Theme 1: Electric Cyan (Default)
```
Primary:    #00D9FF
Secondary:  #00B8D4
Background: #0D0D0D
Surface:    #252525
Accent:     linear-gradient(90deg, #00D9FF, #00B8D4)
```

### Theme 2: Knowledge Purple
```
Primary:    #A78BVA
Secondary:  #C4B5FD
Background: #1A142A
Surface:    #2A1A2A
Accent:     linear-gradient(90deg, #A78BVA, #C4B5FD)
```

### Theme 3: Growth Green
```
Primary:    #10B981
Secondary:  #34D399
Background: #0A1F0F
Surface:    #1A2A1A
Accent:     linear-gradient(90deg, #10B981, #34D399)
```

### Theme 4: Scholar Blue
```
Primary:    #3B82F6
Secondary:  #60A5FA
Background: #0A0F1A
Surface:    #1A1A2E
Accent:     linear-gradient(90deg, #3B82F6, #60A5FA)
```

### Theme 5: Achievement Gold
```
Primary:    #F59E0B
Secondary:  #FBBF24
Background: #1A1408
Surface:    #2A2214
Accent:     linear-gradient(90deg, #F59E0B, #FBBF24)
```

---

## 5. API Endpoints Mapping

### Required APIs for Education Dashboard

| Feature | API Endpoint | Method | Priority |
|---------|--------------|--------|----------|
| **Dashboard** ||||
| Get aggregate metrics | `/api/dashboard/aggregate` | GET | P0 |
| Get course stats | `/api/education/courses/stats` | GET | P0 |
| Get student progress | `/api/education/students/progress` | GET | P0 |
| **Courses** ||||
| List courses | `/api/education/courses` | GET | P0 |
| Create course | `/api/education/courses` | POST | P0 |
| Get course details | `/api/education/courses/:id` | GET | P1 |
| Update course | `/api/education/courses/:id` | PUT | P1 |
| Publish course | `/api/education/courses/:id/publish` | POST | P1 |
| **Students** ||||
| List students | `/api/education/students` | GET | P1 |
| Create student | `/api/education/students` | POST | P1 |
| Get student details | `/api/education/students/:id` | GET | P1 |
| Get student progress | `/api/education/students/:id/progress` | GET | P1 |
| Get certificates | `/api/education/students/:id/certificates` | GET | P2 |
| **Enrollments** ||||
| List enrollments | `/api/education/enrollments` | GET | P1 |
| Create enrollment | `/api/education/enrollments` | POST | P1 |
| Update enrollment | `/api/education/enrollments/:id` | PUT | P1 |
| Get pending enrollments | `/api/education/enrollments/pending` | GET | P1 |
| **Assignments** ||||
| List assignments | `/api/education/assignments` | GET | P1 |
| Create assignment | `/api/education/assignments` | POST | P1 |
| Get submissions | `/api/education/assignments/:id/submissions` | GET | P1 |
| Grade assignment | `/api/education/assignments/:id/grade` | POST | P1 |
| **Instructors** ||||
| List instructors | `/api/education/instructors` | GET | P1 |
| Create instructor | `/api/education/instructors` | POST | P1 |
| Get instructor courses | `/api/education/instructors/:id/courses` | GET | P2 |
| **Certificates** ||||
| List certificates | `/api/education/certificates` | GET | P2 |
| Generate certificate | `/api/education/certificates/generate` | POST | P1 |
| Verify certificate | `/api/education/certificates/verify/:code` | GET | P2 |
| **Analytics** ||||
| Get completion analytics | `/api/education/analytics/completion` | GET | P2 |
| Get engagement analytics | `/api/education/analytics/engagement` | GET | P2 |

---

*Document generated as part of Batch 4 Design Documents - Education Industry*
