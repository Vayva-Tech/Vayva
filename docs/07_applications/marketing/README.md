# Marketing Site Documentation

**Application:** Marketing Site (vayva.ng)  
**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026  
**Framework:** Next.js 15 + React + TypeScript

---

## Overview

The Vayva Marketing Site is the public-facing website that serves as the primary entry point for potential merchants and customers. It showcases the platform's features, template gallery, pricing, and enables merchant onboarding.

## Architecture

```
Frontend/marketing/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # Marketing pages group
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── features/       # Features pages
│   │   │   ├── templates/      # Template gallery
│   │   │   ├── pricing/        # Pricing page
│   │   │   └── about/          # About page
│   │   ├── api/                # API routes
│   │   │   └── rescue/         # Rescue system endpoints
│   │   ├── layout.tsx          # Root layout
│   │   ├── error.tsx           # Error boundary
│   │   └── global-error.tsx    # Global error handler
│   ├── components/             # React components
│   │   ├── marketing/          # Marketing-specific components
│   │   ├── rescue/             # Rescue overlay components
│   │   └── ui/                 # Shared UI components
│   ├── lib/                    # Utilities and services
│   │   ├── rescue/             # Marketing rescue service
│   │   └── utils.ts            # Helper functions
│   └── styles/                 # Global styles
├── public/                     # Static assets
└── package.json
```

## Key Features

### 1. Template Gallery Showcase

**Location:** `/templates` route

Displays 70+ industry-specific templates across 15 categories:

| Category | Templates | Description |
|----------|-----------|-------------|
| Retail | 10+ | Fashion, electronics, home goods |
| Food | 5+ | Restaurants, food delivery, catering |
| Services | 8+ | Booking, appointments, professional services |
| Events | 4+ | Ticketing, venues, nightlife |
| Education | 4+ | Courses, learning platforms |
| Real Estate | 3+ | Property listings, rentals |
| B2B | 3+ | Wholesale, marketplaces |
| Digital | 4+ | Digital products, downloads |
| Nonprofit | 2+ | Fundraising, donations |

**Template Data Source:**
- Registry: `template-gallery/index.ts`
- Types: `Frontend/storefront/src/template-gallery/index.ts`

### 2. Merchant Features Section

**Location:** `src/components/marketing/MerchantFeaturesSection.tsx`

Showcases key merchant capabilities:

- **Order Management**
  - AI Order Capture (WhatsApp to structured orders)
  - Unified Order Inbox (WhatsApp, Instagram, web, in-person)
  - Kanban Order Board
  - Smart Order Search
  - Bulk Order Actions
  - Order Status Timeline

- **Product Management**
  - AI Product Creation
  - WhatsApp Catalog Sync
  - Inventory Tracking
  - Variant Management
  - Bulk Import/Export

- **Customer Management**
  - Unified Customer Profiles
  - WhatsApp Chat History
  - Purchase History
  - Customer Segments
  - Automated Follow-ups

- **Payment & Finance**
  - Paystack Integration
  - Wallet System
  - Invoice Generation
  - Financial Reports
  - Automated Payouts

- **Delivery & Logistics**
  - Kwik Integration
  - Delivery Zones
  - Real-time Tracking
  - Multiple Carriers

- **AI Features**
  - SalesAgent (WhatsApp AI assistant)
  - Smart Recommendations
  - Automated Responses
  - Sentiment Analysis

### 3. Pricing Display

**Location:** `/pricing` route

Displays tiered pricing structure:

| Plan | Price | Features |
|------|-------|----------|
| Free | ₦0 | Basic storefront, limited products |
| Starter | ₦5,000/mo | More products, basic analytics |
| Growth | ₦15,000/mo | Advanced features, priority support |
| Enterprise | Custom | Dedicated support, custom integrations |

### 4. Merchant Onboarding Flow

**Entry Points:**
- "Get Started" CTA buttons
- Template "Use This Template" actions
- Pricing plan selection

**Flow:**
1. Select template or start blank
2. Enter business information
3. Choose industry category
4. Configure payments (Paystack)
5. Set up delivery preferences
6. Launch storefront

## Technical Implementation

### Error Handling

**Rescue System Integration:**
```typescript
// global-error.tsx
import { RescueOverlay } from "@/components/rescue/RescueOverlay";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <RescueOverlay error={error} reset={reset} />
      </body>
    </html>
  );
}
```

The marketing site integrates with [Vayva Rescue](../../05_operations/automation/vayva-rescue.md) for automated incident response.

### API Routes

**Rescue Endpoints:**
```
POST /api/rescue/report      - Report new incident
GET  /api/rescue/incidents/:id - Get incident status
```

**Implementation:** `src/app/api/rescue/`

### Styling

- **Framework:** Tailwind CSS
- **UI Components:** `@vayva/ui` package
- **Icons:** Lucide React
- **Animations:** Framer Motion

### SEO

- Next.js metadata API
- Open Graph tags
- Structured data (JSON-LD)
- Sitemap generation
- Robots.txt

## Environment Variables

```bash
# Required
NEXT_PUBLIC_APP_URL=https://vayva.ng
NEXT_PUBLIC_API_URL=https://api.vayva.ng

# Analytics (optional)
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_POSTHOG_KEY=

# Rescue System
GROQ_API_KEY_RESCUE=
```

## Deployment

**Platform:** Vercel

**Domains:**
- Production: `vayva.ng`
- Staging: `staging.vayva.ng`

**Build Command:**
```bash
cd Frontend/marketing && next build
```

## Performance Considerations

- Static generation for marketing pages
- Image optimization via Next.js Image
- Lazy loading for below-fold content
- Code splitting by route
- Edge caching on Vercel

## Monitoring

- Vercel Analytics
- Core Web Vitals
- Error tracking via Sentry
- Rescue system incident tracking

## Related Documentation

- [Template Gallery](../../01_product/features/template-gallery.md)
- [Vayva Rescue](../../05_operations/automation/vayva-rescue.md)
- [Storefront Documentation](../storefront/)
- [Merchant Onboarding](../../01_product/features/onboarding.md)

---

**Questions?** Contact the frontend team or check the [Development Guide](../../03_development/).
