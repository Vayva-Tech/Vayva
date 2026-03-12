# Ops Console

## Status: Golden 🟢
This application is correctly typed, lint-free, and adheres to the workspace's strict architectural guidelines.

## Core Features
### Merchant Diagnostic
-   **Route**: `/ops/merchants/[id]`
-   **Purpose**: Immediate triage of merchant issues.
-   **Capabilities**:
    -   View KYC Status (Verified/Pending/Failed)
    -   Inspect Wallet Balance & Locks
    -   Audit Onboarding Progression
    -   View Verification History

## Development Guidelines
-   Maintain `no-explicit-any` validation.
-   Do not introduce new dependencies without justification.
-   Keep UI components simple and data-dense.
