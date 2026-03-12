# Vayva Merchant Admin - Flow Documentation

This document outlines the primary navigation and authentication flows within the Vayva Merchant Admin application.

## 1. Authentication & Onboarding Flow

```mermaid
graph TD
    A[Entry: /] --> B{Authenticated?}
    B -- No --> C[Login Page: /signin]
    B -- Yes --> D{Store Onboarded?}
    
    C --> E[Register Page: /signup]
    E --> F[Auth Callback]
    F --> D
    
    D -- No --> G[Onboarding: /onboarding]
    D -- Yes --> H[Dashboard: /dashboard]
    
    G --> G1[Business Info]
    G1 --> G2[Inventory/Store Setup]
    G2 --> G3[Pricing/Billing]
    G3 --> H
```

## 2. Core Dashboard Flow

```mermaid
graph LR
    H[Dashboard] --> I[Inventory]
    H --> J[Orders]
    H --> K[Customers]
    H --> L[Analytics]
    H --> M[Marketing]
    
    I --> I1[Product Management]
    J --> J1[Order Details]
    K --> K1[Customer Profiles]
```

## 3. Settings & Account Management

```mermaid
graph TD
    S[Settings] --> S1[Profile]
    S --> S2[Store Settings]
    S --> S3[Team/Permissions]
    S --> S4[Billing/Payouts]
    S --> S5[Legal/Policies]
    
    S1 --> S1a[Update Identity]
    S2 --> S2a[Domain/Branding]
    S3 --> S3a[Invite Staff]
```

## 4. Key Security & Verification

```mermaid
sequenceDiagram
    participant M as Merchant
    participant A as Admin Dashboard
    participant API as Vayva API
    participant DB as Prisma/DB
    
    M->>A: Navigate to Payouts
    A->>API: Fetch Wallet Info
    API->>DB: Query Wallet Table
    DB-->>API: Return Status
    API-->>A: Show Verification Prompt
    M->>A: Submit Bank Details/KYC
    A->>API: POST /api/verify
    API->>DB: Update KycRecord
```

---

> [!IMPORTANT]
> All flows are strictly protected by `AuthContext` and server-side session checks. The official Vayva branding is mandated at every entry point.
