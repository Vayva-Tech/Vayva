# Vayva Merchant Admin: Grand Architectural Map

This document provides a 360-degree technical and functional insight into the Vayva Merchant Admin platform.

## 1. High-Level System Architecture (C4 Model)

```mermaid
graph TB
    subgraph "External World"
        C[Customer]
        M[Merchant]
        P[Paystack API]
        N[WhatsApp Business API]
    end

    subgraph "Vayva Merchant Admin (Next.js Application)"
        UI[React UI Components]
        API_R[App Router API Routes]
        SRV[Service Layer]
        LIB[Core Library]
    end

    subgraph "Infrastructure"
        DB[(Prisma / PostgreSQL)]
        RED[(Redis / BullMQ Cache)]
    end

    M --> UI
    UI --> API_R
    API_R --> SRV
    SRV --> LIB
    LIB --> DB
    LIB --> RED
    SRV --> P
    SRV --> N
    C --> UI
```

---

## 2. Integrated User Lifecycle & State Machine

```mermaid
stateDiagram-v2
    [*] --> Guest: Visit /signin
    Guest --> Registered: SignUp / OAuth
    Registered --> OnboardingNeeded: Auth Success
    OnboardingNeeded --> KYC_Pending: Submit Business Info
    KYC_Pending --> Store_Setup: Verification Success
    Store_Setup --> Active_Merchant: First Product + Payment Setup
    
    Active_Merchant --> Subscription_Active
    Active_Merchant --> Subscription_Expired
    Subscription_Expired --> Active_Merchant: Renew
    
    state Active_Merchant {
        Inventory --> CRM
        CRM --> Orders
        Orders --> Wallet
        Wallet --> Payouts
    }
```

---

## 3. Core Feature Interaction Matrix

### A. The Commerce Engine
How a product becomes an order and then money.

```mermaid
sequenceDiagram
    participant M as Merchant
    participant P as ProductService
    participant C as Checkout (Storefront)
    participant O as OrderService
    participant W as Wallet & Ledger
    
    M->>P: Create Product (Inventory + Pricing)
    P->>C: Sync to Storefront
    C->>O: Place Order (Customer Action)
    O->>O: Deduct Inventory via InventoryService
    O->>W: Record Transaction (LedgerEntry)
    W->>W: Update Wallet Balance (BigInt Kobo)
```

### B. The AI & Integration Engine
How Vayva automates the storefront experience.

```mermaid
graph LR
    W[WhatsApp Msg] --> WA[WhatsAppAgentService]
    WA --> AI[Groq/AI Assistant]
    AI --> KB[Knowledge Base Entry]
    KB --> DB[(Database)]
    AI --> PR[Product Catalog]
    WA --> W
```

---

## 4. Logical Module Map

| Module | Responsibility | Key Files |
| :--- | :--- | :--- |
| **Identity** | Session, JWT, RBAC | `auth.ts`, `middleware.ts`, `session.ts` |
| **Commerce** | Products, Inventory, Discounts | `product-core.service.ts`, `discountService.ts` |
| **Finance** | Wallet, Payouts, Ledger | `wallet.ts`, `ledgerService.ts`, `paystackService.ts` |
| **Logistics** | Fulfillment, Delivery (Kwik) | `fulfillmentService.ts`, `kwik.ts` |
| **Operations** | Kitchen (Food), Bookings (Tickets) | `kitchenService.ts`, `bookingService.ts` |
| **AI** | Storefront Automation, KB | `wa-agent.ts`, `ai-assistant.ts` |

---

> [!NOTE]
> This architecture is designed for multi-tenancy. Every request is isolated by `storeId` via the global `AuthContext` and `Prisma` query filters, ensuring extreme data privacy.

> [!IMPORTANT]
> **Branding Rule**: All UI entrance points (Skeletons, Auth Shell, Admin Shell) strictly enforce the usage of `vayva-logo-official.svg`.
