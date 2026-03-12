# Vayva: Detailed New User Onboarding Flow

This document provides an exhaustive breakdown of the merchant onboarding journey, from account creation to the production-ready dashboard.

## 1. Phase 1: Authentication & Registration

```mermaid
sequenceDiagram
    participant U as New User
    participant FA as Frontend (Auth)
    participant BA as Backend (API)
    participant DB as Database (Prisma)
    participant E as Email Service

    U->>FA: Visit /signup
    U->>FA: Enter Name, Business Name, Email, Password
    FA->>FA: Client-side Validation (Passwords match, Terms agreed)
    FA->>BA: POST /api/auth/register
    BA->>BA: Server-side Validation (Zod)
    BA->>DB: Check if Email exists
    BA->>DB: Create User & Store record
    BA->>E: Send Verification Email
    BA-->>FA: Success (201 Created)
    FA->>U: Redirect to /verify?email=...
```

---

## 2. Phase 2: Structural Onboarding (/onboarding)

Once authenticated, users are guided through the `OnboardingContext` state machine.

```mermaid
graph TD
    Start[Authenticated Entry] --> Welcome[1. Welcome Step]
    Welcome --> Identity[2. Identity Verification]
    Identity --> Business[3. Business Profile]
    Business --> URL[4. Store URL Selection]
    URL --> Branding[5. Visual Branding]
    Branding --> Payment[6. Payout & Bank Setup]
    Payment --> Review[7. Final Review]
    Review --> Complete[Dashboard Activation]

    subgraph "Details per Stage"
        Identity --> id_data["- First/Last Name<br/>- Phone Number (phone field)"]
        Business --> biz_data["- Legal Name<br/>- Category (Retail, Food, etc.)<br/>- Description"]
        URL --> url_data["- Slug availability check<br/>- Example: vayva.shop/your-store"]
        Branding --> brand_data["- Logo Upload (vayva-logo-official.svg enforced)<br/>- Brand Colors"]
        Payment --> pay_data["- Bank Name<br/>- Account Number<br/>- Resolution via Paystack API"]
    end
```

---

## 3. Phase 3: Technical Finalization

Behind the scenes, the "Complete" button triggers a multi-service synchronization.

```mermaid
sequenceDiagram
    participant M as Merchant
    participant API as API (/api/merchant/onboarding/complete)
    participant OS as OnboardingService
    participant TS as TemplateService
    participant WS as WalletService
    participant DB as Database

    M->>API: Click "Complete Setup"
    API->>OS: finalizeStore(storeId)
    OS->>TS: Provision Default Storefront Template
    OS->>WS: Initialize Virtual Account (Wema Bank)
    OS->>DB: Set onboardingCompleted = true
    API-->>M: Redirect to /dashboard
```

---

## 4. Logical Guardrails (Rules of the Flow)

- **Auth Requirement**: Every onboarding step is gated by a global `middleware.ts` that redirects to `/signin` if the JWT is invalid.
- **Data Persistence**: Each step uses `OnboardingContext` to save progress to the `Store` table via `JSON` settings or dedicated columns.
- **Branding Enforcement**: The UI prevents proceeding if placeholders are used instead of the official logo in the Branding step.

> [!TIP]
> **Pro-Tip**: Users can resume their journey at any time. The system reads the `onboardingLastStep` column from the `Store` model to pick up exactly where they left off.
