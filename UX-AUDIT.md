# Vayva Merchant Admin — UX/UI Audit Report

**Date:** Feb 12, 2026
**Scope:** `apps/merchant-admin` — Auth, Onboarding, Dashboard, Products, Orders, Settings, Shared Components
**Benchmarks:** Shopify Admin, Square Dashboard, Bumpa, Selar, Paystack Dashboard

---

## Executive Summary

Vayva's merchant admin has a **strong visual foundation** — glassmorphism cards, rounded corners, backdrop-blur, smooth Framer Motion transitions. The design language is modern and premium. However, the audit reveals **39 actionable issues** across 8 categories that, if addressed, would bring the platform to parity with Shopify/Square-tier merchant experiences.

The issues fall into three tiers:
- **P0 (Critical):** 8 issues — broken flows, trust-damaging UX, accessibility blockers
- **P1 (High):** 16 issues — friction points, missing states, inconsistencies
- **P2 (Polish):** 15 issues — refinements that elevate perceived quality

---

## 1. Authentication Flow

### P0 — Critical

#### 1.1 Dead Google Sign-In Modal
**File:** `src/app/(auth)/signin/page.tsx:159-178`, `signup/page.tsx:182-190`
**Issue:** `showGoogleModal` state exists but nothing triggers it — the Google button was removed but the modal code remains. If accidentally triggered, it shows "Google Sign-In Not Configured" which damages trust.
**Benchmark:** Shopify shows Google/Apple/Facebook SSO buttons that actually work, or doesn't show them at all.
**Fix:** Remove the dead `showGoogleModal` state and modal entirely. When Google OAuth is ready, add it back properly.

#### 1.2 No Input Validation Feedback Until Submit
**File:** `src/app/(auth)/signin/page.tsx:53-57`
**Issue:** Email/password fields only show errors after form submission. No inline validation (e.g., "Enter a valid email" as user types). The error banner is generic and doesn't highlight which field failed.
**Benchmark:** Shopify highlights the specific field with a red border + inline error message. Square shows real-time validation.
**Fix:** Add `onBlur` validation for email format, and show field-level error messages below each input.

### P1 — High

#### 1.3 Signup Form — Too Many Fields Visible at Once
**File:** `src/app/(auth)/signup/page.tsx:57-174`
**Issue:** 6 fields visible simultaneously (first name, last name, email, password, confirm password, terms). This is overwhelming for mobile users. Cognitive load is high.
**Benchmark:** Shopify signup is just email → then password → then store name (progressive disclosure). Bumpa asks for phone number first, then builds profile incrementally.
**Fix:** Consider a 2-step signup: Step 1 (email + password), Step 2 (name + terms). Or at minimum, remove "Confirm password" — use show/hide toggle instead (already present).

#### 1.4 Password Strength Indicator — No Requirements Listed
**File:** `src/app/(auth)/signup/page.tsx:127-129`
**Issue:** `PasswordStrengthIndicator` shows strength but doesn't tell users what the requirements are (min length, uppercase, number, etc.). Users guess and fail.
**Benchmark:** Shopify shows a checklist: ✓ 8+ characters, ✓ 1 number, ✓ 1 uppercase.
**Fix:** Show explicit requirements as a checklist that checks off as the user types.

#### 1.5 Verify Page — Suspense Fallback is Bare
**File:** `src/app/(auth)/verify/page.tsx:172-176`
**Issue:** `<Suspense fallback={<div>Loading...</div>}>` — bare text, no layout, no branding. Flashes before the real page loads.
**Benchmark:** All competitors show a branded skeleton or spinner during loading.
**Fix:** Use the `SplitAuthLayout` with a centered spinner as the fallback.

#### 1.6 Verify Page — Hardcoded `!bg-black` Styles
**File:** `src/app/(auth)/verify/page.tsx:139`
**Issue:** `className="w-full !bg-black !text-white hover:!bg-black/90 !rounded-xl !h-12"` — using `!important` overrides suggests the Button component's `variant="primary"` doesn't produce the desired style. This is a design system leak.
**Fix:** Fix the Button component's `primary` variant to match the desired style, then remove all `!important` overrides.

---

## 2. Onboarding / KYC

### P0 — Critical

#### 2.1 KYC Step Calls Dead API Route
**File:** `src/components/onboarding/steps/KycStep.tsx:42`
**Issue:** The KYC step calls `/api/kyc/verify` (the old YouVerify route) but the current KYC flow is manual review via `/api/kyc/submit`. This means the "Verify My Identity" button likely fails silently or throws an error.
**Benchmark:** This is a broken flow — no competitor ships a broken KYC step.
**Fix:** Update the API call to use `/api/kyc/submit` and change the flow to "Submit for Review" (matching the manual KYC process).

#### 2.2 KYC Step Has No "Skip" Option
**File:** `src/components/onboarding/steps/KycStep.tsx:198-209`
**Issue:** The onboarding context supports `{ kyc: { skipped: true } }` but the KYC step UI has no "Skip for now" button. Merchants who don't have their NIN ready are stuck.
**Benchmark:** Shopify lets merchants skip KYC during onboarding and complete it later from Settings. Bumpa allows gradual verification.
**Fix:** Add a "Skip for now" secondary button that saves `{ kyc: { skipped: true } }` and advances to the next step.

### P1 — High

#### 2.3 NIN Input — No Format Hint
**File:** `src/components/onboarding/steps/KycStep.tsx:138-141`
**Issue:** Placeholder says "Enter 11-digit NIN" but there's no example format. The `tracking-[0.2em]` letter-spacing makes it look like a PIN entry, which may confuse users who expect to type their NIN as a continuous number.
**Fix:** Add a helper text below: "Your NIN is the 11-digit number on your National ID slip" and consider grouping digits (XXX-XXXX-XXXX) for readability.

---

## 3. Dashboard Home

### P0 — Critical

#### 3.1 No-Industry Fallback is a Dead End
**File:** `src/app/(dashboard)/dashboard/page.tsx:424-426`
**Issue:** `return <div className="p-8">Please complete your store profile in Settings.</div>` — bare text, no button, no link, no guidance. A merchant who somehow reaches this state has no way forward.
**Benchmark:** Shopify shows a full-page guided setup wizard. Square shows a checklist with clear CTAs.
**Fix:** Replace with a proper `EmptyState` component that links to `/dashboard/settings/profile` or `/onboarding` with a clear CTA.

#### 3.2 Configuration Error is Unrecoverable
**File:** `src/app/(dashboard)/dashboard/page.tsx:431-433`
**Issue:** `return <div className="p-8">Configuration Error: Unknown Industry</div>` — bare text, no recovery path. This is a developer error message shown to end users.
**Fix:** Show a friendly error state with "Contact Support" CTA and a link to Settings to re-select industry.

### P1 — High

#### 3.3 Dashboard Makes 11+ Parallel API Calls
**File:** `src/app/(dashboard)/dashboard/page.tsx:367-407`
**Issue:** The dashboard fires 11 SWR requests simultaneously on mount: kpis, metrics, me, overview, todos-alerts, recent-orders/bookings, inventory-alerts, customer-insights, earnings, shipments, activity. This causes:
- Waterfall of loading states
- Potential rate limiting
- Slow perceived load on weak connections (common in Nigeria)
**Benchmark:** Shopify's dashboard loads a single aggregated endpoint that returns all dashboard data. Square uses a BFF (Backend for Frontend) pattern.
**Fix:** Create a single `/api/dashboard/aggregate` endpoint that returns all dashboard data in one request. Use SWR's `fallbackData` for instant perceived load.

#### 3.4 JSX Comment Syntax Error in Loading Skeleton
**File:** `src/app/(dashboard)/dashboard/page.tsx:415`
**Issue:** `// eslint-disable-next-line` inside JSX children — this renders as visible text in the browser. Same issue in `loading.tsx:14,28`.
**Fix:** Use `{/* */}` JSX comment syntax or move the eslint-disable above the JSX block.

#### 3.5 Dashboard Page is 1,139 Lines — God Component
**File:** `src/app/(dashboard)/dashboard/page.tsx`
**Issue:** Single file contains: `SoftCard`, `CircleIconButton`, `DonutChart`, `IncomeExpenseChart`, `InvoiceOverview`, `StatWidget`, and the main `DashboardPage` with V1 and V2 rendering paths. This is unmaintainable.
**Benchmark:** Shopify's dashboard is composed of small, focused card components imported from a `/components/dashboard/` directory.
**Fix:** Extract each chart/widget into its own component file under `src/components/dashboard-v2/`.

---

## 4. Navigation & Sidebar

### P1 — High

#### 4.1 Sidebar Hover-to-Expand is Frustrating on Desktop
**File:** `src/components/admin-shell.tsx:307-308`
**Issue:** `onMouseEnter={() => setIsSidebarExpanded(true)}` / `onMouseLeave` — the sidebar expands/collapses on hover. This means:
- Accidental expansion when moving mouse across the screen
- No way to pin the sidebar open
- Text labels flash in/out as you move the mouse
**Benchmark:** Shopify has a permanently visible sidebar with text labels. Square has a toggle button to pin/unpin. Bumpa uses a fixed sidebar.
**Fix:** Add a pin/unpin toggle button. Default to expanded on desktop (220px is narrow enough). Use hover-expand only as an optional compact mode.

#### 4.2 Bottom Nav Has Only 4 Items + "More"
**File:** `src/components/admin-shell.tsx:264-278`
**Issue:** Mobile bottom nav shows Home, Orders, Products, Earnings, More. The "More" button opens the full sidebar as a drawer. This is fine, but:
- No visual badge for unread notifications
- No indication of pending orders count
- "Earnings" may not be the most-used item for all industries
**Benchmark:** Shopify mobile shows Home, Orders, Products, Store, More — with notification badges. Bumpa shows Home, Orders, Products, More with order count badges.
**Fix:** Add notification/order count badges to bottom nav items. Consider making the 4th item dynamic based on industry (e.g., "Kitchen" for food, "Bookings" for services).

#### 4.3 User Menu Shows "Owner Identity" — Unclear
**File:** `src/components/admin-shell.tsx:413`
**Issue:** `<p className="text-xs text-text-secondary truncate">Owner Identity</p>` — this label is confusing. What does "Owner Identity" mean to a merchant?
**Benchmark:** Shopify shows the store name and plan. Square shows the business name and role.
**Fix:** Show the store name or the user's email address instead.

---

## 5. Products

### P1 — High

#### 5.1 Products Loading Skeleton Has JSX Comment Bug
**File:** `src/app/(dashboard)/dashboard/products/page.tsx:158`
**Issue:** `// eslint-disable-next-line` renders as visible text in the loading skeleton.
**Fix:** Use `{/* */}` JSX comment syntax.

#### 5.2 No Pagination — Only "Load More"
**File:** `src/app/(dashboard)/dashboard/products/page.tsx:198-208`
**Issue:** Cursor-based "Load More" button is the only pagination. No page numbers, no "Showing X of Y", no way to jump to a specific page. For merchants with 500+ products, this is painful.
**Benchmark:** Shopify shows "Showing 1-50 of 234 products" with Previous/Next buttons. Square shows page numbers.
**Fix:** Add a "Showing X of Y" counter and Previous/Next navigation. Keep cursor pagination under the hood but expose a better UI.

#### 5.3 Empty Search Results — No Suggestions
**File:** `src/app/(dashboard)/dashboard/products/page.tsx:202-205`
**Issue:** When search returns no results, it shows a plain text message with no suggestions. No "Try a different search" or "Clear filters" CTA.
**Benchmark:** Shopify shows "No products found" with a "Clear all filters" button and suggestions.
**Fix:** Add a "Clear search" button and suggest checking spelling or trying broader terms.

#### 5.4 Mobile FAB Overlaps Bottom Nav
**File:** `src/app/(dashboard)/dashboard/products/page.tsx:216-222`
**Issue:** The floating "+" button is positioned at `bottom-20 right-6` which may overlap with the bottom navigation bar on some devices.
**Fix:** Increase bottom offset to `bottom-28` or position it above the bottom nav dynamically.

---

## 6. Orders

### P1 — High

#### 6.1 Error State Stores Full Error Object
**File:** `src/app/(dashboard)/dashboard/orders/page.tsx:53`
**Issue:** `const [error, setError] = useState<any>(null)` — stores the full error object, then accesses `error.message` in the UI. If the error is a string or has no `.message`, the UI shows nothing useful.
**Fix:** Store only the error message string: `useState<string | null>(null)` and `setError(e.message || "Failed to load orders")`.

#### 6.2 "Orders refreshed" Toast on Every Refresh
**File:** `src/app/(dashboard)/dashboard/orders/page.tsx:129`
**Issue:** `toast.success("Orders refreshed")` fires every time the refresh button is clicked. This is noisy — the user can see the data refreshed.
**Benchmark:** Shopify doesn't show a toast on refresh — the updated data is the feedback.
**Fix:** Remove the toast, or only show it if the data actually changed.

#### 6.3 Order Selection Navigates Away Instead of Drawer
**File:** `src/app/(dashboard)/dashboard/orders/page.tsx:148-152`
**Issue:** `handleSelectOrder` navigates to `/dashboard/orders/${order.id}` (full page navigation) but `OrderDetailsDrawer` is imported and rendered. The drawer is never used because `setSelectedOrder` is never called.
**Benchmark:** Shopify uses a slide-out drawer for order details on desktop, full page on mobile. This is faster for scanning multiple orders.
**Fix:** Use the drawer on desktop (set `selectedOrder`), navigate on mobile. Remove dead code if drawer is not intended.

---

## 7. Settings

### P1 — High

#### 7.1 Settings Has No Overview/Hub Page
**File:** `src/app/(dashboard)/dashboard/settings/` (23 items)
**Issue:** Settings has 23 sub-pages but the sidebar links directly to `/dashboard/settings/profile`. There's no settings hub/overview page that shows all available settings categories at a glance.
**Benchmark:** Shopify has a Settings overview page with cards for each category (General, Payments, Shipping, Taxes, etc.). Square has a similar hub.
**Fix:** Create a `/dashboard/settings/overview` page (the back button in profile already links to it) that shows all settings categories as cards with icons and descriptions.

#### 7.2 Profile Page — No Unsaved Changes Warning
**File:** `src/app/(dashboard)/dashboard/settings/profile/page.tsx`
**Issue:** If a merchant edits their profile and navigates away without saving, changes are silently lost. No "You have unsaved changes" warning.
**Benchmark:** Shopify shows a sticky "Unsaved changes" banner with Save/Discard buttons. Square shows a browser `beforeunload` warning.
**Fix:** Track dirty state and show a sticky save bar or `beforeunload` warning.

---

## 8. Shared Components & Patterns

### P0 — Critical

#### 8.1 Loading States Are Inconsistent
**Issue:** At least 4 different loading patterns across the app:
- `loading.tsx` — skeleton with branded logo overlay
- Products page — custom inline skeleton
- Orders page — centered spinner with text
- Settings profile — centered `Loader2` spinner
**Benchmark:** Shopify uses consistent skeleton screens everywhere. Square uses a unified loading component.
**Fix:** Create a shared `<PageSkeleton variant="table|cards|form" />` component and use it consistently.

#### 8.2 Error States Are Inconsistent
**Issue:** At least 3 different error patterns:
- Products — red-bordered card with icon + retry button
- Orders — glassmorphism card with icon + retry button
- Dashboard — bare `<div>` text
**Fix:** Create a shared `<PageError message={} onRetry={} />` component.

### P1 — High

#### 8.3 EmptyState Component is Generic
**File:** `src/components/ui/empty-state.tsx`
**Issue:** The `EmptyState` component always shows a `PlusCircle` icon on the action button, even when the action isn't "create". The prop name `actiononClick` has a typo (should be `actionOnClick`). The fixed height of `h-[450px]` may be too tall on mobile.
**Fix:** Make the action icon configurable, fix the prop name, and use `min-h-[300px]` instead of fixed height.

#### 8.4 No Confirmation Dialogs for Destructive Actions
**Issue:** Several destructive actions (delete product, reject approval, cancel order) use inline buttons without confirmation dialogs. The `DeleteAccountCard` has a confirmation dialog, but it's custom — not a shared pattern.
**Benchmark:** Shopify uses a consistent `<ConfirmationModal>` for all destructive actions with a red "Delete" button.
**Fix:** Create a shared `<ConfirmDialog>` component and use it for all destructive actions.

#### 8.5 Toast Messages Are Inconsistent
**Issue:** Some actions show `toast.success()`, others show `toast.info()`, some show nothing. Error toasts sometimes duplicate the inline error message.
**Fix:** Establish a toast policy: success toasts for mutations, no toast for reads/refreshes, error toasts only when there's no inline error display.

### P2 — Polish

#### 8.6 No Breadcrumbs
**Issue:** `AdminShell` accepts `_breadcrumb` prop but it's prefixed with `_` (unused). No page uses breadcrumbs. Deep pages like `/dashboard/products/[id]` have only a back arrow.
**Benchmark:** Shopify shows breadcrumbs on every page: Home > Products > Product Name.
**Fix:** Implement breadcrumbs in the header area for pages deeper than 1 level.

#### 8.7 No Keyboard Shortcuts
**Issue:** `CommandPalette` exists but there are no keyboard shortcuts for common actions (N for new product, / for search, G then O for orders).
**Benchmark:** Shopify supports Cmd+K for search. Linear-style apps support extensive keyboard shortcuts.
**Fix:** Add keyboard shortcuts for the top 5 actions and show them in the command palette.

#### 8.8 ~~No Dark Mode~~ — **REMOVED** (Design decision: green blur background is the intended visual identity)

#### 8.9 Publish Flow — Fake Delay
**File:** `src/components/admin-shell.tsx:173`
**Issue:** `await new Promise(resolve => setTimeout(resolve, 800))` — artificial 800ms delay "for UX". This is an anti-pattern — it makes the app feel slower than it is.
**Benchmark:** Shopify shows real progress. Square shows instant feedback.
**Fix:** Remove the artificial delay. Show real progress from the API response.

#### 8.10 `window.location.reload()` After Publish
**File:** `src/components/admin-shell.tsx:186`
**Issue:** Full page reload after publishing. This loses all client state and feels jarring.
**Fix:** Use SWR's `mutate()` to revalidate the store status instead of a full reload.

#### 8.11 Inline SVG Icons in Auth Pages
**File:** `src/app/(auth)/signin/page.tsx:96-104`
**Issue:** Eye/EyeOff icons are inline SVGs instead of using the `Icon` component or Lucide icons that are already imported elsewhere.
**Fix:** Replace with `<Icon name="Eye" />` / `<Icon name="EyeOff" />` from `@vayva/ui` for consistency.

#### 8.12 No Skeleton for Dashboard V2 KPI Blocks
**File:** `src/app/(dashboard)/dashboard/page.tsx:410-421`
**Issue:** When `!merchant`, the skeleton shows 4 placeholder cards. But the actual dashboard may show 6-8 KPI blocks depending on industry. The skeleton doesn't match the real layout.
**Fix:** Make the skeleton match the actual layout structure, or use a generic "loading dashboard" skeleton.

#### 8.13 Mobile Header Shows Logo Twice
**File:** `src/components/admin-shell.tsx:311,363`
**Issue:** The sidebar header shows `<Logo>` and the main header also shows `<Logo className="md:hidden">`. When the mobile sidebar is open, both logos are visible simultaneously.
**Fix:** Hide the main header logo when the sidebar is open, or remove the duplicate.

#### 8.14 No Animations on Empty States
**File:** `src/components/ui/empty-state.tsx`
**Issue:** The empty state has `animate-in fade-in-50` but no motion for the icon or text. It feels static compared to the rest of the app which uses Framer Motion.
**Fix:** Add a subtle scale-up animation on the icon and stagger the text appearance.

#### 8.15 Settings "Danger Zone" Links to Wrong Page
**File:** `src/app/(dashboard)/dashboard/settings/profile/page.tsx:202`
**Issue:** "Manage in Account" links to `/dashboard/account/edit` but the account page is at `/dashboard/account`. This may 404.
**Fix:** Verify the correct route and update the link.

---

## Priority Implementation Order

### Sprint 1 — Critical Fixes (P0)
1. **Fix KYC step API call** (calls dead `/api/kyc/verify` instead of `/api/kyc/submit`)
2. **Add "Skip" button to KYC step**
3. **Fix JSX comment syntax** in dashboard page and loading skeleton (renders as visible text)
4. **Fix no-industry and config-error dead ends** on dashboard
5. **Remove dead Google modal** from signin/signup
6. **Create shared `PageError` component** and use consistently
7. **Create shared `PageSkeleton` component** and use consistently
8. **Add inline field validation** to auth forms

### Sprint 2 — High Impact (P1)
9. **Sidebar pin/unpin toggle** (replace hover-expand)
10. **Create Settings overview/hub page**
11. **Aggregate dashboard API** (reduce 11 calls to 1)
12. **Fix order details drawer vs navigation** (use drawer on desktop)
13. **Add pagination UI** to products (Showing X of Y)
14. **Add unsaved changes warning** to settings forms
15. **Fix empty search results** with clear filters CTA
16. **Simplify signup form** (progressive disclosure or remove confirm password)
17. **Fix password strength indicator** (show requirements checklist)
18. **Add notification badges** to mobile bottom nav
19. **Fix user menu "Owner Identity"** label
20. **Fix EmptyState** prop typo and fixed height
21. **Create shared ConfirmDialog** for destructive actions
22. **Establish toast policy** and make consistent
23. **Fix verify page Suspense fallback**
24. **Fix mobile FAB overlap** with bottom nav

### Sprint 3 — Polish (P2)
25. Implement breadcrumbs
26. Add keyboard shortcuts
27. Remove fake publish delay
28. Replace `window.location.reload()` with SWR mutate
29. Replace inline SVGs with Icon component
30. Fix dashboard skeleton to match real layout
31. Fix mobile double-logo
32. Add animations to empty states
33. Fix settings danger zone link
34. ~~Dark mode support~~ — **REMOVED** (intentional design direction)
35. Extract dashboard god component into smaller files

---

## Competitor Comparison Matrix

| Feature | Shopify | Square | Bumpa | Vayva (Current) | Vayva (Target) |
|---|---|---|---|---|---|
| SSO (Google/Apple) | ✅ | ✅ | ✅ (Google) | ❌ Dead modal | ✅ or remove |
| Progressive signup | ✅ 3 steps | ✅ 2 steps | ✅ Phone first | ❌ All at once | ✅ 2 steps |
| Inline validation | ✅ | ✅ | ✅ | ❌ | ✅ |
| Sidebar pinnable | ✅ Always visible | ✅ Toggle | ✅ Fixed | ❌ Hover only | ✅ Toggle |
| Dashboard single API | ✅ | ✅ | ✅ | ❌ 11 calls | ✅ Aggregated |
| Breadcrumbs | ✅ | ✅ | ❌ | ❌ | ✅ |
| Settings hub | ✅ | ✅ | ✅ | ❌ | ✅ |
| Consistent loading | ✅ Skeletons | ✅ Skeletons | ✅ Spinners | ❌ Mixed | ✅ Skeletons |
| Consistent errors | ✅ | ✅ | ✅ | ❌ Mixed | ✅ |
| Keyboard shortcuts | ✅ Cmd+K | ❌ | ❌ | ❌ | ✅ |
| Dark mode | ❌ | ✅ | ❌ | ❌ | N/A (by design) |
| Order count badges | ✅ | ✅ | ✅ | ❌ | ✅ |
| Unsaved changes warn | ✅ | ✅ | ❌ | ❌ | ✅ |
| Confirmation dialogs | ✅ | ✅ | ✅ | ❌ Partial | ✅ |

---

*This audit was generated from a full code review of the merchant-admin codebase. All file references are exact. Recommendations are prioritized by user impact and implementation effort.*
