# Onboarding QA Checklist

- [ ] New user onboarding path renders Welcome step with one-time setup banner
- [ ] Plan selection flow persists selected plan via onboarding state API
- [ ] Slug check validates and blocks reserved slugs
- [ ] Identity, Business, and Industry steps save data via API on transition
- [ ] Optional steps (Tools, Socials, Finance, KYC, Policies, Publish, Review) save and show/hide per flow
- [ ] Delivery/logistics is gated behind config and can be included or omitted per plan
- [ ] Trial/billing status surfaces correctly via Billing status endpoint
- [ ] Messaging is consistent: global one-time banner + per-step copy
- [ ] Mobile responsiveness verified (two-column on tablet/desktop, stacked on mobile)
- [ ] Accessibility: ARIA attributes present and keyboard navigable
- [ ] End-to-end flow completes onboarding and redirects to dashboard
- [ ] Tests: unit tests for step builder and onboarding API; E2E smoke test
