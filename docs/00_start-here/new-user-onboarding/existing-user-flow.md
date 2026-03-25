# Existing user flow (Merchant) — Vayva

**Audience:** Exec + product + engineering\n
**Goal:** Explain ongoing day-to-day usage for an already-onboarded merchant.\n

---

## Executive summary

Existing merchants: **login → manage products/orders → collect payments → dispatch delivery → track → support → analytics → campaigns → AI**.

---

## Flow (product)

```mermaid
flowchart TD
  login[Login] --> dashboard[Dashboard]
  dashboard --> products[Products_Catalog]
  dashboard --> orders[Orders]
  dashboard --> customers[Customers]
  dashboard --> analytics[Analytics]
  dashboard --> campaigns[Campaigns]
  dashboard --> ai[AI_Assistant]

  orders --> payment[Payment_Status]
  payment --> fulfill[Fulfillment]
  fulfill --> delivery[Delivery_Dispatch_optional]
  delivery --> tracking[Tracking_Updates]
  tracking --> notify[Customer_Notifications]
  orders --> support[Support_Tickets]
```

---

## Deep technical flow (engineering)

```mermaid
sequenceDiagram
  participant Merchant
  participant MerchantApp
  participant CoreAPI
  participant DB
  participant Paystack
  participant Kwik

  Merchant->>MerchantApp: Login
  MerchantApp->>CoreAPI: Session/JWT validation
  CoreAPI->>DB: Load store context + permissions
  Merchant->>MerchantApp: View orders
  MerchantApp->>CoreAPI: GET orders
  CoreAPI->>DB: Query orders by storeId
  Merchant->>MerchantApp: Dispatch delivery
  MerchantApp->>CoreAPI: POST dispatch
  CoreAPI->>Kwik: Create task (if enabled)
  Kwik-->>CoreAPI: job_id / tracking
  CoreAPI->>DB: Create/update Shipment
  Kwik-->>CoreAPI: Webhook status updates
  CoreAPI->>DB: Update Shipment status
  CoreAPI-->>MerchantApp: Updated tracking
```

