# Education Dashboard API Documentation

**Version:** 1.0  
**Last Updated:** 2026-03-11  

---

## Overview

The Education Dashboard API provides comprehensive endpoints for accessing education-specific analytics, course management data, student progress tracking, and instructor performance metrics. All endpoints require authentication and proper permissions.

---

## Authentication

All API requests require a valid authentication token in the Authorization header:

```http
Authorization: Bearer {token}
```

Required permission: `DASHBOARD_VIEW`

---

## Base Endpoints

### 1. Education Dashboard Statistics

**Endpoint:** `GET /api/education/dashboard/stats`

**Description:** Retrieves comprehensive education dashboard data including courses, students, instructors, enrollments, and engagement metrics.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `range` | string | `month` | Time range for data aggregation. Options: `today`, `week`, `month`, `quarter`, `year` |
| `storeId` | string | required | Store/Business identifier |

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/education/dashboard/stats?storeId=store-123&range=month" \
  -H "Authorization: Bearer {token}"
```

**Response Schema:**
```typescript
{
  success: boolean;
  data: {
    overview: {
      totalCourses: number;
      activeCourses: number;
      totalStudents: number;
      activeStudents: number;
      totalInstructors: number;
      totalEnrollments: number;
      totalRevenue: number;
      averageCompletionRate: number;
      averageSatisfaction: number;
      certificatesIssued: number;
    };
    metrics: {
      revenue: { value: number; change: number; trend: 'up' | 'down' | 'neutral' };
      enrollments: { value: number; change: number; trend: 'up' | 'down' | 'neutral' };
      students: { value: number; change: number; trend: 'up' | 'down' | 'neutral' };
      completionRate: { value: number; change: number; trend: 'up' | 'down' | 'neutral' };
      satisfaction: { value: number; change: number; trend: 'up' | 'down' | 'neutral' };
    };
    courses: Course[];
    students: Student[];
    instructors: Instructor[];
    assignments: Assignment[];
    certificates: Certificate[];
    engagementMetrics: EngagementMetrics;
    atRiskStudents: Student[];
    topPerformers: Student[];
  };
  timestamp: string;
}
```

**Cache Headers:**
- `X-Cache`: HIT or MISS
- `X-Cache-Age`: Age in seconds
- `ETag`: Cache validator

**Error Responses:**
- `401 Unauthorized` - Invalid or missing authentication token
- `403 Forbidden` - Insufficient permissions
- `500 Internal Server Error` - Server error

---

### 2. Course Statistics

**Endpoint:** `GET /api/education/courses/stats`

**Description:** Retrieves detailed course statistics including category breakdowns, status distribution, and performance metrics.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `storeId` | string | required | Store identifier |
| `courseId` | string | optional | Filter by specific course |
| `categoryId` | string | optional | Filter by category |
| `status` | string | optional | Filter by status: `draft`, `published`, `archived` |

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/education/courses/stats?storeId=store-123&status=published" \
  -H "Authorization: Bearer {token}"
```

**Response Schema:**
```typescript
{
  success: boolean;
  data: {
    totalCourses: number;
    activeCourses: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    topCourses: Course[];
    lowPerformingCourses: Course[];
    revenueByCategory: Record<string, number>;
  };
  timestamp: string;
}
```

**Course Object:**
```typescript
interface Course {
  id: string;
  title: string;
  description?: string;
  instructorId: string;
  instructorName?: string;
  category: string;
  price: number;
  maxStudents: number;
  enrolledStudents: number;
  status: 'draft' | 'published' | 'archived';
  progress: number;
  revenue: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  thumbnailUrl?: string;
}
```

---

### 3. Student Progress

**Endpoint:** `GET /api/education/students/progress`

**Description:** Retrieves student progress data including overall progress, course-by-course breakdown, and at-risk identification.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `storeId` | string | required | Store identifier |
| `studentId` | string | optional | Filter by specific student |
| `courseId` | string | optional | Filter by course |
| `atRiskOnly` | boolean | false | Only return at-risk students |

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/education/students/progress?storeId=store-123&atRiskOnly=true" \
  -H "Authorization: Bearer {token}"
```

**Response Schema:**
```typescript
{
  success: boolean;
  data: {
    overallProgress: number;
    totalStudents: number;
    activeStudents: number;
    atRiskCount: number;
    studentProgress: StudentProgress[];
    completionTrend: Array<{
      date: string;
      completions: number;
    }>;
  };
  timestamp: string;
}
```

**StudentProgress Object:**
```typescript
interface StudentProgress {
  studentId: string;
  studentName: string;
  overallProgress: number;
  courses: Array<{
    courseId: string;
    courseTitle: string;
    progress: number;
    status: 'active' | 'completed' | 'at-risk';
    lastActivity: Date;
    timeSpent: number; // minutes
    assignmentsCompleted: number;
    assignmentsTotal: number;
  }>;
  atRiskReasons?: string[];
}
```

**At-Risk Criteria:**
1. Overall progress < 60%
2. No activity in last 7 days
3. Less than 50% of assignments completed

---

### 4. Instructor Performance (TODO)

**Endpoint:** `GET /api/education/instructors/performance`

**Description:** Retrieves instructor performance metrics and rankings.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `storeId` | string | required | Store identifier |
| `instructorId` | string | optional | Filter by instructor |
| `period` | string | `month` | Performance period: `week`, `month`, `quarter`, `year` |

---

### 5. Pending Assignments (TODO)

**Endpoint:** `GET /api/education/assignments/pending`

**Description:** Retrieves assignments awaiting grading.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `storeId` | string | required | Store identifier |
| `courseId` | string | optional | Filter by course |
| `limit` | number | 50 | Maximum results to return |

---

### 6. Generate Certificate (TODO)

**Endpoint:** `POST /api/education/certificates/generate`

**Description:** Generates a certificate for a student who completed a course.

**Request Body:**
```json
{
  "storeId": "store-123",
  "studentId": "student-456",
  "courseId": "course-789",
  "templateId": "template-default"
}
```

**Response Schema:**
```typescript
{
  success: boolean;
  data: {
    certificate: Certificate;
    downloadUrl: string;
    verificationUrl: string;
  };
  message?: string;
}
```

---

### 7. Completion Analytics (TODO)

**Endpoint:** `GET /api/education/analytics/completion`

**Description:** Retrieves course completion analytics and dropoff analysis.

---

### 8. Engagement Analytics (TODO)

**Endpoint:** `GET /api/education/analytics/engagement`

**Description:** Retrieves student engagement metrics and trends.

---

## Data Models

### EngagementMetrics
```typescript
interface EngagementMetrics {
  overallScore: number; // 0-100
  videoViews: number; // percentage
  quizAttempts: number; // percentage
  forumPosts: number; // percentage
  assignmentsCompleted: number; // percentage
  loginFrequency: {
    daily: number;
    weekly: number;
    monthly: number;
    rarely: number;
  };
  discussionForums: {
    activeThreads: number;
    postsToday: number;
    avgResponseTime: number; // hours
  };
}
```

### Alert
```typescript
interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  suggestedAction?: {
    title: string;
    href: string;
    icon: string;
  };
}
```

### AIInsight
```typescript
interface AIInsight {
  id: string;
  type: 'alert' | 'opportunity' | 'positive';
  title: string;
  description: string;
  reasoning: string;
  recommendation: string;
  impact?: string;
  actions?: Array<{
    title: string;
    href: string;
  }>;
}
```

---

## Caching Strategy

All dashboard endpoints use Redis-based caching with the following configuration:

- **TTL:** 5 minutes
- **Strategy:** Stale-while-revalidate
- **Cache Keys:** `education-dashboard:{storeId}:{range}`
- **Invalidation:** Automatic on data changes (course updates, new enrollments, etc.)

**Cache Headers:**
```http
Cache-Control: no-store
X-Cache: HIT or MISS
X-Cache-Age: {seconds}
ETag: {etag}
```

---

## Rate Limiting

- **Standard Tier:** 100 requests per minute
- **Pro Tier:** 500 requests per minute
- **Enterprise:** 2000 requests per minute

Rate limit headers included in response:
```http
X-RateLimit-Limit: {limit}
X-RateLimit-Remaining: {remaining}
X-RateLimit-Reset: {timestamp}
```

---

## Error Handling

All errors follow this schema:

```typescript
{
  success: false;
  error: string;
  timestamp: string;
  details?: any;
}
```

**Common Error Codes:**
- `400 Bad Request` - Invalid parameters or request body
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Testing

Use the provided test script to validate all endpoints:

```bash
# Set environment variables
export STORE_ID="your-store-id"
export AUTH_TOKEN="your-auth-token"
export BASE_URL="http://localhost:3000"

# Run tests
node scripts/test-education-dashboard-api.mjs
```

---

## Best Practices

1. **Use appropriate time ranges:** Don't always fetch `year` data if you only need `week` data
2. **Leverage caching:** The API caches responses for 5 minutes - reuse cached data when possible
3. **Filter early:** Use query parameters to filter data server-side rather than client-side
4. **Handle errors gracefully:** Always check `success` field and handle error responses
5. **Monitor rate limits:** Check rate limit headers to avoid hitting limits

---

## Integration Examples

### React Hook Example

```typescript
import useSWR from 'swr';

function useEducationDashboard(range = 'month') {
  const { data, error, isLoading } = useSWR(
    `/api/education/dashboard/stats?range=${range}`,
    fetcher
  );

  return {
    dashboard: data?.data,
    isLoading,
    isError: error,
  };
}
```

### Node.js Example

```javascript
const response = await fetch('/api/education/dashboard/stats?storeId=123&range=month', {
  headers: {
    'Authorization': 'Bearer your-token',
  },
});

const data = await response.json();

if (data.success) {
  console.log('Dashboard data:', data.data);
} else {
  console.error('Error:', data.error);
}
```

---

## Support

For issues or questions:
- Check existing documentation at `/docs/api`
- Review error logs in application monitoring
- Contact platform support team
