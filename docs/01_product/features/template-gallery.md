# Template Gallery

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026

---

## Overview

The Vayva Template Gallery provides 70+ professionally designed storefront templates across 15 industry categories. Each template is optimized for specific business types and includes industry-specific features, layouts, and configurations.

## Template Statistics

- **Total Templates:** 70+
- **Categories:** 15
- **Free Templates:** 15+
- **Premium Templates:** 55+
- **Industries Covered:** Retail, Food, Services, Events, Real Estate, B2B, Digital, Education, and more

## Template Categories

### 1. Retail (10+ Templates)

| Template | Description | Best For |
|----------|-------------|----------|
| **AA Fashion** | Editorial-style fashion storefront | Clothing, accessories |
| **Gizmo Tech** | Tech-focused with spec comparisons | Electronics, gadgets |
| **Bloome Home** | Elegant home décor layout | Home goods, furniture |
| **Vayva Standard** | Classic retail layout | General retail |
| **StyleHub** | Modern fashion with lookbook | Fashion boutiques |
| **GearVault** | Outdoor and sports equipment | Sporting goods |
| **FreshMarket** | Grocery and fresh produce | Food retail |
| **AutoLane** | Automotive parts and accessories | Auto parts |
| **VintageWoods** | Artisan and handcrafted goods | Handmade items |
| **CraftCorner** | Arts and crafts supplies | Craft stores |

**Features:**
- Product grids and collections
- Size/color variants
- Inventory alerts
- Quick view
- Related products

### 2. Food & Drink (5+ Templates)

| Template | Description | Best For |
|----------|-------------|----------|
| **ChopNow** | Food delivery with modifiers | Restaurants, delivery |
| **NightPulse** | Nightlife and bars | Bars, clubs |
| **BrewCraft** | Coffee shops and cafés | Coffee shops |
| **SweetSpot** | Bakeries and desserts | Bakeries |
| **FreshBites** | Healthy food and meal prep | Health food |

**Features:**
- Menu builders
- Food modifiers (extras, options)
- Delivery zones
- Real-time order tracking
- Table reservations

### 3. Services (8+ Templates)

| Template | Description | Best For |
|----------|-------------|----------|
| **Bookly Pro** | Appointment booking | Salons, clinics |
| **LegalEase** | Professional services | Law firms, consultants |
| **FitStudio** | Fitness and wellness | Gyms, trainers |
| **PhotoFrame** | Photography services | Photographers |
| **CleanSweep** | Cleaning services | Cleaning companies |
| **FixIt Pro** | Repair services | Repair shops |
| **StyleSeat** | Beauty services | Beauty salons |
| **ConsultPro** | Consulting services | Consultants |

**Features:**
- Calendar booking
- Staff profiles
- Service packages
- Appointment reminders
- Availability management

### 4. Events (4+ Templates)

| Template | Description | Best For |
|----------|-------------|----------|
| **Ticketly** | Event ticketing | Concerts, shows |
| **EventHorizon** | Conference and corporate | Conferences |
| **PartyVibe** | Party and celebration | Party planners |
| **GatherSpace** | Venue booking | Event venues |

**Features:**
- Seat selection
- QR ticket generation
- Countdown timers
- Attendee management
- Event schedules

### 5. Real Estate (3+ Templates)

| Template | Description | Best For |
|----------|-------------|----------|
| **HomeList** | Property listings | Real estate agents |
| **LarkHomes** | Luxury properties | Luxury real estate |
| **UrbanScape** | Urban rentals | Property managers |

**Features:**
- Property galleries
- Map integration
- Virtual tours
- Inquiry forms
- Agent profiles

### 6. B2B (3+ Templates)

| Template | Description | Best For |
|----------|-------------|----------|
| **BulkTrade** | Wholesale portal | Wholesalers |
| **MarketHub** | Multi-vendor marketplace | Marketplaces |
| **TradePro** | B2B trading | B2B companies |

**Features:**
- MOQ (Minimum Order Quantity)
- Volume pricing
- Quote requests
- Credit accounts
- Requisition workflows

### 7. Digital Products (4+ Templates)

| Template | Description | Best For |
|----------|-------------|----------|
| **FileVault** | Digital downloads | Ebooks, templates |
| **EduFlow** | Online courses | Course creators |
| **CodeCamp** | Coding education | Tech education |
| **CourseAcademy** | Learning platform | Educators |

**Features:**
- Secure downloads
- Course modules
- Progress tracking
- Certificates
- Content dripping

### 8. Nonprofit (2+ Templates)

| Template | Description | Best For |
|----------|-------------|----------|
| **GiveFlow** | Donation campaigns | Charities |
| **ImpactHub** | Nonprofit organizations | NGOs |

**Features:**
- Donation forms
- Progress bars
- Donor walls
- Campaign management
- Impact tracking

### 9. Education (4+ Templates)

| Template | Description | Best For |
|----------|-------------|----------|
| **EduLearn** | Online learning | Schools, tutors |
| **EduFlow** | Course platform | Course creators |
| **CodeCamp** | Tech education | Coding schools |
| **CourseAcademy** | Training platform | Trainers |

**Features:**
- Lesson modules
- Quizzes and assessments
- Progress tracking
- Certificates
- Student management

### 10. Automotive (1 Template)

| Template | Description | Best For |
|----------|-------------|----------|
| **AutoLane** | Automotive sales | Car dealers, parts |

**Features:**
- Vehicle listings
- Spec comparisons
- Test drive booking
- Financing calculator

### 11. Travel (1 Template)

| Template | Description | Best For |
|----------|-------------|----------|
| **Travel** | Tour and travel | Travel agencies |

**Features:**
- Itinerary display
- Booking forms
- Gallery
- Availability calendars

### 12. Blog/Content (1 Template)

| Template | Description | Best For |
|----------|-------------|----------|
| **Blog** | Content publishing | Bloggers, media |

**Features:**
- Article layouts
- Newsletter signup
- Categories and tags
- Author profiles

### 13. One Product (1 Template)

| Template | Description | Best For |
|----------|-------------|----------|
| **One Product** | Single product focus | Product launches |

**Features:**
- High-conversion layout
- Testimonials
- Feature highlights
- CTA optimization

### 14. Creative/Portfolio (3+ Templates)

| Template | Description | Best For |
|----------|-------------|----------|
| **StudioBox** | Creative portfolio | Designers, artists |
| **PhotoFrame** | Photography | Photographers |
| **Content Creator** | Content portfolio | Creators |

**Features:**
- Portfolio galleries
- Project showcases
- Client testimonials
- Contact forms

### 15. General (1 Template)

| Template | Description | Best For |
|----------|-------------|----------|
| **MarketHub** | All-purpose | Any business |

**Features:**
- Flexible layout
- Multiple product types
- Customizable sections

## Template Structure

### Template Registry

**Location:** `template-gallery/index.ts`

```typescript
export interface TemplateGalleryItem {
  id: string;
  slug: string;
  displayName: string;
  category: string;
  industry: string;
  businessModel: string;
  primaryUseCase: string;
  requiredPlan: 'free' | 'starter' | 'growth' | 'enterprise';
  defaultTheme: 'light' | 'dark' | 'auto';
  status: 'active' | 'beta' | 'deprecated' | 'coming_soon';
  
  preview: {
    thumbnailUrl: string;
    mobileUrl: string;
    desktopUrl: string;
    demoVideoUrl?: string;
  };
  
  compare: {
    headline: string;
    bullets: string[];
    bestFor: string[];
    keyModules: string[];
  };
  
  routes: string[];
  layoutKey: string;
  
  onboardingProfile: {
    prefill: {
      industryCategory: string;
      deliveryEnabled?: boolean;
      paymentsEnabled?: boolean;
    };
    skipSteps?: string[];
    requireSteps?: string[];
  };
}
```

### Template Implementation

Templates are implemented as:

1. **Registry Entry** - Metadata in `template-gallery/index.ts`
2. **Layout Components** - React components in `Frontend/storefront/src/components/templates/`
3. **Styling** - Tailwind CSS with theme variables
4. **Configuration** - Dashboard variants in `Frontend/merchant-admin/src/config/dashboard-variants.ts`

## Plan Availability

| Plan | Template Access |
|------|-----------------|
| **Free** | 15+ basic templates |
| **Starter** | 30+ templates |
| **Growth** | 55+ templates |
| **Enterprise** | All 70+ templates + custom |

## Template Selection Flow

```
Merchant Onboarding
       │
       ▼
┌──────────────────┐
│ Business Category│
│  (Industry)      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Template Gallery │
│  (Filtered by    │
│   industry)      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Template Preview │
│  - Desktop       │
│  - Mobile        │
│  - Features      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Template Applied │
│  - Store created │
│  - Theme set     │
│  - Layout loaded │
└──────────────────┘
```

## Customization

### Theme Variables

Each template supports customization via CSS variables:

```css
:root {
  --primary: #10b981;
  --secondary: #1f2937;
  --accent: #f59e0b;
  --background: #ffffff;
  --foreground: #111827;
}
```

### Customization Options

- **Colors** - Primary, secondary, accent
- **Typography** - Font family, sizes
- **Layout** - Section ordering, visibility
- **Content** - Images, text, products
- **Features** - Enable/disable modules

## Adding New Templates

### Process

1. **Design** - Create Figma mockups
2. **Review** - Product team approval
3. **Develop** - Implement React components
4. **Test** - Cross-browser, mobile testing
5. **Register** - Add to template gallery
6. **Deploy** - Release to production

### Template Requirements

- Responsive design (mobile-first)
- Accessibility (WCAG 2.1 AA)
- Performance (< 3s load time)
- SEO optimized
- WhatsApp integration ready

## Related Documentation

- [Storefront Documentation](../../07_applications/storefront/)
- [Merchant Admin Dashboard Variants](../../07_applications/merchant-admin/)
- [Marketing Site](../../07_applications/marketing/)

---

**Template Questions?** Contact the product team or check the [Storefront documentation](../../07_applications/storefront/).
