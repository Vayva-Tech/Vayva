
# QA & Release Checklist: Ops Console v3.3.0

This checklist serves as the human-in-the-loop verification for the UX Audit and Platform Upgrade.

## 1. Risky Areas (Focus Areas)
- **KYC Manual Override**: Confirmation that DB write + Invalidation works as expected.
- **Merchant Impersonation**: Verification that redirect still functions with `toast.promise`.
- **Global Density Toggle**: Ensure it doesn't break overflow behavior on small screens.
- **Prefetch Storms**: Monitor network tab when scrolling lists rapidly.

## 2. Operator Acceptance Test (OAT)
- [ ] **Infrastructure**:
  - [ ] Sonner toasts appear in top-right with `top-right` position.
  - [ ] `ReasonModal` blocks UI correctly and requires text input to enable "Confirm".
  - [ ] Sidebar collapse state persists after hard refresh.
  - [ ] Table density (compact) persists after hard refresh.
- [ ] **Merchant List**:
  - [ ] Search input debounces correctly.
  - [ ] Hovering a row for >250ms triggers a background `GET /api/ops/merchants/:id`.
  - [ ] Clicking details on a prefetched row has 0ms perceived loading time.
- [ ] **Merchant Detail**:
  - [ ] "Disable Payouts" triggers `ReasonModal`.
  - [ ] Payout status updates in real-time on the page after modal confirmation.
  - [ ] Audit Log tab shows redactor in action for sensitive events.
- [ ] **Dashboard / AI**:
  - [ ] AI Command Center charts (if any) or stats cards refresh every 30s.
  - [ ] Emergency Kill-Switch shows the `ReasonModal`.

## 3. Rollback Plan
- **Standard In-Place**: Revert to branch `stable-v3.2.0`.
- **Database**: No destructive schema migrations were performed.
- **Cache**: Clear `localStorage` keys `ops-sidebar-collapsed` and `ops-table-density` if layout breaks.

## 4. Release Notes Draft (v3.3.0)
- **Core**: Swapped native prompt/alert for High-Confidence Reason Modals.
- **Perf**: Full TanStack Query integration with prefetch-on-hover.
- **UX**: Added Sidebar Collapse and Table Density (Compact) toggles.
- **AI**: Real-time Command Center telemetry wired to production AiUsageEvent model.
- **Security**: Smart PII/Token redactor implemented in audit logs and webhook monitors.
- **Design**: Pattern-preserving upgrade; 0 changes to foundations or tokens.
