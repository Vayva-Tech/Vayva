# Phase 2 UI Enhancement Sprint - Progress Report

**Date:** March 26, 2026  
**Status:** IN PROGRESS  
**Completed:** 2/6 tasks (33%)

---

## ✅ Completed Components

### 1. Application Wizard (`ApplicationWizard.tsx`)

**Location:** `/Frontend/merchant/src/components/grants/ApplicationWizard.tsx`

**Features Implemented:**
- ✅ 5-step multi-step wizard with progress indicator
- ✅ Step 1: Project Basics (name, description, amount, dates)
- ✅ Step 2: Team Members (add/remove, qualifications)
- ✅ Step 3: Budget Breakdown (real-time validation, balance checking)
- ✅ Step 4: Outcomes (expected outcomes, sustainability plan)
- ✅ Step 5: Review (complete summary before submission)
- ✅ Save Draft functionality
- ✅ Form validation at each step
- ✅ Auto-calculation of budget totals
- ✅ Dynamic team/budget item management
- ✅ Success navigation back to grants list

**Key Highlights:**
- Beautiful progress bar with step indicators
- Real-time budget validation (must equal requested amount)
- Add/remove team members and budget categories dynamically
- Internal notes field for private comments
- Full TypeScript typing

**Usage:**
```tsx
<ApplicationWizard
  grantId="grant-123"
  grantTitle="Education Innovation Grant"
  grantDeadline="2026-04-30T00:00:00Z"
  onSuccess={() => router.push('/dashboard/nonprofit/grants')}
/>
```

---

### 2. Grant Detail Page (`grants/[id]/page.tsx`)

**Location:** `/Frontend/merchant/src/app/(dashboard)/dashboard/nonprofit/grants/[id]/page.tsx`

**Features Implemented:**
- ✅ Comprehensive grant information display
- ✅ Deadline countdown with color-coded alerts:
  - 🔴 Red: < 7 days (URGENT)
  - 🟡 Yellow: 7-30 days
  - 🟢 Green: > 30 days
- ✅ Stats cards (amount, applications, deadline)
- ✅ Tabbed interface with 4 sections:
  1. **Overview**: Description, website, internal notes
  2. **Requirements**: Eligibility, documents, evaluation criteria
  3. **Contact**: Contact name, email, phone
  4. **Applications**: List of all applications with status badges
- ✅ Create Application button (launches wizard)
- ✅ Edit/Delete actions
- ✅ Status badges (draft, submitted, under_review, funded, rejected, closed)
- ✅ Integration with Application Wizard
- ✅ Individual application cards with "View Details" links

**Key Highlights:**
- Color-coded deadline urgency system
- Clean tabbed layout for easy information access
- Direct path to create applications
- Displays all requirements and eligibility criteria
- Shows contact information for funder communication

---

## 🔄 Remaining Tasks

### 3. Application Detail Page (NEXT)

**File to Create:** `/Frontend/merchant/src/app/(dashboard)/dashboard/nonprofit/applications/[id]/page.tsx`

**Required Features:**
- Application overview (project name, description, amount)
- Team members list with qualifications
- Budget breakdown visualization (pie chart or table)
- Expected outcomes display
- Sustainability plan
- Supporting documents section
- Submission status and timeline
- Edit application (if draft)
- Submit application (draft → submitted)
- Withdraw application (if submitted)
- Feedback/review section (if reviewed)

**Skeleton:**
```tsx
export default function ApplicationDetailPage() {
  const params = useParams();
  const [application, setApplication] = useState(null);
  
  // Fetch application details
  // Display in sections: Overview, Team, Budget, Outcomes, Documents, Status
  
  return (
    <div className="space-y-6">
      {/* Header with status badge */}
      {/* Stats cards */}
      {/* Tabs for sections */}
      {/* Action buttons */}
    </div>
  );
}
```

---

### 4. Deadline Countdown Badges

**File to Update:** `/Frontend/merchant/src/app/(dashboard)/dashboard/nonprofit/grants/page.tsx`

**Changes Needed:**
Add deadline countdown calculation and display in the grant list:

```tsx
// In the grant card component:
const daysUntilDeadline = Math.ceil(
  (new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
);

{daysUntilDeadline !== null && (
  <Badge 
    className={
      daysUntilDeadline < 7 ? 'bg-red-500' :
      daysUntilDeadline < 30 ? 'bg-yellow-500' : 'bg-green-500'
    }
  >
    {daysUntilDeadline} days
  </Badge>
)}
```

---

### 5. Pagination & Filters

**File to Update:** `/Frontend/merchant/src/app/(dashboard)/dashboard/nonprofit/grants/page.tsx`

**Required Updates:**

#### A. Add Filter State
```tsx
const [filters, setFilters] = useState({
  page: 1,
  limit: 20,
  status: '',
  funder: '',
  minAmount: '',
  maxAmount: '',
  deadlineFrom: '',
  deadlineTo: '',
});
```

#### B. Add Filter UI Components
```tsx
<Card>
  <CardContent className="pt-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <Label>Status</Label>
        <select value={filters.status} onChange={(e) => ...}>
          <option value="">All</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          {/* etc */}
        </select>
      </div>
      
      <div>
        <Label>Funder</Label>
        <Input 
          placeholder="Search funders..."
          value={filters.funder}
          onChange={(e) => ...}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Min Amount</Label>
          <Input 
            type="number"
            placeholder="0"
            value={filters.minAmount}
            onChange={(e) => ...}
          />
        </div>
        <div>
          <Label>Max Amount</Label>
          <Input 
            type="number"
            placeholder="100000"
            value={filters.maxAmount}
            onChange={(e) => ...}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Deadline From</Label>
          <Input 
            type="date"
            value={filters.deadlineFrom}
            onChange={(e) => ...}
          />
        </div>
        <div>
          <Label>Deadline To</Label>
          <Input 
            type="date"
            value={filters.deadlineTo}
            onChange={(e) => ...}
          />
        </div>
      </div>
    </div>
    
    <div className="flex justify-between mt-4">
      <Button variant="outline" onClick={() => resetFilters()}>
        Reset Filters
      </Button>
      <Button onClick={() => applyFilters()}>
        Apply Filters
      </Button>
    </div>
  </CardContent>
</Card>
```

#### C. Add Pagination Controls
```tsx
{meta.totalPages > 1 && (
  <div className="flex justify-center items-center gap-2 mt-6">
    <Button
      variant="outline"
      size="sm"
      disabled={filters.page === 1}
      onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
    >
      Previous
    </Button>
    
    <span className="text-sm text-gray-600">
      Page {filters.page} of {meta.totalPages}
    </span>
    
    <Button
      variant="outline"
      size="sm"
      disabled={filters.page === meta.totalPages}
      onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
    >
      Next
    </Button>
  </div>
)}
```

#### D. Update API Call
```tsx
const fetchGrants = async () => {
  const queryParams = new URLSearchParams();
  queryParams.append('page', filters.page.toString());
  queryParams.append('limit', filters.limit.toString());
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.funder) queryParams.append('funder', filters.funder);
  if (filters.minAmount) queryParams.append('minAmount', filters.minAmount.toString());
  if (filters.maxAmount) queryParams.append('maxAmount', filters.maxAmount.toString());
  if (filters.deadlineFrom) queryParams.append('deadlineFrom', filters.deadlineFrom);
  if (filters.deadlineTo) queryParams.append('deadlineTo', filters.deadlineTo);
  
  const data = await apiJson(`/api/nonprofit/grants?${queryParams.toString()}`);
  setGrants(data.data);
  setMeta(data.meta);
};
```

---

### 6. Analytics Dashboard Component

**File to Create:** `/Frontend/merchant/src/components/grants/GrantAnalyticsDashboard.tsx`

**Required Features:**
- Success rate metrics (total applications, awarded, success rate %)
- Pipeline value (requested vs awarded)
- Applications over time (line chart)
- Top funders by success rate
- Deadline compliance rate
- Average grant size
- Rejection reasons breakdown (if tracked)

**Dependencies:**
```bash
pnpm add recharts
```

**Component Structure:**
```tsx
import { LineChart, BarChart, PieChart } from 'recharts';

export default function GrantAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  
  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {/* Success Rate, Total Applications, etc */}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Applications Over Time */}
        {/* Success Rate by Funder */}
        {/* Budget Distribution */}
      </div>
    </div>
  );
}
```

---

## Testing Checklist

### Application Wizard
- [ ] Test form validation at each step
- [ ] Test budget breakdown equals requested amount
- [ ] Test add/remove team members
- [ ] Test add/remove budget categories
- [ ] Test save draft functionality
- [ ] Test final submission
- [ ] Test back navigation preserves data
- [ ] Test error handling

### Grant Detail Page
- [ ] Test deadline countdown calculation
- [ ] Test color-coded alerts
- [ ] Test all tabs display correctly
- [ ] Test Create Application button
- [ ] Test Edit/Delete actions
- [ ] Test responsive design
- [ ] Test loading states
- [ ] Test error states

---

## Performance Considerations

1. **Lazy Loading**: Consider lazy loading the Application Wizard
   ```tsx
   const ApplicationWizard = dynamic(
     () => import('@/components/grants/ApplicationWizard'),
     { ssr: false }
   );
   ```

2. **Data Caching**: Implement React Query or SWR for better caching
   ```bash
   pnpm add @tanstack/react-query
   ```

3. **Debounced Filters**: Add debouncing for filter inputs to prevent excessive API calls
   ```tsx
   const debouncedFilters = useDebounce(filters, 500);
   ```

---

## Accessibility Improvements Needed

- [ ] Add ARIA labels to wizard steps
- [ ] Add keyboard navigation support
- [ ] Ensure color contrast meets WCAG AA standards
- [ ] Add screen reader announcements for errors
- [ ] Add focus management between steps
- [ ] Provide text alternatives for icons

---

## Next Steps

1. **Complete Application Detail Page** (Priority: HIGH)
2. **Update Grants List with Deadlines & Pagination** (Priority: HIGH)
3. **Create Analytics Dashboard** (Priority: MEDIUM)
4. **Add Notification Integration** (Phase 3)
5. **Implement Document Upload** (Phase 3)

---

## Files Created in Phase 2

| File | Status | Lines |
|------|--------|-------|
| `ApplicationWizard.tsx` | ✅ Complete | 661 |
| `grants/[id]/page.tsx` | ✅ Complete | 497 |
| `applications/[id]/page.tsx` | 🔄 Pending | - |
| `grants/page.tsx` (updated) | 🔄 Pending | - |
| `GrantAnalyticsDashboard.tsx` | 🔄 Pending | - |

**Total Lines Written:** 1,158 lines

---

**Estimated Time to Complete Phase 2:** 4-6 hours  
**Current Progress:** 33% complete  
**Next Action:** Create Application Detail Page

---

**Document Version:** 1.0  
**Last Updated:** March 26, 2026  
**Author:** Vayva AI Agent
