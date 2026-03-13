# Education Dashboard Quick Start Guide

**Last Updated:** 2026-03-11  
**Implementation Phase:** Backend Complete ✅  

---

## 🚀 What's Been Implemented

### ✅ Backend Package (Complete)
- **Location:** `/packages/industry-education/`
- **Size:** ~2,700+ lines of code
- **Features:**
  - Course management & analytics
  - Student progress tracking with at-risk identification
  - Instructor performance metrics
  - Assignment & grading system
  - Certificate generation & verification
  - Comprehensive analytics service

### ✅ API Endpoints (3/8 Complete)
1. `GET /api/education/dashboard/stats` - Full dashboard data
2. `GET /api/education/courses/stats` - Course statistics
3. `GET /api/education/students/progress` - Student progress tracking

### ✅ Frontend Configuration (Complete)
- Design category: **Modern Dark** ✨
- KPI mappings configured
- Dashboard definitions ready

### ✅ Documentation & Testing (Complete)
- API documentation: `/docs/api/education-dashboard-api.md`
- Test script: `/scripts/test-education-dashboard-api.mjs`
- Implementation summary: `/EDUCATION_DASHBOARD_IMPLEMENTATION_SUMMARY.md`

---

## 📦 Installation & Setup

### 1. Install Dependencies

```bash
cd /Users/fredrick/Documents/Vayva-Tech/vayva
pnpm install
```

### 2. Build the Education Package

```bash
cd packages/industry-education
pnpm build
```

### 3. Run API Tests (Optional)

```bash
# Set environment variables
export STORE_ID="your-store-id"
export AUTH_TOKEN="your-auth-token"
export BASE_URL="http://localhost:3000"

# Run tests
node scripts/test-education-dashboard-api.mjs
```

---

## 🔌 Using the Education Dashboard API

### Basic Example

```javascript
// Fetch education dashboard data
const response = await fetch(
  '/api/education/dashboard/stats?storeId=123&range=month',
  {
    headers: {
      'Authorization': 'Bearer your-token',
    },
  }
);

const data = await response.json();

if (data.success) {
  console.log('Dashboard:', data.data);
  // Access courses, students, instructors, etc.
}
```

### React Integration

```typescript
import useSWR from 'swr';

function useEducationDashboard() {
  const { data, error } = useSWR(
    '/api/education/dashboard/stats?range=month',
    fetcher
  );

  return {
    dashboard: data?.data,
    isLoading: !data && !error,
    isError: error,
  };
}

// Usage in component
function EducationDashboard() {
  const { dashboard, isLoading } = useEducationDashboard();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Revenue: ${dashboard.metrics.revenue.value}</h1>
      <p>Students: {dashboard.students.length}</p>
    </div>
  );
}
```

---

## 📊 Key Features

### 1. Course Management
```typescript
// Get course statistics
const stats = await getCourseStats(prisma, storeId, {
  status: 'published',
});

console.log(stats.totalCourses); // Total published courses
console.log(stats.topCourses); // Top 5 by revenue
```

### 2. Student Progress Tracking
```typescript
// Get student progress with at-risk identification
const progress = await getStudentProgress(prisma, storeId, {
  atRiskOnly: true,
});

console.log(progress.atRiskCount); // Number of at-risk students
console.log(progress.studentProgress); // Detailed progress data
```

### 3. Instructor Performance
```typescript
// Get instructor performance metrics
const performance = await getInstructorPerformance(prisma, storeId, {
  period: 'month',
});

console.log(performance.topPerformers); // Top performing instructors
console.log(performance.averageRating); // Average rating across all
```

### 4. Assignments & Grading
```typescript
// Get pending grading queue
const assignments = await getAssignments(prisma, storeId, {
  pendingGrading: true,
});

console.log(assignments.pendingGrading); // Count awaiting grading
console.log(assignments.gradingQueue); // List of submissions to grade
```

---

## 🎨 Design System

The Education Dashboard uses **Modern Dark** design category with Electric Cyan accents.

### Color Palette
```css
--background-primary: #0D0D0D;
--background-secondary: #1A1A1A;
--accent-primary: #00D9FF; /* Electric Cyan */
--text-primary: #FFFFFF;
```

### Theme Presets (Available)
1. **Electric Cyan** (Default)
2. Knowledge Purple
3. Growth Green
4. Scholar Blue
5. Achievement Gold

---

## 📈 Dashboard Metrics

### Overview Metrics
- Total Courses
- Active Courses
- Total Students
- Active Students
- Total Instructors
- Total Revenue
- Average Completion Rate
- Average Satisfaction
- Certificates Issued

### KPI Metrics (with trends)
- Revenue (value, change %, trend)
- Enrollments (value, change %, trend)
- Students (value, change %, trend)
- Completion Rate (value, change %, trend)
- Satisfaction (value, change %, trend)

---

## ⚠️ At-Risk Student Detection

Students are flagged as at-risk if they meet ANY of these criteria:

1. **Low Progress:** Overall progress < 60%
2. **Inactive:** No activity in last 7 days
3. **Falling Behind:** Less than 50% of assignments completed

At-risk students include `atRiskReasons` array explaining why they're flagged.

---

## 🔧 Configuration

### Dashboard Configuration
Located in `/packages/industry-education/src/dashboard/index.ts`

```typescript
export const EDUCATION_DASHBOARD_CONFIG = {
  kpiSlots: [
    { id: 'revenue', label: 'Revenue', format: 'currency' },
    { id: 'enrollments', label: 'Enrollments', format: 'number' },
    { id: 'students', label: 'Active Students', format: 'number' },
    { id: 'completion_rate', label: 'Completion Rate', format: 'percent' },
    { id: 'satisfaction', label: 'Satisfaction', format: 'rating' },
  ],
  
  alertThresholds: {
    lowCompletionRate: 40,
    atRiskStudents: 5,
    overdueAssignments: 10,
  },
};
```

---

## 🧪 Testing

### Run All Tests
```bash
node scripts/test-education-dashboard-api.mjs
```

### Test Individual Endpoints
```bash
# Test dashboard stats
curl "http://localhost:3000/api/education/dashboard/stats?storeId=test-123&range=week" \
  -H "Authorization: Bearer token"

# Test course stats
curl "http://localhost:3000/api/education/courses/stats?storeId=test-123" \
  -H "Authorization: Bearer token"

# Test student progress (at-risk only)
curl "http://localhost:3000/api/education/students/progress?storeId=test-123&atRiskOnly=true" \
  -H "Authorization: Bearer token"
```

---

## 📝 Common Operations

### Create a Course
```typescript
import { createCourse } from '@vayva/industry-education/features';

const course = await createCourse(prisma, storeId, instructorId, {
  title: 'Introduction to Web Development',
  description: 'Learn HTML, CSS, and JavaScript',
  price: 99.99,
  maxStudents: 50,
});
```

### Generate Certificate
```typescript
import { generateCertificate } from '@vayva/industry-education/features';

const result = await generateCertificate(
  prisma,
  storeId,
  studentId,
  courseId
);

console.log(result.certificate);
console.log(result.downloadUrl);
console.log(result.verificationUrl);
```

### Grade Assignment
```typescript
import { gradeSubmission } from '@vayva/industry-education/features';

await gradeSubmission(prisma, submissionId, {
  grade: 95,
  feedback: 'Excellent work!',
});
```

---

## 🐛 Troubleshooting

### Issue: Package not found
```bash
# Solution: Build the package
cd packages/industry-education
pnpm build
```

### Issue: API returns 404
```bash
# Solution: Check that you're using correct endpoint
# Correct: /api/education/dashboard/stats
# Wrong: /api/education/stats
```

### Issue: No data returned
```bash
# Solution: Verify storeId is correct and has education data
# Check database for courses, students, etc.
```

---

## 📚 Additional Resources

- **Full API Documentation:** `/docs/api/education-dashboard-api.md`
- **Implementation Summary:** `/EDUCATION_DASHBOARD_IMPLEMENTATION_SUMMARY.md`
- **Design Specification:** `/BATCH_4_DESIGN_EDUCATION.md`
- **Type Definitions:** `/packages/industry-education/src/types/index.ts`

---

## 🎯 Next Steps

### To Complete Frontend (Not Included in This Phase)
1. Create education-specific React components
2. Integrate into UniversalProDashboard
3. Add real-time WebSocket updates
4. Implement remaining 5 API endpoints

### Immediate Actions
1. Review implementation summary
2. Run test script to validate setup
3. Explore type definitions for integration
4. Plan frontend component architecture

---

## 💡 Tips

1. **Use TypeScript:** All types are exported from `@vayva/industry-education/types`
2. **Leverage caching:** Dashboard data is cached for 5 minutes
3. **Check logs:** Application logs show detailed error information
4. **Monitor performance:** Use isolated Prisma client for better performance
5. **Follow patterns:** Existing implementations (retail, healthcare) provide good examples

---

## 📞 Support

For questions or issues:
- Check implementation summary
- Review API documentation
- Examine type definitions
- Contact platform team

---

**Happy Coding! 🎓✨**
